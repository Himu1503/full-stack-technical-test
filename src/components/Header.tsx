import { Link } from 'react-router-dom';
import { Logo } from './Logo';

export const Header = () => {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Logo size="md" />
          <span className="text-2xl font-bold text-foreground">PulseEvents</span>
        </Link>
      </div>
    </header>
  );
};

