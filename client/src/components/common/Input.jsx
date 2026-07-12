import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  name,
  error,
  icon: Icon,
  required = false,
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <label className="text-xs font-semibold tracking-wider uppercase text-text-secondary flex items-center gap-1">
          {label}
          {required && <span className="text-primary">*</span>}
        </label>
      )}
      
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-text-muted pointer-events-none">
            <Icon size={18} />
          </div>
        )}
        
        <input
          type={inputType}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full bg-surface-alt border text-text-primary text-sm rounded-xl py-3.5 px-4 outline-none transition-all duration-200
            ${Icon ? 'pl-11' : ''} 
            ${isPassword ? 'pr-11' : ''} 
            ${error 
              ? 'border-danger/80 focus:border-danger focus:ring-1 focus:ring-danger/20' 
              : 'border-border focus:border-primary focus:ring-1 focus:ring-primary/20'
            }`}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 text-text-muted hover:text-text-primary focus:outline-none transition-colors duration-150 cursor-pointer"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {error && (
        <span className="text-[11px] text-danger font-medium tracking-wide mt-0.5 animate-pulse">
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;
