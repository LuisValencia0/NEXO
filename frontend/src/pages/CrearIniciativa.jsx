import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axios';
import SelectorArea from '../components/SelectorArea.jsx';
import InputTags from '../components/InputTags.jsx';

export default function CrearIniciativa() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    area: 'tecnología',
    estado: 'abierta',
    colaboradoresRequeridos: [],
    habilidadesBuscadas: [],
    fechaCierre: '',
  });

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const actualizar = (campo, valor) => {
    setForm(prev => ({ ...prev, [campo]: valor }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones básicas
    if (!form.titulo.trim()) return setError('El título es obligatorio');
    if (!form.descripcion.trim()) return setError('La descripción es obligatoria');
    if (form.titulo.length > 100) return setError('El título no puede superar 100 caracteres');
    if (form.descripcion.length > 1000) return setError('La descripción no puede superar 1000 caracteres');

    setCargando(true);

    try {
      const payload = {
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim(),
        area: form.area,
        estado: form.estado,
        colaboradoresRequeridos: form.colaboradoresRequeridos,
        habilidadesBuscadas: form.habilidadesBuscadas,
      };

      // Solo enviar fechaCierre si está presente
      if (form.fechaCierre) {
        payload.fechaCierre = new Date(form.fechaCierre).toISOString();
      }

      const { data } = await api.post('/iniciativas', payload);

      // Redirigir a la iniciativa recién creada
      navigate(`/iniciativa/${data.iniciativa._id}`);

    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear la iniciativa');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">
          Sembrar una{' '}
          <span className="bg-gradient-to-r from-nexo-accent-3 via-nexo-accent to-nexo-accent-2 bg-clip-text text-transparent">
            idea
          </span>
        </h1>
        <p className="text-nexo-muted">
          Cuéntale a NEXO qué quieres construir y qué tipo de colaboradores buscas.
        </p>
      </motion.div>

      {/* Formulario */}
      <motion.form
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        className="card-nexo p-6 md:p-8 space-y-6"
      >

        {/* Título */}
        <div>
          <label className="block text-sm text-nexo-muted mb-2">
            Título de la iniciativa
          </label>
          <input
            type="text"
            value={form.titulo}
            onChange={(e) => actualizar('titulo', e.target.value)}
            placeholder="Ej: App de reciclaje comunitario"
            maxLength={100}
            className="input-base"
          />
          <p className="text-xs text-nexo-muted mt-1.5 text-right">
            {form.titulo.length}/100
          </p>
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm text-nexo-muted mb-2">
            Descripción
          </label>
          <textarea
            value={form.descripcion}
            onChange={(e) => actualizar('descripcion', e.target.value)}
            placeholder="¿Qué quieres construir? ¿Por qué es importante? ¿Qué tipo de personas necesitas?"
            rows={5}
            maxLength={1000}
            className="input-base resize-none"
          />
          <p className="text-xs text-nexo-muted mt-1.5 text-right">
            {form.descripcion.length}/1000
          </p>
        </div>

        {/* Área */}
        <SelectorArea value={form.area} onChange={(v) => actualizar('area', v)} />

        {/* Estado */}
        <div>
          <label className="block text-sm text-nexo-muted mb-2">
            Estado inicial
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => actualizar('estado', 'abierta')}
              className={`flex-1 p-3 rounded-lg border transition-all text-sm font-medium ${
                form.estado === 'abierta'
                  ? 'border-green-400/50 bg-green-400/10 text-green-400'
                  : 'border-nexo-border text-nexo-muted hover:border-green-400/30'
              }`}
            >
              🌱 Abierta a postulaciones
            </button>
            <button
              type="button"
              onClick={() => actualizar('estado', 'en_proceso')}
              className={`flex-1 p-3 rounded-lg border transition-all text-sm font-medium ${
                form.estado === 'en_proceso'
                  ? 'border-amber-400/50 bg-amber-400/10 text-amber-400'
                  : 'border-nexo-border text-nexo-muted hover:border-amber-400/30'
              }`}
            >
              🔨 En proceso
            </button>
          </div>
        </div>

        {/* Colaboradores requeridos */}
        <InputTags
          label="Colaboradores requeridos (opcional)"
          value={form.colaboradoresRequeridos}
          onChange={(v) => actualizar('colaboradoresRequeridos', v)}
          placeholder="Ej: Desarrollador móvil"
        />

        {/* Habilidades buscadas */}
        <InputTags
          label="Habilidades buscadas (opcional)"
          value={form.habilidadesBuscadas}
          onChange={(v) => actualizar('habilidadesBuscadas', v)}
          placeholder="Ej: React Native"
        />

        {/* Fecha de cierre */}
        <div>
          <label className="block text-sm text-nexo-muted mb-2">
            Fecha de cierre (opcional)
          </label>
          <input
            type="date"
            value={form.fechaCierre}
            onChange={(e) => actualizar('fechaCierre', e.target.value)}
            className="input-base"
          />
          <p className="text-xs text-nexo-muted mt-1.5">
            Solo informativa. Podrás cerrarla manualmente cuando quieras.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            {error}
          </div>
        )}

        {/* Botones */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-nexo-border">
          <button
            type="button"
            onClick={() => navigate('/explorar')}
            className="btn-secondary flex-1"
            disabled={cargando}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn-primary flex-1 disabled:opacity-50"
            disabled={cargando}
          >
            {cargando ? 'Sembrando...' : 'Sembrar iniciativa'}
          </button>
        </div>

      </motion.form>

    </div>
  );
}