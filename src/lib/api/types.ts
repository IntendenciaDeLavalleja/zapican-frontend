export interface SitePublic {
  name: string;
  short_description?: string;
  long_description?: string;
  address?: string;
  phone?: string;
  email?: string;
  opening_hours?: string;
  facebook_url?: string;
  instagram_url?: string;
  website_url?: string;
  latitude?: number;
  longitude?: number;
  logo_url?: string;
  shield_url?: string;
  hero_url?: string;
  seo?: {
    title?: string;
    description?: string;
    og_image?: string;
  };
}

export interface ThemePublic {
  preset: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  background_gradient: {
    from: string;
    to: string;
    angle: number;
  };
  header_variant: string;
  footer_variant: string;
  card_style: string;
  hero_style: string;
  font_style: string;
  enable_dark_section: boolean;
  custom_css?: string;
}

export interface SiteConfigResponse {
    site: SitePublic;
    theme: ThemePublic;
}

export interface ProcedureTypePublic {
  id: number;
  slug: string;
  title: string;
  summary?: string;
  description_html?: string;
  eligibility_notes?: string;
  fee_text?: string;
  estimated_days?: number;
  required_documents: string[];
  is_featured: boolean;
  order_index: number;
}

export interface ProcedureReceipt {
  id: number;
  tracking_code: string;
  status: string;
  created_at?: string;
  procedure?: ProcedureTypePublic;
}

export interface ProcedureTrackResponse {
  ok: boolean;
  message?: string;
  submission?: ProcedureReceipt;
}

export interface PageBlockPublic {
  id: number;
  page_type: string;
  block_type: string;
  title?: string;
  subtitle?: string;
  display_order: number;
  content: Record<string, unknown>;
}

export interface NewsCategoryPublic {
  id: number;
  slug: string;
  name: string;
  color?: string;
  description?: string;
}

export interface NewsSummary {
  id: number;
  slug: string;
  title: string;
  excerpt?: string;
  cover_url?: string;
  category?: NewsCategoryPublic;
  published_at?: string;
  is_featured: boolean;
}

export interface SeoPublic {
  title?: string;
  description?: string;
  og_image?: string;
}

export interface NewsDetailResponse extends NewsSummary {
  content_html: string;
  author?: string;
  seo?: SeoPublic;
}

export interface EventSummary {
  id: number;
  slug: string;
  title: string;
  start_datetime: string;
  end_datetime?: string;
  location_name?: string;
  category?: string;
  is_featured: boolean;
  cover_url?: string;
}

export interface EventDetailResponse extends EventSummary {
  description_html: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

export interface CalendarItemPublic {
  id: number;
  title: string;
  start_datetime: string;
  end_datetime?: string;
  type: string;
  location?: string;
  description?: string;
}

export interface MeetingPublic {
  location_name?: string;
  address?: string;
  agenda_html?: string;
  minutes_html?: string;
  document_url?: string;
  status: string;
}

export interface AuthorityPublic {
  id: number;
  name: string;
  role: string;
  bio?: string;
  email?: string;
  phone?: string;
  photo_url?: string;
  facebook_url?: string;
  twitter_url?: string;
  linkedin_url?: string;
  order_index: number;
}

export interface InfoPagePublic {
  id: number;
  slug: string;
  title: string;
  content_html: string;
  seo_title?: string;
  seo_description?: string;
  og_url?: string;
}

export interface InfoPageSummary {
  id: number;
  slug: string;
  title: string;
  seo_description?: string;
}

export interface CustomFormField {
  name: string;
  label?: string;
  type: 'text' | 'textarea' | 'email' | 'phone' | 'select' | 'checkbox' | 'date' | 'file';
  required?: boolean;
  options?: string[];
  placeholder?: string;
  help?: string;
}

export interface CustomFormSummary {
  id: number;
  slug: string;
  title: string;
  description?: string;
}

export interface FormDetailResponse extends CustomFormSummary {
  fields: CustomFormField[];
  success_message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  per_page: number;
  total: number;
  pages: number;
}

export interface PagesListResponse { items: InfoPageSummary[]; }
export interface PageDetailResponse { page: InfoPagePublic; }
export interface AuthoritiesResponse { authorities: AuthorityPublic[]; }
export interface CategoriesResponse { items: NewsCategoryPublic[]; }
export interface FormsListResponse { items: CustomFormSummary[]; }
export interface SubmitResponse { ok: boolean; message?: string; success?: boolean; }
export interface ProceduresListResponse { items: ProcedureTypePublic[]; }
export interface ProcedureDetailResponse { procedure: ProcedureTypePublic; }
export interface ProcedureSubmitResponse extends SubmitResponse { receipt?: ProcedureReceipt; }
export interface NewsListResponse {
  news: NewsSummary[];
  page: number;
  per_page: number;
  total: number;
  pages: number;
}
