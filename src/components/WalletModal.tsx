import React, { useState, useEffect, useRef } from 'react';
import { User, WalletTransaction, PlatformFinancials } from '../types';
import { 
  X, 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  CheckCircle, 
  Smartphone, 
  CreditCard,
  Building2, 
  Copy, 
  AlertCircle,
  Clock,
  Sparkles,
  Receipt,
  ShieldCheck,
  Lock,
  ArrowRight,
  Loader2
} from 'lucide-react';

interface WalletModalProps {
  currentUser: User | null;
  transactions: WalletTransaction[];
  onClose: () => void;
  onPaymentComplete: () => void;
  financials?: PlatformFinancials;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  currentUser,
  transactions,
  onClose,
  onPaymentComplete,
  financials,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'EasyPaisa' | 'JazzCash' | 'Bank Transfer / Raast'>('EasyPaisa');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [checkoutStep, setCheckoutStep] = useState<'select' | 'waiting' | 'success' | 'failed'>('select');
  const [generatedTid, setGeneratedTid] = useState('');
  const [payError, setPayError] = useState('');
  const [testMode, setTestMode] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fixed Rs. 100 deposit per policy (the server also fixes the amount)
  const depositAmount = 100;

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };
  useEffect(() => stopPolling, []);

  // Filter user's transactions
  const userTransactions = transactions.filter((t) => t.userId === currentUser?.id);

  // The customer enters their PIN on THEIR OWN phone (EasyPaisa / JazzCash prompt), never in this app.
  const handleStartAuthorization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    const cleanNumber = customerPhone.trim().replace(/\s+/g, '');
    if (cleanNumber.length < 10) {
      setPayError('Please enter your 11-digit mobile account number');
      return;
    }
    setPayError('');
    try {
      const res = await fetch('/api/payments/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, phone: cleanNumber, method: selectedMethod }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPayError(data.error || 'Could not start the payment.');
        return;
      }
      setTestMode(!!data.testMode);
      setCheckoutStep('waiting');
      stopPolling();
      let tries = 0;
      pollRef.current = setInterval(async () => {
        tries++;
        try {
          const r = await fetch(`/api/payments/${data.paymentId}`);
          const p = await r.json();
          if (p.status === 'completed') {
            stopPolling();
            setGeneratedTid(p.referenceId || data.paymentId);
            setCheckoutStep('success');
            onPaymentComplete();
            setTimeout(() => setCheckoutStep('select'), 4000);
          } else if (p.status === 'failed') {
            stopPolling();
            setPayError(p.message || 'The payment was declined or cancelled.');
            setCheckoutStep('failed');
          } else if (tries > 90) {
            stopPolling();
            setPayError('No approval received in time. If money was deducted it will be added automatically.');
            setCheckoutStep('failed');
          }
        } catch {
          // temporary network problem: keep waiting
        }
      }, 2000);
    } catch {
      setPayError('Cannot reach the server. Check your internet and try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-emerald-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 border border-emerald-700/60 flex items-center justify-center text-amber-400 shadow-inner">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-display">In-App Digital Wallet</h2>
                <span className="text-[10px] font-bold bg-amber-400 text-emerald-950 px-2 py-0.2 rounded-full uppercase tracking-wider">
                  Daraz-Style Auto Gateway
                </span>
              </div>
              <p className="text-xs text-emerald-300">
                Encrypted payment routing • No personal numbers exposed to callers
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

        {/* Balance Showcase */}
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 text-white px-6 py-4 border-b border-emerald-950">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-emerald-300 block mb-0.5">
                Current Available Wallet Balance
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black font-display text-white">
                  Rs. {currentUser?.walletBalance || 0}
                </span>
                <span className="text-xs font-semibold text-emerald-300">
                  PKR
                </span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 text-xs max-w-xs">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold mb-0.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Contact Unlocks Available</span>
              </div>
              <p className="text-emerald-100 text-[11px]">
                You can unlock up to <strong className="text-white font-bold">{Math.floor((currentUser?.walletBalance || 0) / 10)} seller contacts</strong> with your current balance (Rs. 10/seller).
              </p>
            </div>
          </div>

          {/* Promotional Balance Note */}
          <div className="mt-3 pt-2.5 border-t border-emerald-700/60 flex items-start gap-2 text-[11px] text-emerald-200">
            <span className="text-amber-400 font-bold text-xs shrink-0">★</span>
            <p>
              <strong>پالیسی نوٹس:</strong> ایپ میں شامل ہونے پر ملا ہوا <strong>Rs. 100 فری ویلکم بیلنس</strong> نکلوایا نہیں جا سکتا، یہ محض 10 کسانوں کے موبائل نمبر کھولنے کے لیے مختص ہے۔ 10 نمبر مکمل ہونے پر مزید رابطے کھولنے کے لیے رقم جمع کروانا لازمی ہوگا۔
            </p>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* ========================================================= */}
          {/* DARAZ-STYLE AUTOMATED CHECKOUT GATEWAY */}
          {/* ========================================================= */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/90 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  Instant Wallet Top-Up (Daraz-Style Auto-Debit)
                </h3>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                Fixed Deposit: Rs. 100
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Select your payment method. An automated approval request will be sent to your mobile wallet. Your personal details and our admin number remain 100% encrypted.
            </p>

            {/* STEP: SUCCESS ALERT */}
            {checkoutStep === 'success' && (
              <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex items-center gap-3 text-emerald-900 animate-fade-in">
                <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm">Payment Successful & Wallet Credited!</h4>
                  <p className="text-xs text-emerald-700">
                    Rs. 100 successfully deposited via {selectedMethod}. Reference TID: <strong className="font-mono">{generatedTid}</strong>. You can now unlock seller contacts!
                  </p>
                </div>
              </div>
            )}

            {/* STEP: WAITING FOR APPROVAL ON THE CUSTOMER'S OWN PHONE */}
            {checkoutStep === 'waiting' && (
              <div className="bg-white rounded-2xl p-5 border-2 border-emerald-500 shadow-md space-y-3 animate-fade-in">
                <div className="flex items-center gap-2.5">
                  <Loader2 className="w-6 h-6 text-emerald-700 animate-spin shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">
                      Approve Rs. 100 on your phone
                    </h4>
                    <p className="text-xs text-slate-500">
                      {selectedMethod} is sending an approval request to <strong className="font-mono text-slate-800">{customerPhone}</strong>.
                      Enter your PIN <strong>in that message / app</strong>, not here.
                    </p>
                  </div>
                </div>
                {testMode && (
                  <p className="text-[11px] bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-3 py-2">
                    TEST MODE: no real money. The approval is simulated automatically in a few seconds.
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => {
                    stopPolling();
                    setCheckoutStep('select');
                  }}
                  className="w-full py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* STEP: FAILED */}
            {checkoutStep === 'failed' && (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-start gap-2 text-rose-800 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{payError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCheckoutStep('select')}
                  className="w-full py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                >
                  Try again
                </button>
              </div>
            )}

            {/* STEP: SELECT PAYMENT METHOD */}
            {checkoutStep === 'select' && (
              <form onSubmit={handleStartAuthorization} className="space-y-4">
                {/* Channels Grid */}
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('EasyPaisa')}
                    className={`py-3 px-3 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                      selectedMethod === 'EasyPaisa'
                        ? 'bg-emerald-50 border-emerald-600 shadow-md text-emerald-950 ring-2 ring-emerald-500/20'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                      EP
                    </div>
                    <span className="text-[11px]">EasyPaisa Auto</span>
                    <span className="text-[9px] text-emerald-700 font-normal">Direct Mobile Debit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMethod('JazzCash')}
                    className={`py-3 px-3 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                      selectedMethod === 'JazzCash'
                        ? 'bg-red-50 border-red-600 shadow-md text-red-950 ring-2 ring-red-500/20'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold text-xs">
                      JC
                    </div>
                    <span className="text-[11px]">JazzCash Auto</span>
                    <span className="text-[9px] text-red-700 font-normal">Direct Mobile Debit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMethod('Bank Transfer / Raast')}
                    className={`py-3 px-3 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                      selectedMethod === 'Bank Transfer / Raast'
                        ? 'bg-blue-50 border-blue-600 shadow-md text-blue-950 ring-2 ring-blue-500/20'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <span className="text-[11px]">Debit / Card</span>
                    <span className="text-[9px] text-blue-700 font-normal">Visa / Raast Direct</span>
                  </button>
                </div>

                {/* Input Customer Wallet Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your {selectedMethod === 'EasyPaisa' ? 'EasyPaisa' : selectedMethod === 'JazzCash' ? 'JazzCash' : 'Bank'} Account Number *
                  </label>
                  <div className="relative">
                    <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 0312 9876543"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-mono font-bold text-slate-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    You will receive an instant approval push notification on this number to debit Rs. 100.
                  </p>
                </div>

                {/* Security Guarantee Box */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-2.5 text-xs text-slate-600">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="text-[11px]">
                    <strong>Encrypted Settlement:</strong> Money is automatically credited to the verified merchant settlement node with zero middleman and zero public disclosure of personal phone numbers.
                  </span>
                </div>

                {payError && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3 py-2 rounded-xl text-xs font-semibold">
                    {payError}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm py-3 px-4 rounded-xl transition shadow-md shadow-emerald-800/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>Proceed to Auto-Debit Rs. 100 via {selectedMethod}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>

          {/* Transactions History Ledger */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-700" />
                <span>Your Transaction History</span>
              </h3>
              <span className="text-xs text-slate-400">
                {userTransactions.length} transaction{userTransactions.length !== 1 ? 's' : ''}
              </span>
            </div>

            {userTransactions.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-100 text-slate-400 text-xs">
                No transactions yet. Deposit Rs. 100 to start unlocking sellers.
              </div>
            ) : (
              <div className="space-y-2">
                {userTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          tx.type === 'deposit'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {tx.type === 'deposit' ? (
                          <ArrowDownLeft className="w-4 h-4" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">
                          {tx.type === 'deposit' ? 'Wallet Deposit' : 'Contact Reveal Fee'}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {tx.listingTitle ? `Ad: ${tx.listingTitle}` : `Via ${tx.method || 'System'} • Ref: ${tx.referenceId || 'N/A'}`}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div
                        className={`font-black font-display text-sm ${
                          tx.type === 'deposit' ? 'text-emerald-700' : 'text-amber-700'
                        }`}
                      >
                        {tx.type === 'deposit' ? `+Rs. ${tx.amount}` : `-Rs. 10`}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-0.5 justify-end">
                        <Clock className="w-2.5 h-2.5" />
                        {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Deposit limit: Rs. 100 • Contact fee: Rs. 10</span>
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
