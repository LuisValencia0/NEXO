import { X, Clock, CheckCircle2, Send, Loader2, ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const estiloPorArea = {
  'tecnología':    { acento: '#58e0ff' },
  'cultura':       { acento: '#ff8b5a' },
  'educación':     { acento: '#6d8bff' },
  'emprendimiento':{ acento: '#ffb347' },
  'social':        { acento: '#b06dff' },
  'otro':          { acento: '#8a8fb0' },
};

const etiquetaEstado = {
  'abierta':    { texto: 'Abierta',    color: '#4ade80' },
  'en_proceso': { texto: 'En proceso', color: '#ffb347' },
  'cerrada':    { texto: 'Cerrada',    color: '#8a8fb0' },
  'eliminada':  { texto: 'Eliminada',  color: '#ef4444' },
};

export default function ModalIniciativa({ iniciativa, onClose }) {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  
  const [enviando, setEnviando] = useState(false);
  const [postuladoLocal, setPostuladoLocal] = useState(false);
  
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  if (!iniciativa) return null;

  const area = estiloPorArea[iniciativa.area] || estiloPorArea['otro'];
  const estado = etiquetaEstado[iniciativa.estado] || etiquetaEstado['abierta'];

  const esLider = iniciativa.lider?.email === usuario?.email;
  
  const miembrosActuales = iniciativa.miembrosCount || 1;
  const limite = iniciativa.limiteColaboradores || 5;
  const cuposLlenos = miembrosActuales >= limite;

  const puedePostularse = !esLider && iniciativa.estado === 'abierta' && !cuposLlenos && !iniciativa.postulado && !postuladoLocal;
  const yaPostulado = iniciativa.postulado || postuladoLocal;

  const handlePostular = async (e) => {
    e.preventDefault();
    if (!mensaje.trim()) return alert('Por favor, escribe un mensaje para el líder.');
    
    setEnviando(true);
    try {
      await api.post('/solicitudes', { 
        iniciativa: iniciativa._id, 
        mensaje: mensaje.trim()
      });
      setPostuladoLocal(true);
      setMostrarFormulario(false);
    } catch (err) {
      alert(err.response?.data?.error || 'Error al postularse');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
        style={{ background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl"
          style={{
            background: 'linear-gradient(160deg, #0e1020 0%, #0a0c18 100%)',
            border: `1px solid ${area.acento}40`,
            boxShadow: `0 20px 60px rgba(0, 0, 0, 0.8), 0 0 80px ${area.acento}20`,
          }}
        >
          <div
            className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full z-10"
            style={{
              background: `radial-gradient(circle at 30% 30%, #ffffff, ${area.acento})`,
              boxShadow: `0 0 20px ${area.acento}, 0 4px 10px rgba(0,0,0,0.6)`,
            }}
          />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-nexo-muted hover:text-white hover:bg-white/10 transition-all z-10"
            aria-label="Cerrar"
          >
            <X size={20} strokeWidth={2} />
          </button>

          <div className="p-8 md:p-10">
            
            {/* VISTA 1: FORMULARIO DE MENSAJE */}
            {mostrarFormulario ? (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <button 
                  onClick={() => setMostrarFormulario(false)} 
                  className="text-sm text-nexo-muted hover:text-white flex items-center gap-2 mb-6"
                >
                  <ArrowLeft size={16} /> Volver a los detalles
                </button>

                <h2 className="text-2xl font-bold mb-2">Postulándome a:</h2>
                <p className="text-xl text-nexo-accent mb-6 font-semibold">{iniciativa.titulo}</p>
                
                <form onSubmit={handlePostular}>
                  <label className="block text-sm text-nexo-muted mb-2">
                    Mensaje para el líder (¿Por qué quieres unirte?)
                  </label>
                  <textarea
                    value={mensaje}
                    onChange={(e) => setMensaje(e.target.value)}
                    placeholder="Ej: Hola, me interesa mucho el proyecto. Tengo experiencia en React y diseño UX, y me gustaría aportar al equipo..."
                    rows={5}
                    maxLength={300}
                    className="input-base resize-none mb-2"
                    required
                  />
                  <p className="text-xs text-nexo-muted text-right mb-6">
                    {mensaje.length}/300
                  </p>

                  <div className="flex gap-3">
                    <button 
                      type="button" 
                      onClick={() => setMostrarFormulario(false)} 
                      className="btn-secondary flex-1"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      disabled={enviando || !mensaje.trim()} 
                      className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {enviando ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                      {enviando ? 'Enviando...' : 'Enviar Postulación'}
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              
              /* VISTA 2: DETALLES DE LA INICIATIVA */
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <div className="flex flex-wrap items-center gap-3 mb-6">
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

                <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
                  {iniciativa.titulo}
                </h2>

                <p className="text-nexo-text/90 text-lg leading-relaxed mb-8">
                  {iniciativa.descripcion}
                </p>

                {iniciativa.habilidadesBuscadas?.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm uppercase tracking-wider text-nexo-muted mb-3">Habilidades buscadas</h3>
                    <div className="flex flex-wrap gap-2">
                      {iniciativa.habilidadesBuscadas.map((h, i) => (
                        <span
                          key={i}
                          className="text-sm px-3 py-1.5 rounded-lg border"
                          style={{ borderColor: `${area.acento}50`, color: area.acento, backgroundColor: `${area.acento}10` }}
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {iniciativa.colaboradoresRequeridos?.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm uppercase tracking-wider text-nexo-muted mb-3">Colaboradores requeridos</h3>
                    <ul className="space-y-1.5">
                      {iniciativa.colaboradoresRequeridos.map((c, i) => (
                        <li key={i} className="text-nexo-text/80 flex items-start gap-2">
                          <span style={{ color: area.acento }}>›</span> {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* BLOQUE DEL LÍDER (AHORA CLICKEABLE) */}
                <div 
                  onClick={() => {
                    onClose(); // Cerramos el modal
                    navigate(`/perfil/${iniciativa.lider._id}`); // Navegamos al perfil público
                  }}
                  className="rounded-xl p-4 mb-8 cursor-pointer group transition-colors hover:bg-white/5"
                  style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-semibold shadow-md group-hover:scale-105 transition-transform"
                      style={{ background: `linear-gradient(135deg, ${area.acento}, #b06dff)` }}
                    >
                      {iniciativa.lider?.nombre?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="text-xs text-nexo-muted uppercase tracking-wider mb-0.5">Líder de la iniciativa</p>
                      <p className="font-medium group-hover:text-nexo-accent transition-colors">
                        {iniciativa.lider?.nombre || 'Sin asignar'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-6 mb-8 text-sm">
                  <div>
                    <p className="text-nexo-muted text-xs uppercase tracking-wider mb-1">Postulaciones</p>
                    <p className="text-2xl font-bold" style={{ color: area.acento }}>{iniciativa.postulacionesCount || 0}</p>
                  </div>
                  <div>
                    <p className="text-nexo-muted text-xs uppercase tracking-wider mb-1">Cupos</p>
                    <p className="text-sm text-nexo-text/80 font-medium mt-1">{miembrosActuales} / {limite}</p>
                  </div>
                  {iniciativa.fechaCierre && (
                    <div>
                      <p className="text-nexo-muted text-xs uppercase tracking-wider mb-1">Fecha de cierre</p>
                      <p className="text-sm text-nexo-text/80 mt-1">
                        {new Date(iniciativa.fechaCierre).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-white/5">
                  
                  {yaPostulado && (
                    <div className="flex-1 text-center py-2.5 rounded-lg bg-amber-400/10 border border-amber-400/20 text-amber-400 text-sm font-medium flex items-center justify-center gap-2">
                      <Clock size={16} />
                      Postulación enviada. Esperando respuesta.
                    </div>
                  )}

                  {puedePostularse && (
                    <button
                      onClick={() => setMostrarFormulario(true)}
                      className="btn-primary flex-1 flex items-center justify-center gap-2"
                    >
                      <Send size={18} />
                      Postularme
                    </button>
                  )}

                  {esLider && (
                    <button
                      onClick={() => navigate('/mis-equipos')} 
                      className="btn-secondary flex-1"
                    >
                      Ir a mis Entornos
                    </button>
                  )}

                  {!puedePostularse && !esLider && !yaPostulado && (
                    <div className="flex-1 text-center py-2.5 rounded-lg bg-white/5 text-nexo-muted text-sm">
                      {cuposLlenos ? 'El equipo está completo' : 'Esta iniciativa ya no acepta postulaciones'}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}