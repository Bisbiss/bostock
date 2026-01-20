import React from 'react';
import { WatchlistItem } from '../types';

interface WatchlistCardProps {
  item: WatchlistItem;
  onLoad: (item: WatchlistItem) => void;
  onDelete: (ticker: string) => void;
}

export const WatchlistCard: React.FC<WatchlistCardProps> = ({ item, onLoad, onDelete }) => {
  return (
    <div className="bg-surfaceHighlight/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 flex justify-between items-center group hover:bg-surfaceHighlight/50 hover:border-slate-600 transition-all shadow-sm hover:shadow-md">
      <div className="flex-1 min-w-0 mr-4">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-xl font-bold text-white tracking-wide font-mono">{item.ticker.toUpperCase()}</h3>
          <span className="text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700">
            {new Date(item.lastUpdated).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
          <span className="bg-slate-800/50 px-1.5 py-0.5 rounded">EPS: {item.eps}</span>
          <span className="bg-slate-800/50 px-1.5 py-0.5 rounded">BVPS: {item.bvps}</span>
        </div>
        <div className="text-xs text-slate-500 mt-2 flex items-center gap-1">
          Price: <span className="text-slate-300 font-bold">Rp {item.price.toLocaleString('id-ID')}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onLoad(item)}
          className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white hover:border-primary transition-all shadow-[0_0_10px_-5px_var(--color-primary)] opacity-80 group-hover:opacity-100"
          title="Update Harga"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 5.5A10 10 0 1 1 11.26 2.75" /></svg>
        </button>
        <button
          onClick={() => onDelete(item.ticker)}
          className="p-2.5 rounded-xl bg-slate-800 text-slate-500 border border-slate-700 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
          title="Hapus"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </div>
    </div>
  );
};