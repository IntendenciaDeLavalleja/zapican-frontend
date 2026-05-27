import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, MapPin, Clock, X } from 'lucide-react';
import { formatNewsDate, getNewsHref, getNewsTransitionNames } from '@/lib/news';
import type { CalendarItemPublic, NewsSummary, PageBlockPublic } from '@/lib/api/types';

type Props = {
  news: NewsSummary[];
  agendaItems: CalendarItemPublic[];
  newsBlock?: PageBlockPublic;
  eventsBlock?: PageBlockPublic;
};

const sectionMotion = {
  initial: { opacity: 0, y: 52, rotateX: 8, transformPerspective: 1100 },
  whileInView: { opacity: 1, y: 0, rotateX: 0, transformPerspective: 1100 },
  viewport: { once: true, amount: 0.13 },
  transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] as const },
};

function formatTime(date: string | null | undefined) {
  if (!date) return '';
  return new Intl.DateTimeFormat('es-UY', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(date));
}

function formatFullDate(date: string) {
  return new Intl.DateTimeFormat('es-UY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(date));
}

export default function NewsEventsBlock({ news, agendaItems, newsBlock, eventsBlock }: Props) {
  const [selected, setSelected] = useState<CalendarItemPublic | null>(null);

  useEffect(() => {
    if (!selected) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelected(null); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [selected]);

  return (
    <>
      <motion.section {...sectionMotion} id="actualidad" className="scroll-mt-28 px-4 py-16 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              {newsBlock?.title && <p className="text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-slate-500">{newsBlock.title}</p>}
              {newsBlock?.subtitle && <h3 className="mt-3 text-4xl font-black tracking-[-0.04em] text-slate-950">{newsBlock.subtitle}</h3>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-10 xl:grid-cols-[1.1fr_0.9fr] xl:gap-14 min-w-0">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 min-w-0">
              {news.slice(0, 4).map((item, index) => (
                <motion.a
                  key={item.id}
                  href={getNewsHref(item.slug)}
                  aria-label={`Leer artículo: ${item.title}`}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: index * 0.06, duration: 0.4 }}
                  whileHover={{ y: -8, rotateX: 2, rotateY: -2, transformPerspective: 900, transition: { type: 'spring', stiffness: 280, damping: 20 } }}
                  style={{ transformStyle: 'preserve-3d', viewTransitionName: getNewsTransitionNames(item.slug).card }}
                  className="municipal-news-card block overflow-hidden rounded-[2.2rem] bg-white shadow-[0_28px_64px_rgba(15,23,42,0.12)] ring-1 ring-black/5"
                >
                  <div className="relative h-64 overflow-hidden bg-slate-100">
                    {item.cover_url ? (
                      <motion.img whileHover={{ scale: 1.04 }} transition={{ duration: 0.45 }} src={item.cover_url} alt={item.title} className="h-full w-full object-cover" style={{ viewTransitionName: getNewsTransitionNames(item.slug).image }} />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,rgba(29,120,116,0.28),rgba(13,59,102,0.16))] text-sm font-semibold text-slate-700">Sin imagen destacada</div>
                    )}
                  </div>
                  <div className="p-7">
                    <div className="flex items-center gap-3 text-[0.68rem] font-semibold uppercase tracking-[0.3em] text-slate-400">
                      <span>{formatNewsDate(item.published_at)}</span>
                      {item.category?.name && <span>{item.category.name}</span>}
                    </div>
                    <h4 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950" style={{ viewTransitionName: getNewsTransitionNames(item.slug).title }}>{item.title}</h4>
                    <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">{item.excerpt || 'Contenido editorial publicado desde el backend municipal.'}</p>
                  </div>
                </motion.a>
              ))}
              {news.length === 0 && (
                <div className="rounded-[2.2rem] border border-dashed border-slate-300 bg-white/80 px-8 py-16 text-center text-slate-500 shadow-[0_18px_40px_rgba(15,23,42,0.06)] md:col-span-2">
                  No hay noticias destacadas cargadas desde el backend.
                </div>
              )}
            </div>

            <div
              id="agenda"
              className="municipal-agenda-panel scroll-mt-28 rounded-[2.5rem] bg-slate-950 p-8 text-white shadow-[0_30px_80px_rgba(15,23,42,0.26)] lg:p-10"
              style={eventsBlock?.media_url ? {
                backgroundImage: `linear-gradient(180deg, rgba(2, 6, 23, 0.92), rgba(15, 23, 42, 0.9)), url(${eventsBlock.media_url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              } : undefined}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  {eventsBlock?.subtitle && <p className="text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-white/50">{eventsBlock.subtitle}</p>}
                  {eventsBlock?.title && <h4 className="mt-3 text-3xl font-black tracking-[-0.03em]">{eventsBlock.title}</h4>}
                </div>
                <div className="rounded-2xl bg-white/10 p-3">
                  <CalendarDays className="h-6 w-6 text-[#f9d27c]" />
                </div>
              </div>

              <div className="mt-8 space-y-4">
                {agendaItems.slice(0, 4).map((item) => (
                  <motion.button
                    key={item.id}
                    type="button"
                    onClick={() => setSelected(item)}
                    whileHover={{ x: 6 }}
                    className="flex w-full cursor-pointer gap-5 rounded-[1.8rem] border border-white/8 bg-white/6 p-5 backdrop-blur-md text-left transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                  >
                    <div className="flex w-24 shrink-0 flex-col items-center justify-center rounded-[1.4rem] bg-white text-slate-950 shadow-[0_16px_30px_rgba(255,255,255,0.14)] px-2">
                      <span className="pt-3 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-500">{new Intl.DateTimeFormat('es-UY', { month: 'short' }).format(new Date(item.start_datetime))}</span>
                      <span className="pb-3 text-3xl font-black tracking-tight">{new Date(item.start_datetime).getDate()}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-lg font-semibold text-white">{item.title}</p>
                      <p className="mt-2 text-sm text-white/70">{item.location || 'Ubicación a confirmar'}</p>
                      <p className="mt-2 text-xs font-medium uppercase tracking-[0.24em] text-[#f9d27c]">{formatTime(item.start_datetime)}</p>
                    </div>
                  </motion.button>
                ))}
                {agendaItems.length === 0 && (
                  <p className="rounded-3xl border border-dashed border-white/10 px-4 py-10 text-center text-sm text-white/50">No hay eventos próximos cargados.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ── Event detail modal ── */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key="agenda-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4 sm:p-6"
            style={{ background: 'rgba(2, 6, 23, 0.72)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              key="agenda-modal-card"
              initial={{ opacity: 0, y: 48, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 32, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 340, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg overflow-hidden rounded-[2.5rem]"
              style={{
                background: 'linear-gradient(145deg, rgba(15, 27, 50, 0.98), rgba(9, 17, 35, 0.99))',
                border: '1px solid rgba(255,255,255,0.09)',
                boxShadow: '0 40px 100px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04) inset',
              }}
            >
              {/* Subtle top glow */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/20 to-transparent" />

              {/* Close button */}
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="absolute right-5 top-5 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/8 text-white/60 transition hover:bg-white/15 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="p-8 sm:p-10">
                {/* Date badge */}
                <div className="flex items-start gap-5">
                  <div
                    className="flex shrink-0 flex-col items-center justify-center rounded-[1.4rem] bg-white px-4 py-3 text-slate-950 shadow-[0_16px_40px_rgba(249,210,124,0.18)]"
                    style={{ minWidth: '4.5rem' }}
                  >
                    <span className="text-[0.62rem] font-bold uppercase tracking-[0.22em] text-slate-500">
                      {new Intl.DateTimeFormat('es-UY', { month: 'short' }).format(new Date(selected.start_datetime))}
                    </span>
                    <span className="text-4xl font-black tracking-tight leading-none py-1">
                      {new Date(selected.start_datetime).getDate()}
                    </span>
                    <span className="text-[0.62rem] font-semibold text-slate-400">
                      {new Date(selected.start_datetime).getFullYear()}
                    </span>
                  </div>
                  <div className="min-w-0 pt-1">
                    <p className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-[#f9d27c]/80">
                      {selected.type || 'Evento'}
                    </p>
                    <h3 className="mt-2 text-2xl font-black leading-tight tracking-[-0.02em] text-white">
                      {selected.title}
                    </h3>
                  </div>
                </div>

                {/* Meta row */}
                <div className="mt-7 flex flex-col gap-3">
                  <div className="flex items-center gap-3 text-sm text-white/65">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/8">
                      <Clock className="h-3.5 w-3.5 text-[#f9d27c]" />
                    </div>
                    <span>
                      {formatFullDate(selected.start_datetime)}&nbsp;·&nbsp;{formatTime(selected.start_datetime)}
                      {selected.end_datetime && ` – ${formatTime(selected.end_datetime)}`}
                    </span>
                  </div>
                  {selected.location && (
                    <div className="flex items-center gap-3 text-sm text-white/65">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/8">
                        <MapPin className="h-3.5 w-3.5 text-[#f9d27c]" />
                      </div>
                      <span>{selected.location}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                {selected.description && (
                  <div className="mt-7 border-t border-white/8 pt-6">
                    <p className="text-sm leading-7 text-white/70 whitespace-pre-line">{selected.description}</p>
                  </div>
                )}
              </div>

              {/* Bottom accent */}
              <div className="h-1 w-full bg-linear-to-r from-transparent via-[#f9d27c]/40 to-transparent" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
