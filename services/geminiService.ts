import { GoogleGenAI } from "@google/genai";
import { StockInput, CalculationResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fetchStockPrice = async (ticker: string): Promise<{ price: number; source?: string } | null> => {
  try {
    const model = 'gemini-3-flash-preview';
    const prompt = `Berapa harga saham ${ticker} Indonesia (IDX) saat ini/terbaru? 
    Jawab HANYA dengan angkanya saja tanpa format mata uang, tanpa titik/koma pemisah ribuan. 
    Contoh jika harga 4.500, jawab: 4500.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    // Extract text
    const text = response.text?.trim();
    if (!text) return null;

    // Try to parse number from text (remove non-digits just in case)
    const cleanNumber = text.replace(/[^0-9]/g, '');
    const price = parseInt(cleanNumber);

    // Get source URL if available (Search Grounding requirement)
    let source = undefined;
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks && groundingChunks.length > 0) {
      // Find the first web URI
      const webChunk = groundingChunks.find((c: any) => c.web?.uri);
      if (webChunk) {
        source = webChunk.web.uri;
      }
    }

    if (isNaN(price)) return null;

    return { price, source };
  } catch (error) {
    console.error("Error fetching price:", error);
    return null;
  }
};

export const generateBosbissInsight = async (
  input: StockInput,
  calculation: CalculationResult
): Promise<string> => {
  try {
    const model = 'gemini-3-flash-preview';
    
    const formatCurrency = (val: number) => `Rp ${val.toLocaleString('id-ID')}`;
    
    const prompt = `
      Role: Anda adalah "Bosbiss Stock Analyst", asisten pribadi yang ahli dalam valuasi saham fundamental. Gaya bicara Anda santai, to the point, ala Gen-Z, tapi sangat teliti dalam perhitungan angka.
      
      Data Saham User:
      - Kode: ${input.ticker.toUpperCase()}
      - Harga Sekarang: ${formatCurrency(input.price)}
      - EPS (TTM): ${input.eps}
      - BVPS: ${input.bvps}
      - Rata-rata PER 5 Tahun: ${input.meanPer ? input.meanPer : 'Tidak ada data'}
      
      Hasil Perhitungan Internal:
      - Graham Number: ${formatCurrency(calculation.grahamNumber)} (Status: ${calculation.grahamStatus}, MOS: ${calculation.grahamMos.toFixed(2)}%)
      ${calculation.histValuation 
        ? `- Valuasi PER Historis: ${formatCurrency(calculation.histValuation)} (Status: ${calculation.histStatus}, MOS: ${calculation.histMos?.toFixed(2)}%)` 
        : ''}

      Tugas:
      Berikan "Insight Bosbiss" satu paragraf pendek saja.
      - Bandingkan harga sekarang dengan hasil hitungan.
      - Gunakan bahasa gaul tapi sopan (misal: "Diskon abis", "Hati-hati boncos", "Masih wajar").
      - Wajib ada Disclaimer On di akhir kalimat.
      - Jangan ulangi angka detail (karena sudah ditampilkan di UI), fokus ke kesimpulan dan saran strategi.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "Waduh, AI lagi bengong nih. Coba lagi nanti ya!";
  } catch (error) {
    console.error("Error generating insight:", error);
    return "Maaf Bos, lagi ada gangguan koneksi ke server otak AI. Analisa manual dulu ya!";
  }
};