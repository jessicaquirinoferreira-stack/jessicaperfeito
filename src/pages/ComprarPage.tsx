import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { trackAnalyticsEvent } from '../services/firestoreService';
import { PropertyCard } from '../components/common/PropertyCard';
import { BlurFade } from '../components/effects/MagicUIComponents';

export const ComprarPage: React.FC = () => {
  const { properties, empreendimentos, settings } = useSite();
  const [searchParams, setSearchParams] = useSearchParams();

  const [queryText, setQueryText] = useState(searchParams.get('q') || '');
  const [businessType, setBusinessType] = useState(searchParams.get('negocio') || '');
  const [propertyType, setPropertyType] = useState(searchParams.get('tipo') || '');
  const [regionFilter, setRegionFilter] = useState(searchParams.get('regiao') || '');
  const [developmentFilter, setDevelopmentFilter] = useState(searchParams.get('emp') || '');
  const [bedroomFilter, setBedroomFilter] = useState(searchParams.get('quartos') || '');
  const [conditionFilter, setConditionFilter] = useState(searchParams.get('condicao') || '');
  const [sortBy, setSortBy] = useState('recentes');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    document.title = `Comprar Imóveis no Rio de Janeiro | ${settings.brandName}`;
    void trackAnalyticsEvent({
      eventType: 'page_view',
      path: '/comprar',
      entityTitle: 'Catálogo Comprar',
    });
  }, [settings.brandName]);

  const publishedProperties = useMemo(
    () => properties.filter((p) => p.published),
    [properties]
  );

  const filtered = useMemo(() => {
    const q = queryText.trim().toLowerCase();
    const list = publishedProperties.filter((p) => {
      if (q) {
        const hay = `${p.title} ${p.code} ${p.region} ${p.developmentName || ''} ${p.description}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (businessType && p.businessType !== businessType) return false;
      if (propertyType && p.propertyType !== propertyType) return false;
      if (regionFilter && !p.region.toLowerCase().includes(regionFilter.toLowerCase())) return false;
      if (developmentFilter && p.developmentId !== developmentFilter) return false;
      if (bedroomFilter) {
        const b = (p.bedroomsDisplay || '').toLowerCase();
        if (bedroomFilter === '2' && !b.includes('2')) return false;
        if (bedroomFilter === 'studio' && p.propertyType !== 'Studio' && !b.includes('studio')) return false;
        if (bedroomFilter === 'confirmar' && !b.includes('confirmar')) return false;
      }
      if (conditionFilter) {
        if (conditionFilter === 'sinal400' && !(p.downPaymentDisplay || '').includes('400')) return false;
        if (conditionFilter === 'entrada15k' && p.downPaymentValue !== 15000 && !(p.downPaymentDisplay || '').includes('15')) return false;
        if (conditionFilter === 'parcela999' && p.installmentValue !== 999 && !(p.installmentDisplay || '').includes('999')) return false;
      }
      return true;
    });

    if (sortBy === 'menor-entrada') {
      return [...list].sort((a, b) => (a.downPaymentValue || 9999999) - (b.downPaymentValue || 9999999));
    }
    if (sortBy === 'menor-parcela') {
      return [...list].sort((a, b) => (a.installmentValue || 9999999) - (b.installmentValue || 9999999));
    }
    if (sortBy === 'az') {
      return [...list].sort((a, b) => a.title.localeCompare(b.title));
    }
    return [...list].sort((a, b) => Number(b.featured) - Number(a.featured));
  }, [
    publishedProperties,
    queryText,
    businessType,
    propertyType,
    regionFilter,
    developmentFilter,
    bedroomFilter,
    conditionFilter,
    sortBy,
  ]);

  const clearFilters = () => {
    setQueryText('');
    setBusinessType('');
    setPropertyType('');
    setRegionFilter('');
    setDevelopmentFilter('');
    setBedroomFilter('');
    setConditionFilter('');
    setSearchParams({});
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="border-b border-[#0B1B32]/10 pb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#9E712E]">
          Catálogo Imobiliário · {settings.creci}
        </p>
        <h1 className="mt-2 font-editorial text-4xl font-semibold text-[#0B1B32] sm:text-5xl">
          Imóveis no Rio de Janeiro
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#0B1B32]/75 sm:text-base">
          Explore apartamentos, studios e unidades em empreendimentos. Valores de entrada, parcelas e disponibilidade exibem referências históricas e são confirmados diretamente com a corretora.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-lg border border-[#0B1B32]/18 bg-white px-4 py-2 text-xs font-semibold text-[#0B1B32] lg:hidden cursor-pointer"
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>{mobileFiltersOpen ? 'Ocultar filtros' : 'Filtrar imóveis'}</span>
          </button>
          <p className="text-sm text-[#0B1B32]/70 tabular-nums">
            <strong className="font-semibold text-[#0B1B32]">{filtered.length}</strong>{' '}
            {filtered.length === 1 ? 'imóvel encontrado' : 'imóveis encontrados'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-medium text-[#0B1B32]/65">Ordenar:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-lg border border-[#0B1B32]/18 bg-white px-3 py-2 text-xs font-semibold text-[#0B1B32] focus:border-[#B8863B] focus:outline-none"
          >
            <option value="recentes">Destaques</option>
            <option value="menor-entrada">Menor entrada / sinal ref.</option>
            <option value="menor-parcela">Menor parcela ref.</option>
            <option value="az">Ordem alfabética</option>
          </select>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Filters Sidebar */}
        <aside className={`${mobileFiltersOpen ? 'block' : 'hidden'} lg:block lg:col-span-3`}>
          <div className="rounded-xl border border-[#0B1B32]/12 bg-white p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-editorial text-xl font-semibold text-[#0B1B32]">Filtros</h2>
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1 text-xs font-medium text-[#9E712E] hover:underline cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
                <span>Limpar</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#0B1B32]/70 mb-1">Buscar</label>
              <input
                type="text"
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                placeholder="Título, código, região..."
                className="w-full rounded-lg border border-[#0B1B32]/15 bg-[#FAF8F5] px-3 py-2 text-sm focus:border-[#B8863B] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#0B1B32]/70 mb-1">Tipo de negócio</label>
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="w-full rounded-lg border border-[#0B1B32]/15 bg-[#FAF8F5] px-3 py-2 text-sm focus:border-[#B8863B] focus:outline-none"
              >
                <option value="">Todos</option>
                <option value="Venda">Venda</option>
                <option value="Lançamento">Lançamento</option>
                <option value="Investimento">Investimento</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#0B1B32]/70 mb-1">Tipo de imóvel</label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full rounded-lg border border-[#0B1B32]/15 bg-[#FAF8F5] px-3 py-2 text-sm focus:border-[#B8863B] focus:outline-none"
              >
                <option value="">Todos</option>
                <option value="Apartamento">Apartamento</option>
                <option value="Studio">Studio</option>
                <option value="Cobertura">Cobertura</option>
                <option value="Casa">Casa</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#0B1B32]/70 mb-1">Empreendimento</label>
              <select
                value={developmentFilter}
                onChange={(e) => setDevelopmentFilter(e.target.value)}
                className="w-full rounded-lg border border-[#0B1B32]/15 bg-[#FAF8F5] px-3 py-2 text-sm focus:border-[#B8863B] focus:outline-none"
              >
                <option value="">Todos</option>
                {empreendimentos.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#0B1B32]/70 mb-1">Região</label>
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                className="w-full rounded-lg border border-[#0B1B32]/15 bg-[#FAF8F5] px-3 py-2 text-sm focus:border-[#B8863B] focus:outline-none"
              >
                <option value="">Todas do Rio</option>
                <option value="Porto Maravilha">Porto Maravilha</option>
                <option value="Região Portuária">Região Portuária</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#0B1B32]/70 mb-1">Dormitórios</label>
              <select
                value={bedroomFilter}
                onChange={(e) => setBedroomFilter(e.target.value)}
                className="w-full rounded-lg border border-[#0B1B32]/15 bg-[#FAF8F5] px-3 py-2 text-sm focus:border-[#B8863B] focus:outline-none"
              >
                <option value="">Qualquer tipologia</option>
                <option value="2">2 quartos</option>
                <option value="studio">Studio</option>
                <option value="confirmar">A confirmar</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#0B1B32]/70 mb-1">Condição de referência</label>
              <select
                value={conditionFilter}
                onChange={(e) => setConditionFilter(e.target.value)}
                className="w-full rounded-lg border border-[#0B1B32]/15 bg-[#FAF8F5] px-3 py-2 text-sm focus:border-[#B8863B] focus:outline-none"
              >
                <option value="">Todas as condições</option>
                <option value="sinal400">Sinal ref. R$ 400</option>
                <option value="entrada15k">Entrada ref. R$ 15 mil</option>
                <option value="parcela999">Parcela ref. R$ 999</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Results */}
        <div className="lg:col-span-9">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-[#0B1B32]/12 bg-white p-10 text-center">
              <h3 className="font-editorial text-2xl font-semibold text-[#0B1B32]">
                Nenhum imóvel encontrado para esses filtros
              </h3>
              <p className="mt-2 text-sm text-[#0B1B32]/70">
                Limpe os filtros ou envie sua busca personalizada para verificarmos oportunidades atualizadas.
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 rounded-lg bg-[#0B1B32] px-5 py-2.5 text-xs font-semibold text-white cursor-pointer"
              >
                Limpar todos os filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {filtered.map((prop, i) => (
                <BlurFade key={prop.id} delay={i * 0.05}>
                  <PropertyCard property={prop} />
                </BlurFade>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
