import { UserPlus, Users, CheckCircle2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Colores por área — fondo, borde y acento
const estiloPorArea = {
  'tecnología':    { bg: 'rgba(88, 224, 255, 0.06)',  borde: 'rgba(88, 224, 255, 0.25)',  acento: '#58e0ff' },
  'cultura':       { bg: 'rgba(255, 107, 53, 0.06)',  borde: 'rgba(255, 107, 53, 0.25)',  acento: '#ff8b5a' },
  'educación':     { bg: 'rgba(109, 139, 255, 0.06)', borde: 'rgba(109, 139, 255, 0.25)', acento: '#6d8bff' },
  'emprendimiento':{ bg: 'rgba(255, 179, 71, 0.06)',  borde: 'rgba(255, 179, 71, 0.25)',  acento: '#ffb347' },
  'social':        { bg: 'rgba(176, 109, 255, 0.06)', borde: 'rgba(176, 109, 255, 0.25)', acento: '#b06dff' },
  'otro':          { bg: 'rgba(138, 143, 176, 0.06)', borde: 'rgba(138, 143, 176, 0.25)', acento: '#8a8fb0' },
};

const etiquetaEstado = {
  'abierta':    { texto: 'Abierta',    color: '#4ade80' },
  'en_proceso': { texto: 'En proceso', color: '#ffb347' },
  'cerrada':    { texto: 'Cerrada',    color: '#8a8fb0' },
  'eliminada':  { texto: 'Eliminada',  color: '#ef4444' },
};

export default function TarjetaIniciativa({ iniciativa, index = 0, onClick }) {
  const navigate = useNavigate();
  const area = estiloPorArea[iniciativa.area] || estiloPorArea['otro'];
  const estado = etiquetaEstado[iniciativa.estado] || etiquetaEstado['abierta'];

  return (
    <motion.button
      type="button"
      onClick={() => {
        if (iniciativa.pertenezco) {
          navigate(`/iniciativa/${iniciativa._id}`);
        } else {
          onClick?.(iniciativa);
        }
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        y: -6,
        scale: 1.01,
        transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
      }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="relative text-left w-full group"
      style={{
        background: `linear-gradient(135deg, ${area.bg} 0%, rgba(14, 16, 32, 0.9) 100%)`,
        border: `1px solid ${area.borde}`,
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
      }}
    >
      {/* Chinche decorativo en la parte superior */}
      <div
        className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full transition-transform duration-300 group-hover:scale-110"
        style={{
          background: `radial-gradient(circle at 30% 30%, #ffffff, ${area.acento})`,
          boxShadow: `0 0 12px ${area.acento}, 0 2px 6px rgba(0,0,0,0.6)`,
        }}
      />

      {/* Etiqueta de área */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-xs px-2.5 py-1 rounded-full font-medium"
            style={{ backgroundColor: `${area.acento}20`, color: area.acento }}
          >
            {iniciativa.area}
          </span>
          
          {/* Chulito si ya perteneces */}
          {iniciativa.pertenezco && (
            <span 
              className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-green-400/10 text-green-400 border border-green-400/20"
              title="Ya eres parte de este equipo"
            >
              <CheckCircle2 size={12} strokeWidth={2.5} />
              En el equipo
            </span>
          )}

          {/* Relojito si ya postulaste pero no te han aceptado */}
          {iniciativa.postulado && (
            <span 
              className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20"
              title="Has enviado una postulación"
            >
              <Clock size={12} strokeWidth={2.5} />
              Postulado
            </span>
          )}
        </div>
        
        <span
          className="text-xs font-medium"
          style={{ color: estado.color }}
        >
          • {estado.texto}
        </span>
      </div>

      {/* Título */}
      <h3 className="text-lg font-semibold mb-2 leading-snug group-hover:text-white transition-colors">
        {iniciativa.titulo}
      </h3>

      {/* Descripción */}
      <p className="text-nexo-muted text-sm mb-4 line-clamp-3 leading-relaxed">
        {iniciativa.descripcion}
      </p>

      {/* Habilidades */}
      {iniciativa.habilidadesBuscadas?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {iniciativa.habilidadesBuscadas.slice(0, 2).map((h, i) => (
            <span
              key={i}
              className="text-[10px] px-2 py-0.5 rounded border text-nexo-muted"
              style={{ borderColor: `${area.acento}40` }}
            >
              {h}
            </span>
          ))}
          {iniciativa.habilidadesBuscadas.length > 2 && (
            <span className="text-[10px] px-2 py-0.5 text-nexo-muted">
              +{iniciativa.habilidadesBuscadas.length - 2}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold"
            style={{ background: `linear-gradient(135deg, ${area.acento}, #b06dff)` }}
          >
            {iniciativa.lider?.nombre?.charAt(0).toUpperCase() || '?'}
          </div>
          <span className="text-xs text-nexo-muted truncate max-w-[100px]">
            {iniciativa.lider?.nombre || 'Sin líder'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Contador de postulaciones */}
          <span className="text-xs text-nexo-muted flex items-center gap-1" title="Postulaciones recibidas">
            <UserPlus size={12} strokeWidth={1.8} />
            {iniciativa.postulacionesCount || 0}
          </span>

          {/* Indicador de cupos real (Miembros / Límite) */}
          <span 
            className={`text-xs flex items-center gap-1 font-medium ${
              (iniciativa.miembrosCount || 1) >= (iniciativa.limiteColaboradores || 5)
                ? 'text-red-400'
                : 'text-nexo-accent-3'
            }`}
            title="Miembros actuales / Límite de cupos"
          >
            <Users size={12} strokeWidth={1.8} />
            {(iniciativa.miembrosCount || 1)} / {iniciativa.limiteColaboradores || 5} cupos
          </span>
        </div>
        
      </div>
    </motion.button>
  );
}