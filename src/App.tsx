import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { SiteProvider, useSite } from './context/SiteContext';
import { SiteFooter } from './components/layout/SiteFooter';
import { SiteHeader } from './components/layout/SiteHeader';
import { LgpdBanner } from './components/common/VisitModal';
import { FloatingConcierge } from './components/common/FloatingConcierge';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { HomePage } from './pages/HomePage';

const VisitModal = lazy(() => import('./components/common/VisitModal').then((m) => ({ default: m.VisitModal })));

const ComprarPage = lazy(() => import('./pages/ComprarPage').then((m) => ({ default: m.ComprarPage })));
const EmpreendimentosPage = lazy(() =>
  import('./pages/EmpreendimentosPage').then((m) => ({ default: m.EmpreendimentosPage }))
);
const EmpreendimentoDetailPage = lazy(() =>
  import('./pages/EmpreendimentoDetailPage').then((m) => ({ default: m.EmpreendimentoDetailPage }))
);
const PropertyDetailPage = lazy(() =>
  import('./pages/PropertyDetailPage').then((m) => ({ default: m.PropertyDetailPage }))
);
const SobrePage = lazy(() => import('./pages/SobrePage').then((m) => ({ default: m.SobrePage })));
const ContatoPage = lazy(() => import('./pages/ContatoPage').then((m) => ({ default: m.ContatoPage })));
const PrivacidadePage = lazy(() =>
  import('./pages/PrivacidadePage').then((m) => ({ default: m.PrivacidadePage }))
);
const LandingPageView = lazy(() =>
  import('./pages/LandingPageView').then((m) => ({ default: m.LandingPageView }))
);
const AdminPage = lazy(() => import('./pages/AdminPage').then((m) => ({ default: m.AdminPage })));

function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function RouteFallback() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="h-8 w-48 animate-pulse rounded bg-[#0B1B32]/10" />
      <div className="mt-4 h-4 w-80 animate-pulse rounded bg-[#0B1B32]/8" />
    </div>
  );
}

function AppShell() {
  const { pathname } = useLocation();
  const isAdminRoute = pathname.startsWith('/admin');
  const { isVisitModalOpen } = useSite();

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF8F5] text-[#0B1B32]">
      <ScrollToTop />
      {!isAdminRoute && <SiteHeader />}
      <main className="flex-1">
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/comprar" element={<ComprarPage />} />
            <Route path="/empreendimentos" element={<EmpreendimentosPage />} />
            <Route path="/empreendimento/:slug" element={<EmpreendimentoDetailPage />} />
            <Route path="/imovel/:slug" element={<PropertyDetailPage />} />
            <Route path="/sobre" element={<SobrePage />} />
            <Route path="/contato" element={<ContatoPage />} />
            <Route path="/privacidade" element={<PrivacidadePage />} />
            <Route path="/oportunidade/:slug" element={<LandingPageView routePrefix="oportunidade" />} />
            <Route path="/campanha/:slug" element={<LandingPageView routePrefix="campanha" />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </Suspense>
      </main>
      {!isAdminRoute && <SiteFooter />}
      {!isAdminRoute && <FloatingConcierge />}
      {!isAdminRoute && isVisitModalOpen && (
        <Suspense fallback={null}>
          <VisitModal />
        </Suspense>
      )}
      {!isAdminRoute && <LgpdBanner />}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <SiteProvider>
          <AppShell />
        </SiteProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
