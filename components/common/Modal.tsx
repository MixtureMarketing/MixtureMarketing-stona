import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  maxWidth?: string;
}

/**
 * Modal oparty na natywnym <dialog> (Sprint B3 BC1):
 * - showModal() = focus trap, ESC, inert background, Top Layer (above z-index) za darmo
 * - backdrop styling via ::backdrop CSS pseudo-element
 * - eliminuje rozbieznosc z grupa A /abonament/* gdzie native <dialog> juz uzyte
 */
const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  maxWidth = 'max-w-2xl',
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    if (isOpen && !dlg.open) {
      dlg.showModal();
    }
    if (!isOpen && dlg.open) {
      dlg.close();
    }
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => {
        // Backdrop click (kliknieto poza inner container)
        if (e.target === dialogRef.current) onClose();
      }}
      aria-labelledby={title ? 'modal-title' : undefined}
      className="fixed inset-0 m-0 p-0 w-full h-full max-w-none max-h-none bg-transparent open:flex hidden items-center justify-center p-4 sm:p-6 backdrop:bg-dark/40 backdrop:backdrop-blur-md"
    >
      <div
        className={`relative bg-white w-full ${maxWidth} rounded-[2.5rem] shadow-[0_25px_100px_-15px_rgba(33,50,97,0.3)] border border-white/20 overflow-hidden transform transition-all duration-500 animate-modal-in flex flex-col max-h-[95vh] z-10`}
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
            type="button"
            onClick={onClose}
            className="p-3 rounded-full hover:bg-gray-100 text-gray-600 hover:text-secondary transition-all duration-300 hover:rotate-90 active:scale-90"
            aria-label="Zamknij okno"
          >
            <X size={20} className="md:w-6 md:h-6" aria-hidden="true" />
          </button>
        </div>

        <div className="p-4 md:p-8 lg:p-10 overflow-y-auto custom-scrollbar flex-grow">
          {children}
        </div>
      </div>
    </dialog>
  );
};

export default Modal;
