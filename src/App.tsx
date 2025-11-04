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
import { MarketingManagementPage } from '@/pages/MarketingManagementPage';
import { loadMarketingContent, MarketingBanner } from '@/lib/content';
import { logAction } from '@/lib/analytics';
import { BarChart3, FileText, Megaphone } from 'lucide-react';

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
      {enabledBanners.map((banner) => (
        <section
          key={banner.id}
          className="relative overflow-hidden"
          style={{
            background: banner.backgroundColor,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-transparent" />
          <div className="container mx-auto px-4 py-8 md:py-12 relative">
            <div className="max-w-6xl mx-auto">
              <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 p-8 md:p-10 rounded-2xl shadow-2xl backdrop-blur-md border border-white/20 bg-white/10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
                
                <div className="flex-1 text-center md:text-left space-y-3 relative z-10">
                  <div className="inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: banner.textColor }}>
                      Featured
                    </span>
                  </div>
                  <h2 
                    className="text-2xl md:text-4xl lg:text-5xl font-bold leading-tight drop-shadow-lg"
                    style={{ color: banner.textColor }}
                  >
                    {banner.title}
                  </h2>
                  <p 
                    className="text-base md:text-lg lg:text-xl opacity-95 font-medium"
                    style={{ color: banner.textColor }}
                  >
                    {banner.subtitle}
                  </p>
                  {banner.description && (
                    <p 
                      className="text-sm md:text-base opacity-85 hidden md:block max-w-2xl leading-relaxed"
                      style={{ color: banner.textColor }}
                    >
                      {banner.description}
                    </p>
                  )}
                </div>
                
                <div className="relative z-10 shrink-0">
                  <Button
                    asChild
                    size="lg"
                    className="transition-all hover:scale-110 shadow-2xl font-bold text-base px-8 py-6 rounded-xl hover:shadow-3xl"
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
                    <Link to={banner.ctaLink} className="flex items-center gap-2">
                      {banner.ctaText}
                      <span className="text-lg">→</span>
                    </Link>
                  </Button>
                </div>
              </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Megaphone className="h-5 w-5" />
                  Marketing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Manage marketing banners and event categories
                </p>
                <Button asChild>
                  <Link to="/admin/marketing">Go to Marketing</Link>
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
            <Route path="marketing" element={<MarketingManagementPage />} />
          </Route>
        </Routes>
      </Suspense>
      <Footer />
    </div>
  );
};

export default App;

