import React, { useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'motion/react';
import { cn } from '../../lib/utils';

/**
 * Aceternity UI — Spotlight
 */
interface SpotlightProps {
  className?: string;
  fill?: string;
}

export const Spotlight: React.FC<SpotlightProps> = ({ className, fill = '#D4AF6A' }) => {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute z-[1] h-[520px] w-[720px] rounded-full opacity-35',
        className
      )}
      style={{
        background: `radial-gradient(ellipse at center, ${fill}40 0%, ${fill}14 45%, transparent 72%)`,
      }}
    />
  );
};

/**
 * Aceternity UI — AuroraBackground
 */
interface AuroraBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export const AuroraBackground: React.FC<AuroraBackgroundProps> = ({ children, className }) => {
  return (
    <div className={cn('relative overflow-hidden bg-[#081528] text-white', className)}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-[20%] opacity-60 animate-aurora-drift"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 25%, rgba(184,134,59,0.28), transparent 45%), radial-gradient(circle at 82% 20%, rgba(30,64,125,0.45), transparent 50%), radial-gradient(circle at 50% 85%, rgba(184,134,59,0.18), transparent 45%)',
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
};

/**
 * Aceternity UI — TextGenerateEffect
 */
interface TextGenerateEffectProps {
  words: string;
  className?: string;
}

export const TextGenerateEffect: React.FC<TextGenerateEffectProps> = ({ words, className }) => {
  const ref = useRef<HTMLParagraphElement | null>(null);
  const inView = useInView(ref, { once: true, margin: '0px' });
  const parts = words.split(' ');

  return (
    <p ref={ref} className={cn('leading-relaxed', className)}>
      {parts.map((word, idx) => (
        <motion.span
          key={`${word}-${idx}`}
          initial={{ opacity: 0, y: 4 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 4 }}
          transition={{ duration: 0.24, delay: Math.min(idx * 0.015, 0.35) }}
          className="inline-block mr-[0.25em]"
        >
          {word}
        </motion.span>
      ))}
    </p>
  );
};

/**
 * Aceternity UI — ParallaxFrame
 */
interface ParallaxFrameProps {
  children: React.ReactNode;
  className?: string;
  offset?: number;
}

export const ParallaxFrame: React.FC<ParallaxFrameProps> = ({
  children,
  className,
  offset = 32,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [-offset, offset]);

  return (
    <div ref={ref} className={cn('overflow-hidden', className)}>
      <motion.div style={{ y }} className="h-full w-full will-change-transform">
        {children}
      </motion.div>
    </div>
  );
};
