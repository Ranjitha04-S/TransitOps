import { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({
  isOpen = false,
  onClose,
  title,
  children,
  className = '',
}) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-secondary/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className={`relative bg-surface border border-border w-full max-w-lg rounded-2xl shadow-xl z-10 overflow-hidden transform transition-all duration-300 animate-zoomIn ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/80 bg-surface-alt/20">
          <h2 className="text-sm font-bold uppercase tracking-wider text-text-primary">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-text-secondary hover:bg-surface-alt/75 hover:text-text-primary transition-colors cursor-pointer"
            aria-label="Close Modal"
          >
            <X size={16} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
