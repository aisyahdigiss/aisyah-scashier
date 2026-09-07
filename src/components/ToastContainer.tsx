import React from 'react';
import { usePOS } from '../context/POSContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = usePOS();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:right-[430px] md:translate-x-0 z-50 flex flex-col gap-2 pointer-events-none max-w-md w-full px-4">
      {toasts.map((toast) => {
        const isError = toast.type === 'error';
        const isSuccess = toast.type === 'success';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            onClick={() => removeToast(toast.id)}
            className={`pointer-events-auto flex items-center gap-3 px-6 py-3.5 rounded-full shadow-[0px_8px_24px_rgba(0,0,0,0.12)] text-sm font-medium transition-all duration-300 transform animate-in fade-in slide-in-from-bottom-3 cursor-pointer ${
              isError
                ? 'bg-[#ffdad6] text-[#93000a] border border-[#ba1a1a]/20'
                : isSuccess
                ? 'bg-[#e6f4ea] text-[#137333] border border-[#137333]/20'
                : isWarning
                ? 'bg-[#fef7e0] text-[#b06000] border border-[#b06000]/20'
                : 'bg-[#334155] text-white border border-[#475569]'
            }`}
          >
            <span className="material-symbols-outlined text-[20px] shrink-0">
              {isError
                ? 'error'
                : isSuccess
                ? 'check_circle'
                : isWarning
                ? 'warning'
                : 'info'}
            </span>
            <span className="flex-1">{toast.message}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeToast(toast.id);
              }}
              className="opacity-70 hover:opacity-100 ml-1"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        );
      })}
    </div>
  );
};
