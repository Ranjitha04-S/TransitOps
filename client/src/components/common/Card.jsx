const Card = ({
  title,
  value,
  icon: Icon,
  trend,
  trendType = 'neutral', // 'positive' | 'negative' | 'neutral'
  className = '',
  loading = false,
  children
}) => {
  const trendColors = {
    positive: 'text-success bg-success/10',
    negative: 'text-danger bg-danger/10',
    neutral: 'text-text-muted bg-surface-alt'
  };

  return (
    <div className={`bg-surface border border-border p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 ${className}`}>
      {loading ? (
        <div className="animate-pulse flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="h-4 bg-surface-alt rounded w-24" />
            <div className="h-8 bg-surface-alt rounded-lg w-8" />
          </div>
          <div className="h-8 bg-surface-alt rounded w-32" />
        </div>
      ) : (
        <>
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold tracking-wider uppercase text-text-secondary">
              {title}
            </span>
            {Icon && (
              <div className="p-2.5 rounded-lg bg-surface-alt text-text-secondary border border-border/50">
                <Icon size={18} />
              </div>
            )}
          </div>
          
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-extrabold tracking-tight text-text-primary">
              {value}
            </span>
            {trend && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${trendColors[trendType]}`}>
                {trend}
              </span>
            )}
          </div>
          
          {children}
        </>
      )}
    </div>
  );
};

export default Card;
