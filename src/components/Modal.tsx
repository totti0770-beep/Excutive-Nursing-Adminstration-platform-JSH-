import { X } from 'lucide-react';
import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, subtitle, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex p-5 items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="max-h-[80vh] w-full max-w-[480px] overflow-y-auto rounded-2xl border border-gold/15 bg-bg-secondary p-8 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        <button 
          onClick={onClose}
          className="float-left text-text-muted hover:text-red-500 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
        <div className="mb-1 text-[20px] font-bold">{title}</div>
        {subtitle && <div className="mb-4 text-sm text-text-secondary">{subtitle}</div>}
        
        {children}

        <button 
          onClick={onClose}
          className="mt-4 flex w-full justify-center rounded-full border border-gold/20 bg-transparent px-6 py-2.5 text-sm font-semibold text-text-secondary transition-colors hover:border-gold hover:text-gold"
        >
          إغلاق
        </button>
      </div>
    </div>
  );
}
