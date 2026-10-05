// 127.0.0.1, not localhost: browsers try IPv6 first and Django's dev server listens on IPv4.
const API_URL = import.meta.env.VITE_LANGNAV_API_URL ?? 'http://127.0.0.1:8000/api/v1';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

/** GET a JSON resource from the LangNav API. */
export async function apiGet<T>(
  path: string,
  params: Record<string, string> = {},
  signal?: AbortSignal,
): Promise<T> {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${API_URL}/${path}${query ? `?${query}` : ''}`, { signal });
  if (!response.ok) {
    throw new ApiError(
      response.status,
      `${response.status} from ${path}: ${await response.text()}`,
    );
  }
  return (await response.json()) as T;
}
