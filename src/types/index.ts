export interface Event {
  id: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
  location?: string;
  category?: string;
  type?: 'online' | 'physical';
  capacity?: number;
  registered?: number;
  image?: string;
  organizer?: string;
  price?: number;
  tags?: string[];
}

export interface EventRegistration {
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone?: string;
}

export interface EventRegistrationResponse {
  success: boolean;
  message?: string;
  registrationId?: string;
}

export interface EventsQueryParams {
  category?: string;
  type?: 'online' | 'physical';
  search?: string;
  date?: string;
}
