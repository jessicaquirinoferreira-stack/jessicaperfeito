import React, { useState } from 'react';
import { Calendar, ExternalLink, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useSite } from '../../context/SiteContext';
import { trackAnalyticsAsync } from '../../services/analytics';
import { SafeImage } from './SafeImage';

const ASSISTANT_PHOTO = '/images/assistente-clara.jpg';

const OfficialInstagramIcon: React.FC<{ className?: string }> = ({ className = 'h-6 w-6' }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <defs>
      <radialGradient id="ig-grad-official" cx="30%" cy="107%" r="150%">
        <stop offset="0%" stopColor="#fdf497" />
        <stop offset="5%" stopColor="#fdf497" />
        <stop offset="45%" stopColor="#fd5949" />
        <stop offset="60%" stopColor="#d6249f" />
        <stop offset="90%" stopColor="#285AEB" />
      </radialGradient>
    </defs>
    <rect x="2" y="2" width="20" height="20" rx="5.5" fill="url(#ig-grad-official)" />
    <rect x="5.2" y="5.2" width="13.6" height="13.6" rx="3.8" fill="none" stroke="#FFFFFF" strokeWidth="1.7" />
    <circle cx="12" cy="12" r="3.3" fill="none" stroke="#FFFFFF" strokeWidth="1.7" />
    <circle cx="16.3" cy="7.7" r="1" fill="#FFFFFF" />
  </svg>
);

const OfficialWhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'h-6 w-6' }) => (
  <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
    <circle cx="16" cy="16" r="15" fill="#25D366" />
    <path
      fill="#FFFFFF"
      d="M23.4 19.3c-.3-.2-2-.99-2.3-1.1-.3-.1-.5-.2-.75.15-.22.35-.86 1.1-1.05 1.32-.2.22-.39.25-.72.08-.33-.16-1.4-.52-2.67-1.65-.99-.88-1.66-1.97-1.85-2.3-.2-.33-.02-.51.14-.67.15-.15.33-.39.5-.58.17-.2.22-.33.33-.56.11-.22.06-.42-.03-.58-.08-.17-.75-1.8-1.03-2.46-.27-.65-.54-.56-.75-.57h-.64c-.22 0-.58.08-.89.42-.3.33-1.16 1.14-1.16 2.77s1.19 3.21 1.36 3.43c.17.22 2.34 3.58 5.68 5.02.79.34 1.41.55 1.89.7.8.25 1.52.22 2.1.13.64-.1 1.98-.81 2.26-1.59.28-.78.28-1.45.2-1.59-.09-.14-.3-.22-.64-.39z"
    />
  </svg>
);

