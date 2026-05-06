import { API_BASE_URL } from "./constants";
import { getLanguage } from "./i18n";

export interface ApiError {
  error: string;
  statusCode?: number;
}

/**
 * Start backend OAuth (full-page redirect). {@link API_BASE_URL} must include `/api/v1`.
 */
export function getOAuthLoginUrl(
  provider: "google" | "facebook",
  redirectPath?: string | null
): string {
  const base = API_BASE_URL.replace(/\/$/, "");
  const start = `${base}/auth/${provider}`;
  if (
    typeof redirectPath === "string" &&
    redirectPath.startsWith("/") &&
    !redirectPath.startsWith("//")
  ) {
    return `${start}?redirect=${encodeURIComponent(redirectPath)}`;
  }
  return start;
}

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

/**
 * Refresh access token using refresh token
 */
async function refreshAccessToken(): Promise<string | null> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        return null;
      }

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        // Refresh failed, clear tokens
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        return null;
      }

      const data = await response.json();
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      return data.accessToken;
    } catch (error) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/** Locale headers for API responses (matches Express `localeMiddleware`). */
export function getLocaleHeaders(): HeadersInit {
  if (typeof window === "undefined") return {};
  const code = getLanguage() === "ar" ? "ar" : "en";
  return { "X-Locale": code, "Accept-Language": code };
}

/**
 * Get authentication headers with access token
 */
export function getAuthHeaders(): HeadersInit {
  if (typeof window === "undefined") {
    return {};
  }

  const accessToken = localStorage.getItem("accessToken");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(getLocaleHeaders() as Record<string, string>),
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return headers;
}

/**
 * Make an authenticated API request with automatic token refresh
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  retryCount = 0
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  let headers = {
    ...getAuthHeaders(),
    ...options.headers,
  };

  // Remove Content-Type for FormData
  if (options.body instanceof FormData) {
    const { "Content-Type": _, ...restHeaders } = headers as any;
    headers = restHeaders;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // If 401 and we haven't retried, try to refresh token
  if (response.status === 401 && retryCount === 0) {
    const newAccessToken = await refreshAccessToken();
    
    if (newAccessToken) {
      // Retry the request with new token
      const retryHeaders = {
        ...headers,
        Authorization: `Bearer ${newAccessToken}`,
      };
      
      if (options.body instanceof FormData) {
        const { "Content-Type": _, ...restHeaders } = retryHeaders as any;
        Object.assign(retryHeaders, restHeaders);
      }

      const retryResponse = await fetch(url, {
        ...options,
        headers: retryHeaders,
      });

      if (!retryResponse.ok) {
        const error: ApiError = await retryResponse.json().catch(() => ({
          error: `HTTP ${retryResponse.status}: ${retryResponse.statusText}`,
          statusCode: retryResponse.status,
        }));

        // If we are still unauthorized after a successful refresh, force logout
        // (this can happen if the user was disabled, role revoked, or refresh token rotation desynced).
        if (
          (retryResponse.status === 401 || retryResponse.status === 403) &&
          typeof window !== "undefined" &&
          window.location.pathname.startsWith("/dashboard")
        ) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.href = "/dashboard/login?reason=session_expired";
        }

        throw error;
      }

      // Handle 204 No Content
      if (retryResponse.status === 204) {
        return undefined as T;
      }

      return retryResponse.json();
    } else {
      // Refresh failed, handle as normal 401
      const error: ApiError = await response.json().catch(() => ({
        error: `HTTP ${response.status}: ${response.statusText}`,
        statusCode: response.status,
      }));

      if (typeof window !== "undefined" && window.location.pathname.startsWith("/dashboard")) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/dashboard/login?reason=session_expired";
      }

      throw error;
    }
  }

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      error: `HTTP ${response.status}: ${response.statusText}`,
      statusCode: response.status,
    }));

    // If any dashboard request returns 401/403 (and refresh didn't apply), force re-login.
    // This avoids the "it stops saving until I logout/login" experience.
    if (
      (response.status === 401 || response.status === 403) &&
      typeof window !== "undefined" &&
      window.location.pathname.startsWith("/dashboard")
    ) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/dashboard/login?reason=session_expired";
    }

    throw error;
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

/**
 * Same as apiRequest but never sends Authorization and does not refresh tokens.
 * Use for **anonymous** program registration so the API creates/links a student account.
 * When the user is logged in, use `apiPost` / `apiPut` / etc. instead so `optionalAuth`
 * can attach the application to the current user.
 */
