/**
 * Analytics and Audit Log System
 * 
 * This system tracks user interactions and event registrations
 * for analytics and audit purposes. Data is stored in localStorage
 * and can be extended to send to an analytics service.
 */

export interface AuditLog {
  id: string;
  timestamp: string;
  action: 'view' | 'register' | 'search' | 'filter' | 'click';
  resource: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  userId?: string;
}

export interface AnalyticsData {
  totalViews: number;
  totalRegistrations: number;
  totalSearches: number;
  categoryViews: Record<string, number>;
  categoryRegistrations: Record<string, number>;
  categoryEventCounts: Record<string, number>;
  eventViews: Record<string, number>;
  registrationCounts: Record<string, number>;
  popularEvents: Array<{ eventId: string; views: number; registrations: number }>;
  eventsByCategory: Record<string, Array<{ eventId: string; views: number; registrations: number }>>;
  searchTerms: Array<{ term: string; count: number }>;
  dateRange: {
    start: string;
    end: string;
  };
}

const STORAGE_KEY = 'pulse_events_audit_logs';
const MAX_LOGS = 1000;

export const logAction = (log: Omit<AuditLog, 'id' | 'timestamp'>): void => {
  try {
    const logs = getAuditLogs();
    const newLog: AuditLog = {
      ...log,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };

    logs.push(newLog);

    // Keep only the most recent logs
    if (logs.length > MAX_LOGS) {
      logs.shift();
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  } catch (error) {
    console.error('Error logging action:', error);
  }
};

export const getAuditLogs = (): AuditLog[] => {
  try {
    const logsJson = localStorage.getItem(STORAGE_KEY);
    if (!logsJson) {
      return [];
    }
    return JSON.parse(logsJson) as AuditLog[];
  } catch (error) {
    console.error('Error reading audit logs:', error);
    return [];
  }
};

export const getAnalyticsData = (eventCategoryMap?: Map<string, string>): AnalyticsData => {
  const logs = getAuditLogs();
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const recentLogs = logs.filter(
    log => new Date(log.timestamp) >= thirtyDaysAgo
  );

  const categoryViews: Record<string, number> = {};
  const categoryRegistrations: Record<string, number> = {};
  const categoryEventCounts: Record<string, Set<string>> = {};
  const eventViews: Record<string, number> = {};
  const registrationCounts: Record<string, number> = {};
  const searchTerms: Record<string, number> = {};
  const eventsByCategory: Record<string, Array<{ eventId: string; views: number; registrations: number }>> = {};

  let totalViews = 0;
  let totalRegistrations = 0;
  let totalSearches = 0;

  recentLogs.forEach(log => {
    if (log.action === 'view') {
      totalViews++;
      if (log.resource === 'event' && log.resourceId) {
        eventViews[log.resourceId] = (eventViews[log.resourceId] || 0) + 1;
        
        // Track category views via events
        if (eventCategoryMap && log.resourceId) {
          const categoryId = eventCategoryMap.get(log.resourceId);
          if (categoryId) {
            categoryViews[categoryId] = (categoryViews[categoryId] || 0) + 1;
            if (!categoryEventCounts[categoryId]) {
              categoryEventCounts[categoryId] = new Set();
            }
            categoryEventCounts[categoryId].add(log.resourceId);
          }
        }
      } else if (log.resource === 'category' && log.resourceId) {
        categoryViews[log.resourceId] = (categoryViews[log.resourceId] || 0) + 1;
      }
    } else if (log.action === 'register') {
      totalRegistrations++;
      if (log.resourceId) {
        registrationCounts[log.resourceId] = (registrationCounts[log.resourceId] || 0) + 1;
        
        // Track category registrations via events
        if (eventCategoryMap && log.resourceId) {
          const categoryId = eventCategoryMap.get(log.resourceId);
          if (categoryId) {
            categoryRegistrations[categoryId] = (categoryRegistrations[categoryId] || 0) + 1;
          }
        }
      }
    } else if (log.action === 'search') {
      totalSearches++;
      const term = log.metadata?.searchTerm as string;
      if (term) {
        searchTerms[term] = (searchTerms[term] || 0) + 1;
      }
    }
  });

  const popularEvents = Object.keys(eventViews).map(eventId => ({
    eventId,
    views: eventViews[eventId],
    registrations: registrationCounts[eventId] || 0,
  })).sort((a, b) => b.views - a.views).slice(0, 10);

  // Group events by category
  if (eventCategoryMap) {
    Object.keys(eventViews).forEach(eventId => {
      const categoryId = eventCategoryMap.get(eventId);
      if (categoryId) {
        if (!eventsByCategory[categoryId]) {
          eventsByCategory[categoryId] = [];
        }
        eventsByCategory[categoryId].push({
          eventId,
          views: eventViews[eventId],
          registrations: registrationCounts[eventId] || 0,
        });
      }
    });

    // Sort events within each category
    Object.keys(eventsByCategory).forEach(categoryId => {
      eventsByCategory[categoryId].sort((a, b) => b.views - a.views);
    });
  }

  // Convert Set to count
  const categoryEventCountsFinal: Record<string, number> = {};
  Object.keys(categoryEventCounts).forEach(categoryId => {
    categoryEventCountsFinal[categoryId] = categoryEventCounts[categoryId].size;
  });

  const searchTermsArray = Object.entries(searchTerms)
    .map(([term, count]) => ({ term, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalViews,
    totalRegistrations,
    totalSearches,
    categoryViews,
    categoryRegistrations,
    categoryEventCounts: categoryEventCountsFinal,
    eventViews,
    registrationCounts,
    popularEvents,
    eventsByCategory,
    searchTerms: searchTermsArray,
    dateRange: {
      start: thirtyDaysAgo.toISOString(),
      end: now.toISOString(),
    },
  };
};

export const clearAuditLogs = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing audit logs:', error);
  }
};

export const exportAuditLogs = (): string => {
  const logs = getAuditLogs();
  return JSON.stringify(logs, null, 2);
};

export const exportAuditLogsToCSV = (): string => {
  const logs = getAuditLogs();
  
  if (logs.length === 0) {
    return 'No data available';
  }

  // CSV header
  const headers = ['Timestamp', 'Action', 'Resource', 'Resource ID', 'Attendee Name', 'Attendee Email', 'Registration ID', 'Search Term', 'Metadata'];
  
  // CSV rows
  const rows = logs.map(log => {
    const timestamp = new Date(log.timestamp).toLocaleString();
    const action = log.action;
    const resource = log.resource || '';
    const resourceId = log.resourceId || '';
    const attendeeName = (log.metadata?.attendeeName as string) || '';
    const attendeeEmail = (log.metadata?.attendeeEmail as string) || '';
    const registrationId = (log.metadata?.registrationId as string) || '';
    const searchTerm = (log.metadata?.searchTerm as string) || '';
    const metadata = log.metadata ? JSON.stringify(log.metadata) : '';
    
    // Escape CSV values (handle commas, quotes, newlines)
    const escapeCSV = (value: string): string => {
      if (!value) return '';
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };
    
    return [
      escapeCSV(timestamp),
      escapeCSV(action),
      escapeCSV(resource),
      escapeCSV(resourceId),
      escapeCSV(attendeeName),
      escapeCSV(attendeeEmail),
      escapeCSV(registrationId),
      escapeCSV(searchTerm),
      escapeCSV(metadata),
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
};

export const exportRegistrationsToCSV = (logs: AuditLog[], eventMap: Map<string, string>): string => {
  const registrationLogs = logs.filter(log => log.action === 'register');
  
  if (registrationLogs.length === 0) {
    return 'No registration data available';
  }

  const headers = ['Timestamp', 'Event ID', 'Event Title', 'Attendee Name', 'Attendee Email', 'Registration ID'];
  
  const escapeCSV = (value: string): string => {
    if (!value) return '';
    const stringValue = String(value);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  const rows = registrationLogs.map(log => {
    const timestamp = new Date(log.timestamp).toLocaleString();
    const eventId = log.resourceId || '';
    const eventTitle = eventMap.get(eventId) || 'Unknown Event';
    const attendeeName = (log.metadata?.attendeeName as string) || '';
    const attendeeEmail = (log.metadata?.attendeeEmail as string) || '';
    const registrationId = (log.metadata?.registrationId as string) || '';
    
    return [
      escapeCSV(timestamp),
      escapeCSV(eventId),
      escapeCSV(eventTitle),
      escapeCSV(attendeeName),
      escapeCSV(attendeeEmail),
      escapeCSV(registrationId),
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
};

