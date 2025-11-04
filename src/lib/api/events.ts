import { apiClient } from '../api';
import { Event, EventRegistration, EventRegistrationResponse, EventsQueryParams } from '@/types';

interface ApiEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
  category?: { name: string; id: string; color?: string };
  capacity?: { max: number; registered: number };
  pricing?: { individual: number };
  location?: { type: 'online' | 'physical'; address?: string };
  organizer?: string;
}

interface ApiEventsResponse {
  events: ApiEvent[];
  total?: number;
}

const transformApiEvent = (apiEvent: ApiEvent): Event => {
  return {
    id: apiEvent.id,
    title: apiEvent.title,
    description: apiEvent.description,
    date: apiEvent.date,
    time: apiEvent.time,
    category: apiEvent.category?.name,
    categoryId: apiEvent.category?.id,
    type: apiEvent.location?.type,
    capacity: apiEvent.capacity?.max,
    registered: apiEvent.capacity?.registered,
    location: apiEvent.location?.address,
    price: apiEvent.pricing?.individual,
    organizer: apiEvent.organizer,
  };
};

export const eventsApi = {
  getAll: async (params?: EventsQueryParams): Promise<Event[]> => {
    const queryParams = new URLSearchParams();
    
    if (params?.category && params.category !== 'all') {
      queryParams.append('category', params.category);
    }
    if (params?.type) {
      queryParams.append('type', params.type);
    }
    if (params?.search) {
      queryParams.append('search', params.search);
    }
    if (params?.date) {
      queryParams.append('date', params.date);
    }

    const queryString = queryParams.toString();
    const endpoint = `/events${queryString ? `?${queryString}` : ''}`;
    
    try {
      const response = await apiClient.get<ApiEventsResponse>(endpoint);
      
      if (!response) {
        return [];
      }
      
      if (!response.events || !Array.isArray(response.events)) {
        console.error('Invalid API response structure - missing events array:', response);
        return [];
      }
      
      return response.events.map(transformApiEvent);
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  },

  getById: async (id: string): Promise<Event> => {
    try {
      const response = await apiClient.get<{ event: ApiEvent }>(`/events/${id}`);
      
      const apiEvent = response.event || (response as unknown as ApiEvent);
      if (!apiEvent) {
        throw new Error('Event data not found in API response');
      }
      
      return transformApiEvent(apiEvent);
    } catch (error) {
      console.error('Error fetching event details:', error);
      throw error;
    }
  },

  register: async (
    eventId: string,
    registration: EventRegistration
  ): Promise<EventRegistrationResponse> => {
    try {
      const response = await apiClient.post<EventRegistrationResponse>(
        `/events/${eventId}/register`,
        registration
      );
      
      if (!response.success) {
        throw new Error(response.message || 'Registration failed');
      }
      
      return response;
    } catch (error) {
      console.error('Error registering for event:', error);
      throw error;
    }
  },
};

