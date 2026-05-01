import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-[var(--card-bg)] flex items-center justify-center mb-6">
        <Icon size={36} className="text-[var(--text-muted)]" />
      </div>
      
      <h3 className="text-xl font-bold text-[var(--text-dark)] mb-2">
        {title}
      </h3>
      
      <p className="text-[var(--text-muted)] max-w-md mb-6">
        {description}
      </p>

      {action && (
        <button
          onClick={action.onClick}
          className="
            px-6 py-3 rounded-[var(--radius-btn)]
            bg-[var(--gold)] text-white font-semibold
            shadow-[var(--shadow-btn)] hover-lift
            transition-all
          "
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
