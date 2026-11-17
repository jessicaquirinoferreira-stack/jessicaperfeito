import React, { useState } from 'react';
import { Copy, Edit3, Eye, EyeOff, Plus, Star, Trash2, X } from 'lucide-react';
import { useSite } from '../../context/SiteContext';
import { slugify } from '../../lib/utils';
import { removeProperty, saveProperty } from '../../services/firestoreService';
import type { BusinessType, PropertyItem, PropertyType } from '../../types/domain';
import { SafeImage } from '../common/SafeImage';

const EMPTY_PROP: Partial<PropertyItem> = {
  title: '',
  slug: '',
  code: '',
  businessType: 'Venda',
  propertyType: 'Apartamento',
  region: 'Porto Maravilha, Rio de Janeiro - RJ',
  developmentId: '',
  developmentName: '',
  priceDisplay: 'Sob consulta (a confirmar)',
  priceValue: 0,
  downPaymentDisplay: 'A confirmar com a corretora',
  downPaymentValue: 0,
  installmentDisplay: 'A confirmar com a corretora',
  installmentValue: 0,
  bedroomsDisplay: 'A confirmar',
  areaDisplay: 'A confirmar',
  parkingDisplay: 'A confirmar',
  condoDisplay: 'A confirmar',
  iptuDisplay: 'A confirmar',
  availabilityStatus: 'A confirmar com a corretora',
  isConfirmationRequired: true,
  featured: false,
  published: true,
  coverImage: '',
  gallery: [],
  description: '',
  features: [],
};

