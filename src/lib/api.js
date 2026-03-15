import { supabase } from "./supabase";

export const API_URL = import.meta.env.VITE_API_URL || "";

export function api(path) {
  return `${API_URL}${path}`;
}

/**
 * Fetch wrapper that adds the Supabase access token as a Bearer header.
 * Accepts an optional `token` override for use right after sign-in
 * (before getSession reflects the new session).
 */
export async function apiFetch(path, options = {}) {
  let token = options._token;
  if (!token) {
    const { data } = await supabase.auth.getSession();
    token = data?.session?.access_token;
  }

  const { _token, ...fetchOptions } = options;
  return fetch(api(path), {
    ...fetchOptions,
    headers: {
      ...fetchOptions.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}
