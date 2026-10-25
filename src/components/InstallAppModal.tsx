import React, { useState, useEffect } from 'react';
import { 
  X, 
  Smartphone, 
  Download, 
  CheckCircle, 
  ExternalLink, 
  Globe, 
  Apple, 
  Play, 
  HelpCircle,
  Sparkles,
  Share2,
  Loader2,
  Check
} from 'lucide-react';
import { downloadSourceZip } from '../utils/downloadHelper';

interface InstallAppModalProps {
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [activeTab, setActiveTab] = useState<'mobile' | 'apk' | 'launch'>('mobile');
  const [copiedLink, setCopiedLink] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [downloadZipSuccess, setDownloadZipSuccess] = useState(false);

  const handleDownloadZip = async () => {
    setIsDownloadingZip(true);
    const ok = await downloadSourceZip('kisanmandi-full-source-code.zip');
    setIsDownloadingZip(false);
    if (ok) {
      setDownloadZipSuccess(true);
      setTimeout(() => setDownloadZipSuccess(false), 3000);
    }
  };

  useEffect(() => {
    // Listen for beforeinstallprompt event on Android Chrome
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleNativeInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert('To install on Android: Tap the 3 dots (⋮) in Chrome and select "Install app" or "Add to Home screen".\n\nTo install on iPhone: Tap the Share button in Safari and tap "Add to Home Screen".');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-emerald-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 border border-emerald-700 flex items-center justify-center text-amber-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-display">
                KisanMandi Mobile App & Launch Guide
              </h2>
              <p className="text-xs text-emerald-300">
                Install as a Phone App & Deploy to Live Production
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold">
          <button
            onClick={() => setActiveTab('mobile')}
            className={`flex-1 py-3 px-3 flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'mobile'
                ? 'bg-white text-emerald-800 border-b-2 border-emerald-600'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>1. Install on Phone (PWA)</span>
          </button>
          <button
            onClick={() => setActiveTab('apk')}
            className={`flex-1 py-3 px-3 flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'apk'
                ? 'bg-white text-emerald-800 border-b-2 border-emerald-600'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>2. Android APK / Play Store</span>
          </button>
          <button
            onClick={() => setActiveTab('launch')}
            className={`flex-1 py-3 px-3 flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'launch'
                ? 'bg-white text-emerald-800 border-b-2 border-emerald-600'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>3. How to Launch Live</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 flex-1">
          {/* TAB 1: PHONE INSTALLATION */}
          {activeTab === 'mobile' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-emerald-950 mb-0.5">
                    Install KisanMandi Directly on Your Mobile
                  </h4>
                  <p className="text-emerald-800 text-[11px] leading-relaxed">
                    This application is fully PWA-enabled with service worker and manifest. It installs directly onto Android & iOS home screens and opens in standalone full-screen mode just like a native app!
                  </p>
                </div>
              </div>

              {/* Install Button */}
              <button
                onClick={handleNativeInstall}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm py-3 px-4 rounded-xl transition shadow-md shadow-emerald-800/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Install KisanMandi App on This Device</span>
              </button>

              {/* Share link to test on other phone */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                <div className="text-left w-full sm:w-auto">
                  <span className="text-[11px] font-bold text-slate-800 block">
                    دوسرے فون پر ٹیسٹ کرنے کے لیے لنک بھیجیں:
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {window.location.origin}
                  </span>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2000);
                    }}
                    className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition cursor-pointer"
                  >
                    {copiedLink ? '✓ Copied' : 'Copy Link'}
                  </button>
                  <button
                    onClick={() => {
                      const text = encodeURIComponent(
                        `🌾 کسان منڈی (KisanMandi) ایپ ٹیسٹ کرنے کے لیے اپنے فون کے براؤزر میں کھولیں اور انسٹال کریں:\n${window.location.href}`
                      );
                      window.open(`https://wa.me/?text=${text}`, '_blank');
                    }}
                    className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Share2 className="w-3 h-3" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>

              {/* Step by step for Android & iPhone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {/* Android Chrome */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <span className="p-1 rounded-md bg-emerald-100 text-emerald-800 font-bold">Android</span>
                    <span>Chrome Browser</span>
                  </div>
                  <ol className="list-decimal pl-4 space-y-1 text-slate-600 text-[11px]">
                    <li>Open this URL on Google Chrome.</li>
                    <li>Tap the <strong>3 vertical dots (⋮)</strong> at top right.</li>
                    <li>Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                    <li>The KisanMandi app icon appears on your phone screen!</li>
                  </ol>
                </div>

                {/* iPhone Safari */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <span className="p-1 rounded-md bg-slate-200 text-slate-800 font-bold">Apple iOS</span>
                    <span>Safari Browser</span>
                  </div>
                  <ol className="list-decimal pl-4 space-y-1 text-slate-600 text-[11px]">
                    <li>Open this URL in Safari on iPhone.</li>
                    <li>Tap the <strong>Share button</strong> (<Share2 className="w-3 h-3 inline" />) at the bottom.</li>
                    <li>Scroll down and tap <strong>"Add to Home Screen"</strong>.</li>
                    <li>Tap <strong>"Add"</strong> at top right.</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ANDROID APK GENERATION */}
          {activeTab === 'apk' && (
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
                <h4 className="font-bold text-sm text-blue-950 mb-1">
                  How to convert into an Android (.APK) file:
                </h4>
                <p className="text-blue-900 text-[11px] leading-relaxed">
                  Because this is built with modern PWA standards, you can convert it into an Android APK / AAB for Google Play Store using free automated tools without writing native Java or Kotlin:
                </p>
              </div>

              <div className="space-y-3">
                <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-300 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-950 text-sm">
                      1. Generate Android APK via PWABuilder (Free & Official)
                    </span>
                    <span className="text-[10px] font-bold bg-amber-400 text-emerald-950 px-2 py-0.5 rounded-full uppercase">
                      Recommended
                    </span>
                  </div>

                  <p className="text-emerald-900 text-xs">
                    PWABuilder is Microsoft's official free tool that takes this live PWA and automatically builds a ready-to-install Android <strong>.APK file</strong> or <strong>.AAB (Google Play Store)</strong> package!
                  </p>

                  <div className="bg-white p-3 rounded-xl border border-emerald-200 text-xs space-y-1">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">
                      Your Live PWA URL for PWABuilder:
                    </span>
                    <code className="block bg-slate-100 p-2 rounded-lg text-emerald-900 font-mono text-xs break-all select-all font-bold">
                      {window.location.origin}
                    </code>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <a
                      href={`https://www.pwabuilder.com/?url=${encodeURIComponent(window.location.origin)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-2.5 px-3.5 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open in PWABuilder (Build APK)</span>
                    </a>

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.origin);
                        alert('✓ App URL copied! Now open pwabuilder.com and paste this link.');
                      }}
                      className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold text-xs transition cursor-pointer"
                    >
                      Copy URL
                    </button>
                  </div>
                </div>

                {/* Direct File Downloads */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5">
                  <span className="font-bold text-slate-900 block text-xs">
                    2. Download Raw PWA Configuration Files (فائلز ڈاؤنلوڈ کریں)
                  </span>
                  <p className="text-slate-600 text-[11px]">
                    If you want to manually upload the configuration to PWABuilder or Android Studio:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {/* PRIMARY FULL APPLICATION SOURCE CODE ZIP PACKAGE */}
                    <button
                      onClick={handleDownloadZip}
                      disabled={isDownloadingZip}
                      className="col-span-full p-4 rounded-2xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 text-xs font-black shadow-md transition flex flex-col items-center justify-center gap-1 cursor-pointer text-center group disabled:opacity-50"
                    >
                      <div className="flex items-center gap-2 text-sm">
                        {isDownloadingZip ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : downloadZipSuccess ? (
                          <Check className="w-5 h-5 stroke-[3] text-emerald-950" />
                        ) : (
                          <Download className="w-5 h-5 stroke-[2.8] group-hover:translate-y-0.5 transition" />
                        )}
                        <span>
                          {isDownloadingZip
                            ? 'زپ فائل ڈاؤنلوڈ ہو رہی ہے...'
                            : downloadZipSuccess
                            ? '✓ ڈاؤنلوڈ شروع ہو گیا!'
                            : '📦 ڈیولپر کے لیے مکمل سورس کوڈ زپ فائل ڈاؤنلوڈ کریں'}
                        </span>
                      </div>
                      <span className="text-[11px] font-normal text-slate-800">
                        {downloadZipSuccess
                          ? 'Downloaded! Check your browser downloads folder.'
                          : 'Download Full Developer Source ZIP (All React, TypeScript, Server & Android Guide - 118 KB)'}
                      </span>
                    </button>

                    <a
                      href="/manifest.json"
                      download="manifest.json"
                      className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 text-slate-800 text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Download manifest.json</span>
                    </a>

                    <a
                      href="/icon-512.png"
                      download="icon-512.png"
                      className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 text-slate-800 text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Download App Icon (512x512)</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: HOW TO LAUNCH LIVE */}
          {activeTab === 'launch' && (
            <div className="space-y-4">
              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200">
                <h4 className="font-bold text-sm text-amber-950 mb-1">
                  Launching KisanMandi on the Internet:
                </h4>
                <p className="text-amber-900 text-[11px] leading-relaxed">
                  The application is already running in production mode right here on Google Cloud Run. You can also point your own custom domain (e.g., <strong>kisanmandi.pk</strong>) or host it anywhere:
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <strong className="text-slate-900 block mb-0.5">1. Custom Domain (e.g., kisanmandi.pk):</strong>
                  <p className="text-slate-600 text-[11px]">
                    You can map your domain in Cloud Run or Cloudflare DNS to point directly to this app URL.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <strong className="text-slate-900 block mb-0.5">2. One-Click Free Hosting on Vercel / Netlify:</strong>
                  <p className="text-slate-600 text-[11px]">
                    Push the codebase to GitHub and connect to Vercel. Run <code>npm run build</code>, and it goes live instantly with free SSL!
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <strong className="text-slate-900 block mb-0.5">3. Live Production Database:</strong>
                  <p className="text-slate-600 text-[11px]">
                    The app stores listings, user wallets, and transactions reliably in persistent browser storage, and can easily connect to Firebase or PostgreSQL via AI Studio.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>KisanMandi PWA & App Launch</span>
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
