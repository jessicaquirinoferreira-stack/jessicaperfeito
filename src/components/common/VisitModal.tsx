import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { useSite } from '../../context/SiteContext';
import { LeadCaptureForm } from './LeadCaptureForm';

export const VisitModal: React.FC = () => {
  const { isVisitModalOpen, closeVisitModal, visitModalProperty } = useSite();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeVisitModal();
    };
    if (isVisitModalOpen) {
      window.addEventListener('keydown', onKeyDown);
    }
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isVisitModalOpen, closeVisitModal]);

  return (
    <AnimatePresence>
      {isVisitModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#06101F]/70 p-4 backdrop-blur-sm"
          onClick={closeVisitModal}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-[#0B1B32]/15 bg-[#FAF8F5] p-6 shadow-2xl sm:p-8"
          >
            <button
              type="button"
              onClick={closeVisitModal}
              aria-label="Fechar janela"
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#0B1B32]/15 text-[#0B1B32]/70 hover:bg-[#0B1B32]/5 hover:text-[#0B1B32] cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <p className="text-xs font-semibold uppercase tracking-widest text-[#9E712E]">
              Atendimento Personalizado · CRECI 78861
            </p>
            <h2 className="mt-1 font-editorial text-3xl font-semibold text-[#0B1B32]">
              Agendar visita ou conversa
            </h2>
            <p className="mt-2 text-sm text-[#0B1B32]/70 leading-relaxed">
              {visitModalProperty
                ? `Imóvel selecionado: ${visitModalProperty.title}. Informe seus dados para confirmarmos disponibilidade e horário.`
                : 'Escolha uma data sugerida e conte o que você busca no Rio de Janeiro.'}
            </p>

            <div className="mt-6">
              <LeadCaptureForm
                mode="visit"
                defaultPropertyId={visitModalProperty?.id}
                defaultPropertyTitle={visitModalProperty?.title}
                sourceLabel="modal-agendar-visita"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const LgpdBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('jp_lgpd_consent');
    if (!accepted) {
      const timer = setTimeout(() => setVisible(true), 1800);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 left-1/2 z-30 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-xl border border-[#0B1B32]/15 bg-white/95 p-3.5 shadow-xl backdrop-blur-md sm:bottom-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-[#0B1B32]/80">
          Utilizamos cookies essenciais e métricas de navegação para melhorar seu atendimento conforme a LGPD.{' '}
          <Link to="/privacidade" className="font-semibold text-[#9E712E] underline">
            Saiba mais
          </Link>
          .
        </p>
        <button
          type="button"
          onClick={() => {
            localStorage.setItem('jp_lgpd_consent', '1');
            setVisible(false);
          }}
          className="shrink-0 rounded-lg bg-[#0B1B32] px-4 py-2 text-xs font-semibold text-white hover:bg-[#112645] cursor-pointer"
        >
          Aceitar
        </button>
      </div>
    </div>
  );
};
