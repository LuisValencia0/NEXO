import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, XCircle, Trash2, Loader2 } from 'lucide-react';
import api from '../api/axios';

const estadoPostulacion = {
  'pendiente': { texto: 'Pendiente', color: '#ffb347', icono: Clock },
  'aceptada':  { texto: 'Aceptada',  color: '#4ade80', icono: CheckCircle2 },
  'rechazada': { texto: 'Rechazada', color: '#ef4444', icono: XCircle },
  'cancelada': { texto: 'Cancelada', color: '#8a8fb0', icono: XCircle },
};

export default function MisPostulaciones() {
  const [postulaciones, setPostulaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [cancelando, setCancelando] = useState(null);

  const cargar = async () => {
    try {
      const { data } = await api.get('/solicitudes/mias');
      // Filtramos para mostrar solo las que no han sido finalizadas
      setPostulaciones(data.filter(p => p.estado !== 'finalizada'));
    } catch (err) {
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const cancelarPostulacion = async (id) => {
    if (!window.confirm('¿Seguro que quieres cancelar esta postulación?')) return;
    setCancelando(id);
    try {
      await api.delete(`/solicitudes/${id}`);
      cargar(); // Recargamos la lista
    } catch (err) {
      alert(err.response?.data?.error || 'Error al cancelar');
    } finally {
      setCancelando(null);
    }
  };

  if (cargando) return <div className="flex justify-center py-32"><Loader2 className="animate-spin text-nexo-accent" size={32} /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div>
        <h1 className="text-3xl font-bold mb-2">Mis <span className="bg-gradient-to-r from-nexo-accent-3 via-nexo-accent to-nexo-accent-2 bg-clip-text text-transparent">Postulaciones</span></h1>
        <p className="text-nexo-muted">Revisa el estado de las iniciativas a las que te has postulado.</p>
      </div>

      {postulaciones.length === 0 ? (
        <div className="text-center py-20 text-nexo-muted">
          Aún no te has postulado a ninguna iniciativa. ¡Ve a explorar!
        </div>
      ) : (
        <div className="space-y-3">
          {postulaciones.map((post, i) => {
            const meta = estadoPostulacion[post.estado] || estadoPostulacion.pendiente;
            const Icono = meta.icono;

            return (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card-nexo p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <h3 className="font-bold text-lg">{post.iniciativa?.titulo}</h3>
                  <p className="text-sm text-nexo-muted">Área: {post.iniciativa?.area}</p>
                  {post.mensaje && (
                    <p className="text-xs text-nexo-muted mt-1 italic">" {post.mensaje} "</p>
                  )}
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className="flex items-center gap-1.5 text-sm font-medium" style={{ color: meta.color }}>
                    <Icono size={16} />
                    {meta.texto}
                  </span>

                  {post.estado === 'pendiente' && (
                    <button
                      onClick={() => cancelarPostulacion(post._id)}
                      disabled={cancelando === post._id}
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                      title="Cancelar postulación"
                    >
                      {cancelando === post._id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    </button>
                  )}

                  {post.estado === 'aceptada' && (
                    <Link to="/mis-equipos" className="text-xs text-nexo-accent hover:underline">
                      Ir al Entorno →
                    </Link>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}