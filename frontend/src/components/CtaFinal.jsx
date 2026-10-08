import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function CtaFinal() {
  const { estaAutenticado } = useAuth();

  return (
    <section className="relative py-32 px-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.9 }}
        className="max-w-3xl mx-auto text-center"
      >
        <h2 className="text-3xl md:text-5xl font-bold mb-8 leading-tight">
          ¿Listo para que tu idea{' '}
          <span className="bg-gradient-to-r from-nexo-accent-3 via-nexo-accent to-nexo-accent-2 bg-clip-text text-transparent">
            deje de estar sola
          </span>
          ?
        </h2>

        <p className="text-nexo-muted text-lg mb-10 max-w-xl mx-auto">
          Crea tu cuenta, publica tu primera iniciativa y empieza a encontrar personas que la hagan realidad.
        </p>

        {estaAutenticado ? (
          <Link to="/explorar" className="btn-primary text-lg px-8 py-3">
            Ir a explorar
          </Link>
        ) : (
          <Link to="/registro" className="btn-primary text-lg px-8 py-3">
            Crear mi cuenta
          </Link>
        )}
      </motion.div>
    </section>
  );
}