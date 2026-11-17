import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { trackAnalyticsEvent } from '../services/firestoreService';
import { SafeImage } from '../components/common/SafeImage';
import { BlurFade } from '../components/effects/MagicUIComponents';

export const EmpreendimentosPage: React.FC = () => {
  const { empreendimentos, properties, settings } = useSite();
  const published = empreendimentos.filter((e) => e.published);

  useEffect(() => {
    document.title = `Empreendimentos no Rio de Janeiro | ${settings.brandName}`;
    void trackAnalyticsEvent({
      eventType: 'page_view',
      path: '/empreendimentos',
      entityTitle: 'Empreendimentos',
    });
  }, [settings.brandName]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="border-b border-[#0B1B32]/10 pb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#9E712E]">
          Empreendimentos · Rio de Janeiro
        </p>
        <h1 className="mt-2 font-editorial text-4xl font-semibold text-[#0B1B32] sm:text-5xl">
          Empreendimentos selecionados
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#0B1B32]/75 sm:text-base">
          Conheça os projetos habitacionais no Porto Maravilha e Região Portuária. Disponibilidade de unidades e tabelas vigentes são confirmadas diretamente com Jéssica Perfeito ({settings.creci}).
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {published.map((dev, idx) => {
          const linkedCount = properties.filter((p) => p.published && p.developmentId === dev.id).length;
          return (
            <BlurFade key={dev.id} delay={idx * 0.08}>
              <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#0B1B32]/12 bg-white">
                <Link to={`/empreendimento/${dev.slug}`} className="aspect-[16/10] overflow-hidden bg-[#0B1B32]">
                  <SafeImage
                    src={dev.coverImage}
                    alt={dev.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </Link>
                <div className="flex flex-1 flex-col justify-between p-6 sm:p-8">
                  <div>
                    <p className="flex items-center gap-1.5 text-xs font-medium text-[#0B1B32]/60">
                      <MapPin className="h-3.5 w-3.5 text-[#B8863B]" />
                      <span>{dev.location}</span>
                    </p>
                    <Link to={`/empreendimento/${dev.slug}`}>
                      <h2 className="mt-2 font-editorial text-3xl font-semibold text-[#0B1B32] group-hover:text-[#9E712E] transition-colors">
                        {dev.name}
                      </h2>
                    </Link>
                    {dev.entryCondition && (
                      <p className="mt-2 text-sm font-semibold text-[#9E712E]">
                        {dev.entryCondition}
                      </p>
                    )}
                    <p className="mt-3 text-sm leading-relaxed text-[#0B1B32]/75">
                      {dev.description}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-[#0B1B32]/10 pt-5 text-xs">
                    <span className="text-[#0B1B32]/65 tabular-nums">
                      {linkedCount} {linkedCount === 1 ? 'unidade vinculada' : 'unidades vinculadas'} · {dev.status}
                    </span>
                    <Link
                      to={`/empreendimento/${dev.slug}`}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0B1B32] hover:text-[#9E712E]"
                    >
                      <span>Detalhes</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </article>
            </BlurFade>
          );
        })}
      </div>
    </div>
  );
};
