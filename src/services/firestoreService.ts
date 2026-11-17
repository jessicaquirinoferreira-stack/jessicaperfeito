import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import {
  DEFAULT_EMPREENDIMENTOS,
  DEFAULT_LANDING_PAGES,
  DEFAULT_MEDIA,
  DEFAULT_PROFESSIONAL_PROFILE,
  DEFAULT_PROPERTIES,
  DEFAULT_SITE_SETTINGS,
} from '../data/seedData';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { sanitizeId, slugify } from '../lib/utils';
import type {
  AnalyticsEventItem,
  EmpreendimentoItem,
  LandingPageItem,
  LeadItem,
  LeadStatus,
  MediaAssetItem,
  ProfessionalProfile,
  PropertyItem,
  SiteSettings,
  VisitRequestItem,
  VisitStatus,
} from '../types/domain';

function uid(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return sanitizeId(`${prefix}_${Date.now()}_${rand}`);
}

function clip(val: string | undefined, max: number): string {
  return (val || '').trim().slice(0, max);
}

function isTransientOffline(error: unknown): boolean {
  const msg = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return msg.includes('client is offline') || msg.includes('unavailable') || msg.includes('failed to get document');
}

// --- Public Read Functions ---

export async function fetchSiteSettings(): Promise<SiteSettings> {
  try {
    const snap = await getDoc(doc(db, 'siteSettings', 'main'));
    if (snap.exists()) {
      return { ...DEFAULT_SITE_SETTINGS, ...(snap.data() as Partial<SiteSettings>), id: snap.id };
    }
    return DEFAULT_SITE_SETTINGS;
  } catch (error) {
    if (isTransientOffline(error)) return DEFAULT_SITE_SETTINGS;
    handleFirestoreError(error, OperationType.GET, 'siteSettings/main');
  }
}

export async function fetchProfessionalProfile(): Promise<ProfessionalProfile> {
  try {
    const snap = await getDoc(doc(db, 'professionalProfile', 'main'));
    if (snap.exists()) {
      return { ...DEFAULT_PROFESSIONAL_PROFILE, ...(snap.data() as Partial<ProfessionalProfile>), id: snap.id };
    }
    return DEFAULT_PROFESSIONAL_PROFILE;
  } catch (error) {
    if (isTransientOffline(error)) return DEFAULT_PROFESSIONAL_PROFILE;
    handleFirestoreError(error, OperationType.GET, 'professionalProfile/main');
  }
}

export async function fetchProperties(isAdminView: boolean): Promise<PropertyItem[]> {
  try {
    const ref = collection(db, 'properties');
    const q = isAdminView ? ref : query(ref, where('published', '==', true));
    const snap = await getDocs(q);
    if (snap.empty && !isAdminView) {
      return DEFAULT_PROPERTIES;
    }
    return snap.docs.map((d) => ({ ...(d.data() as Omit<PropertyItem, 'id'>), id: d.id }));
  } catch (error) {
    if (!isAdminView && isTransientOffline(error)) return DEFAULT_PROPERTIES;
    handleFirestoreError(error, OperationType.LIST, 'properties');
  }
}

export async function fetchEmpreendimentos(isAdminView: boolean): Promise<EmpreendimentoItem[]> {
  try {
    const ref = collection(db, 'empreendimentos');
    const q = isAdminView ? ref : query(ref, where('published', '==', true));
    const snap = await getDocs(q);
    if (snap.empty && !isAdminView) {
      return DEFAULT_EMPREENDIMENTOS;
    }
    return snap.docs.map((d) => ({ ...(d.data() as Omit<EmpreendimentoItem, 'id'>), id: d.id }));
  } catch (error) {
    if (!isAdminView && isTransientOffline(error)) return DEFAULT_EMPREENDIMENTOS;
    handleFirestoreError(error, OperationType.LIST, 'empreendimentos');
  }
}

export async function fetchLandingPages(isAdminView: boolean): Promise<LandingPageItem[]> {
  try {
    const ref = collection(db, 'landingPages');
    const q = isAdminView ? ref : query(ref, where('status', '==', 'publicada'));
    const snap = await getDocs(q);
    if (snap.empty && !isAdminView) {
      return DEFAULT_LANDING_PAGES;
    }
    return snap.docs.map((d) => ({ ...(d.data() as Omit<LandingPageItem, 'id'>), id: d.id }));
  } catch (error) {
    if (!isAdminView && isTransientOffline(error)) return DEFAULT_LANDING_PAGES;
    handleFirestoreError(error, OperationType.LIST, 'landingPages');
  }
}

