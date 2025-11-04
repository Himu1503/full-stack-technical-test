import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  src?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
};

export const Logo = ({ className, size = 'md', src }: LogoProps) => {
  if (src) {
    return (
      <img
        src={src}
        alt="PulseEvents Logo"
        className={cn(sizeClasses[size], className)}
      />
    );
  }

  return (
    <svg
      viewBox="0 0 120 120"
      className={cn(sizeClasses[size], className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="PulseEvents Logo"
    >
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.1" />
        </filter>
      </defs>
      
      <g filter="url(#shadow)">
        <rect x="8" y="12" width="72" height="88" rx="5" fill="#E0F2FE" stroke="#1E40AF" strokeWidth="2.5" />
        <rect x="8" y="12" width="72" height="28" rx="5" fill="#BFDBFE" stroke="#1E40AF" strokeWidth="2.5" />
        
        <circle cx="20" cy="26" r="3.5" fill="#1E40AF" />
        <circle cx="44" cy="26" r="3.5" fill="#1E40AF" />
        <circle cx="68" cy="26" r="3.5" fill="#1E40AF" />
        
        <rect x="14" y="48" width="14" height="14" rx="1.5" fill="#FCE7F3" stroke="#1E40AF" strokeWidth="1.5" />
        <rect x="31" y="48" width="14" height="14" rx="1.5" fill="#FCE7F3" stroke="#1E40AF" strokeWidth="1.5" />
        <rect x="48" y="48" width="14" height="14" rx="1.5" fill="#FCE7F3" stroke="#1E40AF" strokeWidth="1.5" />
        <rect x="65" y="48" width="14" height="14" rx="1.5" fill="#FCE7F3" stroke="#1E40AF" strokeWidth="1.5" />
        
        <rect x="14" y="65" width="14" height="14" rx="1.5" fill="#FCE7F3" stroke="#1E40AF" strokeWidth="1.5" />
        <rect x="31" y="65" width="14" height="14" rx="1.5" fill="#FCE7F3" stroke="#1E40AF" strokeWidth="1.5" />
        <rect x="48" y="65" width="14" height="14" rx="1.5" fill="#FCE7F3" stroke="#1E40AF" strokeWidth="1.5" />
        <rect x="65" y="65" width="14" height="14" rx="1.5" fill="#FCE7F3" stroke="#1E40AF" strokeWidth="1.5" />
        
        <path
          d="M 44 56 L 50 62 L 44 68 L 38 62 Z"
          fill="#FCD34D"
          stroke="#1E40AF"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="M 44 56 L 53 65 M 44 68 L 35 59"
          stroke="#FCD34D"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        
        <path
          d="M 85 88 L 92 88 L 92 95 L 85 95 Z"
          fill="#2DD4BF"
          stroke="#1E40AF"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path
          d="M 88.5 78 L 88.5 88 M 88.5 95 L 88.5 105 M 78 88.5 L 88 88.5 M 95 88.5 L 105 88.5"
          stroke="#1E40AF"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="88.5" cy="88.5" r="12" fill="#E0F2FE" stroke="#1E40AF" strokeWidth="2" />
        <circle cx="88.5" cy="88.5" r="2.5" fill="#1E40AF" />
        <line x1="88.5" y1="88.5" x2="82" y2="88.5" stroke="#1E40AF" strokeWidth="3" strokeLinecap="round" />
        <line x1="88.5" y1="88.5" x2="88.5" y2="81" stroke="#1E40AF" strokeWidth="2.5" strokeLinecap="round" />
      </g>
    </svg>
  );
};

