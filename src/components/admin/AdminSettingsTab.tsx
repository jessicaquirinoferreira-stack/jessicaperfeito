import React, { useState } from 'react';
import { Save } from 'lucide-react';
import { useSite } from '../../context/SiteContext';
import { saveProfessionalProfile, saveSiteSettings } from '../../services/firestoreService';
import type { ProfessionalProfile, SiteSettings } from '../../types/domain';

export const AdminSettingsTab: React.FC = () => {
  const { settings, profile, user, refreshAll } = useSite();
  const [siteForm, setSiteForm] = useState<SiteSettings>(settings);
  const [profForm, setProfForm] = useState<ProfessionalProfile>(profile);
  const [highlightsText, setHighlightsText] = useState((profile.highlights || []).join('\n'));
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setFeedback('');
    try {
      await saveSiteSettings(siteForm, user.uid);
      await saveProfessionalProfile({
        ...profForm,
        highlights: highlightsText.split('\n').map((s) => s.trim()).filter(Boolean),
      });
      await refreshAll();
      setFeedback('Configurações do site e perfil profissional salvos no Firestore.');
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Erro ao salvar configurações.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-editorial text-3xl font-semibold text-[#0B1B32]">
            Configurações do Site, Marca & SEO
          </h2>
          <p className="text-xs text-[#0B1B32]/65">
            Edite identidade visual, textos, WhatsApp, redes sociais, GA4/GTM e perfil profissional.
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-[#B8863B] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#9E712E] cursor-pointer"
        >
          <Save className="h-4 w-4" />
          <span>{saving ? 'Salvando...' : 'Salvar tudo'}</span>
        </button>
      </div>

      {feedback && (
        <p className="rounded-lg border border-[#B8863B]/30 bg-white px-4 py-2.5 text-xs font-medium text-[#0B1B32]">
          {feedback}
        </p>
      )}

      {/* Branding & Colors */}
      <div className="rounded-2xl border border-[#0B1B32]/12 bg-white p-6 space-y-4">
        <h3 className="font-editorial text-2xl font-semibold text-[#0B1B32]">Identidade Visual & Contato</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-[#0B1B32]/75 mb-1">Nome da marca</label>
            <input
              type="text"
              value={siteForm.brandName}
              onChange={(e) => setSiteForm({ ...siteForm, brandName: e.target.value })}
              className="w-full rounded-lg border border-[#0B1B32]/18 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#0B1B32]/75 mb-1">Monograma</label>
            <input
              type="text"
              value={siteForm.brandMonogram}
              onChange={(e) => setSiteForm({ ...siteForm, brandMonogram: e.target.value })}
              className="w-full rounded-lg border border-[#0B1B32]/18 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#0B1B32]/75 mb-1">CRECI</label>
            <input
              type="text"
              value={siteForm.creci}
              onChange={(e) => setSiteForm({ ...siteForm, creci: e.target.value })}
              className="w-full rounded-lg border border-[#0B1B32]/18 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-medium text-[#0B1B32]/75 mb-1">Cor primária</label>
            <input
              type="color"
              value={siteForm.primaryColor}
              onChange={(e) => setSiteForm({ ...siteForm, primaryColor: e.target.value })}
              className="h-10 w-full rounded-lg border border-[#0B1B32]/18 p-1"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#0B1B32]/75 mb-1">Cor destaque (dourado/bronze)</label>
            <input
              type="color"
              value={siteForm.accentColor}
              onChange={(e) => setSiteForm({ ...siteForm, accentColor: e.target.value })}
              className="h-10 w-full rounded-lg border border-[#0B1B32]/18 p-1"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#0B1B32]/75 mb-1">URL da Logo (opcional)</label>
            <input
              type="text"
              value={siteForm.logoUrl}
              onChange={(e) => setSiteForm({ ...siteForm, logoUrl: e.target.value })}
              className="w-full rounded-lg border border-[#0B1B32]/18 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-medium text-[#0B1B32]/75 mb-1">Link WhatsApp oficial</label>
            <input
              type="text"
              value={siteForm.whatsappUrl}
              onChange={(e) => setSiteForm({ ...siteForm, whatsappUrl: e.target.value })}
              className="w-full rounded-lg border border-[#0B1B32]/18 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#0B1B32]/75 mb-1">URL Instagram</label>
            <input
              type="text"
              value={siteForm.instagramUrl}
              onChange={(e) => setSiteForm({ ...siteForm, instagramUrl: e.target.value })}
              className="w-full rounded-lg border border-[#0B1B32]/18 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#0B1B32]/75 mb-1">Usuário Instagram</label>
            <input
              type="text"
              value={siteForm.instagramHandle}
              onChange={(e) => setSiteForm({ ...siteForm, instagramHandle: e.target.value })}
              className="w-full rounded-lg border border-[#0B1B32]/18 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Hero & Institucional */}
      <div className="rounded-2xl border border-[#0B1B32]/12 bg-white p-6 space-y-4">
        <h3 className="font-editorial text-2xl font-semibold text-[#0B1B32]">Home & Perfil Profissional</h3>
        <div>
          <label className="block text-xs font-medium text-[#0B1B32]/75 mb-1">Frase principal do Hero</label>
          <input
            type="text"
            value={siteForm.heroTitle}
            onChange={(e) => setSiteForm({ ...siteForm, heroTitle: e.target.value })}
            className="w-full rounded-lg border border-[#0B1B32]/18 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#0B1B32]/75 mb-1">Subtítulo do Hero</label>
          <textarea
            rows={2}
            value={siteForm.heroSubtitle}
            onChange={(e) => setSiteForm({ ...siteForm, heroSubtitle: e.target.value })}
            className="w-full rounded-lg border border-[#0B1B32]/18 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#0B1B32]/75 mb-1">Biografia institucional (Sobre)</label>
          <textarea
            rows={3}
            value={profForm.bio}
            onChange={(e) => setProfForm({ ...profForm, bio: e.target.value })}
            className="w-full rounded-lg border border-[#0B1B32]/18 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#0B1B32]/75 mb-1">Diferenciais (1 por linha)</label>
          <textarea
            rows={3}
            value={highlightsText}
            onChange={(e) => setHighlightsText(e.target.value)}
            className="w-full rounded-lg border border-[#0B1B32]/18 px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* SEO & Analytics */}
      <div className="rounded-2xl border border-[#0B1B32]/12 bg-white p-6 space-y-4">
        <h3 className="font-editorial text-2xl font-semibold text-[#0B1B32]">SEO, GA4, GTM & Search Console</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-[#0B1B32]/75 mb-1">Título SEO (Home)</label>
            <input
              type="text"
              value={siteForm.seoTitle}
              onChange={(e) => setSiteForm({ ...siteForm, seoTitle: e.target.value })}
              className="w-full rounded-lg border border-[#0B1B32]/18 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#0B1B32]/75 mb-1">Meta Description SEO</label>
            <input
              type="text"
              value={siteForm.seoDescription}
              onChange={(e) => setSiteForm({ ...siteForm, seoDescription: e.target.value })}
              className="w-full rounded-lg border border-[#0B1B32]/18 px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div>
            <label className="block text-xs font-medium text-[#0B1B32]/75 mb-1">Google Analytics (GA4 ID)</label>
            <input
              type="text"
              placeholder="G-XXXXXXXXXX"
              value={siteForm.ga4Id}
              onChange={(e) => setSiteForm({ ...siteForm, ga4Id: e.target.value })}
              className="w-full rounded-lg border border-[#0B1B32]/18 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#0B1B32]/75 mb-1">Google Tag Manager</label>
            <input
              type="text"
              placeholder="GTM-XXXXXXX"
              value={siteForm.gtmId}
              onChange={(e) => setSiteForm({ ...siteForm, gtmId: e.target.value })}
              className="w-full rounded-lg border border-[#0B1B32]/18 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#0B1B32]/75 mb-1">Search Console Verification</label>
            <input
              type="text"
              value={siteForm.searchConsoleMeta}
              onChange={(e) => setSiteForm({ ...siteForm, searchConsoleMeta: e.target.value })}
              className="w-full rounded-lg border border-[#0B1B32]/18 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#0B1B32]/75 mb-1">Google Ads ID</label>
            <input
              type="text"
              placeholder="AW-XXXXXXXXX"
              value={siteForm.adsId}
              onChange={(e) => setSiteForm({ ...siteForm, adsId: e.target.value })}
              className="w-full rounded-lg border border-[#0B1B32]/18 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>
    </form>
  );
};
