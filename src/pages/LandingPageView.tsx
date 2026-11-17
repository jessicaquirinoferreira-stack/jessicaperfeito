import React, { useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowRight, Check, Compass, ShieldCheck, Sparkles } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { extractUtmParams } from '../lib/utils';
import { trackAnalyticsEvent } from '../services/firestoreService';
import { LeadCaptureForm } from '../components/common/LeadCaptureForm';
import { PropertyCard } from '../components/common/PropertyCard';
import { SafeImage } from '../components/common/SafeImage';
import { AuroraBackground, ParallaxFrame, Spotlight, TextGenerateEffect } from '../components/effects/AceternityComponents';
import { BlurFade, BorderBeam, Particles, ShimmerButton, WordRotate } from '../components/effects/MagicUIComponents';
import { Magnet, ShinyText, SplitText } from '../components/effects/ReactBitsComponents';

interface LandingPageViewProps {
  routePrefix: 'oportunidade' | 'campanha';
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({ routePrefix }) => {
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const { landingPages, properties, empreendimentos, settings, profile } = useSite();

  const lp = landingPages.find(
    (item) => item.slug === slug && item.routePrefix === routePrefix && item.status === 'publicada'
  );

  useEffect(() => {
    if (lp) {
      document.title = lp.seoTitle || `${lp.title} | ${settings.brandName}`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc && lp.seoDescription) {
        metaDesc.setAttribute('content', lp.seoDescription);
      }
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', lp.seoTitle || lp.title);

      const utm = extractUtmParams(location.search);
      void trackAnalyticsEvent({
        eventType: 'lp_view',
        path: location.pathname,
        entityId: lp.id,
        entityTitle: lp.title,
        utmSource: utm.utmSource,
        utmMedium: utm.utmMedium,
        utmCampaign: utm.utmCampaign,
      });
    }
  }, [lp, location.pathname, location.search, settings.brandName]);

  if (!lp) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center">
        <h1 className="font-editorial text-4xl font-semibold text-[#0B1B32]">
          Página não disponível no momento
        </h1>
        <p className="mt-3 text-sm text-[#0B1B32]/70">
          Esta campanha pode ter sido pausada ou atualizada pela corretora.
        </p>
        <Link
          to="/comprar"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#0B1B32] px-5 py-2.5 text-sm font-semibold text-white"
        >
          <span>Explorar imóveis disponíveis</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const linkedProperties = properties.filter(
    (p) =>
      p.published &&
      (lp.targetIds.includes(p.id) || (p.developmentId && lp.targetIds.includes(p.developmentId)))
  );
  const linkedDevs = empreendimentos.filter(
    (e) => e.published && lp.targetIds.includes(e.id)
  );

