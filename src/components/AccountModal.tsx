import React, { useState } from 'react';
import { User } from '../types';
import { Language, TRANSLATIONS } from '../utils/translations';
import { 
  X, 
  User as UserIcon, 
  Phone, 
  Wallet, 
  Gift, 
  Share2, 
  LogOut, 
  ArrowRightLeft, 
  Sparkles, 
  CheckCircle, 
  Copy,
  Plus,
  Globe,
  Download,
  Loader2,
  Check
} from 'lucide-react';
import { downloadSourceZip } from '../utils/downloadHelper';

interface AccountModalProps {
  currentUser: User | null;
  lang?: Language;
  onToggleLang?: () => void;
  onClose: () => void;
  onLogout: () => void;
  onOpenWallet: () => void;
  onOpenReferral: () => void;
  onSwitchUser: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  currentUser,
  lang = 'en',
  onToggleLang,
  onClose,
  onLogout,
  onOpenWallet,
  onOpenReferral,
  onSwitchUser,
}) => {
  const t = TRANSLATIONS[lang];
  const [copiedCode, setCopiedCode] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [downloadZipSuccess, setDownloadZipSuccess] = useState(false);

  if (!currentUser) return null;

  const handleDownloadZip = async () => {
    setIsDownloadingZip(true);
    const ok = await downloadSourceZip('kisanmandi-full-source-code.zip');
    setIsDownloadingZip(false);
    if (ok) {
      setDownloadZipSuccess(true);
      setTimeout(() => setDownloadZipSuccess(false), 3000);
    }
  };

  const handleCopyCode = () => {
    if (currentUser.referralCode) {
      navigator.clipboard.writeText(currentUser.referralCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `🌾 Join KisanMandi Pakistan's Premier Agricultural Commodities Trading App!\nUse my referral code: *${currentUser.referralCode}* to get Rs. 100 free welcome balance to unlock 10 seller contacts for free!\nInstall app: https://kisanmandi.pk`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const unlockedCount = currentUser.unlockedListingIds?.length || 0;
  const contactsPossible = Math.floor(currentUser.walletBalance / 10);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[94vh] flex flex-col animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white px-6 py-5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center overflow-hidden shadow-inner">
              <img
                src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                alt={currentUser.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-display text-white">
                  {currentUser.name}
                </h2>
                <span className="text-[10px] font-bold bg-amber-400 text-emerald-950 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {t.verifiedTrader}
                </span>
              </div>
              <p className="text-xs text-emerald-200 font-mono flex items-center gap-1.5 mt-0.5">
                <Phone className="w-3 h-3" />
                <span>{currentUser.phone}</span>
                <span>•</span>
                <span>{currentUser.city}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onToggleLang && (
              <button
                onClick={onToggleLang}
                className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-emerald-100 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                title="Switch Language"
              >
                <Globe className="w-3 h-3" />
                <span>{lang === 'en' ? 'اردو' : 'EN'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-emerald-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title={t.close}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto">
          {/* Wallet Balance Card */}
          <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/60 rounded-2xl p-4 border border-emerald-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                    {t.walletBalance}
                  </span>
                  <div className="text-2xl font-black text-slate-900 font-display">
                    Rs. {currentUser.walletBalance}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onOpenWallet();
                }}
                className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-700/20 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.depositTitle}</span>
              </button>
            </div>

            {/* Non-withdrawable Signup Bonus Notice */}
            <div className="mt-3 pt-3 border-t border-emerald-200/70 text-xs text-emerald-950 space-y-1 bg-white/70 p-2.5 rounded-xl">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-snug">
                  <strong>{lang === 'en' ? 'Welcome Bonus Policy:' : 'ویلکم بونس پالیسی:'}</strong>{' '}
                  {t.welcomeBonusNote}
                </p>
              </div>
              <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-800 pt-1">
                <span>{t.contactsRemaining}:</span>
                <span className="font-bold text-slate-900 bg-emerald-200/70 px-2 py-0.5 rounded-md">
                  {contactsPossible} {lang === 'en' ? 'contacts' : 'مزید نمبرز'}
                </span>
              </div>
            </div>
          </div>

          {/* Referral & Free Unlocks Section */}
          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
                  <Gift className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-950">{t.referralTitle}</h4>
                  <p className="text-[11px] text-amber-800">{t.referralDesc}</p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-black text-amber-950">
                  {currentUser.referralCredits || 0} Free
                </div>
                <div className="text-[10px] text-amber-800 font-semibold">{t.freeUnlocks}</div>
              </div>
            </div>

            {/* Referral Code Box */}
            <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-amber-200">
              <div className="flex-1 text-center font-mono font-bold text-amber-950 tracking-wider text-sm">
                {currentUser.referralCode || `KM-${currentUser.phone.slice(-4)}`}
              </div>
              <button
                onClick={handleCopyCode}
                className="px-2.5 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                {copiedCode ? <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? t.codeCopied : t.copyCode}</span>
              </button>
              <button
                onClick={handleWhatsAppShare}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{t.shareWhatsApp}</span>
              </button>
            </div>
          </div>

          {/* Developer Source Code ZIP Download Card */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-300/80 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs shadow-2xs">
                  ZIP
                </div>
                <div>
                  <h4 className="font-bold text-xs text-amber-950">
                    {lang === 'en' ? 'Full Project ZIP for Developer' : 'ڈیولپر کے لیے مکمل پروجیکٹ زپ فائل'}
                  </h4>
                  <p className="text-[10px] text-amber-800">
                    {lang === 'en' ? 'All source code, backend, PWA & Android APK guide (115 KB)' : 'تمام سورس فائلیں، بیک اینڈ سرور اور اینڈرائیڈ گائیڈ'}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleDownloadZip}
              disabled={isDownloadingZip}
              className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition shadow-xs cursor-pointer text-center disabled:opacity-50"
            >
              {isDownloadingZip ? (
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
              ) : downloadZipSuccess ? (
                <Check className="w-4 h-4 text-emerald-950 stroke-[3]" />
              ) : (
                <Download className="w-4 h-4 stroke-[2.5]" />
              )}
              <span>
                {isDownloadingZip
                  ? (lang === 'en' ? 'Downloading ZIP File...' : 'زپ فائل ڈاؤنلوڈ ہو رہی ہے...')
                  : downloadZipSuccess
                  ? (lang === 'en' ? '✓ Download Started!' : '✓ ڈاؤنلوڈ شروع ہو گیا!')
                  : (lang === 'en' ? 'Download Project ZIP File (.zip)' : 'مکمل زپ فائل ڈاؤنلوڈ کریں (.zip)')}
              </span>
            </button>
          </div>

          {/* Account Details Info */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2.5 text-xs text-slate-700">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5 text-emerald-700" />
              <span>{lang === 'en' ? 'Profile Details' : 'پروفائل کی معلومات'}</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block">{lang === 'en' ? 'Mandi / City' : 'شہر / منڈی'}</span>
                <span className="font-bold text-slate-800">{currentUser.city}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-400 block">{lang === 'en' ? 'Unlocked Deals' : 'کھولے گئے نمبرز'}</span>
                <span className="font-bold text-slate-800">{unlockedCount} {lang === 'en' ? 'Sellers' : 'کسٹمرز'}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Switch User & Logout inside Account */}
          <div className="space-y-2.5 pt-2">
            <button
              onClick={() => {
                onClose();
                onSwitchUser();
              }}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <ArrowRightLeft className="w-4 h-4 text-slate-500" />
              <span>{t.switchAccount}</span>
            </button>

            {/* Logout Button (Inside Account as requested) */}
            {showLogoutConfirm ? (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 text-center space-y-2 animate-in fade-in">
                <p className="text-xs font-bold text-rose-900">
                  {t.confirmLogoutTitle}
                </p>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => {
                      onLogout();
                      onClose();
                    }}
                    className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer transition shadow-xs"
                  >
                    {t.confirmLogoutYes}
                  </button>
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    className="px-4 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs cursor-pointer transition"
                  >
                    {t.cancel}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4 stroke-[2.2]" />
                <span>{t.logout}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
