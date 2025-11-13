"use client";

const rawBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").trim();
const sanitizedBaseUrl = rawBaseUrl.replace(/\/$/, "");

export function getApiBaseUrl(): string {
  if (!sanitizedBaseUrl) {
    throw new Error("API base URL is not configured. Set NEXT_PUBLIC_API_BASE_URL.");
  }
  return sanitizedBaseUrl;
}

type ApiFetchOptions = RequestInit & {
  token?: string | null;
  skipAuthHeader?: boolean;
};

export async function apiFetch<TResponse>(
  path: string,
  { token, skipAuthHeader, headers, ...init }: ApiFetchOptions = {}
): Promise<TResponse> {
  const baseUrl = getApiBaseUrl();
  const url = path.startsWith("http") ? path : `${baseUrl}${path}`;

  const mergedHeaders: HeadersInit = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (!skipAuthHeader && token) {
    (mergedHeaders as Record<string, string>).Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    credentials: "include",
    ...init,
    headers: mergedHeaders,
  });

  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    const message =
      (payload as { error?: string; msg?: string })?.error ??
      (payload as { error?: string; msg?: string })?.msg ??
      response.statusText;
    throw new Error(message || "Unexpected API error");
  }

  return payload as TResponse;
}
