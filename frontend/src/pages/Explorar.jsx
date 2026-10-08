import { Sprout, Plus } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/axios';
import TarjetaIniciativa from '../components/TarjetaIniciativa.jsx';
import ModalIniciativa from '../components/ModalIniciativa.jsx';
import FiltroAreas from '../components/FiltroAreas.jsx';

export default function Explorar() {
  const [iniciativas, setIniciativas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [areaActiva, setAreaActiva] = useState('todas');
  const [seleccionada, setSeleccionada] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const { data } = await api.get('/iniciativas');
        const visibles = data.filter(i => i.estado !== 'eliminada');
        setIniciativas(visibles);
      } catch (err) {
        setError(err.response?.data?.error || 'Error al cargar iniciativas');
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, []);

  const filtradas = useMemo(() => {
    if (areaActiva === 'todas') return iniciativas;
    return iniciativas.filter(i => i.area === areaActiva);
  }, [iniciativas, areaActiva]);

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Explorar{' '}
            <span className="bg-gradient-to-r from-nexo-accent-3 via-nexo-accent to-nexo-accent-2 bg-clip-text text-transparent">
              iniciativas
            </span>
          </h1>
          <p className="text-nexo-muted">
            Descubre proyectos y encuentra tu próximo equipo.
          </p>
        </div>

        <Link to="/crear-iniciativa" className="btn-primary self-start md:self-auto flex items-center gap-2">
          <Plus size={16} strokeWidth={2.2} />
          Crear iniciativa
        </Link>
      </div>

      {/* Filtros */}
      <FiltroAreas activa={areaActiva} onChange={setAreaActiva} />

      {/* Estados */}
      {cargando && (
        <div className="text-center py-20 text-nexo-muted">
          Cargando iniciativas...
        </div>
      )}

      {error && (
        <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          {error}
        </div>
      )}

      {!cargando && !error && filtradas.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <div className="flex justify-center mb-6">
            <Sprout
              size={64}
              strokeWidth={1.2}
              className="text-nexo-accent-3 opacity-60"
            />
          </div>
          <h3 className="text-xl font-semibold mb-2">
            {areaActiva === 'todas'
              ? 'Aún no hay iniciativas'
              : `No hay iniciativas de ${areaActiva}`}
          </h3>
          <p className="text-nexo-muted mb-6">
            {areaActiva === 'todas'
              ? 'Sé el primero en sembrar una idea.'
              : 'Prueba con otra área o crea la primera.'}
          </p>
          <Link to="/crear-iniciativa" className="btn-primary inline-block">
            Crear la primera iniciativa
          </Link>
        </motion.div>
      )}

      {!cargando && !error && filtradas.length > 0 && (
        <>
          <p className="text-sm text-nexo-muted">
            {filtradas.length} {filtradas.length === 1 ? 'iniciativa' : 'iniciativas'}
            {areaActiva !== 'todas' && ` en ${areaActiva}`}
          </p>

          {/* Tablero de corcho */}
          <div className="tablero-corcho p-6 md:p-8 rounded-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtradas.map((ini, i) => (
                <TarjetaIniciativa
                  key={ini._id}
                  iniciativa={ini}
                  index={i}
                  onClick={setSeleccionada}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {/* Modal de detalle */}
      <ModalIniciativa
        iniciativa={seleccionada}
        onClose={() => setSeleccionada(null)}
      />

    </div>
  );
}