import { useState, useMemo, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { useEvents } from '@/hooks/useEvents';
import { EventCard } from '@/components/EventCard';
import { SearchBar } from '@/components/SearchBar';
import { FilterDropdown } from '@/components/FilterDropdown';
import { PageLoader } from '@/components/Loader';
import { logAction } from '@/lib/analytics';
import { loadCategories } from '@/lib/content';
import { Button } from '@/components/ui/button';
import { X, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

export const EventsPage = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [type, setType] = useState('all');
  const [managedCategories, setManagedCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  const [debouncedSearch] = useDebounce(search, 500);
  
  const hasActiveFilters = category !== 'all' || type !== 'all' || search !== '';
  
  const clearFilters = () => {
    setSearch('');
    setCategory('all');
    setType('all');
    setShowMobileFilters(false);
  };

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

  useEffect(() => {
    const loadManagedCategories = async () => {
      const categories = await loadCategories();
      setManagedCategories(
        categories.map(cat => ({
          id: cat.id,
          name: cat.name,
        }))
      );
    };
    loadManagedCategories();

    const interval = setInterval(loadManagedCategories, 5000);
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'pulse_events_categories') {
        loadManagedCategories();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const categories = useMemo(() => {
    if (managedCategories.length > 0) {
      return managedCategories.map((cat) => ({
        value: cat.id,
        label: cat.name,
      }));
    }

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
  }, [managedCategories, allEvents]);

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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 max-w-7xl">
        <div className="mb-6 sm:mb-8 lg:mb-10 space-y-4 sm:space-y-6">
          <div className="space-y-2 sm:space-y-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
              Browse Events
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg md:text-xl">
              Discover amazing events tailored for you
            </p>
          </div>

          <div className="sticky top-16 sm:top-20 z-40 bg-background/95 backdrop-blur-md border-b border-border/50 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex-1">
                  <SearchBar value={search} onChange={setSearch} />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="md:hidden shrink-0"
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                >
                  {showMobileFilters ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <SlidersHorizontal className="w-5 h-5" />
                  )}
                </Button>
              </div>

              <div className={cn(
                "grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 lg:p-5 bg-muted/30 rounded-xl border border-border/50 backdrop-blur-sm transition-all",
                "md:grid md:grid-cols-2",
                showMobileFilters ? "grid" : "hidden md:grid"
              )}>
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

              {hasActiveFilters && (
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs sm:text-sm text-muted-foreground font-medium">
                      Active filters:
                    </span>
                    {search && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs sm:text-sm bg-primary/10 text-primary rounded-full font-medium">
                        Search: {search}
                        <button
                          onClick={() => setSearch('')}
                          className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {category !== 'all' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs sm:text-sm bg-primary/10 text-primary rounded-full font-medium">
                        {categories.find(c => c.value === category)?.label || category}
                        <button
                          onClick={() => setCategory('all')}
                          className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                    {type !== 'all' && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs sm:text-sm bg-primary/10 text-primary rounded-full font-medium">
                        {type === 'online' ? 'Online' : 'In-Person'}
                        <button
                          onClick={() => setType('all')}
                          className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-xs sm:text-sm h-7 sm:h-8"
                  >
                    Clear all
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {sortedEvents.length === 0 && !showLoading ? (
          <div className="text-center py-12 sm:py-16 lg:py-20 space-y-4 sm:space-y-6">
            <div className="text-6xl sm:text-7xl mb-4 sm:mb-6">🔍</div>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
              No events found
            </h3>
            <p className="text-muted-foreground text-sm sm:text-base lg:text-lg max-w-md mx-auto px-4">
              {debouncedSearch ? (
                <>
                  No events matching <span className="font-semibold text-foreground">"{debouncedSearch}"</span>
                </>
              ) : (
                <>
                  No events available at the moment.
                  <br className="hidden sm:block" />
                  <span className="block sm:inline"> Try adjusting your filters or check back later.</span>
                </>
              )}
            </p>
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="mt-4 sm:mt-6"
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            {sortedEvents.length > 0 && (
              <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-card/50 to-card/30 rounded-xl border border-border/50 backdrop-blur-sm shadow-sm">
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <p className="text-xs sm:text-sm font-medium text-foreground">
                    Showing <span className="text-primary font-bold text-sm sm:text-base">{sortedEvents.length}</span> event{sortedEvents.length !== 1 ? 's' : ''}
                    {debouncedSearch && (
                      <span className="ml-1 sm:ml-2 text-muted-foreground">
                        for <span className="font-semibold text-foreground">"{debouncedSearch}"</span>
                      </span>
                    )}
                  </p>
                  {isSearching && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span>Searching...</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            {Object.values(groupedEvents)
              .sort((a, b) => {
                const typeOrder: Record<string, number> = 
                  type !== 'all' && type === 'online'
                    ? { online: 1, physical: 2 }
                    : type !== 'all' && type === 'physical'
                    ? { physical: 1, online: 2 }
                    : { physical: 1, online: 2 };
                
                const typeOrderA = typeOrder[a.type] || 999;
                const typeOrderB = typeOrder[b.type] || 999;
                
                if (typeOrderA !== typeOrderB) {
                  return typeOrderA - typeOrderB;
                }
                
                return (a.category || '').localeCompare(b.category || '');
              })
              .map((group, index) => (
                <div 
                  key={`${group.type}-${group.category}-${index}`} 
                  className="mb-8 sm:mb-10 lg:mb-12 scroll-mt-24"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b-2 border-primary/20">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold flex items-center gap-2 flex-wrap">
                      <span className="text-xl sm:text-2xl">{group.type === 'physical' ? '📍' : '🌐'}</span>
                      <span className="whitespace-nowrap">{group.type === 'physical' ? 'In-Person' : 'Online'}</span>
                      <span className="text-muted-foreground font-normal hidden sm:inline">-</span>
                      <span className="text-primary break-words">{group.category}</span>
                    </h2>
                    <span className="ml-0 sm:ml-auto px-2.5 sm:px-3 py-1 text-xs sm:text-sm font-semibold bg-primary/10 text-primary rounded-full whitespace-nowrap">
                      {group.events.length} event{group.events.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
                    {group.events.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </div>
                </div>
              ))}
        </>
      )}
      </div>
    </div>
  );
};
