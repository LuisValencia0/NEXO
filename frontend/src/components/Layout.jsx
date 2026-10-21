import Navbar from './Navbar.jsx';
import NetworkBackground from './NetworkBackground.jsx';

export default function Layout({ children }) {
  return (
    <div className="relative h-screen bg-nexo-bg overflow-hidden flex flex-col">
      {/* Fondo de conexiones */}
      <NetworkBackground particleCount={40} speed={0.15} opacity={0.55} />

      {/* Contenido principal */}
      <div className="relative z-10 flex flex-col h-full">
        <Navbar />
        
        {/* Aquí está la magia: overflow-y-auto permite el scroll interno */}
        <main className="flex-1 overflow-y-auto w-full">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}