export const API_URL = import.meta.env.VITE_API_URL || "";

export function api(path) {
  return `${API_URL}${path}`;
}

/**
 * Thin wrapper around fetch that adds credentials: "include" when
 * the frontend and API are on different origins (e.g. GH Pages → Vercel).
 */
export function apiFetch(path, options = {}) {
  return fetch(api(path), {
    credentials: API_URL ? "include" : "same-origin",
    ...options,
  });
}
