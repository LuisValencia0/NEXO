export default function GalaxiaFondo() {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-[#07080f]">
        
        {/* VIDEO DE FONDO */}
        <video
          autoPlay
          loop
          muted
          playsInline
          // 'object-cover' hace que el video llene todo sin deformarse
          // 'mix-blend-screen' quita el fondo negro del video para que solo se vea la luz
          className="absolute bottom-0 left-0 w-full h-[120%] object-cover opacity-60 mix-blend-screen"
          style={{
            // La máscara para que el video se desvanezca suavemente en la parte superior
            maskImage: 'linear-gradient(to top, black 40%, transparent 90%)',
            WebkitMaskImage: 'linear-gradient(to top, black 40%, transparent 90%)',
            // Lo hundimos un poco para que el centro de la galaxia quede debajo del footer
            transform: 'translateY(20%)', 
          }}
        >
          <source src="/galaxia.mp4" type="video/mp4" />
        </video>
  
        {/* 
          Capa oscura para asegurar que los textos del footer se lean bien 
          y para fundir los bordes laterales del video.
        */}
        <div 
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center bottom, transparent 30%, #07080f 80%)'
          }}
        />
  
        {/* Degradado superior para integrarse con la página */}
        <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-[#07080f] to-transparent z-20 pointer-events-none" />
      </div>
    );
  }