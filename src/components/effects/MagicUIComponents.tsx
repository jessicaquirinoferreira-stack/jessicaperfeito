import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView } from 'motion/react';
import { cn } from '../../lib/utils';

/**
 * Magic UI — BlurFade
 */
interface BlurFadeProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  yOffset?: number;
}

export const BlurFade: React.FC<BlurFadeProps> = ({
  children,
  className,
  delay = 0,
  duration = 0.28,
  yOffset = 8,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: '0px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: yOffset }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: yOffset }}
      transition={{
        duration,
        delay: Math.min(delay, 0.16),
        ease: [0.16, 1, 0.3, 1],
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
};

/**
 * Magic UI — ShimmerButton
 */
interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string;
  background?: string;
  borderRadius?: string;
  className?: string;
  children: React.ReactNode;
}

export const ShimmerButton: React.FC<ShimmerButtonProps> = ({
  shimmerColor = '#E7C98F',
  background = '#0B1B32',
  borderRadius = '8px',
  className,
  children,
  ...props
}) => {
  return (
    <button
      style={
        {
          '--spread': '90deg',
          '--shimmer-color': shimmerColor,
          '--radius': borderRadius,
          '--speed': '3.2s',
          '--cut': '1.5px',
          '--bg': background,
        } as React.CSSProperties
      }
      className={cn(
        'group relative z-0 inline-flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap border border-white/15 px-6 py-3 text-sm font-semibold text-white transition-transform duration-200 active:scale-[0.98]',
        '[background:var(--bg)] [border-radius:var(--radius)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8863B] focus-visible:ring-offset-2',
        className
      )}
      {...props}
    >
      <div className="-z-30 blur-[2px] absolute inset-0 overflow-visible [container-type:size]">
        <div className="absolute inset-0 h-[100cqh] animate-shimmer-slide [aspect-ratio:1] [border-radius:0] [mask:none]">
          <div
            className="animate-spin-around absolute -inset-full w-auto rotate-0"
            style={{
              background: `conic-gradient(from calc(270deg - (var(--spread) * 0.5)), transparent 0, var(--shimmer-color) var(--spread), transparent var(--spread))`,
            }}
          />
        </div>
      </div>
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      <div
        className="insert-0 absolute size-full rounded-[inherit] shadow-[inset_0_-8px_10px_#ffffff14] transition-all duration-300 ease-in-out group-hover:shadow-[inset_0_-6px_12px_#ffffff24]"
      />
      <div
        className="absolute -z-20 [background:var(--bg)] [border-radius:var(--radius)] [inset:var(--cut)]"
      />
    </button>
  );
};

/**
 * Magic UI — BorderBeam
 */
interface BorderBeamProps {
  className?: string;
  size?: number;
  duration?: number;
  colorFrom?: string;
  colorTo?: string;
}

export const BorderBeam: React.FC<BorderBeamProps> = ({
  className,
  size = 180,
  duration = 10,
  colorFrom = '#B8863B',
  colorTo = '#0B1B32',
}) => {
  return (
    <div
      style={
        {
          '--size': size,
          '--duration': duration,
          '--color-from': colorFrom,
          '--color-to': colorTo,
        } as React.CSSProperties
      }
      className={cn(
        'pointer-events-none absolute inset-0 rounded-[inherit] [border:1.5px_solid_transparent]',
        '[mask-clip:padding-box,border-box] [mask-composite:intersect] [mask:linear-gradient(transparent,transparent),linear-gradient(white,white)]',
        'after:absolute after:aspect-square after:w-[calc(var(--size)*1px)] after:animate-border-beam after:[background:linear-gradient(to_left,var(--color-from),var(--color-to),transparent)] after:[offset-anchor:90%_50%] after:[offset-path:rect(0_auto_auto_0_round_calc(var(--size)*1px))]',
        className
      )}
    />
  );
};

/**
 * Magic UI — Particles (Lightweight canvas floating dust)
 */
interface ParticlesProps {
  className?: string;
  quantity?: number;
  color?: string;
}

export const Particles: React.FC<ParticlesProps> = ({
  className,
  quantity = 34,
  color = '#D4AF6A',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth * dpr;
      canvas.height = parent.clientHeight * dpr;
      canvas.style.width = `${parent.clientWidth}px`;
      canvas.style.height = `${parent.clientHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const count = window.innerWidth < 768 ? Math.min(10, quantity) : quantity;
    const dots = Array.from({ length: count }, () => ({
      x: Math.random() * (canvas.clientWidth || 1200),
      y: Math.random() * (canvas.clientHeight || 700),
      r: 0.9 + Math.random() * 1.8,
      vx: (Math.random() - 0.5) * 0.28,
      vy: -0.12 - Math.random() * 0.28,
      alpha: 0.25 + Math.random() * 0.45,
    }));

    const render = () => {
      if (document.hidden) {
        animId = requestAnimationFrame(render);
        return;
      }
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      for (const dot of dots) {
        dot.x += dot.vx;
        dot.y += dot.vy;
        if (dot.y < -10) dot.y = h + 10;
        if (dot.x < -10) dot.x = w + 10;
        if (dot.x > w + 10) dot.x = -10;

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = dot.alpha;
        ctx.fill();
      }
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [quantity, color]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 h-full w-full', className)}
    />
  );
};

/**
 * Magic UI — NumberTicker
 */
interface NumberTickerProps {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export const NumberTicker: React.FC<NumberTickerProps> = ({
  value,
  prefix = '',
  suffix = '',
  className,
}) => {
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 900;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value]);

  return (
    <span ref={ref} className={cn('tabular-nums', className)}>
      {prefix}
      {display.toLocaleString('pt-BR')}
      {suffix}
    </span>
  );
};

/**
 * Magic UI — WordRotate
 */
interface WordRotateProps {
  words: string[];
  className?: string;
  intervalMs?: number;
}

export const WordRotate: React.FC<WordRotateProps> = ({
  words,
  className,
  intervalMs = 3200,
}) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (words.length <= 1) return;
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [words, intervalMs]);

  return (
    <div className="overflow-hidden inline-flex align-baseline">
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className={cn('inline-block', className)}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};
