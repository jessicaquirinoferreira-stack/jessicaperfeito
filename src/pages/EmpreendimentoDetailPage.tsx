import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Check, MapPin, Share2 } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { trackAnalyticsEvent } from '../services/firestoreService';
import { LeadCaptureForm } from '../components/common/LeadCaptureForm';
import { PropertyCard } from '../components/common/PropertyCard';
import { SafeImage } from '../components/common/SafeImage';

export const EmpreendimentoDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { empreendimentos, properties, settings } = useSite();
  const [copied, setCopied] = React.useState(false);

  const dev = empreendimentos.find((e) => e.slug === slug);
  const linkedProperties = dev
    ? properties.filter((p) => p.published && p.developmentId === dev.id)
    : [];

  useEffect(() => {
    if (dev) {
      document.title = dev.seoTitle || `${dev.name} | ${settings.brandName}`;
      void trackAnalyticsEvent({
        eventType: 'page_view',
        path: `/empreendimento/${dev.slug}`,
        entityId: dev.id,
        entityTitle: dev.name,
      });
    }
  }, [dev, settings.brandName]);

  if (!dev) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <h1 className="font-editorial text-4xl font-semibold text-[#0B1B32]">
          Empreendimento não encontrado
        </h1>
        <Link
          to="/empreendimentos"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#0B1B32] px-5 py-2.5 text-sm font-semibold text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar aos empreendimentos</span>
        </Link>
      </div>
    );
  }

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: dev.name, url });
        return;
      } catch {
        // Fallback to clipboard
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/empreendimentos"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#0B1B32]/75 hover:text-[#0B1B32]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Empreendimentos</span>
        </Link>

        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#0B1B32]/15 bg-white px-3.5 py-2 text-xs font-semibold text-[#0B1B32] hover:bg-[#0B1B32]/5 cursor-pointer"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Share2 className="h-3.5 w-3.5" />}
          <span>{copied ? 'Link copiado' : 'Compartilhar'}</span>
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-6">
          <div className="aspect-[16/10] overflow-hidden rounded-2xl border border-[#0B1B32]/12 bg-[#0B1B32]">
            <SafeImage src={dev.coverImage} alt={dev.name} className="h-full w-full object-cover" />
          </div>

          {dev.gallery && dev.gallery.length > 1 && (
            <div className="grid grid-cols-3 gap-3">
              {dev.gallery.map((img, i) => (
                <div key={`${img}-${i}`} className="aspect-[4/3] overflow-hidden rounded-xl border border-[#0B1B32]/10">
                  <SafeImage src={img} alt={`${dev.name} - foto ${i + 1}`} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          )}

          <div className="pt-2">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#9E712E]">
              <MapPin className="h-3.5 w-3.5" />
              <span>{dev.location}</span>
            </p>
            <h1 className="mt-2 font-editorial text-4xl font-semibold text-[#0B1B32] sm:text-5xl">
              {dev.name}
            </h1>
            {dev.entryCondition && (
              <p className="mt-3 text-base font-semibold text-[#9E712E]">{dev.entryCondition}</p>
            )}
            <p className="mt-4 text-base leading-relaxed text-[#0B1B32]/80">{dev.description}</p>

            {dev.highlights && dev.highlights.length > 0 && (
              <div className="mt-8 border-t border-[#0B1B32]/10 pt-6">
                <h2 className="font-editorial text-2xl font-semibold text-[#0B1B32]">
                  Destaques e observações
                </h2>
                <ul className="mt-4 space-y-2.5 text-sm text-[#0B1B32]/80">
                  {dev.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#B8863B]" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="sticky top-22 rounded-2xl border border-[#0B1B32]/12 bg-white p-6 sm:p-8 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#9E712E]">
              Consultar disponibilidade
            </p>
            <h2 className="mt-1 font-editorial text-3xl font-semibold text-[#0B1B32]">
              Fale sobre este empreendimento
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-[#0B1B32]/70">
              Confirme unidades vigentes, plantas e condições atualizadas diretamente com {settings.brandName} ({settings.creci}).
            </p>
            <div className="mt-6">
              <LeadCaptureForm
                mode="lead"
                defaultDevelopmentId={dev.id}
                defaultPropertyTitle={dev.name}
                sourceLabel={`empreendimento/${dev.slug}`}
              />
            </div>
          </div>
        </div>
      </div>

      {linkedProperties.length > 0 && (
        <section className="mt-16 border-t border-[#0B1B32]/10 pt-12">
          <h2 className="font-editorial text-3xl font-semibold text-[#0B1B32]">
            Unidades vinculadas a este empreendimento
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
