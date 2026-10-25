import { Listing, User, WalletTransaction, PlatformFinancials, Review } from '../types';
import { INITIAL_USERS, INITIAL_LISTINGS, INITIAL_TRANSACTIONS, INITIAL_FINANCIALS, INITIAL_REVIEWS } from '../data/seedData';

const STORAGE_KEYS = {
  USERS: 'kisanmandi_users_v1',
  CURRENT_USER_ID: 'kisanmandi_current_user_id_v1',
  LISTINGS: 'kisanmandi_listings_v1',
  TRANSACTIONS: 'kisanmandi_transactions_v1',
  FINANCIALS: 'kisanmandi_financials_v1',
  REVIEWS: 'kisanmandi_reviews_v1',
};

class StorageService {
  // Sync with cloud server
  async syncFromCloud(): Promise<void> {
    try {
      const [resListings, resUsers, resFin, resTx, resRev] = await Promise.all([
        fetch('/api/listings').catch(() => null),
        fetch('/api/users').catch(() => null),
        fetch('/api/financials').catch(() => null),
        fetch('/api/transactions').catch(() => null),
        fetch('/api/reviews').catch(() => null),
      ]);

      if (resListings && resListings.ok) {
        const cloudListings = await resListings.json();
        if (Array.isArray(cloudListings) && cloudListings.length > 0) {
          this.saveListings(cloudListings);
        }
      }

      if (resUsers && resUsers.ok) {
        const cloudUsers = await resUsers.json();
        if (Array.isArray(cloudUsers) && cloudUsers.length > 0) {
          this.saveUsers(cloudUsers);
        }
      }

      if (resFin && resFin.ok) {
        const cloudFin = await resFin.json();
        if (cloudFin) {
          this.saveFinancials(cloudFin);
        }
      }

      if (resTx && resTx.ok) {
        const cloudTx = await resTx.json();
        if (Array.isArray(cloudTx) && cloudTx.length > 0) {
          localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(cloudTx));
        }
      }

      if (resRev && resRev.ok) {
        const cloudRev = await resRev.json();
        if (Array.isArray(cloudRev) && cloudRev.length > 0) {
          localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(cloudRev));
        }
      }
    } catch {
      // Offline fallback: Use cached local data smoothly
    }
  }

  // --- USERS ---
  getUsers(): User[] {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_USERS;
    }
  }

  saveUsers(users: User[]): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  getCurrentUser(): User | null {
    const currentId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    if (!currentId) {
      return null;
    }
    const users = this.getUsers();
    return users.find((u) => u.id === currentId) || null;
  }

  setCurrentUser(userId: string): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
  }

  registerOrLoginByPhone(
    phone: string, 
    name?: string, 
    city?: string, 
    area?: string, 
    referredByCode?: string
  ): { user: User; isNew: boolean; referralRewarded?: boolean } {
    const users = this.getUsers();
    const cleanPhone = phone.trim().replace(/\s+/g, '');
    let existing = users.find((u) => u.phone.replace(/\s+/g, '') === cleanPhone);

    if (existing) {
      this.setCurrentUser(existing.id);
      return { user: existing, isNew: false };
    }

    // Check if valid referral code or friend phone provided
    let referralRewarded = false;
    let referrerUser: User | null = null;
    let initialReferralCredits = 0;

    if (referredByCode && referredByCode.trim().length > 0) {
      const cleanRef = referredByCode.trim().toUpperCase();
      const cleanRefPhone = referredByCode.trim().replace(/\s+/g, '');
      const refIdx = users.findIndex(
        (u) => 
          (u.referralCode && u.referralCode.toUpperCase() === cleanRef) ||
          u.phone.replace(/\s+/g, '') === cleanRefPhone
      );

      if (refIdx !== -1) {
        referrerUser = users[refIdx];
        referrerUser.referralCredits = (referrerUser.referralCredits || 0) + 1;
        referrerUser.totalReferralsCount = (referrerUser.totalReferralsCount || 0) + 1;
        users[refIdx] = referrerUser;
        referralRewarded = true;
        initialReferralCredits = 1; // New user also gets 1 free unlock as referral gift!

        // Record reward transaction for referrer
        this.addTransaction({
          id: `tx_${Date.now()}_ref`,
          userId: referrerUser.id,
          userName: referrerUser.name,
          type: 'deposit',
          amount: 0,
          method: 'Referral Credit',
          referenceId: `REF-${Math.floor(100000 + Math.random() * 900000)}`,
          timestamp: new Date().toISOString(),
          status: 'completed',
          note: `Earned 1 Free Contact Unlock for referring new user (${cleanPhone})`,
        });

        // Sync referrer update to cloud
        fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(referrerUser),
        }).catch(() => {});
      }
    }

    // Create new user with 100 PKR complimentary welcome wallet deposit
    const newUser: User = {
      id: `user_${Date.now()}`,
      name: name && name.trim().length > 0 ? name.trim() : `Trader ${cleanPhone.slice(-4)}`,
      phone: cleanPhone,
      city: city || 'Faisalabad',
      area: area || 'Main Grain Market',
      role: 'user',
      walletBalance: 100, // Initial balance
      unlockedListingIds: [],
      status: 'active',
      registeredAt: new Date().toISOString(),
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
      referralCode: `KM-${cleanPhone.slice(-4)}`,
      referredBy: referrerUser ? referrerUser.id : undefined,
      referralCredits: initialReferralCredits,
      totalReferralsCount: 0,
    };

    users.push(newUser);
    this.saveUsers(users);
    this.setCurrentUser(newUser.id);

    // Sync to cloud server
    fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
    }).catch(() => {});

    // Record welcome deposit transaction
    this.addTransaction({
      id: `tx_${Date.now()}`,
      userId: newUser.id,
      userName: newUser.name,
      type: 'deposit',
      amount: 100,
      method: 'JazzCash',
      referenceId: `WELCOME-JC-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: new Date().toISOString(),
      status: 'completed',
      note: 'Initial welcome balance deposit (PKR 100)',
    });

    return { user: newUser, isNew: true, referralRewarded };
  }

  updateUserProfile(userId: string, data: Partial<User>): User | null {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) return null;
    users[idx] = { ...users[idx], ...data };
    this.saveUsers(users);

    fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(users[idx]),
    }).catch(() => {});

    return users[idx];
  }

  // --- LISTINGS ---
  getListings(): Listing[] {
    const data = localStorage.getItem(STORAGE_KEYS.LISTINGS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(INITIAL_LISTINGS));
      return INITIAL_LISTINGS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_LISTINGS;
    }
  }

  saveListings(listings: Listing[]): void {
    localStorage.setItem(STORAGE_KEYS.LISTINGS, JSON.stringify(listings));
  }

  addListing(listingData: Omit<Listing, 'id' | 'createdAt' | 'viewsCount' | 'contactsUnlockedCount' | 'status'>): Listing {
    const listings = this.getListings();
    const isFeatured = !!listingData.isFeatured;
    const newListing: Listing = {
      ...listingData,
      id: `listing_${Date.now()}`,
      createdAt: new Date().toISOString(),
      viewsCount: 1,
      contactsUnlockedCount: 0,
      status: 'active',
      isFeatured: isFeatured,
      featuredUntil: isFeatured ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() : undefined,
    };

    // If seller selected Featured / Premium Ad (Rs. 50), deduct from seller wallet
    if (isFeatured && listingData.sellerId) {
      const users = this.getUsers();
      const userIdx = users.findIndex((u) => u.id === listingData.sellerId);
      if (userIdx !== -1) {
        const user = users[userIdx];
        const fee = 50;
        if (user.walletBalance >= fee) {
          user.walletBalance -= fee;
          users[userIdx] = user;
          this.saveUsers(users);

          const financials = this.getFinancials();
          financials.totalRevenueFromFeaturedAds = (financials.totalRevenueFromFeaturedAds || 0) + fee;
          financials.totalActiveWalletsBalance -= fee;
          this.saveFinancials(financials);

          this.addTransaction({
            id: `tx_${Date.now()}_feat`,
            userId: user.id,
            userName: user.name,
            type: 'featured_ad_fee',
            amount: -fee,
            method: 'System Wallet',
            listingId: newListing.id,
            listingTitle: newListing.title,
            sellerId: user.id,
            sellerName: user.name,
            timestamp: new Date().toISOString(),
            status: 'completed',
            note: `Rs. 50 Paid for Featured Ad placement on top of KisanMandi`,
          });
        }
      }
    }

    listings.unshift(newListing);
    this.saveListings(listings);

    // Broadcast immediately to Cloud Server so all phones see it on top
    fetch('/api/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newListing),
    }).catch(() => {});

    return newListing;
  }

  incrementView(listingId: string): void {
    const listings = this.getListings();
    const idx = listings.findIndex((l) => l.id === listingId);
    if (idx !== -1) {
      listings[idx].viewsCount = (listings[idx].viewsCount || 0) + 1;
      this.saveListings(listings);
    }
  }

  updateListingStatus(listingId: string, status: 'active' | 'blocked' | 'sold', reason?: string): Listing | null {
    const listings = this.getListings();
    const idx = listings.findIndex((l) => l.id === listingId);
    if (idx === -1) return null;
    listings[idx].status = status;
    if (reason) listings[idx].blockReason = reason;
    this.saveListings(listings);

    fetch(`/api/listings/${listingId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, blockReason: reason }),
    }).catch(() => {});

    return listings[idx];
  }

  deleteListing(listingId: string): boolean {
    const listings = this.getListings();
    const filtered = listings.filter((l) => l.id !== listingId);
    this.saveListings(filtered);

    fetch(`/api/listings/${listingId}`, {
      method: 'DELETE',
    }).catch(() => {});

    return true;
  }

  // --- TRANSACTIONS & FINANCIALS ---
  getTransactions(): WalletTransaction[] {
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
      return INITIAL_TRANSACTIONS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  }

  addTransaction(tx: WalletTransaction): void {
    const transactions = this.getTransactions();
    transactions.unshift(tx);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }

  getFinancials(): PlatformFinancials {
    const data = localStorage.getItem(STORAGE_KEYS.FINANCIALS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.FINANCIALS, JSON.stringify(INITIAL_FINANCIALS));
      return INITIAL_FINANCIALS;
    }
    try {
      const parsed = JSON.parse(data);
      if (!parsed.receiverEasyPaisaAccount) {
        parsed.receiverEasyPaisaAccount = '03428046383';
      }
      return parsed;
    } catch {
      return INITIAL_FINANCIALS;
    }
  }

  saveFinancials(fin: PlatformFinancials): void {
    localStorage.setItem(STORAGE_KEYS.FINANCIALS, JSON.stringify(fin));
  }

  // --- REVENUE MODEL: PAY PKR 10 TO UNLOCK CONTACT ---
  unlockContact(userId: string, listingId: string): { success: boolean; error?: string } {
    const users = this.getUsers();
    const listings = this.getListings();
    const financials = this.getFinancials();

    const userIdx = users.findIndex((u) => u.id === userId);
    const listingIdx = listings.findIndex((l) => l.id === listingId);

    if (userIdx === -1) return { success: false, error: 'User not found. Please log in.' };
    if (listingIdx === -1) return { success: false, error: 'Listing not found.' };

    const user = users[userIdx];
    const listing = listings[listingIdx];

    // Already unlocked
    if (user.unlockedListingIds?.includes(listingId)) {
      return { success: true };
    }

    const fee = financials.contactUnlockFee || 10;

    // Check balance
    if (user.walletBalance < fee) {
      return {
        success: false,
        error: `Insufficient wallet balance. You have Rs. ${user.walletBalance}, but Rs. ${fee} is required to unlock this seller contact.`,
      };
    }

    // Deduct fee from user's wallet
    user.walletBalance -= fee;
    if (!user.unlockedListingIds) user.unlockedListingIds = [];
    user.unlockedListingIds.push(listingId);
    users[userIdx] = user;
    this.saveUsers(users);

    // Update listing unlocked stats
    listing.contactsUnlockedCount = (listing.contactsUnlockedCount || 0) + 1;
    listings[listingIdx] = listing;
    this.saveListings(listings);

    // Direct PKR 10 revenue goes to Admin Account
    financials.totalRevenueFromFees += fee;
    financials.totalActiveWalletsBalance -= fee;
    this.saveFinancials(financials);

    // Record transaction in ledger
    const newTx: WalletTransaction = {
      id: `tx_${Date.now()}`,
      userId: user.id,
      userName: user.name,
      type: 'contact_unlock_fee',
      amount: -fee,
      method: 'System Wallet',
      listingId: listing.id,
      listingTitle: listing.title,
      sellerId: listing.sellerId,
      sellerName: listing.sellerName,
      timestamp: new Date().toISOString(),
      status: 'completed',
      note: `Fee of Rs. ${fee} deducted to unlock phone & location for "${listing.title}"`,
    };
    this.addTransaction(newTx);

    // Sync to Cloud Server
    fetch('/api/wallet/unlock-contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, listingId }),
    }).catch(() => {});

    return { success: true };
  }

  // --- UNLOCK CONTACT WITH 1 FREE REFERRAL CREDIT ---
  unlockContactWithReferralCredit(userId: string, listingId: string): { success: boolean; error?: string } {
    const users = this.getUsers();
    const listings = this.getListings();

    const userIdx = users.findIndex((u) => u.id === userId);
    const listingIdx = listings.findIndex((l) => l.id === listingId);

    if (userIdx === -1) return { success: false, error: 'User not found. Please log in.' };
    if (listingIdx === -1) return { success: false, error: 'Listing not found.' };

    const user = users[userIdx];
    const listing = listings[listingIdx];

    if (user.unlockedListingIds?.includes(listingId)) {
      return { success: true };
    }

    if ((user.referralCredits || 0) < 1) {
      return { success: false, error: 'No free referral credits available.' };
    }

    user.referralCredits = (user.referralCredits || 0) - 1;
    if (!user.unlockedListingIds) user.unlockedListingIds = [];
    user.unlockedListingIds.push(listingId);
    users[userIdx] = user;
    this.saveUsers(users);

    listing.contactsUnlockedCount = (listing.contactsUnlockedCount || 0) + 1;
    listings[listingIdx] = listing;
    this.saveListings(listings);

    const newTx: WalletTransaction = {
      id: `tx_${Date.now()}_ref`,
      userId: user.id,
      userName: user.name,
      type: 'contact_unlock_fee',
      amount: 0,
      method: 'Referral Credit',
      listingId: listing.id,
      listingTitle: listing.title,
      sellerId: listing.sellerId,
      sellerName: listing.sellerName,
      timestamp: new Date().toISOString(),
      status: 'completed',
      note: `1 Free Referral Unlock used for "${listing.title}"`,
    };
    this.addTransaction(newTx);

    fetch('/api/wallet/unlock-contact-referral', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, listingId }),
    }).catch(() => {});

    return { success: true };
  }

  // --- UPGRADE AN AD TO FEATURED / PREMIUM (RS. 50 FEE) ---
  upgradeListingToFeatured(userId: string, listingId: string): { success: boolean; error?: string } {
    const users = this.getUsers();
    const listings = this.getListings();
    const financials = this.getFinancials();

    const userIdx = users.findIndex((u) => u.id === userId);
    const listingIdx = listings.findIndex((l) => l.id === listingId);

    if (userIdx === -1) return { success: false, error: 'User not found' };
    if (listingIdx === -1) return { success: false, error: 'Listing not found' };

    const user = users[userIdx];
    const listing = listings[listingIdx];
    const fee = financials.featuredAdFee || 50;

    if (user.walletBalance < fee) {
      return { success: false, error: `Insufficient wallet balance. You need Rs. ${fee} to feature this ad.` };
    }

    user.walletBalance -= fee;
    users[userIdx] = user;
    this.saveUsers(users);

    listing.isFeatured = true;
    listing.featuredUntil = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
    listings[listingIdx] = listing;
    this.saveListings(listings);

    financials.totalRevenueFromFeaturedAds = (financials.totalRevenueFromFeaturedAds || 0) + fee;
    financials.totalActiveWalletsBalance -= fee;
    this.saveFinancials(financials);

    const featTx: WalletTransaction = {
      id: `tx_${Date.now()}_feat`,
      userId: user.id,
      userName: user.name,
      type: 'featured_ad_fee',
      amount: -fee,
      method: 'System Wallet',
      listingId: listing.id,
      listingTitle: listing.title,
      sellerId: listing.sellerId,
      sellerName: listing.sellerName,
      timestamp: new Date().toISOString(),
      status: 'completed',
      note: `Rs. 50 Paid for Featured Ad. Pinned to top of KisanMandi like OLX.`,
    };
    this.addTransaction(featTx);

    fetch(`/api/listings/${listingId}/upgrade-featured`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    }).catch(() => {});

    return { success: true };
  }

  // --- REVIEWS & RATINGS SYSTEM ---
  getReviews(): Review[] {
    const data = localStorage.getItem(STORAGE_KEYS.REVIEWS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(INITIAL_REVIEWS));
      return INITIAL_REVIEWS;
    }
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_REVIEWS;
    }
  }

  getReviewsForSeller(sellerId: string): Review[] {
    const allReviews = this.getReviews();
    return allReviews.filter((r) => r.sellerId === sellerId);
  }

  addReview(reviewData: Omit<Review, 'id' | 'createdAt'>): Review {
    const reviews = this.getReviews();
    const newReview: Review = {
      ...reviewData,
      id: `rev_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    reviews.unshift(newReview);
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));

    // Recalculate seller's rating and review count across listings
    const sellerReviews = reviews.filter((r) => r.sellerId === reviewData.sellerId);
    const avgRating = Number(
      (sellerReviews.reduce((sum, r) => sum + Number(r.rating || 5), 0) / sellerReviews.length).toFixed(1)
    );

    const listings = this.getListings();
    let updated = false;
    listings.forEach((l) => {
      if (l.sellerId === reviewData.sellerId) {
        l.sellerRating = avgRating;
        l.reviewsCount = sellerReviews.length;
        updated = true;
      }
    });
    if (updated) {
      this.saveListings(listings);
    }

    // Sync to cloud
    fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReview),
    }).catch(() => {});

    return newReview;
  }

  // --- DARAZ-STYLE WALLET DEPOSIT (Auto-Debit to EasyPaisa 03428046383) ---
  depositToWallet(
    userId: string,
    amount: number,
    method: 'JazzCash' | 'EasyPaisa' | 'Bank Transfer / Raast',
    referenceId: string
  ): { success: boolean; user?: User; error?: string } {
    const users = this.getUsers();
    const financials = this.getFinancials();

    const userIdx = users.findIndex((u) => u.id === userId);
    if (userIdx === -1) return { success: false, error: 'User not found' };

    const user = users[userIdx];
    user.walletBalance += amount;
    users[userIdx] = user;
    this.saveUsers(users);

    financials.totalWalletDeposits += amount;
    financials.totalActiveWalletsBalance += amount;
    this.saveFinancials(financials);

    const newTx: WalletTransaction = {
      id: `tx_${Date.now()}`,
      userId: user.id,
      userName: user.name,
      type: 'deposit',
      amount: amount,
      method: method,
      referenceId: referenceId || `DEP-${Math.floor(1000000 + Math.random() * 9000000)}`,
      timestamp: new Date().toISOString(),
      status: 'completed',
      note: `Automated Daraz-style checkout deposit routed to EasyPaisa (${financials.receiverEasyPaisaAccount || '03428046383'})`,
    };
    this.addTransaction(newTx);

    // Sync to Cloud Server
    fetch('/api/wallet/deposit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, amount, method, referenceId }),
    }).catch(() => {});

    return { success: true, user };
  }

  // Reset to default seed
  resetAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.LISTINGS);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.FINANCIALS);
    localStorage.removeItem(STORAGE_KEYS.REVIEWS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
  }
}

export const storageService = new StorageService();
