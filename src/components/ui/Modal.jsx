import { X } from 'lucide-react';
import { useEffect } from 'react';

// Reusable modal wrapper. Used on Products, Alerts, and Reports.
// size: 'sm' | 'md' | 'lg'
const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  // Close on Escape key, clean up listener when modal closes
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const SIZE = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' };

  return (
    // Fixed overlay covers the whole screen. z-50 sits above the sidebar's z-30.
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      {/* Clicking the dark backdrop closes the modal */}
      <div className='absolute inset-0 bg-black/50' onClick={onClose} />

      {/* The white card. relative so the X button positions against it. */}
      <div
        className={`relative w-full ${SIZE[size]} card
                    max-h-[90vh] overflow-y-auto thin-scrollbar`}
        style={{ boxShadow: 'var(--shadow-modal)' }}
      >
        {/* Sticky header so the title stays visible when the form scrolls */}
        <div
          className='flex items-center justify-between px-5 py-4
                        border-b border-border sticky top-0 bg-surface z-10'
        >
          <h2 className='text-base font-semibold text-text-heading'>{title}</h2>
          <button
            onClick={onClose}
            className='p-1.5 rounded-lg text-text-muted hover:bg-hover
                       transition-colors'
          >
            <X size={18} />
          </button>
        </div>

        <div className='p-5'>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
