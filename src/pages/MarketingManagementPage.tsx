import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { contentManager } from '@/lib/contentManager';
import { MarketingBanner, CategoryConfig } from '@/lib/content';
import { cn } from '@/lib/utils';
import {
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  Eye,
  EyeOff,
  Save,
  X,
  Megaphone,
  Tag,
} from 'lucide-react';

export const MarketingManagementPage = () => {
  const [activeTab, setActiveTab] = useState<'banners' | 'categories'>('banners');
  const [banners, setBanners] = useState<MarketingBanner[]>([]);
  const [categories, setCategories] = useState<CategoryConfig[]>([]);
  const [isBannerDialogOpen, setIsBannerDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<MarketingBanner | null>(null);
  const [editingCategory, setEditingCategory] = useState<CategoryConfig | null>(null);
  const { toast } = useToast();

  const loadData = () => {
    const marketingContent = contentManager.getMarketingContent();
    setBanners(marketingContent?.banners || []);
    const categoriesData = contentManager.getCategories();
    setCategories(categoriesData);
    
    import('@/lib/content').then(({ clearCache }) => {
      clearCache();
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveBanner = (bannerData: Partial<MarketingBanner>) => {
    try {
      if (editingBanner) {
        contentManager.updateBanner(editingBanner.id, bannerData);
        toast({
          title: 'Banner Updated',
          description: 'Marketing banner has been updated successfully',
        });
      } else {
        const newBanner: MarketingBanner = {
          id: `banner-${Date.now()}`,
          title: bannerData.title || '',
          subtitle: bannerData.subtitle || '',
          description: bannerData.description || '',
          ctaText: bannerData.ctaText || 'Learn More',
          ctaLink: bannerData.ctaLink || '/events',
          backgroundColor: bannerData.backgroundColor || '#667eea',
          textColor: bannerData.textColor || '#FFFFFF',
          enabled: bannerData.enabled ?? true,
          priority: bannerData.priority ?? banners.length + 1,
        };
        contentManager.addBanner(newBanner);
        toast({
          title: 'Banner Created',
          description: 'New marketing banner has been created',
        });
      }
      setIsBannerDialogOpen(false);
      setEditingBanner(null);
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save banner',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteBanner = (id: string) => {
    if (confirm('Are you sure you want to delete this banner?')) {
      contentManager.deleteBanner(id);
      toast({
        title: 'Banner Deleted',
        description: 'Marketing banner has been deleted',
      });
      loadData();
    }
  };

  const handleToggleBanner = (id: string) => {
    const banner = banners.find(b => b.id === id);
    if (banner) {
      contentManager.updateBanner(id, { enabled: !banner.enabled });
      loadData();
    }
  };

  const handleSaveCategory = (categoryData: Partial<CategoryConfig>) => {
    try {
      if (editingCategory) {
        contentManager.updateCategory(editingCategory.id, categoryData);
        toast({
          title: 'Category Updated',
          description: 'Event category has been updated successfully',
        });
      } else {
        const newCategory: CategoryConfig = {
          id: categoryData.id || `category-${Date.now()}`,
          name: categoryData.name || '',
          description: categoryData.description || '',
          icon: categoryData.icon || '📁',
          color: categoryData.color || '#6B7280',
          backgroundColor: categoryData.backgroundColor || 'rgba(107, 114, 128, 0.1)',
          textColor: categoryData.textColor || '#6B7280',
        };
        contentManager.addCategory(newCategory);
        toast({
          title: 'Category Created',
          description: 'New event category has been created',
        });
      }
      setIsCategoryDialogOpen(false);
      setEditingCategory(null);
      loadData();
      
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'pulse_events_categories',
        newValue: JSON.stringify(contentManager.getCategories()),
      }));
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save category',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      contentManager.deleteCategory(id);
      toast({
        title: 'Category Deleted',
        description: 'Event category has been deleted',
      });
      loadData();
      
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'pulse_events_categories',
        newValue: JSON.stringify(contentManager.getCategories()),
      }));
    }
  };

  const handleExport = () => {
    try {
      if (activeTab === 'banners') {
        const json = contentManager.exportMarketingContent();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `marketing-content-${new Date().toISOString()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const json = contentManager.exportCategories();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `categories-${new Date().toISOString()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
      toast({
        title: 'Export Successful',
        description: 'Data has been exported',
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: error instanceof Error ? error.message : 'Failed to export data',
        variant: 'destructive',
      });
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = e.target?.result as string;
        if (activeTab === 'banners') {
          contentManager.importMarketingContent(json);
        } else {
          contentManager.importCategories(json);
        }
        loadData();
        toast({
          title: 'Import Successful',
          description: 'Data has been imported successfully',
        });
      } catch (error) {
        toast({
          title: 'Import Failed',
          description: error instanceof Error ? error.message : 'Invalid JSON format',
          variant: 'destructive',
        });
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-border/50">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Marketing Management</h2>
          <p className="text-muted-foreground">Manage marketing banners and event categories</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <label>
            <Button variant="outline" asChild>
              <span>
                <Upload className="w-4 h-4 mr-2" />
                Import
              </span>
            </Button>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <div className="flex gap-2 border-b border-border/50 bg-muted/20 rounded-t-lg p-1">
        <Button
          variant={activeTab === 'banners' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('banners')}
          className={cn(
            "rounded-md transition-all",
            activeTab === 'banners' && "shadow-md"
          )}
        >
          <Megaphone className="w-4 h-4 mr-2" />
          Marketing Banners
        </Button>
        <Button
          variant={activeTab === 'categories' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('categories')}
          className={cn(
            "rounded-md transition-all",
            activeTab === 'categories' && "shadow-md"
          )}
        >
          <Tag className="w-4 h-4 mr-2" />
          Event Categories
        </Button>
      </div>

      {activeTab === 'banners' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isBannerDialogOpen} onOpenChange={setIsBannerDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingBanner(null)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Banner
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingBanner ? 'Edit Banner' : 'Create New Banner'}
                  </DialogTitle>
                </DialogHeader>
                <BannerForm
                  banner={editingBanner}
                  onSave={handleSaveBanner}
                  onCancel={() => {
                    setIsBannerDialogOpen(false);
                    setEditingBanner(null);
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {banners.map((banner) => (
              <Card 
                key={banner.id}
                className="transition-all hover:shadow-xl hover:scale-[1.02] border-border/50 overflow-hidden group"
              >
                <div 
                  className="h-32 w-full relative overflow-hidden"
                  style={{ background: banner.backgroundColor }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 
                      className="text-xl font-bold drop-shadow-lg"
                      style={{ color: banner.textColor }}
                    >
                      {banner.title}
                    </h3>
                    <p 
                      className="text-sm opacity-90 mt-1"
                      style={{ color: banner.textColor }}
                    >
                      {banner.subtitle}
                    </p>
                  </div>
                </div>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold">{banner.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{banner.subtitle}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleBanner(banner.id)}
                        className="transition-all hover:scale-110"
                      >
                        {banner.enabled ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingBanner(banner);
                          setIsBannerDialogOpen(true);
                        }}
                        className="transition-all hover:scale-110"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteBanner(banner.id)}
                        className="transition-all hover:scale-110"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={banner.enabled ? 'default' : 'secondary'} className="font-semibold">
                        {banner.enabled ? '✓ Enabled' : '✗ Disabled'}
                      </Badge>
                      <Badge variant="outline" className="font-semibold">
                        Priority: {banner.priority}
                      </Badge>
                    </div>
                    {banner.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{banner.description}</p>
                    )}
                    <div className="flex items-center gap-2 text-sm p-2 bg-muted/50 rounded">
                      <span className="font-semibold">CTA:</span>
                      <span className="font-medium">{banner.ctaText}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="text-muted-foreground text-xs">{banner.ctaLink}</span>
                    </div>
                    <div className="pt-2 border-t border-border/50">
                      <p className="text-xs text-muted-foreground mb-2 font-medium">Color Preview</p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-12 rounded-lg border-2 border-border overflow-hidden shadow-sm" style={{ background: banner.backgroundColor }}>
                          <div 
                            className="h-full flex items-center justify-center text-xs font-bold px-2"
                            style={{ color: banner.textColor }}
                          >
                            Preview
                          </div>
                        </div>
                        <div
                          className="w-12 h-12 rounded-lg border-2 border-border shadow-sm"
                          style={{ backgroundColor: banner.textColor }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {banners.length === 0 && (
            <Card className="border-dashed border-2 border-border/50">
              <CardContent className="py-16 text-center space-y-4">
                <div className="text-5xl mb-4">🎨</div>
                <h3 className="text-xl font-semibold">No banners created yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Create your first marketing banner to start promoting events
                </p>
                <Button
                  className="mt-6"
                  onClick={() => setIsBannerDialogOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Banner
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingCategory(null)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Category
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingCategory ? 'Edit Category' : 'Create New Category'}
                  </DialogTitle>
                </DialogHeader>
                <CategoryForm
                  category={editingCategory}
                  onSave={handleSaveCategory}
                  onCancel={() => {
                    setIsCategoryDialogOpen(false);
                    setEditingCategory(null);
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Card 
                key={category.id}
                className="transition-all hover:shadow-lg hover:scale-[1.02] border-border/50"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{category.icon}</span>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingCategory(category);
                          setIsCategoryDialogOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">{category.description}</p>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: category.color }}
                    />
                    <div
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: category.backgroundColor }}
                    />
                    <div
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: category.textColor }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {categories.length === 0 && (
            <Card className="border-dashed border-2 border-border/50">
              <CardContent className="py-16 text-center space-y-4">
                <div className="text-5xl mb-4">🏷️</div>
                <h3 className="text-xl font-semibold">No categories created yet</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Create event categories to organize and filter your events
                </p>
                <Button
                  className="mt-6"
                  onClick={() => setIsCategoryDialogOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Category
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

const gradientPresets = [
  { name: 'Purple Dream', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)', text: '#FFFFFF' },
  { name: 'Ocean Blue', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', text: '#FFFFFF' },
  { name: 'Sunset', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', text: '#FFFFFF' },
  { name: 'Tropical', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', text: '#FFFFFF' },
  { name: 'Emerald', gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', text: '#FFFFFF' },
  { name: 'Forest', gradient: 'linear-gradient(135deg, #0ba360 0%, #3cba92 100%)', text: '#FFFFFF' },
  { name: 'Royal', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', text: '#FFFFFF' },
  { name: 'Coral', gradient: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)', text: '#FFFFFF' },
  { name: 'Midnight', gradient: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)', text: '#FFFFFF' },
  { name: 'Lavender', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', text: '#2c3e50' },
];

const BannerForm = ({
  banner,
  onSave,
  onCancel,
}: {
  banner: MarketingBanner | null;
  onSave: (data: Partial<MarketingBanner>) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState<Partial<MarketingBanner>>({
    title: banner?.title || '',
    subtitle: banner?.subtitle || '',
    description: banner?.description || '',
    ctaText: banner?.ctaText || 'Explore Events',
    ctaLink: banner?.ctaLink || '/events',
    backgroundColor: banner?.backgroundColor || 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    textColor: banner?.textColor || '#FFFFFF',
    enabled: banner?.enabled ?? true,
    priority: banner?.priority ?? 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="subtitle">Subtitle *</Label>
        <Input
          id="subtitle"
          value={formData.subtitle}
          onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          className="w-full min-h-[100px] px-3 py-2 border rounded-md"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="ctaText">CTA Text *</Label>
          <Input
            id="ctaText"
            value={formData.ctaText}
            onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ctaLink">CTA Link *</Label>
          <Input
            id="ctaLink"
            value={formData.ctaLink}
            onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Gradient Presets</Label>
          <div className="grid grid-cols-5 gap-2">
            {gradientPresets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setFormData({
                    ...formData,
                    backgroundColor: preset.gradient,
                    textColor: preset.text,
                  });
                }}
                className="h-16 rounded-lg border-2 border-border hover:border-primary transition-all hover:scale-105 relative group"
                style={{ background: preset.gradient }}
              >
                <span className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-colors" />
                <span className="absolute bottom-1 left-1 right-1 text-xs font-semibold text-white drop-shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  {preset.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="backgroundColor">Background (Gradient or Hex)</Label>
            <Input
              id="backgroundColor"
              value={formData.backgroundColor}
              onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
              placeholder="linear-gradient(...) or #hex"
            />
            <div 
              className="h-12 rounded-md border border-border"
              style={{ background: formData.backgroundColor }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="textColor">Text Color</Label>
            <div className="flex gap-2">
              <Input
                id="textColor"
                type="color"
                value={formData.textColor?.replace('#', '') || 'FFFFFF'}
                onChange={(e) => setFormData({ ...formData, textColor: `#${e.target.value}` })}
                className="w-20 h-10"
              />
              <Input
                value={formData.textColor || '#FFFFFF'}
                onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                placeholder="#FFFFFF"
                className="flex-1"
              />
            </div>
            <div 
              className="h-12 rounded-md border border-border flex items-center justify-center font-semibold"
              style={{ 
                background: formData.backgroundColor,
                color: formData.textColor 
              }}
            >
              Preview Text
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Input
            id="priority"
            type="number"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })}
            min="1"
          />
        </div>

        <div className="space-y-2 flex items-end">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.enabled}
              onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
              className="w-4 h-4"
            />
            <span>Enabled</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>
      </div>
    </form>
  );
};

const CategoryForm = ({
  category,
  onSave,
  onCancel,
}: {
  category: CategoryConfig | null;
  onSave: (data: Partial<CategoryConfig>) => void;
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState<Partial<CategoryConfig>>({
    id: category?.id || '',
    name: category?.name || '',
    description: category?.description || '',
    icon: category?.icon || '📁',
    color: category?.color || '#6B7280',
    backgroundColor: category?.backgroundColor || 'rgba(107, 114, 128, 0.1)',
    textColor: category?.textColor || '#6B7280',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="categoryId">ID *</Label>
          <Input
            id="categoryId"
            value={formData.id}
            onChange={(e) => setFormData({ ...formData, id: e.target.value })}
            required
            disabled={!!category}
            placeholder="technology"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="categoryName">Name *</Label>
          <Input
            id="categoryName"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="categoryDescription">Description *</Label>
        <textarea
          id="categoryDescription"
          className="w-full min-h-[100px] px-3 py-2 border rounded-md"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="categoryIcon">Icon (Emoji)</Label>
        <Input
          id="categoryIcon"
          value={formData.icon}
          onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
          placeholder="💻"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="categoryColor">Color</Label>
          <Input
            id="categoryColor"
            type="color"
            value={formData.color?.replace('#', '') || '6B7280'}
            onChange={(e) => setFormData({ ...formData, color: `#${e.target.value}` })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="categoryBgColor">Background Color</Label>
          <Input
            id="categoryBgColor"
            type="color"
            value={formData.backgroundColor?.replace(/rgba?\(|\d+|,|\)/g, '').slice(0, 6) || '6B7280'}
            onChange={(e) => {
              const hex = e.target.value;
              const r = parseInt(hex.slice(0, 2), 16);
              const g = parseInt(hex.slice(2, 4), 16);
              const b = parseInt(hex.slice(4, 6), 16);
              setFormData({ ...formData, backgroundColor: `rgba(${r}, ${g}, ${b}, 0.1)` });
            }}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="categoryTextColor">Text Color</Label>
          <Input
            id="categoryTextColor"
            type="color"
            value={formData.textColor?.replace('#', '') || '6B7280'}
            onChange={(e) => setFormData({ ...formData, textColor: `#${e.target.value}` })}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        <Button type="submit">
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>
      </div>
    </form>
  );
};

