import { useState } from 'react';
import { X, Loader2, Building2, Phone, Upload, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { compressImage } from '@/lib/imageCompression';

const categories = [
  { id: 'Water', label: 'Water', emoji: '💧' },
  { id: 'Energy', label: 'Clean Energy', emoji: '⚡' },
  { id: 'Agriculture', label: 'Agriculture', emoji: '🌾' },
  { id: 'Waste', label: 'Waste Management', emoji: '♻️' },
  { id: 'Housing', label: 'Eco-Housing', emoji: '🏡' },
  { id: 'Fashion', label: 'Sustainable Fashion', emoji: '👕' },
  { id: 'Food', label: 'Organic Food', emoji: '🥗' },
  { id: 'Transport', label: 'Green Transport', emoji: '🚲' },
];

const ecoBadges = [
  'Carbon Neutral', 'Plastic Free', 'Made in Kenya', 'Fair Trade',
  'Organic', 'Recycled', 'Solar Powered', '2-Year Warranty',
  'Biodegradable', 'Locally Sourced',
];

interface MediaItem {
  file: File;
  preview: string;
  type: 'image' | 'video';
}

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultOrgName?: string;
  onProductCreated: (product: {
    orgName: string;
    productName: string;
    category: string;
    description: string;
    badges: string[];
    price: number;
    contactPhone: string;
    mediaUrl?: string;
    mediaType?: string;
    mediaUrls?: { url: string; type: string }[];
  }) => void;
}

