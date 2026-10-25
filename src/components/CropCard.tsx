import React from 'react';
import { Listing, User } from '../types';
import { MapPin, Phone, Lock, CheckCircle2, ShieldCheck, Scale, Eye, Star, Sparkles } from 'lucide-react';

interface CropCardProps {
  listing: Listing;
  currentUser: User | null;
  onSelect: (listing: Listing) => void;
}

export const CropCard: React.FC<CropCardProps> = ({ listing, currentUser, onSelect }) => {
  const isUnlocked = currentUser?.unlockedListingIds?.includes(listing.id) || currentUser?.role === 'admin';

  const categoryLabels: Record<string, { label: string; bg: string; text: string }> = {
    wheat: { label: 'Wheat / گندم', bg: 'bg-amber-100', text: 'text-amber-900' },
    rice: { label: 'Rice / چاول', bg: 'bg-emerald-100', text: 'text-emerald-900' },
    flour: { label: 'Flour / آٹا', bg: 'bg-orange-100', text: 'text-orange-900' },
    pulses: { label: 'Pulses / دالیں', bg: 'bg-teal-100', text: 'text-teal-900' },
    other_grains: { label: 'Grains & Seeds', bg: 'bg-blue-100', text: 'text-blue-900' },
  };

  const cat = categoryLabels[listing.category] || { label: listing.category, bg: 'bg-slate-100', text: 'text-slate-800' };

  return (
    <div
      onClick={() => onSelect(listing)}
      className={`group bg-white rounded-2xl shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden cursor-pointer transform hover:-translate-y-1 relative ${
        listing.isFeatured
          ? 'border-2 border-amber-400 ring-2 ring-amber-400/40 bg-gradient-to-b from-amber-50/30 via-white to-white shadow-amber-500/10'
          : 'border border-slate-200/90 hover:border-emerald-500/60 hover:shadow-emerald-900/5'
      }`}
    >
      {/* Featured Top Ribbon if Premium Post */}
      {listing.isFeatured && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 px-3 py-1 flex items-center justify-between text-[11px] font-black uppercase tracking-wider shadow-xs">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>Featured Ad (پریمیم اشتہار)</span>
          </div>
          <span className="text-[10px] font-bold bg-slate-950 text-amber-300 px-1.5 py-0.2 rounded">
            TOP
          </span>
        </div>
      )}

      {/* Crop Image & Badges */}
      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
        <img
          src={listing.images[0] || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80'}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Category Pill */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg shadow-xs backdrop-blur-md ${cat.bg} ${cat.text}`}>
            {cat.label}
          </span>
          {listing.sellerVerified && (
            <span className="bg-emerald-600/90 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-xs">
              <ShieldCheck className="w-2.5 h-2.5" />
              Verified
            </span>
          )}
        </div>

        {/* Grade Badge */}
        <div className="absolute top-2.5 right-2.5">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-md text-amber-300">
            {listing.grade}
          </span>
        </div>

        {/* Views Count */}
        <div className="absolute bottom-2 left-2.5 text-[10px] text-white/90 font-medium bg-black/50 backdrop-blur-xs px-1.5 py-0.5 rounded flex items-center gap-1">
          <Eye className="w-2.5 h-2.5" />
          <span>{listing.viewsCount} views</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Price & Quantity */}
          <div className="flex items-baseline justify-between gap-2 mb-1.5">
            <div>
              <span className="text-lg sm:text-xl font-black text-emerald-800 font-display">
                Rs. {listing.price.toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-slate-500 ml-1">
                {listing.priceUnit}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md shrink-0">
              <Scale className="w-3 h-3 text-emerald-700" />
              <span>{listing.quantity} {listing.unit}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-emerald-700 transition mb-2">
            {listing.title}
          </h3>

          {/* Seller Rating & Variety Specs */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2.5">
            <p className="line-clamp-1 truncate max-w-[65%]">
              {listing.cropVariety && (
                <>
                  <strong className="text-slate-700 font-medium">Variety:</strong> {listing.cropVariety}
                  {listing.moisturePercentage ? ' • ' : ''}
                </>
              )}
              {listing.moisturePercentage ? `Moisture: ${listing.moisturePercentage}%` : ''}
            </p>

            {/* Seller Rating Stars */}
            <div className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 shrink-0">
              <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
              <span>{listing.sellerRating || 4.9}</span>
              <span className="text-[10px] text-slate-400 font-medium">({listing.reviewsCount || 1})</span>
            </div>
          </div>
        </div>

        <div>
          {/* Location Bar */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2.5 border-t border-slate-100 mb-3">
            <div className="flex items-center gap-1 truncate max-w-[70%]">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{listing.city}, {listing.generalArea}</span>
            </div>
            <span className="text-[11px] text-slate-400 shrink-0">
              {new Date(listing.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
          </div>

          {/* Contact Status Paywall Banner */}
          {isUnlocked ? (
            <div className="bg-emerald-50 border border-emerald-200/90 text-emerald-800 rounded-xl px-2.5 py-1.5 flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Contact Unlocked</span>
              </div>
              <span className="text-[11px] font-mono font-bold text-emerald-950">
                {listing.sellerPhone}
              </span>
            </div>
          ) : (
            <div className="bg-amber-50 hover:bg-amber-100/90 border border-amber-200/90 text-amber-900 rounded-xl px-2.5 py-1.5 flex items-center justify-between text-xs font-medium transition">
              <div className="flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-amber-700 shrink-0" />
                <span>Seller Contact & Address</span>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-200 text-amber-950">
                Rs. 10 to Reveal
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
