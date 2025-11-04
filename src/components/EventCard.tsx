import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Clock, DollarSign } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Event } from '@/types';
import { cn } from '@/lib/utils';
import { EventRegistrationModal } from './EventRegistrationModal';
import { getCategoryConfig, getCategoryConfigSync } from '@/lib/content';
import { logAction } from '@/lib/analytics';

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
  const [categoryConfig, setCategoryConfig] = useState<{
    icon: string;
    color: string;
    backgroundColor: string;
    textColor: string;
  } | null>(null);

  useEffect(() => {
    const loadCategoryConfig = () => {
      if (event.categoryId) {
        const syncConfig = getCategoryConfigSync(event.categoryId);
        if (syncConfig) {
          setCategoryConfig({
            icon: syncConfig.icon,
            color: syncConfig.color,
            backgroundColor: syncConfig.backgroundColor,
            textColor: syncConfig.textColor,
          });
        } else {
          getCategoryConfig(event.categoryId).then(config => {
            if (config) {
              setCategoryConfig({
                icon: config.icon,
                color: config.color,
                backgroundColor: config.backgroundColor,
                textColor: config.textColor,
              });
            }
          });
        }
      }
    };

    loadCategoryConfig();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'pulse_events_categories' && event.categoryId) {
        loadCategoryConfig();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [event.categoryId]);

  useEffect(() => {
    logAction({
      action: 'view',
      resource: 'event',
      resourceId: event.id,
    });
  }, [event.id]);

  const isFull = event.capacity && event.registered
    ? event.registered >= event.capacity
    : false;
  const remainingSeats = event.capacity && event.registered
    ? event.capacity - event.registered
    : null;

  return (
    <Card className={cn(
      'flex flex-col h-full transition-all duration-300',
      'hover:shadow-xl hover:scale-[1.02] hover:border-primary/20',
      'border border-border/50 bg-card/50 backdrop-blur-sm',
      className
    )}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-xl font-bold line-clamp-2 flex-1 leading-tight">
            {event.title}
          </CardTitle>
          {event.category && (
            <span
              className="px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap flex items-center gap-1.5 shadow-sm transition-transform hover:scale-105"
              style={
                categoryConfig
                  ? {
                      backgroundColor: categoryConfig.backgroundColor,
                      color: categoryConfig.textColor,
                    }
                  : undefined
              }
            >
              {categoryConfig?.icon && <span className="text-sm">{categoryConfig.icon}</span>}
              <span>{event.category}</span>
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        {event.description && (
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {event.description}
          </p>
        )}
        <div className="space-y-2.5 text-sm pt-3 border-t border-border/50">
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
                  'px-3 py-1.5 text-xs font-medium rounded-md shadow-sm',
                  event.type === 'online'
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                    : 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300 border border-green-200 dark:border-green-800'
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
      <CardFooter className="flex flex-col gap-3 pt-4">
        <div className="flex gap-3 w-full">
          <Button
            asChild
            variant="outline"
            className="flex-1 transition-all hover:bg-accent hover:scale-105"
          >
            <Link to={`/events/${event.id}`}>
              View Details
            </Link>
          </Button>
          <Button
            className="flex-1 transition-all hover:scale-105 shadow-md"
            variant={isFull ? 'secondary' : 'default'}
            disabled={isFull}
            onClick={() => {
              logAction({
                action: 'click',
                resource: 'button',
                resourceId: event.id,
                metadata: { buttonText: 'Register' },
              });
              setIsRegistrationOpen(true);
            }}
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

