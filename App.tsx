import React, { useState, useEffect } from 'react';
import { StockInput, AnalysisState, CalculationResult, WatchlistItem } from './types';
import { generateBosbissInsight, fetchStockPrice } from './services/geminiService';
import { InputField } from './components/InputField';
import { ResultCard } from './components/ResultCard';
import { WatchlistCard } from './components/WatchlistCard';

const App: React.FC = () => {
  // Input State
  const [ticker, setTicker] = useState('');
  const [price, setPrice] = useState('');
  const [eps, setEps] = useState('');
  const [bvps, setBvps] = useState('');
  const [meanPer, setMeanPer] = useState('');

  // UI State
  const [isFetchingPrice, setIsFetchingPrice] = useState(false);
  const [priceSource, setPriceSource] = useState<string | null>(null);

  // Analysis State
  const [analysis, setAnalysis] = useState<AnalysisState>({
    isLoading: false,
    result: null,
    insight: null,
    error: null,
  });

  // Watchlist State
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);

  // Load Watchlist from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('bosbissWatchlist');
    if (saved) {
      try {
        setWatchlist(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse watchlist", e);
      }
    }
  }, []);

  // Save Watchlist to LocalStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('bosbissWatchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  const calculateFairValue = (): CalculationResult => {
    const numPrice = parseFloat(price);
    const numEps = parseFloat(eps);
    const numBvps = parseFloat(bvps);
    const numMeanPer = meanPer ? parseFloat(meanPer) : undefined;

    // 1. Graham Number Calculation
    const grahamNumber = Math.sqrt(22.5 * numEps * numBvps);
    const grahamDiff = grahamNumber - numPrice;
    const grahamMos = (grahamDiff / grahamNumber) * 100;
    
    let grahamStatus: 'UNDERVALUED' | 'FAIR' | 'OVERVALUED' = 'FAIR';
    if (grahamMos > 15) grahamStatus = 'UNDERVALUED';
    else if (grahamMos < -15) grahamStatus = 'OVERVALUED';

    // 2. Historical PER Valuation (Optional)
    let histValuation: number | null = null;
    let histStatus: 'UNDERVALUED' | 'FAIR' | 'OVERVALUED' | null = null;
    let histMos: number | null = null;

    if (numMeanPer) {
      histValuation = numMeanPer * numEps;
      const histDiff = histValuation - numPrice;
      histMos = (histDiff / histValuation) * 100;

      if (histMos > 15) histStatus = 'UNDERVALUED';
      else if (histMos < -15) histStatus = 'OVERVALUED';
      else histStatus = 'FAIR';
    }

    return {
      grahamNumber,
      grahamStatus,
      grahamMos,
      histValuation,
      histStatus,
      histMos
    };
  };

  const handleFetchPrice = async () => {
    if (!ticker) {
      setAnalysis(prev => ({ ...prev, error: "Isi Kode Saham dulu Bos!" }));
      return;
    }

    setIsFetchingPrice(true);
    setAnalysis(prev => ({ ...prev, error: null }));
    setPriceSource(null);

    const data = await fetchStockPrice(ticker);

    if (data && data.price) {
      setPrice(data.price.toString());
      if (data.source) setPriceSource(data.source);
    } else {
      setAnalysis(prev => ({ ...prev, error: "Gagal ambil harga. Coba input manual aja ya." }));
    }
    
    setIsFetchingPrice(false);
  };

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Validation
    if (!ticker || !price || !eps || !bvps) {
      setAnalysis(prev => ({ ...prev, error: "Waduh Bos, data Harga, EPS, dan BVPS wajib diisi ya!" }));
      return;
    }

    setAnalysis({ isLoading: true, result: null, insight: null, error: null });

    try {
      const result = calculateFairValue();
      
      // Update UI with calculation immediately
      setAnalysis(prev => ({ ...prev, result: result }));

      // Generate Insight via Gemini
      const stockInput: StockInput = {
        ticker,
        price: parseFloat(price),
        eps: parseFloat(eps),
        bvps: parseFloat(bvps),
        meanPer: meanPer ? parseFloat(meanPer) : undefined
      };

      const insightText = await generateBosbissInsight(stockInput, result);
      
      setAnalysis(prev => ({
        ...prev,
        isLoading: false,
        insight: insightText
      }));

    } catch (err) {
      setAnalysis(prev => ({
        ...prev,
        isLoading: false,
        error: "Yah error Bos. Coba cek angkanya lagi."
      }));
    }
  };

  const handleSaveToWatchlist = () => {
    if (!ticker || !price || !eps || !bvps) return;

    const newItem: WatchlistItem = {
      ticker: ticker.toUpperCase(),
      price: parseFloat(price),
      eps: parseFloat(eps),
      bvps: parseFloat(bvps),
      meanPer: meanPer ? parseFloat(meanPer) : undefined,
      lastUpdated: Date.now()
    };

    setWatchlist(prev => {
      // Remove existing item with same ticker if exists, then add new one to top
      const filtered = prev.filter(item => item.ticker !== newItem.ticker);
      return [newItem, ...filtered];
    });
    
    // Visual feedback (optional simple alert for now)
    alert(`Mantap! ${ticker.toUpperCase()} udah masuk pantauan.`);
  };

  const handleLoadItem = (item: WatchlistItem) => {
    setTicker(item.ticker);
    setPrice(item.price.toString());
    setEps(item.eps.toString());
    setBvps(item.bvps.toString());
    setMeanPer(item.meanPer ? item.meanPer.toString() : '');
    setPriceSource(null);
    
    // Reset analysis result to encourage re-analyze with potentially new price
    setAnalysis({
      isLoading: false,
      result: null,
      insight: null,
      error: null
    });

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteItem = (tickerToDelete: string) => {
    if(window.confirm(`Yakin mau hapus ${tickerToDelete} dari pantauan?`)) {
      setWatchlist(prev => prev.filter(item => item.ticker !== tickerToDelete));
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-2xl">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-block p-3 rounded-2xl bg-surface border border-slate-700 mb-4 shadow-xl">
            <span className="text-4xl">👔📈</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            Bosbiss Stock Analyst
          </h1>
          <p className="text-slate-400">
            Valuasi fundamental sat-set ala Gen-Z.
          </p>
        </div>

        {/* Input Form */}
        <div className="bg-surface rounded-2xl p-6 md:p-8 shadow-xl border border-slate-700 mb-8 relative">
           {/* Quick Load Info */}
           {analysis.result === null && ticker && (
            <div className="absolute top-4 right-6 text-xs text-slate-500 hidden md:block">
              Isi data & klik Gas Analisa 👇
            </div>
           )}

          <form onSubmit={handleAnalyze}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              <div className="col-span-1 md:col-span-2 flex flex-col md:flex-row gap-2 items-start">
                <div className="flex-grow w-full">
                  <InputField 
                    id="ticker" 
                    label="Kode Saham (Ticker)" 
                    value={ticker} 
                    onChange={setTicker} 
                    placeholder="Misal: BBCA, TLKM" 
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={handleFetchPrice}
                  disabled={isFetchingPrice || !ticker}
                  className={`mt-6 md:mt-0 mb-4 md:mb-0 h-[46px] px-4 rounded-lg font-medium border transition-all whitespace-nowrap
                    ${isFetchingPrice || !ticker
                      ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed' 
                      : 'bg-indigo-900/30 border-indigo-500/50 text-indigo-400 hover:bg-indigo-900/50 hover:text-indigo-300'}`}
                >
                  {isFetchingPrice ? (
                    <span className="flex items-center gap-2">
                       <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                       Cari...
                    </span>
                  ) : '🔍 Cek Harga'}
                </button>
              </div>
              
              <div className="relative">
                <InputField 
                  id="price" 
                  label="Harga Saat Ini (Rp)" 
                  value={price} 
                  onChange={setPrice} 
                  type="number"
                  placeholder="1000" 
                  required
                />
                {priceSource && (
                  <div className="absolute top-0 right-0 text-[10px] text-slate-500 max-w-[150px] truncate">
                    Source: <a href={priceSource} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">Google Finance/Search</a>
                  </div>
                )}
              </div>
              
              <InputField 
                id="eps" 
                label="EPS (Annualized/TTM)" 
                value={eps} 
                onChange={setEps} 
                type="number"
                placeholder="150" 
                required
              />
              
              <InputField 
                id="bvps" 
                label="BVPS (Book Value)" 
                value={bvps} 
                onChange={setBvps} 
                type="number"
                placeholder="800" 
                required
              />
              
              <InputField 
                id="per" 
                label="Rata-rata PER 5 Tahun" 
                value={meanPer} 
                onChange={setMeanPer} 
                type="number"
                placeholder="15.5" 
                optionalLabel="Opsional"
              />
            </div>

            {analysis.error && (
              <div className="mt-4 p-3 bg-red-900/20 border border-red-800 text-red-400 rounded-lg text-sm">
                ⚠️ {analysis.error}
              </div>
            )}

            <button
              type="submit"
              disabled={analysis.isLoading}
              className={`w-full mt-6 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg
                ${analysis.isLoading 
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-primary to-accent text-white hover:shadow-primary/25'}`}
            >
              {analysis.isLoading ? 'Lagi Mikir...' : 'Gas Analisa, Bos! 🚀'}
            </button>
          </form>
        </div>

        {/* Results Section */}
        {analysis.result && (
          <div className="animate-fade-in-up mb-12">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                📊 Hasil Analisa: <span className="text-accent">{ticker.toUpperCase()}</span>
              </h2>
              <button 
                onClick={handleSaveToWatchlist}
                className="text-xs md:text-sm bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 border border-slate-600"
              >
                💾 Simpan Pantauan
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <ResultCard 
                title="Graham Number"
                value={analysis.result.grahamNumber}
                status={analysis.result.grahamStatus}
                mos={analysis.result.grahamMos}
              />
              
              {analysis.result.histValuation ? (
                <ResultCard 
                  title="Valuasi Historical PER"
                  value={analysis.result.histValuation}
                  status={analysis.result.histStatus!}
                  mos={analysis.result.histMos!}
                />
              ) : (
                <div className="bg-surface/50 border border-slate-800 rounded-xl p-6 flex flex-col justify-center items-center text-center">
                   <span className="text-4xl mb-2">🤷‍♂️</span>
                   <p className="text-slate-500 text-sm">Data PER 5 Tahun gak diisi, <br/>jadi gak bisa dihitung Bos.</p>
                </div>
              )}
            </div>

            {/* Insight Section */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
              
              <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                💡 Insight Bosbiss
              </h3>
              
              {analysis.insight ? (
                <div className="prose prose-invert prose-p:text-slate-300 max-w-none leading-relaxed">
                  <p className="whitespace-pre-line">{analysis.insight}</p>
                </div>
              ) : (
                 <div className="flex items-center gap-3 text-slate-400 animate-pulse">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
                    <span className="text-sm">Lagi ngetik insight...</span>
                 </div>
              )}
            </div>
          </div>
        )}

        {/* Watchlist Section */}
        <div className="border-t border-slate-800 pt-8">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            👀 Pantauan Bosbiss <span className="text-sm font-normal text-slate-500 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">{watchlist.length} Saham</span>
          </h2>
          
          {watchlist.length === 0 ? (
            <div className="text-center py-12 bg-surface/30 rounded-2xl border border-slate-800 border-dashed">
              <span className="text-4xl block mb-2">📭</span>
              <p className="text-slate-400">Belum ada pantauan nih, Bos.</p>
              <p className="text-slate-600 text-sm">Analisa dulu terus klik "Simpan Pantauan".</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {watchlist.map((item) => (
                <WatchlistCard 
                  key={item.ticker} 
                  item={item} 
                  onLoad={handleLoadItem}
                  onDelete={handleDeleteItem}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default App;