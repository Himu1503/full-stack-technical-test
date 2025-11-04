import { Link } from 'react-router-dom';
import { Logo } from './Logo';

export const Footer = () => {
  return (
    <footer className="border-t bg-background mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Logo size="sm" />
              <span className="text-lg font-bold">PulseEvents</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your trusted platform for discovering and managing events.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-foreground">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-muted-foreground hover:text-foreground">
                  Browse Events
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold">About</h3>
            <p className="text-sm text-muted-foreground">
              PulseEvents helps you discover and register for amazing events
              happening around you.
            </p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} PulseEvents. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

