import React from 'react';
import { WatchlistItem } from '../types';

interface WatchlistCardProps {
  item: WatchlistItem;
  onLoad: (item: WatchlistItem) => void;
  onDelete: (ticker: string) => void;
}

export const WatchlistCard: React.FC<WatchlistCardProps> = ({ item, onLoad, onDelete }) => {
  return (
    <div className="bg-surface border border-slate-700 rounded-xl p-4 flex justify-between items-center group hover:border-primary/50 transition-all">
      <div className="flex-1 min-w-0 mr-4">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-lg font-bold text-white tracking-wide">{item.ticker.toUpperCase()}</h3>
          <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
            {new Date(item.lastUpdated).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})}
          </span>
        </div>
        <div className="text-sm text-slate-400 truncate">
          EPS: {item.eps} | BVPS: {item.bvps}
        </div>
        <div className="text-xs text-slate-500 mt-1">
          Last Price: Rp {item.price.toLocaleString('id-ID')}
        </div>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={() => onLoad(item)}
          className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          title="Update Harga"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 5.5A10 10 0 1 1 11.26 2.75"/></svg>
        </button>
        <button
          onClick={() => onDelete(item.ticker)}
          className="p-2 rounded-lg bg-red-900/20 text-red-500 hover:bg-red-900/40 transition-colors"
          title="Hapus"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </div>
    </div>
  );
};