import { Link } from 'react-router-dom';
import { 
  Code, MessageCircle, Camera, Briefcase, 
  Mail, ArrowRight, Sparkles 
} from 'lucide-react';
import GalaxiaFondo from './GalaxiaFondo';

export default function Footer() {
  return (
    // Eliminamos "border-t" y "bg-[#07080f]" para que todo se mezcle
    <footer className="relative mt-20 overflow-hidden pt-24 pb-8">
      
      <GalaxiaFondo />

      <div className="relative z-20 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="text-3xl font-bold">
              <span className="bg-gradient-to-r from-nexo-accent via-nexo-accent-2 to-nexo-accent-3 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(109,139,255,0.5)]">
                NEXO
              </span>
            </Link>
            <p className="text-sm text-nexo-muted leading-relaxed">
              Donde las ideas encuentran a quienes las hacen realidad. Conectamos iniciativas con el talento correcto.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a href="#" className="text-nexo-muted hover:text-nexo-accent transition-colors"><MessageCircle size={20} /></a>
              <a href="#" className="text-nexo-muted hover:text-nexo-accent transition-colors"><Camera size={20} /></a>
              <a href="#" className="text-nexo-muted hover:text-nexo-accent transition-colors"><Briefcase size={20} /></a>
              <a href="#" className="text-nexo-muted hover:text-nexo-accent transition-colors"><Code size={20} /></a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Plataforma</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/explorar" className="text-sm text-nexo-muted hover:text-white transition-colors flex items-center gap-2 group">
                  <ArrowRight size={12} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  Explorar iniciativas
                </Link>
              </li>
              <li>
                <Link to="/mis-equipos" className="text-sm text-nexo-muted hover:text-white transition-colors flex items-center gap-2 group">
                  <ArrowRight size={12} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  Mis Entornos
                </Link>
              </li>
              <li>
                <Link to="/crear-iniciativa" className="text-sm text-nexo-muted hover:text-white transition-colors flex items-center gap-2 group">
                  <ArrowRight size={12} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  Sembrar una idea
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Proyecto</h4>
            <ul className="space-y-2">
              <li className="text-sm text-nexo-muted">SENA ADSO</li>
              <li className="text-sm text-nexo-muted">Ficha 3229944</li>
              <li className="text-sm text-nexo-muted flex items-center gap-1">
                <Sparkles size={12} className="text-nexo-accent" /> Fase 5 React
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Contacto</h4>
            <div className="space-y-3">
              <p className="text-sm text-nexo-muted flex items-center gap-2">
                <Mail size={16} /> info@nexo.co
              </p>
              <p className="text-sm text-nexo-muted">300 000 0000</p>
              <button className="mt-2 text-sm font-medium text-nexo-bg bg-white hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors">
                Escríbenos
              </button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
          <p className="text-xs text-nexo-muted">
            © 2026 NEXO. Proyecto formativo SENA ADSO · Tecnología con asesoría real.
          </p>
          <div className="flex gap-6 text-xs text-nexo-muted">
            <a href="#" className="hover:text-white transition-colors">Términos</a>
            <a href="#" className="hover:text-white transition-colors">Privacidad</a>
          </div>
        </div>
      </div>
    </footer>
  );
}