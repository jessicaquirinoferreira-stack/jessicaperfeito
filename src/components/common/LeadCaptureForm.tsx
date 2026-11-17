import React, { useState } from 'react';
import { CheckCircle2, MessageCircle, Send } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useSite } from '../../context/SiteContext';
import { extractUtmParams } from '../../lib/utils';
import { trackAnalyticsAsync } from '../../services/analytics';

interface LeadCaptureFormProps {
  mode?: 'lead' | 'visit';
  defaultPropertyId?: string;
  defaultPropertyTitle?: string;
  defaultDevelopmentId?: string;
  sourceLabel?: string;
  darkSurface?: boolean;
  onSuccess?: () => void;
}

export const LeadCaptureForm: React.FC<LeadCaptureFormProps> = ({
  mode = 'lead',
  defaultPropertyId = '',
  defaultPropertyTitle = '',
  defaultDevelopmentId = '',
  sourceLabel,
  darkSurface = false,
  onSuccess,
}) => {
  const { properties, settings } = useSite();
  const location = useLocation();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [selectedPropertyId, setSelectedPropertyId] = useState(defaultPropertyId);
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [message, setMessage] = useState('');
  const [lgpdConsent, setLgpdConsent] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const selectedProp = properties.find((p) => p.id === selectedPropertyId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (name.trim().length < 2) {
      setError('Informe seu nome completo.');
      return;
    }
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 8) {
      setError('Informe um telefone ou WhatsApp válido com DDD.');
      return;
    }
    if (!lgpdConsent) {
      setError('É necessário concordar com a Política de Privacidade (LGPD) para enviar.');
      return;
    }

    setSubmitting(true);
    const utm = extractUtmParams(location.search);
    const propTitle = selectedProp?.title || defaultPropertyTitle || 'Interesse geral';

    try {
      const { submitLead, submitVisitRequest } = await import('../../services/firestoreService');
      if (mode === 'visit') {
        await submitVisitRequest({
          name,
          phone,
          email,
          propertyId: selectedPropertyId || defaultPropertyId,
          propertyTitle: propTitle,
          preferredDate,
          preferredTime,
          message,
          source: sourceLabel || location.pathname,
          utmSource: utm.utmSource,
          utmMedium: utm.utmMedium,
          utmCampaign: utm.utmCampaign,
          lgpdConsent,
        });
      } else {
        await submitLead({
          name,
          phone,
          email,
          propertyId: selectedPropertyId || defaultPropertyId,
          propertyTitle: propTitle,
          developmentId: selectedProp?.developmentId || defaultDevelopmentId,
          message,
          source: sourceLabel || location.pathname,
          utmSource: utm.utmSource,
          utmMedium: utm.utmMedium,
          utmCampaign: utm.utmCampaign,
          utmContent: utm.utmContent,
          lgpdConsent,
        });
      }
      setSubmitted(true);
      onSuccess?.();
    } catch {
      setError('Não foi possível registrar seu contato agora. Tente novamente em instantes.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = darkSurface
    ? 'w-full rounded-lg border border-white/20 bg-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-white/50 focus:border-[#E7C98F] focus:outline-none'
    : 'w-full rounded-lg border border-[#0B1B32]/18 bg-white px-3.5 py-2.5 text-sm text-[#0B1B32] placeholder:text-[#0B1B32]/45 focus:border-[#B8863B] focus:outline-none';

  const labelClass = darkSurface
    ? 'block text-xs font-medium text-white/80 mb-1'
    : 'block text-xs font-medium text-[#0B1B32]/75 mb-1';

  if (submitted) {
    return (
      <div
        className={
          darkSurface
            ? 'rounded-xl border border-[#E7C98F]/35 bg-white/10 p-6 text-white'
            : 'rounded-xl border border-emerald-700/20 bg-emerald-50/70 p-6 text-[#0B1B32]'
        }
      >
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-500" />
          <div>
            <h4 className="font-editorial text-2xl font-semibold">
              {mode === 'visit' ? 'Solicitação de visita registrada' : 'Recebemos seu contato'}
            </h4>
            <p className="mt-1.5 text-sm opacity-85 leading-relaxed">
              Obrigado, {name}. Sua solicitação foi registrada com segurança e será respondida diretamente por {settings.brandName}.
            </p>
            {settings.whatsappUrl && (
              <a
                href={settings.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  trackAnalyticsAsync({
                    eventType: 'whatsapp_click',
                    path: location.pathname,
                    entityTitle: 'Lead Form Confirmation',
                  });
                }}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#0B1B32] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#112645] transition-colors"
              >
                <MessageCircle className="h-4 w-4 text-[#E7C98F]" />
                <span>Continuar conversa no WhatsApp</span>
              </a>
            )}
            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setName('');
                setPhone('');
                setEmail('');
                setMessage('');
              }}
              className="mt-4 ml-3 text-xs font-medium underline opacity-75 hover:opacity-100 cursor-pointer"
            >
              Enviar outra mensagem
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Nome completo *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Telefone / WhatsApp *</label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(21) 99999-9999"
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>E-mail (opcional)</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@exemplo.com"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Imóvel de interesse</label>
          <select
            value={selectedPropertyId}
            onChange={(e) => setSelectedPropertyId(e.target.value)}
            className={inputClass}
          >
            <option value="" className="text-[#0B1B32]">
              {defaultPropertyTitle || 'Selecionar imóvel ou empreendimento'}
            </option>
            {properties.map((p) => (
              <option key={p.id} value={p.id} className="text-[#0B1B32]">
                {p.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {mode === 'visit' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Data sugerida</label>
            <input
              type="date"
              value={preferredDate}
              onChange={(e) => setPreferredDate(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Horário preferido</label>
            <select
              value={preferredTime}
              onChange={(e) => setPreferredTime(e.target.value)}
              className={inputClass}
            >
              <option value="" className="text-[#0B1B32]">Selecione um período</option>
              <option value="Manhã (09h - 12h)" className="text-[#0B1B32]">Manhã (09h - 12h)</option>
              <option value="Tarde (13h - 17h)" className="text-[#0B1B32]">Tarde (13h - 17h)</option>
              <option value="Final da tarde (17h - 19h)" className="text-[#0B1B32]">Final da tarde (17h - 19h)</option>
            </select>
          </div>
        </div>
      )}

      <div>
        <label className={labelClass}>Mensagem</label>
        <textarea
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Conte o que você procura (ex: 2 quartos no Porto Maravilha, informações sobre entrada e visita)..."
          className={inputClass}
        />
      </div>

      <label className="flex items-start gap-2.5 text-xs leading-relaxed cursor-pointer">
        <input
          type="checkbox"
          checked={lgpdConsent}
          onChange={(e) => setLgpdConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-[#0B1B32]/30 accent-[#B8863B]"
        />
        <span className={darkSurface ? 'text-white/75' : 'text-[#0B1B32]/70'}>
          Concordo com o tratamento dos meus dados para retorno de atendimento conforme a Política de Privacidade (LGPD).
        </span>
      </label>

      {error && (
        <p className="rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-300">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#B8863B] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#9E712E] disabled:opacity-60 cursor-pointer"
        >
          <Send className="h-4 w-4" />
          <span>
            {submitting
              ? 'Enviando...'
              : mode === 'visit'
                ? 'Confirmar solicitação de visita'
                : 'Enviar mensagem'}
          </span>
        </button>

        {settings.whatsappUrl && (
          <a
            href={settings.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              trackAnalyticsAsync({
                eventType: 'whatsapp_click',
                path: location.pathname,
                entityTitle: 'Form WhatsApp CTA',
              });
            }}
            className={
              darkSurface
                ? 'inline-flex items-center gap-2 rounded-lg border border-white/25 px-4 py-3 text-xs font-semibold text-white hover:bg-white/10 transition-colors'
                : 'inline-flex items-center gap-2 rounded-lg border border-[#0B1B32]/20 px-4 py-3 text-xs font-semibold text-[#0B1B32] hover:bg-[#0B1B32]/5 transition-colors'
            }
          >
            <MessageCircle className="h-4 w-4 text-[#B8863B]" />
            <span>Vamos conversar</span>
          </a>
        )}
      </div>
    </form>
  );
};
