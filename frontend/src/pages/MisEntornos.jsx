import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, ArrowRight } from 'lucide-react';
import api from '../api/axios';

export default function MisEntornos() {
  const [entornos, setEntornos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const cargar = async () => {
      try {
        const { data } = await api.get('/entornos/mios');
        setEntornos(data);
      } catch (err) {
        console.error(err);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  if (cargando) return <div className="flex justify-center py-32"><Loader2 className="animate-spin text-nexo-accent" size={32} /></div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Mis <span className="bg-gradient-to-r from-nexo-accent-3 via-nexo-accent to-nexo-accent-2 bg-clip-text text-transparent">Entornos</span></h1>
        <p className="text-nexo-muted">Los espacios de trabajo de tus equipos.</p>
      </div>

      {entornos.length === 0 ? (
        <div className="text-center py-20 text-nexo-muted">
          Aún no perteneces a ningún entorno. ¡Explora iniciativas y postúlate!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {entornos.map((ent, i) => (
            <motion.div
              key={ent._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(`/entorno/${ent._id}`)}
              className="cursor-pointer rounded-2xl p-6 relative overflow-hidden group hover:scale-[1.02] transition-transform"
              style={{
                background: `linear-gradient(135deg, ${ent.colorPrimario}15, ${ent.colorSecundario}10)`,
                border: `1px solid ${ent.colorPrimario}40`
              }}
            >
              <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 shrink-0 flex items-center justify-center overflow-hidden shadow-lg transition-transform duration-300 group-hover:scale-105"
                style={{ 
                  background: `linear-gradient(135deg, ${ent.colorPrimario}, ${ent.colorSecundario})`,
                  boxShadow: `0 8px 20px -6px ${ent.colorPrimario}80`,
                  clipPath: 'polygon(50% 0%, 100% 5%, 95% 70%, 50% 100%, 5% 70%, 0% 5%)' // <-- Tu polígono
                }}
              >
                {ent.icono ? (
                  <span className="text-2xl">{ent.icono}</span>
                ) : (
                  <img 
                    src="/entornos.png" 
                    alt="Entorno" 
                    // Usamos w-full h-full y object-cover para que llene el hexágono.
                    // scale-110 asegura que el borde negro de la imagen quede fuera del recorte.
                    className="w-full h-full object-cover scale-110" 
                  />
                )}
              </div>  
                <div>
                  <h3 className="font-bold text-lg">{ent.nombre}</h3>
                  <p className="text-xs text-nexo-muted">{ent.area}</p>
                </div>
              </div>
              <p className="text-sm text-nexo-muted line-clamp-2 mb-4">{ent.eslogan || ent.descripcion}</p>
              <div className="flex justify-end">
                <span className="text-xs font-medium flex items-center gap-1 group-hover:gap-2 transition-all" style={{ color: ent.colorPrimario }}>
                  Entrar <ArrowRight size={14} />
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}