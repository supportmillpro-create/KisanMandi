import React from 'react';
import { LIVE_MANDI_RATES_DATA } from '../data/mandiRatesData';
import { Language } from '../utils/translations';
import { TrendingUp, TrendingDown, BarChart2 } from 'lucide-react';

interface MandiTickerProps {
  lang?: Language;
  onOpenRates?: () => void;
}

export const MandiTicker: React.FC<MandiTickerProps> = ({ lang = 'en', onOpenRates }) => {
  return (
    <div className="bg-slate-900 text-white border-b border-slate-800 overflow-hidden py-1.5 px-3 sm:px-4 select-none">
      <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-3">
        {/* Fixed Title Badge */}
        <button
          onClick={onOpenRates}
          className="flex items-center gap-1.5 shrink-0 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 px-2.5 py-1 rounded-lg text-xs font-bold border border-emerald-500/30 transition cursor-pointer"
          title={lang === 'en' ? 'Open Live Mandi Rates & Graphs' : 'مکمل لائیو منڈی ریٹس اور گراف کھولیں'}
        >
          <BarChart2 className="w-3.5 h-3.5 text-amber-400" />
          <span>{lang === 'en' ? 'Live Mandi Rates' : 'لائیو منڈی بھاؤ'}</span>
          <span className="hidden sm:inline text-[10px] bg-emerald-400/20 text-emerald-300 px-1 py-0.2 rounded font-mono">
            LIVE
          </span>
        </button>

        {/* Scrolling / Horizontal Scroll Rate Badges */}
        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar scroll-smooth text-xs py-0.5">
          {LIVE_MANDI_RATES_DATA.slice(0, 12).map((item) => (
            <div
              key={item.id}
              onClick={onOpenRates}
              className="flex items-center gap-2 bg-slate-800/90 hover:bg-slate-700/90 px-2.5 py-1 rounded-lg border border-slate-700/60 shrink-0 transition cursor-pointer"
              title={`${item.commodity} - Click for 7-day trend graph`}
            >
              <span className="font-bold text-slate-100">
                {lang === 'en' ? item.commodity : item.commodityUrdu}
              </span>
              <span className="text-[11px] text-slate-400 font-normal">
                ({lang === 'en' ? item.mandi.replace(' Mandi', '') : item.mandiUrdu.replace(' منڈی', '')})
              </span>
              <span className="font-extrabold text-amber-400">Rs. {item.avgPrice.toLocaleString()}</span>
              <span
                className={`text-[10px] font-bold flex items-center gap-0.5 px-1 py-0.2 rounded ${
                  item.trend === 'up' 
                    ? 'text-emerald-400 bg-emerald-950/60' 
                    : item.trend === 'down' 
                    ? 'text-rose-400 bg-rose-950/60' 
                    : 'text-slate-400 bg-slate-900/60'
                }`}
              >
                {item.trend === 'up' && <TrendingUp className="w-2.5 h-2.5 stroke-[3]" />}
                {item.trend === 'down' && <TrendingDown className="w-2.5 h-2.5 stroke-[3]" />}
                <span>
                  {item.change > 0 ? `+${item.change}` : item.change < 0 ? item.change : (lang === 'en' ? 'Stable' : 'مستحکم')}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
