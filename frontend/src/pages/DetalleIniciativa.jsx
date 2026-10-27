import { Lock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft, UserPlus, Settings, X, Calendar,
    Sparkles, UserCheck, Users, Loader2,
    CheckCircle2, XCircle, Clock, ChevronDown, ChevronUp, Mail
  } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const estiloPorArea = {
  'tecnología':    { acento: '#58e0ff', bg: 'rgba(88, 224, 255, 0.06)' },
  'cultura':       { acento: '#ff8b5a', bg: 'rgba(255, 107, 53, 0.06)' },
  'educación':     { acento: '#6d8bff', bg: 'rgba(109, 139, 255, 0.06)' },
  'emprendimiento':{ acento: '#ffb347', bg: 'rgba(255, 179, 71, 0.06)' },
  'social':        { acento: '#b06dff', bg: 'rgba(176, 109, 255, 0.06)' },
  'otro':          { acento: '#8a8fb0', bg: 'rgba(138, 143, 176, 0.06)' },
};

const etiquetaEstado = {
  'abierta':    { texto: 'Abierta',    color: '#4ade80' },
  'en_proceso': { texto: 'En proceso', color: '#ffb347' },
  'cerrada':    { texto: 'Cerrada',    color: '#8a8fb0' },
  'eliminada':  { texto: 'Eliminada',  color: '#ef4444' },
};

const estadoPostulacion = {
  'pendiente': { texto: 'Pendiente', color: '#ffb347', icono: Clock },
  'aceptada':  { texto: 'Aceptada',  color: '#4ade80', icono: CheckCircle2 },
  'rechazada': { texto: 'Rechazada', color: '#ef4444', icono: XCircle },
};

