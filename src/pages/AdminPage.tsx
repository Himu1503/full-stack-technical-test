import { Outlet, Link, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, FileText, Shield, Megaphone } from 'lucide-react';
import { cn } from '@/lib/utils';

export const AdminPage = () => {
  const location = useLocation();

  const navItems = [
    {
      path: '/admin/analytics',
      label: 'Analytics',
      icon: BarChart3,
      description: 'View analytics and performance metrics',
    },
    {
      path: '/admin/audit-logs',
      label: 'Audit Logs',
      icon: FileText,
      description: 'Track registrations and user actions',
    },
    {
      path: '/admin/marketing',
      label: 'Marketing',
      icon: Megaphone,
      description: 'Manage banners and categories',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>
        <p className="text-muted-foreground">
          Manage analytics, audit logs, and system monitoring
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1">
          <Card className="sticky top-4 border-border/50 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">Navigation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
                return (
                  <Button
                    key={item.path}
                    asChild
                    variant={isActive ? 'default' : 'ghost'}
                    className={cn(
                      'w-full justify-start transition-all',
                      isActive 
                        ? 'bg-primary text-primary-foreground shadow-md' 
                        : 'hover:bg-accent hover:scale-105'
                    )}
                  >
                    <Link to={item.path}>
                      <Icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </Link>
                  </Button>
                );
              })}
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Analytics</span>
                <span className="font-medium">Available</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Audit Logs</span>
                <span className="font-medium">Active</span>
              </div>
            </CardContent>
          </Card>
        </aside>

        <main className="lg:col-span-3">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