export async function apiRequestPublic<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const isForm = options.body instanceof FormData;
  const headers: HeadersInit = isForm
    ? (options.headers ?? {})
    : {
        "Content-Type": "application/json",
        ...((options.headers || {}) as Record<string, string>),
      };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as ApiError & { message?: string };
    const msg = body.message || body.error || `HTTP ${response.status}`;
    const err = Object.assign(new Error(msg), {
      error: body.error,
      statusCode: response.status,
    }) as Error & ApiError;
    throw err;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export async function apiPostPublic<T>(endpoint: string, data: unknown): Promise<T> {
  return apiRequestPublic<T>(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function apiPutPublic<T>(endpoint: string, data: unknown): Promise<T> {
  return apiRequestPublic<T>(endpoint, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * Make a POST request
 */
export async function apiPost<T>(
  endpoint: string,
  data: unknown
): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Make a PUT request
 */
export async function apiPut<T>(
  endpoint: string,
  data: unknown
): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * Make a PATCH request
 */
export async function apiPatch<T>(
  endpoint: string,
  data: unknown
): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

/**
 * Make a DELETE request
 */
export async function apiDelete<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: "DELETE",
  });
}

/**
 * Make a GET request
 */
export async function apiGet<T>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: "GET",
  });
}

/**
 * Upload a single image file
 */
export async function apiUploadImage(file: File): Promise<{ url: string; filename: string }> {
  const formData = new FormData();
  formData.append("image", file);

  return apiRequest<{ url: string; filename: string }>("/upload/image", {
    method: "POST",
    body: formData,
  });
}

/**
 * Upload multiple image files
 */
export async function apiUploadImages(files: File[]): Promise<{ files: Array<{ url: string; filename: string }> }> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("images", file);
  });

  return apiRequest<{ files: Array<{ url: string; filename: string }> }>("/upload/images", {
    method: "POST",
    body: formData,
  });
}

/**
 * Upload document for application
 */
export async function apiUploadDocument(
  applicationId: string,
  file: File,
  documentType: string
): Promise<{ id: string; fileUrl: string }> {
  const formData = new FormData();
  formData.append("document", file);
  formData.append("documentType", documentType);

  try {
    return await apiRequest<{ id: string; fileUrl: string }>(`/applications/${applicationId}/documents`, {
      method: "POST",
      body: formData,
    });
  } catch (error: any) {
    // Improve error message for document upload
    if (error.statusCode === 400) {
      throw new Error(error.error || "Invalid file type or missing document type");
    }
    if (error.statusCode === 404) {
      throw new Error("Application not found. Please complete step 1 first.");
    }
    throw error;
  }
}

export async function apiUploadDocumentPublic(
  applicationId: string,
  file: File,
  documentType: string
): Promise<{ id: string; fileUrl: string }> {
  const formData = new FormData();
  formData.append("document", file);
  formData.append("documentType", documentType);

  try {
    return await apiRequestPublic<{ id: string; fileUrl: string }>(
      `/applications/${applicationId}/documents`,
      {
        method: "POST",
        body: formData,
      }
    );
  } catch (error: any) {
    if (error.statusCode === 400) {
      throw new Error(error.error || "Invalid file type or missing document type");
    }
    if (error.statusCode === 404) {
      throw new Error("Application not found. Please complete step 1 first.");
    }
    throw error;
  }
}

/**
 * Process payment for application
 */
export async function apiProcessPayment(
  applicationId: string,
  paymentData: {
    paymentMethod: "credit_card" | "paypal";
    amount: number;
    cardNumber?: string;
    cardholderName?: string;
    expiryDate?: string;
    cvv?: string;
    paypalEmail?: string;
  }
): Promise<any> {
  return apiPost(`/payments/${applicationId}/process`, paymentData);
}

export async function apiProcessPaymentPublic(
  applicationId: string,
  paymentData: {
    paymentMethod: "credit_card" | "paypal";
    amount: number;
    cardNumber?: string;
    cardholderName?: string;
    expiryDate?: string;
    cvv?: string;
    paypalEmail?: string;
  }
): Promise<any> {
  return apiPostPublic(`/payments/${applicationId}/process`, paymentData);
}
