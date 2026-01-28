import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useMemo,
} from 'react';
import { ContactType } from '@/types';

interface ModalContextType {
  isModalOpen: boolean;
  modalType: ContactType;
  additionalData: Record<string, any> | undefined;
  openModal: (type?: ContactType, data?: Record<string, any>) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ContactType>('general');
  const [additionalData, setAdditionalData] = useState<Record<string, any> | undefined>(undefined);

  const openModal = useCallback((type: ContactType = 'general', data?: Record<string, any>) => {
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