export const AdminPropertiesTab: React.FC = () => {
  const { properties, empreendimentos, media, refreshAll } = useSite();
  const [editing, setEditing] = useState<Partial<PropertyItem> | null>(null);
  const [featuresText, setFeaturesText] = useState('');
  const [galleryText, setGalleryText] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');

  const openEditor = (prop?: PropertyItem) => {
    const target = prop ? { ...prop } : { ...EMPTY_PROP, code: `JP-${Math.floor(100 + Math.random() * 899)}` };
    setEditing(target);
    setFeaturesText((target.features || []).join('\n'));
    setGalleryText((target.gallery || []).join('\n'));
    setFeedback('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing || !editing.title?.trim()) return;
    setSaving(true);
    setFeedback('');
    try {
      const dev = empreendimentos.find((d) => d.id === editing.developmentId);
      await saveProperty({
        ...editing,
        slug: editing.slug || slugify(editing.title),
        developmentName: dev?.name || editing.developmentName || '',
        features: featuresText
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
        gallery: galleryText
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
      });
      await refreshAll();
      setEditing(null);
      setFeedback('Imóvel salvo com sucesso.');
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Erro ao salvar imóvel.');
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicate = async (prop: PropertyItem) => {
    await saveProperty({
      ...prop,
      id: undefined,
      title: `${prop.title} (Cópia)`,
      slug: `${prop.slug}-copia-${Date.now().toString().slice(-4)}`,
      code: `${prop.code}-C`,
      published: false,
    });
    await refreshAll();
  };

  const handleTogglePublished = async (prop: PropertyItem) => {
    await saveProperty({ ...prop, published: !prop.published });
    await refreshAll();
  };

  const handleToggleFeatured = async (prop: PropertyItem) => {
    await saveProperty({ ...prop, featured: !prop.featured });
    await refreshAll();
  };

  const handleDelete = async (id: string) => {
    await removeProperty(id);
    await refreshAll();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-editorial text-3xl font-semibold text-[#0B1B32]">Imóveis</h2>
          <p className="text-xs text-[#0B1B32]/65">
            Cadastre, edite, duplique, destaque ou publique imóveis do catálogo.
          </p>
        </div>
        <button
          type="button"
          onClick={() => openEditor()}
          className="inline-flex items-center gap-2 rounded-lg bg-[#0B1B32] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#112645] cursor-pointer"
        >
          <Plus className="h-4 w-4 text-[#E7C98F]" />
          <span>Novo imóvel</span>
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
              {editing.id ? 'Editar imóvel' : 'Cadastrar imóvel'}
            </h3>
            <button type="button" onClick={() => setEditing(null)} className="p-1 text-[#0B1B32]/60 hover:text-[#0B1B32] cursor-pointer">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#0B1B32]/75 mb-1">Título *</label>
              <input
                type="text"
                required
                value={editing.title || ''}
                onChange={(e) => setEditing({ ...editing, title: e.target.value, slug: editing.id ? editing.slug : slugify(e.target.value) })}
                className="w-full rounded-lg border border-[#0B1B32]/18 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#0B1B32]/75 mb-1">Código *</label>
              <input
                type="text"
                required
                value={editing.code || ''}
                onChange={(e) => setEditing({ ...editing, code: e.target.value })}
                className="w-full rounded-lg border border-[#0B1B32]/18 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div>
              <label className="block text-xs font-medium text-[#0B1B32]/75 mb-1">Slug (URL)</label>
              <input
                type="text"
                value={editing.slug || ''}
                onChange={(e) => setEditing({ ...editing, slug: slugify(e.target.value) })}
                className="w-full rounded-lg border border-[#0B1B32]/18 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#0B1B32]/75 mb-1">Negócio</label>
              <select
                value={editing.businessType || 'Venda'}
                onChange={(e) => setEditing({ ...editing, businessType: e.target.value as BusinessType })}
                className="w-full rounded-lg border border-[#0B1B32]/18 px-3 py-2 text-sm"
              >
                <option value="Venda">Venda</option>
                <option value="Lançamento">Lançamento</option>
                <option value="Investimento">Investimento</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#0B1B32]/75 mb-1">Tipo</label>
              <select
                value={editing.propertyType || 'Apartamento'}
                onChange={(e) => setEditing({ ...editing, propertyType: e.target.value as PropertyType })}
                className="w-full rounded-lg border border-[#0B1B32]/18 px-3 py-2 text-sm"
              >
                <option value="Apartamento">Apartamento</option>
                <option value="Studio">Studio</option>
                <option value="Cobertura">Cobertura</option>
                <option value="Casa">Casa</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#0B1B32]/75 mb-1">Empreendimento</label>
              <select
                value={editing.developmentId || ''}
                onChange={(e) => setEditing({ ...editing, developmentId: e.target.value })}
                className="w-full rounded-lg border border-[#0B1B32]/18 px-3 py-2 text-sm"
              >
                <option value="">Nenhum / Avulso</option>
                {empreendimentos.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-[#0B1B32]/75 mb-1">Região *</label>
              <input
                type="text"
                required
                value={editing.region || ''}
                onChange={(e) => setEditing({ ...editing, region: e.target.value })}
                className="w-full rounded-lg border border-[#0B1B32]/18 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#0B1B32]/75 mb-1">Entrada / Sinal (Texto)</label>
              <input
                type="text"
                value={editing.downPaymentDisplay || ''}
                onChange={(e) => setEditing({ ...editing, downPaymentDisplay: e.target.value })}
                className="w-full rounded-lg border border-[#0B1B32]/18 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#0B1B32]/75 mb-1">Parcela (Texto)</label>
              <input
                type="text"
                value={editing.installmentDisplay || ''}
                onChange={(e) => setEditing({ ...editing, installmentDisplay: e.target.value })}
                className="w-full rounded-lg border border-[#0B1B32]/18 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            <div>
              <label className="block text-xs font-medium text-[#0B1B32]/75 mb-1">Preço exibido</label>
              <input
                type="text"
                value={editing.priceDisplay || ''}
                onChange={(e) => setEditing({ ...editing, priceDisplay: e.target.value })}
                className="w-full rounded-lg border border-[#0B1B32]/18 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#0B1B32]/75 mb-1">Dormitórios</label>
              <input
                type="text"
                value={editing.bedroomsDisplay || ''}
                onChange={(e) => setEditing({ ...editing, bedroomsDisplay: e.target.value })}
                className="w-full rounded-lg border border-[#0B1B32]/18 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#0B1B32]/75 mb-1">Área</label>
              <input
                type="text"
                value={editing.areaDisplay || ''}
                onChange={(e) => setEditing({ ...editing, areaDisplay: e.target.value })}
                className="w-full rounded-lg border border-[#0B1B32]/18 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#0B1B32]/75 mb-1">Vagas</label>
              <input
                type="text"
                value={editing.parkingDisplay || ''}
                onChange={(e) => setEditing({ ...editing, parkingDisplay: e.target.value })}
                className="w-full rounded-lg border border-[#0B1B32]/18 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#0B1B32]/75 mb-1">Disponibilidade</label>
              <input
                type="text"
                value={editing.availabilityStatus || ''}
                onChange={(e) => setEditing({ ...editing, availabilityStatus: e.target.value })}
                className="w-full rounded-lg border border-[#0B1B32]/18 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-[#0B1B32]/75 mb-1">Imagem de capa (URL ou selecione da mídia)</label>
              <input
                type="text"
                value={editing.coverImage || ''}
                onChange={(e) => setEditing({ ...editing, coverImage: e.target.value })}
                placeholder="/images/..."
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
                  <option value="">Escolher imagem da biblioteca...</option>
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
              <label className="block text-xs font-medium text-[#0B1B32]/75 mb-1">Características (1 por linha)</label>
              <textarea
                rows={4}
                value={featuresText}
                onChange={(e) => setFeaturesText(e.target.value)}
                className="w-full rounded-lg border border-[#0B1B32]/18 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-medium">
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
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(editing.isConfirmationRequired)}
                onChange={(e) => setEditing({ ...editing, isConfirmationRequired: e.target.checked })}
              />
              <span>Exibir aviso "dados sujeitos à confirmação"</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 border-t border-[#0B1B32]/10 pt-4">
            <button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-[#0B1B32]/20 px-4 py-2 text-xs font-semibold cursor-pointer">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="rounded-lg bg-[#B8863B] px-5 py-2 text-xs font-semibold text-white hover:bg-[#9E712E] cursor-pointer">
              {saving ? 'Salvando...' : 'Salvar imóvel'}
            </button>
          </div>
        </form>
      )}

      {/* List */}
      <div className="grid grid-cols-1 gap-4">
        {properties.map((prop) => (
          <div key={prop.id} className="flex flex-col justify-between gap-4 rounded-xl border border-[#0B1B32]/12 bg-white p-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-[#EFEAE2]">
                <SafeImage src={prop.coverImage} alt={prop.title} className="h-full w-full object-cover" />
              </div>
              <div>
                <p className="text-xs text-[#0B1B32]/60">
                  {prop.code} · {prop.businessType} · {prop.region}
                </p>
                <h4 className="font-editorial text-xl font-semibold text-[#0B1B32]">{prop.title}</h4>
                <p className="text-xs text-[#9E712E]">{prop.downPaymentDisplay}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => void handleToggleFeatured(prop)}
                title="Destacar"
                className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium cursor-pointer ${
                  prop.featured ? 'border-[#B8863B] bg-[#B8863B]/15 text-[#9E712E]' : 'border-[#0B1B32]/15 text-[#0B1B32]/60'
                }`}
              >
                <Star className="h-3.5 w-3.5" />
                <span>Destaque</span>
              </button>
              <button
                type="button"
                onClick={() => void handleTogglePublished(prop)}
                className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium cursor-pointer ${
                  prop.published ? 'border-emerald-600/30 bg-emerald-50 text-emerald-800' : 'border-[#0B1B32]/15 text-[#0B1B32]/60'
                }`}
              >
                {prop.published ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                <span>{prop.published ? 'Publicado' : 'Oculto'}</span>
              </button>
              <button
                type="button"
                onClick={() => openEditor(prop)}
                className="inline-flex items-center gap-1 rounded-lg border border-[#0B1B32]/15 px-2.5 py-1.5 text-xs font-medium text-[#0B1B32] hover:bg-[#0B1B32]/5 cursor-pointer"
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>Editar</span>
              </button>
              <button
                type="button"
                onClick={() => void handleDuplicate(prop)}
                className="inline-flex items-center gap-1 rounded-lg border border-[#0B1B32]/15 px-2.5 py-1.5 text-xs font-medium text-[#0B1B32] hover:bg-[#0B1B32]/5 cursor-pointer"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => void handleDelete(prop.id)}
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
