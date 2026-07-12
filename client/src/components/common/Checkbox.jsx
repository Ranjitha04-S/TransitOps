const Checkbox = ({
  label,
  checked,
  onChange,
  name,
  id,
  className = '',
  ...props
}) => {
  const checkboxId = id || name;

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="relative flex items-center">
        <input
          type="checkbox"
          id={checkboxId}
          name={name}
          checked={checked}
          onChange={onChange}
          className="peer w-4.5 h-4.5 bg-surface-alt border border-border rounded text-primary focus:ring-primary/20 focus:ring-offset-0 focus:outline-none transition-all duration-150 cursor-pointer appearance-none checked:bg-primary checked:border-primary"
          {...props}
        />
        
        {/* Checkmark Icon overlay */}
        <svg
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-text-primary pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity duration-150"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      {label && (
        <label
          htmlFor={checkboxId}
          className="text-xs font-medium text-text-secondary select-none cursor-pointer hover:text-text-primary transition-colors duration-150"
        >
          {label}
        </label>
      )}
    </div>
  );
};

export default Checkbox;
