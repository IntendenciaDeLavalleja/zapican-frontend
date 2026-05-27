import type { NewsDetailResponse, NewsSummary } from '@/lib/api/types';
import { repairApiPayload } from '@/lib/utils';

type NewsTransitionNames = {
  card: string;
  image: string;
  title: string;
};

export function getNewsHref(slug: string) {
  return `/novedades/${slug}`;
}

export function getNewsTransitionNames(slug: string): NewsTransitionNames {
  return {
    card: `news-card-${slug}`,
    image: `news-image-${slug}`,
    title: `news-title-${slug}`,
  };
}

export function repairNewsSummary(news: NewsSummary) {
  return repairApiPayload(news);
}

export function repairNewsDetail(news: NewsDetailResponse) {
  return repairApiPayload(news);
}

export function formatNewsDate(value?: string | null) {
  if (!value) return 'Sin fecha';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Sin fecha';

  return new Intl.DateTimeFormat('es-UY', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsed);
}