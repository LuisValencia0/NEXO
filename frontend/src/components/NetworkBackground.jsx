import { useEffect, useRef } from 'react';

export default function NetworkBackground({
  particleCount = 70,
  speed = 0.25,
  opacity = 1,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const CONFIG = {
      particleCount,
      maxDistance: 150,
      particleSize: 1.8,
      speed,
      mouseRadius: 180,
      colors: {
        dot: '#58e0ff',
        dotAlt: '#b06dff',
        line: 'rgba(109, 139, 255, 0.35)',
        lineNear: 'rgba(88, 224, 255, 0.55)',
      }
    };

    const particles = [];
    for (let i = 0; i < CONFIG.particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * CONFIG.speed,
        vy: (Math.random() - 0.5) * CONFIG.speed,
        size: Math.random() * CONFIG.particleSize + 1,
        color: Math.random() > 0.7 ? CONFIG.colors.dotAlt : CONFIG.colors.dot,
      });
    }

    const mouse = { x: null, y: null };
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    let animationId;
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        if (mouse.x !== null) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONFIG.mouseRadius) {
            const force = (CONFIG.mouseRadius - dist) / CONFIG.mouseRadius;
            p.vx += (dx / dist) * force * 0.02;
            p.vy += (dy / dist) * force * 0.02;
          }
        }

        const maxVel = 0.8;
        p.vx = Math.max(-maxVel, Math.min(maxVel, p.vx));
        p.vy = Math.max(-maxVel, Math.min(maxVel, p.vy));

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        p.vx *= 0.99;
        p.vy *= 0.99;

        if (Math.abs(p.vx) < 0.05 && Math.abs(p.vy) < 0.05) {
          p.vx += (Math.random() - 0.5) * 0.2;
          p.vy += (Math.random() - 0.5) * 0.2;
        }
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONFIG.maxDistance) {
            const op = 1 - (dist / CONFIG.maxDistance);
            ctx.strokeStyle = op > 0.6 ? CONFIG.colors.lineNear : CONFIG.colors.line;
            ctx.lineWidth = 0.6;
            ctx.globalAlpha = op * 0.7 * opacity;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = opacity;
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, [particleCount, speed, opacity]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}