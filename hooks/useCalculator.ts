import { useState, useEffect, useMemo } from 'react';
import { cmsService, CalculatorConfig } from '../services/cmsService';

export type ProjectType = 'landingPage' | 'corporate' | 'ecommerce' | 'webApp';
export type DesignLevel = 'template' | 'custom' | 'premium';

export interface CalculatorSelections {
  projectType: ProjectType;
  designLevel: DesignLevel;
  features: string[];
  marketing: string[];
}

export const useCalculator = () => {
  const [config, setConfig] = useState<CalculatorConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [selections, setSelections] = useState<CalculatorSelections>({
    projectType: 'landingPage',
    designLevel: 'custom',
    features: [],
    marketing: [],
  });

  // Fetch config on mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await cmsService.getCalculatorConfig();
        if (data) {
          setConfig(data);
        }
      } catch (err) {
        console.warn('Failed to fetch calculator config (using defaults):', err);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  // Calculation Engine
  const result = useMemo(() => {
    if (!config) return { minPrice: 0, maxPrice: 0, minTime: 0, maxTime: 0 };

    const base = config.baseRates[selections.projectType];
    const designMult = config.designMultipliers[selections.designLevel];

    // Base Calculation (Rate * Multiplier)
    let minPrice = base.minPrice * designMult;
    let maxPrice = base.maxPrice * designMult;
    let minTime = base.minTime;
    let maxTime = base.maxTime;

    // Add Features
    selections.features.forEach((featKey) => {
      const featurePrice = (config.features as Record<string, number>)[featKey] || 0;
      minPrice += featurePrice;
      maxPrice += featurePrice;
      // Add 0.5 - 1 week per complex feature (hardcoded logic for now as it's not in schema yet)
      if (['integrations', 'auth', 'ecommerce'].includes(featKey)) {
        minTime += 1;
        maxTime += 2;
      }
    });

    // Add Marketing
    selections.marketing.forEach((markKey) => {
      const markPrice = (config.marketing as Record<string, number>)[markKey] || 0;
      minPrice += markPrice;
      maxPrice += markPrice;
    });

    // Round to nearest 100 for clean look
    const round = (val: number) => Math.round(val / 100) * 100;

    return {
      minPrice: round(minPrice),
      maxPrice: round(maxPrice),
      minTime,
      maxTime,
    };
  }, [config, selections]);

  const updateSelection = <K extends keyof CalculatorSelections>(
    key: K,
    value: CalculatorSelections[K],
  ) => {
    setSelections((prev) => ({ ...prev, [key]: value }));
  };

  const toggleFeature = (feature: string) => {
    setSelections((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature],
    }));
  };

  const toggleMarketing = (option: string) => {
    setSelections((prev) => ({
      ...prev,
      marketing: prev.marketing.includes(option)
        ? prev.marketing.filter((o) => o !== option)
        : [...prev.marketing, option],
    }));
  };

  return {
    config,
    loading,
    selections,
    result,
    updateSelection,
    toggleFeature,
    toggleMarketing,
  };
};
