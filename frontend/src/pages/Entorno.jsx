import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, MessageSquare, LayoutDashboard, 
  Folder, Video, Loader2, Send
} from 'lucide-react';
import api from '../api/axios';

export default function Entorno() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [entorno, setEntorno] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [herramienta, setHerramienta] = useState('inicio');

  useEffect(() => {
    // PROTECCIÓN: Si no hay id o es 'undefined', nos devolvemos
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

  if (cargando) return <div className="flex justify-center py-32"><Loader2 className="animate-spin text-nexo-accent" size={32} /></div>;
  if (!entorno) return null;

  const color1 = entorno.colorPrimario || '#6d8bff';
  const color2 = entorno.colorSecundario || '#b06dff';

  const menu = [
    { id: 'inicio', nombre: 'Inicio', icono: LayoutDashboard },
    { id: 'chat', nombre: 'Chat General', icono: MessageSquare },
    { id: 'tareas', nombre: 'Tablero', icono: Folder },
    { id: 'conferencia', nombre: 'Conferencia', icono: Video, disabled: true },
  ];

  return (
    <div className="space-y-6">
      <div className="card-nexo relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${color1}15, ${color2}15)`, borderColor: `${color1}40` }}>
        <button onClick={() => navigate('/mis-equipos')} className="mb-4 text-sm text-nexo-muted hover:text-white flex items-center gap-2">
          <ArrowLeft size={16} /> Volver a mis entornos
        </button>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg" style={{ background: `linear-gradient(135deg, ${color1}, ${color2})` }}>
            {entorno.icono || '🏠'}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{entorno.nombre}</h1>
            <p className="text-nexo-muted text-sm">{entorno.eslogan || 'Un espacio para crear juntos'}</p>
          </div>
        </div>
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-full border border-white/10">
          <div className="flex -space-x-2">
            {entorno.equipo?.miembros?.slice(0, 3).map((m, i) => (
              <div key={i} className="w-6 h-6 rounded-full bg-nexo-accent-2 border-2 border-[#0e1020] flex items-center justify-center text-[10px] text-white">
                {m.nombre?.charAt(0) || 'U'}
              </div>
            ))}
          </div>
          <span className="text-xs text-nexo-muted ml-1">{entorno.equipo?.miembros?.length || 0} miembros</span>
        </div>
      </div>

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
              {herramienta === 'inicio' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold">Bienvenido a {entorno.nombre}</h2>
                  <p className="text-nexo-muted">{entorno.descripcion || 'Este es su espacio de trabajo.'}</p>
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-xs text-nexo-muted mb-1">Miembros</p>
                      <p className="text-2xl font-bold">{entorno.equipo?.miembros?.length || 0}</p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-xs text-nexo-muted mb-1">Iniciativa</p>
                      <p className="text-sm font-medium truncate">{entorno.iniciativa?.titulo}</p>
                    </div>
                  </div>
                </div>
              )}

              {herramienta === 'chat' && (
                <div className="flex flex-col h-full">
                  <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                    <div className="text-center text-xs text-nexo-muted py-10">El chat estará disponible pronto. Aquí podrás comunicarte con tu equipo.</div>
                  </div>
                  <div className="flex gap-2 mt-auto">
                    <input type="text" placeholder="Escribe un mensaje..." className="input-base flex-1" disabled />
                    <button className="btn-primary p-3 opacity-50" disabled><Send size={18} /></button>
                  </div>
                </div>
              )}

              {herramienta === 'tareas' && (
                <div className="text-center py-20 text-nexo-muted">Tablero de tareas en construcción</div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}