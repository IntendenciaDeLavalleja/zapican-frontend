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

type ThemeVisualState = {
  baseFill: string;
  gradientFrom: string;
  gradientTo: string;
  gradientAngle: number;
  blobs: BlobDef[];
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

const FALLBACK_DAY_VISUALS: ThemeVisualState = {
  baseFill: '#f0f9ff',
  gradientFrom: '#f8fafc',
  gradientTo: '#e0f2fe',
  gradientAngle: 180,
  blobs: DAY_BLOBS,
};

function parseCssColor(input: string | null | undefined, fallback: [number, number, number]): [number, number, number] {
  const value = input?.trim();

  if (!value) {
    return fallback;
  }

  const hexMatch = value.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hexMatch) {
    const hex = hexMatch[1];
    if (hex.length === 3) {
      return [
        Number.parseInt(`${hex[0]}${hex[0]}`, 16),
        Number.parseInt(`${hex[1]}${hex[1]}`, 16),
        Number.parseInt(`${hex[2]}${hex[2]}`, 16),
      ];
    }

    return [
      Number.parseInt(hex.slice(0, 2), 16),
      Number.parseInt(hex.slice(2, 4), 16),
      Number.parseInt(hex.slice(4, 6), 16),
    ];
  }

  const rgbMatch = value.match(/^rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgbMatch) {
    return [
      Number.parseInt(rgbMatch[1], 10),
      Number.parseInt(rgbMatch[2], 10),
      Number.parseInt(rgbMatch[3], 10),
    ];
  }

  return fallback;
}

function createThemeBlob(base: Omit<BlobDef, 'color'>, color: [number, number, number], alpha: number): BlobDef {
  return {
    ...base,
    color: [color[0], color[1], color[2], alpha],
  };
}

function readThemeVisualState(): ThemeVisualState {
  const root = document.documentElement;
  const isNight = root.dataset['themeMode'] === 'night';

  if (isNight) {
    return {
      baseFill: '#06101c',
      gradientFrom: '#07111b',
      gradientTo: '#102031',
      gradientAngle: 180,
      blobs: NIGHT_BLOBS,
    };
  }

  const styles = getComputedStyle(root);
  const background = styles.getPropertyValue('--site-background').trim() || FALLBACK_DAY_VISUALS.baseFill;
  const gradientFrom = styles.getPropertyValue('--site-background-gradient-from').trim() || background || FALLBACK_DAY_VISUALS.gradientFrom;
  const gradientTo = styles.getPropertyValue('--site-background-gradient-to').trim() || background || FALLBACK_DAY_VISUALS.gradientTo;
  const angleRaw = styles.getPropertyValue('--site-background-gradient-angle').trim();
  const gradientAngle = Number.parseFloat(angleRaw) || FALLBACK_DAY_VISUALS.gradientAngle;
  const primary = parseCssColor(styles.getPropertyValue('--site-primary'), [56, 189, 248]);
  const secondary = parseCssColor(styles.getPropertyValue('--site-secondary'), [99, 160, 250]);
  const accent = parseCssColor(styles.getPropertyValue('--site-accent'), [186, 230, 253]);
  const gradientStartColor = parseCssColor(gradientFrom, [248, 250, 252]);

  return {
    baseFill: background,
    gradientFrom,
    gradientTo,
    gradientAngle,
    blobs: [
      createThemeBlob({ baseX: 0.12, baseY: 0.22, ampX: 0.13, ampY: 0.11, freqX: 6.28e-4, freqY: 7.85e-4, phase: 0.00, radius: 0.62 }, primary, 0.24),
      createThemeBlob({ baseX: 0.88, baseY: 0.14, ampX: 0.10, ampY: 0.13, freqX: 5.24e-4, freqY: 6.98e-4, phase: 2.09, radius: 0.54 }, secondary, 0.2),
      createThemeBlob({ baseX: 0.50, baseY: 0.82, ampX: 0.14, ampY: 0.09, freqX: 7.85e-4, freqY: 5.71e-4, phase: 4.19, radius: 0.64 }, accent, 0.18),
      createThemeBlob({ baseX: 0.76, baseY: 0.52, ampX: 0.09, ampY: 0.12, freqX: 6.98e-4, freqY: 6.28e-4, phase: 1.05, radius: 0.50 }, gradientStartColor, 0.18),
    ],
  };
}

function createLinearGradient(ctx: CanvasRenderingContext2D, width: number, height: number, angle: number, from: string, to: string) {
  const radians = ((angle - 90) * Math.PI) / 180;
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const vectorX = Math.cos(radians) * halfWidth;
  const vectorY = Math.sin(radians) * halfHeight;
  const gradient = ctx.createLinearGradient(halfWidth - vectorX, halfHeight - vectorY, halfWidth + vectorX, halfHeight + vectorY);

  gradient.addColorStop(0, from);
  gradient.addColorStop(1, to);

  return gradient;
}

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId: number;
    let themeVisuals = readThemeVisualState();
    const observer = new MutationObserver(() => {
      themeVisuals = readThemeVisualState();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style', 'data-theme-mode'],
    });

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

      ctx.fillStyle = themeVisuals.baseFill;
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = createLinearGradient(
        ctx,
        w,
        h,
        themeVisuals.gradientAngle,
        themeVisuals.gradientFrom,
        themeVisuals.gradientTo,
      );
      ctx.fillRect(0, 0, w, h);

      for (const blob of themeVisuals.blobs) {
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
      observer.disconnect();
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
