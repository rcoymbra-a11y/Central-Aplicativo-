import {
  APP_CATEGORIES,
  AppCategory,
  AppItem,
  DEFAULT_APPS,
  DEFAULT_BRAND_SUBTITLE,
} from '../types/app';

const APPS_STORAGE_KEY = 'central_aplicativos_apps_v1';
const SUBTITLE_STORAGE_KEY = 'central_aplicativos_brand_subtitle_v1';

const DEFAULT_IMAGES_BY_ID: Record<string, string | undefined> = Object.fromEntries(
  DEFAULT_APPS.map((app) => [app.id, app.imageUrl])
);

function isValidCategory(value: unknown): value is AppCategory {
  return typeof value === 'string' && APP_CATEGORIES.includes(value as AppCategory);
}

export function normalizeImageUrl(rawValue: string): string {
  const trimmed = rawValue.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('data:image/') || trimmed.startsWith('/')) {
    return trimmed;
  }

  const withProtocol = normalizePaymentUrl(trimmed);

  // Convert Google Drive share links into direct image URLs
  const driveFileMatch = withProtocol.match(
    /^https?:\/\/drive\.google\.com\/file\/d\/([^/]+)/i
  );
  if (driveFileMatch?.[1]) {
    return `https://drive.google.com/thumbnail?id=${driveFileMatch[1]}&sz=w1200`;
  }

  const driveOpenMatch = withProtocol.match(
    /^https?:\/\/drive\.google\.com\/(?:open|uc)\?(?:.*&)?id=([^&]+)/i
  );
  if (driveOpenMatch?.[1]) {
    return `https://drive.google.com/thumbnail?id=${driveOpenMatch[1]}&sz=w1200`;
  }

  // Convert Dropbox share links into raw image URLs
  if (/^https?:\/\/(?:www\.)?dropbox\.com\//i.test(withProtocol)) {
    try {
      const url = new URL(withProtocol);
      url.searchParams.delete('dl');
      url.searchParams.set('raw', '1');
      return url.toString();
    } catch {
      return withProtocol;
    }
  }

  return withProtocol;
}

export function sanitizeAppsList(rawList: unknown): AppItem[] {
  if (!Array.isArray(rawList)) {
    return DEFAULT_APPS;
  }

  return rawList
    .filter(
      (item): item is AppItem =>
        Boolean(item) &&
        typeof item.id === 'string' &&
        typeof item.name === 'string' &&
        typeof item.description === 'string' &&
        typeof item.paymentUrl === 'string'
    )
    .map((item) => {
      const rawImg =
        typeof item.imageUrl === 'string' && item.imageUrl.trim()
          ? normalizeImageUrl(item.imageUrl)
          : DEFAULT_IMAGES_BY_ID[item.id];
      return {
        ...item,
        category: isValidCategory(item.category) ? item.category : 'Corpo & Performance',
        buttonText: item.buttonText?.trim() || 'Comprar / Acessar agora →',
        badge: item.badge?.trim() || undefined,
        imageUrl: rawImg || undefined,
        createdAt: typeof item.createdAt === 'number' ? item.createdAt : Date.now(),
      };
    });
}

export function loadApps(): AppItem[] {
  try {
    const raw = window.localStorage.getItem(APPS_STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(APPS_STORAGE_KEY, JSON.stringify(DEFAULT_APPS));
      return DEFAULT_APPS;
    }

    return sanitizeAppsList(JSON.parse(raw));
  } catch {
    return DEFAULT_APPS;
  }
}

export function saveApps(apps: AppItem[]): void {
  try {
    window.localStorage.setItem(APPS_STORAGE_KEY, JSON.stringify(apps));
  } catch {
    // Ignore storage quota errors gracefully
  }
}

export function resetDefaultApps(): AppItem[] {
  saveApps(DEFAULT_APPS);
  return DEFAULT_APPS;
}

export function loadBrandSubtitle(): string {
  try {
    const raw = window.localStorage.getItem(SUBTITLE_STORAGE_KEY);
    if (raw === null) {
      return DEFAULT_BRAND_SUBTITLE;
    }
    return raw.trim() || DEFAULT_BRAND_SUBTITLE;
  } catch {
    return DEFAULT_BRAND_SUBTITLE;
  }
}

export function saveBrandSubtitle(subtitle: string): string {
  const cleaned = subtitle.trim() || DEFAULT_BRAND_SUBTITLE;
  try {
    window.localStorage.setItem(SUBTITLE_STORAGE_KEY, cleaned);
  } catch {
    // Ignore storage quota errors gracefully
  }
  return cleaned;
}

export function normalizePaymentUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export function isValidPaymentUrl(rawUrl: string): boolean {
  const normalized = normalizePaymentUrl(rawUrl);
  if (!normalized) return false;
  try {
    const parsed = new URL(normalized);
    return (
      (parsed.protocol === 'https:' || parsed.protocol === 'http:') &&
      parsed.hostname.includes('.')
    );
  } catch {
    return false;
  }
}

export function isValidImageSource(rawValue: string): boolean {
  const trimmed = rawValue.trim();
  if (!trimmed) return true;
  if (trimmed.startsWith('data:image/')) return true;
  if (trimmed.startsWith('/')) return true;
  return isValidPaymentUrl(trimmed);
}
