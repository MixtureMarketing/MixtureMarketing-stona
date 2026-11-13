import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';
import { ContactType } from '@/types';
import { trackEvent } from '@/utils/analytics';
import { packageSlug } from '@/utils/ga4Package';

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
    // GA4 key event consultation_click: każde otwarcie modala (intent zostania klientem).
    // audit_request i calculator_submit wysyłają same przepływy (AuditWizard, usePublicCalculator);
    // MIX-1300: dawne gałęzie tutaj były martwe (żaden komponent nie otwierał modala z 'audit'
    // ani z wynikiem kalkulatora).
    const source = typeof window !== 'undefined' ? window.location.pathname : '';
    trackEvent('consultation_click', {
      contact_type: type,
      source,
      // MIX-1514: tytul pakietu z CMS jako slug ASCII; straznik GA4 sprawdza go dalej.
      package: packageSlug(data?.package),
    });
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
