export type CropCategory = 'all' | 'wheat' | 'rice' | 'flour' | 'pulses' | 'other_grains';

export interface User {
  id: string;
  name: string;
  phone: string;
  city: string;
  area: string;
  role: 'user' | 'admin';
  walletBalance: number; // in PKR
  unlockedListingIds: string[]; // IDs of listings for which this user paid Rs. 10
  status: 'active' | 'banned';
  registeredAt: string;
  avatar?: string;
  referralCode: string; // e.g. "KM-4567"
  referredBy?: string;
  referralCredits: number; // Free contact reveals available (1 free unlock per referral!)
  totalReferralsCount: number;
}

export interface Review {
  id: string;
  sellerId: string;
  sellerName: string;
  listingId?: string;
  reviewerId: string;
  reviewerName: string;
  rating: number; // 1 to 5 stars
  comment: string;
  createdAt: string;
}

export interface Listing {
  id: string;
  title: string;
  category: 'wheat' | 'rice' | 'flour' | 'pulses' | 'other_grains';
  cropVariety?: string; // Optional (e.g. "Super Basmati 1121", "Desi Sharbati")
  quantity: number;
  unit: string; // Flexible (e.g. "Maund (من)", "Bags / Tora (توڑا / بوری)", "Kilogram (کلو)", or custom "100kg Tora")
  price: number; // in PKR
  priceUnit: string; // Flexible (e.g. "per Maund", "per Bag / Tora", "per Kg", "Total Lot")
  city: string;
  generalArea: string; // Free to view (e.g., "Ghalla Mandi, Jhang Road")
  exactAddress: string; // Locked! Revealed only after Rs. 10 payment or Free Referral Credit
  sellerId: string;
  sellerName: string;
  sellerPhone: string; // Locked! Revealed only after Rs. 10 payment or Free Referral Credit
  sellerWhatsApp?: string;
  sellerVerified: boolean;
  sellerRating?: number; // e.g. 4.9
  reviewsCount?: number; // e.g. 14 reviews
  images: string[];
  description: string;
  grade: 'Premium Grade A' | 'Grade B Commercial' | 'Standard Milling' | 'Export Quality';
  moisturePercentage?: number;
  packagingType: '50kg Jute Bag' | '50kg Polypropylene Bag' | 'Bulk / Loose' | 'Cartons' | string;
  harvestYear: string;
  status: 'active' | 'blocked' | 'sold';
  isFeatured?: boolean; // Premium Featured Ad (Rs. 50 Fee - Pins to Top like OLX)
  featuredUntil?: string;
  blockReason?: string;
  viewsCount: number;
  contactsUnlockedCount: number;
  createdAt: string;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  userName: string;
  type: 'deposit' | 'contact_unlock_fee' | 'featured_ad_fee' | 'admin_adjustment';
  amount: number; // Positive for deposit, negative for fee deduction
  method?: 'JazzCash' | 'EasyPaisa' | 'Bank Transfer / Raast' | 'System Wallet' | 'Referral Credit';
  referenceId?: string;
  listingId?: string;
  listingTitle?: string;
  sellerId?: string;
  sellerName?: string;
  timestamp: string;
  status: 'completed' | 'pending' | 'failed';
  note?: string;
}

export interface PlatformFinancials {
  totalRevenueFromFees: number; // Admin accumulated profit from Rs. 10 per contact
  totalRevenueFromFeaturedAds: number; // Admin profit from Rs. 50 Featured Posts
  totalWalletDeposits: number;
  totalActiveWalletsBalance: number;
  contactUnlockFee: number; // Default 10 PKR
  featuredAdFee: number; // Default 50 PKR
  minDepositAmount: number; // 100 PKR
  maxDepositAmount: number; // 100 PKR
  receiverEasyPaisaAccount: string; // "03428046383"
  receiverAccountTitle: string; // "KisanMandi Official Settlement"
  gatewayProvider: 'Daraz-Style Automated Direct Gateway' | 'EasyPaisa Merchant API';
}
