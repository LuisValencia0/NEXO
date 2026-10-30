import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, MessageSquare, LayoutDashboard, 
  Folder, Video, Loader2, Send, Settings, X, 
  CheckCircle2, XCircle, UserMinus, ShieldAlert, Crown, 
  Users, Target, Sparkles, ShieldCheck, Trash2
} from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext'; 
import { io } from 'socket.io-client'; 

export default function Entorno() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth(); 
  
  const [entorno, setEntorno] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [herramienta, setHerramienta] = useState('inicio');

  // --- ESTADOS PARA EL CHAT ---
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [enviandoMsg, setEnviandoMsg] = useState(false);
  const socketRef = useRef(null);

  // --- ESTADOS PARA EL PANEL DE AJUSTES ---
  const [panelAjustes, setPanelAjustes] = useState(false);
  const [postulaciones, setPostulaciones] = useState([]);
  const [procesando, setProcesando] = useState(null);

  // --- ESTADOS PARA MODAL CEDER LIDERAZGO ---
  const [modalCeder, setModalCeder] = useState(false);
  const [nuevoLiderId, setNuevoLiderId] = useState('');
  const [cediendo, setCediendo] = useState(false);

  // 1. CARGAR EL ENTORNO
  useEffect(() => {
    if (!id || id === 'undefined') {
      navigate('/mis-equipos');
      return;
    }

    const cargar = async () => {
      try {
        const { data } = await api.get(`/entornos/${id}`);
        setEntorno(data);
      } catch (err) {
        console.error(err);
        navigate('/mis-equipos');
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [id, navigate]);

  // 2. CONEXIÓN A SOCKET.IO
  useEffect(() => {
    if (!id) return;

    socketRef.current = io('http://localhost:3000');
    socketRef.current.emit('unirse_entorno', id);

    socketRef.current.on('mensaje_recibido', (mensaje) => {
      setMensajes((prev) => {
        if (prev.some(m => m._id === mensaje._id)) return prev;
        return [...prev, mensaje];
      });
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [id]);

  // 3. CARGAR HISTORIAL DE MENSAJES
  useEffect(() => {
    if (herramienta === 'chat') {
      api.get(`/mensajes/${id}`)
        .then(res => setMensajes(res.data))
        .catch(err => console.error('Error cargando mensajes:', err));
    }
  }, [herramienta, id]);

  // 4. ENVIAR MENSAJE
  const enviarMensaje = async (e) => {
    e.preventDefault();
    if (!nuevoMensaje.trim() || enviandoMsg) return;
    setEnviandoMsg(true);
    try {
      await api.post(`/mensajes/${id}`, { contenido: nuevoMensaje });
      setNuevoMensaje('');
    } catch (err) {
      alert('Error al enviar el mensaje');
      console.error(err);
    } finally {
      setEnviandoMsg(false);
    }
  };

  // --- LÓGICA DEL PANEL DE AJUSTES ---
  const liderId = entorno?.equipo?.lider?._id || entorno?.equipo?.lider;
  const esLider = entorno?.equipo?.lider?.email === usuario?.email;

  useEffect(() => {
    if (esLider && panelAjustes) {
      api.get(`/solicitudes/iniciativa/${entorno.iniciativa._id}`)
        .then(res => setPostulaciones(res.data))
        .catch(err => console.error(err));
    }
  }, [esLider, panelAjustes, entorno]);

  const procesarPostulacion = async (solicitudId, accion) => {
    setProcesando(solicitudId);
    try {
      const { data } = await api.put(`/solicitudes/${solicitudId}/${accion}`);
      setPostulaciones(prev => prev.map(p => p._id === solicitudId ? { ...p, estado: data.solicitud.estado } : p));
      
      if (accion === 'aceptar') {
        const { data: envData } = await api.get(`/entornos/${id}`);
        setEntorno(envData);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Error al procesar');
    } finally {
      setProcesando(null);
    }
  };

  // --- FUNCIÓN PARA RETIRAR MIEMBRO (NUEVO) ---
  const retirarMiembro = async (miembroId) => {
    const conf = prompt('Para confirmar la expulsión, escribe RETIRAR');
    if (conf !== 'RETIRAR') return;
    try {
      await api.delete(`/equipos/${entorno.equipo._id}/finalizar/${miembroId}`, {
        data: { confirmacion: 'RETIRAR' }
      });
      // Recargamos el entorno para actualizar la lista
      const { data } = await api.get(`/entornos/${id}`);
      setEntorno(data);
      alert('Miembro retirado del equipo');
    } catch (err) {
      alert(err.response?.data?.error || 'Error al retirar miembro');
    }
  };

  const salirDelEquipo = async () => {
    const conf = prompt('Para salir, escribe SALIR');
    if (conf !== 'SALIR') return;
    try {
      await api.delete(`/equipos/${entorno.equipo._id}/salir`, { data: { confirmacion: 'SALIR' } });
      navigate('/mis-equipos');
    } catch (err) {
      alert(err.response?.data?.error || 'Error al salir');
    }
  };

  const cederLiderazgo = async () => {
    if (!nuevoLiderId) return alert('Selecciona a un miembro primero');
    
    setCediendo(true);
    try {
      await api.put(`/equipos/${entorno.equipo._id}/ceder-liderazgo`, { 
        nuevoLider: nuevoLiderId,
        confirmacion: 'CEDER'
      });
      alert('Liderazgo cedido correctamente. Ahora eres un miembro más.');
      window.location.reload(); 
    } catch (err) {
      alert(err.response?.data?.error || 'Error al ceder liderazgo');
    } finally {
      setCediendo(false);
    }
  };

  if (cargando) return <div className="flex justify-center py-32"><Loader2 className="animate-spin text-nexo-accent" size={32} /></div>;
  if (!entorno) return null;

  const color1 = entorno.colorPrimario || '#6d8bff';
  const color2 = entorno.colorSecundario || '#b06dff';

  const iniciativa = entorno.iniciativa;
  const miembros = entorno.equipo?.miembros || [];
  const lider = miembros.find(m => m._id === liderId) || { nombre: 'Desconocido' };

  const menu = [
    { id: 'inicio', nombre: 'Inicio', icono: LayoutDashboard },
    { id: 'chat', nombre: 'Chat General', icono: MessageSquare },
    { id: 'tareas', nombre: 'Tablero', icono: Folder },
    { id: 'conferencia', nombre: 'Conferencia', icono: Video, disabled: true },
  ];

  return (
    <div className="space-y-6">
      {/* HEADER DEL ENTORNO */}
      <div className="card-nexo relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${color1}15, ${color2}15)`, borderColor: `${color1}40` }}>
        <button onClick={() => navigate('/mis-equipos')} className="mb-4 text-sm text-nexo-muted hover:text-white flex items-center gap-2">
          <ArrowLeft size={16} /> Volver a mis entornos
        </button>
        
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 flex items-center justify-center overflow-hidden shadow-xl transition-all duration-300 hover:scale-105"
              style={{ 
                background: `linear-gradient(135deg, ${color1}, ${color2})`,
                boxShadow: `0 10px 25px -5px ${color1}80`,
                clipPath: 'polygon(50% 0%, 100% 5%, 95% 70%, 50% 100%, 5% 70%, 0% 5%)'
              }}
            >
              {entorno.icono ? (
                <span className="text-3xl">{entorno.icono}</span>
              ) : (
                <img 
                  src="/entornos.png" 
                  alt="Entorno" 
                  className="w-full h-full object-cover scale-125 drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]" 
                />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{entorno.nombre}</h1>
              <p className="text-nexo-muted text-sm">{entorno.eslogan || 'Un espacio para crear juntos'}</p>
            </div>
          </div>

          <button 
            onClick={() => setPanelAjustes(true)}
            className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-nexo-muted hover:text-white transition-colors border border-white/5"
            title="Ajustes del Entorno"
          >
            <Settings size={20} />
          </button>
        </div>

        <div className="absolute top-4 right-20 flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-full border border-white/10">
          <div className="flex -space-x-2">
            {miembros.slice(0, 3).map((m, i) => (
              <div key={i} className="w-6 h-6 rounded-full bg-nexo-accent-2 border-2 border-[#0e1020] flex items-center justify-center text-[10px] text-white">
                {m.nombre?.charAt(0) || 'U'}
              </div>
            ))}
          </div>
          <span className="text-xs text-nexo-muted ml-1">{miembros.length} miembros</span>
        </div>
      </div>

      {/* LAYOUT PRINCIPAL */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-2">
          {menu.map(h => {
            const Icono = h.icono;
            const activo = herramienta === h.id;
            return (
              <button
                key={h.id}
                disabled={h.disabled}
                onClick={() => setHerramienta(h.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activo ? 'bg-white/10 text-white font-medium shadow-md' : 'text-nexo-muted hover:bg-white/5 hover:text-white'
                } ${h.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                style={activo ? { borderLeft: `3px solid ${color1}` } : {}}
              >
                <Icono size={18} strokeWidth={activo ? 2.5 : 2} />
                {h.nombre}
              </button>
            );
          })}
        </div>

        <div className="md:col-span-3 min-h-[500px] card-nexo p-6 flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div key={herramienta} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="h-full flex-1 flex flex-col">
              
              {/* --- INICIO (SALA DE ESTAR) --- */}
              {herramienta === 'inicio' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Bienvenido a {entorno.nombre}</h2>
                    <p className="text-nexo-text/80 leading-relaxed">
                      {entorno.descripcion || iniciativa.descripcion || 'Este es el espacio de trabajo del equipo.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3">
                      <div className="p-2 bg-nexo-accent/20 text-nexo-accent rounded-lg">
                        <Users size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-nexo-muted">Miembros</p>
                        <p className="text-lg font-bold">{miembros.length}</p>
                      </div>
                    </div>

                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3">
                      <div className="p-2 bg-green-400/20 text-green-400 rounded-lg">
                        <ShieldCheck size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-nexo-muted">Líder Actual</p>
                        <p className="text-sm font-bold truncate max-w-[120px]">{lider.nombre}</p>
                      </div>
                    </div>

                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-center gap-3">
                      <div className="p-2 bg-nexo-accent-2/20 text-nexo-accent-2 rounded-lg">
                        <Target size={20} />
                      </div>
                      <div>
                        <p className="text-xs text-nexo-muted">Estado</p>
                        <p className="text-sm font-bold capitalize">{iniciativa.estado || 'Abierta'}</p>
                      </div>
                    </div>
                  </div>

                  {iniciativa.habilidadesBuscadas?.length > 0 && (
                    <div className="p-5 bg-white/5 rounded-xl border border-white/10">
                      <h3 className="text-sm uppercase tracking-wider text-nexo-muted mb-3 flex items-center gap-2">
                        <Sparkles size={16} /> Habilidades buscadas
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {iniciativa.habilidadesBuscadas.map((h, i) => (
                          <span key={i} className="text-xs px-2.5 py-1 bg-nexo-accent/10 border border-nexo-accent/20 text-nexo-accent rounded-md">
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="p-5 bg-white/5 rounded-xl border border-white/10">
                    <h3 className="text-sm uppercase tracking-wider text-nexo-muted mb-3 flex items-center gap-2">
                      <Users size={16} /> El Equipo
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {miembros.map(m => (
                        <div key={m._id} className="flex items-center gap-2 bg-black/20 pl-1 pr-3 py-1 rounded-full border border-white/5">
                          <div className="w-6 h-6 rounded-full bg-nexo-accent flex items-center justify-center text-white text-[10px]">
                            {m.nombre.charAt(0)}
                          </div>
                          <span className="text-xs font-medium">{m.nombre}</span>
                          {m._id === liderId && <Crown size={12} className="text-yellow-400 ml-1" title="Líder" />}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* --- CHAT GENERAL --- */}
              {herramienta === 'chat' && (
                <div className="flex flex-col h-full">
                  <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                    {mensajes.length === 0 ? (
                      <div className="text-center text-xs text-nexo-muted py-10">Aún no hay mensajes. ¡Sé el primero en escribir!</div>
                    ) : (
                      mensajes.map(msg => (
                        <div key={msg._id} className="flex flex-col">
                          <span className="text-xs font-medium text-nexo-muted mb-1 ml-1">{msg.autor?.nombre}</span>
                          <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm p-3 w-fit max-w-[80%]">
                            <p className="text-sm">{msg.contenido}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <form onSubmit={enviarMensaje} className="flex gap-2 mt-auto">
                    <input 
                      type="text" 
                      value={nuevoMensaje}
                      onChange={(e) => setNuevoMensaje(e.target.value)}
                      placeholder="Escribe un mensaje..." 
                      className="input-base flex-1" 
                    />
                    <button type="submit" disabled={enviandoMsg} className="btn-primary p-3 disabled:opacity-50">
                      {enviandoMsg ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                  </form>
                </div>
              )}

              {/* --- TAREAS --- */}
              {herramienta === 'tareas' && (
                <div className="text-center py-20 text-nexo-muted">Tablero de tareas en construcción</div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* PANEL DE AJUSTES DESLIZANTE (DRAWER) */}
      <AnimatePresence>
        {panelAjustes && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setPanelAjustes(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0e1020] border-l border-white/10 z-50 p-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Settings size={24} /> Ajustes
                </h2>
                <button onClick={() => setPanelAjustes(false)} className="p-2 hover:bg-white/10 rounded-full text-nexo-muted">
                  <X size={20} />
                </button>
              </div>

              {/* SECCIÓN: POSTULACIONES (Solo líder) */}
              {esLider && (
                <div className="mb-8">
                  <h3 className="text-sm uppercase tracking-wider text-nexo-muted mb-4 flex items-center gap-2">
                    <CheckCircle2 size={16} /> Postulaciones Pendientes
                  </h3>
                  {postulaciones.filter(p => p.estado === 'pendiente').length === 0 ? (
                    <p className="text-sm text-nexo-muted">No hay postulaciones por revisar.</p>
                  ) : (
                    <div className="space-y-3">
                      {postulaciones.filter(p => p.estado === 'pendiente').map(p => (
                        <div key={p._id} className="p-4 bg-white/5 rounded-xl border border-white/10">
                          <p className="font-medium">{p.usuario?.nombre}</p>
                          <p className="text-xs text-nexo-muted mb-3 line-clamp-2">{p.mensaje || 'Sin mensaje'}</p>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => procesarPostulacion(p._id, 'aceptar')} 
                              disabled={procesando === p._id}
                              className="flex-1 py-2 bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition-colors"
                            >
                              <CheckCircle2 size={14} /> Aceptar
                            </button>
                            <button 
                              onClick={() => procesarPostulacion(p._id, 'rechazar')} 
                              disabled={procesando === p._id}
                              className="flex-1 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition-colors"
                            >
                              <XCircle size={14} /> Rechazar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* SECCIÓN: MIEMBROS DEL EQUIPO */}
              <div className="mb-8">
                <h3 className="text-sm uppercase tracking-wider text-nexo-muted mb-4 flex items-center gap-2">
                  <Users size={16} /> Miembros del Equipo ({miembros.length})
                </h3>
                <div className="space-y-2">
                  {miembros.map(m => (
                    <div key={m._id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-nexo-accent-2 flex items-center justify-center text-white text-xs font-semibold">
                          {m.nombre.charAt(0)}
                        </div>
                        <span className="text-sm font-medium">{m.nombre}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {m._id === liderId && (
                          <span className="text-[10px] bg-nexo-accent/20 text-nexo-accent px-2 py-1 rounded font-bold uppercase tracking-wider">Líder</span>
                        )}
                        
                        {/* BOTÓN DE RETIRAR (Solo líder y no a sí mismo) */}
                        {esLider && m._id !== liderId && (
                          <button 
                            onClick={() => retirarMiembro(m._id)}
                            className="p-1.5 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                            title="Retirar del equipo"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECCIÓN: CEDER LIDERAZGO */}
              {esLider && (
                <div className="mb-8">
                  <button 
                    onClick={() => setModalCeder(true)}
                    className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-nexo-text rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Crown size={18} className="text-nexo-accent-3" /> Ceder Liderazgo
                  </button>
                </div>
              )}

              {/* SECCIÓN: ZONA DE PELIGRO / SALIR */}
              <div className="pt-6 border-t border-white/10">
                <h3 className="text-sm uppercase tracking-wider text-red-400 mb-4 flex items-center gap-2">
                  <ShieldAlert size={16} /> Zona de Peligro
                </h3>
                {esLider ? (
                  <p className="text-sm text-nexo-muted">Como líder, no puedes salir del equipo. Usa la opción "Ceder Liderazgo" primero.</p>
                ) : (
                  <button 
                    onClick={salirDelEquipo} 
                    className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 border border-red-500/20"
                  >
                    <UserMinus size={18} /> Salir de este Entorno
                  </button>
                )}
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* MODAL FLOTANTE PARA CEDER LIDERAZGO */}
      <AnimatePresence>
        {modalCeder && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setModalCeder(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-[#0e1020] border border-white/10 rounded-2xl p-6 shadow-2xl"
            >
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                <Crown className="text-nexo-accent-3" size={20} /> Ceder Liderazgo
              </h3>
              <p className="text-sm text-nexo-muted mb-4">
                Elige al nuevo líder. Al hacerlo, tú pasarás a ser un miembro más del equipo y perderás los privilegios de gestión.
              </p>

              <select 
                value={nuevoLiderId} 
                onChange={(e) => setNuevoLiderId(e.target.value)}
                className="input-base w-full mb-4 bg-black/30"
              >
                <option value="">Selecciona un miembro...</option>
                {miembros.filter(m => m.email !== usuario?.email).map(m => (
                  <option key={m._id} value={m._id}>{m.nombre}</option>
                ))}
              </select>

              <div className="flex gap-3">
                <button 
                  onClick={() => setModalCeder(false)} 
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
                <button 
                  onClick={cederLiderazgo}
                  disabled={!nuevoLiderId || cediendo}
                  className="btn-primary flex-1 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {cediendo ? <Loader2 size={16} className="animate-spin" /> : 'Confirmar'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}