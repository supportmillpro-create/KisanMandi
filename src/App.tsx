import React, { useState, useEffect, useMemo } from 'react';
import { 
  Listing, 
  User, 
  WalletTransaction, 
  PlatformFinancials, 
  CropCategory 
} from './types';
import { storageService } from './services/storageService';
import { POPULAR_CITIES } from './data/seedData';
import { Header } from './components/Header';
import { MandiTicker } from './components/MandiTicker';
import { BannerPromo } from './components/BannerPromo';
import { CropCard } from './components/CropCard';
import { CropDetailModal } from './components/CropDetailModal';
import { WalletModal } from './components/WalletModal';
import { PostAdModal } from './components/PostAdModal';
import { AuthModal } from './components/AuthModal';
import { AdminPanel } from './components/AdminPanel';
import { InstallAppModal } from './components/InstallAppModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { ReferralModal } from './components/ReferralModal';
import { AccountModal } from './components/AccountModal';
import { LiveRatesModal } from './components/LiveRatesModal';
import { Language, TRANSLATIONS } from './utils/translations';
import { 
  Filter, 
  Layers, 
  Search, 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  SlidersHorizontal,
  Sprout,
  Store,
  ChevronDown,
  Wallet,
  PlusCircle,
  Plus,
  TrendingUp,
  BarChart2,
  User as UserIcon,
  LogIn,
  Home,
  Lock,
  Smartphone,
  Download
} from 'lucide-react';

