import { useEffect, useMemo, useState } from 'react';
import type { AxiosError } from 'axios';

import MunicipalFooter from '@/components/common/Footer';
import MunicipalNavbar from '@/components/common/Navbar';
import type {
  NewsDetailResponse,
  NewsSummary,
  PageBlockPublic,
  SitePublic,
  ThemePublic,
} from '@/lib/api/types';
import { newsApi, siteApi } from '@/lib/api';
import { formatNewsDate, getNewsHref } from '@/lib/news';
import { syncThemeDocument } from '@/lib/theme';
import { repairApiPayload } from '@/lib/utils';

const PER_PAGE = 7;

type Props = {
  site: SitePublic;
  theme: ThemePublic;
};

type NewsRoute =
  | { mode: 'list'; page: number }
  | { mode: 'detail'; slug: string };

function getNewsRoute(): NewsRoute {
  if (typeof window === 'undefined') {
    return { mode: 'list', page: 1 };
  }

  const pathname = window.location.pathname.replace(/\/+$/, '') || '/novedades';
  const segments = pathname.split('/').filter(Boolean);
  const searchParams = new URLSearchParams(window.location.search);
  const articleSlug = searchParams.get('articulo');

  if (articleSlug) {
    return {
      mode: 'detail',
      slug: decodeURIComponent(articleSlug),
    };
  }

  if (segments[0] === 'novedades' && segments.length > 1) {
    return {
      mode: 'detail',
      slug: decodeURIComponent(segments.slice(1).join('/')),
    };
  }

  const rawPage = Number(searchParams.get('pagina') || 1);
  return {
    mode: 'list',
    page: Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1,
  };
}

function getHeaderContent(blocks: PageBlockPublic[]) {
  const headerBlock = blocks.find((block) => block.block_type === 'news_header');
  return (headerBlock?.content ?? {}) as Record<string, string>;
}

function buildPageLinks(currentPage: number, totalPages: number): Array<number | '...'> {
  const pageLinks: Array<number | '...'> = [];
  if (totalPages <= 7) {
    for (let page = 1; page <= totalPages; page += 1) {
      pageLinks.push(page);
    }
    return pageLinks;
  }

  pageLinks.push(1);
  if (currentPage > 3) {
    pageLinks.push('...');
  }
  for (let page = Math.max(2, currentPage - 1); page <= Math.min(totalPages - 1, currentPage + 1); page += 1) {
    pageLinks.push(page);
  }
  if (currentPage < totalPages - 2) {
    pageLinks.push('...');
  }
  pageLinks.push(totalPages);
  return pageLinks;
}

function extractErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<{ message?: string }> | undefined;
  return axiosError?.response?.data?.message || fallback;
}

