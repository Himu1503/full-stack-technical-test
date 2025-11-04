import { render, screen } from '@/test-utils';
import { Logo } from '../Logo';

describe('Logo Component', () => {
  it('should render SVG logo by default', () => {
    render(<Logo />);
    const svg = screen.getByLabelText('PulseEvents Logo');
    expect(svg).toBeInTheDocument();
    expect(svg.tagName).toBe('svg');
  });

  it('should render image when src prop is provided', () => {
    render(<Logo src="/assets/logo.png" />);
    const img = screen.getByAltText('PulseEvents Logo');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/assets/logo.png');
  });

  it('should apply correct size classes for small logo', () => {
    render(<Logo size="sm" />);
    const svg = screen.getByLabelText('PulseEvents Logo');
    expect(svg).toHaveClass('w-8', 'h-8');
  });

  it('should apply correct size classes for medium logo', () => {
    render(<Logo size="md" />);
    const svg = screen.getByLabelText('PulseEvents Logo');
    expect(svg).toHaveClass('w-12', 'h-12');
  });

  it('should apply correct size classes for large logo', () => {
    render(<Logo size="lg" />);
    const svg = screen.getByLabelText('PulseEvents Logo');
    expect(svg).toHaveClass('w-16', 'h-16');
  });

  it('should apply custom className', () => {
    render(<Logo className="custom-class" />);
    const svg = screen.getByLabelText('PulseEvents Logo');
    expect(svg).toHaveClass('custom-class');
  });
});

