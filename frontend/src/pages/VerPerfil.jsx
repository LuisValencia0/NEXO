import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, Mail, Star, Loader2, Link as LinkIcon, Clock, ArrowLeft 
} from 'lucide-react';
import api from '../api/axios';

export default function VerPerfil() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        // Podrías crear un endpoint GET /api/auth/usuario/:id
        // Por ahora, usaremos uno que ya tienes: GET /api/solicitudes/mias (no sirve)
        // Lo ideal es crear el endpoint en el backend. 
        // Como no lo tienes aún, asumiremos que el perfil viene por props o lo buscamos
        // Vamos a simular que el backend tiene un GET /api/usuarios/:id
        const { data } = await api.get(`/auth/usuario/${id}`);
        setPerfil(data);
      } catch (err) {
        console.error(err);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [id]);

  if (cargando) return <div className="flex justify-center py-32"><Loader2 className="animate-spin text-nexo-accent" size={32} /></div>;
  if (!perfil) return <div className="text-center py-20 text-nexo-muted">Usuario no encontrado</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 mt-8">
      <button onClick={() => navigate(-1)} className="text-sm text-nexo-muted hover:text-white flex items-center gap-2 mb-4">
        <ArrowLeft size={16} /> Volver
      </button>

      {/* HEADER DEL PERFIL */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-nexo relative overflow-hidden flex flex-col md:flex-row items-center gap-6 p-8"
      >
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-nexo-accent/20 to-nexo-accent-2/20 z-0" />
        
        <div className="relative z-10 w-28 h-28 rounded-full bg-gradient-to-br from-nexo-accent to-nexo-accent-2 flex items-center justify-center text-white text-5xl font-bold shadow-xl border-4 border-[#0e1020]">
          {perfil.nombre.charAt(0).toUpperCase()}
        </div>
        
        <div className="relative z-10 flex-1 text-center md:text-left mt-4 md:mt-0">
          <h1 className="text-3xl font-bold mb-1">{perfil.nombre}</h1>
          <p className="text-nexo-muted flex items-center justify-center md:justify-start gap-2">
            <Mail size={16} /> {perfil.email}
          </p>
        </div>
      </motion.div>

      {/* INFO DEL PERFIL */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Columna Izquierda: Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="card-nexo p-6 space-y-4">
            <h3 className="text-sm uppercase tracking-wider text-nexo-muted mb-2">Sobre mí</h3>
            <p className="text-sm text-nexo-text/80 leading-relaxed">
              {perfil.biografia || 'Este usuario aún no ha escrito su biografía.'}
            </p>
            
            <div className="pt-4 border-t border-white/5 space-y-3 text-sm">
              {perfil.disponibilidad && (
                <p className="flex items-center gap-2 text-nexo-muted"><Clock size={16} /> {perfil.disponibilidad}</p>
              )}
              {perfil.portafolio && (
                <a href={perfil.portafolio} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-nexo-accent hover:underline">
                  <LinkIcon size={16} /> Ver portafolio
                </a>
              )}
            </div>
          </div>

          <div className="card-nexo p-6">
            <h3 className="text-sm uppercase tracking-wider text-nexo-muted mb-3 flex items-center gap-2"><Star size={14}/> Habilidades</h3>
            <div className="flex flex-wrap gap-2">
              {perfil.habilidades?.length > 0 ? perfil.habilidades.map((h, i) => (
                <span key={i} className="text-xs px-2.5 py-1 bg-white/5 border border-white/10 rounded-md text-nexo-text">{h}</span>
              )) : <span className="text-xs text-nexo-muted">Sin habilidades registradas.</span>}
            </div>
          </div>
        </div>

        {/* Columna Derecha: (Aquí podrías mostrar sus iniciativas públicas en el futuro) */}
        <div className="md:col-span-2 space-y-6">
          <div className="card-nexo p-6">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4"><User size={18} className="text-nexo-accent-2"/> Acerca de este usuario</h3>
            <p className="text-sm text-nexo-muted">
              Este es el perfil público de {perfil.nombre}. Pronto podrás ver aquí las iniciativas que ha creado.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}