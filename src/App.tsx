import { Routes, Route } from 'react-router-dom';
import { Suspense } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PageLoader } from '@/components/Loader';
import { EventsPage } from '@/pages/EventsPage';
import { EventDetailPage } from '@/pages/EventDetailPage';

const HomePage = () => {
  return (
    <main className="flex-1">
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
            <Button asChild size="lg" className="text-lg px-8">
              <Link to="/events">Explore Events</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="p-6 rounded-lg border bg-card text-center space-y-3">
            <div className="text-3xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold">Easy Discovery</h3>
            <p className="text-muted-foreground">
              Find events that match your interests with powerful search and
              filtering options.
            </p>
          </div>

          <div className="p-6 rounded-lg border bg-card text-center space-y-3">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold">Quick Registration</h3>
            <p className="text-muted-foreground">
              Register for events in seconds with our streamlined registration
              process.
            </p>
          </div>

          <div className="p-6 rounded-lg border bg-card text-center space-y-3">
            <div className="text-3xl mb-4">📅</div>
            <h3 className="text-xl font-semibold">Stay Organized</h3>
            <p className="text-muted-foreground">
              Keep track of all your registered events and never miss an
              important date.
            </p>
          </div>
        </div>
      </section>

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

const App = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
        </Routes>
      </Suspense>
      <Footer />
    </div>
  );
};

export default App;

