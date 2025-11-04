import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAuditLogs, exportAuditLogs, exportAuditLogsToCSV, exportRegistrationsToCSV, clearAuditLogs, AuditLog } from '@/lib/analytics';
import { Download, Trash2, RefreshCw, Filter, Search, Calendar, User, Mail, Phone, FileDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { useEvents } from '@/hooks/useEvents';
import { Badge } from '@/components/ui/badge';

interface RegistrationLog {
  id: string;
  timestamp: string;
  eventId: string;
  eventTitle?: string;
  attendeeName?: string;
  attendeeEmail?: string;
  registrationId?: string;
}

export const AuditLogsPage = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');
  const { toast } = useToast();
  const { data: allEvents = [] } = useEvents({});

  useEffect(() => {
    const loadLogs = () => {
      const logs = getAuditLogs();
      setAuditLogs(logs);
    };

    loadLogs();
    const interval = setInterval(loadLogs, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const eventMap = useMemo(() => {
    const map = new Map<string, string>();
    allEvents.forEach(event => {
      map.set(event.id, event.title);
    });
    return map;
  }, [allEvents]);

  const registrationLogs = useMemo(() => {
    const registrations: RegistrationLog[] = [];
    
    auditLogs.forEach(log => {
      if (log.action === 'register' && log.resourceId) {
        const eventTitle = eventMap.get(log.resourceId) || 'Unknown Event';
        registrations.push({
          id: log.id,
          timestamp: log.timestamp,
          eventId: log.resourceId,
          eventTitle,
          attendeeName: log.metadata?.attendeeName as string | undefined,
          attendeeEmail: log.metadata?.attendeeEmail as string | undefined,
          registrationId: log.metadata?.registrationId as string | undefined,
        });
      }
    });

    return registrations.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [auditLogs, eventMap]);

  const filteredLogs = useMemo(() => {
    let filtered = auditLogs;

    if (filterAction !== 'all') {
      filtered = filtered.filter(log => log.action === filterAction);
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(log => {
        const eventTitle = log.resourceId ? eventMap.get(log.resourceId) : '';
        const attendeeName = log.metadata?.attendeeName as string | undefined;
        const attendeeEmail = log.metadata?.attendeeEmail as string | undefined;
        
        return (
          log.resource?.toLowerCase().includes(searchLower) ||
          log.resourceId?.toLowerCase().includes(searchLower) ||
          eventTitle?.toLowerCase().includes(searchLower) ||
          attendeeName?.toLowerCase().includes(searchLower) ||
          attendeeEmail?.toLowerCase().includes(searchLower)
        );
      });
    }

    return filtered.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [auditLogs, searchTerm, filterAction, eventMap]);

  const registrationStats = useMemo(() => {
    const stats = new Map<string, { count: number; eventTitle: string }>();
    
    registrationLogs.forEach(log => {
      const existing = stats.get(log.eventId) || { count: 0, eventTitle: log.eventTitle || 'Unknown' };
      stats.set(log.eventId, {
        count: existing.count + 1,
        eventTitle: existing.eventTitle,
      });
    });

    return Array.from(stats.entries())
      .map(([eventId, data]) => ({ eventId, ...data }))
      .sort((a, b) => b.count - a.count);
  }, [registrationLogs]);

  const handleRefresh = () => {
    const logs = getAuditLogs();
    setAuditLogs(logs);
    toast({
      title: 'Logs Refreshed',
      description: 'Audit logs have been updated',
    });
  };

  const handleExport = (format: 'json' | 'csv' = 'json') => {
    let data: string;
    let filename: string;
    let mimeType: string;

    if (format === 'csv') {
      data = exportAuditLogsToCSV();
      filename = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      mimeType = 'text/csv;charset=utf-8;';
    } else {
      data = exportAuditLogs();
      filename = `audit-logs-${new Date().toISOString()}.json`;
      mimeType = 'application/json';
    }

    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: 'Export Successful',
      description: `Audit logs exported as ${format.toUpperCase()}`,
    });
  };

  const handleExportRegistrations = () => {
    const data = exportRegistrationsToCSV(auditLogs, eventMap);
    const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `registrations-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: 'Export Successful',
      description: 'Registration logs exported as CSV',
    });
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all audit logs? This action cannot be undone.')) {
      clearAuditLogs();
      setAuditLogs([]);
      toast({
        title: 'Logs Cleared',
        description: 'All audit logs have been cleared',
        variant: 'destructive',
      });
    }
  };

  const actionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    auditLogs.forEach(log => {
      counts[log.action] = (counts[log.action] || 0) + 1;
    });
    return counts;
  }, [auditLogs]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Audit Logs</h1>
          <p className="text-muted-foreground mt-2">
            Track all user interactions and event registrations
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => handleExport('json')}>
            <Download className="w-4 h-4 mr-2" />
            Export JSON
          </Button>
          <Button variant="outline" onClick={() => handleExport('csv')}>
            <FileDown className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={handleExportRegistrations}>
            <FileDown className="w-4 h-4 mr-2" />
            Export Registrations CSV
          </Button>
          <Button variant="outline" onClick={handleClear}>
            <Trash2 className="w-4 h-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>

      {/* Registration Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{registrationLogs.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{registrationStats.length}</div>
            <p className="text-xs text-muted-foreground">With registrations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
            <Filter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{auditLogs.length}</div>
            <p className="text-xs text-muted-foreground">All actions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Registrations</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {registrationLogs.filter(log => {
                const logDate = new Date(log.timestamp);
                const today = new Date();
                return logDate.toDateString() === today.toDateString();
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>
      </div>

      {/* Registration Stats by Event */}
      {registrationStats.length > 0 && (
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Registrations by Event</CardTitle>
            <Button variant="outline" size="sm" onClick={handleExportRegistrations}>
              <FileDown className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {registrationStats.map(stat => (
                <div key={stat.eventId} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex-1">
                    <p className="font-medium">{stat.eventTitle}</p>
                    <p className="text-sm text-muted-foreground font-mono">
                      {stat.eventId.slice(0, 8)}...
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    {stat.count} registration{stat.count !== 1 ? 's' : ''}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Search */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Filter Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by event, attendee, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Filter by Action</label>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={filterAction === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterAction('all')}
                >
                  All ({auditLogs.length})
                </Button>
                <Button
                  variant={filterAction === 'register' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterAction('register')}
                >
                  Registrations ({actionCounts.register || 0})
                </Button>
                <Button
                  variant={filterAction === 'view' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterAction('view')}
                >
                  Views ({actionCounts.view || 0})
                </Button>
                <Button
                  variant={filterAction === 'search' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterAction('search')}
                >
                  Searches ({actionCounts.search || 0})
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Registration Logs Table */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Registration Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {registrationLogs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Timestamp</th>
                    <th className="text-left p-3">Event</th>
                    <th className="text-left p-3">Attendee</th>
                    <th className="text-left p-3">Email</th>
                    <th className="text-left p-3">Registration ID</th>
                  </tr>
                </thead>
                <tbody>
                  {registrationLogs.map(log => (
                    <tr key={log.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 text-muted-foreground">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="p-3">
                        <div>
                          <p className="font-medium">{log.eventTitle}</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {log.eventId.slice(0, 8)}...
                          </p>
                        </div>
                      </td>
                      <td className="p-3">
                        {log.attendeeName ? (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{log.attendeeName}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-3">
                        {log.attendeeEmail ? (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs">{log.attendeeEmail}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-3">
                        {log.registrationId ? (
                          <span className="font-mono text-xs text-muted-foreground">
                            {log.registrationId.slice(0, 12)}...
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No registration logs found</p>
              <p className="text-sm text-muted-foreground mt-2">
                Registration logs will appear here once users start registering for events
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Audit Logs */}
      <Card>
        <CardHeader>
          <CardTitle>All Audit Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredLogs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Timestamp</th>
                    <th className="text-left p-3">Action</th>
                    <th className="text-left p-3">Resource</th>
                    <th className="text-left p-3">Resource ID</th>
                    <th className="text-left p-3">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.slice(0, 100).map(log => {
                    const eventTitle = log.resourceId ? eventMap.get(log.resourceId) : null;
                    return (
                      <tr key={log.id} className="border-b hover:bg-muted/50">
                        <td className="p-3 text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="p-3">
                          <Badge
                            variant={
                              log.action === 'register'
                                ? 'default'
                                : log.action === 'view'
                                ? 'secondary'
                                : 'outline'
                            }
                          >
                            {log.action}
                          </Badge>
                        </td>
                        <td className="p-3">{log.resource}</td>
                        <td className="p-3">
                          <div>
                            {eventTitle && (
                              <p className="font-medium text-xs">{eventTitle}</p>
                            )}
                            <p className="text-xs text-muted-foreground font-mono">
                              {log.resourceId?.slice(0, 8) || '-'}...
                            </p>
                          </div>
                        </td>
                        <td className="p-3">
                          {log.metadata && Object.keys(log.metadata).length > 0 ? (
                            <div className="text-xs text-muted-foreground">
                              {Object.entries(log.metadata)
                                .slice(0, 2)
                                .map(([key, value]) => (
                                  <div key={key}>
                                    <span className="font-medium">{key}:</span> {String(value)}
                                  </div>
                                ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredLogs.length > 100 && (
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  Showing first 100 of {filteredLogs.length} logs
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No logs found</p>
              {searchTerm && (
                <p className="text-sm text-muted-foreground mt-2">
                  Try adjusting your search or filter criteria
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

