import { renderHook, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';
import { useCalculator } from '../../hooks/useCalculator';
import { cmsService } from '../../services/cmsService';
import { act } from 'react';

// Mock cmsService
vi.mock('../../services/cmsService', () => ({
  cmsService: {
    getCalculatorConfig: vi.fn(),
  },
}));

const mockConfig = {
  baseRates: {
    landingPage: { minPrice: 3000, maxPrice: 5000, minTime: 2, maxTime: 3 },
    corporate: { minPrice: 5000, maxPrice: 10000, minTime: 4, maxTime: 6 },
    ecommerce: { minPrice: 8000, maxPrice: 15000, minTime: 6, maxTime: 10 },
    webApp: { minPrice: 20000, maxPrice: 50000, minTime: 10, maxTime: 16 },
  },
  designMultipliers: {
    template: 1.0,
    custom: 1.2,
    premium: 1.5,
  },
  features: {
    cms: 1000,
    blog: 500,
    integrations: 2000,
  },
  marketing: {
    seo: 1500,
  },
};

describe('useCalculator Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (cmsService.getCalculatorConfig as Mock).mockResolvedValue(mockConfig);
  });

  it('calculates base price correctly for landing page with template design', async () => {
    const { result } = renderHook(() => useCalculator());

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.updateSelection('projectType', 'landingPage');
      result.current.updateSelection('designLevel', 'template');
    });

    // 3000 * 1.0 = 3000
    // 5000 * 1.0 = 5000
    expect(result.current.result.minPrice).toBe(3000);
    expect(result.current.result.maxPrice).toBe(5000);
    expect(result.current.result.minTime).toBe(2);
    expect(result.current.result.maxTime).toBe(3);
  });

  it('applies design multiplier correctly', async () => {
    const { result } = renderHook(() => useCalculator());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.updateSelection('projectType', 'corporate');
      result.current.updateSelection('designLevel', 'premium');
    });

    // 5000 * 1.5 = 7500
    // 10000 * 1.5 = 15000
    expect(result.current.result.minPrice).toBe(7500);
    expect(result.current.result.maxPrice).toBe(15000);
  });

  it('adds features correctly', async () => {
    const { result } = renderHook(() => useCalculator());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.updateSelection('projectType', 'landingPage');
      result.current.updateSelection('designLevel', 'template');
      result.current.toggleFeature('cms'); // +1000
      result.current.toggleFeature('blog'); // +500
    });

    expect(result.current.result.minPrice).toBe(4500); // 3000 + 1500
    expect(result.current.result.maxPrice).toBe(6500); // 5000 + 1500
  });

  it('adds marketing correctly', async () => {
    const { result } = renderHook(() => useCalculator());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.updateSelection('projectType', 'landingPage');
      result.current.updateSelection('designLevel', 'template');
      result.current.toggleMarketing('seo'); // +1500
    });

    expect(result.current.result.minPrice).toBe(4500);
    expect(result.current.result.maxPrice).toBe(6500);
  });

  it('increases time for complex features', async () => {
    const { result } = renderHook(() => useCalculator());
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.updateSelection('projectType', 'landingPage');
      result.current.toggleFeature('integrations'); // +1 min, +2 max weeks
    });

    expect(result.current.result.minTime).toBe(3); // 2 + 1
    expect(result.current.result.maxTime).toBe(5); // 3 + 2
  });
});
