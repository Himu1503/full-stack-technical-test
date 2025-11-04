/**
 * Content Management System
 * 
 * This file provides a simple content management system that allows
 * non-technical staff to manage categories, marketing content, and banners
 * by editing JSON files in the public/content/ directory.
 * 
 * Benefits:
 * - No code changes needed for content updates
 * - Easy for non-technical staff to edit JSON files
 * - Version controlled content changes
 * - Can be extended to use CMS API in the future
 */

export interface CategoryConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  backgroundColor: string;
  textColor: string;
}

export interface MarketingBanner {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  backgroundColor: string;
  textColor: string;
  enabled: boolean;
  priority: number;
}

export interface PromotionalFeature {
  title: string;
  description: string;
  icon: string;
}

export interface MarketingContent {
  banners: MarketingBanner[];
  promotionalContent: {
    headline: string;
    features: PromotionalFeature[];
  };
}

let categoriesCache: CategoryConfig[] | null = null;
let marketingCache: MarketingContent | null = null;

export const loadCategories = async (): Promise<CategoryConfig[]> => {
  // First check localStorage (managed content)
  try {
    const stored = localStorage.getItem('pulse_events_categories');
    if (stored) {
      const parsed = JSON.parse(stored);
      const categories = Array.isArray(parsed) ? parsed : parsed.categories || [];
      categoriesCache = categories;
      return categories;
    }
  } catch (error) {
    console.error('Error loading categories from storage:', error);
  }

  // Fallback to JSON file
  if (categoriesCache) {
    return categoriesCache;
  }

  try {
    const response = await fetch('/content/categories.json');
    if (!response.ok) {
      throw new Error('Failed to load categories');
    }
    const data = await response.json();
    categoriesCache = data.categories;
    return categoriesCache || [];
  } catch (error) {
    console.error('Error loading categories:', error);
    return [];
  }
};

export const loadMarketingContent = async (): Promise<MarketingContent | null> => {
  // First check localStorage (managed content)
  try {
    const stored = localStorage.getItem('pulse_events_marketing_content');
    if (stored) {
      const parsed = JSON.parse(stored);
      marketingCache = parsed;
      return parsed;
    }
  } catch (error) {
    console.error('Error loading marketing content from storage:', error);
  }

  // Fallback to JSON file
  if (marketingCache) {
    return marketingCache;
  }

  try {
    const response = await fetch('/content/marketing.json');
    if (!response.ok) {
      throw new Error('Failed to load marketing content');
    }
    const data = await response.json();
    marketingCache = data;
    return marketingCache;
  } catch (error) {
    console.error('Error loading marketing content:', error);
    return null;
  }
};

export const getCategoryConfig = async (categoryId: string): Promise<CategoryConfig | null> => {
  const categories = await loadCategories();
  return categories.find(cat => cat.id === categoryId) || null;
};

export const getCategoryConfigSync = (categoryId: string): CategoryConfig | null => {
  try {
    const stored = localStorage.getItem('pulse_events_categories');
    if (stored) {
      const parsed = JSON.parse(stored);
      const categories = Array.isArray(parsed) ? parsed : parsed.categories || [];
      return categories.find((cat: CategoryConfig) => cat.id === categoryId) || null;
    }
  } catch (error) {
    console.error('Error loading category config from storage:', error);
  }
  return null;
};

export const clearCache = () => {
  categoriesCache = null;
  marketingCache = null;
};

