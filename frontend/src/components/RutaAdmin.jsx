import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function RutaAdmin({ children }) {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return (
      <div className="min-h-screen bg-[#07080f] flex justify-center items-center">
        <Loader2 className="animate-spin text-nexo-accent" size={40} />
      </div>
    );
  }

  // Si no está logueado o no es admin, lo mandamos a explorar
  if (!usuario || usuario.rol !== 'admin') {
    return <Navigate to="/explorar" replace />;
  }

  return children;
}