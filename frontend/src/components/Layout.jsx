import Navbar from './Navbar.jsx';
import NetworkBackground from './NetworkBackground.jsx';
import Footer from './Footer.jsx'; // <-- NUEVO

export default function Layout({ children }) {
  return (
    <div className="relative h-screen bg-nexo-bg overflow-hidden flex flex-col">
      {/* Fondo de conexiones superior */}
      <NetworkBackground particleCount={40} speed={0.15} opacity={0.55} />

      {/* Contenido principal */}
      <div className="relative z-10 flex flex-col h-full">
        <Navbar />
        
        {/* Aquí está la magia: el main hace el scroll y empuja al Footer */}
        <main className="flex-1 overflow-y-auto w-full flex flex-col">
          <div className="max-w-7xl mx-auto px-6 py-8 flex-1">
            {children}
          </div>
          
          {/* El Footer aparece al final de todas las vistas */}
          <Footer />
        </main>
      </div>
    </div>
  );
}