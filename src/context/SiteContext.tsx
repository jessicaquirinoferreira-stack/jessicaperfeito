import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import {
  DEFAULT_EMPREENDIMENTOS,
  DEFAULT_LANDING_PAGES,
  DEFAULT_MEDIA,
  DEFAULT_PROFESSIONAL_PROFILE,
  DEFAULT_PROPERTIES,
  DEFAULT_SITE_SETTINGS,
} from '../data/seedData';
import type {
  EmpreendimentoItem,
  LandingPageItem,
  MediaAssetItem,
  ProfessionalProfile,
  PropertyItem,
  SiteSettings,
} from '../types/domain';

interface SiteContextValue {
  user: User | null;
  isAdmin: boolean;
  authReady: boolean;
  loading: boolean;
  settings: SiteSettings;
  profile: ProfessionalProfile;
  properties: PropertyItem[];
  empreendimentos: EmpreendimentoItem[];
  landingPages: LandingPageItem[];
  media: MediaAssetItem[];
  refreshAll: () => Promise<void>;
  visitModalProperty: PropertyItem | null;
  openVisitModal: (property?: PropertyItem | null) => void;
  closeVisitModal: () => void;
  isVisitModalOpen: boolean;
}

const SiteContext = createContext<SiteContextValue | null>(null);

const ADMIN_EMAILS = ['admin@x.com', 'jonasweb2rj@gmail.com'];
const CACHE_KEY = 'jp_site_cache_v1';

interface CachedSnapshot {
  settings?: SiteSettings;
  profile?: ProfessionalProfile;
  properties?: PropertyItem[];
  empreendimentos?: EmpreendimentoItem[];
  landingPages?: LandingPageItem[];
}

function readCachedSnapshot(): CachedSnapshot {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as CachedSnapshot;
  } catch {
    return {};
  }
}

function writeCachedSnapshot(data: CachedSnapshot) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // Ignore quota errors
  }
}

export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const cached = readCachedSnapshot();

  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>(cached.settings || DEFAULT_SITE_SETTINGS);
  const [profile, setProfile] = useState<ProfessionalProfile>(cached.profile || DEFAULT_PROFESSIONAL_PROFILE);
  const [properties, setProperties] = useState<PropertyItem[]>(cached.properties || DEFAULT_PROPERTIES);
  const [empreendimentos, setEmpreendimentos] = useState<EmpreendimentoItem[]>(
    cached.empreendimentos || DEFAULT_EMPREENDIMENTOS
  );
  const [landingPages, setLandingPages] = useState<LandingPageItem[]>(
    cached.landingPages || DEFAULT_LANDING_PAGES
  );
  const [media, setMedia] = useState<MediaAssetItem[]>(DEFAULT_MEDIA);

  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [visitModalProperty, setVisitModalProperty] = useState<PropertyItem | null>(null);

  const isAdmin = Boolean(
    user &&
      user.email &&
      ADMIN_EMAILS.includes(user.email.toLowerCase()) &&
      (user.email.toLowerCase() === 'admin@x.com' || user.emailVerified)
  );

  const fetchPublicAndCache = useCallback(async (adminMode: boolean) => {
    try {
      const fs = await import('../services/firestoreService');
      const [s, p, props, devs, lps] = await Promise.all([
        fs.fetchSiteSettings(),
        fs.fetchProfessionalProfile(),
        fs.fetchProperties(adminMode),
        fs.fetchEmpreendimentos(adminMode),
        fs.fetchLandingPages(adminMode),
      ]);
      setSettings(s);
      setProfile(p);
      setProperties(props);
      setEmpreendimentos(devs);
      setLandingPages(lps);

      if (!adminMode) {
        writeCachedSnapshot({
          settings: s,
          profile: p,
          properties: props,
          empreendimentos: devs,
          landingPages: lps,
        });
      } else {
        const med = await fs.fetchMediaAssets();
        setMedia(med);
      }
    } catch (err) {
      console.error('Erro ao sincronizar dados do Firestore, mantendo cache/fallback:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    await fetchPublicAndCache(isAdmin);
  }, [fetchPublicAndCache, isAdmin]);

  // Load Firebase Auth + Firestore asynchronously after initial paint so first render is instant
  useEffect(() => {
    let cancelled = false;
    let unsubscribeAuth: (() => void) | undefined;

    const timer = window.setTimeout(() => {
      if (cancelled) return;
      void fetchPublicAndCache(false);

      void Promise.all([
        import('firebase/auth'),
        import('../lib/firebase'),
        import('../services/firestoreService'),
      ])
        .then(([{ onAuthStateChanged }, { auth }, fs]) => {
          if (cancelled) return;
          unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
            if (cancelled) return;
            setUser(currentUser);
            setAuthReady(true);
            const adminAuthorized = Boolean(
              currentUser &&
                currentUser.email &&
                ADMIN_EMAILS.includes(currentUser.email.toLowerCase()) &&
                (currentUser.email.toLowerCase() === 'admin@x.com' || currentUser.emailVerified)
            );
            if (adminAuthorized && currentUser) {
              try {
                await fs.ensureAdminUserRecord(
                  currentUser.uid,
                  currentUser.email || '',
                  currentUser.displayName || 'Jéssica Perfeito Admin'
                );
                await fs.seedInitialDatabaseIfNeeded(currentUser.uid);
                await fetchPublicAndCache(true);
              } catch (err) {
                console.error('Aviso ao inicializar admin:', err);
              }
            }
          });
        })
        .catch((err) => {
          console.error('Aviso ao carregar Firebase Auth:', err);
          if (!cancelled) setAuthReady(true);
        });
    }, 40);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      unsubscribeAuth?.();
    };
  }, [fetchPublicAndCache]);

  // Inject dynamic analytics / Search Console tags if configured in SiteSettings
  useEffect(() => {
    if (settings.seoTitle && window.location.pathname === '/') {
      document.title = settings.seoTitle;
    }
    if (settings.searchConsoleMeta) {
      let meta = document.querySelector('meta[name="google-site-verification"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'google-site-verification');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', settings.searchConsoleMeta);
    }
    if (settings.ga4Id && !document.getElementById('ga4-script')) {
      const s1 = document.createElement('script');
      s1.id = 'ga4-script';
      s1.async = true;
      s1.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(settings.ga4Id)}`;
      document.head.appendChild(s1);
      const s2 = document.createElement('script');
      s2.id = 'ga4-inline';
      s2.textContent = `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${settings.ga4Id}');`;
      document.head.appendChild(s2);
    }
  }, [settings]);

  const openVisitModal = (property?: PropertyItem | null) => {
    setVisitModalProperty(property ?? null);
    setIsVisitModalOpen(true);
  };

  const closeVisitModal = () => {
    setIsVisitModalOpen(false);
    setVisitModalProperty(null);
  };

  return (
    <SiteContext.Provider
      value={{
        user,
        isAdmin,
        authReady,
        loading,
        settings,
        profile,
        properties,
        empreendimentos,
        landingPages,
        media,
        refreshAll,
        visitModalProperty,
        openVisitModal,
        closeVisitModal,
        isVisitModalOpen,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
};

export function useSite(): SiteContextValue {
  const ctx = useContext(SiteContext);
  if (!ctx) {
    throw new Error('useSite deve ser usado dentro de SiteProvider');
  }
  return ctx;
}
