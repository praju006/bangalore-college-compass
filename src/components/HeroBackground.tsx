import { useEffect, useRef } from "react";

interface Star {
  x: number; y: number;
  r: number; opacity: number;
  vx: number; vy: number;
  pulseSpeed: number; pulsePhase: number;
}

interface ShootingStar {
  x: number; y: number;
  len: number; speed: number;
  angle: number; opacity: number;
  trail: number; active: boolean;
  timer: number; delay: number;
}

interface Orb {
  x: number; y: number; r: number;
  vx: number; vy: number;
  r_val: number; g_val: number; b_val: number;
  opacity: number;
}

interface Particle {
  x: number; y: number; r: number;
  opacity: number; vx: number; vy: number;
  r_val: number; g_val: number; b_val: number;
}

export default function HeroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    let W = 0, H = 0, raf = 0, t = 0;
    let stars: Star[]           = [];
    let shooters: ShootingStar[]= [];
    let orbs: Orb[]             = [];
    let particles: Particle[]   = [];

    const rand  = (a: number, b: number) => a + Math.random() * (b - a);
    const randI = (a: number, b: number) => Math.floor(rand(a, b));

    // ── colour palette as RGB tuples ──
    const PALETTE = [
      [124, 127, 204],
      [167, 139, 250],
      [129, 140, 248],
      [196, 181, 253],
      [244, 197, 66],
      [96,  165, 250],
    ];

    const rgba = (r: number, g: number, b: number, a: number) =>
      `rgba(${r},${g},${b},${a})`;

    // ── glow circle using pre-parsed rgb values ──
    const drawGlowCircle = (
      x: number, y: number, radius: number,
      r: number, g: number, b: number, alpha: number
    ) => {
      const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
      grad.addColorStop(0, rgba(r, g, b, alpha));
      grad.addColorStop(1, rgba(r, g, b, 0));
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
    };

    const init = () => {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;

      // twinkling stars
      stars = Array.from({ length: 130 }, () => ({
        x: rand(0, W), y: rand(0, H),
        r: rand(0.5, 2.2),
        opacity: rand(0.2, 0.9),
        vx: rand(-0.08, 0.08),
        vy: rand(-0.06, 0.06),
        pulseSpeed: rand(0.005, 0.025),
        pulsePhase: rand(0, Math.PI * 2),
      }));

      // shooting stars
      shooters = Array.from({ length: 8 }, (_, i) => makeShooter(i * 80));

      // glowing orbs — store rgb as numbers, no hex
      orbs = [
        { x: W*0.15, y: H*0.25, r: rand(80,120), vx:  0.12, vy:  0.07, r_val:86,  g_val:86,  b_val:153, opacity:0.13 },
        { x: W*0.80, y: H*0.60, r: rand(60,100), vx: -0.10, vy:  0.05, r_val:124, g_val:127, b_val:204, opacity:0.11 },
        { x: W*0.50, y: H*0.85, r: rand(50, 80), vx:  0.08, vy: -0.08, r_val:244, g_val:197, b_val:66,  opacity:0.07 },
        { x: W*0.90, y: H*0.15, r: rand(40, 70), vx: -0.09, vy:  0.11, r_val:129, g_val:140, b_val:248, opacity:0.09 },
      ];

      // floating particles
      particles = Array.from({ length: 45 }, () => {
        const [r, g, b] = PALETTE[randI(0, PALETTE.length)];
        return {
          x: rand(0, W), y: rand(0, H),
          r: rand(1, 2.5),
          opacity: rand(0.1, 0.5),
          vx: rand(-0.15, 0.15),
          vy: rand(-0.25, -0.05),
          r_val: r, g_val: g, b_val: b,
        };
      });
    };

    const makeShooter = (delay = 0): ShootingStar => ({
      x: rand(0, W),
      y: rand(0, H * 0.5),
      len: rand(80, 200),
      speed: rand(8, 18),
      angle: rand(Math.PI * 0.1, Math.PI * 0.4),
      opacity: 0,
      trail: rand(0.3, 0.7),
      active: false,
      timer: 0,
      delay: delay + rand(0, 300),
    });

    const drawConstellations = () => {
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const dx   = stars[i].x - stars[j].x;
          const dy   = stars[i].y - stars[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 90) {
            const alpha = (1 - dist / 90) * 0.10;
            ctx.beginPath();
            ctx.moveTo(stars[i].x, stars[i].y);
            ctx.lineTo(stars[j].x, stars[j].y);
            ctx.strokeStyle = rgba(180, 180, 255, alpha);
            ctx.lineWidth   = 0.5;
            ctx.stroke();
          }
        }
      }
    };

    const draw = () => {
      t++;
      ctx.clearRect(0, 0, W, H);

      // background gradient
      const bg = ctx.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0,   "#0f0f2e");
      bg.addColorStop(0.4, "#1a1a3a");
      bg.addColorStop(0.7, "#1e1b4b");
      bg.addColorStop(1,   "#0f172a");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // orbs
      orbs.forEach(o => {
        o.x += o.vx;
        o.y += o.vy;
        if (o.x < -o.r) o.x = W + o.r;
        if (o.x > W+o.r) o.x = -o.r;
        if (o.y < -o.r) o.y = H + o.r;
        if (o.y > H+o.r) o.y = -o.r;
        drawGlowCircle(o.x, o.y, o.r, o.r_val, o.g_val, o.b_val, o.opacity);
      });

      // constellation lines
      drawConstellations();

      // twinkling stars
      stars.forEach(s => {
        s.x += s.vx;
        s.y += s.vy;
        if (s.x < 0) s.x = W;
        if (s.x > W) s.x = 0;
        if (s.y < 0) s.y = H;
        if (s.y > H) s.y = 0;

        const pulse = Math.sin(t * s.pulseSpeed + s.pulsePhase) * 0.4 + 0.6;
        const alpha = s.opacity * pulse;

        // soft glow halo
        const glow = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 4);
        glow.addColorStop(0, rgba(200, 200, 255, alpha * 0.5));
        glow.addColorStop(1, rgba(200, 200, 255, 0));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r * 4, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        // star core
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = rgba(255, 255, 255, alpha);
        ctx.fill();
      });

      // shooting stars
      shooters.forEach((ss, i) => {
        ss.timer++;
        if (ss.timer < ss.delay) return;

        if (!ss.active) { ss.active = true; ss.opacity = 0; }
        if (ss.opacity < 1) ss.opacity += 0.08;

        ss.x += Math.cos(ss.angle) * ss.speed;
        ss.y += Math.sin(ss.angle) * ss.speed;

        const tx = ss.x - Math.cos(ss.angle) * ss.len;
        const ty = ss.y - Math.sin(ss.angle) * ss.len;

        const grad = ctx.createLinearGradient(tx, ty, ss.x, ss.y);
        grad.addColorStop(0,         rgba(255, 255, 255, 0));
        grad.addColorStop(ss.trail,  rgba(220, 220, 255, ss.opacity * 0.6));
        grad.addColorStop(1,         rgba(255, 255, 255, ss.opacity));

        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(ss.x, ss.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth   = 1.5;
        ctx.stroke();

        // sparkle head
        ctx.beginPath();
        ctx.arc(ss.x, ss.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = rgba(255, 255, 255, ss.opacity);
        ctx.fill();

        if (ss.x > W + 50 || ss.y > H + 50 || ss.x < -50) {
          shooters[i] = makeShooter(rand(60, 200));
        }
      });

      // floating particles
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -10) { p.y = H + 10; p.x = rand(0, W); }
        if (p.x < 0)   p.x = W;
        if (p.x > W)   p.x = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = rgba(p.r_val, p.g_val, p.b_val, p.opacity);
        ctx.fill();
      });

      // subtle grid
      ctx.lineWidth   = 0.5;
      const gridSize  = 60;
      for (let x = 0; x < W; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0); ctx.lineTo(x, H);
        ctx.strokeStyle = rgba(120, 120, 200, 0.03);
        ctx.stroke();
      }
      for (let y = 0; y < H; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y); ctx.lineTo(W, y);
        ctx.strokeStyle = rgba(120, 120, 200, 0.03);
        ctx.stroke();
      }

      raf = requestAnimationFrame(draw);
    };

    const onResize = () => init();
    window.addEventListener("resize", onResize);
    init();
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ display: "block" }}
    />
  );
}