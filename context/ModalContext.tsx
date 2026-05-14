import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';
import { ContactType } from '@/types';
import { trackEvent } from '@/utils/analytics';

interface ModalContextType {
  isModalOpen: boolean;
  modalType: ContactType;
  additionalData: Record<string, unknown> | undefined;
  openModal: (type?: ContactType, data?: Record<string, unknown>) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ContactType>('general');
  const [additionalData, setAdditionalData] = useState<Record<string, unknown> | undefined>(
    undefined,
  );

  const openModal = useCallback((type: ContactType = 'general', data?: Record<string, unknown>) => {
    setModalType(type);
    setAdditionalData(data);
    setIsModalOpen(true);
    // GA4 key events:
    // - consultation_click: zawsze (intent zostania klientem)
    // - audit_request: gdy uzytkownik prosi o audyt (typ 'audit')
    // - calculator_submit: gdy modal otwierany z wynikiem kalkulatora w data
    const source = typeof window !== 'undefined' ? window.location.pathname : '';
    trackEvent('consultation_click', {
      contact_type: type,
      source,
      package: data?.package,
    });
    if (type === 'audit') {
      trackEvent('audit_request', {
        source,
        specific_type: data?.specificType,
      });
    }
    if (
      data &&
      ('calculator_result' in data || 'estimatedPrice' in data || 'projectType' in data)
    ) {
      trackEvent('calculator_submit', {
        source,
        contact_type: type,
        estimated_price: data?.estimatedPrice,
        project_type: data?.projectType,
      });
    }
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setAdditionalData(undefined);
  }, []);

  const value = useMemo(
    () => ({
      isModalOpen,
      modalType,
      additionalData,
      openModal,
      closeModal,
    }),
    [isModalOpen, modalType, additionalData, openModal, closeModal],
  );

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};