export const FloatingConcierge: React.FC = () => {
  const { settings, openVisitModal } = useSite();
  const [assistantOpen, setAssistantOpen] = useState(false);

  const whatsappUrl = settings.whatsappUrl || 'https://w.app/jessica_imoveis';
  const instagramUrl = settings.instagramUrl || 'https://www.instagram.com/imoveisperfeito/';

  const handleTrackWhatsapp = (origin: string) => {
    trackAnalyticsAsync({
      eventType: 'whatsapp_click',
      path: window.location.pathname,
      entityTitle: origin,
    });
  };

  return (
    <>
      {/* LEFT SIDE: Humanized Virtual Assistant */}
      <div className="fixed bottom-4 left-4 z-40 flex flex-col items-start sm:bottom-6 sm:left-6">
        <AnimatePresence>
          {assistantOpen && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.96 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="mb-3 w-[calc(100vw-2rem)] max-w-[330px] overflow-hidden rounded-2xl border border-[#0B1B32]/15 bg-white shadow-2xl"
              role="dialog"
              aria-label="Assistente virtual Clara"
            >
              <div className="flex items-center justify-between bg-[#0B1B32] px-4 py-3.5 text-white">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-[#E7C98F]">
                    <SafeImage
                      src={ASSISTANT_PHOTO}
                      alt="Clara — Assistente Virtual"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-editorial text-lg font-semibold leading-tight text-white">
                      Clara · Assistente Virtual
                    </p>
                    <p className="text-[11px] text-[#E7C98F]">
                      Atendimento {settings.brandName}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAssistantOpen(false)}
                  aria-label="Fechar assistente"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-4 space-y-3 bg-[#FAF8F5]">
                <p className="rounded-xl border border-[#0B1B32]/10 bg-white p-3.5 text-xs leading-relaxed text-[#0B1B32]/85">
                  Olá! Eu sou a <strong>Clara</strong>, assistente da corretora <strong>Jéssica Perfeito</strong> ({settings.creci}). Posso conectar você agora mesmo às nossas redes sociais oficiais para atendimento direto ou acompanhar novidades no Rio de Janeiro:
                </p>

                <div className="space-y-2">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleTrackWhatsapp('Assistente Clara -> WhatsApp')}
                    className="flex items-center justify-between rounded-xl border border-[#25D366]/35 bg-white px-3.5 py-2.5 text-xs font-semibold text-[#0B1B32] transition-colors hover:bg-[#25D366]/10"
                  >
                    <span className="flex items-center gap-2.5">
                      <OfficialWhatsAppIcon className="h-5 w-5 shrink-0" />
                      <span>Conversar no WhatsApp</span>
                    </span>
                    <ExternalLink className="h-3.5 w-3.5 text-[#0B1B32]/50" />
                  </a>

                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-xl border border-[#0B1B32]/15 bg-white px-3.5 py-2.5 text-xs font-semibold text-[#0B1B32] transition-colors hover:bg-[#EFEAE2]"
                  >
                    <span className="flex items-center gap-2.5">
                      <OfficialInstagramIcon className="h-5 w-5 shrink-0" />
                      <span>Instagram {settings.instagramHandle || '@imoveisperfeito'}</span>
                    </span>
                    <ExternalLink className="h-3.5 w-3.5 text-[#0B1B32]/50" />
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      setAssistantOpen(false);
                      openVisitModal(null);
                    }}
                    className="flex w-full items-center justify-between rounded-xl bg-[#0B1B32] px-3.5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#112645] cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      <Calendar className="h-4 w-4 text-[#E7C98F]" />
                      <span>Agendar visita pelo site</span>
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="button"
          onClick={() => setAssistantOpen((prev) => !prev)}
          aria-expanded={assistantOpen}
          aria-label="Abrir assistente virtual Clara para acessar redes sociais"
          className="group flex items-center gap-2.5 rounded-full border border-[#B8863B]/45 bg-white/95 py-1.5 pl-1.5 pr-4 shadow-[0_8px_28px_rgba(11,27,50,0.16)] backdrop-blur-md transition-transform duration-200 hover:-translate-y-0.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8863B]"
        >
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 border-[#B8863B]">
            <SafeImage
              src={ASSISTANT_PHOTO}
              alt="Clara — Assistente Virtual"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="text-left">
            <span className="block text-xs font-bold leading-tight text-[#0B1B32]">
              Clara
            </span>
            <span className="block text-[11px] font-medium leading-tight text-[#9E712E]">
              Assistente Virtual
            </span>
          </div>
        </button>
      </div>

      {/* RIGHT SIDE: Official Instagram & WhatsApp Floating Icons */}
      <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram oficial @imoveisperfeito"
          title={`Instagram ${settings.instagramHandle || '@imoveisperfeito'}`}
          className="group flex h-12 w-12 items-center justify-center rounded-full border border-white/60 bg-white shadow-[0_8px_24px_rgba(11,27,50,0.18)] transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B8863B]"
        >
          <OfficialInstagramIcon className="h-7 w-7" />
        </a>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleTrackWhatsapp('Botão Flutuante WhatsApp')}
          aria-label="Conversar no WhatsApp oficial"
          title="WhatsApp Oficial"
          className="group flex h-12 w-12 items-center justify-center rounded-full border border-white/60 bg-[#25D366] shadow-[0_8px_24px_rgba(37,211,102,0.35)] transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]"
        >
          <OfficialWhatsAppIcon className="h-9 w-9" />
        </a>
      </div>
    </>
  );
};
