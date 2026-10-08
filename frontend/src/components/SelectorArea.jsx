import { Code2, Palette, GraduationCap, Rocket, Users, Sparkles } from 'lucide-react';

const areas = [
  { valor: 'tecnología',     label: 'Tecnología',     Icono: Code2 },
  { valor: 'cultura',        label: 'Cultura',        Icono: Palette },
  { valor: 'educación',      label: 'Educación',      Icono: GraduationCap },
  { valor: 'emprendimiento', label: 'Emprendimiento', Icono: Rocket },
  { valor: 'social',         label: 'Social',         Icono: Users },
  { valor: 'otro',           label: 'Otro',           Icono: Sparkles },
];

export default function SelectorArea({ value, onChange }) {
  return (
    <div>
      <label className="block text-sm text-nexo-muted mb-2">Área</label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {areas.map(({ valor, label, Icono }) => {
          const activo = value === valor;
          return (
            <button
              key={valor}
              type="button"
              onClick={() => onChange(valor)}
              className={`p-3 rounded-lg border transition-all duration-200 text-left flex items-center gap-3 group ${
                activo
                  ? 'border-nexo-accent bg-nexo-accent/10 text-nexo-text'
                  : 'border-nexo-border text-nexo-muted hover:border-nexo-accent/40 hover:text-nexo-text'
              }`}
            >
              <Icono
                size={20}
                strokeWidth={1.8}
                className={`flex-shrink-0 transition-colors ${
                  activo
                    ? 'text-nexo-accent-3'
                    : 'text-nexo-muted group-hover:text-nexo-accent-3'
                }`}
              />
              <span className="text-sm font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}