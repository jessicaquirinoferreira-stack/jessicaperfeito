import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar } from 'lucide-react';
import { useSite } from '../../context/SiteContext';
import type { PropertyItem } from '../../types/domain';
import { TiltedCard } from '../effects/ReactBitsComponents';
import { SafeImage } from './SafeImage';

interface PropertyCardProps {
  property: PropertyItem;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const { openVisitModal } = useSite();

  return (
    <TiltedCard maxTilt={4}>
      <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-[#0B1B32]/12 bg-white transition-shadow duration-300 hover:shadow-[0_14px_34px_rgba(11,27,50,0.08)]">
        <Link to={`/imovel/${property.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-[#EFEAE2]">
          <SafeImage
            src={property.coverImage}
            alt={property.title}
            fallbackTitle={property.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#06101F]/65 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs font-medium text-white/95">
            <span>{property.businessType} · {property.propertyType}</span>
            <span className="tabular-nums tracking-wide text-white/80">{property.code}</span>
          </div>
        </Link>

        <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
          <div>
            {/* Zero-pill quiet metadata line */}
            <p className="text-xs font-medium text-[#0B1B32]/60">
              {property.region}
              {property.bedroomsDisplay ? ` · ${property.bedroomsDisplay}` : ''}
            </p>

            <Link to={`/imovel/${property.slug}`}>
              <h3 className="mt-2 font-editorial text-2xl font-semibold leading-snug text-[#0B1B32] group-hover:text-[#9E712E] transition-colors">
                {property.title}
              </h3>
            </Link>

            <p className="mt-2.5 line-clamp-2 text-sm leading-relaxed text-[#0B1B32]/72">
              {property.description}
            </p>
          </div>

          <div className="mt-5 border-t border-[#0B1B32]/10 pt-4">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="block text-[#0B1B32]/55">Entrada / Sinal</span>
                <span className="mt-0.5 block font-semibold text-[#0B1B32] tabular-nums">
                  {property.downPaymentDisplay || 'A confirmar'}
                </span>
              </div>
              <div>
                <span className="block text-[#0B1B32]/55">Parcelas / Condição</span>
                <span className="mt-0.5 block font-semibold text-[#0B1B32] tabular-nums">
                  {property.installmentDisplay || property.priceDisplay}
                </span>
              </div>
            </div>

            {property.isConfirmationRequired && (
              <p className="mt-3 text-[11px] font-medium text-[#9E712E]">
                Dados sujeitos à confirmação atualizada com a corretora.
              </p>
            )}

            <div className="mt-4 flex items-center justify-between gap-2">
              <Link
                to={`/imovel/${property.slug}`}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0B1B32] hover:text-[#9E712E] transition-colors whitespace-nowrap"
              >
                <span>Ver detalhes</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <button
                type="button"
                onClick={() => openVisitModal(property)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#0B1B32]/18 px-3 py-1.5 text-xs font-semibold text-[#0B1B32] transition-colors hover:bg-[#0B1B32] hover:text-white whitespace-nowrap cursor-pointer"
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>Agendar</span>
              </button>
            </div>
          </div>
        </div>
      </article>
    </TiltedCard>
  );
};
