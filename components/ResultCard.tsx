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
      case 'UNDERVALUED': return 'text-success bg-emerald-900/30 border-emerald-800';
      case 'OVERVALUED': return 'text-danger bg-red-900/30 border-red-800';
      default: return 'text-yellow-400 bg-yellow-900/30 border-yellow-800';
    }
  };

  const getMosColor = (mos: number) => {
    if (mos > 0) return 'text-success';
    if (mos < -20) return 'text-danger';
    return 'text-yellow-400';
  };

  return (
    <div className="bg-surface rounded-xl p-6 border border-slate-700 shadow-lg hover:border-slate-600 transition-colors">
      <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">{title}</h3>
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-2xl font-bold text-white">
          Rp {value.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
        </span>
      </div>
      
      <div className="flex items-center justify-between">
        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(status)}`}>
          {status}
        </span>
        <span className={`text-sm font-medium ${getMosColor(mos)}`}>
          MOS: {mos > 0 ? '+' : ''}{mos.toFixed(1)}%
        </span>
      </div>
    </div>
  );
};