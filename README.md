# Bostock Analyst 🚀💸

**Valuasi saham sat-set ala Gen-Z!**

Bostock Analyst adalah aplikasi web modern untuk membantu investor saham (khususnya pasar saham Indonesia/IDX) melakukan valuasi fundamental secara cepat dan mudah. Aplikasi ini menggabungkan perhitungan metode klasik (Graham Number & Historical PER) dengan kecerdasan buatan (Gen AI) untuk memberikan insight investasi yang tajam dan mudah dimengerti.

![Bostock Analyst UI](screenshots/bostock.png)

## ✨ Fitur Unggulan

*   **🔍 Auto Cek Harga**: Tarik data harga saham real-time (via Google Finance) hanya dengan input kode saham (Ticker).
*   **📊 Valuasi Fundamental**:
    *   **Graham Number**: Hitung harga wajar berdasarkan EPS dan BVPS.
    *   **Historical PER**: Valuasi berdasarkan rata-rata Price Earning Ratio 5 tahun terakhir.
    *   **Margin of Safety (MOS)**: Indikator visual apakah saham sedang Undervalued (Diskon) atau Overvalued (Mahal).
*   **🤖 AI Insight**: Dapatkan analisis naratif instan yang santai tapi daging, merangkum data angka menjadi saran strategi yang actionable.
*   **👀 Watchlist**: Simpan saham-saham pantauanmu agar tidak lupa.
*   **🎨 UI Premium & Modern**: Tampilan Glassmorphism yang clean, responsif, dan nyaman di mata (Dark Mode).

## 🛠️ Cara Menjalankan (Run Locally)

Pastikan kamu sudah menginstall **Node.js**.

1.  **Clone atau Download** repository ini.
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Setup API Key**:
    *   Pastikan kamu memiliki API Key dari [Google AI Studio](https://aistudio.google.com/).
    *   Cek file `.env.local` dan pastikan `GEMINI_API_KEY` sudah terisi dengan key yang valid.
4.  **Jalankan aplikasi**:
    ```bash
    npm run dev
    ```
5.  Buka browser dan akses `http://localhost:3000` (atau port lain yang muncul di terminal).

## 🧰 Tech Stack

*   **Frontend**: React (Vite) + TypeScript
*   **Styling**: Tailwind CSS (Custom Config + Glassmorphism)
*   **AI Engine**: Google Gemini API (via `@google/genai` SDK)

---
*Built with ❤️ by Antigravity*
