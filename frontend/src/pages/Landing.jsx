import NetworkBackground from '../components/NetworkBackground.jsx';
import NavbarPublica from '../components/NavbarPublica.jsx';
import Hero from '../components/Hero.jsx';
import QueEsNexo from '../components/QueEsNexo.jsx';
import CicloVisual from '../components/CicloVisual.jsx';
import CtaFinal from '../components/CtaFinal.jsx';

export default function Landing() {
  return (
    <div className="relative min-h-screen bg-nexo-bg overflow-hidden">
      <NetworkBackground />

      <div className="relative z-10">
        <NavbarPublica />
        <Hero />
        <QueEsNexo />
        <CicloVisual />
        <CtaFinal />
      </div>
    </div>
  );
}