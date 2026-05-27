import { apiGet, apiPost, apiPostMultipart } from './client';
import type {
  AuthoritiesResponse,
  CalendarItemPublic,
  EventSummary,
  EventDetailResponse,
  FormDetailResponse,
  FormsListResponse,
  MeetingPublic,
  NewsDetailResponse,
  NewsListResponse,
  NewsSummary,
  PageBlockPublic,
  PageDetailResponse,
  PagesListResponse,
  PaginatedResponse,
  ProcedureDetailResponse,
  ProceduresListResponse,
  ProcedureSubmitResponse,
  ProcedureTrackResponse,
  SiteConfigResponse,
  SubmitResponse,
} from './types';

const path = (s: string) => `/api/v1${s}`;

export const siteApi = {
  config: () => apiGet<SiteConfigResponse>(path('/site')),
  blocks: (pageType: string) => apiGet<{blocks: PageBlockPublic[]}>(path(`/pages/${pageType}`)),
};

export const newsApi = {
  list: (params?: { page?: number; per_page?: number; category?: string }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.per_page) qs.set('per_page', String(params.per_page));
    if (params?.category) qs.set('category', params.category);
    const query = qs.toString();
    return apiGet<NewsListResponse>(path(query ? `/news?${query}` : '/news'));
  },
  detail: (newsSlug: string) =>
    apiGet<NewsDetailResponse>(path(`/news/${newsSlug}`)),
};

export const eventsApi = {
  list: () =>
    apiGet<{events: EventSummary[]}>(
      path(`/events`),
    ),
  detail: (eventSlug: string) =>
    apiGet<EventDetailResponse>(path(`/events/${eventSlug}`)),
};

export const agendaApi = {
  list: () =>
    apiGet<{agenda: CalendarItemPublic[]}>(path('/agenda')),
};

export const meetingsApi = {
  list: () =>
    apiGet<{meetings: MeetingPublic[]}>(
      path(`/meetings`),
    ),
};

export const pagesApi = {
  detail: (pageSlug: string) =>
    apiGet<PageDetailResponse>(path(`/info-pages/${pageSlug}`)),
};

export const authoritiesApi = {
  list: () =>
    apiGet<AuthoritiesResponse>(path(`/authorities`)),
};

export const contactApi = {
  send: (municipalitySlug: string, payload: Record<string, unknown>) =>
    apiPost<{ok: boolean, message?: string}>(path(`/forms/contacto/submit`), payload),
};

export const formsApi = {
  detail: (formSlug: string) =>
    apiGet<FormDetailResponse>(path(`/forms/${formSlug}`)),
  submit: (formSlug: string, payload: Record<string, unknown>) =>
    apiPost<SubmitResponse>(
      path(`/forms/${formSlug}/submit`),
      payload,
    ),
};

export const proceduresApi = {
  list: () => apiGet<ProceduresListResponse>(path('/procedures')),
  detail: (procedureSlug: string) => apiGet<ProcedureDetailResponse>(path(`/procedures/${procedureSlug}`)),
  submit: (payload: FormData) => apiPostMultipart<ProcedureSubmitResponse>(path('/procedures/submit'), payload),
  track: (code: string) => apiGet<ProcedureTrackResponse>(path(`/procedures/track/${encodeURIComponent(code.toUpperCase().trim())}`)),
};

// ---------------------------------------------------------------------------
// Transparencia — Acceso a la Información Pública
// Endpoint: POST /api/v1/transparency/submit
// Para cambiar el destino, editá la ruta en path('/transparency/submit').
// ---------------------------------------------------------------------------
export const transparencyApi = {
  submit: (payload: Record<string, unknown>) =>
    apiPost<{ ok: boolean; message?: string; referenceNumber?: string }>(
      path('/transparency/submit'),
      payload,
    ),
};
