/**
 * Default SWR fetcher — hooks pass explicit async fetchers; this is a fallback.
 */
export async function defaultFetcher<T>(key: unknown): Promise<T> {
  if (typeof key === 'string' && key.startsWith('http')) {
    const res = await fetch(key);
    if (!res.ok) {
      throw new Error(res.statusText);
    }
    return res.json() as Promise<T>;
  }
  throw new Error('SWR key requires a custom fetcher');
}