export async function fetchMediaAssets(): Promise<MediaAssetItem[]> {
  try {
    const snap = await getDocs(collection(db, 'media'));
    if (snap.empty) {
      return DEFAULT_MEDIA;
    }
    return snap.docs.map((d) => ({ ...(d.data() as Omit<MediaAssetItem, 'id'>), id: d.id }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'media');
  }
}

// --- Public Submissions & Analytics ---

export async function submitLead(input: {
  name: string;
  phone: string;
  email?: string;
  propertyId?: string;
  propertyTitle?: string;
  developmentId?: string;
  message?: string;
  source?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  lgpdConsent: boolean;
}): Promise<string> {
  const id = uid('lead');
  const payload = {
    name: clip(input.name, 120),
    phone: clip(input.phone, 30),
    email: clip(input.email, 160),
    propertyId: clip(input.propertyId, 128),
    propertyTitle: clip(input.propertyTitle, 180),
    developmentId: clip(input.developmentId, 128),
    message: clip(input.message, 2000),
    source: clip(input.source || window.location.pathname, 200),
    utmSource: clip(input.utmSource, 100),
    utmMedium: clip(input.utmMedium, 100),
    utmCampaign: clip(input.utmCampaign, 120),
    utmContent: clip(input.utmContent, 120),
    status: 'Novo' as const,
    notes: '',
    lgpdConsent: Boolean(input.lgpdConsent),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'leads', id), payload);
    void trackAnalyticsEvent({
      eventType: 'lead_submit',
      path: payload.source || '/',
      entityId: payload.propertyId || payload.developmentId || '',
      entityTitle: payload.propertyTitle || 'Contato',
      utmSource: payload.utmSource,
      utmMedium: payload.utmMedium,
      utmCampaign: payload.utmCampaign,
    });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `leads/${id}`);
  }
}

export async function submitVisitRequest(input: {
  name: string;
  phone: string;
  email?: string;
  propertyId?: string;
  propertyTitle?: string;
  preferredDate?: string;
  preferredTime?: string;
  message?: string;
  source?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  lgpdConsent: boolean;
}): Promise<string> {
  const id = uid('visit');
  const payload = {
    name: clip(input.name, 120),
    phone: clip(input.phone, 30),
    email: clip(input.email, 160),
    propertyId: clip(input.propertyId, 128),
    propertyTitle: clip(input.propertyTitle, 180),
    preferredDate: clip(input.preferredDate, 40),
    preferredTime: clip(input.preferredTime, 40),
    message: clip(input.message, 2000),
    source: clip(input.source || window.location.pathname, 200),
    utmSource: clip(input.utmSource, 100),
    utmMedium: clip(input.utmMedium, 100),
    utmCampaign: clip(input.utmCampaign, 120),
    status: 'Pendente' as const,
    notes: '',
    lgpdConsent: Boolean(input.lgpdConsent),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'visitRequests', id), payload);
    void trackAnalyticsEvent({
      eventType: 'visit_submit',
      path: payload.source || '/',
      entityId: payload.propertyId || '',
      entityTitle: payload.propertyTitle || 'Agendamento de visita',
      utmSource: payload.utmSource,
      utmMedium: payload.utmMedium,
      utmCampaign: payload.utmCampaign,
    });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `visitRequests/${id}`);
  }
}

export async function trackAnalyticsEvent(input: {
  eventType: AnalyticsEventItem['eventType'];
  path: string;
  entityId?: string;
  entityTitle?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}): Promise<void> {
  const id = uid('evt');
  try {
    await setDoc(doc(db, 'analytics', id), {
      eventType: input.eventType,
      path: clip(input.path || '/', 300),
      entityId: clip(input.entityId, 128),
      entityTitle: clip(input.entityTitle, 200),
      utmSource: clip(input.utmSource, 100),
      utmMedium: clip(input.utmMedium, 100),
      utmCampaign: clip(input.utmCampaign, 120),
      createdAt: serverTimestamp(),
    });
  } catch {
    // Non-blocking analytics logging
  }
}

