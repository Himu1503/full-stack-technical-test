import { useState, useMemo } from 'react';
import { useEvents } from '@/hooks/useEvents';
import { EventCard } from '@/components/EventCard';
import { SearchBar } from '@/components/SearchBar';
import { FilterDropdown } from '@/components/FilterDropdown';
import { PageLoader } from '@/components/Loader';

export const EventsPage = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [type, setType] = useState('all');

  const { data: events = [], isLoading, error, isError } = useEvents({
    search: search || undefined,
    category: category !== 'all' ? category : undefined,
    type: type !== 'all' ? type : undefined,
  });

  console.log('EventsPage render:', {
    eventsCount: events.length,
    isLoading,
    isError,
    error: error?.message,
    events: events.slice(0, 2),
  });

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(events.map((e) => e.category).filter(Boolean))
    );
    return uniqueCategories.map((cat) => ({
      value: cat || '',
      label: cat || '',
    }));
  }, [events]);


  if (isLoading) {
    return <PageLoader />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center space-y-4">
          <p className="text-destructive text-lg font-medium">
            Failed to load events
          </p>
          <p className="text-muted-foreground text-sm">
            {error instanceof Error ? error.message : 'Please try again later.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 space-y-4">
        <h1 className="text-3xl font-bold">Browse Events</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SearchBar value={search} onChange={setSearch} />
          <FilterDropdown
            label="Category"
            value={category}
            options={categories}
            onChange={setCategory}
            placeholder="All Categories"
          />
          <FilterDropdown
            label="Type"
            value={type}
            options={[
              { value: 'online', label: 'Online' },
              { value: 'physical', label: 'In-Person' },
            ]}
            onChange={setType}
            placeholder="All Types"
          />
        </div>
      </div>

      {events.length === 0 && !isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            No events found. Try adjusting your filters.
          </p>
        </div>
      ) : (
        <>
          {events.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                Showing {events.length} event{events.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
