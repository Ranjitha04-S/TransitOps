import Spinner from './Spinner';

const Button = ({
  children,
  type = 'button',
  onClick,
  disabled = false,
  loading = false,
  variant = 'primary', // 'primary', 'secondary', 'danger', 'outline'
  className = '',
  fullWidth = false,
  ...props
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-semibold text-sm rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer px-5 py-3 transform active:scale-[0.98]';
  
  const variants = {
    primary: 'bg-primary text-text-primary hover:bg-primary-hover shadow-lg shadow-primary/10',
    secondary: 'bg-secondary text-text-primary hover:bg-secondary-hover border border-border/50',
    danger: 'bg-danger text-text-primary hover:bg-danger/90 shadow-lg shadow-danger/10',
    outline: 'border border-border text-text-secondary hover:text-text-primary hover:bg-secondary/40'
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyle} ${variants[variant]} ${widthStyle} ${className}`}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <Spinner size="sm" />
          <span>Processing...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
