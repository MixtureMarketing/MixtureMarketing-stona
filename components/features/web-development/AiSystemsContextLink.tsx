import React from 'react';
import { Link } from 'react-router-dom';
import Container from '../../common/Container';
import { isAiSectionEnabled } from '../../../config/flags';
import {
  AI_CONTEXT_LINK as LINK,
  AI_SECTION_PATH,
} from '../../../data/content/services/web-development/ai-section';

/**
 * Zdanie z linkiem do strony „Systemy AI i aplikacje” na /web-development/custom-app/
 * (MIX-1276). Przełącznik VITE_MM_AI_SECTION: wyłączony = null.
 */
const AiSystemsContextLink: React.FC = () => {
  if (!isAiSectionEnabled()) return null;
  return (
    <section aria-label="Aplikacje z elementami AI" className="bg-white pb-16 md:pb-20">
      <Container>
        <p className="max-w-3xl text-[15px] leading-relaxed text-gray-700">
          {LINK.text}{' '}
          <Link to={AI_SECTION_PATH} className="font-bold text-secondary hover:underline">
            {LINK.label}
          </Link>
          .
        </p>
      </Container>
    </section>
  );
};

export default AiSystemsContextLink;
