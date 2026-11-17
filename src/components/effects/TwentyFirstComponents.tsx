import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { cn, resolveAssetUrl } from '../../lib/utils';

export interface StoryChapter {
  id: string;
  kicker: string;
  title: string;
  summary: string;
  image: string;
  alt: string;
  ctaLabel: string;
  onAction: () => void;
}

/**
 * 21st.dev inspired Interactive Editorial Image Accordion
 */
export const StoryShowcaseAccordion: React.FC<{ chapters: StoryChapter[] }> = ({ chapters }) => {
  const [activeId, setActiveId] = useState<string>(chapters[0]?.id || '');

  return (
    <div className="grid grid-cols-1 gap-4 lg:flex lg:h-[460px] lg:gap-4">
      {chapters.map((item) => {
        const isActive = item.id === activeId;
        return (
          <motion.div
            key={item.id}
            layout
            onMouseEnter={() => setActiveId(item.id)}
            onClick={() => setActiveId(item.id)}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'group relative cursor-pointer overflow-hidden rounded-xl border border-[#0B1B32]/12 bg-[#0B1B32] text-white transition-all',
              'min-h-[280px] lg:min-h-0',
              isActive ? 'lg:flex-[2.4]' : 'lg:flex-1'
            )}
          >
            <img
              src={resolveAssetUrl(item.image)}
              alt={item.alt}
              loading="lazy"
              decoding="async"
              referrerPolicy="no-referrer"
              className={cn(
                'absolute inset-0 h-full w-full object-cover transition-transform duration-700',
                isActive ? 'scale-105 opacity-80' : 'scale-100 opacity-60 group-hover:opacity-75'
              )}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#06101F]/95 via-[#06101F]/50 to-transparent" />

            <div className="relative z-10 flex h-full flex-col justify-end p-6 sm:p-8">
              <span className="text-xs font-medium tracking-wider text-[#E7C98F]">{item.kicker}</span>
              <h3 className="mt-2 font-editorial text-2xl font-semibold leading-snug text-white sm:text-3xl">
                {item.title}
              </h3>

              <div
                className={cn(
                  'mt-3 overflow-hidden transition-all duration-300',
                  isActive ? 'max-h-48 opacity-100' : 'lg:max-h-0 lg:opacity-0'
                )}
              >
                <p className="max-w-lg text-sm leading-relaxed text-white/85">{item.summary}</p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    item.onAction();
                  }}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#E7C98F] hover:text-white transition-colors"
                >
                  {item.ctaLabel}
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
