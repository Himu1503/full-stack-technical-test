import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, ArrowLeft, DollarSign, Mail, Phone } from 'lucide-react';
import { useEvent } from '@/hooks/useEvents';
import { PageLoader } from '@/components/Loader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EventRegistrationModal } from '@/components/EventRegistrationModal';
import { EventMap } from '@/components/EventMap';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
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

const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
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
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-3xl md:text-4xl mb-3">{event.title}</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    {event.category && (
                      <Badge variant="secondary" className="text-sm">
                        {event.category}
                      </Badge>
                    )}
                    {event.type && (
                      <Badge variant={event.type === 'online' ? 'default' : 'outline'} className="text-sm">
                        {event.type === 'online' ? '🌐 Online' : '📍 In-Person'}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {event.description && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">About This Event</h3>
                  <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                    {event.description}
                  </p>
                </div>
              )}

              <Separator />

              <div>
                <h3 className="font-semibold text-lg mb-4">Event Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <Calendar className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-muted-foreground">Date</p>
                      <p className="text-base">{formatDate(event.date)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <Clock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-muted-foreground">Time</p>
                      <p className="text-base">{formatTime(event.date)}</p>
                    </div>
                  </div>

                  {event.location && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium text-sm text-muted-foreground">Location</p>
                        <p className="text-base">{event.location}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <DollarSign className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm text-muted-foreground">Price</p>
                      <p className="text-base font-semibold">
                        {event.price === 0 || event.price === undefined ? 'Free Event' : `$${event.price}`}
                      </p>
                    </div>
                  </div>

                  {event.type && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="w-5 h-5 flex items-center justify-center text-primary mt-0.5 flex-shrink-0">
                        {event.type === 'online' ? '🌐' : '📍'}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-muted-foreground">Event Type</p>
                        <p className="text-base">
                          {event.type === 'online' ? 'Online Event' : 'In-Person Event'}
                        </p>
                      </div>
                    </div>
                  )}

                  {remainingSeats !== null && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      <Users className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm text-muted-foreground">Availability</p>
                        <p className="text-base">
                          {isFull ? (
                            <span className="text-destructive font-medium">Event Full</span>
                          ) : (
                            `${remainingSeats} of ${event.capacity} seats available`
                          )}
                        </p>
                        {event.capacity && (
                          <div className="mt-2 w-full bg-secondary rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{
                                width: `${((event.registered || 0) / event.capacity) * 100}%`,
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>


              {event.location && event.type === 'physical' && (
                <>
                  <Separator />
                  <EventMap location={event.location} eventTitle={event.title} />
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-4 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Register Now</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center p-4 bg-primary/5 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Event Price</p>
                  <p className="text-3xl font-bold text-primary">
                    {event.price === 0 || event.price === undefined ? 'Free' : `$${event.price}`}
                  </p>
                </div>

                <div className="space-y-3">
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
                      This event is currently full. Please check back later for availability.
                    </p>
                  )}

                  {!isFull && (
                    <p className="text-xs text-center text-muted-foreground">
                      Complete your registration to receive a confirmation email
                    </p>
                  )}
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span>Confirmation email sent</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>Instant registration</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {remainingSeats !== null && remainingSeats <= 5 && remainingSeats > 0 && (
              <Card className="border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950">
                <CardContent className="pt-6">
                  <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                    ⚠️ Only {remainingSeats} seat{remainingSeats !== 1 ? 's' : ''} left!
                  </p>
                  <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                    Register now to secure your spot
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
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

