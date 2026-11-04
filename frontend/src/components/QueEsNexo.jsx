import { motion } from 'framer-motion';
import { Target, Layers, Zap, Users, Code, Palette, GraduationCap, Rocket, Heart } from 'lucide-react';

const areas = [
  { icono: Code, nombre: 'Tecnología' },
  { icono: Palette, nombre: 'Cultura' },
  { icono: GraduationCap, nombre: 'Educación' },
  { icono: Rocket, nombre: 'Emprendimiento' },
  { icono: Heart, nombre: 'Social' },
];

export default function QueEsNexo() {
  return (
    <section className="relative py-24 overflow-hidden">
      
      {/* Marquee de Áreas (Carrusel Infinito) */}
      <div className="w-full border-y border-white/5 bg-white/[0.02] py-6 mb-24 flex overflow-hidden relative">
        <div className="absolute left-0 top-0 w-32 h-full bg-gradient-to-r from-nexo-bg to-transparent z-10" />
        <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-nexo-bg to-transparent z-10" />
        
        <motion.div
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="flex gap-16 whitespace-nowrap items-center"
        >
          {[...areas, ...areas, ...areas, ...areas].map((area, i) => {
            const Icono = area.icono;
            return (
              <div key={i} className="flex items-center gap-3 text-nexo-muted/50">
                <Icono size={20} />
                <span className="text-lg font-medium uppercase tracking-widest">{area.nombre}</span>
              </div>
            );
          })}
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">¿Por qué usar NEXO?</h2>
          <p className="text-xl text-nexo-muted max-w-2xl">Porque las mejores ideas no se construyen en solitario. Necesitas la infraestructura correcta.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2 relative p-10 rounded-[2rem] bg-gradient-to-br from-[#0a0c18] to-[#07080f] border border-white/5 overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-nexo-accent/10 blur-[80px] group-hover:bg-nexo-accent/20 transition-all duration-500" />
            <Target className="text-nexo-accent-3 mb-6" size={36} strokeWidth={1.5} />
            <h3 className="text-2xl font-bold mb-3 relative z-10">Habilidades exactas, no currículums</h3>
            <p className="text-nexo-muted text-lg max-w-md relative z-10">Filtra por lo que realmente necesitas: React, diseño UX, ilustración, redacción. Encuentra a la persona indicada sin leer interminables hojas de vida.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="relative p-8 rounded-[2rem] bg-[#0a0c18] border border-white/5 group"
          >
            <Layers className="text-nexo-accent mb-6" size={32} strokeWidth={1.5} />
            <h3 className="text-xl font-bold mb-3">Postulaciones transparentes</h3>
            <p className="text-nexo-muted">Tú decides quién entra. Revisa el perfil y el mensaje de cada postulante antes de aceptar.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="relative p-8 rounded-[2rem] bg-[#0a0c18] border border-white/5 group"
          >
            <Zap className="text-nexo-accent-2 mb-6" size={32} strokeWidth={1.5} />
            <h3 className="text-xl font-bold mb-3">Espacios de trabajo listos</h3>
            <p className="text-nexo-muted">Al aceptar a alguien, el sistema crea un entorno con chat en tiempo real automáticamente.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="md:col-span-2 relative p-10 rounded-[2rem] bg-gradient-to-bl from-[#0a0c18] to-[#07080f] border border-white/5 overflow-hidden group flex flex-col justify-between"
          >
             <div className="absolute bottom-0 left-0 w-64 h-64 bg-nexo-accent-2/10 blur-[80px] group-hover:bg-nexo-accent-2/20 transition-all duration-500" />
            <div>
              <Users className="text-white mb-6" size={36} strokeWidth={1.5} />
              <h3 className="text-2xl font-bold mb-3 relative z-10">Lidera o colabora</h3>
            </div>
            <p className="text-nexo-muted text-lg max-w-md relative z-10 mt-4">La plataforma se adapta a ti. Sé el líder que gestiona el equipo o el colaborador que aporta su talento a una gran idea.</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}