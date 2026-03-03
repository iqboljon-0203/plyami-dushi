import { useEffect, useRef } from 'react';

/**
 * SmokeBackground — A full-screen HTML5 Canvas smoke/fog effect.
 * Highly optimized with offscreen canvas pre-rendering and dynamic particle counts.
 */
const SmokeBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    let animationId;
    let particles = [];
    let isTabActive = true;

    // Handle tab visibility to pause animation
    const handleVisibilityChange = () => {
      isTabActive = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // ── Pre-render Gradients for Performance ──
    const createGradientCanvas = (colorDef, size = 256) => {
      const gCanvas = document.createElement('canvas');
      gCanvas.width = size;
      gCanvas.height = size;
      const gCtx = gCanvas.getContext('2d');
      const gradient = gCtx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      
      colorDef.forEach((c) => gradient.addColorStop(c.stop, c.color));
      
      gCtx.fillStyle = gradient;
      gCtx.beginPath();
      gCtx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      gCtx.fill();
      return gCanvas;
    };

    const redSmokeProps = [
      { stop: 0, color: 'rgba(211, 47, 47, 0.15)' },
      { stop: 0.4, color: 'rgba(211, 47, 47, 0.05)' },
      { stop: 1, color: 'rgba(211, 47, 47, 0)' }
    ];
    const whiteSmokeProps = [
      { stop: 0, color: 'rgba(245, 245, 245, 0.12)' },
      { stop: 0.4, color: 'rgba(245, 245, 245, 0.04)' },
      { stop: 1, color: 'rgba(245, 245, 245, 0)' }
    ];

    const redSmokeImg = createGradientCanvas(redSmokeProps);
    const whiteSmokeImg = createGradientCanvas(whiteSmokeProps);

    // ── Smoke Particle Class ──
    class SmokeParticle {
      constructor() {
        this.reset(true);
      }

      reset(initial = false) {
        this.x = Math.random() * canvas.width;
        this.y = initial ? Math.random() * canvas.height : canvas.height + Math.random() * 100;
        this.size = Math.random() * 200 + 120; // Larger sizes cover more area with fewer particles
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = -(Math.random() * 0.4 + 0.1);
        this.opacity = Math.random() * 0.05 + 0.01;
        this.maxOpacity = this.opacity;
        this.life = initial ? Math.random() * 600 : 0;
        this.maxLife = Math.random() * 600 + 400;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.002;
        this.img = Math.random() > 0.7 ? redSmokeImg : whiteSmokeImg;
      }

      update() {
        this.x += this.speedX + Math.sin(this.life * 0.005) * 0.3;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;
        this.life++;

        // Fade in and out
        const lifeFraction = this.life / this.maxLife;
        if (lifeFraction < 0.1) {
          this.opacity = this.maxOpacity * (lifeFraction / 0.1);
        } else if (lifeFraction > 0.7) {
          this.opacity = this.maxOpacity * (1 - (lifeFraction - 0.7) / 0.3);
        }

        if (this.life >= this.maxLife || this.y < -this.size) {
          this.reset();
        }
      }

      draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.opacity;
        
        // Use drawImage which is heavily hardware accelerated
        const halfSize = this.size;
        ctx.drawImage(this.img, -halfSize, -halfSize, this.size * 2, this.size * 2);
        
        ctx.restore();
      }
    }

    // Dynamic particle count based on screen size (saving mobile performance)
    const PARTICLE_COUNT = window.innerWidth < 768 ? 15 : 30;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(new SmokeParticle());
    }

    // ── Animation Loop ──
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      if (!isTabActive) return; // Pause calculation when hidden

      // Ensure background color fills properly if using alpha: false
      ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--color-mystic-black') || '#050505';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.update();
        p.draw(ctx);
      });
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none transition-colors duration-700"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
};

export default SmokeBackground;
