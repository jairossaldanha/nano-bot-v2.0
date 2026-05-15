import { useCallback, useEffect, useState } from "react";
import { useClient } from "@/providers/ClientProvider";

export interface ApiQueryState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

/**
 * A custom hook to fetch data from the REST API endpoints.
 * It automatically injects the auth token from the ClientProvider context.
 */
export function useApiQuery<T>(endpoint: string): ApiQueryState<T> {
  const { token } = useClient();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "http://127.0.0.1:8765";
      const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
      
      const res = await fetch(`${baseUrl}${path}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`API error: HTTP ${res.status}`);
      }

      const json = await res.json();
      setData(json as T);
    } catch (e) {
      console.error(`Failed to fetch ${endpoint}:`, e);
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [endpoint, token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}
