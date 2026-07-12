const Select = ({
  label,
  options = [],
  value,
  onChange,
  name,
  error,
  required = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label className="text-xs font-semibold tracking-wider uppercase text-text-secondary flex items-center gap-1">
          {label}
          {required && <span className="text-primary">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        <select
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          className={`w-full bg-surface-alt border text-text-primary text-sm rounded-xl py-3.5 px-4 outline-none appearance-none cursor-pointer transition-all duration-200
            ${error 
              ? 'border-danger/80 focus:border-danger focus:ring-1 focus:ring-danger/20' 
              : 'border-border focus:border-primary focus:ring-1 focus:ring-primary/20'
            }`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-background text-text-primary">
              {opt.label}
            </option>
          ))}
        </select>
        
        {/* Custom arrow indicator */}
        <div className="absolute right-4 pointer-events-none text-text-muted">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {error && (
        <span className="text-[11px] text-danger font-medium tracking-wide mt-0.5 animate-pulse">
          {error}
        </span>
      )}
    </div>
  );
};

export default Select;
