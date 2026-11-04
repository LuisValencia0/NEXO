import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Play } from 'lucide-react';

export default function CtaFinal() {
  const { estaAutenticado } = useAuth();

  return (
    <section className="relative py-32 px-6 overflow-hidden">
      <div className="max-w-5xl mx-auto relative z-10">
        
        <div className="p-12 md:p-20 rounded-[3rem] bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 text-center relative overflow-hidden">
          {/* Destello de fondo */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-nexo-accent/20 blur-[100px] rounded-full pointer-events-none" />

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-bold tracking-tight mb-6 relative z-10"
          >
            ¿Tienes una idea <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-nexo-accent-3 via-nexo-accent to-nexo-accent-2">
              que necesita un equipo?
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg text-nexo-muted mb-10 max-w-2xl mx-auto relative z-10"
          >
            No dejes que se quede en un cuaderno. Publícala en NEXO y encuentra a las personas que la harán despegar.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10"
          >
            {estaAutenticado ? (
              <Link to="/explorar" className="group flex items-center justify-center gap-2 px-8 py-4 bg-white text-black font-bold rounded-full transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                Explorar la red <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <Link to="/registro" className="group flex items-center justify-center gap-2 px-8 py-4 bg-white text-black font-bold rounded-full transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                Unirse a NEXO <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </motion.div>
        </div>

      </div>
    </section>
  );
}