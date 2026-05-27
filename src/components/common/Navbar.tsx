import { useScroll, useMotionValueEvent } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import type { SitePublic, PageBlockPublic, ThemePublic } from '@/lib/api/types';
import SmallNav from './Navbar/SmallNav';
import BigNav from './Navbar/BigNav';

export const DEFAULT_LOGO_SRC = '/batlle/logo.svg';

export function resolveSiteLogoSrc(site: SitePublic) {
  const candidate = site.logo_url || site.shield_url || DEFAULT_LOGO_SRC;
  if (/^https?:\/\/upload\.wikimedia\.org\//i.test(candidate)) {
    return DEFAULT_LOGO_SRC;
  }
  return candidate;
}

function resolveSectionHref(href: string, pathname: string) {
  if (!href.startsWith('#')) return href;
  return pathname === '/' ? href : `/${href}`;
}

type ThemeMode = 'day' | 'night';

type Props = {
  site: SitePublic;
  navBlock: PageBlockPublic | undefined;
  theme?: ThemePublic | null;
  enableNightMode?: boolean;
};

type NavItem = {
  label?: string;
  href: string;
};

const DEFAULT_NAV_SEQUENCE: Array<{ label: string; href: string }> = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Nosotros', href: '#nosotros' },
  { label: 'Trámites', href: '#tramites' },
  { label: 'Actualidad', href: '#actualidad' },
  { label: 'Concejo', href: '#concejo' },
  { label: 'Contacto', href: '#contacto' },
];

const SECTION_ALIASES: Record<string, string[]> = {
  '#inicio': ['#inicio'],
  '#nosotros': ['#nosotros'],
  '#tramites': ['#tramites'],
  '#actualidad': ['#actualidad', '#agenda'],
  '#concejo': ['#concejo'],
  '#contacto': ['#territorio', '#contacto'],
};

function normalizeFragment(href: string): string {
  if (!href.startsWith('#')) return href;
  return '#' + href.slice(1).normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

function normalizeNavItems(navBlock: PageBlockPublic | undefined): NavItem[] {
  const raw = (((navBlock?.content?.items as any[] | undefined) ?? [])
    .filter((item): item is { label?: string; href?: string } => Boolean(item?.href)));

  const uniqueItems = new Map<string, NavItem>();
  for (const item of raw) {
    if (!item.href) continue;
    const href = normalizeFragment(item.href);
    if (uniqueItems.has(href)) continue;
    uniqueItems.set(href, {
      href,
      label: item.label || DEFAULT_NAV_SEQUENCE.find((candidate) => candidate.href === href)?.label,
    });
  }

  for (const fallbackItem of DEFAULT_NAV_SEQUENCE) {
    if (!uniqueItems.has(fallbackItem.href)) {
      uniqueItems.set(fallbackItem.href, fallbackItem);
    }
  }

  return DEFAULT_NAV_SEQUENCE
    .map((item) => uniqueItems.get(item.href))
    .filter((item): item is NavItem => Boolean(item));
}

function buildTrackedSections(navItems: NavItem[]) {
  const tracked = new Map<string, string>();

  for (const item of navItems) {
    const selectors = SECTION_ALIASES[item.href] || [item.href];
    for (const selector of selectors) {
      if (!tracked.has(selector)) {
        tracked.set(selector, item.href);
      }
    }
  }

  return Array.from(tracked.entries()).map(([selector, href]) => ({ selector, href }));
}

export default function MunicipalNavbar({ site, navBlock, theme, enableNightMode = true }: Props) {
  const [isDesktop, setIsDesktop] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeHref, setActiveHref] = useState('#inicio');
  const [themeMode, setThemeMode] = useState<ThemeMode>('day');
  const [pathname, setPathname] = useState('/');
  const normalizedNavItems = useMemo(() => normalizeNavItems(navBlock), [navBlock]);
  const trackedSections = useMemo(() => buildTrackedSections(normalizedNavItems), [normalizedNavItems]);

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 20));

  useEffect(() => {
    setIsMounted(true);
    setPathname(window.location.pathname || '/');
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    setIsDesktop(mediaQuery.matches);

    const handleResize = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mediaQuery.addEventListener('change', handleResize);

    const syncActiveHref = () => {
      const viewportAnchor = window.innerHeight * 0.35;
      let current = trackedSections[0]?.href ?? '#inicio';
      let bestDistance = Number.POSITIVE_INFINITY;

      for (const { selector, href } of trackedSections) {
        const section = document.querySelector(selector);
        if (!section) continue;
        const rect = section.getBoundingClientRect();

        const containsAnchor = rect.top <= viewportAnchor && rect.bottom >= viewportAnchor;
        if (containsAnchor) {
          current = href;
          bestDistance = 0;
          break;
        }

        const distance = Math.abs(rect.top - viewportAnchor);
        if (distance < bestDistance) {
          bestDistance = distance;
          current = href;
        }
      }

      setActiveHref(current);
    };

    syncActiveHref();
    window.addEventListener('scroll', syncActiveHref, { passive: true });
    window.addEventListener('hashchange', syncActiveHref);

    return () => {
      mediaQuery.removeEventListener('change', handleResize);
      window.removeEventListener('scroll', syncActiveHref);
      window.removeEventListener('hashchange', syncActiveHref);
    };
  }, [trackedSections]);

  useEffect(() => {
    if (!enableNightMode) {
      document.documentElement.dataset.themeMode = 'day';
      return;
    }

    const storedMode = window.localStorage.getItem('municipios-theme-mode');
    const nextMode = storedMode === 'night' || storedMode === 'day'
      ? storedMode
      : window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'night'
        : 'day';

    setThemeMode(nextMode);
  }, [enableNightMode]);

  useEffect(() => {
    const appliedMode = enableNightMode ? themeMode : 'day';
    document.documentElement.dataset.themeMode = appliedMode;

    if (!enableNightMode) return;

    window.localStorage.setItem('municipios-theme-mode', appliedMode);
  }, [enableNightMode, themeMode]);

  const logoSrc = resolveSiteLogoSrc(site);
  const navItems = normalizedNavItems.map((item) => ({
    ...item,
    href: resolveSectionHref(item.href || '#inicio', pathname),
  }));
  const ctaLabel = (navBlock?.content?.cta_label as string | undefined) ?? 'Contactar';
  const ctaHref = resolveSectionHref((navBlock?.content?.cta_href as string | undefined) ?? '#contacto', pathname);
  const homeHref = resolveSectionHref('#inicio', pathname);
  const currentSection = pathname === '/' ? activeHref : '';

  if (!isMounted) return null;

  const commonProps = {
    site,
    navItems,
    ctaLabel,
    ctaHref,
    logoSrc,
    activeHref: currentSection,
    homeHref,
    scrolled,
    headerVariant: theme?.header_variant ?? 'classic',
    enableNightMode,
    themeMode,
    onToggleTheme: () => setThemeMode((current) => (current === 'day' ? 'night' : 'day'))
  };

  return isDesktop ? <BigNav {...commonProps} /> : <SmallNav {...commonProps} />;
}
