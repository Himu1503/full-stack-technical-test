import { Link, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import { Button } from './ui/button';

export const Header = () => {
  const location = useLocation();

  return (
    <header className="border-b border-border/50 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-3 hover:opacity-80 transition-all hover:scale-105"
          >
            <Logo size="md" />
            <span className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              PulseEvents
            </span>
          </Link>
          <nav className="flex items-center gap-2">
            <Button
              asChild
              variant={location.pathname === '/' ? 'default' : 'ghost'}
              className="transition-all hover:scale-105"
            >
              <Link to="/">Home</Link>
            </Button>
            <Button
              asChild
              variant={location.pathname === '/events' ? 'default' : 'ghost'}
              className="transition-all hover:scale-105"
            >
              <Link to="/events">Events</Link>
            </Button>
            <Button
              asChild
              variant={location.pathname.startsWith('/admin') ? 'default' : 'ghost'}
              className="transition-all hover:scale-105"
            >
              <Link to="/admin">Admin</Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};

