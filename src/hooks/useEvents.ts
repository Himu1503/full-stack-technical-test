import { useQuery } from '@tanstack/react-query';
import { eventsApi } from '@/lib/api/events';
import { EventsQueryParams } from '@/types';

export const useEvents = (params?: EventsQueryParams) => {
  return useQuery({
    queryKey: ['events', params],
    queryFn: () => eventsApi.getAll(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
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

