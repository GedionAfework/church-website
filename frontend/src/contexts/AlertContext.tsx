import React, { createContext, useContext, useState, useCallback } from 'react';
import AlertModal, { type AlertOptions } from '../components/AlertModal';

interface AlertContextType {
  showAlert: (options: AlertOptions) => void;
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
  confirm: (message: string, onConfirm: () => void, title?: string) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alert, setAlert] = useState<AlertOptions | null>(null);

  const showAlert = useCallback((options: AlertOptions) => {
    setAlert({
      ...options,
      autoClose: options.autoClose !== undefined ? options.autoClose : options.type !== 'confirm',
    });
  }, []);

  const showSuccess = useCallback((message: string, title?: string) => {
    showAlert({ message, title, type: 'success' });
  }, [showAlert]);

  const showError = useCallback((message: string, title?: string) => {
    showAlert({ message, title, type: 'error' });
  }, [showAlert]);

  const showWarning = useCallback((message: string, title?: string) => {
    showAlert({ message, title, type: 'warning' });
  }, [showAlert]);

  const showInfo = useCallback((message: string, title?: string) => {
    showAlert({ message, title, type: 'info' });
  }, [showAlert]);

  const confirm = useCallback((message: string, onConfirm: () => void, title?: string) => {
    showAlert({
      message,
      title,
      type: 'confirm',
      onConfirm,
      autoClose: false,
    });
  }, [showAlert]);

  const closeAlert = useCallback(() => {
    setAlert(null);
  }, []);

  return (
    <AlertContext.Provider
      value={{
        showAlert,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        confirm,
      }}
    >
      {children}
      <AlertModal alert={alert} onClose={closeAlert} />
    </AlertContext.Provider>
  );
};

export const useAlert = (): AlertContextType => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

