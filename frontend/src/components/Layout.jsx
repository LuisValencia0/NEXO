import Navbar from './Navbar.jsx';
import NetworkBackground from './NetworkBackground.jsx';

export default function Layout({ children }) {
  return (
    <div className="relative min-h-screen bg-nexo-bg">
      {/* Fondo de conexiones más sutil para pantallas internas */}
      <NetworkBackground particleCount={40} speed={0.15} opacity={0.55} />

      <div className="relative z-10">
        <Navbar />
        <main className="max-w-7xl mx-auto px-6 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}