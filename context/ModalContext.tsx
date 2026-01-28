/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';
import { ContactType } from '@/types';

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
