import type { ThemePublic } from '@/lib/api/types';
import { DEFAULT_THEME } from '@/lib/defaults';

const FONT_FAMILIES = {
  inter: {
    body: "'Plus Jakarta Sans', system-ui, sans-serif",
    display: "'Barlow', 'Plus Jakarta Sans', system-ui, sans-serif",
  },
  lora: {
    body: "'Lora', Georgia, serif",
    display: "'Lora', Georgia, serif",
  },
  merriweather: {
    body: "'Merriweather', Georgia, serif",
    display: "'Merriweather', Georgia, serif",
  },
  system: {
    body: 'system-ui, -apple-system, sans-serif',
    display: 'system-ui, -apple-system, sans-serif',
  },
} as const;

export function resolveTheme(theme?: ThemePublic | null): ThemePublic {
  return {
    ...DEFAULT_THEME,
    ...theme,
    colors: {
      ...DEFAULT_THEME.colors,
      ...(theme?.colors ?? {}),
    },
    background_gradient: {
      ...DEFAULT_THEME.background_gradient,
      ...(theme?.background_gradient ?? {}),
    },
    custom_css: theme?.custom_css ?? DEFAULT_THEME.custom_css ?? '',
  };
}

export function getThemeFontPreset(theme?: ThemePublic | null) {
  const resolvedTheme = resolveTheme(theme);
  return FONT_FAMILIES[(resolvedTheme.font_style as keyof typeof FONT_FAMILIES) || 'inter'] || FONT_FAMILIES.inter;
}

export function getThemeCssVariables(theme?: ThemePublic | null): Record<string, string> {
  const resolvedTheme = resolveTheme(theme);
  const fontPreset = getThemeFontPreset(resolvedTheme);

  return {
    '--site-primary': resolvedTheme.colors.primary,
    '--site-secondary': resolvedTheme.colors.secondary,
    '--site-accent': resolvedTheme.colors.accent,
    '--site-background': resolvedTheme.colors.background,
    '--site-text': resolvedTheme.colors.text,
    '--municipality-primary': resolvedTheme.colors.primary,
    '--municipality-secondary': resolvedTheme.colors.secondary,
    '--municipality-accent': resolvedTheme.colors.accent,
    '--municipality-background': resolvedTheme.colors.background,
    '--municipality-text': resolvedTheme.colors.text,
    '--site-background-gradient-from': resolvedTheme.background_gradient.from,
    '--site-background-gradient-to': resolvedTheme.background_gradient.to,
    '--site-background-gradient-angle': `${resolvedTheme.background_gradient.angle}deg`,
    '--site-background-gradient': `linear-gradient(${resolvedTheme.background_gradient.angle}deg, ${resolvedTheme.background_gradient.from}, ${resolvedTheme.background_gradient.to})`,
    '--site-font-body': fontPreset.body,
    '--site-font-display': fontPreset.display,
  };
}

export function serializeThemeStyleBlock(theme?: ThemePublic | null): string {
  const resolvedTheme = resolveTheme(theme);
  const cssVariables = Object.entries(getThemeCssVariables(resolvedTheme))
    .map(([property, value]) => `    ${property}: ${value};`)
    .join('\n');

  return `:root {\n${cssVariables}\n  }\n${resolvedTheme.custom_css ?? ''}`;
}

export function syncThemeDocument(theme?: ThemePublic | null): void {
  if (typeof document === 'undefined') {
    return;
  }

  const resolvedTheme = resolveTheme(theme);
  const root = document.documentElement;

  Object.entries(getThemeCssVariables(resolvedTheme)).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });

  const styleId = 'municipios-runtime-theme-custom-css';
  let styleElement = document.getElementById(styleId) as HTMLStyleElement | null;

  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = styleId;
    document.head.appendChild(styleElement);
  }

  styleElement.textContent = resolvedTheme.custom_css ?? '';
}