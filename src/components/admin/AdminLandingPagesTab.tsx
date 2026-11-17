import React, { useState } from 'react';
import { Copy, Crown, Edit3, ExternalLink, Plus, Trash2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSite } from '../../context/SiteContext';
import { slugify } from '../../lib/utils';
import { removeLandingPage, saveLandingPage } from '../../services/firestoreService';
import type { LandingPageItem, LandingPageStatus } from '../../types/domain';

const EMPTY_LP: Partial<LandingPageItem> = {
  title: '',
  slug: '',
  routePrefix: 'oportunidade',
  isPremiumShowcase: false,
  targetType: 'property',
  targetIds: [],
  heroHeadline: '',
  heroSubheadline: '',
  heroImage: '',
  editorialStory: '',
  conditionHighlight: '',
  ctaText: 'Agendar atendimento',
  gallery: [],
  status: 'publicada',
  seoTitle: '',
  seoDescription: '',
};

export const AdminLandingPagesTab: React.FC = () => {
  const { landingPages, properties, empreendimentos, media, refreshAll } = useSite();
  const [editing, setEditing] = useState<Partial<LandingPageItem> | null>(null);
  const [galleryText, setGalleryText] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');

  const currentPremium = landingPages.find((l) => l.isPremiumShowcase);

  const openEditor = (lp?: LandingPageItem) => {
    const target = lp ? { ...lp } : { ...EMPTY_LP };
    setEditing(target);
    setGalleryText((target.gallery || []).join('\n'));
    setFeedback('');
  };

  const toggleTargetId = (id: string) => {
    if (!editing) return;
    const current = editing.targetIds || [];
    const exists = current.includes(id);
    const next = exists ? current.filter((item) => item !== id) : [...current, id].slice(0, 6);
    setEditing({ ...editing, targetIds: next });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing || !editing.title?.trim()) return;
    setSaving(true);
    setFeedback('');
    try {
      await saveLandingPage(
        {
          ...editing,
          slug: editing.slug || slugify(editing.title),
          gallery: galleryText.split('\n').map((s) => s.trim()).filter(Boolean),
        },
        landingPages
      );
      await refreshAll();
      setEditing(null);
      setFeedback('Landing page salva com sucesso.');
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Erro ao salvar landing page.');
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicate = async (lp: LandingPageItem) => {
    await saveLandingPage(
      {
        ...lp,
        id: undefined,
        title: `${lp.title} (Cópia)`,
        slug: `${lp.slug}-copia-${Date.now().toString().slice(-4)}`,
        isPremiumShowcase: false,
        status: 'rascunho',
      },
      landingPages
    );
    await refreshAll();
  };

  const handleStatusChange = async (lp: LandingPageItem, status: LandingPageStatus) => {
    await saveLandingPage({ ...lp, status }, landingPages);
    await refreshAll();
  };

  const handleSetPremium = async (lp: LandingPageItem) => {
    await saveLandingPage({ ...lp, isPremiumShowcase: true, status: 'publicada' }, landingPages);
    await refreshAll();
    setFeedback(`"${lp.title}" agora é a Landing Page Premium exclusiva do site.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-editorial text-3xl font-semibold text-[#0B1B32]">Landing Pages</h2>
          <p className="text-xs text-[#0B1B32]/65">
            Crie campanhas compartilháveis e defina exatamente 1 Landing Page Premium com experiência imersiva completa.
          </p>
        </div>
        <button
          type="button"
          onClick={() => openEditor()}
          className="inline-flex items-center gap-2 rounded-lg bg-[#0B1B32] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#112645] cursor-pointer"
        >
          <Plus className="h-4 w-4 text-[#E7C98F]" />
          <span>Nova landing page</span>
        </button>
      </div>

      {currentPremium && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#B8863B]/40 bg-[#EFEAE2]/75 px-5 py-4 text-xs">
          <div className="flex items-center gap-2.5">
            <Crown className="h-4 w-4 text-[#9E712E]" />
            <span>
              <strong>Landing Page Premium ativa (1 por projeto):</strong> {currentPremium.title} (
              <code>/{currentPremium.routePrefix}/{currentPremium.slug}</code>)
            </span>
          </div>
          <Link
            to={`/${currentPremium.routePrefix}/${currentPremium.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1 font-semibold text-[#0B1B32] hover:text-[#9E712E]"
          >
            <span>Visualizar ao vivo</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {feedback && (
        <p className="rounded-lg border border-[#B8863B]/30 bg-white px-4 py-2.5 text-xs font-medium text-[#0B1B32]">
          {feedback}
        </p>
      )}

      {editing && (
        <form onSubmit={handleSave} className="rounded-2xl border border-[#0B1B32]/15 bg-white p-6 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#0B1B32]/10 pb-3">
            <h3 className="font-editorial text-2xl font-semibold text-[#0B1B32]">
              {editing.id ? 'Editar Landing Page' : 'Criar Landing Page'}
            </h3>
            <button type="button" onClick={() => setEditing(null)} className="p-1 text-[#0B1B32]/60 cursor-pointer">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#0B1B32]/75 mb-1">Título interno *</label>
              <input
                type="text"
                required
                value={editing.title || ''}
                onChange={(e) => setEditing({ ...editing, title: e.target.value, slug: editing.id ? editing.slug : slugify(e.target.value) })}
                className="w-full rounded-lg border border-[#0B1B32]/18 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#0B1B32]/75 mb-1">Rota base</label>
              <select
                value={editing.routePrefix || 'oportunidade'}
                onChange={(e) => setEditing({ ...editing, routePrefix: e.target.value as 'oportunidade' | 'campanha' })}
                className="w-full rounded-lg border border-[#0B1B32]/18 px-3 py-2 text-sm"
              >
                <option value="oportunidade">/oportunidade/...</option>
                <option value="campanha">/campanha/...</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#0B1B32]/75 mb-1">Slug *</label>
              <input
                type="text"
                required
                value={editing.slug || ''}
                onChange={(e) => setEditing({ ...editing, slug: slugify(e.target.value) })}
                className="w-full rounded-lg border border-[#0B1B32]/18 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-[#0B1B32]/75 mb-1">Headline do Hero *</label>
              <input
                type="text"
                required
                value={editing.heroHeadline || ''}
                onChange={(e) => setEditing({ ...editing, heroHeadline: e.target.value })}
                className="w-full rounded-lg border border-[#0B1B32]/18 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#0B1B32]/75 mb-1">Destaque de condição</label>
              <input
                type="text"
                value={editing.conditionHighlight || ''}
                onChange={(e) => setEditing({ ...editing, conditionHighlight: e.target.value })}
                className="w-full rounded-lg border border-[#0B1B32]/18 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#0B1B32]/75 mb-1">Subtítulo do Hero</label>
            <textarea
              rows={2}
              value={editing.heroSubheadline || ''}
              onChange={(e) => setEditing({ ...editing, heroSubheadline: e.target.value })}
              className="w-full rounded-lg border border-[#0B1B32]/18 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#0B1B32]/75 mb-1">Narrativa editorial</label>
            <textarea
              rows={3}
              value={editing.editorialStory || ''}
              onChange={(e) => setEditing({ ...editing, editorialStory: e.target.value })}
              className="w-full rounded-lg border border-[#0B1B32]/18 px-3 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-[#0B1B32]/75 mb-1">Imagem de capa / OG</label>
              <input
                type="text"
                value={editing.heroImage || ''}
                onChange={(e) => setEditing({ ...editing, heroImage: e.target.value })}
                className="w-full rounded-lg border border-[#0B1B32]/18 px-3 py-2 text-sm"
              />
              {media.length > 0 && (
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) setEditing({ ...editing, heroImage: e.target.value });
                  }}
                  className="mt-1.5 w-full rounded-lg border border-[#0B1B32]/12 bg-[#FAF8F5] px-2.5 py-1.5 text-xs"
                >
                  <option value="">Selecionar imagem da biblioteca...</option>
                  {media.map((m) => (
                    <option key={m.id} value={m.url}>{m.name}</option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-[#0B1B32]/75 mb-1">Galeria (1 URL por linha)</label>
              <textarea
                rows={3}
                value={galleryText}
                onChange={(e) => setGalleryText(e.target.value)}
                className="w-full rounded-lg border border-[#0B1B32]/18 px-3 py-2 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#0B1B32]/75 mb-2">
              Imóveis e empreendimentos vinculados (até 6)
            </label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {empreendimentos.map((d) => (
                <label key={d.id} className="flex items-center gap-2 rounded-lg border border-[#0B1B32]/10 p-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(editing.targetIds || []).includes(d.id)}
                    onChange={() => toggleTargetId(d.id)}
                  />
                  <span>Empreendimento: {d.name}</span>
                </label>
              ))}
              {properties.map((p) => (
                <label key={p.id} className="flex items-center gap-2 rounded-lg border border-[#0B1B32]/10 p-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(editing.targetIds || []).includes(p.id)}
                    onChange={() => toggleTargetId(p.id)}
                  />
                  <span>Imóvel: {p.title}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-[#0B1B32]/75 mb-1">Texto do botão CTA</label>
              <input
                type="text"
                value={editing.ctaText || ''}
                onChange={(e) => setEditing({ ...editing, ctaText: e.target.value })}
                className="w-full rounded-lg border border-[#0B1B32]/18 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#0B1B32]/75 mb-1">SEO Title</label>
              <input
                type="text"
                value={editing.seoTitle || ''}
                onChange={(e) => setEditing({ ...editing, seoTitle: e.target.value })}
                className="w-full rounded-lg border border-[#0B1B32]/18 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#0B1B32]/75 mb-1">Status</label>
              <select
                value={editing.status || 'publicada'}
                onChange={(e) => setEditing({ ...editing, status: e.target.value as LandingPageStatus })}
                className="w-full rounded-lg border border-[#0B1B32]/18 px-3 py-2 text-sm"
              >
                <option value="publicada">Publicada</option>
                <option value="pausada">Pausada</option>
                <option value="rascunho">Rascunho</option>
              </select>
            </div>
          </div>

          <label className="flex items-start gap-2.5 rounded-xl border border-[#B8863B]/40 bg-[#EFEAE2]/50 p-3 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(editing.isPremiumShowcase)}
              onChange={(e) => setEditing({ ...editing, isPremiumShowcase: e.target.checked })}
              className="mt-0.5"
            />
            <span>
              <strong className="text-[#0B1B32]">Definir como Landing Page Premium Exclusiva (1 por site)</strong>
              <span className="block text-[#0B1B32]/70">
                Ativa o layout completo com Aurora, Particles, SplitText, Parallax e BorderBeam. Caso outra página já esteja marcada como Premium, ela será convertida automaticamente para o modelo padrão.
              </span>
            </span>
          </label>

          <div className="flex justify-end gap-3 border-t border-[#0B1B32]/10 pt-4">
            <button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-[#0B1B32]/20 px-4 py-2 text-xs font-semibold cursor-pointer">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="rounded-lg bg-[#B8863B] px-5 py-2 text-xs font-semibold text-white hover:bg-[#9E712E] cursor-pointer">
              {saving ? 'Salvando...' : 'Salvar landing page'}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4">
        {landingPages.map((lp) => (
          <div key={lp.id} className="flex flex-col justify-between gap-4 rounded-xl border border-[#0B1B32]/12 bg-white p-5 sm:flex-row sm:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#0B1B32]/65">
                <span className="font-mono">/{lp.routePrefix}/{lp.slug}</span>
                <span>·</span>
                <span className="capitalize">{lp.status}</span>
                {lp.isPremiumShowcase && (
                  <>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1 font-semibold text-[#9E712E]">
                      <Crown className="h-3.5 w-3.5" />
                      Premium Exclusiva
                    </span>
                  </>
                )}
              </div>
              <h4 className="mt-1 font-editorial text-2xl font-semibold text-[#0B1B32]">{lp.title}</h4>
              <p className="text-xs text-[#0B1B32]/70">{lp.heroHeadline}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {!lp.isPremiumShowcase && (
                <button
                  type="button"
                  onClick={() => void handleSetPremium(lp)}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#B8863B]/45 px-2.5 py-1.5 text-xs font-semibold text-[#9E712E] hover:bg-[#B8863B]/10 cursor-pointer"
                >
                  <Crown className="h-3.5 w-3.5" />
                  <span>Tornar Premium</span>
                </button>
              )}
              <select
                value={lp.status}
                onChange={(e) => void handleStatusChange(lp, e.target.value as LandingPageStatus)}
                className="rounded-lg border border-[#0B1B32]/15 px-2.5 py-1.5 text-xs font-medium"
              >
                <option value="publicada">Publicada</option>
                <option value="pausada">Pausada</option>
                <option value="rascunho">Rascunho</option>
              </select>
              <Link
                to={`/${lp.routePrefix}/${lp.slug}`}
                target="_blank"
                className="inline-flex items-center gap-1 rounded-lg border border-[#0B1B32]/15 px-2.5 py-1.5 text-xs font-medium text-[#0B1B32] hover:bg-[#0B1B32]/5"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => openEditor(lp)}
                className="inline-flex items-center gap-1 rounded-lg border border-[#0B1B32]/15 px-2.5 py-1.5 text-xs font-medium text-[#0B1B32] hover:bg-[#0B1B32]/5 cursor-pointer"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>Editar</span>
              </button>
              <button
                type="button"
                onClick={() => void handleDuplicate(lp)}
                className="inline-flex items-center gap-1 rounded-lg border border-[#0B1B32]/15 px-2.5 py-1.5 text-xs font-medium text-[#0B1B32] hover:bg-[#0B1B32]/5 cursor-pointer"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={async () => {
                  await removeLandingPage(lp.id);
                  await refreshAll();
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
