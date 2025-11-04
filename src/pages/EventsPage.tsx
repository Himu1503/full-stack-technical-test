import { useState, useMemo, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { useEvents } from '@/hooks/useEvents';
import { EventCard } from '@/components/EventCard';
import { SearchBar } from '@/components/SearchBar';
import { FilterDropdown } from '@/components/FilterDropdown';
import { PageLoader } from '@/components/Loader';
import { logAction } from '@/lib/analytics';

export const EventsPage = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [type, setType] = useState('all');
  
  const [debouncedSearch] = useDebounce(search, 500);

  useEffect(() => {
    logAction({
      action: 'view',
      resource: 'events',
    });
  }, []);

  useEffect(() => {
    if (debouncedSearch) {
      logAction({
        action: 'search',
        resource: 'events',
        metadata: { searchTerm: debouncedSearch },
      });
    }
  }, [debouncedSearch]);

  useEffect(() => {
    if (category !== 'all') {
      logAction({
        action: 'filter',
        resource: 'category',
        resourceId: category,
      });
    }
  }, [category]);

  useEffect(() => {
    if (type !== 'all') {
      logAction({
        action: 'filter',
        resource: 'type',
        resourceId: type,
      });
    }
  }, [type]);

  const { data: events = [], isLoading, error } = useEvents({
    search: debouncedSearch || undefined,
    category: category !== 'all' ? category : undefined,
    type: type !== 'all' ? type : undefined,
  });

  const { data: allEvents = [] } = useEvents({});

  const categories = useMemo(() => {
    const categoryMap = new Map<string, { id: string; name: string }>();
    
    allEvents.forEach((event) => {
      if (event.category && event.categoryId) {
        if (!categoryMap.has(event.categoryId)) {
          categoryMap.set(event.categoryId, {
            id: event.categoryId,
            name: event.category,
          });
        }
      }
    });
    
    return Array.from(categoryMap.values())
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((cat) => ({
        value: cat.id,
        label: cat.name,
      }));
  }, [allEvents]);

  const groupedEvents = useMemo(() => {
    const sorted = [...events].sort((a, b) => {
      const typeA = a.type || '';
      const typeB = b.type || '';
      const categoryA = a.category || '';
      const categoryB = b.category || '';
      
      // If a type filter is selected, prioritize that type
      // Otherwise, default to physical first, then online
      const typeOrder: Record<string, number> = 
        type !== 'all' && type === 'online'
          ? { online: 1, physical: 2 } // Online first if selected
          : type !== 'all' && type === 'physical'
          ? { physical: 1, online: 2 } // Physical first if selected
          : { physical: 1, online: 2 }; // Default: Physical first
      
      const typeOrderA = typeOrder[typeA] || 999;
      const typeOrderB = typeOrder[typeB] || 999;
      
      if (typeOrderA !== typeOrderB) {
        return typeOrderA - typeOrderB;
      }
      
      if (categoryA !== categoryB) {
        return categoryA.localeCompare(categoryB);
      }
      
      return a.title.localeCompare(b.title);
    });
    
    const grouped = sorted.reduce((acc, event) => {
      const eventType = event.type || 'Uncategorized';
      const eventCategory = event.category || 'Uncategorized';
      const groupKey = `${eventType}|${eventCategory}`;
      
      if (!acc[groupKey]) {
        acc[groupKey] = {
          type: eventType,
          category: eventCategory,
          events: [],
        };
      }
      acc[groupKey].events.push(event);
      return acc;
    }, {} as Record<string, { type: string; category: string; events: typeof events }>);
    
    return grouped;
  }, [events, type]);

  const sortedEvents = useMemo(() => {
    return Object.values(groupedEvents).flatMap(group => group.events);
  }, [groupedEvents]);

  const isSearching = search !== debouncedSearch;
  const showLoading = isLoading || isSearching;

  if (showLoading && events.length === 0) {
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

      {isSearching && (
        <div className="mb-4 text-sm text-muted-foreground">
          Searching for "{search}"...
        </div>
      )}

      {sortedEvents.length === 0 && !showLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            No events found{debouncedSearch ? ` matching "${debouncedSearch}"` : ''}. Try adjusting your filters.
          </p>
        </div>
      ) : (
        <>
          {sortedEvents.length > 0 && (
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {sortedEvents.length} event{sortedEvents.length !== 1 ? 's' : ''}
                {debouncedSearch && (
                  <span className="ml-2">for "{debouncedSearch}"</span>
                )}
              </p>
              {isSearching && (
                <div className="text-xs text-muted-foreground">
                  Searching...
                </div>
              )}
            </div>
          )}
          {Object.values(groupedEvents)
            .sort((a, b) => {
              // If a type filter is selected, prioritize that type
              // Otherwise, default to physical first, then online
              const typeOrder: Record<string, number> = 
                type !== 'all' && type === 'online'
                  ? { online: 1, physical: 2 } // Online first if selected
                  : type !== 'all' && type === 'physical'
                  ? { physical: 1, online: 2 } // Physical first if selected
                  : { physical: 1, online: 2 }; // Default: Physical first
              
              const typeOrderA = typeOrder[a.type] || 999;
              const typeOrderB = typeOrder[b.type] || 999;
              
              if (typeOrderA !== typeOrderB) {
                return typeOrderA - typeOrderB;
              }
              
              return (a.category || '').localeCompare(b.category || '');
            })
            .map((group, index) => (
              <div key={`${group.type}-${group.category}-${index}`} className="mb-8">
                <div className="flex items-center gap-3 mb-4 pb-2 border-b">
                  <h2 className="text-2xl font-semibold">
                    {group.type === 'physical' ? '📍 In-Person' : '🌐 Online'} - {group.category}
                  </h2>
                  <span className="text-base font-normal text-muted-foreground">
                    ({group.events.length} event{group.events.length !== 1 ? 's' : ''})
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {group.events.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </div>
            ))}
        </>
      )}
    </div>
  );
};
