import { useEffect, useRef } from 'react';

type BlobDef = {
  baseX: number;
  baseY: number;
  ampX: number;
  ampY: number;
  freqX: number;
  freqY: number;
  phase: number;
  radius: number;
  color: [number, number, number, number];
};

// 2π / period_ms  →  period determines how many seconds one full cycle takes
const DAY_BLOBS: BlobDef[] = [
  // big sky-blue top-left, period ~10 s x / 8 s y
  { baseX: 0.12, baseY: 0.22, ampX: 0.13, ampY: 0.11, freqX: 6.28e-4, freqY: 7.85e-4, phase: 0.00, radius: 0.62, color: [56,  189, 248, 0.70] },
  // indigo-blue top-right, period ~12 s x / 9 s y
  { baseX: 0.88, baseY: 0.14, ampX: 0.10, ampY: 0.13, freqX: 5.24e-4, freqY: 6.98e-4, phase: 2.09, radius: 0.54, color: [99,  160, 250, 0.60] },
  // light-cyan bottom-center, period ~8 s x / 11 s y
  { baseX: 0.50, baseY: 0.82, ampX: 0.14, ampY: 0.09, freqX: 7.85e-4, freqY: 5.71e-4, phase: 4.19, radius: 0.64, color: [186, 230, 253, 0.72] },
  // soft-indigo middle-right, period ~9 s x / 10 s y
  { baseX: 0.76, baseY: 0.52, ampX: 0.09, ampY: 0.12, freqX: 6.98e-4, freqY: 6.28e-4, phase: 1.05, radius: 0.50, color: [165, 180, 252, 0.58] },
];

const NIGHT_BLOBS: BlobDef[] = [
  { baseX: 0.12, baseY: 0.22, ampX: 0.13, ampY: 0.11, freqX: 6.28e-4, freqY: 7.85e-4, phase: 0.00, radius: 0.62, color: [20,  60, 130, 0.90] },
  { baseX: 0.88, baseY: 0.14, ampX: 0.10, ampY: 0.13, freqX: 5.24e-4, freqY: 6.98e-4, phase: 2.09, radius: 0.54, color: [10,  40,  90, 0.85] },
  { baseX: 0.50, baseY: 0.82, ampX: 0.14, ampY: 0.09, freqX: 7.85e-4, freqY: 5.71e-4, phase: 4.19, radius: 0.64, color: [15,  50, 110, 0.80] },
  { baseX: 0.76, baseY: 0.52, ampX: 0.09, ampY: 0.12, freqX: 6.98e-4, freqY: 6.28e-4, phase: 1.05, radius: 0.50, color: [30,  70, 140, 0.75] },
];

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = (t: number) => {
      const w = canvas.width;
      const h = canvas.height;
      const dim = Math.max(w, h);
      const isNight = document.documentElement.dataset['themeMode'] === 'night';
      const blobs = isNight ? NIGHT_BLOBS : DAY_BLOBS;

      // Solid base fill
      ctx.fillStyle = isNight ? '#06101c' : '#f0f9ff';
      ctx.fillRect(0, 0, w, h);

      // Animated blob layers
      for (const blob of blobs) {
        const x = (blob.baseX + Math.sin(t * blob.freqX + blob.phase) * blob.ampX) * w;
        const y = (blob.baseY + Math.cos(t * blob.freqY + blob.phase) * blob.ampY) * h;
        const r = blob.radius * dim;
        const [r1, g1, b1, a1] = blob.color;

        const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0,    `rgba(${r1},${g1},${b1},${a1})`);
        grad.addColorStop(0.45, `rgba(${r1},${g1},${b1},${(a1 * 0.35).toFixed(3)})`);
        grad.addColorStop(1,    `rgba(${r1},${g1},${b1},0)`);

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
      }

      rafId = requestAnimationFrame(draw);
    };

    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none',
      }}
    />
  );
}
