type TokenResolver = () => Promise<string | null>;

let activeTokenResolver: TokenResolver | null = null;

/**
 * Configure the global token resolver hook (usually provided by Clerk's useAuth)
 */
export function setTokenResolver(resolver: TokenResolver) {
  activeTokenResolver = resolver;
}

/**
 * Perform a tenant-scoped request automatically attaching the JWT Authorization header if available.
 */
export async function authenticatedFetch(url: string, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers);

  if (activeTokenResolver) {
    try {
      const token = await activeTokenResolver();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    } catch (err) {
      console.error("🔒 [API Client] Failed to resolve auth token:", err);
    }
  }

  return fetch(url, {
    ...init,
    headers
  });
}
