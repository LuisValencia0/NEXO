import { useState } from 'react';

export default function InputTags({ label, value = [], onChange, placeholder = 'Escribe y presiona Enter' }) {
  const [input, setInput] = useState('');

  const agregar = () => {
    const texto = input.trim();
    if (texto && !value.includes(texto)) {
      onChange([...value, texto]);
      setInput('');
    }
  };

  const eliminar = (i) => {
    onChange(value.filter((_, idx) => idx !== i));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      agregar();
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      eliminar(value.length - 1);
    }
  };

  return (
    <div>
      {label && (
        <label className="block text-sm text-nexo-muted mb-2">{label}</label>
      )}

      <div className="input-base flex flex-wrap gap-2 min-h-[46px] items-center">
        {value.map((tag, i) => (
          <span
            key={i}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-nexo-accent/15 text-nexo-accent-3 border border-nexo-accent/30"
          >
            {tag}
            <button
              type="button"
              onClick={() => eliminar(i)}
              className="text-nexo-accent-3/60 hover:text-nexo-accent-3 transition-colors"
              aria-label={`Eliminar ${tag}`}
            >
              ✕
            </button>
          </span>
        ))}

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={agregar}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-nexo-text placeholder:text-nexo-muted/60"
        />
      </div>

      <p className="text-xs text-nexo-muted mt-1.5">
        Presiona Enter o coma para agregar
      </p>
    </div>
  );
}