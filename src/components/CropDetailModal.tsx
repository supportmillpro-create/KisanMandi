import React, { useState, useEffect } from 'react';
import { Listing, User, Review } from '../types';
import { storageService } from '../services/storageService';
import { 
  X, 
  MapPin, 
  Phone, 
  MessageCircle, 
  Lock, 
  CheckCircle2, 
  Wallet, 
  AlertCircle, 
  ShieldCheck, 
  Building2, 
  Share2, 
  Scale, 
  Droplets, 
  Package, 
  Calendar, 
  ArrowRight,
  Sparkles,
  Gift,
  Star,
  Send,
  UserCheck
} from 'lucide-react';
import { Language, TRANSLATIONS } from '../utils/translations';

interface CropDetailModalProps {
  listing: Listing | null;
  currentUser: User | null;
  lang?: Language;
  onClose: () => void;
  onUnlockContact: (listingId: string) => void;
  onUnlockWithReferral?: (listingId: string) => void;
  onUpgradeToFeatured?: (listingId: string) => void;
  onOpenWallet: () => void;
  onOpenAuth: () => void;
  onOpenReferral?: () => void;
}

export const CropDetailModal: React.FC<CropDetailModalProps> = ({
  listing,
  currentUser,
  lang = 'en',
  onClose,
  onUnlockContact,
  onUnlockWithReferral,
  onUpgradeToFeatured,
  onOpenWallet,
  onOpenAuth,
  onOpenReferral,
}) => {
  const t = TRANSLATIONS[lang];
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newRating, setNewRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [newComment, setNewComment] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccessMessage, setReviewSuccessMessage] = useState('');

  useEffect(() => {
    if (listing) {
      const sellerReviews = storageService.getReviewsForSeller(listing.sellerId);
      setReviews(sellerReviews);
    }
  }, [listing]);

  if (!listing) return null;

  const isUnlocked = currentUser?.unlockedListingIds?.includes(listing.id) || currentUser?.role === 'admin';
  const hasEnoughBalance = (currentUser?.walletBalance ?? 0) >= 10;
  const hasReferralCredits = (currentUser?.referralCredits ?? 0) > 0;
  const isOwner = currentUser?.id === listing.sellerId;

  const handlePayToUnlock = () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (!hasEnoughBalance) {
      onOpenWallet();
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      onUnlockContact(listing.id);
      setIsProcessing(false);
    }, 400);
  };

  const handleReferralUnlock = () => {
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (!hasReferralCredits) {
      onOpenReferral?.();
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      onUnlockWithReferral?.(listing.id);
      setIsProcessing(false);
    }, 400);
  };

  const handleCopyPhone = () => {
    if (listing.sellerPhone) {
      navigator.clipboard?.writeText(listing.sellerPhone);
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (!newComment.trim()) return;

    setIsSubmittingReview(true);
    const added = storageService.addReview({
      sellerId: listing.sellerId,
      sellerName: listing.sellerName,
      listingId: listing.id,
      reviewerId: currentUser.id,
      reviewerName: currentUser.name,
      rating: newRating,
      comment: newComment.trim(),
    });

    setReviews([added, ...reviews]);
    setNewComment('');
    setIsSubmittingReview(false);
    setReviewSuccessMessage('Review and rating posted successfully! (شکریہ! آپ کا ریویو شائع ہو گیا)');
    setTimeout(() => setReviewSuccessMessage(''), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-fade-in">
      <div 
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Featured Ad Top Ribbon if active */}
        {listing.isFeatured && (
          <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 px-5 py-2 flex items-center justify-between font-black text-xs uppercase tracking-wider shadow-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 fill-current" />
              <span>⭐ Featured Premium Crop Listing (پریمیم فیچرڈ اشتہار)</span>
            </div>
            <span className="text-[10px] bg-slate-950 text-amber-300 px-2 py-0.5 rounded font-bold">
              TOP OF MANDI
            </span>
          </div>
        )}

        {/* Modal Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-md">
              {listing.category}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Ad #{listing.id.slice(-6)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* If seller owns this ad and it is not featured, show upgrade button */}
            {isOwner && !listing.isFeatured && (
              <button
                onClick={() => onUpgradeToFeatured?.(listing.id)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs transition cursor-pointer"
                title="Pin this ad to top for Rs. 50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Feature on TOP (Rs. 50)</span>
              </button>
            )}

            <button
              onClick={handleShare}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
              title="Copy share link"
            >
              {copiedLink ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6 flex-1">
          {/* Main Grid: Images + Quick Info */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Gallery Column */}
            <div className="lg:col-span-7 space-y-3">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner">
                <img
                  src={listing.images[activeImageIndex] || listing.images[0]}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md text-amber-300 text-xs font-bold px-3 py-1 rounded-lg">
                  {listing.grade}
                </div>
              </div>

              {/* Thumbnails */}
              {listing.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {listing.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-20 h-16 rounded-xl overflow-hidden border-2 transition ${
                        activeImageIndex === idx ? 'border-emerald-600 ring-2 ring-emerald-500/30' : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Price & Primary Details Column */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <div className="text-3xl font-black text-emerald-800 font-display">
                    Rs. {listing.price.toLocaleString()}
                    <span className="text-sm font-semibold text-slate-500 ml-1.5">
                      {listing.priceUnit}
                    </span>
                  </div>
                </div>

                <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug mb-3">
                  {listing.title}
                </h1>

                {/* Seller Rating Badge */}
                <div className="flex items-center gap-2 mb-3 bg-amber-50/80 p-2.5 rounded-xl border border-amber-200/60">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star} 
                        className={`w-3.5 h-3.5 ${star <= Math.round(listing.sellerRating || 5) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-800">
                    {listing.sellerRating || 4.9} / 5.0
                  </span>
                  <span className="text-xs text-slate-500">
                    ({reviews.length || listing.reviewsCount || 1} Reviews)
                  </span>
                </div>

                {/* Free Location info */}
                <div className="flex items-center gap-2 text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-800">{listing.city}</span>
                    <span className="text-slate-500"> • {listing.generalArea}</span>
                  </div>
                </div>

                {/* Crop Specs Badges */}
                <div className="grid grid-cols-2 gap-2.5 text-xs mb-5">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">Quantity</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                      <Scale className="w-3.5 h-3.5 text-emerald-600" />
                      {listing.quantity} {listing.unit}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">Variety</span>
                    <span className="font-bold text-slate-800 truncate block mt-0.5" title={listing.cropVariety || 'General / Standard'}>
                      {listing.cropVariety || 'General / Standard'}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">Packaging</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                      <Package className="w-3.5 h-3.5 text-amber-600" />
                      {listing.packagingType}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[10px] font-semibold uppercase">Moisture</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                      <Droplets className="w-3.5 h-3.5 text-blue-600" />
                      {listing.moisturePercentage ? `${listing.moisturePercentage}% Dry` : 'Certified Standard'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Harvest & Posted metadata */}
              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Crop Harvest: {listing.harvestYear}
                </span>
                <span>Posted: {new Date(listing.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-slate-50/80 rounded-2xl p-4 sm:p-5 border border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Seller Description & Crop Notes
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {listing.description}
            </p>
          </div>

          {/* =========================================================================
              CRITICAL REVENUE MODEL SECTION: CONTACT & EXACT LOCATION REVEAL (RS. 10 OR 1 FREE REFERRAL)
             ========================================================================= */}
          <div className="relative rounded-2xl overflow-hidden border transition-all">
            {isUnlocked ? (
              /* UNLOCKED STATE */
              <div className="bg-gradient-to-br from-emerald-50 via-white to-emerald-50/40 p-5 sm:p-6 border-emerald-300">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-emerald-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                      <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                          Contact Unlocked
                        </span>
                        <span className="text-[10px] bg-emerald-200 text-emerald-950 font-bold px-1.5 py-0.2 rounded">
                          Direct Deal Access
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                        {listing.sellerName}
                        {listing.sellerVerified && (
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        )}
                      </h4>
                    </div>
                  </div>

                  <div className="text-xs text-emerald-700 bg-white/80 px-3 py-1.5 rounded-xl border border-emerald-200 font-medium">
                    Verified Phone & Mandi Address Active
                  </div>
                </div>

                {/* Unlocked Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Phone & Calling */}
                  <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs">
                    <span className="text-xs text-slate-500 font-medium block mb-1">
                      Seller Mobile Number
                    </span>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-lg font-black font-mono text-slate-900 tracking-wide">
                        {listing.sellerPhone}
                      </span>
                      <button
                        onClick={handleCopyPhone}
                        className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg transition cursor-pointer"
                      >
                        {copiedPhone ? 'Copied!' : 'Copy'}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${listing.sellerPhone}`}
                        className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition"
                      >
                        <Phone className="w-4 h-4" />
                        <span>Call Seller</span>
                      </a>
                      <a
                        href={`https://wa.me/92${listing.sellerPhone.replace(/^0/, '')}?text=Hello%20${encodeURIComponent(listing.sellerName)},%20I%20saw%20your%20ad%20for%20${encodeURIComponent(listing.title)}%20on%20KisanMandi.`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>

                  {/* Exact Address */}
                  <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs flex flex-col justify-between">
                    <div>
                      <span className="text-xs text-slate-500 font-medium block mb-1">
                        Exact Pickup Warehouse / Mandi Address
                      </span>
                      <div className="flex items-start gap-2 text-xs font-semibold text-slate-800 leading-snug">
                        <Building2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{listing.exactAddress}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-100">
                      💡 Tip: Visit during Mandi business hours (08:00 AM - 05:00 PM) for physical grain inspection.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* LOCKED STATE (PAYWALL) */
              <div className="bg-gradient-to-br from-amber-50/60 via-white to-amber-50/30 p-5 sm:p-6 border-amber-300">
                <div className="flex items-start gap-3.5 mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-md shrink-0">
                    <Lock className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded">
                        Contact Reveal Fee: Rs. 10 (یا 1 ریفرل پر فری)
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-slate-900 mt-0.5">
                      Seller Mobile Number & Exact Address are Protected
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 max-w-xl">
                      In line with our verified agricultural marketplace policy, pay a standard one-time fee of <strong className="text-slate-900 font-bold">Rs. 10</strong> from your wallet, or use a <strong className="text-emerald-800 font-bold">Free Referral Credit</strong> to unlock this seller's complete phone number, WhatsApp link, and exact Mandi warehouse address.
                    </p>
                  </div>
                </div>

                {/* Masked Preview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                  <div className="bg-white/80 p-3 rounded-xl border border-dashed border-amber-300 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">Phone Number:</span>
                    <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      0300 ••••••• [Locked]
                    </span>
                  </div>
                  <div className="bg-white/80 p-3 rounded-xl border border-dashed border-amber-300 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">Exact Warehouse:</span>
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded truncate max-w-[180px]">
                      Shop #••, [Address Hidden]
                    </span>
                  </div>
                </div>

                {/* Wallet Balance & Action */}
                <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Your Wallet & Referral Credits
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-slate-900">
                          Rs. {currentUser ? currentUser.walletBalance : 0}
                        </span>
                        {currentUser && (currentUser.referralCredits || 0) > 0 && (
                          <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Gift className="w-3 h-3 text-amber-600" />
                            {currentUser.referralCredits} Free Unlock{currentUser.referralCredits === 1 ? '' : 's'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                    {!currentUser ? (
                      <button
                        onClick={onOpenAuth}
                        className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm py-2.5 px-5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                      >
                        <span>Login with Mobile to Unlock</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <>
                        {/* Option 1: Use 1 Free Referral Credit if available! */}
                        {hasReferralCredits && (
                          <button
                            onClick={handleReferralUnlock}
                            disabled={isProcessing}
                            className="flex-1 sm:flex-none bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                          >
                            <Gift className="w-4 h-4 fill-current" />
                            <span>Use 1 Free Referral Credit</span>
                          </button>
                        )}

                        {/* Option 2: Pay Rs. 10 from Wallet */}
                        {hasEnoughBalance ? (
                          <div className="flex flex-col sm:flex-row items-center gap-2">
                            <button
                              onClick={handlePayToUnlock}
                              disabled={isProcessing}
                              className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold text-xs sm:text-sm py-2.5 px-5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-700/20 disabled:opacity-50"
                            >
                              <Sparkles className="w-4 h-4 text-amber-300" />
                              <span>
                                {isProcessing 
                                  ? (lang === 'en' ? 'Processing...' : 'پراسیسنگ...') 
                                  : `${t.unlockContact} (${Math.floor((currentUser?.walletBalance || 0) / 10)} ${lang === 'en' ? 'free contacts left' : 'مفت نمبرز باقی'})`}
                              </span>
                            </button>
                          </div>
                        ) : !hasReferralCredits ? (
                          <div className="flex flex-col items-stretch gap-2.5 w-full bg-rose-50 border border-rose-200 p-3.5 rounded-2xl">
                            <div className="flex items-start gap-2 text-rose-800 text-xs">
                              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                              <div>
                                <strong className="font-bold block">{t.lowBalanceAlert}</strong>
                                <span>{t.depositRequired}</span>
                              </div>
                            </div>
                            <button
                              onClick={onOpenWallet}
                              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                            >
                              <Wallet className="w-4 h-4" />
                              <span>{t.depositTitle} (JazzCash / EasyPaisa)</span>
                            </button>
                          </div>
                        ) : null}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* =========================================================================
              SELLER RATINGS & REVIEWS SECTION (ریویو اور ریٹنگ سسٹم)
             ========================================================================= */}
          <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200 space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                  <span>Trader Ratings & Reviews (سیلر ریٹنگ اور کسٹمر فیڈبیک)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verified feedback from agricultural traders and buyers who dealt with {listing.sellerName}.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-lg font-black text-amber-600 font-display">
                  {listing.sellerRating || 4.9}
                </span>
                <div className="text-[11px] text-slate-500 leading-tight">
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                  <span>{reviews.length} total reviews</span>
                </div>
              </div>
            </div>

            {/* Write a Review Form */}
            <form onSubmit={handleReviewSubmit} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <span className="text-xs font-bold text-slate-800 block">
                Rate This Seller (اس سیلر کو ریٹنگ دیں):
              </span>

              {/* Star Picker */}
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setNewRating(star)}
                    className="p-1 hover:scale-115 transition transform cursor-pointer"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= (hoverRating || newRating)
                          ? 'fill-amber-400 text-amber-500'
                          : 'text-slate-200'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-slate-700 ml-2">
                  {hoverRating || newRating} / 5 Stars
                </span>
              </div>

              {/* Comment text area */}
              <textarea
                rows={2}
                required
                placeholder="Write your honest review (e.g. moisture was accurate, genuine crop weight, prompt loading in mandi)..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 focus:border-emerald-600 rounded-xl text-xs text-slate-900 outline-none"
              />

              <div className="flex items-center justify-between">
                {reviewSuccessMessage ? (
                  <span className="text-xs font-bold text-emerald-700">
                    {reviewSuccessMessage}
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400">
                    Only honest mandi transaction reviews are approved.
                  </span>
                )}

                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-2 px-4 rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingReview ? 'Posting...' : 'Post Review (ریویو جمع کریں)'}</span>
                </button>
              </div>
            </form>

            {/* List of Previous Reviews */}
            <div className="space-y-3">
              {reviews.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  No reviews yet. Be the first trader to rate {listing.sellerName}!
                </div>
              ) : (
                reviews.map((rev) => (
                  <div key={rev.id} className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-2xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center">
                          {rev.reviewerName.slice(0, 1)}
                        </span>
                        <span className="text-xs font-bold text-slate-800">{rev.reviewerName}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-medium flex items-center gap-0.5">
                          <UserCheck className="w-2.5 h-2.5 text-emerald-600" />
                          Verified Buyer
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3 h-3 ${s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed pl-8">
                      {rev.comment}
                    </p>
                    <div className="text-[10px] text-slate-400 pl-8">
                      {new Date(rev.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>KisanMandi Pay-Per-View Contact Security</span>
          <button
            onClick={onClose}
            className="font-semibold text-slate-700 hover:text-slate-900 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
