import { API_BASE_URL } from "./constants";

/**
 * Convert a relative image URL to a full URL
 * If the URL is already absolute (starts with http:// or https://), return it as is
 * If it's a relative path (starts with /), prepend the base URL (without /api/v1)
 * 
 * Backend serves uploads from /uploads at root level (not /api/v1/uploads)
 */
export function getImageUrl(url: string | null | undefined): string {
  if (!url) return "";
  
  // If it's a blob URL (from FileReader/URL.createObjectURL), return as is
  if (url.startsWith("blob:")) {
    return url;
  }
  
  // If already a full URL, return as is (but fix if it incorrectly includes /api/v1/uploads)
  if (url.startsWith("http://") || url.startsWith("https://")) {
    // Fix URLs that incorrectly include /api/v1/uploads - should be just /uploads
    // Replace all occurrences to handle edge cases
    return url.replace(/\/api\/v1\/uploads/g, "/uploads");
  }
  
  // If relative path starting with /uploads, prepend base URL without /api/v1
  if (url.startsWith("/uploads")) {
    const baseUrl = API_BASE_URL.replace("/api/v1", "");
    return `${baseUrl}${url}`;
  }
  
  // If relative path starting with /, prepend base URL without /api/v1
  if (url.startsWith("/")) {
    const baseUrl = API_BASE_URL.replace("/api/v1", "");
    return `${baseUrl}${url}`;
  }
  
  // Otherwise, assume it's a relative path and prepend base URL
  const baseUrl = API_BASE_URL.replace("/api/v1", "");
  return `${baseUrl}/${url}`;
}

/**
 * Get image URL or fallback
 */
export function getImageUrlOrFallback(
  url: string | null | undefined,
  fallback: string
): string {
  const imageUrl = getImageUrl(url);
  return imageUrl || fallback;
}

