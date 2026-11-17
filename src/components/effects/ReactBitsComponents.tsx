import React, { useRef, useState } from 'react';
import { motion, useInView } from 'motion/react';
import { cn } from '../../lib/utils';

/**
 * React Bits — SplitText
 * Word-by-word animated reveal with IntersectionObserver.
 */
interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  immediate?: boolean;
}

export const SplitText: React.FC<SplitTextProps> = ({
  text,
  className,
  delay = 0.02,
  as: Component = 'h1',
  immediate = false,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: '0px' });
  const visible = immediate || inView;
  const words = text.split(' ');

  return (
    <Component ref={ref as React.RefObject<HTMLHeadingElement>} className={cn('inline-block', className)}>
      {words.map((word, idx) => (
        <span key={`${word}-${idx}`} className="inline-block overflow-hidden align-bottom mr-[0.26em]">
          <motion.span
            className="inline-block will-change-transform"
            initial={{ opacity: 0, y: '45%' }}
            animate={visible ? { opacity: 1, y: '0%' } : { opacity: 0, y: '45%' }}
            transition={{
              duration: 0.32,
              delay: idx * delay,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </Component>
  );
};

/**
 * React Bits — ShinyText
 * Metallic bronze/light gradient sweep over editorial copy.
 */
interface ShinyTextProps {
  text: string;
  className?: string;
}

export const ShinyText: React.FC<ShinyTextProps> = ({ text, className }) => {
  return (
    <span
      className={cn(
        'inline-block bg-clip-text text-transparent animate-shiny-text',
        'bg-[linear-gradient(110deg,#8A6326_0%,#D6A756_45%,#F6E3BA_50%,#D6A756_55%,#8A6326_100%)]',
        className
      )}
    >
      {text}
    </span>
  );
};

/**
 * React Bits — TiltedCard
 * Subtle 3D perspective tilt on hover for desktop viewports.
 */
interface TiltedCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
}

export const TiltedCard: React.FC<TiltedCardProps> = ({ children, className, maxTilt = 5 }) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [transform, setTransform] = useState({ rotateX: 0, rotateY: 0, scale: 1 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTransform({
      rotateX: -y * maxTilt * 2,
      rotateY: x * maxTilt * 2,
      scale: 1.01,
    });
  };

  const handleMouseLeave = () => {
    setTransform({ rotateX: 0, rotateY: 0, scale: 1 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: '1000px',
      }}
      className={cn('h-full', className)}
    >
      <motion.div
        animate={transform}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        className="h-full will-change-transform"
      >
        {children}
      </motion.div>
    </div>
  );
};

/**
 * React Bits — Magnet
 * Gentle magnetic pull effect on hover for key interactive controls.
 */
interface MagnetProps {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}

export const Magnet: React.FC<MagnetProps> = ({ children, className, strength = 0.18 }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const dx = (e.clientX - (rect.left + rect.width / 2)) * strength;
    const dy = (e.clientY - (rect.top + rect.height / 2)) * strength;
    setPos({ x: dx, y: dy });
  };

  const handleMouseLeave = () => {
    setPos({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={cn('inline-block', className)}
    >
      {children}
    </motion.div>
  );
};