export default function App() {
  // State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [financials, setFinancials] = useState<PlatformFinancials>(storageService.getFinancials());

  // Language State (Defaults to English per user request, with 1-click toggle to Urdu)
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('kisanmandi_lang') as Language) || 'en';
  });

  const handleToggleLang = () => {
    const nextLang = lang === 'en' ? 'ur' : 'en';
    setLang(nextLang);
    localStorage.setItem('kisanmandi_lang', nextLang);
  };

  const t = TRANSLATIONS[lang];

  // Filter & Search states
  const [selectedCategory, setSelectedCategory] = useState<CropCategory>('all');
  const [selectedCity, setSelectedCity] = useState<string>('All Pakistan');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'newest' | 'price_low' | 'price_high'>('newest');
  const [filterUnlockedOnly, setFilterUnlockedOnly] = useState<boolean>(false);

  // Modals & Views
  const [activeListing, setActiveListing] = useState<Listing | null>(null);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [isPostAdOpen, setIsPostAdOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isInstallAppOpen, setIsInstallAppOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);
  const [isReferralOpen, setIsReferralOpen] = useState(false);
  const [isRatesOpen, setIsRatesOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  // Notification Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Initial load
  useEffect(() => {
    // Sync with central cloud database
    storageService.syncFromCloud().then(() => {
      refreshState();
    });

    const loadedUsers = storageService.getUsers();
    const current = storageService.getCurrentUser();
    const loadedListings = storageService.getListings();
    const loadedTxs = storageService.getTransactions();
    const loadedFin = storageService.getFinancials();

    setUsers(loadedUsers);
    setCurrentUser(current);
    setListings(loadedListings);
    setTransactions(loadedTxs);
    setFinancials(loadedFin);

    // Periodic cloud poll every 8 seconds so new ads and unlocks appear on top of all phones
    const pollInterval = setInterval(() => {
      storageService.syncFromCloud().then(() => {
        refreshState();
      });
    }, 8000);

    // Check for secret URL hash '#admin' or keyboard shortcut
    if (window.location.hash === '#admin') {
      setIsAdminLoginOpen(true);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        setIsAdminLoginOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Sync state helper
  const refreshState = () => {
    setUsers(storageService.getUsers());
    setCurrentUser(storageService.getCurrentUser());
    setListings(storageService.getListings());
    setTransactions(storageService.getTransactions());
    setFinancials(storageService.getFinancials());
  };

  // Open Auth with specific mode
  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  // Logout handler
  const handleLogout = () => {
    storageService.logout();
    refreshState();
    showToast('You have been logged out successfully.', 'info');
  };

  // Handle Contact Unlock (Pay Rs. 10)
  const handleUnlockContact = (listingId: string) => {
    if (!currentUser) {
      handleOpenAuth('login');
      return;
    }

    const result = storageService.unlockContact(currentUser.id, listingId);
    if (result.success) {
      refreshState();
      const updatedListing = storageService.getListings().find((l) => l.id === listingId);
      if (updatedListing) setActiveListing(updatedListing);
      showToast('✓ Rs. 10 deducted! Verified seller phone number & exact warehouse address unlocked.', 'success');
    } else {
      showToast(result.error || 'Failed to unlock contact', 'error');
      if (result.error?.includes('Insufficient')) {
        setIsWalletOpen(true);
      }
    }
  };

  // Handle Contact Unlock via Free Referral Credit (1 Free Contact Unlock per Friend)
  const handleUnlockWithReferral = (listingId: string) => {
    if (!currentUser) {
      handleOpenAuth('login');
      return;
    }

    const result = storageService.unlockContactWithReferralCredit(currentUser.id, listingId);
    if (result.success) {
      refreshState();
      const updatedListing = storageService.getListings().find((l) => l.id === listingId);
      if (updatedListing) setActiveListing(updatedListing);
      showToast('🎉 1 Free Referral Credit used! Verified seller contact unlocked successfully.', 'success');
    } else {
      showToast(result.error || 'Failed to use referral credit', 'error');
      if (result.error?.includes('No referral credits')) {
        setIsReferralOpen(true);
      }
    }
  };

  // Handle Upgrade Listing to Featured Ad (Rs. 50 Fee)
  const handleUpgradeToFeatured = (listingId: string) => {
    if (!currentUser) {
      handleOpenAuth('login');
      return;
    }

    const result = storageService.upgradeListingToFeatured(currentUser.id, listingId);
    if (result.success) {
      refreshState();
      const updatedListing = storageService.getListings().find((l) => l.id === listingId);
      if (updatedListing) setActiveListing(updatedListing);
      showToast('⭐ Listing boosted to TOP Featured Ad! (Rs. 50 fee deducted)', 'success');
    } else {
      showToast(result.error || 'Failed to promote listing', 'error');
      if (result.error?.includes('Insufficient')) {
        setIsWalletOpen(true);
      }
    }
  };

  // Called by the wallet screen after the server confirmed the payment: reload balance from the server
  const handlePaymentComplete = () => {
    storageService.syncFromCloud().then(() => {
      refreshState();
      showToast('✓ Rs. 100 payment confirmed and added to your wallet!', 'success');
    });
  };

  // Handle Post Ad
  const handlePostAd = (listingData: any) => {
    const newListing = storageService.addListing(listingData);
    refreshState();
    setIsPostAdOpen(false);
    showToast(`✓ "${newListing.title}" published successfully!`, 'success');
  };

  // Handle Login / Registration Success
  const handleLoginSuccess = (user: User) => {
    storageService.setCurrentUser(user.id);
    refreshState();
    showToast(`Welcome, ${user.name}! (Wallet Balance: Rs. ${user.walletBalance})`, 'success');
  };

  // Listing Select
  const handleSelectListing = (listing: Listing) => {
    storageService.incrementView(listing.id);
    refreshState();
    setActiveListing(listing);
  };

  // Admin Actions
  const handleUpdateListingStatus = (listingId: string, status: 'active' | 'blocked' | 'sold', reason?: string) => {
    storageService.updateListingStatus(listingId, status, reason);
    refreshState();
    showToast(`Ad status updated to ${status.toUpperCase()}`, 'info');
  };

  const handleDeleteListing = (listingId: string) => {
    storageService.deleteListing(listingId);
    refreshState();
    showToast('Listing removed permanently', 'info');
  };

  const handleToggleUserStatus = (userId: string, currentStatus: 'active' | 'banned') => {
    const newStatus = currentStatus === 'active' ? 'banned' : 'active';
    storageService.updateUserProfile(userId, { status: newStatus });
    refreshState();
    showToast(`User marked as ${newStatus.toUpperCase()}`, 'info');
  };

  const handleAdjustUserWallet = (userId: string, amount: number) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      storageService.updateUserProfile(userId, { walletBalance: user.walletBalance + amount });
      refreshState();
      showToast(`Adjusted wallet of ${user.name} by Rs. ${amount}`, 'success');
    }
  };

  const handleResetData = () => {
    storageService.resetAllData();
    refreshState();
    showToast('Database reset to initial demo seeds', 'info');
  };

  // Categories definitions (bilingual)
  const categories: { key: CropCategory; label: string; icon: string; count: number }[] = [
    { key: 'all', label: t.allCategories, icon: '🌾', count: listings.filter((l) => l.status === 'active').length },
    { key: 'wheat', label: t.wheat, icon: '🌾', count: listings.filter((l) => l.category === 'wheat' && l.status === 'active').length },
    { key: 'rice', label: t.rice, icon: '🍚', count: listings.filter((l) => l.category === 'rice' && l.status === 'active').length },
    { key: 'flour', label: t.flour, icon: '🥖', count: listings.filter((l) => l.category === 'flour' && l.status === 'active').length },
    { key: 'pulses', label: t.pulses, icon: '🫘', count: listings.filter((l) => l.category === 'pulses' && l.status === 'active').length },
    { key: 'other_grains', label: t.otherGrains, icon: '🌽', count: listings.filter((l) => l.category === 'other_grains' && l.status === 'active').length },
  ];

  // Filter listings
  const filteredListings = useMemo(() => {
    return listings
      .filter((listing) => {
        // In marketplace, hide blocked ads unless admin
        if (!isAdminView && listing.status !== 'active') return false;

        // Category filter
        if (selectedCategory !== 'all' && listing.category !== selectedCategory) return false;

        // City filter
        if (selectedCity !== 'All Pakistan' && listing.city !== selectedCity) return false;

        // Unlocked only filter
        if (filterUnlockedOnly && !currentUser?.unlockedListingIds?.includes(listing.id)) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = listing.title.toLowerCase().includes(q);
          const matchVariety = (listing.cropVariety || '').toLowerCase().includes(q);
          const matchCity = listing.city.toLowerCase().includes(q);
          const matchArea = listing.generalArea.toLowerCase().includes(q);
          const matchDesc = listing.description.toLowerCase().includes(q);
          if (!matchTitle && !matchVariety && !matchCity && !matchArea && !matchDesc) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_low') return a.price - b.price;
        if (sortBy === 'price_high') return b.price - a.price;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [listings, selectedCategory, selectedCity, searchQuery, sortBy, filterUnlockedOnly, currentUser, isAdminView]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-16 md:pb-0">
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed top-14 right-4 z-50 max-w-md animate-fade-in">
          <div
            className={`p-4 rounded-2xl shadow-xl border flex items-center gap-3 ${
              toast.type === 'success'
                ? 'bg-emerald-900 text-white border-emerald-700'
                : toast.type === 'error'
                ? 'bg-rose-900 text-white border-rose-700'
                : 'bg-slate-900 text-white border-slate-700'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            )}
            <p className="text-xs font-semibold leading-snug">{toast.message}</p>
          </div>
        </div>
      )}

      {/* Main Header (Clean, Customer Facing, Language Toggle, No duplicate mobile Sell/Account) */}
      <Header
        currentUser={currentUser}
        lang={lang}
        onToggleLang={handleToggleLang}
        onOpenPostAd={() => setIsPostAdOpen(true)}
        onOpenAccount={() => setIsAccountOpen(true)}
        onOpenAuth={handleOpenAuth}
        onToggleAdmin={() => setIsAdminView(!isAdminView)}
        isAdminView={isAdminView}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenInstallApp={() => setIsInstallAppOpen(true)}
        onSecretAdminClick={() => setIsAdminLoginOpen(true)}
        onOpenReferral={() => setIsReferralOpen(true)}
        onOpenRates={() => setIsRatesOpen(true)}
      />

      {/* Mandi Rate Marquee */}
      <MandiTicker lang={lang} onOpenRates={() => setIsRatesOpen(true)} />

      {/* Main Content Area */}
      {isAdminView ? (
        <AdminPanel
          users={users}
          listings={listings}
          transactions={transactions}
          financials={financials}
          onUpdateListingStatus={handleUpdateListingStatus}
          onDeleteListing={handleDeleteListing}
          onToggleUserStatus={handleToggleUserStatus}
          onAdjustUserWallet={handleAdjustUserWallet}
          onResetData={handleResetData}
          onCloseAdmin={() => setIsAdminView(false)}
          onSelectListing={handleSelectListing}
        />
      ) : (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 space-y-6 w-full">
          {/* Hero Promotional Banner */}
          <BannerPromo
            lang={lang}
            onOpenWallet={() => setIsWalletOpen(true)}
            onOpenPostAd={() => setIsPostAdOpen(true)}
            onOpenRates={() => setIsRatesOpen(true)}
          />

          {/* Commodity Categories Horizontal Selector */}
          <div className="bg-white rounded-2xl p-3 border border-slate-200/90 shadow-2xs">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scroll-smooth">
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
                    selectedCategory === cat.key
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/60'
                  }`}
                >
                  <span className="text-sm">{cat.icon}</span>
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      selectedCategory === cat.key
                        ? 'bg-emerald-700 text-emerald-100'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Secondary Filter & Sorting Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
            {/* Left: City Filter & Unlocked Filter */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="pl-3 pr-8 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-emerald-600 appearance-none cursor-pointer"
                >
                  {POPULAR_CITIES.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {currentUser && (
                <button
                  onClick={() => setFilterUnlockedOnly(!filterUnlockedOnly)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 cursor-pointer ${
                    filterUnlockedOnly
                      ? 'bg-emerald-100 border-emerald-300 text-emerald-950 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>✓ Contacts Unlocked By Me ({currentUser.unlockedListingIds?.length || 0})</span>
                </button>
              )}
            </div>

            {/* Right: Sort and Count */}
            <div className="flex items-center justify-between sm:justify-end gap-3">
              <span className="text-xs text-slate-500 font-medium">
                {t.showingListings}: <strong className="text-slate-900 font-bold">{filteredListings.length}</strong>
              </span>

              <div className="flex items-center gap-1.5 text-xs">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="py-1 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none cursor-pointer"
                >
                  <option value="newest">{t.newestFirst}</option>
                  <option value="price_low">{t.priceLowHigh}</option>
                  <option value="price_high">{t.priceHighLow}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active Search / Filter Badges */}
          {(searchQuery || selectedCategory !== 'all' || selectedCity !== 'All Pakistan' || filterUnlockedOnly) && (
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="text-slate-400 font-medium">Active filters:</span>
              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-lg font-semibold">
                  Category: {selectedCategory}
                  <button onClick={() => setSelectedCategory('all')} className="hover:text-emerald-950">✕</button>
                </span>
              )}
              {selectedCity !== 'All Pakistan' && (
                <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-lg font-semibold">
                  City: {selectedCity}
                  <button onClick={() => setSelectedCity('All Pakistan')} className="hover:text-blue-950">✕</button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 px-2 py-0.5 rounded-lg font-semibold">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="hover:text-amber-950">✕</button>
                </span>
              )}
              {filterUnlockedOnly && (
                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-lg font-semibold">
                  Unlocked Only
                  <button onClick={() => setFilterUnlockedOnly(false)} className="hover:text-emerald-950">✕</button>
                </span>
              )}
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedCity('All Pakistan');
                  setSearchQuery('');
                  setFilterUnlockedOnly(false);
                }}
                className="text-xs text-rose-600 hover:text-rose-800 font-semibold underline ml-2"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* Crop Listings Grid */}
          {filteredListings.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/90 shadow-xs space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                <Store className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-display">
                No agricultural listings found matching your criteria
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Try selecting a different city, removing filters, or be the first farmer/merchant to post a crop ad in this category!
              </p>
              <button
                onClick={() => setIsPostAdOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition cursor-pointer"
              >
                Post an Ad in This Category
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredListings.map((listing) => (
                <CropCard
                  key={listing.id}
                  listing={listing}
                  currentUser={currentUser}
                  onSelect={handleSelectListing}
                />
              ))}
            </div>
          )}

          {/* Informative Footer Banner on Pay-per-contact */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800">
            <div className="space-y-1.5 text-center md:text-left">
              <h3 className="text-base sm:text-lg font-bold font-display text-white">
                How KisanMandi's Rs. 10 Contact Reveal Protects You
              </h3>
              <p className="text-xs text-slate-400 max-w-xl">
                Unlike unmoderated platforms full of fake buyers and spam brokers, our Rs. 10 fee ensures only serious mandi buyers contact sellers. Deposit Rs. 100 via JazzCash or EasyPaisa to access 10 verified direct deals.
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <button
                onClick={() => setIsWalletOpen(true)}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
              >
                Open Digital Wallet
              </button>
              <button
                onClick={() => setIsPostAdOpen(true)}
                className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
              >
                Sell Your Crop
              </button>
            </div>
          </div>
        </main>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
              K
            </div>
            <span className="font-bold text-slate-800">KisanMandi</span>
            <span>— Agricultural Commodities Exchange of Pakistan</span>
          </div>

        </div>
      </footer>

      {/* ========================================================= */}
      {/* MOBILE BOTTOM NAVIGATION BAR (Mobile Phone App UI) */}
      {/* ========================================================= */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 md:hidden px-4 py-2 flex items-center justify-around shadow-lg">
        {/* Market Home */}
        <button
          onClick={() => {
            if (isAdminView) setIsAdminView(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex flex-col items-center gap-0.5 text-emerald-800"
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-bold">منڈی (Market)</span>
        </button>

        {/* GRAPH ICON: Live Mandi Commodity Rates (Replacing wallet in bottom bar as requested) */}
        <button
          onClick={() => setIsRatesOpen(true)}
          className="flex flex-col items-center gap-0.5 text-slate-700 hover:text-emerald-700 transition"
          title="Live Commodity Mandi Rates & Trends"
        >
          <TrendingUp className="w-5 h-5 text-emerald-600 stroke-[2.4]" />
          <span className="text-[10px] font-bold text-slate-800">لائیو ریٹس</span>
        </button>

        {/* Center Sell Button with WhatsApp style */}
        <button
          onClick={() => setIsPostAdOpen(true)}
          className="flex flex-col items-center gap-0.5 -mt-4 cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg border-2 border-white transition transform active:scale-95">
            <Plus className="w-6 h-6 stroke-[2.8]" />
          </div>
          <span className="text-[10px] font-bold text-slate-900">بیچیں (Sell)</span>
        </button>

        {/* Account Button (Opens Account modal which contains Logout, Wallet, Referrals) */}
        {currentUser ? (
          <button
            onClick={() => setIsAccountOpen(true)}
            className="flex flex-col items-center gap-0.5 text-slate-600 hover:text-emerald-700"
          >
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
              alt={currentUser.name}
              className="w-5 h-5 rounded-full object-cover ring-1 ring-emerald-500"
            />
            <span className="text-[10px] font-bold truncate max-w-[60px]">اکاؤنٹ</span>
          </button>
        ) : (
          <button
            onClick={() => handleOpenAuth('login')}
            className="flex flex-col items-center gap-0.5 text-emerald-700 font-bold"
          >
            <LogIn className="w-5 h-5" />
            <span className="text-[10px] font-bold">لاگ ان</span>
          </button>
        )}
      </div>

      {/* MODALS */}
      {/* 1. Detail Modal with Rs. 10 Unlock Button & Free Referral Unlock */}
      {activeListing && (
        <CropDetailModal
          listing={activeListing}
          currentUser={currentUser}
          lang={lang}
          onClose={() => setActiveListing(null)}
          onUnlockContact={handleUnlockContact}
          onUnlockWithReferral={handleUnlockWithReferral}
          onUpgradeToFeatured={handleUpgradeToFeatured}
          onOpenWallet={() => setIsWalletOpen(true)}
          onOpenAuth={() => handleOpenAuth('login')}
          onOpenReferral={() => setIsReferralOpen(true)}
        />
      )}

      {/* 2. Wallet Modal (JazzCash / EasyPaisa / Bank Deposit & Ledger) */}
      {isWalletOpen && (
        <WalletModal
          currentUser={currentUser}
          transactions={transactions}
          onClose={() => setIsWalletOpen(false)}
          onPaymentComplete={handlePaymentComplete}
        />
      )}

      {/* 3. Post Ad Modal (Direct Device Gallery Photo Upload) */}
      {isPostAdOpen && (
        <PostAdModal
          currentUser={currentUser}
          onClose={() => setIsPostAdOpen(false)}
          onSubmit={handlePostAd}
          onOpenAuth={() => handleOpenAuth('login')}
        />
      )}

      {/* 4. Auth Modal (Mobile OTP Login & Registration with Tabs) */}
      {isAuthOpen && (
        <AuthModal
          onClose={() => setIsAuthOpen(false)}
          onLoginSuccess={handleLoginSuccess}
          allUsers={users}
          initialMode={authMode}
        />
      )}

      {/* 5. Mobile App Install & Launch Guide Modal */}
      {isInstallAppOpen && (
        <InstallAppModal onClose={() => setIsInstallAppOpen(false)} />
      )}

      {/* 6. Secret Developer PIN Gateway Modal */}
      {isAdminLoginOpen && (
        <AdminLoginModal
          onClose={() => setIsAdminLoginOpen(false)}
          onSuccess={() => {
            setIsAdminView(true);
            showToast('✓ Developer Master Access Granted.', 'success');
          }}
        />
      )}

      {/* 7. Referral & Free Unlocks Modal */}
      {isReferralOpen && (
        <ReferralModal
          currentUser={currentUser}
          onClose={() => setIsReferralOpen(false)}
          onOpenAuth={() => {
            setIsReferralOpen(false);
            handleOpenAuth('register');
          }}
        />
      )}

      {/* 8. User Account & Profile Modal (Houses Logout inside Account as requested) */}
      {isAccountOpen && currentUser && (
        <AccountModal
          currentUser={currentUser}
          lang={lang}
          onToggleLang={handleToggleLang}
          onClose={() => setIsAccountOpen(false)}
          onLogout={handleLogout}
          onOpenWallet={() => setIsWalletOpen(true)}
          onOpenReferral={() => setIsReferralOpen(true)}
          onSwitchUser={() => handleOpenAuth('login')}
        />
      )}

      {/* 9. Live Mandi Commodity Rates Modal (Cotton, Wheat, Sugar, Maize, Rice without 3rd party branding) */}
      {isRatesOpen && (
        <LiveRatesModal
          lang={lang}
          onClose={() => setIsRatesOpen(false)}
          onSelectCommodityForAd={() => {
            setIsRatesOpen(false);
            setIsPostAdOpen(true);
          }}
        />
      )}
    </div>
  );
}
