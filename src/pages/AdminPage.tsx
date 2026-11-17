import React, { useCallback, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  BarChart3,
  Building2,
  ExternalLink,
  Home,
  Image as ImageIcon,
  LayoutDashboard,
  Lock,
  LogOut,
  Megaphone,
  Settings,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import { auth, firebaseProjectId, googleProvider } from '../lib/firebase';
import {
  fetchAnalyticsAdmin,
  fetchLeadsAdmin,
  fetchVisitRequestsAdmin,
} from '../services/firestoreService';
import type { AnalyticsEventItem, LeadItem, VisitRequestItem } from '../types/domain';
import { AdminEmpreendimentosTab } from '../components/admin/AdminEmpreendimentosTab';
import { AdminLandingPagesTab } from '../components/admin/AdminLandingPagesTab';
import { AdminLeadsTab } from '../components/admin/AdminLeadsTab';
import { AdminMediaTab } from '../components/admin/AdminMediaTab';
import { AdminPropertiesTab } from '../components/admin/AdminPropertiesTab';
import { AdminSettingsTab } from '../components/admin/AdminSettingsTab';

type AdminTab = 'dashboard' | 'properties' | 'empreendimentos' | 'landing-pages' | 'leads' | 'media' | 'settings';

export const AdminPage: React.FC = () => {
  const { user, isAdmin, authReady, properties, empreendimentos, landingPages, settings } = useSite();

  const [email, setEmail] = useState('admin@x.com');
  const [password, setPassword] = useState('admin4321');
  const [authError, setAuthError] = useState('');
  const [authNotice, setAuthNotice] = useState('');
  const [providerNeedsEnable, setProviderNeedsEnable] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [visits, setVisits] = useState<VisitRequestItem[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsEventItem[]>([]);

  const loadAdminMetrics = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const [l, v, a] = await Promise.all([
        fetchLeadsAdmin(),
        fetchVisitRequestsAdmin(),
        fetchAnalyticsAdmin(),
      ]);
      setLeads(l);
      setVisits(v);
      setAnalytics(a);
    } catch (err) {
      console.error('Erro ao carregar métricas admin:', err);
    }
  }, [isAdmin]);

  useEffect(() => {
    document.title = `Painel Administrativo | ${settings.brandName}`;
  }, [settings.brandName]);

  useEffect(() => {
    if (isAdmin) {
      void loadAdminMetrics();
    }
  }, [isAdmin, loadAdminMetrics]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthNotice('');
    setProviderNeedsEnable(false);
    setSubmitting(true);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || '';
      if (
        (code === 'auth/user-not-found' || code === 'auth/invalid-credential') &&
        email.trim().toLowerCase() === 'admin@x.com' &&
        password === 'admin4321'
      ) {
        try {
          await createUserWithEmailAndPassword(auth, 'admin@x.com', 'admin4321');
          setAuthNotice('Conta admin@x.com provisionada com sucesso no Firebase Auth.');
          return;
        } catch (createErr: unknown) {
          const createCode = (createErr as { code?: string })?.code || '';
          if (createCode === 'auth/operation-not-allowed') {
            setProviderNeedsEnable(true);
            setAuthError(
              'O provedor E-mail/Senha ainda não foi habilitado no console do Firebase Authentication.'
            );
          } else {
            setAuthError('Credenciais inválidas ou erro ao provisionar conta admin@x.com.');
          }
        }
      } else if (code === 'auth/operation-not-allowed') {
        setProviderNeedsEnable(true);
        setAuthError(
          'O provedor E-mail/Senha precisa ser habilitado no Console do Firebase Authentication.'
        );
      } else {
        setAuthError('Não foi possível entrar. Verifique e-mail e senha.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError('');
    setAuthNotice('');
    setSubmitting(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Erro ao autenticar com Google.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    setAuthError('');
    setAuthNotice('');
    if (!email.trim()) {
      setAuthError('Informe o e-mail para recuperação de senha.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setAuthNotice(`E-mail de recuperação enviado para ${email.trim()}.`);
    } catch {
      setAuthError('Não foi possível enviar o e-mail de recuperação para este endereço.');
    }
  };

  if (!authReady) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center text-sm text-[#0B1B32]/70">
        Verificando sessão administrativa...
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
        <div className="rounded-2xl border border-[#0B1B32]/15 bg-white p-7 shadow-lg sm:p-10">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#0B1B32] text-[#E7C98F]">
              <Lock className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#9E712E]">
                Área Privada do Site
              </p>
              <h1 className="font-editorial text-3xl font-semibold text-[#0B1B32]">
                Painel Administrativo
              </h1>
            </div>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-[#0B1B32]/70">
            Acesso restrito para gerenciamento de imóveis, empreendimentos, landing pages, leads e configurações de {settings.brandName}.
          </p>

          {user && !isAdmin && (
            <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
              Você está conectado como <strong>{user.email}</strong>, que não possui permissão de administrador.{' '}
              <button type="button" onClick={() => void signOut(auth)} className="underline font-semibold cursor-pointer">
                Sair desta conta
              </button>
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#0B1B32]/75 mb-1">Login (E-mail)</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-[#0B1B32]/18 px-3.5 py-2.5 text-sm focus:border-[#B8863B] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#0B1B32]/75 mb-1">Senha</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-[#0B1B32]/18 px-3.5 py-2.5 text-sm focus:border-[#B8863B] focus:outline-none"
              />
            </div>

            {authError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                {authError}
              </div>
            )}

            {providerNeedsEnable && (
              <div className="rounded-xl border border-[#B8863B]/40 bg-[#EFEAE2] p-4 text-xs leading-relaxed text-[#0B1B32]">
                <p className="font-semibold">Como habilitar login por E-mail/Senha no Firebase:</p>
                <ol className="mt-1.5 list-decimal pl-4 space-y-1">
                  <li>
                    Acesse{' '}
                    <a
                      href={`https://console.firebase.google.com/project/${firebaseProjectId}/authentication/providers`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-[#9E712E] underline"
                    >
                      Authentication → Sign-in method ({firebaseProjectId})
                    </a>
                  </li>
                  <li>Ative o provedor <strong>E-mail/senha</strong> e salve.</li>
                  <li>Volte aqui e clique em <strong>Entrar no Painel</strong> — a conta <code>admin@x.com</code> será criada automaticamente no primeiro login.</li>
                </ol>
              </div>
            )}

            {authNotice && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
                {authNotice}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-[#0B1B32] px-4 py-3 text-sm font-semibold text-white hover:bg-[#112645] transition-colors cursor-pointer"
            >
              {submitting ? 'Autenticando...' : 'Entrar no Painel'}
            </button>
          </form>

          <div className="mt-4 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={handleResetPassword}
              className="text-[#9E712E] hover:underline cursor-pointer"
            >
              Recuperar senha
            </button>
            <Link to="/" className="text-[#0B1B32]/65 hover:text-[#0B1B32]">
              Voltar ao site
            </Link>
          </div>

          <div className="mt-6 border-t border-[#0B1B32]/10 pt-5">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={submitting}
              className="w-full rounded-lg border border-[#0B1B32]/20 bg-[#FAF8F5] px-4 py-2.5 text-xs font-semibold text-[#0B1B32] hover:bg-[#EFEAE2] transition-colors cursor-pointer"
            >
              Entrar com conta Google autorizada
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated Admin Area
  const totalViews = analytics.filter((a) =>
    ['page_view', 'property_view', 'lp_view'].includes(a.eventType)
  ).length;
  const totalConversions = leads.length + visits.length;
  const conversionRate = totalViews > 0 ? ((totalConversions / totalViews) * 100).toFixed(1) : '0.0';

  const navButtons: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Visão Geral', icon: <LayoutDashboard className="h-4 w-4" /> },
    { id: 'properties', label: 'Imóveis', icon: <Home className="h-4 w-4" /> },
    { id: 'empreendimentos', label: 'Empreendimentos', icon: <Building2 className="h-4 w-4" /> },
    { id: 'landing-pages', label: 'Landing Pages', icon: <Megaphone className="h-4 w-4" /> },
    { id: 'leads', label: 'Leads & Visitas', icon: <Users className="h-4 w-4" /> },
    { id: 'media', label: 'Mídia (Blob)', icon: <ImageIcon className="h-4 w-4" /> },
    { id: 'settings', label: 'Site & SEO', icon: <Settings className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-[85vh] bg-[#FAF8F5]">
      <div className="border-b border-[#0B1B32]/10 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#9E712E]">
              Painel Administrativo Privado · {user.email}
            </p>
            <h1 className="font-editorial text-2xl font-semibold text-[#0B1B32]">
              Gestão do Site {settings.brandName}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#0B1B32]/15 px-3.5 py-2 text-xs font-semibold text-[#0B1B32] hover:bg-[#0B1B32]/5"
            >
              <span>Ver site público</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
            <button
              type="button"
              onClick={() => void signOut(auth)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B1B32] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#112645] cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Admin Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-[#0B1B32]/10 pb-4">
          {navButtons.map((btn) => (
            <button
              key={btn.id}
              type="button"
              onClick={() => setActiveTab(btn.id)}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === btn.id
                  ? 'bg-[#0B1B32] text-white'
                  : 'bg-white border border-[#0B1B32]/12 text-[#0B1B32]/80 hover:bg-[#EFEAE2]'
              }`}
            >
              {btn.icon}
              <span>{btn.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-8">
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-[#0B1B32]/12 bg-white p-5">
                  <p className="text-xs font-medium text-[#0B1B32]/60">Imóveis cadastrados</p>
                  <p className="mt-2 font-editorial text-4xl font-semibold text-[#0B1B32] tabular-nums">
                    {properties.length}
                  </p>
                  <p className="mt-1 text-xs text-[#9E712E] tabular-nums">
                    {properties.filter((p) => p.published).length} publicados
                  </p>
                </div>

                <div className="rounded-xl border border-[#0B1B32]/12 bg-white p-5">
                  <p className="text-xs font-medium text-[#0B1B32]/60">Empreendimentos</p>
                  <p className="mt-2 font-editorial text-4xl font-semibold text-[#0B1B32] tabular-nums">
                    {empreendimentos.length}
                  </p>
                  <p className="mt-1 text-xs text-[#9E712E] tabular-nums">
                    {landingPages.length} landing pages criadas
                  </p>
                </div>

                <div className="rounded-xl border border-[#0B1B32]/12 bg-white p-5">
                  <p className="text-xs font-medium text-[#0B1B32]/60">Leads & Visitas</p>
                  <p className="mt-2 font-editorial text-4xl font-semibold text-[#0B1B32] tabular-nums">
                    {totalConversions}
                  </p>
                  <p className="mt-1 text-xs text-[#9E712E] tabular-nums">
                    {leads.length} leads · {visits.length} visitas
                  </p>
                </div>

                <div className="rounded-xl border border-[#0B1B32]/12 bg-white p-5">
                  <p className="text-xs font-medium text-[#0B1B32]/60">Acessos & Conversão</p>
                  <p className="mt-2 font-editorial text-4xl font-semibold text-[#0B1B32] tabular-nums">
                    {totalViews}
                  </p>
                  <p className="mt-1 text-xs text-[#9E712E] tabular-nums">
                    Taxa de conversão: {conversionRate}%
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-xl border border-[#0B1B32]/12 bg-white p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-editorial text-2xl font-semibold text-[#0B1B32]">
                      Últimos leads recebidos
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveTab('leads')}
                      className="text-xs font-semibold text-[#9E712E] hover:underline cursor-pointer"
                    >
                      Ver todos
                    </button>
                  </div>
                  <div className="mt-4 divide-y divide-[#0B1B32]/10">
                    {leads.slice(0, 5).map((l) => (
                      <div key={l.id} className="flex items-center justify-between py-3 text-xs">
                        <div>
                          <p className="font-semibold text-[#0B1B32]">{l.name}</p>
                          <p className="text-[#0B1B32]/65">{l.propertyTitle || l.source}</p>
                        </div>
                        <span className="font-medium text-[#9E712E]">{l.status}</span>
                      </div>
                    ))}
                    {leads.length === 0 && (
                      <p className="py-4 text-xs text-[#0B1B32]/60">Nenhum lead capturado ainda.</p>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-[#0B1B32]/12 bg-white p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-editorial text-2xl font-semibold text-[#0B1B32]">
                      Atividade recente
                    </h3>
                    <BarChart3 className="h-4 w-4 text-[#B8863B]" />
                  </div>
                  <div className="mt-4 divide-y divide-[#0B1B32]/10">
                    {analytics.slice(0, 6).map((evt) => (
                      <div key={evt.id} className="flex items-center justify-between py-3 text-xs">
                        <div>
                          <p className="font-medium text-[#0B1B32]">{evt.entityTitle || evt.path}</p>
                          <p className="text-[#0B1B32]/60">{evt.path}</p>
                        </div>
                        <span className="text-[#9E712E]">{evt.eventType}</span>
                      </div>
                    ))}
                    {analytics.length === 0 && (
                      <p className="py-4 text-xs text-[#0B1B32]/60">Aguardando eventos de navegação.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'properties' && <AdminPropertiesTab />}
          {activeTab === 'empreendimentos' && <AdminEmpreendimentosTab />}
          {activeTab === 'landing-pages' && <AdminLandingPagesTab />}
          {activeTab === 'leads' && (
            <AdminLeadsTab leads={leads} visits={visits} onReload={loadAdminMetrics} />
          )}
          {activeTab === 'media' && <AdminMediaTab />}
          {activeTab === 'settings' && <AdminSettingsTab />}
        </div>
      </div>
    </div>
  );
};
