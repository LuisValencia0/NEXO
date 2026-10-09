import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus, Sprout, Loader2, Users, Calendar,
  Settings, Eye, AlertCircle
} from 'lucide-react';
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

export default function MisIniciativas() {
  const navigate = useNavigate();
  const [iniciativas, setIniciativas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const cargar = async () => {
      try {
        // 1. Traer todas las iniciativas
        const { data: todas } = await api.get('/iniciativas');

        // 2. Traer mi perfil para saber qué email tengo
        const { data: perfil } = await api.get('/auth/perfil');

        // 3. Filtrar las mías
        const mias = todas.filter(i => i.lider?.email === perfil.email);

        // 4. Traer todas las solicitudes recibidas (de todas mis iniciativas)
        let pendientesPorIniciativa = {};
        try {
          const { data: recibidas } = await api.get('/solicitudes/recibidas');
          recibidas.forEach(sol => {
            if (sol.estado === 'pendiente') {
              const iniId = sol.iniciativa?._id || sol.iniciativa;
              pendientesPorIniciativa[iniId] = (pendientesPorIniciativa[iniId] || 0) + 1;
            }
          });
        } catch {
          // Silencioso
        }

        // 5. Combinar cada iniciativa con su contador de pendientes
        const miasConPendientes = mias.map(ini => ({
          ...ini,
          pendientes: pendientesPorIniciativa[ini._id] || 0,
        }));

        setIniciativas(miasConPendientes);

      } catch (err) {
        setError(err.response?.data?.error || 'Error al cargar tus iniciativas');
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Mis{' '}
            <span className="bg-gradient-to-r from-nexo-accent-3 via-nexo-accent to-nexo-accent-2 bg-clip-text text-transparent">
              iniciativas
            </span>
          </h1>
          <p className="text-nexo-muted">
            Las ideas que has sembrado y su estado actual.
          </p>
        </div>

        <Link
          to="/crear-iniciativa"
          className="btn-primary self-start md:self-auto flex items-center gap-2"
        >
          <Plus size={16} strokeWidth={2.2} />
          Crear iniciativa
        </Link>
      </div>

      {/* Estados */}
      {cargando && (
        <div className="flex justify-center py-20">
          <Loader2 size={32} className="animate-spin text-nexo-accent" />
        </div>
      )}

      {error && (
        <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          {error}
        </div>
      )}

      {!cargando && !error && iniciativas.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <div className="flex justify-center mb-6">
            <Sprout
              size={64}
              strokeWidth={1.2}
              className="text-nexo-accent-3 opacity-60"
            />
          </div>
          <h3 className="text-xl font-semibold mb-2">
            Aún no has sembrado ninguna idea
          </h3>
          <p className="text-nexo-muted mb-6">
            Publica tu primera iniciativa y empieza a encontrar colaboradores.
          </p>
          <Link to="/crear-iniciativa" className="btn-primary inline-flex items-center gap-2">
            <Plus size={16} strokeWidth={2.2} />
            Crear mi primera iniciativa
          </Link>
        </motion.div>
      )}

      {!cargando && !error && iniciativas.length > 0 && (
        <>
          <p className="text-sm text-nexo-muted">
            {iniciativas.length} {iniciativas.length === 1 ? 'iniciativa' : 'iniciativas'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {iniciativas.map((ini, i) => {
              const area = estiloPorArea[ini.area] || estiloPorArea['otro'];
              const estado = etiquetaEstado[ini.estado] || etiquetaEstado['abierta'];
              const tienePendientes = (ini.pendientes || 0) > 0;

              return (
                <motion.div
                  key={ini._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="card-nexo p-6 flex flex-col"
                >
                  {/* Etiquetas */}
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className="text-xs px-2.5 py-1 rounded-full font-medium"
                      style={{ backgroundColor: `${area.acento}20`, color: area.acento }}
                    >
                      {ini.area}
                    </span>
                    <span className="text-xs font-medium" style={{ color: estado.color }}>
                      • {estado.texto}
                    </span>
                  </div>

                  {/* Título y descripción */}
                  <h3 className="text-lg font-semibold mb-2 leading-snug">
                    {ini.titulo}
                  </h3>
                  <p className="text-nexo-muted text-sm mb-5 line-clamp-2 leading-relaxed">
                    {ini.descripcion}
                  </p>

                  {/* Info */}
                  <div className="flex items-center gap-4 mb-5 text-sm">
                    <span className="flex items-center gap-1.5 text-nexo-muted">
                      <Users size={14} strokeWidth={1.8} />
                      {ini.postulacionesCount || 0} {ini.postulacionesCount === 1 ? 'postulación' : 'postulaciones'}
                      {ini.pendientes > 0 && (
                        <span className="text-amber-400">
                          · {ini.pendientes} pendiente{ini.pendientes === 1 ? '' : 's'}
                        </span>
                      )}
                    </span>
                    {ini.createdAt && (
                      <span className="flex items-center gap-1.5 text-nexo-muted">
                        <Calendar size={14} strokeWidth={1.8} />
                        {new Date(ini.createdAt).toLocaleDateString('es-CO', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    )}
                  </div>

                  {/* Alert si hay pendientes */}
                  {tienePendientes && (
                    <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-lg px-3 py-2 mb-4">
                      <AlertCircle size={13} strokeWidth={2} />
                      Tienes {ini.pendientes} {ini.pendientes === 1 ? 'postulación pendiente' : 'postulaciones pendientes'}
                    </div>
                  )}

                  {/* Botones */}
                  <div className="flex gap-2 mt-auto pt-4 border-t border-nexo-border">
                    <button
                      onClick={() => navigate(`/iniciativa/${ini._id}`)}
                      className="btn-primary flex-1 flex items-center justify-center gap-2"
                    >
                      <Settings size={15} strokeWidth={1.8} />
                      Gestionar
                    </button>
                  </div>

                </motion.div>
              );
            })}
          </div>
        </>
      )}

    </div>
  );
}