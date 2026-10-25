import React, { useState } from 'react';
import { User } from '../types';
import { POPULAR_CITIES } from '../data/seedData';
import { storageService } from '../services/storageService';
import { 
  X, 
  Smartphone, 
  ShieldCheck, 
  UserPlus, 
  LogIn, 
  User as UserIcon, 
  MapPin, 
  Lock, 
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Users,
  Gift
} from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  allUsers: User[];
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  onClose,
  onLoginSuccess,
  allUsers,
  initialMode = 'login',
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialMode);
  const [step, setStep] = useState<'input' | 'otp'>('input');
  
  // Login fields
  const [loginPhone, setLoginPhone] = useState('03007891234');
  
  // Registration fields
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCity, setRegCity] = useState('Faisalabad');
  const [regArea, setRegArea] = useState('New Ghalla Mandi');
  const [regPassword, setRegPassword] = useState('1234');
  const [regReferralCode, setRegReferralCode] = useState('');

  // OTP state
  const [otp, setOtp] = useState('');
  const [demoOtp, setDemoOtp] = useState('4892');
  const [error, setError] = useState('');

  // Start Login Flow
  const handleStartLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = loginPhone.trim().replace(/\s+/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 11-digit Pakistani mobile number (e.g. 03001234567)');
      return;
    }
    setError('');
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setDemoOtp(generatedOtp);
    setStep('otp');
  };

  // Start Registration Flow
  const handleStartRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) {
      setError('Please enter your full name or trader business name');
      return;
    }
    const cleanPhone = regPhone.trim().replace(/\s+/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 11-digit Pakistani mobile number (e.g. 03001234567)');
      return;
    }

    // Check if phone already registered
    const existing = allUsers.find((u) => u.phone.replace(/\s+/g, '') === cleanPhone);
    if (existing) {
      setError(`This mobile number is already registered as "${existing.name}". Please switch to the Login tab.`);
      return;
    }

    setError('');
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setDemoOtp(generatedOtp);
    setStep('otp');
  };

  // Verify OTP & complete Login or Registration
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== demoOtp && otp !== '1234') {
      setError(`Invalid verification code. Enter demo OTP ${demoOtp}`);
      return;
    }
    setError('');

    if (activeTab === 'login') {
      const cleanPhone = loginPhone.trim().replace(/\s+/g, '');
      const existing = allUsers.find((u) => u.phone.replace(/\s+/g, '') === cleanPhone);

      if (existing) {
        onLoginSuccess(existing);
        onClose();
      } else {
        // Not registered yet, prompt them to register
        setError('This mobile number is not registered yet. Please fill the Registration form.');
        setRegPhone(cleanPhone);
        setActiveTab('register');
        setStep('input');
      }
    } else {
      // Create new user account with complimentary Rs. 100 welcome deposit and referral bonus!
      const cleanPhone = regPhone.trim().replace(/\s+/g, '');
      const regResult = storageService.registerOrLoginByPhone(
        cleanPhone,
        regName.trim(),
        regCity,
        regArea.trim(),
        regReferralCode.trim()
      );

      onLoginSuccess(regResult.user);
      onClose();
    }
  };

  const handleQuickLogin = (user: User) => {
    onLoginSuccess(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-emerald-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 border border-emerald-700/60 flex items-center justify-center text-amber-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-display">
                {activeTab === 'login' ? 'User Login (لاگ ان)' : 'New Registration (رجسٹریشن)'}
              </h2>
              <p className="text-xs text-emerald-300">
                KisanMandi Agricultural Commodities Exchange
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

        {/* Tab Switcher: LOGIN vs REGISTER */}
        {step === 'input' && (
          <div className="flex border-b border-slate-200 bg-slate-50">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setError('');
              }}
              className={`flex-1 py-3 px-4 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-white text-emerald-800 border-b-2 border-emerald-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Login (لاگ ان)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setError('');
              }}
              className={`flex-1 py-3 px-4 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-white text-emerald-800 border-b-2 border-emerald-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Register (نیا اکاؤنٹ)</span>
            </button>
          </div>
        )}

        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3.5 py-2.5 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}

          {/* ==================================================== */}
          {/* STEP 1: LOGIN FORM */}
          {/* ==================================================== */}
          {step === 'input' && activeTab === 'login' && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <h3 className="text-xs font-bold text-slate-800 mb-0.5">
                  Sign in with Registered Mobile Number
                </h3>
                <p className="text-[11px] text-slate-500">
                  Enter your mobile number to receive an SMS verification code (OTP).
                </p>
              </div>

              <form onSubmit={handleStartLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Pakistani Mobile Phone Number *
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 border-r border-slate-200 pr-2">
                      +92
                    </div>
                    <input
                      type="tel"
                      required
                      placeholder="0300 1234567"
                      value={loginPhone}
                      onChange={(e) => setLoginPhone(e.target.value)}
                      className="w-full pl-16 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold font-mono text-slate-900 focus:bg-white focus:border-emerald-600 outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm py-3 px-4 rounded-xl transition shadow-md shadow-emerald-800/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Send OTP & Login (لاگ ان کریں)</span>
                </button>
              </form>

              <div className="text-center pt-2">
                <span className="text-xs text-slate-500">Don't have an account yet? </span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('register');
                    setError('');
                  }}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
                >
                  Register here (رجسٹر کریں)
                </button>
              </div>

              {/* Demo Accounts Quick Login */}
              <div className="pt-4 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Or 1-Click Demo Profiles
                </span>
                <div className="space-y-1.5">
                  {allUsers.slice(0, 3).map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleQuickLogin(u)}
                      className="w-full text-left p-2.5 rounded-xl border border-slate-200/80 hover:border-emerald-500 hover:bg-emerald-50/50 transition flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-lg object-cover" />
                        <div>
                          <p className="text-xs font-bold text-slate-800">{u.name}</p>
                          <p className="text-[10px] text-slate-500">{u.phone} • {u.city}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        Rs. {u.walletBalance}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* STEP 1: REGISTRATION FORM (NEW USER SIGNUP) */}
          {/* ==================================================== */}
          {step === 'input' && activeTab === 'register' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200">
                <h3 className="text-xs font-bold text-emerald-900 mb-0.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Free Rs. 100 Welcome Balance on Signup!</span>
                </h3>
                <p className="text-[11px] text-emerald-700">
                  Create your profile with your mobile number to buy & sell agricultural crops and unlock seller contacts.
                </p>
              </div>

              <form onSubmit={handleStartRegister} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Full Name / Business Name (پورا نام) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Haji Muhammad Aslam"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:border-emerald-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pakistani Mobile Number (موبائل نمبر) *
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 border-r border-slate-200 pr-2">
                      +92
                    </div>
                    <input
                      type="tel"
                      required
                      placeholder="0300 1234567"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full pl-16 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold font-mono text-slate-900 focus:bg-white focus:border-emerald-600 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      City / Mandi (شہر) *
                    </label>
                    <select
                      value={regCity}
                      onChange={(e) => setRegCity(e.target.value)}
                      className="w-full px-2.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 outline-none"
                    >
                      {POPULAR_CITIES.filter((c) => c !== 'All Pakistan').map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Area / Market (علاقہ)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. New Ghalla Mandi"
                      value={regArea}
                      onChange={(e) => setRegArea(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Account Password / PIN (پاس ورڈ)
                  </label>
                  <input
                    type="password"
                    placeholder="••••"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 outline-none"
                  />
                </div>

                {/* Referral Code (Optional) */}
                <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200/80">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                      <Gift className="w-3.5 h-3.5 text-amber-600" />
                      <span>Referral Code (ریفرل کوڈ)</span>
                    </label>
                    <span className="text-[10px] font-semibold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full">
                      Optional (+1 Free Contact Unlock)
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. KM-1234 or KM-0001"
                    value={regReferralCode}
                    onChange={(e) => setRegReferralCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-mono font-bold text-slate-800 placeholder:text-slate-400 placeholder:font-normal uppercase tracking-wider outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  />
                  <p className="text-[10px] text-amber-800 mt-1">
                    If someone invited you, enter their code. Both of you will get 1 free contact unlock!
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm py-3 px-4 rounded-xl transition shadow-md shadow-emerald-800/20 flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Verify Mobile & Register (رجسٹر کریں)</span>
                </button>
              </form>

              <div className="text-center pt-2">
                <span className="text-xs text-slate-500">Already have an account? </span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setError('');
                  }}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
                >
                  Log in here (لاگ ان کریں)
                </button>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* STEP 2: OTP VERIFICATION FOR BOTH LOGIN & REGISTER */}
          {/* ==================================================== */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 block mb-1">
                  SMS OTP Verification Code
                </span>
                <p className="text-xs text-amber-900 mb-2">
                  Code sent to <strong className="font-mono">{activeTab === 'login' ? loginPhone : regPhone}</strong>
                </p>
                <div className="inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-amber-300 font-mono text-base font-black text-slate-900 shadow-2xs">
                  <span>Demo Code:</span>
                  <span className="text-emerald-700 tracking-widest">{demoOtp}</span>
                </div>
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => setOtp(demoOtp)}
                    className="text-xs font-bold text-emerald-700 underline hover:text-emerald-800 cursor-pointer"
                  >
                    Click to auto-fill code ({demoOtp})
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 text-center">
                  Enter 4-Digit Code
                </label>
                <input
                  type="text"
                  maxLength={4}
                  required
                  placeholder="••••"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full text-center tracking-widest text-2xl font-mono font-bold py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-emerald-600 outline-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('input')}
                  className="w-1/3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="w-2/3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm py-2.5 rounded-xl transition shadow-md shadow-emerald-800/20 cursor-pointer"
                >
                  {activeTab === 'login' ? 'Confirm & Log In' : 'Complete Registration'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
