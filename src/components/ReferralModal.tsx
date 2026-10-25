import React, { useState } from 'react';
import { User } from '../types';
import { 
  X, 
  Gift, 
  Share2, 
  Copy, 
  Check, 
  Users, 
  Sparkles, 
  MessageCircle,
  PhoneCall,
  CheckCircle2,
  Lock
} from 'lucide-react';

interface ReferralModalProps {
  currentUser: User | null;
  onClose: () => void;
  onOpenAuth: () => void;
}

export const ReferralModal: React.FC<ReferralModalProps> = ({ currentUser, onClose, onOpenAuth }) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
        <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <Gift className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-display">
            Login to Get Your Referral Link
          </h2>
          <p className="text-xs text-slate-500">
            Sign up or log in to generate your unique referral code and earn 1 free seller contact reveal for every friend who joins!
          </p>
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-xs font-bold text-white shadow-md cursor-pointer"
            >
              Login / Register
            </button>
          </div>
        </div>
      </div>
    );
  }

  const referralCode = currentUser.referralCode || `KM-${currentUser.phone.slice(-4)}`;
  const shareUrl = `${window.location.origin}/?ref=${referralCode}`;
  const shareMessage = `🌾 Join KisanMandi — Pakistan's Agricultural Marketplace for Wheat, Rice, Flour & Pulses!\nSign up using my referral code *${referralCode}* to get Rs. 100 welcome bonus!\nJoin here: ${shareUrl}`;

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 text-white p-6 relative">
          <div className="flex items-center justify-between mb-3">
            <div className="inline-flex items-center gap-1.5 bg-amber-400 text-emerald-950 px-2.5 py-1 rounded-full text-xs font-bold shadow-xs">
              <Gift className="w-3.5 h-3.5" />
              <span>Free Contact Program</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h2 className="text-xl sm:text-2xl font-black font-display text-white">
            Invite Friends, Get Free Contacts!
          </h2>
          <p className="text-xs text-emerald-200 mt-1 max-w-sm">
            (ہر ایک ریفرل پر 1 کسٹمر کا موبائل نمبر فری میں انلاک کریں)
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs text-slate-700">
          {/* Rewards Counter Card */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-md">
                <Sparkles className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block">
                  Your Free Unlock Balance
                </span>
                <span className="text-xl font-black text-slate-900 font-display">
                  {currentUser.referralCredits || 0} Free Contact{currentUser.referralCredits === 1 ? '' : 's'}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block">Friends Joined:</span>
              <span className="font-bold text-slate-800 text-sm font-mono">
                {currentUser.totalReferralsCount || 0}
              </span>
            </div>
          </div>

          {/* Referral Code Box */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-800">
              Your Unique Referral Code (آپ کا ریفرل کوڈ)
            </label>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border-2 border-dashed border-emerald-500/80">
              <span className="font-mono text-lg font-black text-emerald-950 tracking-wider">
                {referralCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>
          </div>

          {/* Sharing Buttons */}
          <div className="space-y-2.5">
            <button
              onClick={handleWhatsAppShare}
              className="w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold text-sm py-3 px-4 rounded-2xl transition shadow-md shadow-green-600/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Share on WhatsApp (واٹس ایپ پر دوستوں کو بھیجیں)</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2.5 px-4 rounded-xl border border-slate-200 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-700" /> : <Share2 className="w-4 h-4 text-slate-500" />}
              <span>{copiedLink ? 'Invite Link Copied to Clipboard!' : 'Copy Referral Share Link'}</span>
            </button>
          </div>

          {/* How It Works Steps */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
            <span className="font-bold text-slate-900 block text-xs">
              How it works (یہ کیسے کام کرتا ہے؟):
            </span>
            <div className="space-y-1.5 text-[11px] text-slate-600">
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[10px]">1</span>
                <span>Send your link or code to farmers, arhtis, and grain millers.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[10px]">2</span>
                <span>When they register on KisanMandi, they get <strong>Rs. 100 free welcome balance</strong>.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[10px]">3</span>
                <span>You immediately receive <strong>1 FREE Seller Contact Unlock</strong> in your account!</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>KisanMandi Free Referral Rewards</span>
          <button
            onClick={onClose}
            className="font-bold text-slate-800 hover:text-slate-950 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
