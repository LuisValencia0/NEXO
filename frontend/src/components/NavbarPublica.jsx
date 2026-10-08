import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function NavbarPublica() {
  const { estaAutenticado } = useAuth();

  return (
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7 }}
      className="fixed top-0 left-0 right-0 z-50 bg-nexo-bg/70 backdrop-blur-md border-b border-nexo-border/50"
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-nexo-accent-3 to-nexo-accent-2 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-nexo-bg" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-nexo-accent-3 via-nexo-accent to-nexo-accent-2 bg-clip-text text-transparent">
            NEXO
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {estaAutenticado ? (
            <Link to="/explorar" className="btn-primary text-sm">
              Ir a explorar
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm text-nexo-muted hover:text-nexo-text transition-colors px-4 py-2"
              >
                Iniciar sesión
              </Link>
              <Link to="/registro" className="btn-primary text-sm">
                Crear cuenta
              </Link>
            </>
          )}
        </div>

      </div>
    </motion.nav>
  );
}