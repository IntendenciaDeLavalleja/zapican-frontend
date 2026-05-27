import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import { CalendarDays, ChevronLeft, ChevronRight, Clock, FileText, MapPin, Users2, Building2, Phone, Mail, Megaphone, Truck, Heart, Star, Home, Flag, Info, Briefcase, Landmark, ShieldCheck, X } from 'lucide-react';
import type { ComponentType } from 'react';
import { useMemo, useRef, useState } from 'react';
import { formatNewsDate, getNewsHref } from '@/lib/news';
import type { EventSummary, NewsSummary, PageBlockPublic, SitePublic, ThemePublic } from '@/lib/api/types';

type Props = {
  site: SitePublic;
  theme?: ThemePublic | null;
  news: NewsSummary[];
  events: EventSummary[];
  heroBlock?: PageBlockPublic;
  quickLinksBlock?: PageBlockPublic;
  eventsBlock?: PageBlockPublic;
};

const QUICK_LINK_ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
  'file-text': FileText,
  'users-2': Users2,
  'calendar-days': CalendarDays,
  'map-pin': MapPin,
  'building-2': Building2,
  'phone': Phone,
  'mail': Mail,
  'megaphone': Megaphone,
  'truck': Truck,
  'heart-pulse': Heart,
  'star': Star,
  'home': Home,
  'clipboard-list': FileText,
  'flag': Flag,
  'briefcase': Briefcase,
  'trees': Landmark,
  'landmark': Landmark,
  'shield-check': ShieldCheck,
  'info': Info,
};
const DEFAULT_QUICK_LINK_ICONS = [FileText, Users2, CalendarDays, MapPin];

const sectionMotion = {
  initial: { opacity: 0, y: 52, rotateX: 8, transformPerspective: 1100 },
  whileInView: { opacity: 1, y: 0, rotateX: 0, transformPerspective: 1100 },
  viewport: { once: true, amount: 0.13 },
  transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] as const },
};

function formatDate(date: string | null | undefined) {
  if (!date) return '';
  return new Intl.DateTimeFormat('es-UY', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(date));
}

function formatTime(date: string | null | undefined) {
  if (!date) return '';
  return new Intl.DateTimeFormat('es-UY', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(date));
}

