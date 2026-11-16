import React from 'react';
import Button from '../../common/Button';
import { useModal } from '../../../context/ModalContext';
import { caseStudyModalData } from '../../../utils/caseStudyLead';

/**
 * Przycisk „Chcesz podobny projekt?” pod opisem realizacji (MIX-1855, za VITE_MM_CENNIK).
 * Otwiera ten sam formularz kontaktu co reszta strony, z nazwą realizacji w danych modala
 * (useContactForm → lead → temat zadania). Osobny komponent, żeby szablon bez przełącznika
 * nie wymagał ModalProvidera (useModal rzuca bez niego).
 */
const CaseStudySimilarCta: React.FC<{ title: string }> = ({ title }) => {
  const { openModal } = useModal();
  return (
    <div className="mt-16 flex flex-col items-center text-center gap-4">
      <p className="text-lg font-bold text-dark">Podoba Ci się ta realizacja?</p>
      <Button onClick={() => openModal('general', caseStudyModalData(title))}>
        Chcesz podobny projekt?
      </Button>
    </div>
  );
};

export default CaseStudySimilarCta;