export default function NewsPageExperience({ site, theme }: Props) {
  const [currentSite, setCurrentSite] = useState(site);
  const [currentTheme, setCurrentTheme] = useState(theme);
  const [navBlock, setNavBlock] = useState<PageBlockPublic | undefined>();
  const [headerContent, setHeaderContent] = useState<Record<string, string>>({});
  const [route, setRoute] = useState<NewsRoute>(() => getNewsRoute());
  const [posts, setPosts] = useState<NewsSummary[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [detail, setDetail] = useState<NewsDetailResponse | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    syncThemeDocument(currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    const nextRoute = getNewsRoute();
    setRoute(nextRoute);

    let cancelled = false;

    async function load() {
      setIsLoading(true);
      setDetailError(null);

      try {
        if (nextRoute.mode === 'detail') {
          const [configResp, blocksResp, detailResp, listResp, novBlocksResp] = await Promise.all([
            siteApi.config(),
            siteApi.blocks('home'),
            newsApi.detail(nextRoute.slug),
            newsApi.list({ page: 1, per_page: 50 }),
            siteApi.blocks('novedades'),
          ]);
          if (cancelled) {
            return;
          }

          setCurrentSite(repairApiPayload(configResp.site));
          setCurrentTheme(repairApiPayload(configResp.theme));
          setNavBlock(repairApiPayload((blocksResp.blocks || []).find((block) => block.block_type === 'navigation')));
          setHeaderContent(getHeaderContent(repairApiPayload(novBlocksResp.blocks || [])));
          setPosts(repairApiPayload(listResp.news || []));
          setDetail(repairApiPayload(detailResp));
          setTotalPages(1);
          document.title = `${repairApiPayload(detailResp).title} · ${repairApiPayload(configResp.site).name}`;
        } else {
          const [configResp, newsResp, blocksResp, novBlocksResp] = await Promise.all([
            siteApi.config(),
            newsApi.list({ page: nextRoute.page, per_page: PER_PAGE }),
            siteApi.blocks('home'),
            siteApi.blocks('novedades'),
          ]);
          if (cancelled) {
            return;
          }

          setCurrentSite(repairApiPayload(configResp.site));
          setCurrentTheme(repairApiPayload(configResp.theme));
          setNavBlock(repairApiPayload((blocksResp.blocks || []).find((block) => block.block_type === 'navigation')));
          setHeaderContent(getHeaderContent(repairApiPayload(novBlocksResp.blocks || [])));
          setPosts(repairApiPayload(newsResp.news || []));
          setTotalPages(newsResp.pages || 1);
          setDetail(null);
          document.title = `Novedades · ${repairApiPayload(configResp.site).name}`;
        }
      } catch (error) {
        if (cancelled) {
          return;
        }
        if (nextRoute.mode === 'detail') {
          setDetail(null);
          setDetailError(extractErrorMessage(error, 'No se pudo cargar el artículo.'));
        } else {
          setPosts([]);
          setTotalPages(1);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const headingColor = headerContent.heading_color || '#0f172a';
  const subtitleColor = headerContent.subtitle_color || '#475569';
  const labelColor = headerContent.label_color || '#64748b';
  const featuredPost = route.mode === 'list' ? posts[0] ?? null : null;
  const gridPosts = route.mode === 'list' ? posts.slice(1) : [];
  const relatedPosts = useMemo(() => {
    if (!detail) {
      return [];
    }
    return posts.filter((item) => item.slug !== detail.slug).slice(0, 3);
  }, [detail, posts]);
  const pageLinks = route.mode === 'list' ? buildPageLinks(route.page, totalPages) : [];

  return (
    <div className="municipal-home-root relative min-h-screen">
      <MunicipalNavbar site={currentSite} navBlock={navBlock} theme={currentTheme} enableNightMode />
      <main style={{ background: 'var(--site-background-gradient)', color: 'var(--site-text)', minHeight: '60vh' }} className="px-4 pb-20 pt-28 lg:px-8">
        {route.mode === 'detail' ? (
          <section className="mx-auto max-w-6xl">
            <a href="/novedades" className="inline-flex items-center rounded-full border border-slate-300 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-950 hover:text-slate-950">← Volver a novedades</a>

            {isLoading ? (
              <div className="mt-8 rounded-[2rem] border border-white/60 bg-white/88 p-8 text-slate-600 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">Cargando artículo...</div>
            ) : !detail ? (
              <div className="mt-8 rounded-[2rem] border border-amber-200 bg-amber-50 p-8 text-amber-900">{detailError || 'No encontramos ese artículo.'}</div>
            ) : (
              <>
                <article className="mt-8 rounded-[2.6rem] border border-white/60 bg-white/88 p-6 shadow-[0_34px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:p-8 lg:p-12">
                  <div className="flex flex-wrap items-center gap-3 text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-slate-500">
                    <span>{formatNewsDate(detail.published_at)}</span>
                    {detail.category?.name && <span>{detail.category.name}</span>}
                    {detail.author && <span>{detail.author}</span>}
                  </div>

                  <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
                    <div>
                      <h1 className="text-4xl font-black tracking-[-0.05em] text-slate-950 sm:text-5xl lg:text-6xl">{detail.title}</h1>
                      {detail.excerpt && <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">{detail.excerpt}</p>}
                    </div>

                    <div className="overflow-hidden rounded-[2rem] bg-slate-100 shadow-[0_24px_64px_rgba(15,23,42,0.14)]">
                      {detail.cover_url ? (
                        <img src={detail.cover_url} alt={detail.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex min-h-72 items-center justify-center bg-[radial-gradient(circle_at_top,rgba(29,120,116,0.28),rgba(13,59,102,0.16))] text-sm font-semibold text-slate-700">Sin imagen destacada</div>
                      )}
                    </div>
                  </div>

                  <div className="news-rich-content mt-10 rounded-[2rem] bg-white/82 p-6 ring-1 ring-black/5 sm:p-8 lg:p-10" dangerouslySetInnerHTML={{ __html: detail.content_html || '<p>Artículo sin contenido disponible.</p>' }} />
                </article>

                {relatedPosts.length > 0 && (
                  <section className="mt-12">
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-slate-500">Más novedades</p>
                    <div className="mt-5 grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
                      {relatedPosts.map((post) => (
                        <a key={post.id} href={getNewsHref(post.slug)} className="overflow-hidden rounded-[2rem] border border-white/60 bg-white/88 shadow-[0_18px_50px_rgba(15,23,42,0.10)] backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-[0_28px_60px_rgba(15,23,42,0.14)]">
                          <div className="aspect-[16/10] w-full bg-slate-100">
                            {post.cover_url ? <img src={post.cover_url} alt={post.title} className="h-full w-full object-cover" /> : null}
                          </div>
                          <div className="p-6">
                            <div className="flex flex-wrap items-center gap-3 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-500">
                              <span>{formatNewsDate(post.published_at)}</span>
                              {post.category?.name && <span>{post.category.name}</span>}
                            </div>
                            <h3 className="mt-4 text-2xl font-black tracking-[-0.03em] text-slate-950">{post.title}</h3>
                            {post.excerpt && <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600">{post.excerpt}</p>}
                          </div>
                        </a>
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </section>
        ) : (
          <section className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.34em]" style={{ color: labelColor }}>Novedades</p>
              <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] sm:text-6xl" style={{ color: headingColor }}>Blog y actualidad del municipio</h1>
              <p className="mt-5 text-base leading-8 sm:text-lg" style={{ color: subtitleColor }}>Artículos desarrollados, obras, servicios, cultura local y la agenda pública del territorio.</p>
            </div>

            {isLoading ? (
              <div className="mt-12 rounded-[2rem] border border-white/60 bg-white/88 p-8 text-slate-600 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">Cargando novedades...</div>
            ) : (
              <>
                {featuredPost && (
                  <a href={getNewsHref(featuredPost.slug)} className="mt-12 block overflow-hidden rounded-[2.2rem] border border-white/60 bg-white/88 shadow-[0_24px_64px_rgba(15,23,42,0.10)] backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-[0_30px_70px_rgba(15,23,42,0.14)]">
                    <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr]">
                      <div className="p-8 lg:p-10">
                        <div className="flex flex-wrap items-center gap-3 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-500">
                          <span>{formatNewsDate(featuredPost.published_at)}</span>
                          {featuredPost.category?.name && <span>{featuredPost.category.name}</span>}
                        </div>
                        <h2 className="mt-5 text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">{featuredPost.title}</h2>
                        {featuredPost.excerpt && <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">{featuredPost.excerpt}</p>}
                      </div>
                      <div className="min-h-[18rem] bg-slate-100">
                        {featuredPost.cover_url ? <img src={featuredPost.cover_url} alt={featuredPost.title} className="h-full w-full object-cover" /> : null}
                      </div>
                    </div>
                  </a>
                )}

                {gridPosts.length > 0 && (
                  <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
                    {gridPosts.map((post) => (
                      <a key={post.id} href={getNewsHref(post.slug)} className="overflow-hidden rounded-[2rem] border border-white/60 bg-white/88 shadow-[0_18px_50px_rgba(15,23,42,0.10)] backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-[0_28px_60px_rgba(15,23,42,0.14)]">
                        <div className="aspect-[16/10] w-full bg-slate-100">
                          {post.cover_url ? <img src={post.cover_url} alt={post.title} className="h-full w-full object-cover" /> : null}
                        </div>
                        <div className="p-6">
                          <div className="flex flex-wrap items-center gap-3 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-500">
                            <span>{formatNewsDate(post.published_at)}</span>
                            {post.category?.name && <span>{post.category.name}</span>}
                          </div>
                          <h3 className="mt-4 text-2xl font-black tracking-[-0.03em] text-slate-950">{post.title}</h3>
                          {post.excerpt && <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600">{post.excerpt}</p>}
                        </div>
                      </a>
                    ))}
                  </div>
                )}

                {posts.length === 0 && <p className="mt-16 text-center text-slate-500">No hay artículos publicados.</p>}

                {totalPages > 1 && (
                  <nav className="mt-14 flex flex-wrap items-center justify-center gap-2" aria-label="Paginación de artículos">
                    {route.page > 1 && <a href={`/novedades?pagina=${route.page - 1}`} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm font-medium text-slate-700 transition-all hover:border-slate-300 hover:bg-white hover:shadow-sm">← Anterior</a>}

                    {pageLinks.map((pageLink, index) => pageLink === '...' ? (
                      <span key={`ellipsis-${index}`} className="px-1 text-slate-400 select-none">...</span>
                    ) : (
                      <a
                        key={pageLink}
                        href={`/novedades?pagina=${pageLink}`}
                        className={`inline-flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold transition-all ${pageLink === route.page ? 'text-white shadow-md' : 'border border-slate-200 bg-white/80 text-slate-700 hover:border-slate-300 hover:bg-white hover:shadow-sm'}`}
                        style={pageLink === route.page ? { backgroundColor: currentTheme.colors?.primary || '#2563eb', borderColor: currentTheme.colors?.primary || '#2563eb' } : undefined}
                      >
                        {pageLink}
                      </a>
                    ))}

                    {route.page < totalPages && <a href={`/novedades?pagina=${route.page + 1}`} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm font-medium text-slate-700 transition-all hover:border-slate-300 hover:bg-white hover:shadow-sm">Siguiente →</a>}
                  </nav>
                )}
              </>
            )}
          </section>
        )}
      </main>
      <MunicipalFooter site={currentSite} navBlock={navBlock} theme={currentTheme} />
    </div>
  );
}