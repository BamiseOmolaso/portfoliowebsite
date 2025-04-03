import { useState, useEffect } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface QueryState<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
}

export function useSupabaseQuery<T>(
  queryFn: (supabase: SupabaseClient) => Promise<{ data: T | null; error: Error | null }>,
  dependencies: any[] = []
) {
  const [state, setState] = useState<QueryState<T>>({
    data: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      try {
        setState(prev => ({ ...prev, loading: true }));
        const { data, error } = await queryFn(supabase);

        if (!mounted) return;

        if (error) {
          setState({
            data: null,
            error: error instanceof Error ? error : new Error(String(error)),
            loading: false,
          });
          return;
        }

        setState({
          data,
          error: null,
          loading: false,
        });
      } catch (err) {
        if (!mounted) return;
        setState({
          data: null,
          error: err instanceof Error ? err : new Error('An unexpected error occurred'),
          loading: false,
        });
      }
    }

    fetchData();

    return () => {
      mounted = false;
    };
  }, dependencies);

  return state;
}