// --- Admin Management Functions ---

export async function ensureAdminUserRecord(userUid: string, email: string, name?: string): Promise<void> {
  const safeUid = sanitizeId(userUid);
  const ref = doc(db, 'adminUsers', safeUid);
  try {
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        email: clip(email, 160),
        name: clip(name || 'Administrador', 120),
        role: 'admin',
        createdAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `adminUsers/${safeUid}`);
  }
}

export async function seedInitialDatabaseIfNeeded(adminUid: string): Promise<void> {
  try {
    const settingsSnap = await getDoc(doc(db, 'siteSettings', 'main'));
    if (!settingsSnap.exists()) {
      const { id: _sId, ...settingsData } = DEFAULT_SITE_SETTINGS;
      await setDoc(doc(db, 'siteSettings', 'main'), {
        ...settingsData,
        updatedBy: sanitizeId(adminUid),
        updatedAt: serverTimestamp(),
      });
    }

    const profileSnap = await getDoc(doc(db, 'professionalProfile', 'main'));
    if (!profileSnap.exists()) {
      const { id: _pId, ...profileData } = DEFAULT_PROFESSIONAL_PROFILE;
      await setDoc(doc(db, 'professionalProfile', 'main'), {
        ...profileData,
        updatedAt: serverTimestamp(),
      });
    }

    const empSnap = await getDocs(collection(db, 'empreendimentos'));
    if (empSnap.empty) {
      const batch = writeBatch(db);
      for (const emp of DEFAULT_EMPREENDIMENTOS) {
        const { id, ...rest } = emp;
        batch.set(doc(db, 'empreendimentos', id), {
          ...rest,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      await batch.commit();
    }

    const propSnap = await getDocs(collection(db, 'properties'));
    if (propSnap.empty) {
      const batch = writeBatch(db);
      for (const prop of DEFAULT_PROPERTIES) {
        const { id, ...rest } = prop;
        batch.set(doc(db, 'properties', id), {
          ...rest,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      await batch.commit();
    }

    const lpSnap = await getDocs(collection(db, 'landingPages'));
    if (lpSnap.empty) {
      const batch = writeBatch(db);
      for (const lp of DEFAULT_LANDING_PAGES) {
        const { id, ...rest } = lp;
        batch.set(doc(db, 'landingPages', id), {
          ...rest,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      await batch.commit();
    }

    const mediaSnap = await getDocs(collection(db, 'media'));
    if (mediaSnap.empty) {
      const batch = writeBatch(db);
      for (const m of DEFAULT_MEDIA) {
        const { id, ...rest } = m;
        batch.set(doc(db, 'media', id), {
          ...rest,
          uploadedBy: sanitizeId(adminUid),
          createdAt: serverTimestamp(),
        });
      }
      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'seedInitialDatabaseIfNeeded');
  }
}

export async function saveSiteSettings(settings: SiteSettings, adminUid: string): Promise<void> {
  const { id: _id, updatedAt: _u, ...rest } = settings;
  try {
    await setDoc(doc(db, 'siteSettings', 'main'), {
      brandName: clip(rest.brandName, 120) || 'Jéssica Perfeito | Imóveis',
      brandMonogram: clip(rest.brandMonogram, 8) || 'JP',
      tagline: clip(rest.tagline, 200) || 'Seu próximo capítulo começa com um novo lar.',
      creci: clip(rest.creci, 40) || 'CRECI 78861',
      whatsappUrl: clip(rest.whatsappUrl, 300),
      whatsappNumber: clip(rest.whatsappNumber, 40),
      instagramUrl: clip(rest.instagramUrl, 300),
      instagramHandle: clip(rest.instagramHandle, 80),
      primaryColor: clip(rest.primaryColor, 7) || '#0B1B32',
      accentColor: clip(rest.accentColor, 7) || '#B8863B',
      bgColor: clip(rest.bgColor, 7) || '#FAF8F5',
      logoUrl: clip(rest.logoUrl, 500000),
      heroTitle: clip(rest.heroTitle, 180),
      heroSubtitle: clip(rest.heroSubtitle, 400),
      heroImage: clip(rest.heroImage, 500000),
      footerText: clip(rest.footerText, 400),
      seoTitle: clip(rest.seoTitle, 160),
      seoDescription: clip(rest.seoDescription, 320),
      ga4Id: clip(rest.ga4Id, 60),
      gtmId: clip(rest.gtmId, 60),
      searchConsoleMeta: clip(rest.searchConsoleMeta, 200),
      adsId: clip(rest.adsId, 60),
      privacyNotice: clip(rest.privacyNotice, 2000),
      updatedBy: sanitizeId(adminUid),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'siteSettings/main');
  }
}

export async function saveProfessionalProfile(profile: ProfessionalProfile): Promise<void> {
  const { id: _id, updatedAt: _u, ...rest } = profile;
  try {
    await setDoc(doc(db, 'professionalProfile', 'main'), {
      name: clip(rest.name, 100) || 'Jéssica Perfeito',
      displayName: clip(rest.displayName, 120) || 'Jéssica Perfeito | Imóveis',
      creci: clip(rest.creci, 40) || 'CRECI 78861',
      bio: clip(rest.bio, 2500),
      shortBio: clip(rest.shortBio, 400),
      photoUrl: clip(rest.photoUrl, 500000),
      instagramHandle: clip(rest.instagramHandle, 80),
      instagramPostsCount: Number(rest.instagramPostsCount || 41),
      instagramFollowersCount: Number(rest.instagramFollowersCount || 549),
      regionFocus: clip(rest.regionFocus, 200),
      quote: clip(rest.quote, 300),
      highlights: (rest.highlights || []).slice(0, 10).map((h) => clip(h, 240)),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'professionalProfile/main');
  }
}

export async function saveProperty(property: Partial<PropertyItem> & { id?: string }): Promise<string> {
  const isNew = !property.id;
  const id = property.id ? sanitizeId(property.id) : uid('prop');
  const title = clip(property.title, 160) || 'Imóvel sem título';
  const normalizedSlug = slugify(property.slug || title) || `imovel-${Date.now()}`;

  const basePayload = {
    title,
    slug: clip(normalizedSlug, 160),
    code: clip(property.code, 40) || `JP-${Math.floor(1000 + Math.random() * 9000)}`,
    businessType: property.businessType || 'Venda',
    propertyType: property.propertyType || 'Apartamento',
    region: clip(property.region, 120) || 'Rio de Janeiro - RJ',
    developmentId: clip(property.developmentId, 128),
    developmentName: clip(property.developmentName, 160),
    priceDisplay: clip(property.priceDisplay, 100) || 'Sob consulta (a confirmar)',
    priceValue: Number(property.priceValue || 0),
    downPaymentDisplay: clip(property.downPaymentDisplay, 100) || 'A confirmar',
    downPaymentValue: Number(property.downPaymentValue || 0),
    installmentDisplay: clip(property.installmentDisplay, 100) || 'A confirmar',
    installmentValue: Number(property.installmentValue || 0),
    bedroomsDisplay: clip(property.bedroomsDisplay, 80) || 'A confirmar',
    areaDisplay: clip(property.areaDisplay, 80) || 'A confirmar',
    parkingDisplay: clip(property.parkingDisplay, 80) || 'A confirmar',
    condoDisplay: clip(property.condoDisplay, 80) || 'A confirmar',
    iptuDisplay: clip(property.iptuDisplay, 80) || 'A confirmar',
    availabilityStatus: clip(property.availabilityStatus, 80) || 'A confirmar com a corretora',
    isConfirmationRequired: property.isConfirmationRequired ?? true,
    featured: Boolean(property.featured),
    published: Boolean(property.published),
    coverImage: clip(property.coverImage, 500000),
    gallery: (property.gallery || []).slice(0, 12).map((g) => clip(g, 500000)).filter(Boolean),
    description: clip(property.description, 4000),
    features: (property.features || []).slice(0, 15).map((f) => clip(f, 200)).filter(Boolean),
    seoTitle: clip(property.seoTitle || title, 160),
    seoDescription: clip(property.seoDescription || property.description, 320),
    updatedAt: serverTimestamp(),
  };

  try {
    if (isNew) {
      await setDoc(doc(db, 'properties', id), {
        ...basePayload,
        createdAt: serverTimestamp(),
      });
    } else {
      const existingSnap = await getDoc(doc(db, 'properties', id));
      if (!existingSnap.exists()) {
        await setDoc(doc(db, 'properties', id), {
          ...basePayload,
          createdAt: serverTimestamp(),
        });
      } else {
        await updateDoc(doc(db, 'properties', id), basePayload);
      }
    }
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `properties/${id}`);
  }
}

export async function removeProperty(id: string): Promise<void> {
  const safeId = sanitizeId(id);
  try {
    await deleteDoc(doc(db, 'properties', safeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `properties/${safeId}`);
  }
}

export async function saveEmpreendimento(dev: Partial<EmpreendimentoItem> & { id?: string }): Promise<string> {
  const isNew = !dev.id;
  const id = dev.id ? sanitizeId(dev.id) : uid('emp');
  const name = clip(dev.name, 160) || 'Novo Empreendimento';
  const normalizedSlug = slugify(dev.slug || name) || `emp-${Date.now()}`;

  const basePayload = {
    name,
    slug: clip(normalizedSlug, 160),
    location: clip(dev.location, 200) || 'Rio de Janeiro - RJ',
    status: clip(dev.status, 80) || 'A confirmar com a corretora',
    entryCondition: clip(dev.entryCondition, 200),
    description: clip(dev.description, 4000),
    highlights: (dev.highlights || []).slice(0, 12).map((h) => clip(h, 240)).filter(Boolean),
    coverImage: clip(dev.coverImage, 500000),
    gallery: (dev.gallery || []).slice(0, 12).map((g) => clip(g, 500000)).filter(Boolean),
    featured: Boolean(dev.featured),
    published: Boolean(dev.published),
    seoTitle: clip(dev.seoTitle || name, 160),
    seoDescription: clip(dev.seoDescription || dev.description, 320),
    updatedAt: serverTimestamp(),
  };

  try {
    if (isNew) {
      await setDoc(doc(db, 'empreendimentos', id), {
        ...basePayload,
        createdAt: serverTimestamp(),
      });
    } else {
      const existingSnap = await getDoc(doc(db, 'empreendimentos', id));
      if (!existingSnap.exists()) {
        await setDoc(doc(db, 'empreendimentos', id), {
          ...basePayload,
          createdAt: serverTimestamp(),
        });
      } else {
        await updateDoc(doc(db, 'empreendimentos', id), basePayload);
      }
    }
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `empreendimentos/${id}`);
  }
}

export async function removeEmpreendimento(id: string): Promise<void> {
  const safeId = sanitizeId(id);
  try {
    await deleteDoc(doc(db, 'empreendimentos', safeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `empreendimentos/${safeId}`);
  }
}

export async function saveLandingPage(
  lp: Partial<LandingPageItem> & { id?: string },
  existingLps: LandingPageItem[]
): Promise<string> {
  const isNew = !lp.id;
  const id = lp.id ? sanitizeId(lp.id) : uid('lp');
  const title = clip(lp.title, 160) || 'Nova Landing Page';
  const normalizedSlug = slugify(lp.slug || title) || `lp-${Date.now()}`;
  const isPremiumShowcase = Boolean(lp.isPremiumShowcase);

  const basePayload = {
    title,
    slug: clip(normalizedSlug, 120),
    routePrefix: lp.routePrefix || 'oportunidade',
    isPremiumShowcase,
    targetType: lp.targetType || 'property',
    targetIds: (lp.targetIds || []).slice(0, 6).map((t) => clip(t, 128)).filter(Boolean),
    heroHeadline: clip(lp.heroHeadline, 200) || title,
    heroSubheadline: clip(lp.heroSubheadline, 400),
    heroImage: clip(lp.heroImage, 500000),
    editorialStory: clip(lp.editorialStory, 4000),
    conditionHighlight: clip(lp.conditionHighlight, 200),
    ctaText: clip(lp.ctaText, 80) || 'Agendar atendimento',
    gallery: (lp.gallery || []).slice(0, 10).map((g) => clip(g, 500000)).filter(Boolean),
    status: lp.status || 'rascunho',
    seoTitle: clip(lp.seoTitle || title, 160),
    seoDescription: clip(lp.seoDescription || lp.heroSubheadline, 320),
    ogImage: clip(lp.ogImage || lp.heroImage, 500000),
    updatedAt: serverTimestamp(),
  };

  try {
    // Enforce: at most ONE Premium Landing Page showcase across the whole platform
    if (isPremiumShowcase) {
      const others = existingLps.filter((item) => item.id !== id && item.isPremiumShowcase);
      for (const other of others) {
        const otherRef = doc(db, 'landingPages', sanitizeId(other.id));
        const otherSnap = await getDoc(otherRef);
        if (otherSnap.exists()) {
          await updateDoc(otherRef, {
            isPremiumShowcase: false,
            updatedAt: serverTimestamp(),
          });
        }
      }
    }

    if (isNew) {
      await setDoc(doc(db, 'landingPages', id), {
        ...basePayload,
        createdAt: serverTimestamp(),
      });
    } else {
      const existingSnap = await getDoc(doc(db, 'landingPages', id));
      if (!existingSnap.exists()) {
        await setDoc(doc(db, 'landingPages', id), {
          ...basePayload,
          createdAt: serverTimestamp(),
        });
      } else {
        await updateDoc(doc(db, 'landingPages', id), basePayload);
      }
    }
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `landingPages/${id}`);
  }
}

export async function removeLandingPage(id: string): Promise<void> {
  const safeId = sanitizeId(id);
  try {
    await deleteDoc(doc(db, 'landingPages', safeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `landingPages/${safeId}`);
  }
}

// --- Admin Leads, Visits, Media & Analytics ---

export async function fetchLeadsAdmin(): Promise<LeadItem[]> {
  try {
    const snap = await getDocs(collection(db, 'leads'));
    return snap.docs.map((d) => ({ ...(d.data() as Omit<LeadItem, 'id'>), id: d.id }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'leads');
  }
}

export async function updateLeadAdmin(id: string, status: LeadStatus, notes: string): Promise<void> {
  const safeId = sanitizeId(id);
  try {
    await updateDoc(doc(db, 'leads', safeId), {
      status,
      notes: clip(notes, 2000),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `leads/${safeId}`);
  }
}

export async function deleteLeadAdmin(id: string): Promise<void> {
  const safeId = sanitizeId(id);
  try {
    await deleteDoc(doc(db, 'leads', safeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `leads/${safeId}`);
  }
}

export async function fetchVisitRequestsAdmin(): Promise<VisitRequestItem[]> {
  try {
    const snap = await getDocs(collection(db, 'visitRequests'));
    return snap.docs.map((d) => ({ ...(d.data() as Omit<VisitRequestItem, 'id'>), id: d.id }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'visitRequests');
  }
}

export async function updateVisitRequestAdmin(
  id: string,
  status: VisitStatus,
  notes: string,
  preferredDate?: string,
  preferredTime?: string
): Promise<void> {
  const safeId = sanitizeId(id);
  try {
    await updateDoc(doc(db, 'visitRequests', safeId), {
      status,
      notes: clip(notes, 2000),
      preferredDate: clip(preferredDate, 40),
      preferredTime: clip(preferredTime, 40),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `visitRequests/${safeId}`);
  }
}

export async function deleteVisitRequestAdmin(id: string): Promise<void> {
  const safeId = sanitizeId(id);
  try {
    await deleteDoc(doc(db, 'visitRequests', safeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `visitRequests/${safeId}`);
  }
}

export async function fetchAnalyticsAdmin(): Promise<AnalyticsEventItem[]> {
  try {
    const snap = await getDocs(collection(db, 'analytics'));
    return snap.docs.map((d) => ({ ...(d.data() as Omit<AnalyticsEventItem, 'id'>), id: d.id }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'analytics');
  }
}

export async function saveMediaAsset(
  asset: Omit<MediaAssetItem, 'id' | 'createdAt'>,
  adminUid: string
): Promise<string> {
  const id = uid('media');
  try {
    await setDoc(doc(db, 'media', id), {
      name: clip(asset.name, 200),
      url: clip(asset.url, 500000),
      pathname: clip(asset.pathname, 300),
      contentType: clip(asset.contentType, 100),
      size: Number(asset.size || 0),
      storageProvider: asset.storageProvider,
      uploadedBy: sanitizeId(adminUid),
      createdAt: serverTimestamp(),
    });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `media/${id}`);
  }
}

export async function deleteMediaAsset(id: string): Promise<void> {
  const safeId = sanitizeId(id);
  try {
    await deleteDoc(doc(db, 'media', safeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `media/${safeId}`);
  }
}
