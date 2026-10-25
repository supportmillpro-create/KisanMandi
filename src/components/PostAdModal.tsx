import React, { useState, useRef } from 'react';
import { User, Listing } from '../types';
import { POPULAR_CITIES, CROP_IMAGE_PRESETS } from '../data/seedData';
import { 
  X, 
  PlusCircle, 
  Check, 
  MapPin, 
  Image as ImageIcon, 
  Scale, 
  Tag, 
  Lock,
  Upload,
  Camera,
  Trash2,
  AlertCircle,
  Sparkles
} from 'lucide-react';

interface PostAdModalProps {
  currentUser: User | null;
  onClose: () => void;
  onSubmit: (listingData: Omit<Listing, 'id' | 'createdAt' | 'viewsCount' | 'contactsUnlockedCount' | 'status'>) => void;
  onOpenAuth: () => void;
}

export const PostAdModal: React.FC<PostAdModalProps> = ({
  currentUser,
  onClose,
  onSubmit,
  onOpenAuth,
}) => {
  const [category, setCategory] = useState<'wheat' | 'rice' | 'flour' | 'pulses' | 'other_grains'>('wheat');
  const [title, setTitle] = useState('');
  const [cropVariety, setCropVariety] = useState(''); // Subtitle - OPTIONAL!
  const [quantity, setQuantity] = useState('');
  
  // Units state - Flexible with 'other' option (No hardcoded kg)
  const [unit, setUnit] = useState<string>('Maund (من)');
  const [customUnit, setCustomUnit] = useState<string>('');

  // Price & rate unit state - Flexible with 'other' option
  const [price, setPrice] = useState('');
  const [priceUnit, setPriceUnit] = useState<string>('per Maund (فی من)');
  const [customPriceUnit, setCustomPriceUnit] = useState<string>('');

  const [city, setCity] = useState(currentUser?.city || 'Faisalabad');
  const [generalArea, setGeneralArea] = useState(currentUser?.area || 'Ghalla Mandi');
  const [exactAddress, setExactAddress] = useState('');
  const [sellerPhone, setSellerPhone] = useState(currentUser?.phone || '');
  const [sellerWhatsApp, setSellerWhatsApp] = useState(currentUser?.phone || '');
  const [grade, setGrade] = useState<'Premium Grade A' | 'Grade B Commercial' | 'Standard Milling' | 'Export Quality'>('Premium Grade A');
  const [moisturePercentage, setMoisturePercentage] = useState('10.5');
  const [packagingType, setPackagingType] = useState<string>('Bags / Tora (توڑا / بوری)');
  const [harvestYear, setHarvestYear] = useState('2026');
  const [description, setDescription] = useState('');
  const [isFeatured, setIsFeatured] = useState(false); // Featured / Premium Ad (Rs. 50 fee)

  // Gallery Uploaded Images State (Direct Device Uploads)
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [imageError, setImageError] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
        <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-display">
            Login Required to Post an Ad
          </h2>
          <p className="text-xs text-slate-500">
            Please log in or register with your mobile number to create crop listings and sell agricultural commodities.
          </p>
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-xs font-bold text-white shadow-md"
            >
              Login / Register
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle direct file uploads from user's gallery / camera
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setImageError('');
    setIsUploading(true);

    const fileList = Array.from(files);
    const readers: Promise<string>[] = fileList.map((file) => {
      return new Promise((resolve, reject) => {
        if (!file.type.startsWith('image/')) {
          reject(new Error('Please select valid image files only'));
          return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            const maxDimension = 1024;

            if (width > height) {
              if (width > maxDimension) {
                height = Math.round((height * maxDimension) / width);
                width = maxDimension;
              }
            } else {
              if (height > maxDimension) {
                width = Math.round((width * maxDimension) / height);
                height = maxDimension;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
              resolve(dataUrl);
            } else {
              resolve(event.target?.result as string);
            }
          };
          img.onerror = () => resolve(event.target?.result as string);
          img.src = event.target?.result as string;
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers)
      .then((newImages) => {
        setUploadedImages((prev) => [...prev, ...newImages]);
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      })
      .catch((err) => {
        setImageError(err.message || 'Error uploading image');
        setIsUploading(false);
      });
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setUploadedImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let finalImages = uploadedImages;
    if (finalImages.length === 0) {
      const defaultPreset = CROP_IMAGE_PRESETS.find((p) => p.category === category)?.url || CROP_IMAGE_PRESETS[0].url;
      finalImages = [defaultPreset];
    }

    // Resolve final unit (Use custom text if 'other' was selected)
    const finalUnit = unit === 'other' ? (customUnit.trim() || 'Custom Unit') : unit;
    const finalPriceUnit = priceUnit === 'other' ? (customPriceUnit.trim() || 'per Custom Unit') : priceUnit;

    if (isFeatured && currentUser.walletBalance < 50) {
      alert(`Insufficient wallet balance for Featured Ad. You need Rs. 50, but have Rs. ${currentUser.walletBalance}. Please top up your wallet or uncheck Featured Ad to post for free.`);
      return;
    }

    onSubmit({
      title: title.trim() || `${cropVariety ? `${cropVariety} ` : ''}${category.toUpperCase()} Stock`,
      category,
      cropVariety: cropVariety.trim() || undefined, // Sub-title is optional!
      quantity: Number(quantity) || 100,
      unit: finalUnit,
      price: Number(price) || 4000,
      priceUnit: finalPriceUnit,
      city,
      generalArea: generalArea.trim() || 'Central Mandi',
      exactAddress: exactAddress.trim() || `${city} Grain Market, Shop #18`,
      sellerId: currentUser.id,
      sellerName: currentUser.name,
      sellerPhone: sellerPhone.trim() || currentUser.phone,
      sellerWhatsApp: sellerWhatsApp.trim() || sellerPhone.trim() || currentUser.phone,
      sellerVerified: true,
      images: finalImages,
      description: description.trim() || 'High quality agricultural stock ready for immediate delivery and physical mandi inspection.',
      grade,
      moisturePercentage: Number(moisturePercentage) || 10,
      packagingType: packagingType as any,
      harvestYear,
      isFeatured: isFeatured,
    });
  };

  const categoryPresets = [
    { key: 'wheat', label: 'Wheat (گندم)', icon: '🌾' },
    { key: 'rice', label: 'Rice (چاول)', icon: '🍚' },
    { key: 'flour', label: 'Flour (آٹا)', icon: '🥖' },
    { key: 'pulses', label: 'Pulses (دالیں)', icon: '🫘' },
    { key: 'other_grains', label: 'Other Grains (اناج)', icon: '🌽' },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-amber-500 text-slate-950 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-600/30 flex items-center justify-center">
              <PlusCircle className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display">Post Agricultural Crop Ad</h2>
              <p className="text-xs text-amber-950/80">
                Direct gallery photo upload • Custom packaging & units support
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-950/70 hover:text-slate-950 hover:bg-amber-600/20 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* 1. Category Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Select Commodity Category *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {categoryPresets.map((cat) => (
                <button
                  type="button"
                  key={cat.key}
                  onClick={() => setCategory(cat.key)}
                  className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition cursor-pointer ${
                    category === cat.key
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-950 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-lg">{cat.icon}</span>
                  <span className="text-center">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. DIRECT GALLERY IMAGE UPLOAD */}
          <div className="bg-slate-50/90 rounded-2xl p-4 sm:p-5 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-emerald-700" />
                <span>Upload Photos from Device Gallery (گیلری سے تصویر منتخب کریں)</span>
              </label>
              <span className="text-[11px] text-slate-500 font-medium">
                {uploadedImages.length} photo{uploadedImages.length !== 1 ? 's' : ''} added
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-3">
              Select clear pictures of your wheat, rice, flour, or pulses directly from your phone gallery or take a live photo.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-emerald-500/60 hover:border-emerald-600 bg-emerald-50/40 hover:bg-emerald-50/80 rounded-2xl p-5 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition transform">
                <Upload className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-950">
                  {isUploading ? 'Processing Photos from Gallery...' : 'Tap to Choose Photos from Gallery / Camera'}
                </p>
                <p className="text-xs text-emerald-700 mt-0.5">
                  (گیلری یا کیمرے سے تصویر اپلوڈ کرنے کے لیے یہاں کلک کریں)
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Supports JPG, PNG, WEBP (Multiple photos allowed)
                </p>
              </div>
            </div>

            {imageError && (
              <div className="mt-2 text-xs text-rose-600 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {imageError}
              </div>
            )}

            {uploadedImages.length > 0 && (
              <div className="mt-4 space-y-2">
                <span className="text-[11px] font-bold text-slate-600 block">
                  Uploaded Crop Photos (First image is Cover Photo):
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {uploadedImages.map((imgUrl, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-xl overflow-hidden border-2 border-emerald-500 shadow-xs group bg-slate-100"
                    >
                      <img src={imgUrl} alt={`Uploaded ${index + 1}`} className="w-full h-full object-cover" />
                      {index === 0 && (
                        <div className="absolute top-1 left-1 bg-emerald-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                          Cover
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm transition"
                        title="Delete this photo"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-white hover:bg-emerald-50/50 flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-emerald-700 transition cursor-pointer text-xs font-bold"
                  >
                    <Camera className="w-5 h-5" />
                    <span>+ Add More</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 3. Crop Details */}
          <div className="bg-slate-50/70 rounded-2xl p-4 sm:p-5 border border-slate-200/90 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-emerald-700" />
              <span>Crop Name & Pricing</span>
            </h3>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ad Title / Main Heading *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Super Basmati Kainat 1121 Extra Long Grain"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
              />
            </div>

            {/* Variety (Subtitle - OPTIONAL, NOT COMPULSORY!) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    Variety / Sub-type / Subtitle
                  </label>
                  <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                    اختیاری (Optional)
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. Desi Sharbati, Kainat Steam (Optional)"
                  value={cropVariety}
                  onChange={(e) => setCropVariety(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:border-emerald-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Quality Grade
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:border-emerald-600 outline-none"
                >
                  <option value="Premium Grade A">Premium Grade A</option>
                  <option value="Export Quality">Export Quality</option>
                  <option value="Standard Milling">Standard Milling</option>
                  <option value="Grade B Commercial">Grade B Commercial</option>
                </select>
              </div>
            </div>

            {/* Quantity and Unit (Flexible with Other / Custom input) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Available Quantity & Unit *
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 250"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-1/2 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:border-emerald-600 outline-none"
                  />
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-1/2 px-2 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:border-emerald-600 outline-none"
                  >
                    <option value="Maund (من)">Maund (من)</option>
                    <option value="Bags / Tora (توڑا / بوری)">Bags / Tora (توڑا / بوری)</option>
                    <option value="Kilogram (کلو)">Kilograms (کلو)</option>
                    <option value="Tons (ٹن)">Tons (ٹن)</option>
                    <option value="other">Other / کسٹم یونٹ (خود لکھیں)</option>
                  </select>
                </div>

                {/* Custom unit input when 'other' is selected */}
                {unit === 'other' && (
                  <div className="mt-2">
                    <input
                      type="text"
                      required
                      placeholder="مثلاً: 100 کلو بوری / 80 کلو توڑا / پیٹی (Enter bag/tora weight)"
                      value={customUnit}
                      onChange={(e) => setCustomUnit(e.target.value)}
                      className="w-full px-3 py-1.5 bg-amber-50 border border-amber-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-emerald-600 outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Price and Rate Unit (Flexible with Other / Custom input) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Price (PKR) & Rate Unit *
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="e.g. 9400"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-1/2 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-emerald-800 focus:border-emerald-600 outline-none"
                  />
                  <select
                    value={priceUnit}
                    onChange={(e) => setPriceUnit(e.target.value)}
                    className="w-1/2 px-2 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 focus:border-emerald-600 outline-none"
                  >
                    <option value="per Maund (فی من)">per Maund (فی من)</option>
                    <option value="per Bag / Tora (فی توڑا / بوری)">per Bag / Tora (فی توڑا / بوری)</option>
                    <option value="per Kg (فی کلو)">per Kg (فی کلو)</option>
                    <option value="Total Lot Price (کل مال کی قیمت)">Total Lot Price (کل مال)</option>
                    <option value="other">Other / کسٹم ریٹ (خود لکھیں)</option>
                  </select>
                </div>

                {/* Custom price rate input when 'other' is selected */}
                {priceUnit === 'other' && (
                  <div className="mt-2">
                    <input
                      type="text"
                      required
                      placeholder="مثلاً: فی 100 کلو توڑا / فی پیٹی (Enter custom rate unit)"
                      value={customPriceUnit}
                      onChange={(e) => setCustomPriceUnit(e.target.value)}
                      className="w-full px-3 py-1.5 bg-amber-50 border border-amber-300 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-emerald-600 outline-none"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Packaging and Moisture */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Packaging Type
                </label>
                <select
                  value={packagingType}
                  onChange={(e) => setPackagingType(e.target.value)}
                  className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 outline-none"
                >
                  <option value="Bags / Tora (توڑا / بوری)">Bags / Tora (توڑا / بوری)</option>
                  <option value="Jute Bag (سَن کی بوری)">Jute Bag (سَن کی بوری)</option>
                  <option value="Polypropylene Bag (پلاسٹک توڑا)">Polypropylene Bag (پلاسٹک توڑا)</option>
                  <option value="Bulk / Loose (ڈھیری / کھلا)">Bulk / Loose (ڈھیری / کھلا)</option>
                  <option value="Cartons / Packets (پیٹیاں)">Cartons / Packets (پیٹیاں)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Moisture %
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 10.5"
                  value={moisturePercentage}
                  onChange={(e) => setMoisturePercentage(e.target.value)}
                  className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Harvest Year
                </label>
                <select
                  value={harvestYear}
                  onChange={(e) => setHarvestYear(e.target.value)}
                  className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 outline-none"
                >
                  <option value="2026">2026 (Fresh New Crop)</option>
                  <option value="2025">2025 (1-Year Aged)</option>
                  <option value="2024">2024 (Aged)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 4. Location & Paywalled Contact Information */}
          <div className="bg-amber-50/60 rounded-2xl p-4 sm:p-5 border border-amber-200/90 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-700" />
                <span>Location & Protected Contact Information</span>
              </h3>
              <span className="text-[10px] font-bold text-amber-900 bg-amber-200 px-2 py-0.5 rounded">
                Protected by Rs. 10 Paywall
              </span>
            </div>

            <p className="text-xs text-amber-900/80">
              Your City and General Area will be displayed free to all buyers. Your exact warehouse address and mobile phone will only be visible to serious buyers who pay the Rs. 10 contact fee.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  City / District (Free to see) *
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:border-emerald-600 outline-none"
                >
                  {POPULAR_CITIES.filter((c) => c !== 'All Pakistan').map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  General Area / Mandi Name (Free to see) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. New Ghalla Mandi, Jhang Road"
                  value={generalArea}
                  onChange={(e) => setGeneralArea(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:border-emerald-600 outline-none"
                />
              </div>
            </div>

            {/* Protected Contact Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-amber-200/60">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Seller Mobile Phone (🔒 Unlocks for Rs. 10) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 0300 7891234"
                  value={sellerPhone}
                  onChange={(e) => setSellerPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:border-amber-600 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  WhatsApp Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 0300 7891234"
                  value={sellerWhatsApp}
                  onChange={(e) => setSellerWhatsApp(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:border-amber-600 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Exact Mandi Shop / Warehouse Address (🔒 Unlocks for Rs. 10) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Shop #42, Main Gate 2, New Grain Market, Faisalabad"
                value={exactAddress}
                onChange={(e) => setExactAddress(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs text-slate-900 focus:border-amber-600 outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Detailed Crop Description & Terms
            </label>
            <textarea
              rows={3}
              placeholder="Mention grain moisture, bag type, payment terms, loading assistance, and test report availability..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-600 outline-none"
            />
          </div>

          {/* 5. Featured / Premium Ad Option (Rs. 50 Fee) */}
          <div className={`p-4 rounded-2xl border-2 transition-all ${
            isFeatured 
              ? 'bg-gradient-to-r from-amber-500/15 via-amber-400/20 to-amber-500/15 border-amber-400 shadow-md shadow-amber-500/10' 
              : 'bg-slate-50 border-slate-200 hover:border-amber-300'
          }`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isFeatured ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' : 'bg-slate-200 text-slate-600'
                }`}>
                  <Sparkles className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                      Feature this Ad on TOP like OLX (پریمیم فیچرڈ اشتہار)
                    </span>
                    <span className="text-[10px] font-bold bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
                      Fee: Rs. 50
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    (او ایل ایکس کی طرح اشتہار سب سے ٹاپ پر نظر آئے گا اور 5 گنا زیادہ خریدار کالز آئیں گی)
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500">
                    <span>Your Wallet Balance:</span>
                    <strong className="text-slate-900">Rs. {currentUser.walletBalance}</strong>
                    {currentUser.walletBalance < 50 && (
                      <span className="text-rose-600 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        (Needs Rs. 50 in wallet)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold text-sm py-3.5 px-6 rounded-xl transition shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-5 h-5 stroke-[2.5]" />
              <span>Publish Crop Ad on KisanMandi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
