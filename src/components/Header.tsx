import React, { useState } from 'react';
import { User } from '../types';
import { Language, TRANSLATIONS } from '../utils/translations';
import { 
  Sprout, 
  ShieldCheck, 
  LogIn,
  UserPlus,
  Search,
  Smartphone,
  Globe,
  Plus,
  TrendingUp,
  Gift,
  ArrowRightLeft,
  Download,
  Check,
  Loader2
} from 'lucide-react';

interface HeaderProps {
  currentUser: User | null;
  lang: Language;
  onToggleLang: () => void;
  onOpenPostAd: () => void;
  onOpenAccount: () => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onToggleAdmin: () => void;
  isAdminView: boolean;
  onSearchChange: (query: string) => void;
  searchQuery: string;
  onOpenInstallApp: () => void;
  onSecretAdminClick: () => void;
  onOpenReferral?: () => void;
  onOpenRates?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  lang,
  onToggleLang,
  onOpenPostAd,
  onOpenAccount,
  onOpenAuth,
  onToggleAdmin,
  isAdminView,
  onSearchChange,
  searchQuery,
  onOpenInstallApp,
  onSecretAdminClick,
  onOpenReferral,
  onOpenRates,
}) => {
  const t = TRANSLATIONS[lang];
  const [tapCount, setTapCount] = useState(0);

  const handleLogoTap = () => {
    const newCount = tapCount + 1;
    setTapCount(newCount);
    if (newCount >= 5) {
      setTapCount(0);
      onSecretAdminClick();
    }
    setTimeout(() => {
      setTapCount(0);
    }, 3000);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-950/10 shadow-xs">
      {/* Exit-admin bar (only visible while the admin panel is open) */}
      {isAdminView && (
        <div className="bg-emerald-900 text-emerald-100 text-xs py-1.5 px-3 sm:px-4 flex justify-end">
          <button
            onClick={onToggleAdmin}
            className="font-bold flex items-center gap-1 px-2 py-0.5 rounded bg-amber-400 text-amber-950 transition cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t.exitAdmin}</span>
          </button>
        </div>
      )}

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Logo with 5-tap developer easter egg */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div 
              onClick={handleLogoTap}
              className="flex items-center gap-2 group cursor-pointer select-none"
              title="KisanMandi"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-amber-400 shadow-md shadow-emerald-900/10 group-hover:scale-105 transition transform shrink-0">
                <Sprout className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900 font-display">
                    Kisan<span className="text-emerald-700">Mandi</span>
                  </span>
                  <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 hidden xs:inline">
                    {t.agriOlx}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-medium -mt-0.5 hidden sm:block">
                  {t.tagline}
                </p>
              </div>
            </div>
          </div>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-md mx-3">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-xl outline-none transition"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Right Action Bar: Language Switcher, Desktop-Only Account/Post */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* LANGUAGE SELECTOR TOGGLE (English ↔ اردو) */}
            <button
              onClick={onToggleLang}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-slate-800 text-xs font-bold transition shadow-2xs cursor-pointer group"
              title="Switch Language (انگریزی / اردو)"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600 group-hover:rotate-45 transition duration-200" />
              <span>{lang === 'en' ? 'English' : 'اردو'}</span>
              <span className="text-[10px] text-slate-400 font-normal">|</span>
              <span className="text-[11px] text-emerald-700 font-semibold">{lang === 'en' ? 'اردو' : 'EN'}</span>
            </button>

            {/* DESKTOP ONLY: Referral Badge (hidden on mobile to prevent clutter) */}
            {onOpenReferral && (
              <button
                onClick={onOpenReferral}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100/80 border border-amber-200 text-amber-950 transition cursor-pointer text-xs font-bold"
                title="Refer Friends & Earn Free Contact Unlocks"
              >
                <Gift className="w-3.5 h-3.5 text-amber-600" />
                <span>{currentUser ? `${currentUser.referralCredits ?? 0} Free` : t.freeUnlocks}</span>
              </button>
            )}

            {/* DESKTOP ONLY: Post Ad Button (Hidden on Mobile because Bottom Nav already has Sell!) */}
            <button
              onClick={onOpenPostAd}
              className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold text-xs shadow-sm transition cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.8]" />
              <span>{t.sell}</span>
            </button>

            {/* DESKTOP ONLY: User Account / Login Button (Hidden on Mobile because Bottom Nav already has Account!) */}
            <div className="hidden md:flex items-center">
              {currentUser ? (
                <button
                  onClick={onOpenAccount}
                  className="flex items-center gap-2 p-1 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition text-left cursor-pointer"
                >
                  <img
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-emerald-500"
                  />
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[100px]">
                      {currentUser.name.split(' ')[0]}
                    </p>
                    <p className="text-[10px] text-emerald-700 font-semibold">
                      Rs. {currentUser.walletBalance}
                    </p>
                  </div>
                </button>
              ) : (
                <button
                  onClick={() => onOpenAuth('login')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{t.login}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="mt-2 md:hidden">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-emerald-600 transition"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
