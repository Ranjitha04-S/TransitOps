import { AlertCircle } from 'lucide-react';

const EmptyState = ({
  title = 'No Data Available',
  description = 'There is currently no telemetry records found matching this view.',
  icon: Icon = AlertCircle,
  className = '',
  actionButton
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center bg-surface border border-dashed border-border rounded-xl ${className}`}>
      <div className="p-3.5 rounded-full bg-surface-alt text-text-muted mb-4 border border-border/60">
        <Icon size={24} />
      </div>
      <h3 className="text-sm font-semibold text-text-primary mb-1">
        {title}
      </h3>
      <p className="text-xs text-text-muted max-w-sm mb-4">
        {description}
      </p>
      {actionButton}
    </div>
  );
};

export default EmptyState;
