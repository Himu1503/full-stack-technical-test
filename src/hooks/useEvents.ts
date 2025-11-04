import { useQuery } from '@tanstack/react-query';
import { eventsApi } from '@/lib/api/events';
import { EventsQueryParams } from '@/types';

const normalizeParams = (params?: EventsQueryParams): EventsQueryParams | undefined => {
  if (!params) return undefined;
  
  const normalized: EventsQueryParams = {};
  if (params.search?.trim()) normalized.search = params.search.trim();
  if (params.category && params.category !== 'all') normalized.category = params.category;
  if (params.type && params.type !== 'all') normalized.type = params.type;
  if (params.date) normalized.date = params.date;
  
  return Object.keys(normalized).length > 0 ? normalized : undefined;
};

export const useEvents = (params?: EventsQueryParams) => {
  const normalizedParams = normalizeParams(params);
  
  return useQuery({
    queryKey: ['events', normalizedParams],
    queryFn: () => eventsApi.getAll(normalizedParams),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    enabled: true,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
    retryDelay: 1000,
  });
};

export const useEvent = (id: string) => {
  return useQuery({
    queryKey: ['event', id],
    queryFn: () => eventsApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

