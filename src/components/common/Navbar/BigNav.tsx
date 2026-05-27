import { motion } from 'framer-motion';
import { Landmark, ChevronRight, Moon, Sun } from 'lucide-react';
import type { SitePublic } from '@/lib/api/types';

type ThemeMode = 'day' | 'night';

type Props = {
  site: SitePublic;
  navItems: any[];
  ctaLabel: string;
  ctaHref: string;
  logoSrc: string | null;
  activeHref: string;
  homeHref: string;
  scrolled: boolean;
  headerVariant: string;
  enableNightMode: boolean;
  themeMode: ThemeMode;
  onToggleTheme: () => void;
};

export default function BigNav({ site, navItems, ctaLabel, ctaHref, logoSrc, activeHref, homeHref, scrolled, headerVariant, enableNightMode, themeMode, onToggleTheme }: Props) {
  const isNight = themeMode === 'night';
  const isClassic = headerVariant === 'classic';
  const isCompact = headerVariant === 'compact';
  const isCentered = headerVariant === 'centered';
  const lightHeader = !isClassic;
  const textClass = lightHeader ? 'text-slate-800' : 'text-white';
  const mutedTextClass = lightHeader ? 'text-slate-500' : 'text-gray-400';
  const navTextClass = lightHeader ? 'text-slate-600 hover:text-slate-950' : 'text-gray-300 hover:text-white';
  const activeTextClass = lightHeader ? 'text-slate-950' : 'text-white';
  const effectiveTextClass = isNight ? 'text-white' : textClass;
  const effectiveMutedTextClass = isNight ? 'text-slate-400' : mutedTextClass;
  const effectiveNavTextClass = isNight ? 'text-slate-300 hover:text-white' : navTextClass;
  const effectiveActiveTextClass = isNight ? 'text-white' : activeTextClass;
  const headerClass = isClassic
    ? 'fixed top-0 inset-x-0 z-50 transition-colors backdrop-blur-md overflow-hidden'
    : `fixed inset-x-0 top-3 z-50 mx-auto w-[min(1100px,calc(100%-1.5rem))] rounded-full border shadow-[0_20px_40px_rgba(15,23,42,0.12)] transition-colors backdrop-blur-xl ${isCentered ? 'max-w-5xl' : 'max-w-6xl'}`;
  const innerClass = isCompact ? 'h-16 px-4 xl:px-8' : isCentered ? 'h-[4.5rem] px-5 xl:px-8' : 'h-20 px-4 xl:px-10';
  const headerBackground = isNight
    ? scrolled ? 'rgba(7, 17, 27, 0.96)' : 'rgba(7, 17, 27, 0.72)'
    : isClassic ? scrolled ? 'rgba(0, 0, 0, 0.95)' : 'rgba(0, 0, 0, 0.4)' : scrolled ? 'rgba(255, 255, 255, 0.96)' : 'rgba(255, 255, 255, 0.82)';
  const headerBorderBottom = isNight
    ? scrolled ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(255, 255, 255, 0)'
    : isClassic
      ? scrolled ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0)'
      : '1px solid rgba(148, 163, 184, 0.18)';
  const ctaClass = isNight
    ? 'flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-white hover:bg-white/16 transition-colors duration-300 group'
    : lightHeader
      ? 'flex items-center gap-2 rounded-full border border-slate-300 bg-white/85 px-5 py-2.5 hover:bg-slate-950 hover:text-white transition-colors duration-300 group'
      : 'flex items-center gap-2 border-[1.5px] border-white/30 px-6 py-2.5 hover:bg-white hover:text-black transition-colors duration-300 group';
  return (
    <motion.header
      initial={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}
      animate={{ 
        backgroundColor: headerBackground,
        borderBottom: headerBorderBottom
      }}
      transition={{ duration: 0.3 }}
      className={headerClass}
      style={{ fontFamily: 'var(--site-font-display)' }}
    >
      <div className={`mx-auto flex max-w-7xl items-center justify-between gap-3 w-full ${innerClass}`}>
        {/* BRAND */}
        <a href={homeHref} className="group flex items-center gap-3 shrink-0 transition-opacity hover:opacity-80 min-w-0">
          {logoSrc ? (
            <div className={`flex shrink-0 items-center justify-center overflow-hidden ${isNight ? 'bg-slate-900' : lightHeader ? 'bg-slate-100' : 'bg-white'} p-1.5 shadow-sm ${isCompact ? 'h-9 w-9 rounded-lg' : 'h-10 w-10 rounded-xl'}`}>
              <img
                src={logoSrc}
                alt="Logo"
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
            <Landmark className={`h-7 w-7 shrink-0 ${effectiveTextClass}`} />
          )}
          <div className="flex flex-col pt-1 min-w-0 pr-2">
            <span className={`${effectiveTextClass} ${isCompact ? 'text-[1rem]' : 'text-[1.15rem]'} leading-none uppercase font-bold tracking-[0.12em] truncate`}>
              {site.name}
            </span>
            <span className={`${effectiveMutedTextClass} text-[0.65rem] uppercase font-bold tracking-[0.25em] mt-1 truncate`}>
              Sitio Oficial
            </span>
          </div>
        </a>

        {/* DESKTOP NAV */}
        <nav className={`flex items-center ${isCentered ? 'gap-8 justify-center flex-1' : 'gap-7'}`}>
          {navItems.map((item: any) => {
            const isActive = activeHref === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                className="group relative flex items-center h-20"
              >
                <span className={`text-[0.8rem] uppercase font-bold tracking-[0.14em] transition-colors ${
                  isActive ? effectiveActiveTextClass : effectiveNavTextClass
                }`}>
                  {item.label}
                </span>
                
                {/* Hover / Active underline indicator */}
                <motion.div 
                  initial={false}
                  animate={{ 
                    opacity: isActive ? 1 : 0, 
                    scaleX: isActive ? 1 : 0.4,
                    originX: 0.5 
                  }}
                  className={`absolute bottom-0 left-0 right-0 h-0.5 ${lightHeader ? 'bg-slate-900' : 'bg-white'} group-hover:opacity-100 group-hover:scale-x-100 transition-all duration-300 ease-out`}
                />
              </a>
            );
          })}
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-4">
          {enableNightMode && (
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={themeMode === 'night' ? 'Cambiar a modo diurno' : 'Cambiar a modo nocturno'}
              className={`inline-flex h-11 w-11 items-center justify-center rounded-full transition ${isNight ? 'border border-white/20 bg-white/10 text-white hover:bg-white/16' : lightHeader ? 'border border-slate-300 bg-white/80 text-slate-700 hover:bg-slate-100' : 'border border-white/20 bg-white/8 text-white hover:bg-white/16'}`}
            >
              {themeMode === 'night' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          )}
          <a
            href={ctaHref}
            className={ctaClass}
          >
            <span className={`text-[0.8rem] uppercase font-bold tracking-[0.14em] ${isNight ? 'text-white group-hover:text-white' : lightHeader ? 'text-slate-900 group-hover:text-white' : 'text-white group-hover:text-black'}`}>
              {ctaLabel}
            </span>
            <ChevronRight className={`h-4 w-4 transition-colors ${isNight ? 'text-white group-hover:text-white' : lightHeader ? 'text-slate-900 group-hover:text-white' : 'text-white group-hover:text-black'}`} />
          </a>
        </div>
      </div>
    </motion.header>
  );
}