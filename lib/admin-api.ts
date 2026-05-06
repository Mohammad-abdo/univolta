import { API_BASE_URL } from "./constants";
import { apiRequest } from "./api";

async function adminFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  // Use the shared API client:
  // - attaches access token
  // - auto refreshes token on 401
  // - retries request once after refresh
  return apiRequest<T>(path, options);
}

/* ── Contact Messages ──────────────────────────────────────────────────── */
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  isRead: boolean;
  isArchived: boolean;
  repliedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MessagesResponse {
  messages: ContactMessage[];
  total: number;
  page: number;
  limit: number;
  unreadCount: number;
}

export const contactApi = {
  list: (params?: { page?: number; limit?: number; archived?: boolean; unread?: boolean }) => {
    const q = new URLSearchParams();
    if (params?.page)     q.set("page",     String(params.page));
    if (params?.limit)    q.set("limit",    String(params.limit));
    if (params?.archived) q.set("archived", "true");
    if (params?.unread)   q.set("unread",   "true");
    return adminFetch<MessagesResponse>(`/contact?${q}`);
  },
  get:     (id: string) => adminFetch<ContactMessage>(`/contact/${id}`),
  markRead: (ids: string[]) =>
    adminFetch<{ success: boolean }>("/contact/mark-read", {
      method: "PATCH",
      body:   JSON.stringify({ ids }),
    }),
  archive: (id: string, archived: boolean) =>
    adminFetch<ContactMessage>(`/contact/${id}/archive`, {
      method: "PATCH",
      body:   JSON.stringify({ archived }),
    }),
  delete: (id: string) =>
    adminFetch<{ success: boolean }>(`/contact/${id}`, { method: "DELETE" }),

  // Public submit (no auth)
  submit: (data: { name: string; email: string; phone?: string; subject?: string; message: string }) =>
    fetch(`${API_BASE_URL}/contact`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(data),
    }).then((r) => r.json()),
};

/* ── Site Settings ─────────────────────────────────────────────────────── */
export interface SiteSettings {
  "site.name"?:         string;
  "site.logoUrl"?:      string;
  "site.footerLogoUrl"?: string;
  "site.tagline"?:      string;
  "hero.slides"?:       HeroSlide[];
  "home.sections"?:     HomeSectionConfig[];
  "footer.content"?:    FooterContent;
}

export interface HeroSlide {
  id:        string;
  image:     string;
  badgeKey?: string;
  badge?:    string;
  titleEn?:  string;
  titleAr?:  string;
  subEn?:    string;
  subAr?:    string;
}

export interface HomeSectionConfig {
  id:      string;
  label:   string;
  enabled: boolean;
  order?:  number;
}

export interface FooterContent {
  titleEn?:   string;
  titleAr?:   string;
  phone?:     string;
  email?:     string;
  addressEn?: string;
  addressAr?: string;
  address?:   string;
  copyright?: string;
  quickLinks?: Array<{ label: string; href: string }>;
  socialLinks?: Array<{ platform: string; href: string }>;
}

export const settingsApi = {
  getAll: () => adminFetch<SiteSettings>("/settings"),
  getAllAdmin: () => adminFetch<SiteSettings>("/settings/admin/all"),
  get: (key: string) => adminFetch<{ key: string; value: unknown }>(`/settings/${key}`),
  set: (key: string, value: unknown) =>
    adminFetch<unknown>(`/settings/${key}`, {
      method: "PUT",
      body:   JSON.stringify({ value }),
    }),
  delete: (key: string) =>
    adminFetch<{ success: boolean }>(`/settings/${key}`, { method: "DELETE" }),
};

/* ── Admin stats helper ────────────────────────────────────────────────── */
export const adminStatsApi = {
  messages: () => adminFetch<MessagesResponse>("/contact?limit=1"),
};
