import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useSite } from '../../context/SiteContext';
import { cn } from '../../lib/utils';

export const SiteHeader: React.FC = () => {
  const { settings, openVisitModal } = useSite();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 18);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const navItems = [
    { label: 'Início', to: '/' },
    { label: 'Comprar', to: '/comprar' },
    { label: 'Empreendimentos', to: '/empreendimentos' },
    { label: 'Sobre', to: '/sobre' },
    { label: 'Contato', to: '/contato' },
  ];

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full transition-all duration-300',
        scrolled
          ? 'border-b border-[#0B1B32]/10 bg-[#FAF8F5]/95 backdrop-blur-md shadow-[0_4px_24px_rgba(11,27,50,0.05)]'
          : 'border-b border-[#0B1B32]/8 bg-[#FAF8F5]/90 backdrop-blur-sm'
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <Link
          to="/"
          className="flex items-center gap-2.5 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8863B] rounded"
        >
          {settings.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt={settings.brandName}
              referrerPolicy="no-referrer"
              className="h-9 w-auto object-contain"
            />
          ) : (
            <span
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#B8863B]/40 font-editorial text-base font-bold tracking-tight text-white"
              style={{ backgroundColor: settings.primaryColor || '#0B1B32' }}
            >
              {settings.brandMonogram || 'JP'}
            </span>
          )}
          <span className="font-editorial text-xl font-semibold tracking-tight text-[#0B1B32]">
            {settings.brandName}
          </span>
        </Link>

        {/* Zone 2: 5 concise single-line text nav links */}
        <nav className="hidden md:flex items-center gap-7" aria-label="Navegação principal">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'relative py-1 text-sm font-medium whitespace-nowrap shrink-0 transition-colors',
                  active ? 'text-[#0B1B32]' : 'text-[#0B1B32]/70 hover:text-[#0B1B32]'
                )}
              >
                {item.label}
                {active && (
                  <span
                    className="absolute inset-x-0 -bottom-0.5 h-[1.5px]"
                    style={{ backgroundColor: settings.accentColor || '#B8863B' }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Zone 3: 1 Primary Action + Mobile Trigger */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => openVisitModal(null)}
            style={{ backgroundColor: settings.primaryColor || '#0B1B32' }}
            className="hidden sm:inline-flex items-center justify-center rounded-lg px-4 py-2 text-xs font-semibold text-white transition-all hover:opacity-90 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8863B]"
          >
            Agendar visita
          </button>

          <button
            type="button"
            aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
            onClick={() => setMobileOpen((prev) => !prev)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#0B1B32]/15 text-[#0B1B32] md:hidden cursor-pointer"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="border-t border-[#0B1B32]/10 bg-[#FAF8F5] px-4 py-5 md:hidden"
          >
            <nav className="flex flex-col gap-3" aria-label="Menu mobile">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    'rounded-lg px-3 py-2.5 text-base font-medium transition-colors',
                    location.pathname === item.to
                      ? 'bg-[#0B1B32]/8 text-[#0B1B32]'
                      : 'text-[#0B1B32]/80 hover:bg-[#0B1B32]/5'
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/oportunidade/porto-maravilha"
                className="rounded-lg px-3 py-2.5 text-base font-medium text-[#9E712E] hover:bg-[#B8863B]/10"
              >
                Oportunidade Porto Maravilha
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  openVisitModal(null);
                }}
                style={{ backgroundColor: settings.primaryColor || '#0B1B32' }}
                className="mt-2 w-full rounded-lg px-4 py-3 text-sm font-semibold text-white"
              >
                Agendar visita
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
