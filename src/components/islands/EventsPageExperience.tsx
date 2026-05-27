import { useEffect, useMemo, useState } from 'react';
import type { AxiosError } from 'axios';

import MunicipalFooter from '@/components/common/Footer';
import MunicipalNavbar from '@/components/common/Navbar';
import type {
  EventDetailResponse,
  EventSummary,
  PageBlockPublic,
  SitePublic,
  ThemePublic,
} from '@/lib/api/types';
import { eventsApi, siteApi } from '@/lib/api';
import { syncThemeDocument } from '@/lib/theme';
import { repairApiPayload } from '@/lib/utils';

type Props = {
  site: SitePublic;
  theme: ThemePublic;
};

type EventsRoute =
  | { mode: 'list' }
  | { mode: 'detail'; slug: string };

function getEventHref(slug: string) {
  return `/eventos?evento=${encodeURIComponent(slug)}`;
}

function getEventsRoute(): EventsRoute {
  if (typeof window === 'undefined') {
    return { mode: 'list' };
  }
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/eventos';
  const segments = pathname.split('/').filter(Boolean);
  const eventSlug = new URLSearchParams(window.location.search).get('evento');

  if (eventSlug) {
    return { mode: 'detail', slug: decodeURIComponent(eventSlug) };
  }

  if (segments[0] === 'eventos' && segments.length > 1) {
    return { mode: 'detail', slug: decodeURIComponent(segments.slice(1).join('/')) };
  }
  return { mode: 'list' };
}

function extractErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<{ message?: string }> | undefined;
  return axiosError?.response?.data?.message || fallback;
}

