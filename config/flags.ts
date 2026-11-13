/**
 * Przełączniki funkcji (build-time, Vite). Domyślnie wszystko wyłączone.
 * Funkcja zamiast stałej: wartość czytana przy wywołaniu (testy podmieniają ją
 * przez vi.stubEnv), a w buildzie Vite i tak wstawia literał.
 */

/** Klauzula informacyjna RODO pod formularzami + pełna treść w polityce prywatności (MIX-844). */
export const isRodoKlauzulaEnabled = (): boolean => import.meta.env.VITE_RODO_KLAUZULA === '1';
