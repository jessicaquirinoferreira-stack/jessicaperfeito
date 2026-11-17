import React, { useEffect } from 'react';
import { Instagram, MapPin, MessageCircle } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { trackAnalyticsEvent } from '../services/firestoreService';
import { LeadCaptureForm } from '../components/common/LeadCaptureForm';

export const ContatoPage: React.FC = () => {
  const { settings, profile } = useSite();

  useEffect(() => {
    document.title = `Contato e Agendamento | ${settings.brandName}`;
    void trackAnalyticsEvent({
      eventType: 'page_view',
      path: '/contato',
      entityTitle: 'Contato',
    });
  }, [settings.brandName]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#9E712E]">
            Atendimento Direto · {settings.creci}
          </p>
          <h1 className="mt-2 font-editorial text-4xl font-semibold text-[#0B1B32] sm:text-5xl">
            Vamos conversar sobre o seu próximo lar
          </h1>
          <p className="mt-4 text-base leading-relaxed text-[#0B1B32]/78">
            Envie sua mensagem ou sugira um horário para visita. Cada atendimento é acompanhado de perto por {profile.name} para esclarecer dúvidas e confirmar condições vigentes.
          </p>

          <div className="mt-8 space-y-4 border-t border-[#0B1B32]/10 pt-6 text-sm text-[#0B1B32]/80">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 text-[#B8863B]" />
              <span>Rio de Janeiro · Foco em Porto Maravilha e Região Portuária</span>
            </div>
            {settings.instagramUrl && (
              <div className="flex items-center gap-3">
                <Instagram className="h-4 w-4 text-[#B8863B]" />
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium hover:text-[#9E712E] underline"
                >
                  {settings.instagramHandle}
                </a>
              </div>
            )}
            {settings.whatsappUrl && (
              <div className="flex items-center gap-3">
                <MessageCircle className="h-4 w-4 text-[#B8863B]" />
                <a
                  href={settings.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium hover:text-[#9E712E] underline"
                >
                  Link oficial de atendimento (WhatsApp)
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-[#0B1B32]/12 bg-white p-6 sm:p-10 shadow-sm">
            <h2 className="font-editorial text-3xl font-semibold text-[#0B1B32]">
              Solicitar contato ou agendar visita
            </h2>
            <p className="mt-1.5 text-xs text-[#0B1B32]/65">
              Preencha seus dados abaixo para registro seguro no nosso atendimento.
            </p>
            <div className="mt-6">
              <LeadCaptureForm mode="visit" sourceLabel="/contato" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
