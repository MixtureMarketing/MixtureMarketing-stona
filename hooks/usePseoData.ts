import { useEffect, useState } from 'react';

export function usePseoData<T>(
  slug: string | undefined,
  fetcher: (slug: string) => Promise<T | null>,
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        const result = await fetcher(slug);
        if (result) {
          setData(result);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, fetcher]);

  return { data, loading, error };
}
