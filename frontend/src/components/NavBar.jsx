import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Compass, Sprout, Inbox, Users, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'text-nexo-accent bg-nexo-accent/10'
        : 'text-nexo-muted hover:text-nexo-text hover:bg-white/5'
    }`;

  return (
    <nav className="sticky top-0 z-50 bg-nexo-bg/80 backdrop-blur-md border-b border-nexo-border">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/explorar" className="text-2xl font-bold">
          <span className="bg-gradient-to-r from-nexo-accent via-nexo-accent-2 to-nexo-accent-3 bg-clip-text text-transparent">
            NEXO
          </span>
        </Link>

        {/* Links centrales */}
        <div className="hidden md:flex items-center gap-1">
          <NavLink to="/explorar" className={linkClass}>
            <Compass size={16} strokeWidth={1.8} />
            Explorar
          </NavLink>
          <NavLink to="/mis-iniciativas" className={linkClass}>
            <Sprout size={16} strokeWidth={1.8} />
            Mis iniciativas
          </NavLink>
          <NavLink to="/mis-solicitudes" className={linkClass}>
            <Inbox size={16} strokeWidth={1.8} />
            Solicitudes
          </NavLink>
          <NavLink to="/mis-equipos" className={linkClass}>
            <Users size={16} strokeWidth={1.8} />
            Equipos
          </NavLink>
        </div>

        {/* Usuario y logout */}
        <div className="flex items-center gap-3">
          <Link
            to="/perfil"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-nexo-accent to-nexo-accent-2 flex items-center justify-center text-white text-sm font-semibold">
              {usuario?.nombre?.charAt(0).toUpperCase() || '?'}
            </div>
            <span className="hidden sm:block text-sm text-nexo-text">
              {usuario?.nombre}
            </span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-nexo-muted hover:text-red-400 transition-colors px-3 py-1.5"
            title="Cerrar sesión"
          >
            <LogOut size={15} strokeWidth={1.8} />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>

      </div>
    </nav>
  );
}