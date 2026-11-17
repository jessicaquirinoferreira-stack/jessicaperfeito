import React, { useState } from 'react';
import { Edit3, Eye, EyeOff, Plus, Star, Trash2, X } from 'lucide-react';
import { useSite } from '../../context/SiteContext';
import { slugify } from '../../lib/utils';
import { removeEmpreendimento, saveEmpreendimento } from '../../services/firestoreService';
import type { EmpreendimentoItem } from '../../types/domain';
import { SafeImage } from '../common/SafeImage';

const EMPTY_DEV: Partial<EmpreendimentoItem> = {
  name: '',
  slug: '',
  location: 'Rio de Janeiro - RJ',
  status: 'A confirmar com a corretora',
  entryCondition: '',
  description: '',
  highlights: [],
  coverImage: '',
  gallery: [],
  featured: true,
  published: true,
};

export const AdminEmpreendimentosTab: React.FC = () => {
  const { empreendimentos, properties, media, refreshAll } = useSite();
  const [editing, setEditing] = useState<Partial<EmpreendimentoItem> | null>(null);
  const [highlightsText, setHighlightsText] = useState('');
  const [galleryText, setGalleryText] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');

  const openEditor = (dev?: EmpreendimentoItem) => {
    const target = dev ? { ...dev } : { ...EMPTY_DEV };
    setEditing(target);
    setHighlightsText((target.highlights || []).join('\n'));
    setGalleryText((target.gallery || []).join('\n'));
    setFeedback('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing || !editing.name?.trim()) return;
    setSaving(true);
    setFeedback('');
    try {
      await saveEmpreendimento({
        ...editing,
        slug: editing.slug || slugify(editing.name),
        highlights: highlightsText.split('\n').map((s) => s.trim()).filter(Boolean),
        gallery: galleryText.split('\n').map((s) => s.trim()).filter(Boolean),
      });
      await refreshAll();
      setEditing(null);
      setFeedback('Empreendimento salvo com sucesso.');
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Erro ao salvar empreendimento.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await removeEmpreendimento(id);
    await refreshAll();
  };

  const handleTogglePublished = async (dev: EmpreendimentoItem) => {
    await saveEmpreendimento({ ...dev, published: !dev.published });
    await refreshAll();
  };

  const handleToggleFeatured = async (dev: EmpreendimentoItem) => {
    await saveEmpreendimento({ ...dev, featured: !dev.featured });
    await refreshAll();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-editorial text-3xl font-semibold text-[#0B1B32]">Empreendimentos</h2>
          <p className="text-xs text-[#0B1B32]/65">
            Adicione novos empreendimentos, edite os existentes ou remova registros.
          </p>
        </div>
        <button
          type="button"
          onClick={() => openEditor()}
          className="inline-flex items-center gap-2 rounded-lg bg-[#0B1B32] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#112645] cursor-pointer"
        >
          <Plus className="h-4 w-4 text-[#E7C98F]" />
          <span>Adicionar empreendimento</span>
        </button>
      </div>

      {feedback && (
        <p className="rounded-lg border border-[#B8863B]/30 bg-[#EFEAE2] px-4 py-2.5 text-xs font-medium text-[#0B1B32]">
          {feedback}
        </p>
      )}

      {editing && (
        <form onSubmit={handleSave} className="rounded-2xl border border-[#0B1B32]/15 bg-white p-6 space-y-5 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#0B1B32]/10 pb-3">
            <h3 className="font-editorial text-2xl font-semibold text-[#0B1B32]">
              {editing.id ? 'Editar empreendimento' : 'Novo empreendimento'}
            </h3>
            <button type="button" onClick={() => setEditing(null)} className="p-1 text-[#0B1B32]/60 cursor-pointer">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-[#0B1B32]/75 mb-1">Nome do empreendimento *</label>
              <input
                type="text"
                required
                value={editing.name || ''}
                onChange={(e) => setEditing({ ...editing, name: e.target.value, slug: editing.id ? editing.slug : slugify(e.target.value) })}
                className="w-full rounded-lg border border-[#0B1B32]/18 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#0B1B32]/75 mb-1">Slug (URL)</label>
              <input
                type="text"
                value={editing.slug || ''}
                onChange={(e) => setEditing({ ...editing, slug: slugify(e.target.value) })}
                className="w-full rounded-lg border border-[#0B1B32]/18 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-[#0B1B32]/75 mb-1">Localização *</label>
              <input
                type="text"
                required
                value={editing.location || ''}
                onChange={(e) => setEditing({ ...editing, location: e.target.value })}
                className="w-full rounded-lg border border-[#0B1B32]/18 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#0B1B32]/75 mb-1">Status *</label>
              <input
                type="text"
                required
                value={editing.status || ''}
                onChange={(e) => setEditing({ ...editing, status: e.target.value })}
                placeholder="Lançamento, Em obras, A confirmar..."
                className="w-full rounded-lg border border-[#0B1B32]/18 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#0B1B32]/75 mb-1">Condição em destaque</label>
              <input
                type="text"
                value={editing.entryCondition || ''}
                onChange={(e) => setEditing({ ...editing, entryCondition: e.target.value })}
                placeholder="Ex: Sinal ref. R$ 400 (a confirmar)"
                className="w-full rounded-lg border border-[#0B1B32]/18 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-[#0B1B32]/75 mb-1">Imagem de capa</label>
              <input
                type="text"
                value={editing.coverImage || ''}
                onChange={(e) => setEditing({ ...editing, coverImage: e.target.value })}
                className="w-full rounded-lg border border-[#0B1B32]/18 px-3 py-2 text-sm"
              />
              {media.length > 0 && (
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) setEditing({ ...editing, coverImage: e.target.value });
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-[#0B1B32]/75 mb-1">Descrição</label>
              <textarea
                rows={4}
                value={editing.description || ''}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                className="w-full rounded-lg border border-[#0B1B32]/18 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#0B1B32]/75 mb-1">Diferenciais / observações (1 por linha)</label>
              <textarea
                rows={4}
                value={highlightsText}
                onChange={(e) => setHighlightsText(e.target.value)}
                className="w-full rounded-lg border border-[#0B1B32]/18 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-6 text-xs font-medium">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(editing.published)}
                onChange={(e) => setEditing({ ...editing, published: e.target.checked })}
              />
              <span>Publicado no site</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(editing.featured)}
                onChange={(e) => setEditing({ ...editing, featured: e.target.checked })}
              />
              <span>Destacar na Home</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 border-t border-[#0B1B32]/10 pt-4">
            <button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-[#0B1B32]/20 px-4 py-2 text-xs font-semibold cursor-pointer">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="rounded-lg bg-[#B8863B] px-5 py-2 text-xs font-semibold text-white hover:bg-[#9E712E] cursor-pointer">
              {saving ? 'Salvando...' : 'Salvar empreendimento'}
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 gap-4">
        {empreendimentos.map((dev) => {
          const linkedCount = properties.filter((p) => p.developmentId === dev.id).length;
          return (
            <div key={dev.id} className="flex flex-col justify-between gap-4 rounded-xl border border-[#0B1B32]/12 bg-white p-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-4">
                <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-[#EFEAE2]">
                  <SafeImage src={dev.coverImage} alt={dev.name} className="h-full w-full object-cover" />
                </div>
                <div>
                  <p className="text-xs text-[#0B1B32]/60">
                    {dev.location} · {linkedCount} imóveis vinculados
                  </p>
                  <h4 className="font-editorial text-xl font-semibold text-[#0B1B32]">{dev.name}</h4>
                  <p className="text-xs text-[#9E712E]">{dev.status}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => void handleToggleFeatured(dev)}
                  className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium cursor-pointer ${
                    dev.featured ? 'border-[#B8863B] bg-[#B8863B]/15 text-[#9E712E]' : 'border-[#0B1B32]/15 text-[#0B1B32]/60'
                  }`}
                >
                  <Star className="h-3.5 w-3.5" />
                  <span>Destaque</span>
                </button>
                <button
                  type="button"
                  onClick={() => void handleTogglePublished(dev)}
                  className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium cursor-pointer ${
                    dev.published ? 'border-emerald-600/30 bg-emerald-50 text-emerald-800' : 'border-[#0B1B32]/15 text-[#0B1B32]/60'
                  }`}
                >
                  {dev.published ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  <span>{dev.published ? 'Publicado' : 'Oculto'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => openEditor(dev)}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#0B1B32]/15 px-2.5 py-1.5 text-xs font-medium text-[#0B1B32] hover:bg-[#0B1B32]/5 cursor-pointer"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Editar</span>
                </button>
                <button
                  type="button"
                  onClick={() => void handleDelete(dev.id)}
                  className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Remover</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
