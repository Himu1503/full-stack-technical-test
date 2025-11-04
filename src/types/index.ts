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
}

export interface EventRegistration {
  eventId: string;
  name: string;
  email: string;
  phone?: string;
}

