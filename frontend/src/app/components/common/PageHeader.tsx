import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  breadcrumbs?: { label: string; href?: string }[];
}

export function PageHeader({ title, description, icon: Icon, action, breadcrumbs }: PageHeaderProps) {
  return (
    <div className="mb-6">
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] mb-4">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center gap-2">
              {crumb.href ? (
                <a 
                  href={crumb.href} 
                  className="hover:text-[var(--gold)] transition-colors"
                >
                  {crumb.label}
                </a>
              ) : (
                <span className="text-[var(--text-dark)] font-medium">{crumb.label}</span>
              )}
              {index < breadcrumbs.length - 1 && (
                <span className="text-[var(--text-muted)]">/</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Header Content */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex items-start gap-4">
          {Icon && (
            <div className="w-14 h-14 bg-gradient-gold rounded-[14px] flex items-center justify-center shadow-md flex-shrink-0">
              <Icon className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-black text-[var(--text-dark)] mb-2">
              {title}
            </h1>
            {description && (
              <p className="text-[var(--text-muted)] text-lg leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>

        {action && (
          <div className="self-start md:self-auto flex-shrink-0">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}
