import { Routes, Route, Link } from 'react-router-dom';
import { Suspense, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PageLoader } from '@/components/Loader';
import { EventsPage } from '@/pages/EventsPage';
import { EventDetailPage } from '@/pages/EventDetailPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { AuditLogsPage } from '@/pages/AuditLogsPage';
import { AdminPage } from '@/pages/AdminPage';
import { loadMarketingContent, MarketingBanner } from '@/lib/content';
import { logAction } from '@/lib/analytics';
import { BarChart3, FileText } from 'lucide-react';

const HomePage = () => {
  const [marketingContent, setMarketingContent] = useState<{
    banners: MarketingBanner[];
    promotionalContent: {
      headline: string;
      features: Array<{ title: string; description: string; icon: string }>;
    };
  } | null>(null);

  useEffect(() => {
    loadMarketingContent().then(content => {
      if (content) {
        setMarketingContent(content);
      }
    });
  }, []);

  useEffect(() => {
    logAction({
      action: 'view',
      resource: 'homepage',
    });
  }, []);

  const enabledBanners = marketingContent?.banners
    .filter(b => b.enabled)
    .sort((a, b) => a.priority - b.priority) || [];

  return (
    <main className="flex-1">
      {enabledBanners.map(banner => (
        <section
          key={banner.id}
          className="container mx-auto px-4 py-4 md:py-6"
          style={{
            background: banner.backgroundColor,
            color: banner.textColor,
          }}
        >
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 md:p-6 rounded-lg">
              <div className="flex-1 text-center md:text-left space-y-2">
                <h2 className="text-xl md:text-2xl font-bold leading-tight">{banner.title}</h2>
                <p className="text-sm md:text-base opacity-90">{banner.subtitle}</p>
                {banner.description && (
                  <p className="text-xs md:text-sm opacity-80 hidden md:block">{banner.description}</p>
                )}
              </div>
              <Button
                asChild
                size="default"
                className="shrink-0"
                style={{
                  backgroundColor: banner.textColor,
                  color: banner.backgroundColor,
                  borderColor: 'transparent',
                }}
                onClick={() => {
                  logAction({
                    action: 'click',
                    resource: 'banner',
                    resourceId: banner.id,
                  });
                }}
              >
                <Link to={banner.ctaLink}>{banner.ctaText}</Link>
              </Button>
            </div>
          </div>
        </section>
      ))}

      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col items-center text-center space-y-8 max-w-3xl mx-auto">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Welcome to{' '}
              <span className="text-primary">PulseEvents</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-medium">
              Manage Your Events with Ease
            </p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto pt-4">
              Discover, explore, and register for exciting events in one place.
              PulseEvents makes event management simple, intuitive, and seamless.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              asChild
              size="lg"
              className="text-lg px-8"
              onClick={() => {
                logAction({
                  action: 'click',
                  resource: 'button',
                  metadata: { text: 'Explore Events' },
                });
              }}
            >
              <Link to="/events">Explore Events</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {marketingContent?.promotionalContent && (
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              {marketingContent.promotionalContent.headline}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {marketingContent.promotionalContent.features.map((feature, index) => (
                <div key={index} className="p-6 rounded-lg border bg-card text-center space-y-3">
                  <div className="text-3xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of users who trust PulseEvents for their event
            management needs.
          </p>
          <Button asChild size="lg" className="text-lg px-8 mt-4">
            <Link to="/events">Browse All Events</Link>
          </Button>
        </div>
      </section>
    </main>
  );
};

const AdminHome = () => {
  useEffect(() => {
    logAction({
      action: 'view',
      resource: 'admin',
    });
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Welcome to Admin Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Use the navigation menu to access different admin features:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  View analytics and performance metrics with interactive charts
                </p>
                <Button asChild>
                  <Link to="/admin/analytics">Go to Analytics</Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Audit Logs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Track registrations and view detailed audit logs
                </p>
                <Button asChild>
                  <Link to="/admin/audit-logs">Go to Audit Logs</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const App = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/admin" element={<AdminPage />}>
            <Route index element={<AdminHome />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="audit-logs" element={<AuditLogsPage />} />
          </Route>
        </Routes>
      </Suspense>
      <Footer />
    </div>
  );
};

export default App;

