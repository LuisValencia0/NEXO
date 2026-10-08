const areas = [
    { valor: 'tecnología',    label: 'Tecnología',     icono: '💻' },
    { valor: 'cultura',       label: 'Cultura',        icono: '🎭' },
    { valor: 'educación',     label: 'Educación',      icono: '📚' },
    { valor: 'emprendimiento',label: 'Emprendimiento', icono: '🚀' },
    { valor: 'social',        label: 'Social',         icono: '🤝' },
    { valor: 'otro',          label: 'Otro',           icono: '✨' },
  ];
  
  export default function SelectorArea({ value, onChange }) {
    return (
      <div>
        <label className="block text-sm text-nexo-muted mb-2">Área</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {areas.map(area => (
            <button
              key={area.valor}
              type="button"
              onClick={() => onChange(area.valor)}
              className={`p-3 rounded-lg border transition-all duration-200 text-left flex items-center gap-3 ${
                value === area.valor
                  ? 'border-nexo-accent bg-nexo-accent/10 text-nexo-text'
                  : 'border-nexo-border text-nexo-muted hover:border-nexo-accent/40 hover:text-nexo-text'
              }`}
            >
              <span className="text-xl">{area.icono}</span>
              <span className="text-sm font-medium">{area.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }