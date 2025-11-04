import { MarketingBanner, MarketingContent, CategoryConfig } from './content';

const STORAGE_KEY_MARKETING = 'pulse_events_marketing_content';
const STORAGE_KEY_CATEGORIES = 'pulse_events_categories';

export const contentManager = {
  // Marketing Banners Management
  getMarketingContent: (): MarketingContent | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_MARKETING);
      if (stored) {
        return JSON.parse(stored);
      }
      return null;
    } catch (error) {
      console.error('Error loading marketing content from storage:', error);
      return null;
    }
  },

  saveMarketingContent: (content: MarketingContent): void => {
    try {
      localStorage.setItem(STORAGE_KEY_MARKETING, JSON.stringify(content, null, 2));
    } catch (error) {
      console.error('Error saving marketing content:', error);
      throw new Error('Failed to save marketing content');
    }
  },

  addBanner: (banner: MarketingBanner): void => {
    const content = contentManager.getMarketingContent() || {
      banners: [],
      promotionalContent: {
        headline: '',
        features: [],
      },
    };
    content.banners.push(banner);
    contentManager.saveMarketingContent(content);
  },

  updateBanner: (id: string, updates: Partial<MarketingBanner>): void => {
    const content = contentManager.getMarketingContent();
    if (!content) return;

    const index = content.banners.findIndex(b => b.id === id);
    if (index !== -1) {
      content.banners[index] = { ...content.banners[index], ...updates };
      contentManager.saveMarketingContent(content);
    }
  },

  deleteBanner: (id: string): void => {
    const content = contentManager.getMarketingContent();
    if (!content) return;

    content.banners = content.banners.filter(b => b.id !== id);
    contentManager.saveMarketingContent(content);
  },

  updatePromotionalContent: (promotionalContent: MarketingContent['promotionalContent']): void => {
    const content = contentManager.getMarketingContent() || {
      banners: [],
      promotionalContent: {
        headline: '',
        features: [],
      },
    };
    content.promotionalContent = promotionalContent;
    contentManager.saveMarketingContent(content);
  },

  // Categories Management
  getCategories: (): CategoryConfig[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CATEGORIES);
      if (stored) {
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : parsed.categories || [];
      }
      return [];
    } catch (error) {
      console.error('Error loading categories from storage:', error);
      return [];
    }
  },

  saveCategories: (categories: CategoryConfig[]): void => {
    try {
      localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories, null, 2));
    } catch (error) {
      console.error('Error saving categories:', error);
      throw new Error('Failed to save categories');
    }
  },

  addCategory: (category: CategoryConfig): void => {
    const categories = contentManager.getCategories();
    categories.push(category);
    contentManager.saveCategories(categories);
  },

  updateCategory: (id: string, updates: Partial<CategoryConfig>): void => {
    const categories = contentManager.getCategories();
    const index = categories.findIndex(c => c.id === id);
    if (index !== -1) {
      categories[index] = { ...categories[index], ...updates };
      contentManager.saveCategories(categories);
    }
  },

  deleteCategory: (id: string): void => {
    const categories = contentManager.getCategories();
    const filtered = categories.filter(c => c.id !== id);
    contentManager.saveCategories(filtered);
  },

  // Import/Export
  exportMarketingContent: (): string => {
    const content = contentManager.getMarketingContent();
    return JSON.stringify(content, null, 2);
  },

  importMarketingContent: (json: string): void => {
    try {
      const content = JSON.parse(json) as MarketingContent;
      contentManager.saveMarketingContent(content);
    } catch (error) {
      throw new Error('Invalid JSON format');
    }
  },

  exportCategories: (): string => {
    const categories = contentManager.getCategories();
    return JSON.stringify({ categories }, null, 2);
  },

  importCategories: (json: string): void => {
    try {
      const parsed = JSON.parse(json);
      const categories = Array.isArray(parsed) ? parsed : parsed.categories || [];
      contentManager.saveCategories(categories);
    } catch (error) {
      throw new Error('Invalid JSON format');
    }
  },
};

