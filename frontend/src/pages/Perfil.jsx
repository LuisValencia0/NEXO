import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, Mail, Star, Edit3, Save, X, 
  Loader2, Link as LinkIcon, Clock, ArrowRight
} from 'lucide-react';
import api from '../api/axios';

export default function Perfil() {
  const navigate = useNavigate();
  
  const [perfil, setPerfil] = useState(null);
  const [entornos, setEntornos] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({
    nombre: '',
    biografia: '',
    disponibilidad: '',
    portafolio: '',
    habilidades: [],
    intereses: []
  });
  const [guardando, setGuardando] = useState(false);

  // 1. Cargar los datos (perfil + entornos)
  useEffect(() => {
    const cargarTodo = async () => {
      try {
        const [resPerfil, resEntornos] = await Promise.all([
          api.get('/auth/perfil'),
          api.get('/entornos/mios')
        ]);

        setPerfil(resPerfil.data);
        setForm({
          nombre: resPerfil.data.nombre,
          biografia: resPerfil.data.biografia || '',
          disponibilidad: resPerfil.data.disponibilidad || '',
          portafolio: resPerfil.data.portafolio || '',
          habilidades: resPerfil.data.habilidades || [],
          intereses: resPerfil.data.intereses || []
        });

        setEntornos(resEntornos.data);
      } catch (err) {
        console.error(err);
      } finally {
        setCargando(false);
      }
    };
    cargarTodo();
  }, []);

  // 2. Guardar cambios
  const handleGuardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    try {
      const { data } = await api.put('/auth/perfil', form);
      setPerfil(data.usuario);
      setEditando(false);
    } catch (err) {
      alert('Error al guardar');
    } finally {
      setGuardando(false);
    }
  };

  // Helpers para agregar/quitar etiquetas
  const handleTag = (campo, valor) => {
    if (!valor.trim()) return;
    if (!form[campo].includes(valor.trim())) {
      setForm({ ...form, [campo]: [...form[campo], valor.trim()] });
    }
  };

  const removeTag = (campo, index) => {
    setForm({ ...form, [campo]: form[campo].filter((_, i) => i !== index) });
  };

  if (cargando) return <div className="flex justify-center py-32"><Loader2 className="animate-spin text-nexo-accent" size={32} /></div>;
  if (!perfil) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      
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
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-1">{perfil.nombre}</h1>
              <p className="text-nexo-muted flex items-center justify-center md:justify-start gap-2">
                <Mail size={16} /> {perfil.email}
              </p>
            </div>
            {!editando && (
              <button onClick={() => setEditando(true)} className="btn-secondary flex items-center gap-2">
                <Edit3 size={16} /> Editar Perfil
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* MODO EDICIÓN O VISTA */}
      {editando ? (
        <motion.form 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          onSubmit={handleGuardar} 
          className="card-nexo p-6 space-y-6"
        >
          <h2 className="text-xl font-bold mb-4">Editando mi perfil</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-nexo-muted mb-2 block">Nombre</label>
              <input type="text" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} className="input-base" />
            </div>
            <div>
              <label className="text-sm text-nexo-muted mb-2 block">Portafolio / LinkedIn (URL)</label>
              <input type="url" value={form.portafolio} onChange={e => setForm({...form, portafolio: e.target.value})} className="input-base" placeholder="https://..." />
            </div>
          </div>

          <div>
            <label className="text-sm text-nexo-muted mb-2 block">Biografía corta</label>
            <textarea value={form.biografia} onChange={e => setForm({...form, biografia: e.target.value})} className="input-base resize-none" rows={3} placeholder="Cuéntale a NEXO quién eres..." />
          </div>

          <div>
            <label className="text-sm text-nexo-muted mb-2 block">Disponibilidad</label>
              <input 
                type="text" 
                value={form.disponibilidad} 
                onChange={e => setForm({...form, disponibilidad: e.target.value})} 
                className="input-base" 
                placeholder="Ej: Medio tiempo, fines de semana..."
                onKeyDown={(e) => { if(e.key === 'Enter') e.preventDefault(); }} // <-- ESTO
              />
            </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
               <label className="text-sm text-nexo-muted mb-2 block">Habilidades</label>
               <div className="flex gap-2 mb-2">
                 <input type="text" id="input-habilidad" className="input-base flex-1" placeholder="Ej: React" onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); handleTag('habilidades', e.target.value); e.target.value = ''; } }} />
               </div>
               <div className="flex flex-wrap gap-2">
                 {form.habilidades.map((h, i) => (
                   <span key={i} className="text-xs px-2 py-1 bg-nexo-accent/10 text-nexo-accent border border-nexo-accent/20 rounded-md flex items-center gap-1">
                     {h} <button type="button" onClick={() => removeTag('habilidades', i)}><X size={12}/></button>
                   </span>
                 ))}
               </div>
             </div>
             
             <div>
               <label className="text-sm text-nexo-muted mb-2 block">Intereses</label>
               <div className="flex gap-2 mb-2">
                 <input type="text" id="input-interes" className="input-base flex-1" placeholder="Ej: IA, Educación" onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); handleTag('intereses', e.target.value); e.target.value = ''; } }} />
               </div>
               <div className="flex flex-wrap gap-2">
                 {form.intereses.map((h, i) => (
                   <span key={i} className="text-xs px-2 py-1 bg-nexo-accent-2/10 text-nexo-accent-2 border border-nexo-accent-2/20 rounded-md flex items-center gap-1">
                     {h} <button type="button" onClick={() => removeTag('intereses', i)}><X size={12}/></button>
                   </span>
                 ))}
               </div>
             </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-nexo-border">
            <button type="button" onClick={() => setEditando(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={guardando} className="btn-primary flex items-center gap-2">
              {guardando ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Guardar Cambios
            </button>
          </div>
        </motion.form>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Columna Izquierda: Info */}
          <div className="md:col-span-1 space-y-6">
            <div className="card-nexo p-6 space-y-4">
              <h3 className="text-sm uppercase tracking-wider text-nexo-muted mb-2">Sobre mí</h3>
              <p className="text-sm text-nexo-text/80 leading-relaxed">
                {perfil.biografia || 'Aún no has escrito tu biografía.'}
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

            <div className="card-nexo p-6">
              <h3 className="text-sm uppercase tracking-wider text-nexo-muted mb-3 flex items-center gap-2"><Star size={14}/> Intereses</h3>
              <div className="flex flex-wrap gap-2">
                {perfil.intereses?.length > 0 ? perfil.intereses.map((h, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 bg-white/5 border border-white/10 rounded-md text-nexo-text">{h}</span>
                )) : <span className="text-xs text-nexo-muted">Sin intereses registrados.</span>}
              </div>
            </div>
          </div>

          {/* Columna Derecha: Entornos */}
          <div className="md:col-span-2 space-y-6">
            
            <div className="card-nexo p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2"><User size={18} className="text-nexo-accent-2"/> Mis Entornos</h3>
                <Link to="/mis-equipos" className="text-xs text-nexo-accent hover:underline">Ver todos</Link>
              </div>
              {entornos.length === 0 ? (
                <p className="text-sm text-nexo-muted">No perteneces a ningún entorno todavía.</p>
              ) : (
                <div className="space-y-3">
                  {entornos.slice(0, 5).map(ent => (
                    <div key={ent._id} onClick={() => navigate(`/entorno/${ent._id}`)} className="p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{ent.nombre}</p>
                        <p className="text-xs text-nexo-muted">{ent.area}</p>
                      </div>
                      <ArrowRight size={16} className="text-nexo-muted" />
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </motion.div>
      )}
    </div>
  );
}