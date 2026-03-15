import { supabase } from "./supabase";

export const API_URL = import.meta.env.VITE_API_URL || "";

export function api(path) {
  return `${API_URL}${path}`;
}

/**
 * Fetch wrapper that adds the Supabase access token as a Bearer header
 * and handles cross-origin credentials when API_URL is set.
 */
export async function apiFetch(path, options = {}) {
  const { data } = await supabase.auth.getSession();
  const token = data?.session?.access_token;

  return fetch(api(path), {
    ...options,
    headers: {
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}
