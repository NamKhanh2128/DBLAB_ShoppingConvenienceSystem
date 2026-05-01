import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

const sizes = {
  sm: 16,
  md: 24,
  lg: 40,
};

export function LoadingSpinner({ size = 'md', className = '', text }: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Loader2
        size={sizes[size]}
        className="animate-spin text-[var(--gold)]"
      />
      {text && (
        <p className="text-sm text-[var(--text-muted)]">{text}</p>
      )}
    </div>
  );
}

export function LoadingOverlay({ text }: { text?: string }) {
  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998] flex items-center justify-center animate-fade-in">
      <div className="bg-white rounded-[var(--radius-lg)] p-8 shadow-[var(--shadow-card)] animate-scale-in">
        <LoadingSpinner size="lg" text={text} />
      </div>
    </div>
  );
}

export function LoadingPage({ text = 'Đang tải...' }: { text?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
}
