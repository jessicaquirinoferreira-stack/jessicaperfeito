export type BusinessType = 'Venda' | 'Lançamento' | 'Investimento';
export type PropertyType = 'Apartamento' | 'Studio' | 'Cobertura' | 'Casa';

export interface SiteSettings {
  id?: string;
  brandName: string;
  brandMonogram: string;
  tagline: string;
  creci: string;
  whatsappUrl: string;
  whatsappNumber: string;
  instagramUrl: string;
  instagramHandle: string;
  primaryColor: string;
  accentColor: string;
  bgColor: string;
  logoUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  footerText: string;
  seoTitle: string;
  seoDescription: string;
  ga4Id: string;
  gtmId: string;
  searchConsoleMeta: string;
  adsId: string;
  privacyNotice: string;
  updatedAt?: unknown;
  updatedBy?: string;
}

export interface ProfessionalProfile {
  id?: string;
  name: string;
  displayName: string;
  creci: string;
  bio: string;
  shortBio: string;
  photoUrl: string;
  instagramHandle: string;
  instagramPostsCount: number;
  instagramFollowersCount: number;
  regionFocus: string;
  quote: string;
  highlights: string[];
  updatedAt?: unknown;
}

export interface PropertyItem {
  id: string;
  title: string;
  slug: string;
  code: string;
  businessType: BusinessType;
  propertyType: PropertyType;
  region: string;
  developmentId?: string;
  developmentName?: string;
  priceDisplay: string;
  priceValue: number;
  downPaymentDisplay: string;
  downPaymentValue: number;
  installmentDisplay: string;
  installmentValue: number;
  bedroomsDisplay: string;
  areaDisplay: string;
  parkingDisplay: string;
  condoDisplay: string;
  iptuDisplay: string;
  availabilityStatus: string;
  isConfirmationRequired: boolean;
  featured: boolean;
  published: boolean;
  coverImage: string;
  gallery: string[];
  description: string;
  features: string[];
  seoTitle?: string;
  seoDescription?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface EmpreendimentoItem {
  id: string;
  name: string;
  slug: string;
  location: string;
  status: string;
  entryCondition: string;
  description: string;
  highlights: string[];
  coverImage: string;
  gallery: string[];
  featured: boolean;
  published: boolean;
  seoTitle?: string;
  seoDescription?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export type LeadStatus = 'Novo' | 'Em atendimento' | 'Visitado' | 'Arquivado';

export interface LeadItem {
  id: string;
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
  status: LeadStatus;
  notes?: string;
  lgpdConsent: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export type VisitStatus = 'Pendente' | 'Confirmada' | 'Realizada' | 'Cancelada';

export interface VisitRequestItem {
  id: string;
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
  status: VisitStatus;
  notes?: string;
  lgpdConsent: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export type LandingPageStatus = 'publicada' | 'pausada' | 'rascunho';

export interface LandingPageItem {
  id: string;
  title: string;
  slug: string;
  routePrefix: 'oportunidade' | 'campanha';
  isPremiumShowcase: boolean;
  targetType: 'property' | 'development' | 'campaign';
  targetIds: string[];
  heroHeadline: string;
  heroSubheadline: string;
  heroImage: string;
  editorialStory: string;
  conditionHighlight: string;
  ctaText: string;
  gallery: string[];
  status: LandingPageStatus;
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface MediaAssetItem {
  id: string;
  name: string;
  url: string;
  pathname?: string;
  contentType?: string;
  size?: number;
  storageProvider: 'vercel-blob' | 'local-asset' | 'data-url';
  uploadedBy?: string;
  createdAt?: unknown;
}

export interface AnalyticsEventItem {
  id: string;
  eventType: 'page_view' | 'property_view' | 'lp_view' | 'lead_submit' | 'visit_submit' | 'whatsapp_click';
  path: string;
  entityId?: string;
  entityTitle?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  createdAt?: unknown;
}
