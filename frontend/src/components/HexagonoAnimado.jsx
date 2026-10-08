import { motion } from 'framer-motion';

export default function HexagonoAnimado({ size = 420 }) {
  const center = { x: 200, y: 200 };

  // Radio del hexágono principal
  const hexRadius = 90;

  // Los 6 vértices del hexágono
  const vertices = Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    return {
      x: center.x + hexRadius * Math.cos(angle),
      y: center.y + hexRadius * Math.sin(angle),
      angle,
    };
  });

  // Conexiones que salen del hexágono hacia afuera, ramificándose
  const outerConnections = [];
  vertices.forEach((v, i) => {
        // 3 direcciones: izquierda, centro, derecha
    // Abanico más abierto. El centro va más largo, los lados un poco más cortos
    const directions = [
      { offset: -0.6, length: 70, nodeSize: 2.5 },   // lateral izquierdo (más abierto)
      { offset: 0,    length: 95, nodeSize: 3 },     // central (más largo)
      { offset: 0.6,  length: 70, nodeSize: 2.5 },   // lateral derecho (más abierto)
    ];

    directions.forEach((dir, j) => {
      const outAngle = v.angle + dir.offset;
      const endX = v.x + dir.length * Math.cos(outAngle);
      const endY = v.y + dir.length * Math.sin(outAngle);

      // Extensión tenue que sale más allá de cada nodo
      const extLength = 45;
      const extEndX = endX + extLength * Math.cos(outAngle);
      const extEndY = endY + extLength * Math.sin(outAngle);

      outerConnections.push({
        start: v,
        end: { x: endX, y: endY },
        extension: { x: extEndX, y: extEndY },
        nodeSize: dir.nodeSize,
        delay: 2.8 + i * 0.1 + j * 0.05,
      });
    });
  });

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Glow de fondo grande */}
      <div
        className="absolute inset-0 rounded-full blur-3xl opacity-50"
        style={{
          background:
            'radial-gradient(circle, rgba(109, 139, 255, 0.5) 0%, rgba(176, 109, 255, 0.2) 40%, transparent 70%)',
        }}
      />

      <svg viewBox="0 0 400 400" className="relative w-full h-full overflow-visible">
        <defs>
          <linearGradient id="hexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#58e0ff" />
            <stop offset="50%" stopColor="#6d8bff" />
            <stop offset="100%" stopColor="#b06dff" />
          </linearGradient>

          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#58e0ff" stopOpacity="1" />
            <stop offset="50%" stopColor="#6d8bff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#b06dff" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="ringGrad" cx="50%" cy="50%" r="50%">
            <stop offset="70%" stopColor="#58e0ff" stopOpacity="0" />
            <stop offset="85%" stopColor="#58e0ff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#58e0ff" stopOpacity="0" />
          </radialGradient>

          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="glowStrong" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* === CONEXIONES EXTERNAS (salen del hexágono) === */}
        {outerConnections.map((conn, i) => (
          <g key={`outer-${i}`}>
            {/* Línea principal (más visible) */}
            <motion.line
              x1={conn.start.x}
              y1={conn.start.y}
              x2={conn.end.x}
              y2={conn.end.y}
              stroke="rgba(88, 224, 255, 0.5)"
              strokeWidth="0.8"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.7 }}
              transition={{ duration: 0.5, delay: conn.delay, ease: 'easeOut' }}
            />

            {/* Extensión (más visible) */}
            <motion.line
              x1={conn.end.x}
              y1={conn.end.y}
              x2={conn.extension.x}
              y2={conn.extension.y}
              stroke="rgba(88, 224, 255, 0.5)"
              strokeWidth="0.7"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.65 }}
              transition={{ duration: 0.4, delay: conn.delay + 0.15, ease: 'easeOut' }}
            />

            {/* Nodo principal */}
            <motion.circle
              cx={conn.end.x}
              cy={conn.end.y}
              r={conn.nodeSize}
              fill="#58e0ff"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.9 }}
              transition={{ duration: 0.3, delay: conn.delay + 0.3 }}
            />

            {/* Punto al final de la extensión (más visible) */}
            <motion.circle
              cx={conn.extension.x}
              cy={conn.extension.y}
              r={conn.nodeSize * 0.85}
              fill="#58e0ff"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.75 }}
              transition={{ duration: 0.3, delay: conn.delay + 0.5 }}
            />
            {/* Anillo pulsante tenue en el punto final */}
            <motion.circle
              cx={conn.extension.x}
              cy={conn.extension.y}
              r={conn.nodeSize * 0.85}
              fill="none"
              stroke="#58e0ff"
              strokeWidth="0.1"
              animate={{
                r: [conn.nodeSize * 0.85, conn.nodeSize * 2, conn.nodeSize * 0.85],
                opacity: [0.4, 0, 0.4],
              }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                delay: i * 0.2 + 0.3,
                ease: 'easeOut',
              }}
            />

            {/* Anillo pulsante del nodo principal */}
            <motion.circle
              cx={conn.end.x}
              cy={conn.end.y}
              r={conn.nodeSize}
              fill="none"
              stroke="#58e0ff"
              strokeWidth="5"
              animate={{
                r: [conn.nodeSize, conn.nodeSize * 3, conn.nodeSize],
                opacity: [0.6, 0, 0.6],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: i * 0.15,
                ease: 'easeOut',
              }}
            />
          </g>
        ))}

        {/* === ANILLOS CONCÉNTRICOS AL NÚCLEO === */}
        {/* Anillo 1 - interior */}
        <motion.circle
          cx={center.x}
          cy={center.y}
          r="30"
          fill="none"
          stroke="rgba(88, 224, 255, 0.4)"
          strokeWidth="0.6"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        />
        {/* Anillo 2 - medio */}
        <motion.circle
          cx={center.x}
          cy={center.y}
          r="50"
          fill="none"
          stroke="rgba(109, 139, 255, 0.35)"
          strokeWidth="0.6"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        />
        {/* Anillo 3 - externo, punteado */}
        <motion.circle
          cx={center.x}
          cy={center.y}
          r="70"
          fill="none"
          stroke="rgba(176, 109, 255, 0.4)"
          strokeWidth="0.6"
          strokeDasharray="2 4"
          initial={{ scale: 0, opacity: 0, rotate: 0 }}
          animate={{ scale: 1, opacity: 0.8, rotate: 360 }}
          transition={{
            scale: { duration: 0.8, delay: 0.6 },
            opacity: { duration: 0.8, delay: 0.6 },
            rotate: { duration: 60, repeat: Infinity, ease: 'linear' },
          }}
          style={{ transformOrigin: `${center.x}px ${center.y}px` }}
        />

        {/* === ANILLOS EXPANSIVOS === */}
        {[0, 1, 2].map(i => (
          <motion.circle
            key={`pulse-${i}`}
            cx={center.x}
            cy={center.y}
            r="20"
            fill="none"
            stroke="#58e0ff"
            strokeWidth="0.5"
            initial={{ r: 20, opacity: 0 }}
            animate={{ r: 120, opacity: [0, 0.4, 0] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: i * (4 / 3),
              ease: 'linear',
              times: [0, 0.4, 1],
            }}
          />
        ))}

        {/* === HEXÁGONO EXTERIOR === */}
        <motion.polygon
          points={vertices.map(v => `${v.x},${v.y}`).join(' ')}
          fill="none"
          stroke="url(#hexGrad)"
          strokeWidth="1.8"
          strokeLinejoin="round"
          filter="url(#glow)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.8, ease: 'easeInOut' }}
        />

        {/* Círculo inscrito del hexágono */}
        <motion.circle
          cx={center.x}
          cy={center.y}
          r={hexRadius * 0.866}
          fill="none"
          stroke="rgba(109, 139, 255, 0.2)"
          strokeWidth="0.5"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.7 }}
        />

        {/* === RAMAS DEL CENTRO A LOS VÉRTICES === */}
        {vertices.map((v, i) => (
          <motion.line
            key={`branch-${i}`}
            x1={center.x}
            y1={center.y}
            x2={v.x}
            y2={v.y}
            stroke="rgba(109, 139, 255, 0.6)"
            strokeWidth="0.8"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.7 }}
            transition={{ duration: 0.6, delay: 1 + i * 0.08, ease: 'easeOut' }}
          />
        ))}

        {/* === NODOS EN LOS VÉRTICES === */}
        {vertices.map((v, i) => (
          <g key={`vertex-${i}`}>
            <motion.circle
              cx={v.x}
              cy={v.y}
              r="5"
              fill="#b06dff"
              filter="url(#glow)"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4, delay: 1.6 + i * 0.06 }}
            />
            <motion.circle
              cx={v.x}
              cy={v.y}
              r="5"
              fill="none"
              stroke="#b06dff"
              strokeWidth="0.8"
              animate={{ r: [5, 14, 5], opacity: [0.7, 0, 0.7] }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                delay: i * 0.4,
                ease: 'easeOut',
              }}
            />
          </g>
        ))}

        {/* === NÚCLEO CENTRAL === */}
        <motion.circle
          cx={center.x}
          cy={center.y}
          r="30"
          fill="url(#centerGlow)"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.7, scale: 1 }}
          transition={{ duration: 1.2, delay: 1.5 }}
        />

        {/* Punto central principal */}
        <motion.circle
          cx={center.x}
          cy={center.y}
          r="9"
          fill="#58e0ff"
          filter="url(#glowStrong)"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.4, 1] }}
          transition={{ duration: 0.9, delay: 1.6 }}
        />

        {/* Punto interior blanco latiendo */}
        <motion.circle
          cx={center.x}
          cy={center.y}
          r="3.5"
          fill="#ffffff"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </svg>
    </div>
  );
}