export default function HeroBlock({ site, theme, news, events, heroBlock, quickLinksBlock, eventsBlock }: Props) {
  const [activeNews, setActiveNews] = useState(0);
  const [activeEvent, setActiveEvent] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroScrollProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroImgY = useTransform(heroScrollProgress, [0, 1], ['0%', '26%']);
  const heroBgY = useTransform(heroScrollProgress, [0, 1], ['0%', '14%']);

  const highlightedNews = useMemo(() => (news.length > 0 ? news.slice(0, 5) : []), [news]);
  const currentNews = highlightedNews[activeNews] ?? null;
  const upcomingEvents = useMemo(() => (events.length > 0 ? events.slice(0, 6) : []), [events]);
  const currentEvent = upcomingEvents[activeEvent] ?? null;

  const heroStyle = theme?.hero_style ?? 'image-full';
  const isHeroSplit = heroStyle === 'split';
  const isHeroMinimal = heroStyle === 'minimal';
  const heroShellClass = isHeroSplit
    ? 'relative overflow-hidden rounded-[2.5rem] border border-black/8 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.14)]'
    : isHeroMinimal
      ? 'relative overflow-hidden rounded-[2.5rem] border border-black/6 bg-white/90 shadow-[0_24px_60px_rgba(15,23,42,0.10)]'
      : 'relative overflow-hidden rounded-[2.5rem] border border-white/50 bg-slate-900 shadow-[0_40px_100px_rgba(15,23,42,0.28)]';
  const heroOverlayStyle = isHeroSplit
    ? { background: 'linear-gradient(90deg, rgba(255,255,255,0.97) 0%, rgba(255,255,255,0.94) 54%, rgba(255,255,255,0.12) 78%, rgba(255,255,255,0.04) 100%)' }
    : isHeroMinimal
      ? { background: 'linear-gradient(180deg, rgba(255,255,255,0.82), rgba(255,255,255,0.58))' }
      : undefined;
  const heroOverlayClass = isHeroSplit || isHeroMinimal
    ? 'absolute inset-0'
    : 'absolute inset-0 bg-[linear-gradient(135deg,_rgba(9,19,35,0.86)_10%,_rgba(15,23,42,0.42)_52%,_rgba(15,23,42,0.78)_100%)]';
  const heroMinHeightClass = isHeroMinimal ? 'min-h-[30rem]' : 'min-h-[40rem]';
  const heroEyebrowClass = isHeroSplit || isHeroMinimal
    ? 'mb-4 text-[0.72rem] font-semibold uppercase tracking-[0.4em] text-[var(--site-secondary)] wrap-break-word'
    : 'mb-4 text-[0.72rem] font-semibold uppercase tracking-[0.4em] text-[#f9d27c] wrap-break-word';
  const heroTitleClass = isHeroSplit || isHeroMinimal
    ? 'max-w-3xl text-[2.75rem] leading-[1.05] font-black tracking-[-0.04em] text-slate-950 sm:text-6xl lg:text-7xl wrap-break-word'
    : 'max-w-3xl text-[2.75rem] leading-[1.05] font-black tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl wrap-break-word';
  const heroBodyClass = isHeroSplit || isHeroMinimal
    ? 'mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg'
    : 'mt-5 max-w-2xl text-base leading-7 text-white/78 sm:text-lg';
  const heroBadgeClass = isHeroSplit || isHeroMinimal
    ? 'inline-flex items-center gap-3 rounded-full border border-black/8 bg-white/88 px-4 py-2 text-sm text-slate-800 backdrop-blur-md'
    : 'inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/88 backdrop-blur-md';
  const heroMetaClass = isHeroSplit || isHeroMinimal
    ? 'rounded-full bg-black/5 px-4 py-2 text-sm font-medium text-slate-700 backdrop-blur-md'
    : 'rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/80 backdrop-blur-md';
  const primaryButtonClass = isHeroSplit || isHeroMinimal
    ? 'inline-flex items-center rounded-full px-6 py-3.5 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(15,23,42,0.18)] transition hover:-translate-y-1'
    : 'inline-flex items-center rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-slate-950 shadow-[0_16px_34px_rgba(255,255,255,0.24),0_6px_14px_rgba(15,23,42,0.20)] transition hover:-translate-y-1 hover:shadow-[0_24px_48px_rgba(255,255,255,0.32)]';
  const primaryButtonStyle = isHeroSplit || isHeroMinimal
    ? { background: 'linear-gradient(135deg, var(--site-primary), var(--site-secondary))' }
    : undefined;
  const secondaryButtonClass = isHeroSplit || isHeroMinimal
    ? 'inline-flex items-center rounded-full border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-900 shadow-[0_8px_24px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5 hover:bg-slate-50'
    : 'inline-flex items-center rounded-full border border-white/35 bg-white/18 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(255,255,255,0.10)] backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white/28';
  const newsPanelClass = isHeroSplit || isHeroMinimal
    ? 'rounded-[1.75rem] border border-black/8 bg-white/90 p-5 shadow-[0_18px_42px_rgba(15,23,42,0.12)] backdrop-blur-xl'
    : 'rounded-[1.75rem] border border-white/15 bg-white/10 p-5 shadow-[0_28px_60px_rgba(15,23,42,0.24)] backdrop-blur-xl';
  const newsPanelEyebrowClass = isHeroSplit || isHeroMinimal
    ? 'text-xs font-semibold uppercase tracking-[0.3em] text-slate-500'
    : 'text-xs font-semibold uppercase tracking-[0.3em] text-white/60';
  const newsPanelTitleClass = isHeroSplit || isHeroMinimal
    ? 'mt-2 text-xl font-semibold text-slate-950'
    : 'mt-2 text-xl font-semibold text-white';
  const newsNavButtonClass = isHeroSplit || isHeroMinimal
    ? 'inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100'
    : 'inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/8 text-white transition hover:bg-white/16';

  const cycleNews = (direction: 'prev' | 'next') => {
    if (highlightedNews.length <= 1) return;
    setActiveNews((current) => {
      if (direction === 'next') return (current + 1) % highlightedNews.length;
      return (current - 1 + highlightedNews.length) % highlightedNews.length;
    });
  };
  const cycleEvent = (dir: 'prev' | 'next') => {
    if (upcomingEvents.length <= 1) return;
    setActiveEvent((i) => dir === 'next' ? (i + 1) % upcomingEvents.length : (i - 1 + upcomingEvents.length) % upcomingEvents.length);
  };

  return (
    <section id="inicio" ref={heroRef} className="relative overflow-hidden scroll-mt-20 px-4 pb-16 pt-10 sm:px-6 sm:pt-14 lg:px-8 lg:pb-28 lg:pt-16 w-full">
      <motion.div style={{ y: heroBgY, backgroundImage: 'var(--site-background-gradient)' }} className="site-bg-gradient-strip absolute inset-x-0 top-0 -z-10 h-160" />
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 lg:grid-cols-[1.35fr_0.85fr] lg:items-stretch lg:gap-12">
        <motion.section {...sectionMotion} className={heroShellClass}>
          {site.hero_url ? (
            <motion.img src={site.hero_url} alt={site.name} style={{ y: heroImgY, opacity: isHeroSplit ? 0.9 : isHeroMinimal ? 0.22 : 0.7, width: isHeroSplit ? '54%' : '100%', left: isHeroSplit ? '46%' : 0 }} className="absolute inset-y-0 h-full object-cover scale-110" />
          ) : null}
          <div className={`${heroOverlayClass} hero-overlay`} style={heroOverlayStyle} />
          <div className={`relative flex ${heroMinHeightClass} flex-col justify-between p-6 sm:p-8 lg:p-10`}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.45 }}
                className={heroBadgeClass}
              >
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.85)]" />
                {heroBlock?.content?.badge_text as string}
              </motion.div>
              <div className={heroMetaClass}>{site.opening_hours}</div>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-10 lg:mt-20 lg:grid-cols-[1.2fr_0.8fr] lg:items-end lg:gap-8">
              <div className="min-w-0">
                <motion.p
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18, duration: 0.45 }}
                  className={heroEyebrowClass}
                >
                  {heroBlock?.content?.eyebrow as string}
                </motion.p>
                <motion.h2
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.24, duration: 0.55 }}
                  className={heroTitleClass}
                >
                  {heroBlock?.title}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.32, duration: 0.55 }}
                  className={heroBodyClass}
                >
                  {heroBlock?.subtitle || site.long_description || site.short_description}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 26 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.55 }}
                  className="mt-8 flex flex-wrap gap-4"
                >
                  {!!heroBlock?.content?.cta_primary_label && (
                    <a href={(heroBlock.content.cta_primary_href as string) || '#'} className={primaryButtonClass} style={primaryButtonStyle}>{heroBlock.content.cta_primary_label as string}</a>
                  )}
                  {!!heroBlock?.content?.cta_secondary_label && (
                    <a href={(heroBlock.content.cta_secondary_href as string) || '#'} className={secondaryButtonClass}>{heroBlock.content.cta_secondary_label as string}</a>
                  )}
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, x: 26 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.38, duration: 0.6 }}
                className={newsPanelClass}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={newsPanelEyebrowClass}>{heroBlock?.content?.news_panel_eyebrow as string}</p>
                    <h3 className={newsPanelTitleClass}>{heroBlock?.content?.news_panel_title as string}</h3>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => cycleNews('prev')} className={newsNavButtonClass} aria-label="Anterior noticia">
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => cycleNews('next')} className={newsNavButtonClass} aria-label="Siguiente noticia">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentNews?.id ?? 'empty-news'}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -14 }}
                    transition={{ duration: 0.25 }}
                    className="mt-5"
                  >
                    {currentNews ? (
                      <a href={getNewsHref(currentNews.slug)} className="group block" aria-label={`Leer artículo: ${currentNews.title}`}>
                        <div className="overflow-hidden rounded-[1.4rem] bg-slate-950/30 shadow-[0_18px_36px_rgba(15,23,42,0.2)]">
                          {currentNews.cover_url ? (
                            <img src={currentNews.cover_url} alt={currentNews.title} className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                          ) : (
                            <div className="flex h-44 w-full items-center justify-center bg-[linear-gradient(135deg,_rgba(56,189,248,0.32),_rgba(244,114,182,0.18))] text-sm font-medium text-white/90">
                              Novedad destacada
                            </div>
                          )}
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.32em] text-[#f9d27c]">
                          <span>{formatNewsDate(currentNews.published_at)}</span>
                          {currentNews.category?.name && <span>{currentNews.category.name}</span>}
                        </div>
                        <h4 className="mt-3 text-2xl font-semibold text-white transition-colors group-hover:text-[#f9d27c]">{currentNews.title}</h4>
                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/72">{currentNews.excerpt || 'Consulta la novedad completa y los detalles de esta publicación desde el CMS municipal.'}</p>
                      </a>
                    ) : (
                      <div className="rounded-[1.4rem] border border-dashed border-white/20 px-5 py-12 text-center text-white/70">
                        No hay noticias destacadas en este momento.
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </motion.section>

        <motion.aside {...sectionMotion} transition={{ ...sectionMotion.transition, delay: 0.08 }} className="grid gap-6 lg:gap-8 content-start">
          <div className="municipal-panel-light rounded-[2.2rem] border border-black/5 bg-white/92 p-7 sm:p-8 shadow-[0_24px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl">
            {quickLinksBlock?.title && <p className="text-[0.72rem] font-semibold uppercase tracking-[0.35em] text-slate-500">{quickLinksBlock.title}</p>}
            <div className="mt-5 grid gap-3">
              {(quickLinksBlock?.content?.links as any[] | undefined)?.map((item: any, index: number) => {
                const Icon = (item.icon && QUICK_LINK_ICON_MAP[item.icon])
                  ?? DEFAULT_QUICK_LINK_ICONS[index % DEFAULT_QUICK_LINK_ICONS.length];
                return (
                  <motion.a
                    key={item.label}
                    href={item.url}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + index * 0.08, duration: 0.38 }}
                    whileHover={{ y: -3, scale: 1.01 }}
                    className="municipal-quick-link-item group flex items-center gap-4 rounded-[1.35rem] bg-[linear-gradient(180deg,_#ffffff,_#f7f8fb)] px-4 py-3 shadow-[0_18px_36px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/70"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,_#0d3b66,_#1d7874)] text-white shadow-[0_12px_24px_rgba(13,59,102,0.26)]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-semibold text-slate-900">{item.label}</p>
                      <p className="text-sm text-slate-500">{item.description}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400 transition group-hover:text-slate-700" />
                  </motion.a>
                );
              })}
            </div>
          </div>

          {/* ── Events Slide Card ─────────────────────────────── */}
          <div className="municipal-panel-light relative overflow-hidden rounded-[2.2rem] border border-black/5 bg-white/92 shadow-[0_24px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl">
            {/* Cover image bg strip — two-layer so gradient can be themed */}
            {currentEvent?.cover_url && (<>
              <div className="pointer-events-none absolute inset-0"
                style={{ backgroundImage: `url(${currentEvent.cover_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
              <div className="municipal-event-cover-overlay pointer-events-none absolute inset-0" />
            </>)}
            {/* Colored top accent */}
            <div className="relative h-1 w-full" style={{ background: 'linear-gradient(90deg, var(--site-primary, #2563eb), var(--site-secondary, #0ea5e9))' }} />
            <div className="relative p-7 sm:p-8">
              {/* Header row */}
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  {eventsBlock?.subtitle && (
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-slate-400">{eventsBlock.subtitle}</p>
                  )}
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{eventsBlock?.title || 'Agenda de eventos'}</p>
                </div>
                {upcomingEvents.length > 1 && (
                  <div className="flex gap-1.5 shrink-0">
                    <button type="button" onClick={() => cycleEvent('prev')}
                      className="municipal-nav-btn inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:shadow"
                      aria-label="Evento anterior">
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button type="button" onClick={() => cycleEvent('next')}
                      className="municipal-nav-btn inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:shadow"
                      aria-label="Evento siguiente">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Slide */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentEvent?.id ?? 'empty-event'}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.22 }}
                  className="mt-5"
                >
                  {currentEvent ? (
                    <div className="flex items-start gap-4">
                      {/* Date badge */}
                      <div className="shrink-0 flex flex-col items-center justify-center rounded-2xl px-3 py-3 w-14 text-white shadow-md"
                           style={{ background: 'linear-gradient(135deg, var(--site-primary, #1e40af), var(--site-secondary, #0ea5e9))' }}>
                        <span className="text-[0.62rem] font-bold uppercase tracking-[0.18em] opacity-85">
                          {new Intl.DateTimeFormat('es-UY', { month: 'short' }).format(new Date(currentEvent.start_datetime))}
                        </span>
                        <span className="text-2xl font-black leading-none mt-0.5">
                          {new Date(currentEvent.start_datetime).getDate()}
                        </span>
                      </div>
                      {/* Info */}
                      <div className="min-w-0 flex-1 pt-0.5">
                        <p className="text-base font-semibold text-slate-900 leading-snug line-clamp-2">
                          {currentEvent.title}
                        </p>
                        {currentEvent.location_name && (
                          <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                            <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                            {currentEvent.location_name}
                          </p>
                        )}
                        {currentEvent.category && (
                          <span className="municipal-category-pill mt-2 inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-slate-500">
                            {currentEvent.category}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="py-8 text-center text-sm text-slate-400">No hay eventos próximos.</p>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Bottom row: dots + Más Info */}
              <div className="mt-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  {upcomingEvents.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveEvent(i)}
                      aria-label={`Evento ${i + 1}`}
                      className="transition-all rounded-full"
                      style={{
                        width: i === activeEvent ? '20px' : '6px',
                        height: '6px',
                        background: i === activeEvent ? 'var(--site-primary, #2563eb)' : 'rgba(148,163,184,0.5)',
                      }}
                    />
                  ))}
                </div>
                {currentEvent && (
                  <button
                    type="button"
                    onClick={() => setModalOpen(true)}
                    className="municipal-mas-info-btn inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all hover:shadow-sm"
                    style={{ color: 'var(--site-primary, #2563eb)', borderColor: 'var(--site-primary, #2563eb)' }}
                  >
                    Más info
                    <ChevronRight className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.aside>
      </div>

      {/* ── Event Detail Modal ──────────────────────────────────── */}
      <AnimatePresence>
        {modalOpen && currentEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-3 sm:p-6"
            style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
            onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}
          >
            <motion.div
              initial={{ opacity: 0, y: 64, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.97 }}
              transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
              className="municipal-event-modal w-full max-w-md overflow-hidden rounded-[2rem] shadow-[0_50px_120px_rgba(0,0,0,0.55)]"
            >
              {/* Header: cover image or gradient */}
              <div
                className="relative h-52 w-full overflow-hidden"
                style={{
                  backgroundImage: currentEvent.cover_url
                    ? `linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.68) 100%), url(${currentEvent.cover_url})`
                    : `linear-gradient(135deg, var(--site-primary, #1e3a8a), var(--site-secondary, #0ea5e9))`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/50"
                  aria-label="Cerrar modal"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="absolute bottom-5 left-5 flex items-end gap-4">
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-white/30 bg-white/20 px-3 py-2.5 text-white backdrop-blur-md">
                    <span className="text-[0.6rem] font-bold uppercase tracking-[0.2em] opacity-90">
                      {new Intl.DateTimeFormat('es-UY', { month: 'short' }).format(new Date(currentEvent.start_datetime))}
                    </span>
                    <span className="text-[1.75rem] font-black leading-none">{new Date(currentEvent.start_datetime).getDate()}</span>
                  </div>
                  <div className="min-w-0 pb-0.5">
                    {currentEvent.category && (
                      <span className="mb-2 inline-block rounded-full border border-white/30 bg-white/20 px-3 py-0.5 text-[0.62rem] font-bold uppercase tracking-[0.2em] text-white backdrop-blur-md">
                        {currentEvent.category}
                      </span>
                    )}
                    <p className="max-w-[230px] text-lg font-black leading-snug text-white drop-shadow-lg line-clamp-2">{currentEvent.title}</p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="municipal-event-modal-body p-6 sm:p-7">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <CalendarDays className="h-4 w-4 shrink-0" style={{ color: 'var(--site-primary, #2563eb)' }} />
                    <span className="font-medium municipal-modal-text capitalize">
                      {new Intl.DateTimeFormat('es-UY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(currentEvent.start_datetime))}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="h-4 w-4 shrink-0" style={{ color: 'var(--site-primary, #2563eb)' }} />
                    <span className="font-medium municipal-modal-text">
                      {new Intl.DateTimeFormat('es-UY', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(currentEvent.start_datetime))}
                      {currentEvent.end_datetime && ` — ${new Intl.DateTimeFormat('es-UY', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(currentEvent.end_datetime))}`}
                    </span>
                  </div>
                  {currentEvent.location_name && (
                    <div className="flex items-start gap-3 text-sm">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0" style={{ color: 'var(--site-primary, #2563eb)' }} />
                      <span className="font-semibold municipal-modal-text">{currentEvent.location_name}</span>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="municipal-modal-close-btn flex-1 rounded-full border px-4 py-2.5 text-sm font-semibold transition hover:opacity-80"
                  >
                    Cerrar
                  </button>
                  <a
                    href={`/eventos?evento=${encodeURIComponent(currentEvent.slug)}`}
                    className="flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
                    style={{ background: 'linear-gradient(135deg, var(--site-primary, #1e3a8a), var(--site-secondary, #0ea5e9))' }}
                  >
                    Ver página completa
                    <ChevronRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
