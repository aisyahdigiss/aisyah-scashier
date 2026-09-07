import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';

export const DashboardScreen: React.FC = () => {
  const { products, transactions, setCurrentScreen, setActiveReceiptTransaction, setIsAssistantOpen } = usePOS();
  const [chartPeriod, setChartPeriod] = useState<'harian' | 'mingguan'>('harian');

  const formatRupiah = (val: number) => `Rp ${val.toLocaleString('id-ID')}`;

  // Metrics
  const totalSalesToday = transactions.reduce((acc, t) => acc + (t.status === 'Selesai' ? t.total : 0), 0) + 1250000;
  const totalTransactionsCount = transactions.length + 44;
  const totalItemsSold = transactions.reduce((acc, t) => acc + t.items.reduce((s, i) => s + i.quantity, 0), 0) + 120;
  const lowStockProducts = products.filter((p) => p.stock <= p.minStockThreshold);

  // Daily Chart Data
  const dailyChartData = [
    { day: 'Sen', amount: 450000, height: '40%' },
    { day: 'Sel', amount: 680000, height: '55%' },
    { day: 'Rab', amount: 520000, height: '45%' },
    { day: 'Kam', amount: 890000, height: '70%' },
    { day: 'Jum', amount: 1100000, height: '85%' },
    { day: 'Sab', amount: 1450000, height: '100%', isPeak: true },
    { day: 'Min', amount: 1250000, height: '90%' },
  ];

  // Top Selling Items Leaderboard
  const topSelling = [
    { name: 'Iced Matcha Latte', sold: 45, revenue: 1800000, cat: 'Minuman' },
    { name: 'Cappuccino Latte', sold: 38, revenue: 1330000, cat: 'Kopi' },
    { name: 'Chocolate Croissant', sold: 29, revenue: 870000, cat: 'Pastry' },
    { name: 'Buku Tulis Premium', sold: 24, revenue: 360000, cat: 'ATK' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#292524] tracking-tight">
            Overview Dashboard
          </h1>
          <p className="text-sm text-[#78716c] mt-1">
            Selamat datang di KASIRKU POS. Pantau transaksi dan performa operasional toko secara real-time.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAssistantOpen(true)}
            className="px-4 py-2.5 rounded-full bg-[#fffdfa] hover:bg-[#fef9c3] text-[#713f12] font-bold text-sm flex items-center gap-1.5 border border-[#ede5d8] shadow-xs active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[18px] text-[#854d0e]">auto_awesome</span>
            <span>Asisten AI</span>
          </button>
          <button
            onClick={() => setCurrentScreen('kasir')}
            className="px-5 py-2.5 rounded-full pastel-gradient-btn text-sm flex items-center gap-2 transition-all active:scale-95 shadow-md"
          >
            <span className="material-symbols-outlined text-[20px]">point_of_sale</span>
            <span>Buka Kasir Terminal</span>
          </button>
        </div>
      </div>

      {/* 4 Bento Metrics Cards (Warm Beige & Pastel Yellow) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Penjualan */}
        <div className="bg-[#fffdfa]/95 backdrop-blur-xs rounded-3xl p-5 border border-[#ede5d8] shadow-[0px_8px_25px_rgba(168,153,128,0.12)] flex flex-col justify-between relative overflow-hidden group hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#78716c]">
              Total Penjualan
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#fef9c3] flex items-center justify-center text-[#713f12] border border-[#fde68a]">
              <span className="material-symbols-outlined text-[22px]">payments</span>
            </div>
          </div>
          <div>
            <h3 className="text-2xl lg:text-[26px] font-extrabold text-[#292524] tracking-tight">
              {formatRupiah(totalSalesToday)}
            </h3>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-amber-700">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              <span>+15.4% dari kemarin</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Transaksi */}
        <div className="bg-[#fffdfa]/95 backdrop-blur-xs rounded-3xl p-5 border border-[#ede5d8] shadow-[0px_8px_25px_rgba(168,153,128,0.12)] flex flex-col justify-between relative overflow-hidden hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#78716c]">
              Total Transaksi
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#fef9c3] flex items-center justify-center text-[#713f12] border border-[#fde68a]">
              <span className="material-symbols-outlined text-[22px]">receipt_long</span>
            </div>
          </div>
          <div>
            <h3 className="text-2xl lg:text-[26px] font-extrabold text-[#292524] tracking-tight">
              {totalTransactionsCount}
            </h3>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-amber-700">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              <span>+5 transaksi hari ini</span>
            </div>
          </div>
        </div>

        {/* Card 3: Produk Terjual */}
        <div className="bg-[#fffdfa]/95 backdrop-blur-xs rounded-3xl p-5 border border-[#ede5d8] shadow-[0px_8px_25px_rgba(168,153,128,0.12)] flex flex-col justify-between relative overflow-hidden hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#78716c]">
              Produk Terjual
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#fef9c3] flex items-center justify-center text-[#713f12] border border-[#fde68a]">
              <span className="material-symbols-outlined text-[22px]">shopping_basket</span>
            </div>
          </div>
          <div>
            <h3 className="text-2xl lg:text-[26px] font-extrabold text-[#292524] tracking-tight">
              {totalItemsSold} <span className="text-sm font-semibold text-[#78716c]">item</span>
            </h3>
            <p className="text-xs text-[#78716c] mt-2">Tersebar di seluruh kategori produk</p>
          </div>
        </div>

        {/* Card 4: Stok Menipis */}
        <div className="bg-[#fffdfa]/95 backdrop-blur-xs rounded-3xl p-5 border border-[#ede5d8] shadow-[0px_8px_25px_rgba(168,153,128,0.12)] flex flex-col justify-between relative overflow-hidden hover:-translate-y-0.5 transition-transform">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#78716c]">
              Stok Menipis
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#fef9c3] flex items-center justify-center text-[#713f12] border border-[#fde68a]">
              <span className="material-symbols-outlined text-[22px]">warning</span>
            </div>
          </div>
          <div>
            <h3 className="text-2xl lg:text-[26px] font-extrabold text-[#292524] tracking-tight">
              {lowStockProducts.length} <span className="text-sm font-semibold text-[#78716c]">produk</span>
            </h3>
            <button
              onClick={() => setCurrentScreen('stok')}
              className="text-xs font-bold text-[#854d0e] hover:underline mt-2 block text-left"
            >
              Cek stok sekarang &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Middle Bento Grid: Sales Trend Chart & Quick Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Bar Chart (2 cols) */}
        <div className="lg:col-span-2 bg-[#fffdfa]/95 backdrop-blur-xs rounded-3xl p-6 border border-[#ede5d8] shadow-[0px_4px_25px_rgba(168,153,128,0.1)] flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-lg font-bold text-[#292524]">Trend Penjualan Mingguan</h3>
              <p className="text-xs text-[#78716c]">Pergerakan omset dalam 7 hari terakhir</p>
            </div>

            <div className="flex items-center bg-[#f7f3eb] p-1 rounded-full border border-[#ede5d8] self-start">
              <button
                onClick={() => setChartPeriod('harian')}
                className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all ${
                  chartPeriod === 'harian'
                    ? 'bg-[#fef9c3] text-[#713f12] shadow-2xs border border-[#fde68a]'
                    : 'text-[#78716c] hover:text-[#292524]'
                }`}
              >
                Harian
              </button>
              <button
                onClick={() => setChartPeriod('mingguan')}
                className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all ${
                  chartPeriod === 'mingguan'
                    ? 'bg-[#fef9c3] text-[#713f12] shadow-2xs border border-[#fde68a]'
                    : 'text-[#78716c] hover:text-[#292524]'
                }`}
              >
                Mingguan
              </button>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="flex-1 flex items-end justify-between gap-2 sm:gap-4 h-56 pt-8 pb-2 px-2">
            {dailyChartData.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                {/* Value Hover Tooltip */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-[11px] font-bold bg-[#713f12] text-white px-2.5 py-1 rounded-xl whitespace-nowrap -mb-1 shadow-md z-10 pointer-events-none">
                  {formatRupiah(item.amount)}
                </div>

                {/* Animated Pillar */}
                <div
                  style={{ height: item.height }}
                  className={`w-full max-w-[48px] rounded-t-2xl transition-all duration-300 group-hover:scale-y-105 origin-bottom ${
                    item.isPeak
                      ? 'bg-[#fde68a] shadow-[0px_3px_10px_rgba(253,230,138,0.5)] border border-[#fcd34d]'
                      : 'bg-[#fef9c3] hover:bg-[#fef08a] border border-[#fde68a]'
                  }`}
                />

                {/* Day Label */}
                <span className="text-xs font-bold text-[#78716c]">{item.day}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 mt-2 border-t border-[#f7f3eb] flex items-center justify-between text-xs text-[#78716c]">
            <span>Puncak penjualan tertinggi: <strong className="text-[#713f12]">Sabtu (Rp 1.450.000)</strong></span>
            <span className="text-[#854d0e] font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">trending_up</span> Rata-rata Rp 905.000/hari
            </span>
          </div>
        </div>

        {/* Stok Menipis Alert List (1 col) */}
        <div className="bg-[#fffdfa]/95 backdrop-blur-xs rounded-3xl p-6 border border-[#ede5d8] shadow-[0px_4px_25px_rgba(168,153,128,0.1)] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#854d0e] text-[20px]">
                crisis_alert
              </span>
              <h3 className="text-base font-bold text-[#292524]">Perlu Restok Segera</h3>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#fef9c3] text-[#713f12] border border-[#fde68a]">
              {lowStockProducts.length}
            </span>
          </div>

          <div className="flex-1 space-y-2.5 overflow-y-auto max-h-56 pr-1">
            {lowStockProducts.slice(0, 4).map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-[#fdfbf7] border border-[#ede5d8]"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-10 h-10 rounded-xl object-cover border border-[#ede5d8]"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#292524] truncate">{p.name}</p>
                    <span className="text-[11px] text-[#854d0e] font-mono">{p.sku}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-[#713f12] block">
                    Sisa: {p.stock}
                  </span>
                  <span className="text-[10px] text-[#78716c]">Min: {p.minStockThreshold}</span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setCurrentScreen('stok')}
            className="w-full mt-4 py-2.5 rounded-2xl bg-[#fef9c3] hover:bg-[#fef08a] text-[#713f12] font-bold text-xs transition-colors border border-[#fde68a] flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <span className="material-symbols-outlined text-[16px]">layers</span>
            <span>Buka Manajemen Stok</span>
          </button>
        </div>
      </div>

      {/* Bottom Grid: Recent Transactions & Top Selling Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions (2 cols) */}
        <div className="lg:col-span-2 bg-[#fffdfa]/95 backdrop-blur-xs rounded-3xl p-6 border border-[#ede5d8] shadow-[0px_4px_25px_rgba(168,153,128,0.1)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-[#292524]">Transaksi Terakhir</h3>
              <p className="text-xs text-[#78716c]">Daftar faktur terbaru yang berhasil diproses</p>
            </div>
            <button
              onClick={() => setCurrentScreen('riwayat')}
              className="text-xs font-bold text-[#854d0e] hover:underline"
            >
              Lihat Semua &rarr;
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#ede5d8] text-[#78716c] font-bold uppercase tracking-wider">
                  <th className="pb-3">No. Faktur</th>
                  <th className="pb-3">Waktu</th>
                  <th className="pb-3">Tipe</th>
                  <th className="pb-3">Metode</th>
                  <th className="pb-3 text-right">Total</th>
                  <th className="pb-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f7f3eb]">
                {transactions.slice(0, 5).map((trx) => (
                  <tr key={trx.id} className="hover:bg-[#fdfbf7] transition-colors">
                    <td className="py-3 font-mono font-bold text-[#713f12]">
                      {trx.invoiceNumber}
                    </td>
                    <td className="py-3 text-[#78716c]">{trx.timeStr}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#fef9c3] text-[#713f12] border border-[#fde68a]">
                        {trx.orderType || 'Dine In'}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#f7f3eb] text-[#57534e] border border-[#ede5d8]">
                        {trx.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 text-right font-extrabold text-[#292524]">
                      {formatRupiah(trx.total)}
                    </td>
                    <td className="py-3 text-center">
                      <button
                        onClick={() => setActiveReceiptTransaction(trx)}
                        className="px-2.5 py-1 rounded-xl bg-[#fef9c3] hover:bg-[#fef08a] text-[#713f12] text-[11px] font-bold transition-colors border border-[#fde68a]"
                        title="Lihat Struk"
                      >
                        Struk
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Selling Leaderboard (1 col) */}
        <div className="bg-[#fffdfa]/95 backdrop-blur-xs rounded-3xl p-6 border border-[#ede5d8] shadow-[0px_4px_25px_rgba(168,153,128,0.1)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-[#292524]">Menu Terlaris</h3>
                <p className="text-xs text-[#78716c]">Paling banyak dipesan hari ini</p>
              </div>
              <span className="material-symbols-outlined text-[#854d0e]">military_tech</span>
            </div>

            <div className="space-y-3">
              {topSelling.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-[#fdfbf7] border border-[#ede5d8]"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-[#fef9c3] text-[#713f12] border border-[#fde68a]"
                    >
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-[#292524]">{item.name}</p>
                      <span className="text-[10px] text-[#78716c]">{item.cat}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-[#713f12] block">
                      {item.sold} cup/pcs
                    </span>
                    <span className="text-[10px] text-[#78716c]">{formatRupiah(item.revenue)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-3 rounded-2xl bg-[#fef9c3]/50 border border-[#fde68a] text-center">
            <p className="text-xs text-[#713f12]">
              Omset kategori <strong>Minuman</strong> menyumbang 62% dari total pendapatan!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