function fmtDate(iso: string | null | undefined) {
  if (!iso) return '';
  return new Intl.DateTimeFormat('es-UY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso));
}

function fmtTime(iso: string | null | undefined) {
  if (!iso) return '';
  return new Intl.DateTimeFormat('es-UY', { hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
}

function fmtShortDate(iso: string | null | undefined) {
  if (!iso) return { day: '--', month: '---', weekday: '', full: '', time: '' };
  const date = new Date(iso);
  return {
    day: String(date.getDate()),
    month: new Intl.DateTimeFormat('es-UY', { month: 'short' }).format(date).toUpperCase(),
    weekday: new Intl.DateTimeFormat('es-UY', { weekday: 'short' }).format(date),
    full: new Intl.DateTimeFormat('es-UY', { day: 'numeric', month: 'long', year: 'numeric' }).format(date),
    time: new Intl.DateTimeFormat('es-UY', { hour: '2-digit', minute: '2-digit' }).format(date),
  };
}

export default function EventsPageExperience({ site, theme }: Props) {
  const [currentSite, setCurrentSite] = useState(site);
  const [currentTheme, setCurrentTheme] = useState(theme);
  const [navBlock, setNavBlock] = useState<PageBlockPublic | undefined>();
  const [route, setRoute] = useState<EventsRoute>(() => getEventsRoute());
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [detail, setDetail] = useState<EventDetailResponse | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    syncThemeDocument(currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    const nextRoute = getEventsRoute();
    setRoute(nextRoute);

    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setDetailError(null);
      try {
        if (nextRoute.mode === 'detail') {
          const [configResp, blocksResp, detailResp, eventsResp] = await Promise.all([
            siteApi.config(),
            siteApi.blocks('home'),
            eventsApi.detail(nextRoute.slug),
            eventsApi.list(),
          ]);
          if (cancelled) return;

          setCurrentSite(repairApiPayload(configResp.site));
          setCurrentTheme(repairApiPayload(configResp.theme));
          setNavBlock(repairApiPayload((blocksResp.blocks || []).find((block) => block.block_type === 'navigation')));
          setEvents(repairApiPayload(eventsResp.events || []));
          setDetail(repairApiPayload(detailResp));
          document.title = `${repairApiPayload(detailResp).title} · ${repairApiPayload(configResp.site).name}`;
        } else {
          const [configResp, eventsResp, blocksResp] = await Promise.all([
            siteApi.config(),
            eventsApi.list(),
            siteApi.blocks('home'),
          ]);
          if (cancelled) return;

          setCurrentSite(repairApiPayload(configResp.site));
          setCurrentTheme(repairApiPayload(configResp.theme));
          setNavBlock(repairApiPayload((blocksResp.blocks || []).find((block) => block.block_type === 'navigation')));
          setEvents(repairApiPayload(eventsResp.events || []));
          setDetail(null);
          document.title = `Agenda de eventos · ${repairApiPayload(configResp.site).name}`;
        }
      } catch (error) {
        if (cancelled) return;
        if (nextRoute.mode === 'detail') {
          setDetail(null);
          setDetailError(extractErrorMessage(error, 'No se pudo cargar el evento.'));
        } else {
          setEvents([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const now = new Date();
  const upcoming = route.mode === 'list'
    ? events.filter((item) => item.start_datetime && new Date(item.start_datetime) >= now)
    : [];
  const past = route.mode === 'list'
    ? events.filter((item) => item.start_datetime && new Date(item.start_datetime) < now).reverse()
    : [];
  const relatedEvents = useMemo(() => {
    if (!detail) return [];
    return events.filter((item) => item.slug !== detail.slug).slice(0, 3);
  }, [detail, events]);

  return (
    <div className="municipal-home-root relative min-h-screen">
      <MunicipalNavbar site={currentSite} navBlock={navBlock} theme={currentTheme} enableNightMode />
      <main style={{ background: 'var(--site-background-gradient)', color: 'var(--site-text)', minHeight: '60vh' }} className="px-4 pb-20 pt-28 lg:px-8">
        {route.mode === 'detail' ? (
          <article className="mx-auto max-w-5xl">
            <a href="/eventos" className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-950 hover:text-slate-950">← Volver a agenda</a>
            {isLoading ? (
              <div className="rounded-[2rem] border border-white/60 bg-white/88 p-8 text-slate-600 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">Cargando evento...</div>
            ) : !detail ? (
              <div className="rounded-[2rem] border border-amber-200 bg-amber-50 p-8 text-amber-900">{detailError || 'No encontramos ese evento.'}</div>
            ) : (
              <>
                <div className="evento-shell overflow-hidden rounded-[2.6rem] border border-white/60 bg-white/88 shadow-[0_34px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl">
                  <div className="relative h-[20rem] w-full overflow-hidden bg-slate-100 sm:h-[26rem]">
                    {detail.cover_url ? (
                      <img src={detail.cover_url} alt={detail.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--site-primary, #1e3a8a), var(--site-secondary, #0ea5e9))' }} />
                    )}
                    <div className="municipal-event-cover-overlay absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.78)_0%,rgba(255,255,255,0.68)_40%,rgba(255,255,255,0.95)_100%)]" />
                    <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
                      <div className="flex flex-wrap items-center gap-3 text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-slate-500">
                        {detail.category && <span>{detail.category}</span>}
                        <span>{fmtDate(detail.start_datetime)}</span>
                      </div>
                      <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-[-0.05em] text-slate-950 sm:text-5xl lg:text-6xl">{detail.title}</h1>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-10 p-6 sm:p-8 lg:grid-cols-[1.1fr_0.9fr] lg:p-10">
                    <div className="rounded-4xl bg-white/92 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] ring-1 ring-black/5 sm:p-8">
                      <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: detail.description_html || '<p>Evento sin descripción disponible.</p>' }} />
                    </div>

                    <aside className="municipal-glass-panel rounded-4xl p-6 ring-1 ring-black/5 sm:p-8">
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-slate-500">Datos del evento</p>
                      <div className="mt-5 space-y-5 text-sm leading-7 text-slate-600">
                        <div>
                          <p className="font-semibold uppercase tracking-[0.24em] text-slate-400">Fecha</p>
                          <p className="mt-1 text-base font-semibold text-slate-900">{fmtDate(detail.start_datetime)}</p>
                        </div>
                        <div>
                          <p className="font-semibold uppercase tracking-[0.24em] text-slate-400">Hora</p>
                          <p className="mt-1 text-base font-semibold text-slate-900">{fmtTime(detail.start_datetime)}{detail.end_datetime ? ` - ${fmtTime(detail.end_datetime)}` : ''}</p>
                        </div>
                        {detail.location_name && (
                          <div>
                            <p className="font-semibold uppercase tracking-[0.24em] text-slate-400">Lugar</p>
                            <p className="mt-1 text-base font-semibold text-slate-900">{detail.location_name}</p>
                          </div>
                        )}
                        {detail.address && (
                          <div>
                            <p className="font-semibold uppercase tracking-[0.24em] text-slate-400">Dirección</p>
                            <p className="mt-1 text-base text-slate-700">{detail.address}</p>
                          </div>
                        )}
                      </div>
                    </aside>
                  </div>
                </div>

                {relatedEvents.length > 0 && (
                  <section className="mt-12">
                    <p className="mb-5 text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-slate-500">Más eventos</p>
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {relatedEvents.map((item) => {
                        const shortDate = fmtShortDate(item.start_datetime);
                        return (
                          <a key={item.id} href={getEventHref(item.slug)} className="group overflow-hidden rounded-4xl border border-white/60 bg-white/88 shadow-[0_16px_40px_rgba(15,23,42,0.10)] backdrop-blur-xl transition hover:-translate-y-1.5 hover:shadow-[0_28px_60px_rgba(15,23,42,0.14)]">
                            <div className="relative h-40 w-full overflow-hidden">
                              {item.cover_url ? <img src={item.cover_url} alt={item.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="h-full w-full" style={{ background: 'linear-gradient(135deg, var(--site-primary, #1e3a8a), var(--site-secondary, #0ea5e9))' }} />}
                              <div className="absolute bottom-3 left-3 flex flex-col items-center justify-center rounded-xl px-2.5 py-2 text-white shadow-lg" style={{ background: 'linear-gradient(135deg, var(--site-primary, #1e3a8a), var(--site-secondary, #0ea5e9))' }}>
                                <span className="text-[0.55rem] font-bold uppercase leading-none opacity-90">{shortDate.month}</span>
                                <span className="mt-0.5 text-lg font-black leading-none">{shortDate.day}</span>
                              </div>
                            </div>
                            <div className="p-5">
                              {item.category && <span className="mb-2 inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-slate-500">{item.category}</span>}
                              <p className="text-sm font-bold leading-snug text-slate-900 transition-colors group-hover:text-(--site-primary,#2563eb)">{item.title}</p>
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  </section>
                )}
              </>
            )}
          </article>
        ) : (
          <div className="mx-auto max-w-5xl">
            <header className="eventos-header mb-10 overflow-hidden rounded-[2.2rem] px-8 py-12 sm:px-12 sm:py-14" style={{ background: 'linear-gradient(135deg, var(--site-primary, #1e3a8a) 0%, var(--site-secondary, #0ea5e9) 100%)' }}>
              <a href="/" className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/15 px-4 py-1.5 text-[0.7rem] font-semibold text-white backdrop-blur-md transition hover:bg-white/25">← Inicio</a>
              <p className="text-[0.72rem] font-bold uppercase tracking-[0.36em] text-white/70">Municipio</p>
              <h1 className="mt-2 text-4xl font-black text-white sm:text-5xl">Agenda de eventos</h1>
              <p className="mt-3 max-w-lg text-base text-white/80">Actividades, encuentros y celebraciones del municipio.</p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md"><span className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_6px_2px_rgba(74,222,128,0.5)]" />{upcoming.length} próximos</span>
                {past.length > 0 && <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white/70">{past.length} realizados</span>}
              </div>
            </header>

            {isLoading ? (
              <div className="rounded-[2rem] border border-white/60 bg-white/88 p-8 text-slate-600 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">Cargando agenda...</div>
            ) : upcoming.length === 0 ? (
              <div className="eventos-empty-card rounded-[2rem] border p-10 text-center">
                <p className="mb-3 text-3xl">📅</p>
                <p className="text-base font-semibold text-slate-700">No hay eventos próximos por el momento.</p>
                <p className="mt-1 text-sm text-slate-500">Volvé a consultar pronto.</p>
              </div>
            ) : (
              <section>
                <p className="mb-5 text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-slate-500">Próximos eventos</p>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {upcoming.map((item) => {
                    const shortDate = fmtShortDate(item.start_datetime);
                    return (
                      <a key={item.id} href={getEventHref(item.slug)} className="evento-listing-card group overflow-hidden rounded-[2rem] border border-white/60 bg-white/88 shadow-[0_16px_40px_rgba(15,23,42,0.10)] backdrop-blur-xl transition hover:-translate-y-1.5 hover:shadow-[0_28px_60px_rgba(15,23,42,0.14)]">
                        <div className="relative h-40 w-full overflow-hidden">
                          {item.cover_url ? (
                            <img src={item.cover_url} alt={item.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--site-primary, #1e3a8a), var(--site-secondary, #0ea5e9))' }} />
                          )}
                          <div className="absolute bottom-3 left-3 flex flex-col items-center justify-center rounded-xl px-2.5 py-2 text-white shadow-lg" style={{ background: 'linear-gradient(135deg, var(--site-primary, #1e3a8a), var(--site-secondary, #0ea5e9))' }}>
                            <span className="text-[0.55rem] font-bold uppercase leading-none opacity-90">{shortDate.month}</span>
                            <span className="mt-0.5 text-xl font-black leading-none">{shortDate.day}</span>
                          </div>
                          {item.is_featured && <div className="absolute right-3 top-3"><span className="rounded-full bg-amber-400 px-2.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.18em] text-amber-900 shadow">Destacado</span></div>}
                        </div>
                        <div className="p-5">
                          {item.category && <span className="mb-2 inline-block rounded-full bg-slate-100 px-2.5 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-slate-500">{item.category}</span>}
                          <p className="text-sm font-bold leading-snug text-slate-900 transition-colors group-hover:text-(--site-primary,#2563eb)">{item.title}</p>
                          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                            <span>{shortDate.full}</span>
                            <span className="opacity-40">·</span>
                            <span>{shortDate.time} hs</span>
                          </div>
                          {item.location_name && <p className="mt-1.5 text-xs text-slate-500">{item.location_name}</p>}
                        </div>
                      </a>
                    );
                  })}
                </div>
              </section>
            )}

            {past.length > 0 && (
              <section className="mt-14">
                <p className="mb-5 text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-slate-500">Eventos realizados</p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {past.map((item) => {
                    const shortDate = fmtShortDate(item.start_datetime);
                    return (
                      <a key={item.id} href={getEventHref(item.slug)} className="evento-past-card group flex items-center gap-4 overflow-hidden rounded-[1.6rem] border border-white/50 bg-white/75 px-5 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.07)] backdrop-blur-md transition hover:shadow-[0_14px_36px_rgba(15,23,42,0.11)]">
                        <div className="min-w-[48px] shrink-0 rounded-xl bg-slate-100 px-2.5 py-2 text-center">
                          <span className="text-[0.55rem] font-bold uppercase leading-none text-slate-500">{shortDate.month}</span>
                          <span className="mt-0.5 block text-xl font-black leading-none text-slate-700">{shortDate.day}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="line-clamp-1 text-sm font-semibold text-slate-700 transition-colors group-hover:text-(--site-primary,#2563eb)">{item.title}</p>
                          {item.location_name && <p className="mt-0.5 truncate text-xs text-slate-400">{item.location_name}</p>}
                        </div>
                      </a>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
      <MunicipalFooter site={currentSite} navBlock={navBlock} theme={currentTheme} />
    </div>
  );
}