import { motion } from 'framer-motion';

const nodos = [
  { label: 'Idea' },
  { label: 'Iniciativa' },
  { label: 'Postulación' },
  { label: 'Equipo' },
  { label: 'Entorno' },
];

export default function CicloVisual() {
  return (
    <section className="relative py-32 px-6">
      <div className="max-w-5xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            El ciclo completo
          </h2>
          <p className="text-nexo-muted text-lg max-w-2xl mx-auto">
            Cada paso deja huella. Cada conexión construye algo real.
          </p>
        </motion.div>

        <div className="relative">
          {/* Línea horizontal */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 1.8, ease: 'easeInOut' }}
            className="absolute top-6 left-0 right-0 h-0.5 origin-left"
            style={{
              background: 'linear-gradient(90deg, #58e0ff, #6d8bff, #b06dff)',
            }}
          />

          {/* Nodos */}
          <div className="relative grid grid-cols-5 gap-2">
            {nodos.map((nodo, i) => (
              <motion.div
                key={nodo.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.2 }}
                className="flex flex-col items-center"
              >
                <div className="w-12 h-12 rounded-full bg-nexo-bg border-2 border-nexo-accent flex items-center justify-center relative z-10">
                  <div className="w-3 h-3 rounded-full bg-nexo-accent-3 animate-pulse" />
                </div>
                <span className="mt-4 text-sm text-nexo-muted text-center">
                  {nodo.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}