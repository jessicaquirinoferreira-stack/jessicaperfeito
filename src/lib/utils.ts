import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 120);
}

export function extractUtmParams(search: string) {
  const params = new URLSearchParams(search);
  return {
    utmSource: params.get('utm_source') || '',
    utmMedium: params.get('utm_medium') || '',
    utmCampaign: params.get('utm_campaign') || '',
    utmContent: params.get('utm_content') || '',
  };
}

export function sanitizeId(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);
}

const LEGACY_ASSET_MAP: Array<[string, string]> = [
  ['1794598767836', '/images/hero-porto-maravilha.jpg'],
  ['hero_porto_maravilha', '/images/hero-porto-maravilha.jpg'],
  ['1794598767882', '/images/jessica-perfeito.jpg'],
  ['jessica_perfeito_portrait', '/images/jessica-perfeito.jpg'],
  ['1794598768487', '/images/ap-porto-maravilha.jpg'],
  ['ap_porto_maravilha_interior', '/images/ap-porto-maravilha.jpg'],
  ['1794598768631', '/images/studio-porto-maravilha.jpg'],
  ['studio_porto_maravilha', '/images/studio-porto-maravilha.jpg'],
  ['1794598769370', '/images/residencial-heitor-prazeres.jpg'],
  ['residencial_heitor_prazeres', '/images/residencial-heitor-prazeres.jpg'],
  ['1794598771535', '/images/entrega-chaves.jpg'],
  ['entrega_chaves_conquista', '/images/entrega-chaves.jpg'],
  ['1794922482021', '/images/assistente-clara.jpg'],
  ['assistente_virtual_portrait', '/images/assistente-clara.jpg'],
];

export function resolveAssetUrl(url?: string): string {
  if (!url) return '';
  if (url.startsWith('/images/') || url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  for (const [needle, canonical] of LEGACY_ASSET_MAP) {
    if (url.includes(needle)) return canonical;
  }
  return url;
}

