import React, { createContext, useContext, useState } from 'react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

const UiContext = createContext(null);

export const useUI = () => {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error('useUI deve ser usado dentro de UiProvider');
  return ctx;
};

const MessageModal = ({ open, title, message, type = 'info', onClose }) => {
  if (!open) return null;

  const styles = {
    info: 'text-blue-700',
    success: 'text-green-700',
    warning: 'text-yellow-700',
    error: 'text-red-700'
  };

  const icons = {
    info: <Info className="w-6 h-6 text-blue-600" />,
    success: <CheckCircle className="w-6 h-6 text-green-600" />,
    warning: <AlertCircle className="w-6 h-6 text-yellow-600" />,
    error: <AlertCircle className="w-6 h-6 text-red-600" />
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-start gap-4 mb-4">
          <div className="flex-shrink-0">
            {icons[type]}
          </div>
          <div className={styles[type]}>
            <h2 className="text-lg font-medium text-gray-900">{title}</h2>
            {message && <p className="text-sm text-gray-600 mt-1">{message}</p>}
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export const UiProvider = ({ children }) => {
  const [modal, setModal] = useState({ open: false, title: '', message: '', type: 'info' });

  const showMessage = ({ title, message, type = 'info' }) => {
    setModal({ open: true, title, message, type });
  };

  const closeMessage = () => setModal((m) => ({ ...m, open: false }));

  return (
    <UiContext.Provider value={{ showMessage }}>
      {children}
      <MessageModal {...modal} onClose={closeMessage} />
    </UiContext.Provider>
  );
};











