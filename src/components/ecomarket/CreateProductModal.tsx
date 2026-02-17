import { useState } from 'react';
import { X, Loader2, Building2, Phone, Upload, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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
  'Carbon Neutral',
  'Plastic Free',
  'Made in Kenya',
  'Fair Trade',
  'Organic',
  'Recycled',
  'Solar Powered',
  '2-Year Warranty',
  'Biodegradable',
  'Locally Sourced',
];

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
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = 4;

  const toggleBadge = (badge: string) => {
    setSelectedBadges((prev) =>
      prev.includes(badge) ? prev.filter((b) => b !== badge) : [...prev, badge]
    );
  };

  const [isDragging, setIsDragging] = useState(false);

  const processFile = (file: File) => {
    setMediaFile(file);
    const url = URL.createObjectURL(file);
    setMediaPreview(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
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
      let mediaUrl: string | undefined;
      let mediaType: string | undefined;

      if (mediaFile) {
        const fileExt = mediaFile.name.split('.').pop();
        const filePath = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('post-media')
          .upload(filePath, mediaFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from('post-media').getPublicUrl(filePath);
        mediaUrl = urlData.publicUrl;
        mediaType = mediaFile.type.startsWith('video/') ? 'video' : 'image';
      }

      await onProductCreated({
        orgName: orgName.trim(),
        productName: productName.trim(),
        category,
        description: description.trim(),
        badges: selectedBadges,
        price: parseFloat(price),
        contactPhone: contactPhone.trim(),
        mediaUrl,
        mediaType,
      });

      // Reset form but don't close - let user stay on page
      setStep(1);
      setOrgName('');
      setProductName('');
      setCategory('');
      setDescription('');
      setSelectedBadges([]);
      setPrice('');
      setContactPhone('');
      setMediaFile(null);
      setMediaPreview(null);
      // Don't call onClose() - keep user on the EcoMarket page
    } catch (err) {
      console.error('Error creating product:', (err as Error)?.message || 'An error occurred');
      toast.error('Failed to create product');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center sm:justify-center">
      <div className="bg-card w-full sm:max-w-lg sm:rounded-2xl rounded-t-3xl max-h-[85vh] overflow-auto animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-bold text-foreground">List a Product</h2>
            <p className="text-xs text-muted-foreground">Step {step} of {totalSteps}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-muted text-muted-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress */}
        <div className="px-4 pt-3">
          <div className="flex gap-1">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  i < step ? 'eco-gradient-bg' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="p-6 space-y-5 pb-20">
          {/* Step 1: Identity */}
          {step === 1 && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  Company / Org Name *
                </label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g., GreenTech Kenya"
                  className="eco-input"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Product Name *</label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g., Solar Lamps – Off-Grid Kit"
                  className="eco-input"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Category *</label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`p-3 rounded-xl border-2 transition-all text-left flex items-center gap-2 ${
                        category === cat.id
                          ? 'border-primary bg-eco-green-light'
                          : 'border-border bg-card hover:border-primary/50'
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
                <label className="text-sm font-medium text-foreground">Product Image / Video</label>
              <label
                className={`flex flex-col items-center justify-center w-full h-40 rounded-xl border-2 border-dashed cursor-pointer bg-muted/30 transition-all ${isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                {mediaPreview ? (
                  mediaFile?.type.startsWith('video/') ? (
                    <video src={mediaPreview} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <img src={mediaPreview} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                  )
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Upload className="w-8 h-8" />
                    <span className="text-sm">Tap or drag & drop to upload</span>
                  </div>
                )}
                <input type="file" accept="image/*,video/*" onChange={handleFileChange} className="hidden" />
              </label>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Description *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Low-cost light for off-grid homes—reduces emissions by 50%. Ideal for drought-prone areas in Machakos."
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
              <div className="flex flex-wrap gap-2">
                {ecoBadges.map((badge) => (
                  <button
                    key={badge}
                    onClick={() => toggleBadge(badge)}
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
                <label className="text-sm font-medium text-foreground">Price (KSh) *</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g., 2499"
                  min="0"
                  className="eco-input"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary" />
                  Contact Number *
                </label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="e.g., 07XX XXX XXX"
                  className="eco-input"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer Nav */}
        <div className="sticky bottom-0 bg-card border-t border-border p-4 flex gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="eco-button-secondary flex-1 py-3"
            >
              Back
            </button>
          )}
          {step < totalSteps ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="eco-button-primary flex-1 py-3 disabled:opacity-50"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              className="eco-button-primary flex-1 py-3 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Publishing...
                </>
              ) : (
                '🛒 Publish Product (+50 pts)'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
