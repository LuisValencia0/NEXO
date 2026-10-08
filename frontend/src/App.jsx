import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Registro from './pages/Registro.jsx';
import Landing from './pages/Landing.jsx';
import Explorar from './pages/Explorar.jsx';
import CrearIniciativa from './pages/CrearIniciativa.jsx';
import RutaProtegida from './components/RutaProtegida.jsx';
import Layout from './components/Layout.jsx';


function Placeholder({ titulo }) {
  return (
    <div className="text-center py-20">
      <h2 className="text-3xl font-bold mb-3">{titulo}</h2>
      <p className="text-nexo-muted">En construcción...</p>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Públicas */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />

      {/* Protegidas */}
      <Route path="/explorar" element={<RutaProtegida><Layout><Explorar /></Layout></RutaProtegida>} />
      <Route path="/crear-iniciativa" element={<RutaProtegida><Layout><CrearIniciativa /></Layout></RutaProtegida>} />
      <Route path="/mis-iniciativas" element={<RutaProtegida><Layout><Placeholder titulo="Mis iniciativas" /></Layout></RutaProtegida>} />
      <Route path="/mis-solicitudes" element={<RutaProtegida><Layout><Placeholder titulo="Solicitudes" /></Layout></RutaProtegida>} />
      <Route path="/mis-equipos" element={<RutaProtegida><Layout><Placeholder titulo="Mis equipos" /></Layout></RutaProtegida>} />
      <Route path="/perfil" element={<RutaProtegida><Layout><Placeholder titulo="Mi perfil" /></Layout></RutaProtegida>} />
    </Routes>
  );
}