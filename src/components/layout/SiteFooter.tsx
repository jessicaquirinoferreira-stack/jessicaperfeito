import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Lock, MessageCircle } from 'lucide-react';
import { useSite } from '../../context/SiteContext';
import { trackAnalyticsAsync } from '../../services/analytics';

export const SiteFooter: React.FC = () => {
  const { settings, landingPages } = useSite();
  const publishedLps = landingPages.filter((lp) => lp.status === 'publicada');

  const handleWhatsappClick = () => {
    trackAnalyticsAsync({
      eventType: 'whatsapp_click',
      path: window.location.pathname,
      entityTitle: 'Footer WhatsApp',
    });
  };

  return (
    <footer className="border-t border-[#0B1B32]/12 bg-[#0B1B32] text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          {/* Brand Column */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[#B8863B]/50 bg-[#112645] font-editorial text-lg font-bold text-[#E7C98F]">
                {settings.brandMonogram || 'JP'}
              </span>
              <div>
                <p className="font-editorial text-2xl font-semibold text-white">
                  {settings.brandName}
                </p>
                <p className="text-xs tracking-wider text-[#E7C98F]">
                  {settings.creci} · Rio de Janeiro
                </p>
              </div>
            </div>

            <p className="mt-5 max-w-md text-sm leading-relaxed text-white/75">
              {settings.tagline}
            </p>
            <p className="mt-3 max-w-md text-xs leading-relaxed text-white/55">
              {settings.footerText}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              {settings.instagramUrl && (
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3.5 py-2 text-xs font-medium text-white/90 transition-colors hover:border-[#B8863B] hover:text-[#E7C98F]"
                >
                  <Instagram className="h-4 w-4" />
                  <span>{settings.instagramHandle || '@imoveisperfeito'}</span>
                </a>
              )}
              {settings.whatsappUrl && (
                <a
                  href={settings.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleWhatsappClick}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#B8863B]/50 bg-[#B8863B]/15 px-3.5 py-2 text-xs font-medium text-[#E7C98F] transition-colors hover:bg-[#B8863B] hover:text-[#0B1B32]"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Vamos conversar</span>
                </a>
              )}
            </div>
          </div>

          {/* Navigation Column */}
          <div className="md:col-span-3">
            <h3 className="font-sans text-xs font-semibold uppercase tracking-widest text-[#E7C98F]">
              Navegação
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-white/75">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Início
                </Link>
              </li>
              <li>
                <Link to="/comprar" className="hover:text-white transition-colors">
                  Comprar imóveis
                </Link>
              </li>
              <li>
                <Link to="/empreendimentos" className="hover:text-white transition-colors">
                  Empreendimentos
                </Link>
              </li>
              <li>
                <Link to="/sobre" className="hover:text-white transition-colors">
                  Sobre Jéssica Perfeito
                </Link>
              </li>
              <li>
                <Link to="/contato" className="hover:text-white transition-colors">
                  Contato e visitas
                </Link>
              </li>
            </ul>
          </div>

          {/* Campaigns & Legal Column */}
          <div className="md:col-span-4">
            <h3 className="font-sans text-xs font-semibold uppercase tracking-widest text-[#E7C98F]">
              Oportunidades & Transparência
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm text-white/75">
              {publishedLps.slice(0, 4).map((lp) => (
                <li key={lp.id}>
                  <Link
                    to={`/${lp.routePrefix}/${lp.slug}`}
                    className="hover:text-white transition-colors"
                  >
                    {lp.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/privacidade" className="hover:text-white transition-colors">
                  Política de Privacidade e LGPD
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 text-xs text-white/55 sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} {settings.brandName} · {settings.creci}. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacidade" className="hover:text-white/85 transition-colors">
              Privacidade & Cookies
            </Link>
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 text-white/60 hover:text-[#E7C98F] transition-colors"
            >
              <Lock className="h-3 w-3" />
              <span>Painel Admin</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
