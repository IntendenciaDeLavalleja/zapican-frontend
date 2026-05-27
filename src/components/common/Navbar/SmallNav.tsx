import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Landmark, Menu, Moon, Sun, X } from 'lucide-react';
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

export default function SmallNav({ site, navItems, ctaLabel, ctaHref, logoSrc, activeHref, homeHref, scrolled, headerVariant, enableNightMode, themeMode, onToggleTheme }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isNight = themeMode === 'night';
  const lightHeader = headerVariant !== 'classic';

  const effectiveButtonClass = isNight
    ? 'flex h-10 w-10 items-center justify-center rounded-full text-white border border-white/20 hover:bg-white/10'
    : lightHeader
      ? 'flex h-10 w-10 items-center justify-center rounded-full text-slate-800 border border-slate-300 hover:bg-slate-100'
      : 'flex h-10 w-10 items-center justify-center rounded-full text-white border border-white/20 hover:bg-white/10';

  const overlayClass = isNight
    ? 'fixed inset-0 top-20 z-40 flex flex-col pt-4 overflow-y-auto bg-slate-950 text-slate-100'
    : 'fixed inset-0 top-20 z-40 flex flex-col pt-4 overflow-y-auto bg-white text-slate-900';
  const headerBackground = isNight
    ? scrolled ? 'rgba(7, 17, 27, 0.96)' : 'rgba(7, 17, 27, 0.85)'
    : lightHeader
      ? scrolled ? 'rgba(255, 255, 255, 0.98)' : 'rgba(255, 255, 255, 0.9)'
      : scrolled ? 'rgba(0, 0, 0, 0.98)' : 'rgba(0, 0, 0, 0.85)';
  const headerBorderBottom = isNight
    ? scrolled ? '1px solid rgba(148, 163, 184, 0.1)' : '1px solid rgba(255, 255, 255, 0)'
    : lightHeader
      ? '1px solid rgba(148, 163, 184, 0.18)'
      : scrolled ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(255, 255, 255, 0)';
  const menuButtonClass = isNight
    ? 'flex items-center justify-center p-2 rounded-sm text-white border border-white/20 hover:bg-white/10 transition-colors'
    : lightHeader
      ? 'flex items-center justify-center p-2 rounded-sm text-slate-800 border border-slate-300 hover:bg-slate-100 transition-colors'
      : 'flex items-center justify-center p-2 rounded-sm text-white border border-white/20 hover:bg-white/10 transition-colors';

  return (
    <>
      <motion.header
        initial={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}
        animate={{ 
          backgroundColor: headerBackground,
          borderBottom: headerBorderBottom
        }}
        transition={{ duration: 0.3 }}
        className={`fixed top-0 inset-x-0 z-50 transition-colors backdrop-blur-md ${lightHeader ? 'mx-auto mt-3 w-[calc(100%-1rem)] rounded-full border shadow-[0_18px_36px_rgba(15,23,42,0.1)]' : ''}`}
        style={{ fontFamily: 'var(--site-font-display)' }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 h-20 gap-3 w-full">
          {/* BRAND */}
          <a href={homeHref} className="group flex items-center gap-3 shrink-0 transition-opacity hover:opacity-80 min-w-0">
            {logoSrc ? (
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl p-1.5 shadow-sm ${isNight ? 'bg-slate-900' : lightHeader ? 'bg-slate-100' : 'bg-white'}`}>
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
              <Landmark className={`h-7 w-7 shrink-0 ${isNight ? 'text-white' : lightHeader ? 'text-slate-900' : 'text-white'}`} />
            )}
            <div className="flex flex-col pt-1 min-w-0 pr-2">
              <span className={`${isNight ? 'text-white' : lightHeader ? 'text-slate-900' : 'text-white'} text-[1rem] leading-none uppercase font-bold tracking-[0.12em] truncate`}>
                {site.name}
              </span>
              <span className={`${isNight ? 'text-slate-400' : lightHeader ? 'text-slate-500' : 'text-gray-400'} text-[0.6rem] uppercase font-bold tracking-[0.25em] mt-1 truncate`}>
                Sitio Oficial
              </span>
            </div>
          </a>

          {/* MOBILE TOGGLE */}
          <div className="flex items-center gap-2">
            {enableNightMode && (
              <button
                type="button"
                onClick={onToggleTheme}
                aria-label={themeMode === 'night' ? 'Cambiar a modo diurno' : 'Cambiar a modo nocturno'}
                className={effectiveButtonClass}
              >
                {themeMode === 'night' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            )}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className={menuButtonClass}
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileOpen ? (
                  <motion.span key="x" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <X className="h-6 w-6" />
                  </motion.span>
                ) : (
                  <motion.span key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Menu className="h-6 w-6" />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.header>

      {/* MOBILE NAV OVERLAY */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className={overlayClass}
            style={{ fontFamily: 'var(--site-font-display)' }}
          >
            <nav className="flex flex-col items-center justify-center flex-1 space-y-8 px-6 pb-20">
              {navItems.map((item: any, i: number) => {
                const isActive = activeHref === item.href;
                return (
                  <motion.a
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 + 0.1 }}
                    className={`text-xl uppercase font-bold tracking-[0.15em] transition-colors ${
                      isActive
                        ? (isNight ? 'text-white' : 'text-slate-950')
                        : (isNight ? 'text-gray-100 hover:text-white' : 'text-slate-600 hover:text-slate-950')
                    }`}
                  >
                    {item.label}
                  </motion.a>
                );
              })}
              
              <motion.a
                href={ctaHref}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: navItems.length * 0.05 + 0.1 }}
                onClick={() => setMobileOpen(false)}
                className="mt-6 border px-8 py-3 text-[0.85rem] uppercase font-bold tracking-[0.2em] transition-colors"
                style={isNight
                  ? { color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.4)', backgroundColor: 'transparent' }
                  : { color: '#0f172a', borderColor: 'rgba(148, 163, 184, 0.5)', backgroundColor: 'transparent' }}
              >
                {ctaLabel}
              </motion.a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}