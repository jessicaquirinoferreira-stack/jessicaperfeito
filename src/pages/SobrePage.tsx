import React, { useEffect } from 'react';
import { ArrowRight, Instagram, MapPin, MessageCircle } from 'lucide-react';
import { useSite } from '../context/SiteContext';
import { trackAnalyticsEvent } from '../services/firestoreService';
import { SafeImage } from '../components/common/SafeImage';
import { TextGenerateEffect } from '../components/effects/AceternityComponents';
import { NumberTicker } from '../components/effects/MagicUIComponents';

export const SobrePage: React.FC = () => {
  const { profile, settings, openVisitModal } = useSite();

  useEffect(() => {
    document.title = `Sobre ${profile.name} | ${settings.brandName}`;
    void trackAnalyticsEvent({
      eventType: 'page_view',
      path: '/sobre',
      entityTitle: 'Sobre Jéssica Perfeito',
    });
  }, [profile.name, settings.brandName]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 items-stretch gap-12 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="h-full min-h-[420px] overflow-hidden rounded-2xl border border-[#0B1B32]/12 bg-white">
            <SafeImage
              src={profile.photoUrl}
              alt={`${profile.name} — ${profile.creci}`}
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <div className="flex flex-col justify-center lg:col-span-7">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#9E712E]">
            Agente Imobiliária · {profile.creci}
          </p>
          <h1 className="mt-2 font-editorial text-4xl font-semibold text-[#0B1B32] sm:text-5xl">
            {profile.displayName}
          </h1>
          <p className="mt-3 font-editorial text-2xl italic text-[#9E712E]">
            “{profile.quote}”
          </p>

          <TextGenerateEffect
            words={profile.bio}
            className="mt-5 text-base leading-relaxed text-[#0B1B32]/82"
          />

          <div className="mt-6 flex items-center gap-2 text-sm text-[#0B1B32]/75">
            <MapPin className="h-4 w-4 text-[#B8863B]" />
            <span>{profile.regionFocus}</span>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 rounded-xl border border-[#0B1B32]/12 bg-white p-5 sm:max-w-md">
            <div>
              <span className="text-xs text-[#0B1B32]/55">Publicações @imoveisperfeito</span>
              <p className="mt-1 font-editorial text-3xl font-semibold text-[#0B1B32]">
                <NumberTicker value={profile.instagramPostsCount || 41} />
              </p>
            </div>
            <div>
              <span className="text-xs text-[#0B1B32]/55">Seguidores no perfil</span>
              <p className="mt-1 font-editorial text-3xl font-semibold text-[#0B1B32]">
                <NumberTicker value={profile.instagramFollowersCount || 549} />
              </p>
            </div>
          </div>

          <div className="mt-8 divide-y divide-[#0B1B32]/10 border-y border-[#0B1B32]/10">
            {(profile.highlights || []).map((item, idx) => (
              <div key={item} className="flex items-start gap-4 py-4">
                <span className="font-editorial text-xl font-semibold text-[#9E712E] tabular-nums">
                  0{idx + 1}.
                </span>
                <p className="text-sm font-medium text-[#0B1B32]/85">{item}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() => openVisitModal(null)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#0B1B32] px-6 py-3 text-sm font-semibold text-white hover:bg-[#112645] cursor-pointer"
            >
              <span>Agendar conversa</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            {settings.instagramUrl && (
              <a
                href={settings.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-[#0B1B32]/20 px-5 py-3 text-sm font-semibold text-[#0B1B32] hover:bg-[#0B1B32]/5"
              >
                <Instagram className="h-4 w-4 text-[#B8863B]" />
                <span>{profile.instagramHandle}</span>
              </a>
            )}
            {settings.whatsappUrl && (
              <a
                href={settings.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-[#B8863B]/45 px-5 py-3 text-sm font-semibold text-[#9E712E] hover:bg-[#B8863B]/10"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Vamos conversar</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
