import NetworkBackground from '../components/NetworkBackground.jsx';
import NavbarPublica from '../components/NavbarPublica.jsx';
import Hero from '../components/Hero.jsx';
import QueEsNexo from '../components/QueEsNexo.jsx';
import CtaFinal from '../components/CtaFinal.jsx';
import Footer from '../components/Footer.jsx';

export default function Landing() {
  return (
    <div className="relative min-h-screen bg-nexo-bg overflow-hidden">
      <NetworkBackground />

      <div className="relative z-10">
        <NavbarPublica />
        <Hero />
        <QueEsNexo />
        <CtaFinal />
        <Footer /> 
      </div>
     
    </div>
  );
}