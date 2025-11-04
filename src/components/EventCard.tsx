import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Calendar, MapPin, Users, Clock, DollarSign } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Event } from '@/types';
import { cn } from '@/lib/utils';
import { EventRegistrationModal } from './EventRegistrationModal';

interface EventCardProps {
  event: Event;
  className?: string;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
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

export const EventCard = ({ event, className }: EventCardProps) => {
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const isFull = event.capacity && event.registered
    ? event.registered >= event.capacity
    : false;
  const remainingSeats = event.capacity && event.registered
    ? event.capacity - event.registered
    : null;

  return (
    <Card className={cn('flex flex-col h-full hover:shadow-lg transition-shadow', className)}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-xl line-clamp-2 flex-1">{event.title}</CardTitle>
          {event.category && (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary whitespace-nowrap">
              {event.category}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        {event.description && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {event.description}
          </p>
        )}
        <div className="space-y-2 text-sm pt-2 border-t">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{formatTime(event.date)}</span>
          </div>
          {event.location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
          )}
          {event.type && (
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'px-2 py-1 text-xs rounded',
                  event.type === 'online'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                )}
              >
                {event.type === 'online' ? '🌐 Online' : '📍 In-Person'}
              </span>
            </div>
          )}
          {remainingSeats !== null && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>
                {isFull ? (
                  <span className="text-destructive font-medium">Full</span>
                ) : (
                  `${remainingSeats} seats left`
                )}
              </span>
            </div>
          )}
          {event.price !== undefined && event.price !== null && (
            <div className="flex items-center gap-2 font-semibold">
              <DollarSign className="w-4 h-4 text-primary" />
              <span className={cn(
                'text-base',
                event.price === 0 ? 'text-green-600 dark:text-green-400' : 'text-foreground'
              )}>
                {event.price === 0 ? 'Free Event' : `$${event.price}`}
              </span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <div className="flex gap-2 w-full">
          <Button
            asChild
            variant="outline"
            className="flex-1"
          >
            <Link to={`/events/${event.id}`}>
              View Details
            </Link>
          </Button>
          <Button
            className="flex-1"
            variant={isFull ? 'secondary' : 'default'}
            disabled={isFull}
            onClick={() => setIsRegistrationOpen(true)}
          >
            {isFull ? 'Full' : 'Register'}
          </Button>
        </div>
      </CardFooter>

      <EventRegistrationModal
        event={event}
        open={isRegistrationOpen}
        onOpenChange={setIsRegistrationOpen}
      />
    </Card>
  );
};

