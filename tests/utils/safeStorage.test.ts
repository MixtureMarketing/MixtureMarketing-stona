import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import { safeGetItem, safeGetJSON, safeRemoveItem, safeSetItem } from '../../utils/safeStorage';
import { blockStorage } from './storageBlock';

describe('safeStorage', () => {
  let restore: (() => void) | null = null;

  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  afterEach(() => {
    restore?.();
    restore = null;
  });

  it('działa jak zwykły storage, gdy jest dostępny', () => {
    expect(safeSetItem('k', 'v')).toBe(true);
    expect(safeGetItem('k')).toBe('v');
    expect(safeRemoveItem('k')).toBe(true);
    expect(safeGetItem('k')).toBeNull();
  });

  it('obsługuje sessionStorage', () => {
    expect(safeSetItem('s', '1', 'session')).toBe(true);
    expect(window.sessionStorage.getItem('s')).toBe('1');
    expect(safeGetItem('s', 'local')).toBeNull();
  });

  it('safeGetJSON zwraca null dla uszkodzonego JSON', () => {
    window.localStorage.setItem('bad', '{nie-json');
    expect(safeGetJSON('bad')).toBeNull();
    window.localStorage.setItem('ok', '{"a":1}');
    expect(safeGetJSON<{ a: number }>('ok')).toEqual({ a: 1 });
  });

  it('nie rzuca, gdy dostęp do storage jest zablokowany (SecurityError)', () => {
    restore = blockStorage('localStorage');
    expect(() => window.localStorage).toThrow();

    expect(safeGetItem('k')).toBeNull();
    expect(safeGetJSON('k')).toBeNull();
    expect(safeSetItem('k', 'v')).toBe(false);
    expect(safeRemoveItem('k')).toBe(false);
  });
});
