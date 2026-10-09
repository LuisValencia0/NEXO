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

  useEffect(() => {
    const cargar = async () => {
      try {
        const { data } = await api.get(`/iniciativas/${id}`);
        setIniciativa(data);

        // Si soy el líder, cargar las postulaciones recibidas
        const soyLider = data.lider?.email === usuario?.email;
        if (soyLider) {
          try {
            const { data: posts } = await api.get(`/solicitudes/iniciativa/${id}`);
            setPostulaciones(posts);
          } catch {
            // Silencioso
          }
        }

        // Si no soy el líder, buscar mi propia postulación
        if (!soyLider) {
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

  const postularse = async () => {
    setEnviando(true);
    try {
      const { data } = await api.post('/solicitudes', {
        iniciativa: id,
        mensaje: mensaje.trim(),
      });

      // Actualizar mi solicitud
      setMiSolicitud(data);

      // Actualizar el contador en la iniciativa
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

      // Actualizar la lista local
      setPostulaciones(prev =>
        prev.map(p => p._id === solicitudId ? { ...p, estado: data.solicitud.estado } : p)
      );
    } catch (err) {
      alert(err.response?.data?.error || `Error al ${accion} la postulación`);
    } finally {
      setProcesando(null);
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
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    <Settings size={16} strokeWidth={1.8} />
                    {panelAbierto ? 'Ocultar gestión' : 'Gestionar mi iniciativa'}
                    {panelAbierto
                      ? <ChevronUp size={16} strokeWidth={2} />
                      : <ChevronDown size={16} strokeWidth={2} />
                    }
                  </button>
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
                  <p className="text-xs text-nexo-muted">
                    {miSolicitud.estado === 'aceptada'
                      ? 'Ya eres parte de este equipo.'
                      : miSolicitud.estado === 'pendiente'
                        ? 'El líder revisará tu postulación.'
                        : miSolicitud.estado === 'rechazada'
                          ? 'El líder decidió no aceptarla.'
                          : 'Estado actualizado.'}
                  </p>
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
        {esLider && panelAbierto && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-3 mb-2">
            <Settings size={20} className="text-nexo-accent-3" strokeWidth={1.8} />
            <h2 className="text-2xl font-bold">Gestión de la iniciativa</h2>
          </div>

          {/* Postulaciones */}
          <div className="card-nexo">
            <h3 className="text-sm uppercase tracking-wider text-nexo-muted mb-4 flex items-center gap-2">
              <Users size={14} strokeWidth={2} />
              Postulaciones recibidas ({postulaciones.length})
            </h3>

            {postulaciones.length === 0 ? (
              <div className="text-center py-8">
                <Clock size={32} className="mx-auto text-nexo-muted mb-3" strokeWidth={1.5} />
                <p className="text-nexo-muted text-sm">
                  Aún no has recibido postulaciones.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {postulaciones.map(post => (
                  <div
                    key={post._id}
                    className="p-4 rounded-lg border border-nexo-border bg-white/[0.02]"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                          className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-semibold"
                          style={{ background: `linear-gradient(135deg, ${area.acento}, #b06dff)` }}
                        >
                          {post.usuario?.nombre?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">
                            {post.usuario?.nombre || 'Usuario'}
                          </p>
                          <p className="text-xs text-nexo-muted truncate flex items-center gap-1">
                            <Mail size={11} strokeWidth={2} />
                            {post.usuario?.email}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${
                          post.estado === 'aceptada'
                            ? 'bg-green-400/10 text-green-400'
                            : post.estado === 'rechazada'
                              ? 'bg-red-400/10 text-red-400'
                              : 'bg-amber-400/10 text-amber-400'
                        }`}
                      >
                        {post.estado === 'aceptada' ? 'Aceptada'
                          : post.estado === 'rechazada' ? 'Rechazada'
                          : 'Pendiente'}
                      </span>
                    </div>

                    {post.mensaje && (
                      <p className="text-sm text-nexo-muted mb-3 pl-13">
                        "{post.mensaje}"
                      </p>
                    )}

                    {/* Botones si está pendiente */}
                    {post.estado === 'pendiente' && (
                      <div className="flex gap-2 pt-3 border-t border-nexo-border">
                        <button
                          onClick={() => procesarPostulacion(post._id, 'aceptar')}
                          disabled={procesando === post._id}
                          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium bg-green-400/10 text-green-400 hover:bg-green-400/20 transition-all disabled:opacity-50"
                        >
                          <CheckCircle2 size={15} strokeWidth={2} />
                          Aceptar
                        </button>
                        <button
                          onClick={() => procesarPostulacion(post._id, 'rechazar')}
                          disabled={procesando === post._id}
                          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium bg-red-400/10 text-red-400 hover:bg-red-400/20 transition-all disabled:opacity-50"
                        >
                          <XCircle size={15} strokeWidth={2} />
                          Rechazar
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

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