import { headers } from "next/headers";

async function getBaseUrl() {
  const h = await headers();
  const protocol = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host");

  if (!host) {
    throw new Error("Unable to determine host for server-side API requests.");
  }

  return `${protocol}://${host}`;
}

async function buildUrl(path, searchParams) {
  const url = new URL(path, await getBaseUrl());
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value === undefined || value === null || value === "") continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

async function parseError(res) {
  try {
    const payload = await res.json();
    if (payload?.error) return payload.error;
    return JSON.stringify(payload);
  } catch {
    return null;
  }
}

/**
 * Server-safe API fetch helper for calling this app's Route Handlers.
 */
export async function apiGet(path, { searchParams, cache, next } = {}) {
  const h = await headers();
  const url = await buildUrl(path, searchParams);
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      // Forward cookies so auth-protected APIs work in Server Components.
      cookie: h.get("cookie") ?? "",
    },
    cache,
    next,
  });

  if (!res.ok) {
    const message = (await parseError(res)) || `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }

  return res.json();
}

