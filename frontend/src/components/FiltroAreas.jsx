const areas = [
    { valor: 'todas', label: 'Todas' },
    { valor: 'tecnología', label: 'Tecnología' },
    { valor: 'cultura', label: 'Cultura' },
    { valor: 'educación', label: 'Educación' },
    { valor: 'emprendimiento', label: 'Emprendimiento' },
    { valor: 'social', label: 'Social' },
    { valor: 'otro', label: 'Otro' },
  ];
  
  export default function FiltroAreas({ activa, onChange }) {
    return (
      <div className="flex flex-wrap gap-2">
        {areas.map(area => (
          <button
            key={area.valor}
            onClick={() => onChange(area.valor)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activa === area.valor
                ? 'bg-gradient-to-r from-nexo-accent to-nexo-accent-2 text-white shadow-[0_0_20px_rgba(109,139,255,0.4)]'
                : 'text-nexo-muted hover:text-nexo-text border border-nexo-border hover:border-nexo-accent/40'
            }`}
          >
            {area.label}
          </button>
        ))}
      </div>
    );
  }