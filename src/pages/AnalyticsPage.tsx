import { useEffect, useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAnalyticsData, getAuditLogs, exportAuditLogs, clearAuditLogs, AuditLog } from '@/lib/analytics';
import { Button } from '@/components/ui/button';
import { Download, Trash2, RefreshCw, Calendar, Eye, UserPlus, Search, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { loadCategories } from '@/lib/content';
import { useEvents } from '@/hooks/useEvents';
import { Badge } from '@/components/ui/badge';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export const AnalyticsPage = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [categoryNames, setCategoryNames] = useState<Record<string, string>>({});
  const [categoryConfigs, setCategoryConfigs] = useState<Record<string, { icon: string; color: string }>>({});
  const { toast } = useToast();
  const { data: allEvents = [] } = useEvents({});

  const eventCategoryMap = useMemo(() => {
    const map = new Map<string, string>();
    allEvents.forEach(event => {
      if (event.id && event.categoryId) {
        map.set(event.id, event.categoryId);
      }
    });
    return map;
  }, [allEvents]);

  const analytics = useMemo(() => {
    return getAnalyticsData(eventCategoryMap);
  }, [auditLogs, eventCategoryMap]);

  useEffect(() => {
    const loadData = async () => {
      const logs = getAuditLogs();
      setAuditLogs(logs);

      const categories = await loadCategories();
      const namesMap: Record<string, string> = {};
      const configsMap: Record<string, { icon: string; color: string }> = {};
      categories.forEach(cat => {
        namesMap[cat.id] = cat.name;
        configsMap[cat.id] = {
          icon: cat.icon,
          color: cat.color,
        };
      });
      setCategoryNames(namesMap);
      setCategoryConfigs(configsMap);
    };

    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setAuditLogs(getAuditLogs());
    toast({
      title: 'Analytics Refreshed',
      description: 'Data has been updated',
    });
  };

  const handleExport = () => {
    const data = exportAuditLogs();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: 'Export Successful',
      description: 'Audit logs have been downloaded',
    });
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all audit logs? This action cannot be undone.')) {
      clearAuditLogs();
      setAuditLogs([]);
      toast({
        title: 'Logs Cleared',
        description: 'All audit logs have been cleared',
      });
    }
  };

  const categoryStats = useMemo(() => {
    const allCategoryIds = new Set([
      ...Object.keys(analytics.categoryViews),
      ...Object.keys(analytics.categoryRegistrations),
      ...Object.keys(analytics.categoryEventCounts),
    ]);

    return Array.from(allCategoryIds)
      .map(categoryId => ({
        id: categoryId,
        name: categoryNames[categoryId] || categoryId,
        icon: categoryConfigs[categoryId]?.icon || '📁',
        color: categoryConfigs[categoryId]?.color || '#6B7280',
        views: analytics.categoryViews[categoryId] || 0,
        registrations: analytics.categoryRegistrations[categoryId] || 0,
        eventCount: analytics.categoryEventCounts[categoryId] || 0,
        events: analytics.eventsByCategory[categoryId] || [],
      }))
      .sort((a, b) => (b.views + b.registrations) - (a.views + a.registrations));
  }, [analytics, categoryNames, categoryConfigs]);

  const categoryViewsData = {
    labels: categoryStats.map(cat => cat.name),
    datasets: [
      {
        label: 'Category Views',
        data: categoryStats.map(cat => cat.views),
        backgroundColor: categoryStats.map(cat => {
          const color = cat.color;
          const r = parseInt(color.slice(1, 3), 16);
          const g = parseInt(color.slice(3, 5), 16);
          const b = parseInt(color.slice(5, 7), 16);
          return `rgba(${r}, ${g}, ${b}, 0.8)`;
        }),
        borderColor: categoryStats.map(cat => cat.color),
        borderWidth: 1,
      },
    ],
  };

  const categoryRegistrationsData = {
    labels: categoryStats.map(cat => cat.name),
    datasets: [
      {
        label: 'Registrations',
        data: categoryStats.map(cat => cat.registrations),
        backgroundColor: categoryStats.map(cat => {
          const color = cat.color;
          const r = parseInt(color.slice(1, 3), 16);
          const g = parseInt(color.slice(3, 5), 16);
          const b = parseInt(color.slice(5, 7), 16);
          return `rgba(${r}, ${g}, ${b}, 0.8)`;
        }),
        borderColor: categoryStats.map(cat => cat.color),
        borderWidth: 1,
      },
    ],
  };

  const categoryComparisonData = {
    labels: categoryStats.map(cat => cat.name),
    datasets: [
      {
        label: 'Views',
        data: categoryStats.map(cat => cat.views),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
      {
        label: 'Registrations',
        data: categoryStats.map(cat => cat.registrations),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
      },
    ],
  };

  const popularEventsData = {
    labels: analytics.popularEvents.slice(0, 5).map(e => `Event ${e.eventId.slice(0, 8)}`),
    datasets: [
      {
        label: 'Views',
        data: analytics.popularEvents.slice(0, 5).map(e => e.views),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
      {
        label: 'Registrations',
        data: analytics.popularEvents.slice(0, 5).map(e => e.registrations),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
      },
    ],
  };

  const actionDistributionData = {
    labels: ['Views', 'Registrations', 'Searches'],
    datasets: [
      {
        data: [
          analytics.totalViews,
          analytics.totalRegistrations,
          analytics.totalSearches,
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(139, 92, 246, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const recentLogs = auditLogs.slice(-20).reverse();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics & Audit Logs</h1>
          <p className="text-muted-foreground mt-2">
            Track user interactions and event performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={handleClear}>
            <Trash2 className="w-4 h-4 mr-2" />
            Clear
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalViews}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Registrations</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalRegistrations}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Searches</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalSearches}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Audit Logs</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{auditLogs.length}</div>
            <p className="text-xs text-muted-foreground">Total entries</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Analytics Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <TrendingUp className="h-6 w-6" />
          Analytics by Category
        </h2>
        
        {categoryStats.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {categoryStats.map(category => (
                <Card key={category.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span>{category.icon}</span>
                      {category.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Views</span>
                      <Badge variant="secondary">{category.views}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Registrations</span>
                      <Badge variant="secondary">{category.registrations}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Events</span>
                      <Badge variant="outline">{category.eventCount}</Badge>
                    </div>
                    {category.events.length > 0 && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-muted-foreground mb-2">Top Event</p>
                        <p className="text-sm font-medium truncate">
                          {category.events[0]?.eventId.slice(0, 8)}...
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {category.events[0]?.registrations || 0} registrations
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Category Views</CardTitle>
                </CardHeader>
                <CardContent>
                  <Bar
                    data={categoryViewsData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                    }}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Category Registrations</CardTitle>
                </CardHeader>
                <CardContent>
                  <Bar
                    data={categoryRegistrationsData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                    }}
                  />
                </CardContent>
              </Card>
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Category Comparison: Views vs Registrations</CardTitle>
              </CardHeader>
              <CardContent>
                <Bar
                  data={categoryComparisonData}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                    },
                  }}
                />
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No category data available yet</p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Action Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <Doughnut
              data={actionDistributionData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                },
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Popular Events</CardTitle>
          </CardHeader>
          <CardContent>
            <Bar
              data={popularEventsData}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
              }}
            />
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Top Search Terms</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analytics.searchTerms.length > 0 ? (
              analytics.searchTerms.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded bg-muted">
                  <span className="font-medium">{item.term}</span>
                  <span className="text-sm text-muted-foreground">{item.count} searches</span>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">No search data available</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Audit Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Timestamp</th>
                  <th className="text-left p-2">Action</th>
                  <th className="text-left p-2">Resource</th>
                  <th className="text-left p-2">ID</th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.length > 0 ? (
                  recentLogs.map(log => (
                    <tr key={log.id} className="border-b">
                      <td className="p-2 text-muted-foreground">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="p-2">
                        <span className="px-2 py-1 rounded bg-primary/10 text-primary text-xs">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-2">{log.resource}</td>
                      <td className="p-2 text-muted-foreground font-mono text-xs">
                        {log.resourceId?.slice(0, 8) || '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-muted-foreground">
                      No audit logs available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

