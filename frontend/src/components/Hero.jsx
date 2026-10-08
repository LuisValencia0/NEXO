import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import HexagonoAnimado from './HexagonoAnimado.jsx';

export default function Hero() {
  const { estaAutenticado } = useAuth();

  return (
    <section className="relative min-h-screen flex items-center justify-center px-6 pt-24">
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-16 items-center">

        {/* Hexágono animado */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex justify-center md:order-2"
        >
          <HexagonoAnimado size={420} />
        </motion.div>

        {/* Texto */}
        <div className="md:order-1 text-center md:text-left">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-6xl font-bold leading-tight mb-6"
          >
            Donde las ideas{' '}
            <span className="bg-gradient-to-r from-nexo-accent-3 via-nexo-accent to-nexo-accent-2 bg-clip-text text-transparent">
              encuentran
            </span>{' '}
            a quienes las hacen realidad
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg text-nexo-muted mb-10 max-w-xl mx-auto md:mx-0"
          >
            NEXO conecta personas con iniciativas. Publica lo que quieres construir, encuentra colaboradores con las capacidades correctas, y formen juntos un equipo con su propio espacio de trabajo.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
          >
            {estaAutenticado ? (
              <Link to="/explorar" className="btn-primary">
                Explorar iniciativas
              </Link>
            ) : (
              <>
                <Link to="/registro" className="btn-primary">
                  Crear cuenta
                </Link>
                <Link to="/login" className="btn-secondary">
                  Iniciar sesión
                </Link>
              </>
            )}
          </motion.div>
        </div>

      </div>
    </section>
  );
}