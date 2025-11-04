import { Link, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import { Button } from './ui/button';

export const Header = () => {
  const location = useLocation();

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <Logo size="md" />
            <span className="text-2xl font-bold text-foreground">PulseEvents</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Button
              asChild
              variant={location.pathname === '/' ? 'default' : 'ghost'}
            >
              <Link to="/">Home</Link>
            </Button>
            <Button
              asChild
              variant={location.pathname === '/events' ? 'default' : 'ghost'}
            >
              <Link to="/events">Events</Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
};