export function CreateProductModal({ isOpen, onClose, defaultOrgName, onProductCreated }: CreateProductModalProps) {
  const [step, setStep] = useState(1);
  const [orgName, setOrgName] = useState(defaultOrgName || '');
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);
  const [price, setPrice] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const totalSteps = 4;

  const toggleBadge = (badge: string) => {
    setSelectedBadges((prev) =>
      prev.includes(badge) ? prev.filter((b) => b !== badge) : [...prev, badge]
    );
  };

  const processFiles = (files: FileList | File[]) => {
    const newItems: MediaItem[] = [];
    Array.from(files).forEach(file => {
      if (mediaItems.length + newItems.length >= 5) return;
      const type = file.type.startsWith('video/') ? 'video' : 'image';
      newItems.push({ file, preview: URL.createObjectURL(file), type });
    });
    setMediaItems(prev => [...prev, ...newItems]);
  };

  const removeMedia = (index: number) => {
    setMediaItems(prev => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(e.target.files);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) processFiles(e.dataTransfer.files);
  };

  const canProceed = () => {
    switch (step) {
      case 1: return orgName.trim() && productName.trim() && category;
      case 2: return description.trim();
      case 3: return selectedBadges.length > 0;
      case 4: return price.trim() && parseFloat(price) > 0 && contactPhone.trim();
      default: return false;
    }
  };

  const handleSubmit = async () => {
    if (!canProceed()) return;
    setIsSubmitting(true);

    try {
      const uploadedMedia: { url: string; type: string }[] = [];

      for (const item of mediaItems) {
        const processedFile = await compressImage(item.file);
        const fileExt = processedFile.name.split('.').pop();
        const filePath = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('post-media').upload(filePath, processedFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('post-media').getPublicUrl(filePath);
        uploadedMedia.push({ url: urlData.publicUrl, type: item.type });
      }

      await onProductCreated({
        orgName: orgName.trim(),
        productName: productName.trim(),
        category,
        description: description.trim(),
        badges: selectedBadges,
        price: parseFloat(price),
        contactPhone: contactPhone.trim(),
        mediaUrl: uploadedMedia[0]?.url,
        mediaType: uploadedMedia[0]?.type,
        mediaUrls: uploadedMedia,
      });

      // Reset form
      setStep(1);
      setOrgName('');
      setProductName('');
      setCategory('');
      setDescription('');
      setSelectedBadges([]);
      setPrice('');
      setContactPhone('');
      setMediaItems([]);
    } catch (err) {
      console.error('Error creating product:', (err as Error)?.message || 'An error occurred');
      toast.error('Failed to create product');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center sm:justify-center" role="dialog" aria-modal="true" aria-label="List a product">
      <div className="bg-card w-full sm:max-w-lg sm:rounded-2xl rounded-t-3xl h-[92vh] sm:h-auto sm:max-h-[85vh] flex flex-col animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="bg-card border-b border-border p-4 flex items-center justify-between z-10 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-foreground">List a Product</h2>
            <p className="text-xs text-muted-foreground">Step {step} of {totalSteps}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-muted text-muted-foreground" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress */}
        <div className="px-4 pt-3 flex-shrink-0">
          <div className="flex gap-1" role="progressbar" aria-valuenow={step} aria-valuemax={totalSteps}>
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i < step ? 'eco-gradient-bg' : 'bg-muted'}`} />
            ))}
          </div>
        </div>

        <div className="p-6 space-y-5 flex-1 overflow-y-auto">
          {/* Step 1: Identity */}
          {step === 1 && (
            <>
              <div className="space-y-2">
                <label htmlFor="org-name" className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  Company / Org Name *
                </label>
                <input id="org-name" type="text" value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="e.g., GreenTech Kenya" className="eco-input" />
              </div>
              <div className="space-y-2">
                <label htmlFor="product-name" className="text-sm font-medium text-foreground">Product Name *</label>
                <input id="product-name" type="text" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="e.g., Solar Lamps – Off-Grid Kit" className="eco-input" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Category *</label>
                <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Product category">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      role="radio"
                      aria-checked={category === cat.id}
                      className={`p-3 rounded-xl border-2 transition-all text-left flex items-center gap-2 ${
                        category === cat.id ? 'border-primary bg-eco-green-light' : 'border-border bg-card hover:border-primary/50'
                      }`}
                    >
                      <span className="text-lg">{cat.emoji}</span>
                      <span className="text-xs font-medium">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Step 2: Media & Description */}
          {step === 2 && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Product Photos / Videos (up to 5)</label>
                {/* Previews */}
                {mediaItems.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {mediaItems.map((item, i) => (
                      <div key={i} className="relative flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border border-border">
                        {item.type === 'video' ? (
                          <video src={item.preview} className="w-full h-full object-cover" />
                        ) : (
                          <img src={item.preview} alt={`Product photo ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                        )}
                        <button onClick={() => removeMedia(i)} className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground" aria-label={`Remove photo ${i + 1}`}>
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {mediaItems.length < 5 && (
                  <label
                    className={`flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed cursor-pointer bg-muted/30 transition-all ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                  >
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Upload className="w-8 h-8" />
                      <span className="text-sm">Tap or drag & drop ({mediaItems.length}/5)</span>
                    </div>
                    <input type="file" accept="image/*,video/*" multiple onChange={handleFileChange} className="hidden" />
                  </label>
                )}
              </div>
              <div className="space-y-2">
                <label htmlFor="product-desc" className="text-sm font-medium text-foreground">Description *</label>
                <textarea
                  id="product-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Low-cost light for off-grid homes—reduces emissions by 50%."
                  className="eco-input min-h-[120px] resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right">{description.length}/500</p>
              </div>
            </>
          )}

          {/* Step 3: Eco-Proof Badges */}
          {step === 3 && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Eco-Proof Badges *</label>
              <p className="text-xs text-muted-foreground">Select all that apply to your product</p>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Eco-proof badges">
                {ecoBadges.map((badge) => (
                  <button
                    key={badge}
                    onClick={() => toggleBadge(badge)}
                    aria-pressed={selectedBadges.includes(badge)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                      selectedBadges.includes(badge)
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-card text-muted-foreground hover:border-primary/50'
                    }`}
                  >
                    {badge}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Price & Contact */}
          {step === 4 && (
            <>
              <div className="space-y-2">
                <label htmlFor="product-price" className="text-sm font-medium text-foreground">Price (KSh) *</label>
                <input id="product-price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g., 2499" min="0" className="eco-input" />
              </div>
              <div className="space-y-2">
                <label htmlFor="product-phone" className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary" />
                  Contact Number *
                </label>
                <input id="product-phone" type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="e.g., 07XX XXX XXX" className="eco-input" />
              </div>
            </>
          )}
        </div>

        {/* Footer Nav */}
        <div className="bg-card border-t border-border p-4 flex gap-3 flex-shrink-0 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} className="eco-button-secondary flex-1 py-3">Back</button>
          )}
          {step < totalSteps ? (
            <button onClick={() => setStep(step + 1)} disabled={!canProceed()} className="eco-button-primary flex-1 py-3 disabled:opacity-50">Next</button>
          ) : (
            <button onClick={handleSubmit} disabled={!canProceed() || isSubmitting} className="eco-button-primary flex-1 py-3 flex items-center justify-center gap-2 disabled:opacity-50">
              {isSubmitting ? (<><Loader2 className="w-5 h-5 animate-spin" />Publishing...</>) : '🛒 Publish Product (+50 pts)'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
