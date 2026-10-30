import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Registro from './pages/Registro.jsx';
import Landing from './pages/Landing.jsx';
import Explorar from './pages/Explorar.jsx';
import CrearIniciativa from './pages/CrearIniciativa.jsx';
import RutaProtegida from './components/RutaProtegida.jsx';
import Layout from './components/Layout.jsx';
import MisEntornos from './pages/MisEntornos.jsx';
import Entorno from './pages/Entorno.jsx';
import Perfil from './pages/Perfil.jsx';
import MisPostulaciones from './pages/MisPostulaciones.jsx';

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
      <Route path="/perfil" element={<RutaProtegida><Layout><Perfil /></Layout></RutaProtegida>} />
      
      {/* Postulaciones (para el menú del navbar) */}
      <Route path="/mis-postulaciones" element={<RutaProtegida><Layout><MisPostulaciones /></Layout></RutaProtegida>} />

      {/* El corazón de la plataforma */}
      <Route path="/mis-equipos" element={<RutaProtegida><Layout><MisEntornos /></Layout></RutaProtegida>} />
      <Route path="/entorno/:id" element={<RutaProtegida><Layout><Entorno /></Layout></RutaProtegida>} />
    </Routes>
  ); 
}