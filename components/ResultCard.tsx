import React from 'react';

interface ResultCardProps {
  title: string;
  value: number;
  status: 'UNDERVALUED' | 'FAIR' | 'OVERVALUED';
  mos: number;
}

export const ResultCard: React.FC<ResultCardProps> = ({ title, value, status, mos }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UNDERVALUED': return 'text-emerald-400 bg-emerald-900/30 border-emerald-500/50 shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)]';
      case 'OVERVALUED': return 'text-rose-400 bg-rose-900/30 border-rose-500/50 shadow-[0_0_15px_-3px_rgba(244,63,94,0.3)]';
      default: return 'text-amber-400 bg-amber-900/30 border-amber-500/50';
    }
  };

  const getMosColor = (mos: number) => {
    if (mos > 0) return 'text-emerald-400';
    if (mos < -20) return 'text-rose-400';
    return 'text-amber-400';
  };

  return (
    <div className="bg-surface/80 backdrop-blur-md rounded-2xl p-6 border border-slate-700/50 hover:border-slate-500 transition-all group relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -mr-12 -mt-12 pointer-events-none group-hover:bg-white/10 transition-colors"></div>

      <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
        {title}
      </h3>

      <div className="flex items-baseline gap-2 mb-5">
        <span className="text-3xl font-extrabold text-white tracking-tight">
          Rp {value.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${getStatusColor(status)} backdrop-blur-sm flex items-center gap-1.5`}>
          {status === 'UNDERVALUED' && '💎'}
          {status === 'OVERVALUED' && '🥵'}
          {status === 'FAIR' && '⚖️'}
          {status}
        </span>
        <div className="text-right">
          <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Margin of Safety</div>
          <span className={`text-base font-bold ${getMosColor(mos)}`}>
            {mos > 0 ? '+' : ''}{mos.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
};