/**
 * API configuration and utility functions
 */

/**
 * Get the API base URL from environment variables.
 * Falls back to localhost:8787 for local development.
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787'

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  parseAddresses: `${API_BASE_URL}/v1/addresses`,
  geocodeAddress: `${API_BASE_URL}/v1/geocode-address`,
} as const

/**
 * Fetch wrapper with error handling
 */
export async function apiRequest<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}${
        errorText ? ` - ${errorText}` : ''
      }`
    )
  }

  return response.json()
}
