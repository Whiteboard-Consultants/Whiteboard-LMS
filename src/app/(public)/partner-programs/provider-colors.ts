const PROVIDER_COLOR_KEYS = [
  'blue',
  'orange',
  'teal',
  'purple',
  'cyan',
  'emerald',
  'green',
  'rose',
  'indigo',
  'amber',
  'violet',
  'fuchsia',
  'pink',
  'sky',
] as const;

export type ProviderColorKey = (typeof PROVIDER_COLOR_KEYS)[number];

export const iconBgClasses: Record<ProviderColorKey, string> = {
  blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300',
  orange:
    'bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-300',
  teal: 'bg-teal-100 text-teal-600 dark:bg-teal-900/50 dark:text-teal-300',
  purple:
    'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-300',
  cyan: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/50 dark:text-cyan-300',
  emerald:
    'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-300',
  green:
    'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-300',
  rose: 'bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-300',
  indigo:
    'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-300',
  amber:
    'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-300',
  violet:
    'bg-violet-100 text-violet-600 dark:bg-violet-900/50 dark:text-violet-300',
  fuchsia:
    'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/50 dark:text-fuchsia-300',
  pink: 'bg-pink-100 text-pink-600 dark:bg-pink-900/50 dark:text-pink-300',
  sky: 'bg-sky-100 text-sky-600 dark:bg-sky-900/50 dark:text-sky-300',
};

export const providerClasses: Record<ProviderColorKey, string> = {
  blue: 'from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 text-blue-700 dark:text-blue-200 border-blue-200 dark:border-blue-800',
  orange:
    'from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 text-orange-700 dark:text-orange-200 border-orange-200 dark:border-orange-800',
  teal: 'from-teal-50 to-teal-100 dark:from-teal-950 dark:to-teal-900 text-teal-700 dark:text-teal-200 border-teal-200 dark:border-teal-800',
  purple:
    'from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 text-purple-700 dark:text-purple-200 border-purple-200 dark:border-purple-800',
  cyan: 'from-cyan-50 to-cyan-100 dark:from-cyan-950 dark:to-cyan-900 text-cyan-700 dark:text-cyan-200 border-cyan-200 dark:border-cyan-800',
  emerald:
    'from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 text-emerald-700 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800',
  green:
    'from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 text-green-700 dark:text-green-200 border-green-200 dark:border-green-800',
  rose: 'from-rose-50 to-rose-100 dark:from-rose-950 dark:to-rose-900 text-rose-700 dark:text-rose-200 border-rose-200 dark:border-rose-800',
  indigo:
    'from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 text-indigo-700 dark:text-indigo-200 border-indigo-200 dark:border-indigo-800',
  amber:
    'from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 text-amber-700 dark:text-amber-200 border-amber-200 dark:border-amber-800',
  violet:
    'from-violet-50 to-violet-100 dark:from-violet-950 dark:to-violet-900 text-violet-700 dark:text-violet-200 border-violet-200 dark:border-violet-800',
  fuchsia:
    'from-fuchsia-50 to-fuchsia-100 dark:from-fuchsia-950 dark:to-fuchsia-900 text-fuchsia-700 dark:text-fuchsia-200 border-fuchsia-200 dark:border-fuchsia-800',
  pink: 'from-pink-50 to-pink-100 dark:from-pink-950 dark:to-pink-900 text-pink-700 dark:text-pink-200 border-pink-200 dark:border-pink-800',
  sky: 'from-sky-50 to-sky-100 dark:from-sky-950 dark:to-sky-900 text-sky-700 dark:text-sky-200 border-sky-200 dark:border-sky-800',
};

/**
 * Explicit brand-aligned colors for known providers.
 * Falls back to a stable hash for any provider not listed here.
 */
const PROVIDER_BRAND_COLORS: Record<string, ProviderColorKey> = {
  // Manipal Group — signature orange
  'Manipal University Jaipur': 'orange',
  'Manipal Academy of Higher Education': 'orange',

  // IIMs — maroon / burgundy tones
  'IIM Calcutta': 'rose',
  'IIM Kozhikode': 'rose',
  'IIM Indore': 'rose',
  'IIM Amritsar': 'rose',
  'IIM Raipur': 'rose',
  'IIM Visakhapatnam': 'rose',

  // IITs & IIIT — deep blue / indigo
  'IIT Roorkee': 'indigo',
  'IIT Jodhpur': 'indigo',
  'IIT Patna': 'indigo',
  'IIIT Bangalore': 'indigo',
  'BITS Pilani': 'sky',

  // Major private universities
  'Chandigarh University': 'rose',
  'Amity University': 'rose',
  'Lovely Professional University': 'amber',
  'VIT': 'indigo',
  'Jain University': 'emerald',
  'Amrita University': 'fuchsia',
  'Sharda University': 'blue',
  'KL University': 'teal',
  'Alliance University': 'violet',
  'Alliance University (Bennett University Online)': 'violet',

  'Manav Rachna University': 'green',
  'Parul University': 'green',
  'Andhra University': 'blue',
  'SRM Univeristy': 'rose',
  'SRM University': 'rose',
  'Symbiosis School for Online and Digital Learning (SSODL)': 'indigo',

  'Sastra University': 'orange',
  'DY Patil University, Pune': 'cyan',
  'DY Patil University Navi Mumbai': 'cyan',
  'O.P. Jindal Global University': 'amber',
  'O.P. Jindal Global University (JGU)': 'amber',
  'IMT Ghaziabad': 'purple',
  'K. J. Somaiya Institute of Management': 'rose',
  NMIMS: 'purple',
  'Vignan University': 'sky',


  // Tech & corporate partners
  'Microsoft': 'blue',
  'Google': 'blue',
  'IBM': 'blue',
  'Tableau Learning Partner': 'orange',
  'PWC': 'amber',
  'Fractal Analytics': 'violet',
  'InfoSec': 'cyan',
  'EC-Council': 'emerald',
  'Unilever': 'cyan',

  // International universities
  'University of Pennsylvania': 'blue',
  'University of California, Irvine': 'sky',
  'University of Colorado Boulder': 'amber',
  'University of Colorado System': 'amber',
  'Johns Hopkins University': 'blue',
  'Illinois Tech': 'rose',
  'New York Institute of Finance': 'indigo',
};

/** Stable color per provider — brand override first, then hash fallback. */
export function getProviderColor(provider: string): ProviderColorKey {
  const brandColor = PROVIDER_BRAND_COLORS[provider];
  if (brandColor) return brandColor;

  let hash = 0;
  for (let i = 0; i < provider.length; i++) {
    hash = provider.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PROVIDER_COLOR_KEYS[Math.abs(hash) % PROVIDER_COLOR_KEYS.length];
}

export function sortProgramsByProvider<
  T extends { provider: string; title: string },
>(programs: T[]): T[] {
  return [...programs].sort((a, b) => {
    const byProvider = a.provider.localeCompare(b.provider);
    if (byProvider !== 0) return byProvider;
    return a.title.localeCompare(b.title);
  });
}
