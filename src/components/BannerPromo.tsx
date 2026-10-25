import React from 'react';
import { ShieldCheck, Wallet, Sparkles, CheckCircle2, TrendingUp, Plus } from 'lucide-react';
import { Language, TRANSLATIONS } from '../utils/translations';

interface BannerPromoProps {
  lang?: Language;
  onOpenWallet: () => void;
  onOpenPostAd: () => void;
  onOpenRates?: () => void;
}

export const BannerPromo: React.FC<BannerPromoProps> = ({ 
  lang = 'en', 
  onOpenWallet, 
  onOpenPostAd,
  onOpenRates
}) => {
  const t = TRANSLATIONS[lang];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-950 text-white p-5 sm:p-8 shadow-xl border border-emerald-700/50">
      {/* Background Glows */}
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        <div className="lg:col-span-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-amber-300 font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? "Pakistan's Digital Mandi for Grains & Crops" : "پاکستان کی ڈیجیٹل غلہ و کاٹن منڈی"}</span>
          </div>

          <h2 className="text-xl sm:text-3xl lg:text-4xl font-black font-display leading-tight tracking-tight text-white">
            {lang === 'en' 
              ? 'Buy & Sell Wheat, Rice, Cotton & Grains Directly' 
              : 'گندم، چاول، کپاس، مکئی اور دالوں کی براہ راست خرید و فروخت'}
          </h2>

          <p className="text-emerald-100 text-xs sm:text-sm max-w-2xl leading-relaxed">
            {lang === 'en'
              ? 'Connect directly with verified growers, millers, and grain merchants across Punjab, Sindh, KPK & Balochistan. Free crop browsing with verified direct contact deals.'
              : 'پنجاب، سندھ اور کے پی کے کے تصدیق شدہ کسانوں اور بیوپاریوں سے براہ راست رابطہ کریں۔ مفت اشتہارات اور تصدیق شدہ براہ راست سودے۔'}
          </p>

          {/* 3 Value Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-100 bg-emerald-950/40 px-3 py-2 rounded-xl border border-emerald-700/40">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{lang === 'en' ? 'Browse All Crops Free' : 'تمام فصلیں مفت دیکھیں'}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-100 bg-emerald-950/40 px-3 py-2 rounded-xl border border-emerald-700/40">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{lang === 'en' ? 'Rs. 10 Contact Reveal Fee' : '۱۰ روپے رابطہ ان لاک فیس'}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-100 bg-emerald-950/40 px-3 py-2 rounded-xl border border-emerald-700/40">
              <Wallet className="w-4 h-4 text-blue-300 shrink-0" />
              <span>{lang === 'en' ? 'JazzCash & EasyPaisa' : 'جاز کیش و ایزی پیسہ'}</span>
            </div>
          </div>
        </div>

        {/* Call to Actions on right */}
        <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-2.5 justify-center">
          <button
            onClick={onOpenPostAd}
            className="w-full bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 font-black text-xs sm:text-sm py-3 px-5 rounded-2xl shadow-lg shadow-amber-400/20 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer font-display"
          >
            <Plus className="w-4 h-4 stroke-[2.8]" />
            <span>{t.sell}</span>
          </button>

          {onOpenRates && (
            <button
              onClick={onOpenRates}
              className="w-full bg-white/10 hover:bg-white/20 active:bg-white/15 text-white font-bold text-xs sm:text-sm py-3 px-5 rounded-2xl border border-white/20 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <TrendingUp className="w-4 h-4 text-amber-300" />
              <span>{t.liveRates}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
