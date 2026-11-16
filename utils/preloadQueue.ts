/** Kolejka doczytywania filmów portfolio (MIX-1873, decyzja Jakuba w MIX-1831). */

/** Najwyżej tyle filmów doczytuje się naraz (decyzja Jakuba: kolejno, najwyżej 2). */
export const MAX_PARALLEL_PRELOADS = 2;

type Job = (done: () => void) => void;

/**
 * Kolejka doczytywania: zadania startują w kolejności zgłoszeń, najwyżej `limit` naraz.
 * Zadanie dostaje `done` (wywołanie wielokrotne liczy się raz). Zwraca funkcję wycofania
 * (zadanie jeszcze w kolejce znika; trwające zwalnia miejsce).
 */
export function createPreloadQueue(limit = MAX_PARALLEL_PRELOADS) {
  const waiting: Array<{ job: Job; release: () => void; started: boolean }> = [];
  let running = 0;

  const pump = () => {
    while (running < limit && waiting.length > 0) {
      const item = waiting.shift()!;
      item.started = true;
      running++;
      item.job(item.release);
    }
  };

  return {
    enqueue(job: Job): () => void {
      let released = false;
      const item = {
        job,
        started: false,
        release: () => {
          if (released) return;
          released = true;
          if (item.started) {
            running--;
            pump();
          }
        },
      };
      waiting.push(item);
      pump();
      return () => {
        if (!item.started) {
          const i = waiting.indexOf(item);
          if (i >= 0) waiting.splice(i, 1);
          released = true;
          return;
        }
        item.release();
      };
    },
    /** Do testów: ile zadań trwa i czeka. */
    stats: () => ({ running, waiting: waiting.length }),
  };
}

/** Wspólna kolejka strony (lista portfolio). */
export const portfolioPreloadQueue = createPreloadQueue();
