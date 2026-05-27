import { Landmark, ChevronUp } from 'lucide-react';
import type { SitePublic, PageBlockPublic, ThemePublic } from '@/lib/api/types';
import { resolveSiteLogoSrc } from './Navbar';

type Props = {
  site: SitePublic;
  navBlock: PageBlockPublic | undefined;
  theme?: ThemePublic | null;
};

export default function MunicipalFooter({ site, navBlock, theme }: Props) {
  const logoSrc = resolveSiteLogoSrc(site);
  const footerVariant = theme?.footer_variant ?? 'standard';
  const isMinimal = footerVariant === 'minimal';
  const isDark = footerVariant === 'dark';
  const footerClass = isMinimal
    ? 'border-t border-slate-200 bg-white/88 px-6 py-10 lg:px-10'
    : isDark
      ? 'border-t border-white/10 bg-black px-6 py-16 lg:px-10'
      : 'site-bg-gradient-footer border-t border-slate-200/70 px-6 py-16 lg:px-10';
  const footerStyle = isMinimal
    ? { fontFamily: 'var(--site-font-display)' }
    : isDark
      ? { fontFamily: 'var(--site-font-display)' }
      : { fontFamily: 'var(--site-font-display)', backgroundImage: 'var(--site-background-gradient)' };
  const textMain = isDark ? 'text-white' : 'text-slate-900';
  const textMuted = isDark ? 'text-gray-400' : 'text-slate-500';
  const chipBg = isDark ? 'bg-white' : 'bg-slate-100';

  return (
    <footer 
      className={footerClass}
      style={footerStyle}
    >
      <div className={`mx-auto flex max-w-7xl flex-col items-center justify-between gap-10 ${isMinimal ? 'md:flex-row' : 'md:flex-row'}`}>
        <div className={`flex flex-col items-center gap-4 ${isMinimal ? 'md:items-start' : 'md:items-start'}`}>
          <div className="flex items-center gap-4">
            {logoSrc ? (
              <div className={`flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl p-1.5 shadow-sm ${chipBg}`}>
                <img
                  src={logoSrc}
                  alt={site.name}
                  className="h-full w-full object-contain"
                  onError={(event) => {
                    const target = event.currentTarget;
                    if (target.dataset.fallbackApplied === 'true') return;
                    target.dataset.fallbackApplied = 'true';
                    target.removeAttribute('src');
                    target.style.display = 'none';
                  }}
                />
              </div>
            ) : (
              <Landmark className={`h-8 w-8 ${textMain}`} />
            )}
            <div className="flex flex-col">
              <span className={`${textMain} text-[1.1rem] leading-none uppercase font-bold tracking-[0.14em]`}>
                {site.name}
              </span>
              <span className={`${textMuted} text-[0.65rem] uppercase font-bold tracking-[0.25em] mt-1.5`}>
                {isMinimal ? 'Municipio' : 'Sitio Oficial'}
              </span>
            </div>
          </div>
          
          <div className="mt-2 text-center md:text-left space-y-1">
             {site.address && <p className={`text-[0.75rem] uppercase tracking-[0.1em] ${textMuted}`}>{site.address}</p>}
             {site.email && <p className={`text-[0.75rem] uppercase tracking-[0.1em] ${textMuted}`}>{site.email}</p>}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-2">
          <p className={`text-center text-[0.7rem] uppercase tracking-[0.2em] ${textMuted}`}>
            © {new Date().getFullYear()} {site.name.toUpperCase()}
          </p>
          <a
            href="/transparencia"
            className={`text-[0.7rem] uppercase tracking-[0.18em] font-medium transition-opacity hover:opacity-70 ${textMuted}`}
          >
            Transparencia
          </a>
        </div>

        <div className="flex items-center gap-6">
          <a 
            href="#inicio"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`group flex items-center gap-3 text-[0.75rem] uppercase font-bold tracking-[0.14em] transition-all ${isDark ? 'text-white/80 hover:text-white' : 'text-slate-700 hover:text-slate-950'}`}
          >
            <span>Volver arriba</span>
            <div className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 group-hover:scale-110 ${isDark ? 'border border-white/40 bg-white/10 text-white group-hover:border-white group-hover:bg-white/20' : 'border border-slate-300 bg-white text-slate-800 group-hover:border-slate-500 group-hover:bg-slate-100'}`}>
              <ChevronUp className="h-4 w-4" />
            </div>
          </a>
        </div>
      </div>
    </footer>
  );
}