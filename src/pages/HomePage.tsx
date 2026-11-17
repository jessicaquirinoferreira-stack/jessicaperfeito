import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Compass, Instagram, MapPin, MessageCircle, Search, Sparkles } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { ASSETS } from '../data/seedData';
import { useSite } from '../context/SiteContext';
import { trackAnalyticsAsync } from '../services/analytics';
import { AuroraBackground, ParallaxFrame, Spotlight, TextGenerateEffect } from '../components/effects/AceternityComponents';
import { BlurFade, BorderBeam, NumberTicker, Particles, ShimmerButton, WordRotate } from '../components/effects/MagicUIComponents';
import { Magnet, ShinyText, SplitText } from '../components/effects/ReactBitsComponents';
import { StoryShowcaseAccordion, type StoryChapter } from '../components/effects/TwentyFirstComponents';
import { PropertyCard } from '../components/common/PropertyCard';
import { SafeImage } from '../components/common/SafeImage';
import { resolveAssetUrl } from '../lib/utils';

interface HeroSlide {
  image: string;
  title: string;
  region: string;
  slug?: string;
}

export const HomePage: React.FC = () => {
  const { settings, profile, properties, empreendimentos, landingPages, openVisitModal } = useSite();
  const navigate = useNavigate();

  const [quickType, setQuickType] = useState('');
  const [quickRegion, setQuickRegion] = useState('');
  const [quickQuery, setQuickQuery] = useState('');
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    document.title = settings.seoTitle || 'Jéssica Perfeito | Imóveis';
    const timer = window.setTimeout(() => {
      trackAnalyticsAsync({
        eventType: 'page_view',
        path: '/',
        entityTitle: 'Home',
      });
    }, 450);
    return () => window.clearTimeout(timer);
  }, [settings.seoTitle]);

  const featuredProps = properties.filter((p) => p.published && p.featured).slice(0, 3);
  const displayProps = featuredProps.length > 0 ? featuredProps : properties.filter((p) => p.published).slice(0, 3);
  const featuredDevs = empreendimentos.filter((e) => e.published).slice(0, 2);
  const premiumLp = landingPages.find((lp) => lp.isPremiumShowcase && lp.status === 'publicada');

  const heroSlides = useMemo<HeroSlide[]>(() => {
    const collected: HeroSlide[] = [];
    const seen = new Set<string>();

    for (const prop of properties) {
      if (!prop.published) continue;
      const imgs = [prop.coverImage, ...(prop.gallery || [])]
        .map((img) => resolveAssetUrl(img))
        .filter(Boolean);
      for (const img of imgs) {
        if (!seen.has(img)) {
          seen.add(img);
          collected.push({
            image: img,
            title: prop.title,
            region: prop.region,
            slug: prop.slug,
          });
        }
      }
    }

    if (collected.length === 0) {
      collected.push({
        image: resolveAssetUrl(settings.heroImage) || ASSETS.heroPorto,
        title: 'Porto Maravilha & Região Portuária',
        region: 'Rio de Janeiro - RJ',
      });
    }
    return collected;
  }, [properties, settings.heroImage]);

  useEffect(() => {
    setSlideIndex((prev) => (prev >= heroSlides.length ? 0 : prev));
  }, [heroSlides.length]);

  useEffect(() => {
    if (heroSlides.length <= 1) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % heroSlides.length);
    }, 5200);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const nextSlide = heroSlides[(slideIndex + 1) % heroSlides.length];
    if (nextSlide?.image) {
      const img = new Image();
      img.decoding = 'async';
      img.src = nextSlide.image;
    }
  }, [heroSlides, slideIndex]);

  const currentSlide = heroSlides[slideIndex] || heroSlides[0];

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (quickQuery.trim()) params.set('q', quickQuery.trim());
    if (quickType) params.set('tipo', quickType);
    if (quickRegion) params.set('regiao', quickRegion);
    navigate(`/comprar?${params.toString()}`);
  };

  const storyChapters: StoryChapter[] = [
    {
      id: 'story-chaves',
      kicker: 'Histórias reais · @imoveisperfeito',
      title: '“Casei, agora temos nossa casa”',
      summary:
        'A emoção de receber as chaves do primeiro lar marca o início de uma vida a dois. Acompanhamos cada etapa com clareza para tornar essa conquista possível.',
      image: ASSETS.entregaChaves,
      alt: 'Casal sorridente segurando as chaves do novo apartamento no Rio de Janeiro',
      ctaLabel: 'Começar minha história',
      onAction: () => openVisitModal(null),
    },
    {
      id: 'story-pov',
      kicker: 'Estilo de vida urbano · Rio de Janeiro',
      title: 'POV: você morando no Porto Maravilha',
      summary:
        'Imagine começar o dia com vista para a Baía de Guanabara, mobilidade pelo VLT e acesso fácil ao Centro renovado do Rio.',
      image: ASSETS.heroPorto,
      alt: 'Vista panorâmica do Porto Maravilha no Rio de Janeiro ao entardecer',
      ctaLabel: 'Ver oportunidade Porto Maravilha',
      onAction: () => navigate(premiumLp ? `/${premiumLp.routePrefix}/${premiumLp.slug}` : '/oportunidade/porto-maravilha'),
    },
    {
      id: 'story-heitor',
      kicker: 'Conquista acessível · Empreendimento',
      title: 'Abra a nova fase da sua vida',
      summary:
        'Oportunidades pensadas para quem quer sair do aluguel, como o Residencial Heitor dos Prazeres, com condições de entrada sujeitas à confirmação.',
      image: ASSETS.heitorFacade,
      alt: 'Fachada moderna do Residencial Heitor dos Prazeres no Rio de Janeiro',
      ctaLabel: 'Conhecer empreendimento',
      onAction: () => navigate('/empreendimento/residencial-heitor-dos-prazeres'),
    },
  ];

  return (
    <div>
      {/* 1. HERO SECTION WITH DYNAMIC PROPERTY PHOTO TRANSITION */}
      <AuroraBackground className="relative border-b border-[#B8863B]/20">
        {/* Dynamic Background Slideshow of Registered Property Photos */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <AnimatePresence mode="sync">
            <motion.img
              key={currentSlide.image}
              src={currentSlide.image}
              alt=""
              loading="eager"
              decoding="async"
              fetchPriority="high"
              referrerPolicy="no-referrer"
              initial={{ opacity: 0, scale: 1.07 }}
              animate={{ opacity: 0.42, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                opacity: { duration: 1.15, ease: 'easeInOut' },
                scale: { duration: 6.2, ease: 'easeOut' },
              }}
              className="absolute inset-0 h-full w-full object-cover will-change-transform"
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-r from-[#06101F]/92 via-[#081528]/78 to-[#06101F]/65" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#06101F]/90 via-transparent to-[#06101F]/55" />
        </div>

        <Spotlight className="-top-28 left-0 md:left-44" fill="#D4AF6A" />
        <Particles quantity={24} color="#E7C98F" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12 lg:gap-12">
            {/* Hero Copy */}
            <div className="flex flex-col justify-center lg:col-span-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E7C98F]">
                {settings.brandName} · {settings.creci} · Rio de Janeiro
              </p>

              <SplitText
                as="h1"
                immediate
                text={settings.heroTitle}
                className="mt-4 font-editorial text-4xl font-semibold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.6rem] [text-wrap:balance]"
              />

              <div className="mt-4 text-base font-medium text-white/85 sm:text-lg">
                <span>Oportunidades reais no Rio para </span>
                <WordRotate
                  words={[
                    'morar no Porto Maravilha',
                    'conquistar seu primeiro lar',
                    'investir em studios urbanos',
                  ]}
                  className="font-semibold text-[#E7C98F]"
                />
              </div>

              <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
                {settings.heroSubtitle}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Magnet>
                  <ShimmerButton
                    type="button"
                    onClick={() => navigate('/comprar')}
                    background="#B8863B"
                    shimmerColor="#FFF3D6"
                    className="px-7 py-3.5 text-sm font-semibold text-[#06101F]"
                  >
                    <span>Explorar imóveis</span>
                    <ArrowRight className="h-4 w-4" />
                  </ShimmerButton>
                </Magnet>

                <button
                  type="button"
                  onClick={() => openVisitModal(null)}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-5 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20 cursor-pointer"
                >
                  <MessageCircle className="h-4 w-4 text-[#E7C98F]" />
                  <span>Vamos conversar</span>
                </button>
              </div>
            </div>

            {/* Hero Synced Property Showcase Frame */}
            <div className="lg:col-span-6">
              <div className="relative h-full min-h-[320px] overflow-hidden rounded-2xl border border-white/20 bg-[#06101F] shadow-2xl lg:min-h-[460px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide.image}
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0"
                  >
                    <SafeImage
                      src={currentSlide.image}
                      alt={currentSlide.title}
                      priority
                      className="h-full w-full object-cover"
                    />
                  </motion.div>
                </AnimatePresence>

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#06101F]/90 via-[#06101F]/20 to-transparent" />

                {/* Top Right Slide Arrows */}
                {heroSlides.length > 1 && (
                  <div className="absolute right-4 top-4 z-10 flex items-center gap-1.5">
                    <button
                      type="button"
                      aria-label="Foto anterior"
                      onClick={() =>
                        setSlideIndex((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)
                      }
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-[#06101F]/60 text-white backdrop-blur-md transition-colors hover:bg-[#B8863B] hover:text-[#06101F] cursor-pointer"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Próxima foto"
                      onClick={() => setSlideIndex((prev) => (prev + 1) % heroSlides.length)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-[#06101F]/60 text-white backdrop-blur-md transition-colors hover:bg-[#B8863B] hover:text-[#06101F] cursor-pointer"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}

                <div className="absolute bottom-5 left-5 right-5 z-10 flex flex-col gap-3">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-widest text-[#E7C98F]">
                        {currentSlide.region}
                      </p>
                      {currentSlide.slug ? (
                        <Link
                          to={`/imovel/${currentSlide.slug}`}
                          className="font-editorial text-2xl font-semibold text-white hover:text-[#E7C98F] transition-colors"
                        >
                          {currentSlide.title}
                        </Link>
                      ) : (
                        <p className="font-editorial text-2xl font-semibold text-white">
                          {currentSlide.title}
                        </p>
                      )}
                    </div>
                    {premiumLp && (
                      <Link
                        to={`/${premiumLp.routePrefix}/${premiumLp.slug}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur-md transition-colors hover:bg-[#B8863B] hover:text-[#06101F]"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Ver página especial</span>
                      </Link>
                    )}
                  </div>

                  {heroSlides.length > 1 && (
                    <div className="flex items-center gap-1.5" role="tablist" aria-label="Fotos dos imóveis cadastrados">
                      {heroSlides.map((slide, idx) => (
                        <button
                          key={`${slide.image}-${idx}`}
                          type="button"
                          aria-label={`Ver foto ${idx + 1}: ${slide.title}`}
                          onClick={() => setSlideIndex(idx)}
                          className={`h-1.5 rounded-full transition-all cursor-pointer ${
                            idx === slideIndex ? 'w-7 bg-[#E7C98F]' : 'w-2 bg-white/40 hover:bg-white/70'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 2. QUICK SEARCH BAR */}
          <form
            onSubmit={handleQuickSearch}
            className="mt-10 grid grid-cols-1 gap-3 rounded-xl border border-white/15 bg-white/95 p-4 text-[#0B1B32] shadow-xl sm:grid-cols-12 sm:items-end"
          >
            <div className="sm:col-span-4">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#0B1B32]/60 mb-1">
                O que você procura?
              </label>
              <input
                type="text"
                value={quickQuery}
                onChange={(e) => setQuickQuery(e.target.value)}
                placeholder="Ex: 2 quartos, studio, Heitor dos Prazeres..."
                className="w-full rounded-lg border border-[#0B1B32]/15 bg-[#FAF8F5] px-3.5 py-2.5 text-sm text-[#0B1B32] placeholder:text-[#0B1B32]/45 focus:border-[#B8863B] focus:outline-none"
              />
            </div>
            <div className="sm:col-span-3">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#0B1B32]/60 mb-1">
                Tipo de imóvel
              </label>
              <select
                value={quickType}
                onChange={(e) => setQuickType(e.target.value)}
                className="w-full rounded-lg border border-[#0B1B32]/15 bg-[#FAF8F5] px-3.5 py-2.5 text-sm text-[#0B1B32] focus:border-[#B8863B] focus:outline-none"
              >
                <option value="">Todos os tipos</option>
                <option value="Apartamento">Apartamento</option>
                <option value="Studio">Studio</option>
                <option value="Cobertura">Cobertura</option>
                <option value="Casa">Casa</option>
              </select>
            </div>
            <div className="sm:col-span-3">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#0B1B32]/60 mb-1">
                Região / Foco
              </label>
              <select
                value={quickRegion}
                onChange={(e) => setQuickRegion(e.target.value)}
                className="w-full rounded-lg border border-[#0B1B32]/15 bg-[#FAF8F5] px-3.5 py-2.5 text-sm text-[#0B1B32] focus:border-[#B8863B] focus:outline-none"
              >
                <option value="">Rio de Janeiro (Todas)</option>
                <option value="Porto Maravilha">Porto Maravilha</option>
                <option value="Região Portuária">Região Portuária</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0B1B32] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#112645] cursor-pointer"
              >
                <Search className="h-4 w-4 text-[#E7C98F]" />
                <span>Buscar</span>
              </button>
            </div>
          </form>
        </div>
      </AuroraBackground>

      {/* 3. FEATURED PROPERTIES */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-22">
        <BlurFade>
          <div className="flex flex-col justify-between gap-4 border-b border-[#0B1B32]/10 pb-6 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#9E712E]">
                Oportunidades em destaque
              </p>
              <h2 className="mt-2 font-editorial text-3xl font-semibold text-[#0B1B32] sm:text-4xl [text-wrap:balance]">
                Imóveis selecionados no Rio de Janeiro
              </h2>
            </div>
            <Link
              to="/comprar"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#0B1B32] hover:text-[#9E712E] transition-colors whitespace-nowrap"
            >
              <span>Ver catálogo completo</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </BlurFade>

        <div className="mt-10 grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
          {displayProps.map((prop, index) => (
            <BlurFade key={prop.id} delay={index * 0.08}>
              <PropertyCard property={prop} />
            </BlurFade>
          ))}
        </div>
      </section>

      {/* 4. FEATURED DEVELOPMENTS + PREMIUM LP CALLOUT */}
      <section className="border-y border-[#0B1B32]/10 bg-[#EFEAE2]/55 py-16 lg:py-22">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#9E712E]">
                Empreendimentos
              </p>
              <h2 className="mt-2 font-editorial text-3xl font-semibold text-[#0B1B32] sm:text-4xl">
                Projetos para abrir uma nova fase
              </h2>
            </div>
            <Link
              to="/empreendimentos"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#0B1B32] hover:text-[#9E712E] transition-colors"
            >
              <span>Todos os empreendimentos</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
            {featuredDevs.map((dev, idx) => (
              <BlurFade key={dev.id} delay={idx * 0.1}>
                <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#0B1B32]/12 bg-white">
                  <div className="aspect-[16/10] overflow-hidden bg-[#0B1B32]">
                    <SafeImage
                      src={dev.coverImage}
                      alt={dev.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between p-6 sm:p-8">
                    <div>
                      <p className="flex items-center gap-1.5 text-xs font-medium text-[#0B1B32]/60">
                        <MapPin className="h-3.5 w-3.5 text-[#B8863B]" />
                        <span>{dev.location}</span>
                      </p>
                      <h3 className="mt-2 font-editorial text-3xl font-semibold text-[#0B1B32]">
                        {dev.name}
                      </h3>
                      {dev.entryCondition && (
                        <p className="mt-2 text-sm font-semibold text-[#9E712E]">
                          {dev.entryCondition}
                        </p>
                      )}
                      <p className="mt-3 text-sm leading-relaxed text-[#0B1B32]/75">
                        {dev.description}
                      </p>
                    </div>
                    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[#0B1B32]/10 pt-5">
                      <span className="text-xs font-medium text-[#0B1B32]/60">
                        Status: {dev.status}
                      </span>
                      <Link
                        to={`/empreendimento/${dev.slug}`}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0B1B32] hover:text-[#9E712E] transition-colors"
                      >
                        <span>Ver empreendimento</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </article>
              </BlurFade>
            ))}
          </div>

          {/* Premium Landing Page Banner */}
          {premiumLp && (
            <BlurFade delay={0.15}>
              <div className="relative mt-10 overflow-hidden rounded-2xl border border-[#B8863B]/35 bg-[#0B1B32] p-7 text-white sm:p-10">
                <BorderBeam size={240} duration={11} colorFrom="#E7C98F" colorTo="#B8863B" />
                <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
                  <div className="max-w-2xl">
                    <p className="text-xs font-semibold uppercase tracking-widest text-[#E7C98F]">
                      Apresentação Especial · Landing Page Exclusiva
                    </p>
                    <h3 className="mt-2 font-editorial text-3xl font-semibold text-white sm:text-4xl">
                      <ShinyText text={premiumLp.heroHeadline} />
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/80">
                      {premiumLp.heroSubheadline}
                    </p>
                  </div>
                  <Link
                    to={`/${premiumLp.routePrefix}/${premiumLp.slug}`}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#B8863B] px-6 py-3.5 text-sm font-semibold text-[#06101F] transition-colors hover:bg-[#D6A756]"
                  >
                    <span>Acessar experiência completa</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </BlurFade>
          )}
        </div>
      </section>

      {/* 5. EMOTIONAL SECTION — HISTÓRIAS DE CONQUISTA */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-22">
        <BlurFade>
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#9E712E]">
              Histórias de conquista
            </p>
            <h2 className="mt-2 font-editorial text-3xl font-semibold text-[#0B1B32] sm:text-4xl [text-wrap:balance]">
              Mais do que metros quadrados: o começo de uma nova história
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#0B1B32]/72 sm:text-base">
              Do sonho compartilhado em família à entrega das chaves, cada atendimento é guiado com proximidade e respeito ao seu momento.
            </p>
          </div>
        </BlurFade>

        <div className="mt-10">
          <StoryShowcaseAccordion chapters={storyChapters} />
        </div>
      </section>

      {/* 6. SOBRE JÉSSICA PERFEITO + DIFERENCIAIS */}
      <section className="border-t border-[#0B1B32]/10 bg-white py-16 lg:py-22">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-stretch gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <ParallaxFrame offset={18} className="h-full min-h-[380px] rounded-2xl border border-[#0B1B32]/12">
                <SafeImage
                  src={profile.photoUrl || ASSETS.jessicaPortrait}
                  alt={`${profile.name} — ${profile.creci}`}
                  className="h-full w-full object-cover"
                />
              </ParallaxFrame>
            </div>

            <div className="flex flex-col justify-center lg:col-span-7">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#9E712E]">
                Sobre a corretora · {profile.creci}
              </p>
              <h2 className="mt-2 font-editorial text-3xl font-semibold text-[#0B1B32] sm:text-5xl">
                {profile.displayName}
              </h2>

              <TextGenerateEffect
                words={profile.bio}
                className="mt-5 text-base leading-relaxed text-[#0B1B32]/80"
              />

              {/* Editorial numbered differentials */}
              <div className="mt-8 divide-y divide-[#0B1B32]/10 border-y border-[#0B1B32]/10">
                {(profile.highlights || []).map((item, idx) => (
                  <div key={item} className="flex items-start gap-4 py-4">
                    <span className="font-editorial text-xl font-semibold text-[#9E712E] tabular-nums">
                      0{idx + 1}.
                    </span>
                    <p className="text-sm font-medium leading-relaxed text-[#0B1B32]/85">
                      {item}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-6">
                <Link
                  to="/sobre"
                  className="inline-flex items-center gap-2 rounded-lg bg-[#0B1B32] px-5 py-3 text-sm font-semibold text-white hover:bg-[#112645] transition-colors"
                >
                  <span>Conhecer trajetória</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 text-sm font-medium text-[#0B1B32]/80 hover:text-[#9E712E] transition-colors"
                >
                  <Instagram className="h-4 w-4 text-[#B8863B]" />
                  <span>
                    {profile.instagramHandle} ·{' '}
                    <NumberTicker value={profile.instagramPostsCount || 41} /> publicações
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. REGIÃO DE ATUAÇÃO + CTA FINAL */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="relative overflow-hidden rounded-2xl bg-[#0B1B32] px-6 py-12 text-white sm:px-12 lg:py-16">
          <Spotlight className="-top-40 right-0" fill="#B8863B" />
          <div className="relative z-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#E7C98F]">
                <Compass className="h-4 w-4" />
                <span>Rio de Janeiro · Porto Maravilha e Região</span>
              </p>
              <h2 className="mt-3 font-editorial text-3xl font-semibold text-white sm:text-5xl [text-wrap:balance]">
                Encontre seu imóvel ideal comigo
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
                Tem dúvidas sobre entrada, condições ou quer agendar uma visita para conhecer de perto o Porto Maravilha ou o Residencial Heitor dos Prazeres? Vamos conversar.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 lg:col-span-5 lg:justify-end">
              <button
                type="button"
                onClick={() => openVisitModal(null)}
                className="inline-flex items-center gap-2 rounded-lg bg-[#B8863B] px-6 py-3.5 text-sm font-semibold text-[#06101F] transition-colors hover:bg-[#D6A756] cursor-pointer"
              >
                <span>Agendar visita</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <Link
                to="/contato"
                className="inline-flex items-center gap-2 rounded-lg border border-white/25 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                <span>Falar com a corretora</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
