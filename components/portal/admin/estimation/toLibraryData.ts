// Cienki wrapper UI nad współdzielonym builderem z lib/ (parytet UI↔serwer — inwariant 4).
// Cała logika (w tym filtr modułów per archetyp, f1c) żyje w @/lib/estimation/toLibraryData.
import { buildLibraryData } from '@/lib/estimation/toLibraryData';
import type { EstimationLibrary } from './useEstimationLibrary';
import type { LibraryData } from '@/lib/estimation/types';

export function toLibraryData(
  lib: EstimationLibrary,
  archetype: string,
  goal?: string | null,
): LibraryData {
  return buildLibraryData(lib, archetype, goal);
}
