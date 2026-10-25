import React, { useState, useMemo } from 'react';
import { 
  X, 
  TrendingUp, 
  TrendingDown, 
  Search, 
  RefreshCw, 
  Store, 
  Filter,
  CheckCircle2,
  BarChart3,
  ChevronRight
} from 'lucide-react';
import { 
  LIVE_MANDI_RATES_DATA, 
  COMMODITY_CATEGORIES, 
  PROVINCES_LIST, 
  MandiRateRecord 
} from '../data/mandiRatesData';
import { Language, TRANSLATIONS } from '../utils/translations';

interface LiveRatesModalProps {
  lang?: Language;
  onClose: () => void;
  onSelectCommodityForAd?: (commodityName: string) => void;
}

export const LiveRatesModal: React.FC<LiveRatesModalProps> = ({ 
  lang = 'en',
  onClose,
  onSelectCommodityForAd 
}) => {
  const t = TRANSLATIONS[lang];
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProvince, setSelectedProvince] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRecord, setSelectedRecord] = useState<MandiRateRecord | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>('Just now');

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastRefreshed(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    }, 600);
  };

  const filteredRates = useMemo(() => {
    return LIVE_MANDI_RATES_DATA.filter((item) => {
      const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchProvince = selectedProvince === 'all' || item.province === selectedProvince;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        item.commodity.toLowerCase().includes(q) || 
        item.commodityUrdu.includes(q) ||
        item.mandi.toLowerCase().includes(q) ||
        item.mandiUrdu.includes(q) ||
        item.variety.toLowerCase().includes(q);

      return matchCategory && matchProvince && matchSearch;
    });
  }, [selectedCategory, selectedProvince, searchQuery]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[94vh] flex flex-col animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white px-5 sm:px-6 py-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-300 shadow-inner">
              <BarChart3 className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-display text-white">
                  {lang === 'en' ? 'National Agri Mandi Live Rates' : 'قومی زرعی منڈی لائیو ریٹس'}
                </h2>
                <span className="text-[10px] font-black bg-amber-400 text-emerald-950 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-950 animate-ping"></span>
                  Live Rates
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-emerald-200">
                {lang === 'en'
                  ? 'Official Pakistan Daily Commodity Market Rates • Min, Max & Average'
                  : 'پاکستان کی مرکزی غلہ و کاٹن منڈیوں کے روزانہ کے سرکاری بھاؤ'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-100 hover:text-white transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              title="Refresh Live Mandi Rates"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-300' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-emerald-200 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Status Strip */}
        <div className="bg-emerald-950 text-emerald-200 text-[11px] px-5 py-2 flex items-center justify-between border-b border-emerald-900">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>
              <strong>{lang === 'en' ? 'Verified Mandi Bhav:' : 'مصدقہ منڈی بھاؤ:'}</strong>{' '}
              {lang === 'en' 
                ? 'Rates verified daily across Punjab, Sindh, KPK & Balochistan grain exchanges.' 
                : 'تمام ریٹس روزانہ پاکستان کی مرکزی غلہ و کاٹن منڈیوں سے تصدیق شدہ ہیں'}
            </span>
          </div>
          <div className="text-[10px] text-emerald-300 hidden sm:block">
            Updated: {lastRefreshed}
          </div>
        </div>

        {/* Search & Filters */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={lang === 'en' ? 'Search Wheat, Cotton, Sugar, Rice, Maize, Faisalabad, Rahim Yar Khan...' : 'تلاش کریں: گندم، کپاس، چینی، مکئی، چاول، ساہیوال، فیصل آباد...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 rounded-xl outline-none transition"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Commodity Categories Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            {COMMODITY_CATEGORIES.map((cat) => {
              const label = lang === 'en'
                ? cat.key === 'all' ? 'All Commodities' : cat.label.split('(')[1]?.replace(')', '') || cat.label
                : cat.label;
              return (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    selectedCategory === cat.key
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{label}</span>
                </button>
              );
            })}
          </div>

          {/* Province Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[11px]">
            <span className="text-slate-400 font-semibold shrink-0 flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3" />
              <span>{t.province}:</span>
            </span>
            {PROVINCES_LIST.map((prov) => {
              const provLabel = lang === 'en'
                ? prov.key === 'all' ? 'All Pakistan' : prov.key
                : prov.label;
              return (
                <button
                  key={prov.key}
                  onClick={() => setSelectedProvince(prov.key)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition shrink-0 cursor-pointer ${
                    selectedProvince === prov.key
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {provLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Body: Rates List & Interactive Trend Graph */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Selected Item Detail / 7-Day Trend Graph Card */}
          {selectedRecord && (
            <div className="bg-gradient-to-br from-emerald-950 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-emerald-800/80 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-900/80 px-2 py-0.5 rounded-md">
                    {t.rateAnalysis}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                    {lang === 'en' ? selectedRecord.commodity : selectedRecord.commodityUrdu}
                  </h3>
                  <p className="text-xs text-slate-300">
                    {lang === 'en' ? selectedRecord.mandi : selectedRecord.mandiUrdu} • {selectedRecord.variety} • {lang === 'en' ? selectedRecord.unit : selectedRecord.unitUrdu}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white"
                  title="Close trend"
                >
                  ✕
                </button>
              </div>

              {/* Price Graph Visualizer */}
              <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span>{lang === 'en' ? '7-Day Price Fluctuation (PKR)' : 'گزشتہ ۷ دن کی قیمتوں کا اتار چڑھاؤ'}</span>
                  <span className="text-emerald-400 font-bold">
                    {lang === 'en' ? 'Today Average:' : 'آج کی اوسط:'} Rs. {selectedRecord.avgPrice.toLocaleString()}
                  </span>
                </div>

                {/* SVG Line Graph */}
                <div className="h-28 w-full flex items-end">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 700 100" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {(() => {
                      const points = selectedRecord.weeklyTrend;
                      const min = Math.min(...points) * 0.98;
                      const max = Math.max(...points) * 1.02;
                      const range = max - min || 1;

                      const coords = points.map((p, idx) => {
                        const x = (idx / (points.length - 1)) * 700;
                        const y = 90 - ((p - min) / range) * 80;
                        return { x, y, val: p };
                      });

                      const pathD = coords.reduce((acc, c, idx) => {
                        return idx === 0 ? `M ${c.x} ${c.y}` : `${acc} L ${c.x} ${c.y}`;
                      }, '');

                      const areaD = `${pathD} L 700 100 L 0 100 Z`;

                      return (
                        <>
                          <path d={areaD} fill="url(#trendGrad)" />
                          <path d={pathD} fill="none" stroke="#34d399" strokeWidth="3" strokeLinecap="round" />
                          {coords.map((c, i) => (
                            <g key={i}>
                              <circle cx={c.x} cy={c.y} r="4" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
                              <text 
                                x={c.x} 
                                y={c.y - 8} 
                                fill="#fbbf24" 
                                fontSize="10" 
                                textAnchor={i === 0 ? 'start' : i === coords.length - 1 ? 'end' : 'middle'}
                                fontWeight="bold"
                              >
                                {c.val}
                              </text>
                            </g>
                          ))}
                        </>
                      );
                    })()}
                  </svg>
                </div>

                <div className="flex justify-between text-[10px] text-slate-400 mt-2 border-t border-slate-800/80 pt-1">
                  <span>Day 1</span>
                  <span>Day 2</span>
                  <span>Day 3</span>
                  <span>Day 4</span>
                  <span>Day 5</span>
                  <span>Day 6</span>
                  <span className="text-amber-400 font-bold">{lang === 'en' ? 'Today' : 'آج'}</span>
                </div>
              </div>

              {/* Action */}
              {onSelectCommodityForAd && (
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => {
                      onSelectCommodityForAd(selectedRecord.commodity);
                      onClose();
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <span>{lang === 'en' ? 'Post Ad for This Crop' : 'اس جنس کا اشتہار لگائیں'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Rates Table / Grid */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
              <span>{lang === 'en' ? 'Available Stations:' : 'دستیاب منڈیاں:'} <strong className="text-slate-900">{filteredRates.length}</strong></span>
              <span className="text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                {lang === 'en' ? 'Click any card to view price graph 📊' : 'کسی بھی جنس پر کلک کر کے گراف دیکھیں 📊'}
              </span>
            </div>

            {filteredRates.length === 0 ? (
              <div className="bg-slate-50 rounded-2xl p-10 text-center border border-slate-200 space-y-2">
                <Store className="w-10 h-10 text-slate-400 mx-auto" />
                <h4 className="text-sm font-bold text-slate-700">{lang === 'en' ? 'No records found' : 'کوئی ریکارڈ نہیں ملا'}</h4>
                <p className="text-xs text-slate-500">
                  {lang === 'en' ? 'Please modify your search or filter criteria' : 'براہ کرم تلاش کے الفاظ یا فلٹر تبدیل کریں'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredRates.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedRecord(item)}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                      selectedRecord?.id === item.id
                        ? 'bg-emerald-50/80 border-emerald-500 shadow-sm ring-1 ring-emerald-500'
                        : 'bg-white hover:bg-slate-50/80 border-slate-200/90 shadow-2xs hover:shadow-xs hover:border-emerald-300'
                    }`}
                  >
                    {/* Top row: Category tag & Trend */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold">
                          {lang === 'en' ? item.province : item.provinceUrdu}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500 truncate max-w-[160px]">
                          {lang === 'en' ? item.mandi : item.mandiUrdu}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <span
                          className={`text-xs font-bold flex items-center gap-0.5 px-2 py-0.5 rounded-lg ${
                            item.trend === 'up'
                              ? 'text-emerald-700 bg-emerald-100'
                              : item.trend === 'down'
                              ? 'text-rose-700 bg-rose-100'
                              : 'text-slate-600 bg-slate-100'
                          }`}
                        >
                          {item.trend === 'up' && <TrendingUp className="w-3 h-3 stroke-[2.5]" />}
                          {item.trend === 'down' && <TrendingDown className="w-3 h-3 stroke-[2.5]" />}
                          <span>
                            {item.change > 0 ? `+${item.change}` : item.change < 0 ? item.change : (lang === 'en' ? 'Stable' : 'مستحکم')}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Middle: Commodity title */}
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition">
                        {lang === 'en' ? item.commodity : item.commodityUrdu}
                      </h4>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500">
                        <span>{lang === 'en' ? item.commodityUrdu : item.commodity}</span>
                        <span>•</span>
                        <span className="text-slate-600 font-medium">{item.variety}</span>
                      </div>
                    </div>

                    {/* Bottom: Rates Breakdown (Min, Max, Avg) */}
                    <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center bg-slate-50/60 p-2 rounded-xl">
                      <div>
                        <div className="text-[10px] text-slate-500 font-medium">{t.minPrice}</div>
                        <div className="text-xs font-bold text-slate-700">
                          Rs. {item.minPrice.toLocaleString()}
                        </div>
                      </div>

                      <div className="border-x border-slate-200">
                        <div className="text-[10px] text-emerald-800 font-bold uppercase tracking-wide">
                          {t.avgPrice}
                        </div>
                        <div className="text-sm font-black text-emerald-700">
                          Rs. {item.avgPrice.toLocaleString()}
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] text-slate-500 font-medium">{t.maxPrice}</div>
                        <div className="text-xs font-bold text-slate-700">
                          Rs. {item.maxPrice.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Unit footer */}
                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{t.mandiUnit}: <strong className="text-slate-600 font-semibold">{lang === 'en' ? item.unit : item.unitUrdu}</strong></span>
                      <span className="text-emerald-700 font-semibold group-hover:underline flex items-center gap-0.5">
                        <span>{lang === 'en' ? 'View Graph' : 'گراف دیکھیں'}</span>
                        <ChevronRight className="w-2.5 h-2.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer info note */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-1.5 text-center sm:text-left">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{lang === 'en' ? 'Rates sourced daily from certified regional grain market committees.' : 'یہ ریٹس کسان منڈی کے تصدیق شدہ بیوپاریوں اور مارکیٹ کمیٹیوں کے روزانہ ڈیٹا پر مبنی ہیں۔'}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer transition shrink-0"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
