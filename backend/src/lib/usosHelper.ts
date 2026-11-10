const USOS_API_URL = process.env.USOS_API_URL ?? "https://apps.usos.pwr.edu.pl/services";

export class UsosError extends Error {
  constructor(
    endpoint: string,
    public status: number,
  ) {
    super(`USOS ${endpoint}: status ${status}`);
  }
}

export async function usosGet<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const query = new URLSearchParams({ format: "json", ...params });
  const response = await fetch(`${USOS_API_URL}/${endpoint}?${query}`);

  if (!response.ok) {
    throw new UsosError(endpoint, response.status);
  }

  return response.json() as Promise<T>;
}