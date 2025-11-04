import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, ArrowLeft } from 'lucide-react';
import { useEvent } from '@/hooks/useEvents';
import { PageLoader } from '@/components/Loader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EventRegistrationModal } from '@/components/EventRegistrationModal';
import { useState } from 'react';

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const EventDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: event, isLoading, error } = useEvent(id || '');
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);

  if (isLoading) {
    return <PageLoader />;
  }

  if (error || !event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center space-y-4">
          <p className="text-destructive">Failed to load event details.</p>
          <Button onClick={() => navigate('/events')}>Back to Events</Button>
        </div>
      </div>
    );
  }

  const isFull = event.capacity && event.registered
    ? event.registered >= event.capacity
    : false;
  const remainingSeats = event.capacity && event.registered
    ? event.capacity - event.registered
    : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => navigate('/events')}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Events
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <CardTitle className="text-3xl">{event.title}</CardTitle>
                {event.category && (
                  <span className="px-3 py-1 text-sm font-medium rounded-full bg-primary/10 text-primary whitespace-nowrap">
                    {event.category}
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {event.description && (
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {event.description}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Date</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(event.date)}
                    </p>
                  </div>
                </div>

                {event.time && (
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Time</p>
                      <p className="text-sm text-muted-foreground">{event.time}</p>
                    </div>
                  </div>
                )}

                {event.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">{event.location}</p>
                    </div>
                  </div>
                )}

                {event.type && (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 flex items-center justify-center">
                      {event.type === 'online' ? '🌐' : '📍'}
                    </div>
                    <div>
                      <p className="font-medium">Type</p>
                      <p className="text-sm text-muted-foreground">
                        {event.type === 'online' ? 'Online Event' : 'In-Person Event'}
                      </p>
                    </div>
                  </div>
                )}

                {remainingSeats !== null && (
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Availability</p>
                      <p className="text-sm text-muted-foreground">
                        {isFull ? (
                          <span className="text-destructive font-medium">Full</span>
                        ) : (
                          `${remainingSeats} of ${event.capacity} seats available`
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {event.organizer && (
                <div>
                  <h3 className="font-semibold mb-2">Organizer</h3>
                  <p className="text-muted-foreground">{event.organizer}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Register for Event</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {event.price !== undefined && (
                <div>
                  <p className="text-2xl font-bold">
                    {event.price === 0 ? 'Free' : `$${event.price}`}
                  </p>
                </div>
              )}

              <Button
                className="w-full"
                size="lg"
                onClick={() => setIsRegistrationOpen(true)}
                disabled={isFull}
              >
                {isFull ? 'Event Full' : 'Register Now'}
              </Button>

              {isFull && (
                <p className="text-sm text-destructive text-center">
                  This event is currently full. Please check back later.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <EventRegistrationModal
        event={event}
        open={isRegistrationOpen}
        onOpenChange={setIsRegistrationOpen}
      />
    </div>
  );
};

