import { API_BASE_URL } from "./constants";

export interface ApiError {
  error: string;
  statusCode?: number;
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

/**
 * Get authentication headers with access token
 */
export function getAuthHeaders(): HeadersInit {
  if (typeof window === "undefined") {
    return {};
  }

  const accessToken = localStorage.getItem("accessToken");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
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

        // Only redirect on authentication endpoints after refresh fails (not on 404 or other errors)
        if ((retryResponse.status === 401 || retryResponse.status === 403) && typeof window !== "undefined") {
          // Only logout on auth-related endpoints, not on data endpoints (404, 500, etc.)
          const isAuthEndpoint = endpoint.includes("/auth/me") || 
                                 endpoint.includes("/auth/refresh");
          if (isAuthEndpoint && window.location.pathname.startsWith("/dashboard")) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            window.location.href = "/dashboard/login";
          }
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

      if (typeof window !== "undefined") {
        // Only logout on auth-related endpoints when refresh fails, not on data endpoints
        const isAuthEndpoint = endpoint.includes("/auth/me") || 
                               endpoint.includes("/auth/refresh");
        if (isAuthEndpoint && window.location.pathname.startsWith("/dashboard")) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.href = "/dashboard/login";
        }
      }

      throw error;
    }
  }

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      error: `HTTP ${response.status}: ${response.statusText}`,
      statusCode: response.status,
    }));

    // Only redirect on authentication endpoints (not on 404, 500, etc.)
    if ((response.status === 401 || response.status === 403) && typeof window !== "undefined") {
      // Only logout on auth-related endpoints, not on data endpoints
      const isAuthEndpoint = endpoint.includes("/auth/me") || 
                             endpoint.includes("/auth/refresh");
      if (isAuthEndpoint && window.location.pathname.startsWith("/dashboard")) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/dashboard/login";
      }
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