export default function DetalleIniciativa() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const [iniciativa, setIniciativa] = useState(null);
  const [miSolicitud, setMiSolicitud] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [modalAbierto, setModalAbierto] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Estados para el panel de gestión del líder
  const [postulaciones, setPostulaciones] = useState([]);
  const [panelAbierto, setPanelAbierto] = useState(false);
  const [procesando, setProcesando] = useState(null);
  const [equipo, setEquipo] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const { data } = await api.get(`/iniciativas/${id}`);
        setIniciativa(data);

        const soyLider = data.lider?.email === usuario?.email;

        if (soyLider) {
          try {
            const { data: posts } = await api.get(`/solicitudes/iniciativa/${id}`);
            setPostulaciones(posts);
          } catch {
            // Silencioso
          }
          try {
            const { data: eq } = await api.get(`/equipos/iniciativa/${id}`);
            setEquipo(eq);
          } catch {
            // Si el equipo no existe aún, lo dejamos en null
          }
        } else {
          try {
            const { data: solicitudes } = await api.get('/solicitudes/mias');
            const activa = solicitudes.find(
              s => s.iniciativa?._id === id &&
                   ['pendiente', 'aceptada'].includes(s.estado)
            );
            if (activa) setMiSolicitud(activa);
          } catch {
            // Silencioso
          }
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Error al cargar la iniciativa');
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [id, usuario]);

  // Si no hay postulaciones, el panel de gestión no tiene sentido abierto
  useEffect(() => {
    if (postulaciones.length === 0) setPanelAbierto(false);
  }, [postulaciones]);

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    document.body.style.overflow = modalAbierto ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [modalAbierto]);

  const postularse = async () => {
    setEnviando(true);
    try {
      const { data } = await api.post('/solicitudes', {
        iniciativa: id,
        mensaje: mensaje.trim(),
      });
      setMiSolicitud(data);
      setIniciativa(prev => ({
        ...prev,
        postulacionesCount: (prev.postulacionesCount || 0) + 1,
      }));
      setModalAbierto(false);
      setMensaje('');
    } catch (err) {
      alert(err.response?.data?.error || 'Error al postularse');
    } finally {
      setEnviando(false);
    }
  };

  const procesarPostulacion = async (solicitudId, accion) => {
    setProcesando(solicitudId);
    try {
      const { data } = await api.put(`/solicitudes/${solicitudId}/${accion}`);

      // La postulación se mueve de "pendiente" a "aceptada"/"rechazada"
      // (sigue en el array, pero la UI la agrupa por estado)
      setPostulaciones(prev =>
        prev.map(p => p._id === solicitudId ? { ...p, estado: data.solicitud.estado } : p)
      );

      if (accion === 'aceptar' && data.equipo) {
        setEquipo(data.equipo);
        if (data.equipo.miembros.length > iniciativa.limiteColaboradores) {
           setIniciativa(prev => ({ ...prev, limiteColaboradores: data.equipo.miembros.length }));
        }
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error;

      // SI EL EQUIPO ESTÁ LLENO: Lo ampliamos y reintentamos automáticamente
      if (accion === 'aceptar' && errorMsg && errorMsg.includes('lleno')) {
        try {
          const nuevoLimite = (iniciativa.limiteColaboradores || 1) + 1;
          await api.put(`/iniciativas/${id}/limite`, { nuevoLimite });

          const { data: retryData } = await api.put(`/solicitudes/${solicitudId}/${accion}`);

          setPostulaciones(prev =>
            prev.map(p => p._id === solicitudId ? { ...p, estado: 'aceptada' } : p)
          );

          if (retryData.equipo) setEquipo(retryData.equipo);
          setIniciativa(prev => ({ ...prev, limiteColaboradores: nuevoLimite }));
        } catch (retryError) {
          alert(retryError.response?.data?.error || 'Error al intentar ampliar el cupo automáticamente');
        }
      } else {
        alert(errorMsg || `Error al ${accion} la postulación`);
      }
    } finally {
      setProcesando(null);
    }
  };

  const salirDelEquipo = async () => {
    if (!equipo?._id) {
      alert('No se pudo identificar el equipo. Recarga la página.');
      return;
    }
    const confirmacion = prompt('Para salir del equipo, escribe la palabra: SALIR');
    if (confirmacion !== 'SALIR') {
      if (confirmacion !== null) alert('Confirmación incorrecta. No has salido del equipo.');
      return;
    }
    try {
      await api.delete(`/equipos/${equipo._id}/salir`, {
        data: { confirmacion: 'SALIR' }
      });
      alert('Has salido del equipo correctamente.');
      setMiSolicitud(null);
      setEquipo(null);
    } catch (err) {
      alert(err.response?.data?.error || 'Error al salir del equipo');
    }
  };

  const retirarMiembro = async (miembroId) => {
    if (!equipo?._id) return;
    const conf = prompt('Escribe RETIRAR para confirmar');
    if (conf !== 'RETIRAR') return;
    try {
      await api.delete(`/equipos/${equipo._id}/finalizar/${miembroId}`, {
        data: { confirmacion: 'RETIRAR' }
      });
      setEquipo(prev => ({
        ...prev,
        miembros: prev.miembros.filter(m => m._id !== miembroId),
      }));
      alert('Miembro retirado');
    } catch (err) {
      alert(err.response?.data?.error || 'Error');
    }
  };

  const cancelarPostulacion = async () => {
    if (!window.confirm('¿Seguro que quieres cancelar tu postulación?')) return;
    try {
      await api.delete(`/solicitudes/${miSolicitud._id}`);
      alert('Postulación cancelada.');
      setMiSolicitud(null);
      setIniciativa(prev => ({
        ...prev,
        postulacionesCount: Math.max((prev.postulacionesCount || 1) - 1, 0),
      }));
    } catch (err) {
      alert(err.response?.data?.error || 'Error al cancelar');
    }
  };

  const actualizarLimite = async (nuevoLimite) => {
    if (nuevoLimite < 1) return;
    try {
      const { data } = await api.put(`/iniciativas/${id}/limite`, { nuevoLimite: Number(nuevoLimite) });
      setIniciativa(prev => ({
        ...prev,
        limiteColaboradores: data.limiteColaboradores
      }));
    } catch (err) {
      alert(err.response?.data?.error || 'Error al cambiar el límite');
    }
  };

  if (cargando) {
    return (
      <div className="flex justify-center py-32">
        <Loader2 size={32} className="animate-spin text-nexo-accent" />
      </div>
    );
  }

  if (error || !iniciativa) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400 mb-4">{error || 'Iniciativa no encontrada'}</p>
        <Link to="/explorar" className="btn-secondary inline-block">
          Volver a explorar
        </Link>
      </div>
    );
  }

  const area = estiloPorArea[iniciativa.area] || estiloPorArea['otro'];
  const estado = etiquetaEstado[iniciativa.estado] || etiquetaEstado['abierta'];
  const esLider = iniciativa.lider?.email === usuario?.email;
  const puedePostularse = !esLider && iniciativa.estado === 'abierta' && !miSolicitud;

  const pendientes = postulaciones.filter(p => p.estado === 'pendiente');
  const procesadas = postulaciones.filter(p => p.estado !== 'pendiente');
  const hayAlgoQueGestionar = pendientes.length > 0 || procesadas.length > 0;

  return (
    <div className="space-y-8">

      {/* Breadcrumb */}
      <Link
        to="/explorar"
        className="inline-flex items-center gap-2 text-sm text-nexo-muted hover:text-nexo-text transition-colors"
      >
        <ArrowLeft size={16} strokeWidth={1.8} />
        Volver a explorar
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Columna principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 space-y-8"
        >

          {/* Header */}
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span
                className="text-xs px-3 py-1 rounded-full font-medium"
                style={{ backgroundColor: `${area.acento}20`, color: area.acento }}
              >
                {iniciativa.area}
              </span>
              <span className="text-xs font-medium" style={{ color: estado.color }}>
                • {estado.texto}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
              {iniciativa.titulo}
            </h1>

            <p className="text-nexo-text/90 text-lg leading-relaxed">
              {iniciativa.descripcion}
            </p>
          </div>

          {/* Habilidades buscadas */}
          {iniciativa.habilidadesBuscadas?.length > 0 && (
            <div className="card-nexo">
              <h3 className="text-sm uppercase tracking-wider text-nexo-muted mb-4 flex items-center gap-2">
                <Sparkles size={14} strokeWidth={2} />
                Habilidades buscadas
              </h3>
              <div className="flex flex-wrap gap-2">
                {iniciativa.habilidadesBuscadas.map((h, i) => (
                  <span
                    key={i}
                    className="text-sm px-3 py-1.5 rounded-lg border"
                    style={{
                      borderColor: `${area.acento}50`,
                      color: area.acento,
                      backgroundColor: `${area.acento}10`,
                    }}
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Colaboradores requeridos */}
          {iniciativa.colaboradoresRequeridos?.length > 0 && (
            <div className="card-nexo">
              <h3 className="text-sm uppercase tracking-wider text-nexo-muted mb-4 flex items-center gap-2">
                <Users size={14} strokeWidth={2} />
                Colaboradores requeridos
              </h3>
              <ul className="space-y-2">
                {iniciativa.colaboradoresRequeridos.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-nexo-text/80">
                    <span style={{ color: area.acento }}>›</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Info del líder */}
          <div className="card-nexo">
            <h3 className="text-sm uppercase tracking-wider text-nexo-muted mb-4">
              Líder de la iniciativa
            </h3>
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-semibold"
                style={{ background: `linear-gradient(135deg, ${area.acento}, #b06dff)` }}
              >
                {iniciativa.lider?.nombre?.charAt(0).toUpperCase() || '?'}
              </div>
              <div>
                <p className="font-medium text-lg">{iniciativa.lider?.nombre || 'Sin asignar'}</p>
                <p className="text-sm text-nexo-muted">{iniciativa.lider?.email}</p>
              </div>
            </div>
          </div>

        </motion.div>

        {/* Columna lateral (sticky) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <div className="lg:sticky lg:top-24 space-y-4">

            {/* Estadísticas */}
            <div className="card-nexo">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs uppercase tracking-wider text-nexo-muted">
                  Postulaciones
                </span>
                <UserPlus size={16} className="text-nexo-accent-3" strokeWidth={1.8} />
              </div>
              <p className="text-3xl font-bold" style={{ color: area.acento }}>
                {iniciativa.postulacionesCount || 0}
              </p>
            </div>

            {/* Fecha de cierre */}
            {iniciativa.fechaCierre && (
              <div className="card-nexo">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs uppercase tracking-wider text-nexo-muted">
                    Fecha de cierre
                  </span>
                  <Calendar size={16} className="text-nexo-accent-3" strokeWidth={1.8} />
                </div>
                <p className="text-sm text-nexo-text/80">
                  {new Date(iniciativa.fechaCierre).toLocaleDateString('es-CO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            )}

            {/* Botón de acción principal */}
            <div className="card-nexo space-y-3">

              {/* Soy el líder */}
              {esLider && (
                <>
                  <p className="text-sm text-nexo-muted">
                    Esta es tu iniciativa. Puedes gestionar las postulaciones desde aquí.
                  </p>
                  <button
                    onClick={() => setPanelAbierto(prev => !prev)}
                    disabled={!hayAlgoQueGestionar}
                    className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Settings size={16} strokeWidth={1.8} />
                    {panelAbierto ? 'Ocultar gestión' : 'Gestionar mi iniciativa'}
                    {panelAbierto
                      ? <ChevronUp size={16} strokeWidth={2} />
                      : <ChevronDown size={16} strokeWidth={2} />
                    }
                  </button>
                  {!hayAlgoQueGestionar && (
                    <p className="text-xs text-nexo-muted text-center">
                      Aún no hay postulaciones que gestionar.
                    </p>
                  )}
                </>
              )}

              {/* Ya me postulé */}
              {miSolicitud && !esLider && (
                <div className="text-center py-2">
                  <UserCheck
                    size={32}
                    strokeWidth={1.5}
                    className="mx-auto mb-3"
                    style={{
                      color: miSolicitud.estado === 'aceptada' ? '#4ade80' : '#ffb347',
                    }}
                  />
                  <p className="text-sm font-medium mb-1">
                    {miSolicitud.estado === 'aceptada'
                      ? '¡Estás dentro!'
                      : miSolicitud.estado === 'pendiente'
                        ? 'Postulación enviada'
                        : 'Postulación procesada'}
                  </p>
                  <p className="text-xs text-nexo-muted mb-4">
                    {miSolicitud.estado === 'aceptada'
                      ? 'Ya eres parte de este equipo.'
                      : miSolicitud.estado === 'pendiente'
                        ? 'El líder revisará tu postulación.'
                        : miSolicitud.estado === 'rechazada'
                          ? 'El líder decidió no aceptarla.'
                          : 'Estado actualizado.'}
                  </p>

                  {miSolicitud.estado === 'pendiente' && (
                    <button
                      onClick={cancelarPostulacion}
                      className="text-sm text-red-400 hover:text-red-300 hover:underline transition-colors mt-2"
                    >
                      Cancelar mi postulación
                    </button>
                  )}

                  {miSolicitud.estado === 'aceptada' && (
                    <button
                      onClick={salirDelEquipo}
                      className="text-sm text-red-400 hover:text-red-300 hover:underline transition-colors mt-2"
                    >
                      Salir del equipo
                    </button>
                  )}
                </div>
              )}

              {/* Puedo postularme */}
              {puedePostularse && (
                <>
                  <p className="text-sm text-nexo-muted">
                    ¿Te interesa participar? Envía tu postulación y cuéntale al líder por qué encajas.
                  </p>
                  <button
                    onClick={() => setModalAbierto(true)}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    <UserPlus size={16} strokeWidth={1.8} />
                    Postularme
                  </button>
                </>
              )}

              {/* Iniciativa cerrada */}
              {iniciativa.estado !== 'abierta' && !esLider && !miSolicitud && (
                <p className="text-sm text-nexo-muted text-center py-2">
                  Esta iniciativa ya no acepta postulaciones.
                </p>
              )}

            </div>

          </div>
        </motion.div>

      </div>

      {/* Panel de gestión del líder */}
      {esLider && panelAbierto && hayAlgoQueGestionar && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <Settings size={20} className="text-nexo-accent-3" strokeWidth={1.8} />
            <h2 className="text-2xl font-bold">Gestión de la iniciativa</h2>
          </div>

          {/* Código de acceso (solo si es privada) */}
          {iniciativa.visibilidad === 'privada' && iniciativa.codigoAcceso && (
            <div className="card-nexo bg-purple-500/5 border-purple-500/20">
              <h3 className="text-sm uppercase tracking-wider text-purple-400 mb-2 flex items-center gap-2">
                <Lock size={14} strokeWidth={2} />
                Código de acceso
              </h3>
              <p className="text-2xl font-mono font-bold text-purple-300 tracking-wider">
                {iniciativa.codigoAcceso}
              </p>
              <p className="text-xs text-nexo-muted mt-2">
                Comparte este código solo con las personas que quieras invitar.
              </p>
            </div>
          )}

          {/* Postulaciones pendientes */}
          <div className="card-nexo">
            <h3 className="text-sm uppercase tracking-wider text-nexo-muted mb-4 flex items-center gap-2">
              <Clock size={14} strokeWidth={2} />
              Postulaciones pendientes ({pendientes.length})
            </h3>
            {pendientes.length === 0 ? (
              <p className="text-sm text-nexo-muted">No hay postulaciones por revisar.</p>
            ) : (
              <div className="space-y-3">
                {pendientes.map(p => (
                  <div key={p._id} className="flex items-start justify-between gap-4 p-3 rounded-lg bg-white/5">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 rounded-full bg-nexo-accent-2 flex items-center justify-center text-white text-xs shrink-0">
                          {p.usuario?.nombre?.charAt(0) || '?'}
                        </div>
                        <span className="font-medium text-sm truncate">{p.usuario?.nombre || 'Usuario'}</span>
                      </div>
                      {p.mensaje && (
                        <p className="text-xs text-nexo-muted line-clamp-2 ml-10">{p.mensaje}</p>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => procesarPostulacion(p._id, 'aceptar')}
                        disabled={procesando === p._id}
                        className="p-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 disabled:opacity-50 transition-colors"
                        title="Aceptar"
                      >
                        {procesando === p._id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                      </button>
                      <button
                        onClick={() => procesarPostulacion(p._id, 'rechazar')}
                        disabled={procesando === p._id}
                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 disabled:opacity-50 transition-colors"
                        title="Rechazar"
                      >
                        {procesando === p._id ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Equipo actual */}
          <div className="card-nexo">
            <h3 className="text-sm uppercase tracking-wider text-nexo-muted mb-4 flex items-center gap-2">
              <Users size={14} strokeWidth={2} />
              Equipo actual ({equipo?.miembros?.length || 1} / {iniciativa.limiteColaboradores || 5} cupos)
            </h3>

            <div className="space-y-3 mb-6">
              {/* Líder siempre primero */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-nexo-accent flex items-center justify-center text-white text-xs">L</div>
                <span className="text-sm flex-1">{iniciativa.lider.nombre} (Líder)</span>
              </div>

              {/* Miembros */}
              {equipo?.miembros?.filter(m => m._id !== iniciativa.lider._id).map(m => (
                <div key={m._id} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-nexo-accent-2 flex items-center justify-center text-white text-xs">
                      {m.nombre.charAt(0)}
                    </div>
                    <span className="text-sm">{m.nombre}</span>
                  </div>
                  <button
                    onClick={() => retirarMiembro(m._id)}
                    className="text-xs text-red-400 hover:underline"
                  >
                    Retirar
                  </button>
                </div>
              ))}
            </div>

            {/* Controles de límite (fuera del map) */}
            <div className="pt-4 border-t border-nexo-border flex items-center justify-between">
              <span className="text-sm text-nexo-muted">Límite de colaboradores:</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => actualizarLimite((iniciativa.limiteColaboradores || 5) - 1)}
                  disabled={(iniciativa.limiteColaboradores || 5) <= (equipo?.miembros?.length || 1)}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 flex items-center justify-center text-nexo-text transition-colors"
                >
                  -
                </button>
                <span className="font-bold text-lg min-w-[20px] text-center">
                  {iniciativa.limiteColaboradores || 5}
                </span>
                <button
                  onClick={() => actualizarLimite((iniciativa.limiteColaboradores || 5) + 1)}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-nexo-text transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Postulaciones procesadas */}
          {procesadas.length > 0 && (
            <div className="card-nexo">
              <h3 className="text-sm uppercase tracking-wider text-nexo-muted mb-4 flex items-center gap-2">
                <CheckCircle2 size={14} strokeWidth={2} />
                Postulaciones procesadas ({procesadas.length})
              </h3>
              <div className="space-y-2">
                {procesadas.map(p => {
                  const meta = estadoPostulacion[p.estado] || estadoPostulacion.pendiente;
                  const Icono = meta.icono;
                  return (
                    <div key={p._id} className="flex items-center justify-between gap-3 p-2 rounded-lg bg-white/[0.02]">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-nexo-accent-2 flex items-center justify-center text-white text-xs shrink-0">
                          {p.usuario?.nombre?.charAt(0) || '?'}
                        </div>
                        <span className="text-sm truncate">{p.usuario?.nombre || 'Usuario'}</span>
                      </div>
                      <span
                        className="flex items-center gap-1 text-xs font-medium shrink-0"
                        style={{ color: meta.color }}
                      >
                        <Icono size={14} />
                        {meta.texto}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </motion.div>
      )}

      {/* Modal para postularse */}
      {modalAbierto && (
        <div
          onClick={() => setModalAbierto(false)}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-2xl p-6"
            style={{
              background: 'linear-gradient(160deg, #0e1020 0%, #0a0c18 100%)',
              border: `1px solid ${area.acento}40`,
            }}
          >
            <button
              onClick={() => setModalAbierto(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-nexo-muted hover:text-white hover:bg-white/10 transition-all"
            >
              <X size={18} strokeWidth={2} />
            </button>

            <h3 className="text-xl font-semibold mb-2">Postularme a esta iniciativa</h3>
            <p className="text-sm text-nexo-muted mb-5">
              Cuéntale al líder por qué te interesa y qué puedes aportar. Es opcional pero ayuda.
            </p>

            <textarea
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              placeholder="Ej: Me interesa mucho este proyecto. Tengo experiencia en React Native y quiero aportar al equipo."
              rows={4}
              maxLength={300}
              className="input-base resize-none mb-2"
            />
            <p className="text-xs text-nexo-muted text-right mb-5">
              {mensaje.length}/300
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setModalAbierto(false)}
                className="btn-secondary flex-1"
                disabled={enviando}
              >
                Cancelar
              </button>
              <button
                onClick={postularse}
                className="btn-primary flex-1 disabled:opacity-50"
                disabled={enviando}
              >
                {enviando ? 'Enviando...' : 'Enviar postulación'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}