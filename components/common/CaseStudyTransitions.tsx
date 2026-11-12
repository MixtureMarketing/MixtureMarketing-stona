import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { preloadRoute } from '@/config/routes';
import { isTransitionActive, runCaseStudyTransition } from '@/utils/caseStudyTransition';
import {
  caseStudyPath,
  findCardParts,
  isPlainPrimaryClick,
  isSameTabAnchor,
  isViewTransitionsEnabled,
  motionAllowed,
  supportsViewTransitions,
} from '@/utils/viewTransitions';
import './caseStudyTransitions.css';

/** Chunk i dane celu pobrane z wyprzedzeniem (najechanie, dotyk), ważne 10 s. */
const PRELOAD_TTL_MS = 10_000;
const preloads = new Map<string, { at: number; p: Promise<void> }>();
function preloadOnce(path: string): Promise<void> {
  const hit = preloads.get(path);
  if (hit && Date.now() - hit.at < PRELOAD_TTL_MS) return hit.p;
  const p = preloadRoute(path);
  preloads.set(path, { at: Date.now(), p });
  return p;
}

/** Link karty realizacji pod zdarzeniem albo null (ta sama allowlista dla kliknięcia i preloadu). */
function cardLink(e: Event): { a: HTMLAnchorElement; path: string } | null {
  if (!supportsViewTransitions(document) || !motionAllowed(window)) return null;
  const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
  if (!a || !isSameTabAnchor(a)) return null;
  const path = caseStudyPath(a.getAttribute('href'), window.location.origin);
  if (!path || path === window.location.pathname) return null;
  return { a, path };
}

/**
 * MIX-1308 (A1 + A2): klik w kartę realizacji (lista /portfolio/, „Wybrane realizacje”
 * na usługach, karty realizacji w „Powiązanych”) → zdjęcie karty rośnie w zdjęcie
 * realizacji, tytuł płynie w tytuł strony. Montowany w App tylko przy włączonym
 * przełączniku (`isViewTransitionsEnabled`). Nasłuch kliknięć w fazie capture, przed
 * onClick `<Link>`; każdy warunek niespełniony = nic nie robimy i link działa jak dziś.
 */
export default function CaseStudyTransitions() {
  const navigate = useNavigate();

  useEffect(() => {
    const onIntent = (e: Event) => {
      const hit = cardLink(e);
      if (hit && findCardParts(hit.a)) void preloadOnce(hit.path).catch(() => undefined);
    };
    const onClick = (e: MouseEvent) => {
      if (!isPlainPrimaryClick(e) || isTransitionActive()) return;
      const hit = cardLink(e);
      const parts = hit && findCardParts(hit.a);
      if (!hit || !parts) return;
      e.preventDefault();
      void runCaseStudyTransition({
        path: hit.path,
        parts,
        navigate: () => navigate(hit.path),
        // Dane z preloadu są jednorazowe (hook je zużywa), więc wpis znika po kliknięciu.
        preload: () => preloadOnce(hit.path).finally(() => preloads.delete(hit.path)),
        doc: document,
        win: window,
      });
    };
    document.addEventListener('click', onClick, true);
    document.addEventListener('pointerover', onIntent, true);
    document.addEventListener('pointerdown', onIntent, true);
    return () => {
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('pointerover', onIntent, true);
      document.removeEventListener('pointerdown', onIntent, true);
    };
  }, [navigate]);

  return null;
}

/**
 * Bramka przełącznika (App.tsx): wyłączony przełącznik albo prerender = nic się nie montuje.
 * Osobny komponent, żeby test mógł sprawdzić dokładnie to, co renderuje App.
 */
export function CaseStudyTransitionsGate({ disabled = false }: { disabled?: boolean }) {
  if (disabled || !isViewTransitionsEnabled()) return null;
  return <CaseStudyTransitions />;
}
