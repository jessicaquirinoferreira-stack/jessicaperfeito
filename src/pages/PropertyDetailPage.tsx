import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Calendar, Check, MapPin, MessageCircle, Share2 } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { trackAnalyticsEvent } from '../services/firestoreService';
import { LeadCaptureForm } from '../components/common/LeadCaptureForm';
import { PropertyCard } from '../components/common/PropertyCard';
import { SafeImage } from '../components/common/SafeImage';

export const PropertyDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { properties, empreendimentos, settings, openVisitModal } = useSite();
  const [activeImage, setActiveImage] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const property = properties.find((p) => p.slug === slug);
  const linkedDev = property?.developmentId
    ? empreendimentos.find((e) => e.id === property.developmentId)
    : undefined;

  useEffect(() => {
    if (property) {
      setActiveImage(property.coverImage);
      document.title = property.seoTitle || `${property.title} | ${settings.brandName}`;
      void trackAnalyticsEvent({
        eventType: 'property_view',
        path: `/imovel/${property.slug}`,
        entityId: property.id,
        entityTitle: property.title,
      });
    }
  }, [property, settings.brandName]);

  if (!property) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <h1 className="font-editorial text-4xl font-semibold text-[#0B1B32]">Imóvel não encontrado</h1>
        <p className="mt-3 text-sm text-[#0B1B32]/70">
          O imóvel solicitado pode ter sido atualizado ou removido do catálogo público.
        </p>
        <Link
          to="/comprar"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#0B1B32] px-5 py-2.5 text-sm font-semibold text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Ver todos os imóveis</span>
        </Link>
      </div>
    );
  }

  const gallery = Array.from(
    new Set([property.coverImage, ...(property.gallery || [])].filter(Boolean))
  );

  const similar = properties
    .filter((p) => p.published && p.id !== property.id)
    .slice(0, 3);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: property.title, url });
        return;
      } catch {
        // Fallback
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Top Breadcrumb & Share */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/comprar"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#0B1B32]/75 hover:text-[#0B1B32]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar para Comprar</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#0B1B32]/15 bg-white px-3.5 py-2 text-xs font-semibold text-[#0B1B32] hover:bg-[#0B1B32]/5 cursor-pointer"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Share2 className="h-3.5 w-3.5" />}
            <span>{copied ? 'Link copiado' : 'Compartilhar imóvel'}</span>
          </button>
        </div>
      </div>

      {/* Main Split */}
      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-6">
          <div className="aspect-[16/10] overflow-hidden rounded-2xl border border-[#0B1B32]/12 bg-[#0B1B32]">
            <SafeImage
              src={activeImage || property.coverImage}
              alt={property.title}
              className="h-full w-full object-cover"
            />
          </div>

          {gallery.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {gallery.map((img, i) => (
                <button
                  key={`${img}-${i}`}
                  type="button"
                  onClick={() => setActiveImage(img)}
                  className={`aspect-[4/3] overflow-hidden rounded-lg border-2 transition-all cursor-pointer ${
                    (activeImage || property.coverImage) === img
                      ? 'border-[#B8863B]'
                      : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
                >
                  <SafeImage src={img} alt={`${property.title} ${i + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Header info */}
          <div className="pt-2">
            <p className="text-xs font-medium text-[#0B1B32]/65">
              Código {property.code} · {property.businessType} · {property.propertyType}
            </p>
            <h1 className="mt-2 font-editorial text-4xl font-semibold text-[#0B1B32] sm:text-5xl">
              {property.title}
            </h1>
            <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-[#0B1B32]/75">
              <MapPin className="h-4 w-4 text-[#B8863B]" />
              <span>{property.region}</span>
              {linkedDev && (
                <>
                  <span>·</span>
                  <Link
                    to={`/empreendimento/${linkedDev.slug}`}
                    className="font-semibold text-[#9E712E] hover:underline"
                  >
                    {linkedDev.name}
                  </Link>
                </>
              )}
            </p>
          </div>

          {/* Structured Spec Grid */}
          <div className="grid grid-cols-2 gap-4 rounded-2xl border border-[#0B1B32]/12 bg-white p-6 sm:grid-cols-3">
            <div>
              <span className="text-xs text-[#0B1B32]/55">Valor do imóvel</span>
              <p className="mt-1 text-sm font-semibold text-[#0B1B32] tabular-nums">{property.priceDisplay}</p>
            </div>
            <div>
              <span className="text-xs text-[#0B1B32]/55">Entrada / Sinal</span>
              <p className="mt-1 text-sm font-semibold text-[#9E712E] tabular-nums">{property.downPaymentDisplay}</p>
            </div>
            <div>
              <span className="text-xs text-[#0B1B32]/55">Parcelas</span>
              <p className="mt-1 text-sm font-semibold text-[#0B1B32] tabular-nums">{property.installmentDisplay}</p>
            </div>
            <div>
              <span className="text-xs text-[#0B1B32]/55">Dormitórios</span>
              <p className="mt-1 text-sm font-semibold text-[#0B1B32]">{property.bedroomsDisplay}</p>
            </div>
            <div>
              <span className="text-xs text-[#0B1B32]/55">Área privativa</span>
              <p className="mt-1 text-sm font-semibold text-[#0B1B32]">{property.areaDisplay}</p>
            </div>
            <div>
              <span className="text-xs text-[#0B1B32]/55">Vagas</span>
              <p className="mt-1 text-sm font-semibold text-[#0B1B32]">{property.parkingDisplay}</p>
            </div>
            <div>
              <span className="text-xs text-[#0B1B32]/55">Condomínio</span>
              <p className="mt-1 text-sm font-semibold text-[#0B1B32]">{property.condoDisplay}</p>
            </div>
            <div>
              <span className="text-xs text-[#0B1B32]/55">IPTU</span>
              <p className="mt-1 text-sm font-semibold text-[#0B1B32]">{property.iptuDisplay}</p>
            </div>
            <div>
              <span className="text-xs text-[#0B1B32]/55">Disponibilidade</span>
              <p className="mt-1 text-sm font-semibold text-[#0B1B32]">{property.availabilityStatus}</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="font-editorial text-2xl font-semibold text-[#0B1B32]">Sobre este imóvel</h2>
            <p className="mt-3 text-base leading-relaxed text-[#0B1B32]/80">{property.description}</p>
          </div>

          {/* Features */}
          {property.features && property.features.length > 0 && (
            <div className="border-t border-[#0B1B32]/10 pt-6">
              <h2 className="font-editorial text-2xl font-semibold text-[#0B1B32]">Características e referências</h2>
              <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {property.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5 text-sm text-[#0B1B32]/80">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#B8863B]" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Confirmation Disclaimer */}
          <div className="flex items-start gap-3 rounded-xl border border-[#B8863B]/35 bg-[#EFEAE2]/70 p-4 text-xs leading-relaxed text-[#0B1B32]/80">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#9E712E]" />
            <div>
              <strong className="font-semibold text-[#0B1B32]">Aviso de confirmação de dados:</strong>{' '}
              Valores de entrada, parcelas, metragem e disponibilidade atual constituem referências históricas de campanhas anteriores e devem ser confirmados diretamente com a corretora Jéssica Perfeito ({settings.creci}) antes da formalização de proposta.
            </div>
          </div>
        </div>

        {/* Sticky Sidebar Action */}
        <div className="lg:col-span-5">
          <div className="sticky top-22 rounded-2xl border border-[#0B1B32]/12 bg-white p-6 sm:p-8 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#9E712E]">
              {settings.brandName} · {settings.creci}
            </p>
            <h2 className="mt-1 font-editorial text-3xl font-semibold text-[#0B1B32]">
              Agende sua visita ou tire dúvidas
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-[#0B1B32]/70">
              Receba atendimento próximo para confirmar valores vigentes e conhecer o imóvel pessoalmente.
            </p>

            <div className="mt-5 flex flex-wrap gap-2.5 pb-5 border-b border-[#0B1B32]/10">
              <button
                type="button"
                onClick={() => openVisitModal(property)}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#0B1B32] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#112645] cursor-pointer"
              >
                <Calendar className="h-4 w-4 text-[#E7C98F]" />
                <span>Agendar visita</span>
              </button>
              {settings.whatsappUrl && (
                <a
                  href={settings.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#0B1B32]/20 px-4 py-2.5 text-xs font-semibold text-[#0B1B32] hover:bg-[#0B1B32]/5"
                >
                  <MessageCircle className="h-4 w-4 text-[#B8863B]" />
                  <span>WhatsApp</span>
                </a>
              )}
            </div>

            <div className="mt-5">
              <LeadCaptureForm
                mode="lead"
                defaultPropertyId={property.id}
                defaultPropertyTitle={property.title}
                defaultDevelopmentId={property.developmentId}
                sourceLabel={`imovel/${property.slug}`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Similar Properties */}
      {similar.length > 0 && (
        <section className="mt-16 border-t border-[#0B1B32]/10 pt-12">
          <h2 className="font-editorial text-3xl font-semibold text-[#0B1B32]">
            Outras oportunidades que podem combinar com você
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
            {similar.map((prop) => (
              <PropertyCard key={prop.id} property={prop} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
