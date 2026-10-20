const USOS_API_URL = process.env.USOS_API_URL ?? "https://apps.usos.pwr.edu.pl/services";

export async function usosGet<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const query = new URLSearchParams({ format: "json", ...params });
  const response = await fetch(`${USOS_API_URL}/${endpoint}?${query}`);

  if (!response.ok) {
    throw new Error(`USOS ${endpoint}: status ${response.status}`);
  }

  return response.json() as Promise<T>;
}