  // PREMIUM LANDING PAGE SHOWCASE (At most ONE active across platform)
  if (lp.isPremiumShowcase) {
    return (
      <div className="bg-[#FAF8F5]">
        {/* Immersive Hero */}
        <AuroraBackground className="relative border-b border-[#B8863B]/25">
          <Spotlight className="-top-32 left-10 md:left-60" fill="#E7C98F" />
          <Particles quantity={42} color="#E7C98F" />

          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#E7C98F]">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Apresentação Exclusiva · {settings.brandName} · {settings.creci}</span>
                </p>

                <SplitText
                  as="h1"
                  text={lp.heroHeadline}
                  className="mt-4 font-editorial text-4xl font-semibold leading-[1.06] text-white sm:text-6xl [text-wrap:balance]"
                />

                {lp.conditionHighlight && (
                  <p className="mt-5 text-lg font-semibold sm:text-xl">
                    <ShinyText text={lp.conditionHighlight} />
                  </p>
                )}

                <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/80">
                  {lp.heroSubheadline}
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Magnet>
                    <a href="#lp-lead-capture">
                      <ShimmerButton
                        type="button"
                        background="#B8863B"
                        shimmerColor="#FFF5DB"
                        className="px-7 py-3.5 text-sm font-semibold text-[#06101F]"
                      >
                        <span>{lp.ctaText || 'Agendar atendimento'}</span>
                        <ArrowRight className="h-4 w-4" />
                      </ShimmerButton>
                    </a>
                  </Magnet>
                  <span className="text-xs text-white/65">
                    Rio de Janeiro ·{' '}
                    <WordRotate
                      words={['Atendimento transparente', 'Dados confirmados na visita', 'CRECI 78861']}
                      className="font-semibold text-[#E7C98F]"
                    />
                  </span>
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="relative overflow-hidden rounded-2xl border border-[#E7C98F]/35 bg-[#06101F] shadow-2xl">
                  <BorderBeam size={220} duration={9} colorFrom="#E7C98F" colorTo="#B8863B" />
                  <div className="aspect-[4/5]">
                    <SafeImage
                      src={lp.heroImage}
                      alt={lp.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AuroraBackground>

        {/* Editorial Story + Parallax Gallery */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-22">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#9E712E]">
                O projeto de vida
              </p>
              <h2 className="mt-2 font-editorial text-3xl font-semibold text-[#0B1B32] sm:text-5xl">
                {lp.title}
              </h2>
              <TextGenerateEffect
                words={lp.editorialStory}
                className="mt-5 text-base leading-relaxed text-[#0B1B32]/80"
              />

              <div className="mt-8 space-y-3 border-t border-[#0B1B32]/10 pt-6">
                <div className="flex items-start gap-3 text-sm text-[#0B1B32]/85">
                  <Compass className="mt-0.5 h-4 w-4 shrink-0 text-[#B8863B]" />
                  <span>Localização privilegiada com mobilidade e revitalização urbana no Rio.</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-[#0B1B32]/85">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#B8863B]" />
                  <span>
                    Condições de entrada, parcelas e disponibilidade sempre confirmadas diretamente com {profile.name} ({profile.creci}).
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="grid grid-cols-2 gap-4">
                {(lp.gallery && lp.gallery.length > 0 ? lp.gallery : [lp.heroImage]).slice(0, 4).map((img, idx) => (
                  <ParallaxFrame
                    key={`${img}-${idx}`}
                    offset={idx % 2 === 0 ? 14 : -14}
                    className={`rounded-2xl border border-[#0B1B32]/12 ${idx === 0 ? 'col-span-2 aspect-[16/9]' : 'aspect-[4/3]'}`}
                  >
                    <SafeImage src={img} alt={`${lp.title} ${idx + 1}`} className="h-full w-full object-cover" />
                  </ParallaxFrame>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Linked Properties */}
        {linkedProperties.length > 0 && (
          <section className="border-y border-[#0B1B32]/10 bg-[#EFEAE2]/55 py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <BlurFade>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#9E712E]">
                  Opções selecionadas
                </p>
                <h2 className="mt-2 font-editorial text-3xl font-semibold text-[#0B1B32] sm:text-4xl">
                  Imóveis desta oportunidade
                </h2>
              </BlurFade>
              <div className="mt-8 grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
                {linkedProperties.map((prop) => (
                  <PropertyCard key={prop.id} property={prop} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Conversion Section */}
        <section id="lp-lead-capture" className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 lg:py-22">
          <div className="relative overflow-hidden rounded-2xl border border-[#B8863B]/30 bg-[#0B1B32] p-7 text-white shadow-2xl sm:p-12">
            <BorderBeam size={260} duration={12} colorFrom="#E7C98F" colorTo="#B8863B" />
            <div className="relative z-10 grid grid-cols-1 gap-10 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#E7C98F]">
                  Próximo passo
                </p>
                <h2 className="mt-2 font-editorial text-3xl font-semibold text-white sm:text-4xl">
                  Converse com Jéssica Perfeito
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-white/80">
                  Preencha o formulário para confirmar condições atuais, tirar dúvidas e agendar sua visita com tranquilidade.
                </p>
                <div className="mt-6 flex items-center gap-3 border-t border-white/15 pt-5">
                  <SafeImage
                    src={profile.photoUrl}
                    alt={profile.name}
                    className="h-12 w-12 rounded-full object-cover border border-[#E7C98F]/40"
                  />
                  <div>
                    <p className="text-sm font-semibold text-white">{profile.name}</p>
                    <p className="text-xs text-[#E7C98F]">{profile.creci}</p>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-7">
                <LeadCaptureForm
                  mode="visit"
                  defaultPropertyTitle={lp.title}
                  defaultDevelopmentId={linkedDevs[0]?.id}
                  sourceLabel={`${lp.routePrefix}/${lp.slug}`}
                  darkSurface
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // STANDARD LANDING PAGE TEMPLATE
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#9E712E]">
            {settings.brandName} · {settings.creci}
          </p>
          <h1 className="mt-2 font-editorial text-4xl font-semibold text-[#0B1B32] sm:text-5xl [text-wrap:balance]">
            {lp.heroHeadline}
          </h1>
          {lp.conditionHighlight && (
            <p className="mt-3 text-base font-semibold text-[#9E712E]">{lp.conditionHighlight}</p>
          )}
          <p className="mt-4 text-base leading-relaxed text-[#0B1B32]/80">{lp.heroSubheadline}</p>
          <p className="mt-4 text-sm leading-relaxed text-[#0B1B32]/75">{lp.editorialStory}</p>
          <ul className="mt-6 space-y-2 text-sm text-[#0B1B32]/80">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-[#B8863B]" />
              <span>Atendimento próximo e transparente no Rio de Janeiro</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-[#B8863B]" />
              <span>Condições e disponibilidade confirmadas antes da visita</span>
            </li>
          </ul>
        </div>

        <div className="lg:col-span-6">
          <div className="overflow-hidden rounded-2xl border border-[#0B1B32]/12 bg-white shadow-sm">
            <div className="aspect-[16/10] bg-[#0B1B32]">
              <SafeImage src={lp.heroImage} alt={lp.title} className="h-full w-full object-cover" />
            </div>
            <div className="p-6 sm:p-8">
              <h2 className="font-editorial text-2xl font-semibold text-[#0B1B32]">
                {lp.ctaText || 'Solicitar atendimento'}
              </h2>
              <div className="mt-4">
                <LeadCaptureForm
                  mode="lead"
                  defaultPropertyTitle={lp.title}
                  defaultDevelopmentId={linkedDevs[0]?.id}
                  sourceLabel={`${lp.routePrefix}/${lp.slug}`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {linkedProperties.length > 0 && (
        <section className="mt-16 border-t border-[#0B1B32]/10 pt-12">
          <h2 className="font-editorial text-3xl font-semibold text-[#0B1B32]">
            Imóveis relacionados
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
            {linkedProperties.map((prop) => (
              <PropertyCard key={prop.id} property={prop} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
