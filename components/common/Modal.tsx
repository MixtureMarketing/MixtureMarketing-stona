import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useFocusTrap } from '../../hooks/useFocusTrap';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  maxWidth?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  maxWidth = 'max-w-2xl',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useFocusTrap(modalRef, isOpen, onClose);

  useEffect(() => {
    if (isOpen) {
      previousFocus.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';

      const focusTimeout = setTimeout(() => {
        const focusableSelector =
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
        const focusable = modalRef.current?.querySelectorAll(focusableSelector);
        if (focusable && focusable.length > 0) (focusable[0] as HTMLElement).focus();
        else modalRef.current?.focus();
      }, 150);

      return () => {
        clearTimeout(focusTimeout);
        document.body.style.overflow = 'unset';
        if (previousFocus.current && typeof previousFocus.current.focus === 'function') {
          previousFocus.current.focus();
        }
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      <div
        className="absolute inset-0 bg-dark/40 backdrop-blur-md transition-opacity duration-500 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      ></div>

      <div
        ref={modalRef}
        className={`relative bg-white w-full ${maxWidth} rounded-[2.5rem] shadow-[0_25px_100px_-15px_rgba(33,50,97,0.3)] border border-white/20 overflow-hidden transform transition-all duration-500 animate-modal-in flex flex-col max-h-[95vh] z-10`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        tabIndex={-1}
      >
        <div className="flex justify-between items-center p-4 md:p-6 md:px-10 border-b border-gray-100 bg-white/50 backdrop-blur-sm sticky top-0 z-20">
          <div>
            {title && (
              <h3
                id="modal-title"
                className="text-xl md:text-2xl font-black text-dark tracking-tight"
              >
                {title}
              </h3>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-3 rounded-full hover:bg-gray-100 text-gray-600 hover:text-secondary transition-all duration-300 hover:rotate-90 active:scale-90"
            aria-label="Zamknij okno"
          >
            <X size={20} className="md:w-6 md:h-6" />
          </button>
        </div>

        <div className="p-4 md:p-8 lg:p-10 overflow-y-auto custom-scrollbar flex-grow">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
