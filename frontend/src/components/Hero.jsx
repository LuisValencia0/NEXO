import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import HexagonoAnimado from './HexagonoAnimado.jsx';
import { ArrowRight, Code2, Palette, Rocket, Mic2, MonitorPlay, PenTool, Megaphone, Camera } from 'lucide-react';

export default function Hero() {
  const { estaAutenticado } = useAuth();
  const containerRef = useRef(null);

  // Movimiento del mouse para el efecto 3D
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 30, stiffness: 100, mass: 1 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothY, [-0.5, 0.5], ['15deg', '-15deg']);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], ['-15deg', '15deg']);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <section 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-12 px-6 overflow-hidden perspective-[1500px]"
    >
      {/* Resplandor central */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-nexo-accent/10 blur-[150px] rounded-full pointer-events-none z-0" />

      {/* ESCENA 3D CENTRAL */}
      <div className="relative w-full max-w-5xl flex-1 flex items-center justify-center z-10" style={{ transformStyle: 'preserve-3d' }}>
        
        <motion.div
          style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
          className="relative w-full max-w-2xl aspect-square flex items-center justify-center"
        >
          {/* Anillos orbitales decorativos */}
          <div className="absolute inset-0 border border-white/5 rounded-full scale-75 animate-[spin_60s_linear_infinite]" style={{ transform: 'translateZ(-50px)' }} />
          <div className="absolute inset-0 border border-white/5 rounded-full scale-110 animate-[spin_40s_reverse_linear_infinite]" style={{ transform: 'translateZ(-100px)' }} />
          
          {/* HEXÁGONO PRINCIPAL */}
          <motion.div 
            className="relative z-20 pointer-events-none"
            style={{ transform: 'translateZ(50px)' }} // Flota por encima
          >
            <HexagonoAnimado size={480} />
          </motion.div>

          {/* TARJETAS FLOTANTES ORBITANDO */}
          
          {/* 1. Tecnología (Arriba Izquierda) */}
          <motion.div 
            animate={{ y: [0, -15, 0] }} 
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[10%] left-[10%] z-30 bg-[#0a0c18]/80 backdrop-blur-md border border-nexo-accent/30 p-3 rounded-xl shadow-2xl flex items-center gap-3"
            style={{ transform: 'translateZ(80px)' }}
          >
            <div className="bg-nexo-accent/20 p-2 rounded-lg"><Code2 size={16} className="text-nexo-accent" /></div>
            <div className="text-xs font-bold text-white">Dev</div>
          </motion.div>

          {/* 2. Diseño (Arriba Derecha) */}
          <motion.div 
            animate={{ y: [0, 15, 0] }} 
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-[15%] right-[15%] z-30 bg-[#0a0c18]/80 backdrop-blur-md border border-nexo-accent-2/30 p-3 rounded-xl shadow-2xl flex items-center gap-3"
            style={{ transform: 'translateZ(120px)' }}
          >
            <div className="bg-nexo-accent-2/20 p-2 rounded-lg"><Palette size={16} className="text-nexo-accent-2" /></div>
            <div className="text-xs font-bold text-white">Diseño UX</div>
          </motion.div>

          {/* 3. Startups (Abajo Izquierda) */}
          <motion.div 
            animate={{ x: [0, -15, 0] }} 
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-[20%] left-[5%] z-30 bg-[#0a0c18]/80 backdrop-blur-md border border-orange-400/30 p-3 rounded-xl shadow-2xl flex items-center gap-3"
            style={{ transform: 'translateZ(60px)' }}
          >
            <div className="bg-orange-400/20 p-2 rounded-lg"><Rocket size={16} className="text-orange-400" /></div>
            <div className="text-xs font-bold text-white">Startups</div>
          </motion.div>

          {/* 4. Música (Abajo Derecha) */}
          <motion.div 
            animate={{ x: [0, 15, 0] }} 
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute bottom-[15%] right-[10%] z-30 bg-[#0a0c18]/80 backdrop-blur-md border border-green-400/30 p-3 rounded-xl shadow-2xl flex items-center gap-3"
            style={{ transform: 'translateZ(140px)' }}
          >
            <div className="bg-green-400/20 p-2 rounded-lg"><Mic2 size={16} className="text-green-400" /></div>
            <div className="text-xs font-bold text-white">Música</div>
          </motion.div>

          {/* 5. Media (Centro Derecha) */}
          <motion.div 
            animate={{ y: [0, -10, 0] }} 
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            className="absolute top-[50%] right-[-5%] z-30 bg-[#0a0c18]/80 backdrop-blur-md border border-purple-400/30 p-3 rounded-xl shadow-2xl flex items-center gap-3"
            style={{ transform: 'translateZ(100px)' }}
          >
            <div className="bg-purple-400/20 p-2 rounded-lg"><MonitorPlay size={16} className="text-purple-400" /></div>
            <div className="text-xs font-bold text-white">Media</div>
          </motion.div>

          {/* --- NUEVAS HABILIDADES --- */}

          {/* 6. Redacción (Centro Izquierda) */}
          <motion.div 
            animate={{ y: [0, 12, 0] }} 
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
            className="absolute top-[45%] left-[-5%] z-30 bg-[#0a0c18]/80 backdrop-blur-md border border-pink-400/30 p-3 rounded-xl shadow-2xl flex items-center gap-3"
            style={{ transform: 'translateZ(90px)' }}
          >
            <div className="bg-pink-400/20 p-2 rounded-lg"><PenTool size={16} className="text-pink-400" /></div>
            <div className="text-xs font-bold text-white">Redacción</div>
          </motion.div>

          {/* 7. Fotografía (Arriba Centro) */}
          <motion.div 
            animate={{ y: [0, -12, 0] }} 
            transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
            className="absolute top-[-5%] left-[45%] z-30 bg-[#0a0c18]/80 backdrop-blur-md border border-blue-400/30 p-3 rounded-xl shadow-2xl flex items-center gap-3"
            style={{ transform: 'translateZ(110px)' }}
          >
            <div className="bg-blue-400/20 p-2 rounded-lg"><Camera size={16} className="text-blue-400" /></div>
            <div className="text-xs font-bold text-white">Fotografía</div>
          </motion.div>

          {/* 8. Marketing (Abajo Centro) */}
          <motion.div 
            animate={{ y: [0, 10, 0] }} 
            transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
            className="absolute bottom-[-5%] left-[45%] z-30 bg-[#0a0c18]/80 backdrop-blur-md border border-yellow-400/30 p-3 rounded-xl shadow-2xl flex items-center gap-3"
            style={{ transform: 'translateZ(130px)' }}
          >
            <div className="bg-yellow-400/20 p-2 rounded-lg"><Megaphone size={16} className="text-yellow-400" /></div>
            <div className="text-xs font-bold text-white">Marketing</div>
          </motion.div>

        </motion.div>
      </div>

      {/* TEXTO Y BOTONES EN LA PARTE INFERIOR */}
      <div className="relative z-20 w-full max-w-4xl mx-auto text-center mt-12 flex flex-col items-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-3xl md:text-5xl font-bold tracking-tight mb-4"
        >
          El núcleo de la colaboración.
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-nexo-muted max-w-lg mb-8"
        >
          Conecta habilidades, ideas y personas en un solo ecosistema. Crea equipos imparables y lleva tus proyectos al siguiente nivel.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          {estaAutenticado ? (
            <Link to="/explorar" className="group flex items-center justify-center gap-2 px-8 py-4 bg-white text-black font-bold rounded-full transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]">
              Explorar red <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : (
            <>
              <Link to="/registro" className="group flex items-center justify-center gap-2 px-8 py-4 bg-white text-black font-bold rounded-full transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                Empezar ahora <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/login" className="flex items-center justify-center px-8 py-4 bg-white/5 border border-white/10 backdrop-blur-md text-white font-bold rounded-full hover:bg-white/10 transition-colors">
                Ya tengo cuenta
              </Link>
            </>
          )}
        </motion.div>
      </div>

    </section>
  );
}