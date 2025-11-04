import { apiClient } from '../api';
import { API_BASE_URL } from '../constants';
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
      console.log('Fetching events from:', `${API_BASE_URL}${endpoint}`);
      const response = await apiClient.get<ApiEventsResponse>(endpoint);
      console.log('API Response received:', response);
      
      if (!response) {
        console.error('Empty API response');
        return [];
      }
      
      if (!response.events || !Array.isArray(response.events)) {
        console.error('Invalid API response structure - missing events array:', response);
        return [];
      }
      
      console.log(`Transforming ${response.events.length} events`);
      const transformed = response.events.map(transformApiEvent);
      console.log('Transformed events:', transformed);
      return transformed;
    } catch (error) {
      console.error('Error fetching events:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          name: error.name,
          stack: error.stack,
        });
      }
      throw error;
    }
  },

  getById: async (id: string): Promise<Event> => {
    const apiEvent = await apiClient.get<ApiEvent>(`/events/${id}`);
    return transformApiEvent(apiEvent);
  },

  register: async (
    eventId: string,
    registration: EventRegistration
  ): Promise<EventRegistrationResponse> => {
    return apiClient.post<EventRegistrationResponse>(
      `/events/${eventId}/register`,
      registration
    );
  },
};

