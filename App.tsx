import React, { useState, useEffect } from 'react';
import { StockInput, AnalysisState, CalculationResult, WatchlistItem } from './types';
import { generateBosbissInsight, fetchStockPrice } from './services/geminiService';
import { InputField } from './components/InputField';
import { ResultCard } from './components/ResultCard';
import { WatchlistCard } from './components/WatchlistCard';
import logo from './logo.svg';

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
    if (window.confirm(`Yakin mau hapus ${tickerToDelete} dari pantauan?`)) {
      setWatchlist(prev => prev.filter(item => item.ticker !== tickerToDelete));
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden font-sans text-slate-200 selection:bg-primary/30">
      {/* Background Blobs */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] animate-blob mix-blend-screen"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-secondary/20 rounded-full blur-[100px] animate-blob animation-delay-2000 mix-blend-screen"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[600px] h-[600px] bg-accent/10 rounded-full blur-[120px] animate-blob animation-delay-4000 mix-blend-screen"></div>
      </div>

      <div className="relative z-10 w-full max-w-3xl mx-auto p-4 md:p-8 flex flex-col items-center">

        {/* Header */}
        <div className="text-center mb-10 mt-8 animate-fade-in-up">
          <div className="relative inline-block group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative p-5 rounded-2xl bg-white border border-slate-800 shadow-2xl mb-6 transform transition hover:scale-105 active:scale-95 duration-300">
              <img src={logo} alt="Bosbiss Logo" className="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold pb-2 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent mb-3 tracking-tight">
            Bostock <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Analyst</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-lg mx-auto font-light">
            Valuasi saham <span className="text-slate-200 font-medium">sat-set</span>Fundamental + AI Insight
          </p>
        </div>

        {/* Input Form */}
        <div className="w-full bg-surface/50 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl border border-white/5 mb-8 relative group hover:border-white/10 transition-all duration-500 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          {/* Quick Load Info */}
          {analysis.result === null && ticker && (
            <div className="absolute top-4 right-6 text-xs text-primary font-semibold hidden md:flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
              <span className="animate-pulse">✨</span> Ready to analyze
            </div>
          )}

          <form onSubmit={handleAnalyze}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
              <div className="col-span-1 md:col-span-2 flex flex-col md:flex-row gap-3 items-end mb-2">
                <div className="flex-grow w-full">
                  <InputField
                    id="ticker"
                    label="KODE SAHAM"
                    value={ticker}
                    onChange={setTicker}
                    placeholder="Contoh: BBCA"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={handleFetchPrice}
                  disabled={isFetchingPrice || !ticker}
                  className={`mb-2 h-[52px] px-6 rounded-xl font-semibold border transition-all whitespace-nowrap shadow-lg flex items-center justify-center gap-2
                    ${isFetchingPrice || !ticker
                      ? 'bg-slate-800/50 border-slate-700 text-slate-500 cursor-not-allowed'
                      : 'bg-indigo-600/20 border-indigo-500/50 text-indigo-400 hover:bg-indigo-600/30 hover:border-indigo-400 hover:text-white hover:shadow-indigo-500/20 active:scale-95'}`}
                >
                  {isFetchingPrice ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading...</span>
                    </>
                  ) : <>🔍 Auto Cek</>}
                </button>
              </div>

              <div className="relative group/price">
                <InputField
                  id="price"
                  label="HARGA (Rp)"
                  value={price}
                  onChange={setPrice}
                  type="number"
                  placeholder="0"
                  required
                />
                {priceSource && (
                  <div className="absolute top-0 right-0 text-[10px] text-emerald-400 bg-emerald-900/20 px-2 py-0.5 rounded-full border border-emerald-900/50">
                    ✨ Live Data
                  </div>
                )}
              </div>

              <InputField
                id="eps"
                label="EPS (TTM)"
                value={eps}
                onChange={setEps}
                type="number"
                placeholder="0"
                required
              />

              <InputField
                id="bvps"
                label="BVPS"
                value={bvps}
                onChange={setBvps}
                type="number"
                placeholder="0"
                required
              />

              <InputField
                id="per"
                label="MEAN PER (5Y)"
                value={meanPer}
                onChange={setMeanPer}
                type="number"
                placeholder="Optional"
                optionalLabel="Opsional"
              />
            </div>

            {analysis.error && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 text-red-200 rounded-xl text-sm flex items-center gap-3 animate-pulse">
                🚫 <span>{analysis.error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={analysis.isLoading}
              className={`w-full mt-8 py-3 rounded-xl font-bold text-lg tracking-wide transition-all transform hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] shadow-xl relative overflow-hidden group
                ${analysis.isLoading
                  ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-primary via-accent to-secondary text-white hover:shadow-primary/40'}`}
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <span className="relative flex items-center justify-center gap-2">
                {analysis.isLoading ? 'Calculating...' : <>🚀 ANALYZE NOW</>}
              </span>
            </button>
          </form>
        </div>

        {/* Results Section */}
        {analysis.result && (
          <div className="w-full animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <div className="flex justify-between items-center mb-6 px-2">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="w-1 h-8 bg-gradient-to-b from-primary to-secondary rounded-full mr-1"></span>
                Result: <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">{ticker.toUpperCase()}</span>
              </h2>
              <button
                onClick={handleSaveToWatchlist}
                className="text-xs font-semibold bg-surface border border-slate-700 hover:border-primary/50 text-slate-300 hover:text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2 group"
              >
                <span className="group-hover:scale-110 transition-transform">💾</span> SAVE
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
              <ResultCard
                title="Graham Number"
                value={analysis.result.grahamNumber}
                status={analysis.result.grahamStatus}
                mos={analysis.result.grahamMos}
              />

              {analysis.result.histValuation ? (
                <ResultCard
                  title="Historical PER Valuation"
                  value={analysis.result.histValuation}
                  status={analysis.result.histStatus!}
                  mos={analysis.result.histMos!}
                />
              ) : (
                <div className="bg-surface/30 border border-slate-800/50 rounded-2xl p-6 flex flex-col justify-center items-center text-center backdrop-blur-sm">
                  <span className="text-3xl mb-2 opacity-50">📉</span>
                  <p className="text-slate-500 text-sm font-medium">No Historical Data<br />Input Mean PER to see this.</p>
                </div>
              )}
            </div>

            {/* Insight Section */}
            <div className="bg-gradient-to-br from-surface to-slate-900 rounded-3xl p-1 relative overflow-hidden shadow-2xl mb-12 group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-secondary opacity-20 group-hover:opacity-30 transition duration-1000 blur-lg"></div>
              <div className="relative bg-surface/90 backdrop-blur-xl rounded-[22px] p-6 border border-white/5">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-xl">🤖</span> AI Insight <span className="text-xs font-normal text-slate-500 border border-slate-700 rounded px-1.5 py-0.5">Gemini</span>
                </h3>

                {analysis.insight ? (
                  <div className="prose prose-invert prose-p:text-slate-300 max-w-none leading-relaxed text-[15px] font-light">
                    <p className="whitespace-pre-line">{analysis.insight}</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 py-4">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:0.1s]"></div>
                      <div className="w-2 h-2 bg-secondary rounded-full animate-bounce [animation-delay:0.2s]"></div>
                    </div>
                    <span className="text-sm text-slate-400 font-medium animate-pulse">Generating strategic insight...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Watchlist Section */}
        <div className="w-full border-t border-slate-800/50 pt-10 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <h2 className="text-xl font-bold text-slate-200 mb-6 flex items-center gap-3">
            <span>👀</span> Watchlist
            <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
              {watchlist.length}
            </span>
          </h2>

          {watchlist.length === 0 ? (
            <div className="text-center py-16 bg-surface/20 rounded-3xl border border-dashed border-slate-800/60 backdrop-blur-sm">
              <div className="w-16 h-16 mx-auto bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl opacity-50">🔭</span>
              </div>
              <p className="text-slate-400 font-medium">Your watchlist is empty.</p>
              <p className="text-slate-600 text-sm mt-1">Start analyzing to build your portfolio.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
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

        <footer className="mt-16 text-center text-slate-600 text-sm pb-8">
          <p className="flex items-center justify-center gap-2 hover:text-slate-500 transition-colors cursor-default">
            Built with <span className="text-red-500/80">❤</span> by <span className="font-bold text-slate-500">Bostock</span>
          </p>
        </footer>

      </div>
    </div>
  );
};

export default App;