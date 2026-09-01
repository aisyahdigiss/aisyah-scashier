import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';

export const DashboardScreen: React.FC = () => {
  const { products, transactions, setCurrentScreen, setActiveReceiptTransaction } = usePOS();
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
          <h1 className="text-2xl md:text-3xl font-bold text-[#1d1b16] tracking-tight">
            Overview Dashboard
          </h1>
          <p className="text-sm text-[#41474e] mt-1">
            Selamat datang kembali di KASIRKU POS. Berikut ringkasan performa toko hari ini.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentScreen('kasir')}
            className="px-5 py-2.5 rounded-full bg-[#30628a] hover:bg-[#275b82] text-white font-bold text-sm flex items-center gap-2 shadow-[0px_4px_16px_rgba(48,98,138,0.25)] transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">point_of_sale</span>
            <span>Buka Kasir</span>
          </button>
        </div>
      </div>

      {/* 4 Bento Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Penjualan */}
        <div className="bg-white rounded-3xl p-5 border border-[#ede7df] shadow-[0px_4px_20px_rgba(162,210,255,0.12)] flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#72787f]">
              Total Penjualan
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#bee1ff] flex items-center justify-center text-[#30628a]">
              <span className="material-symbols-outlined text-[22px]">payments</span>
            </div>
          </div>
          <div>
            <h3 className="text-2xl lg:text-[26px] font-bold text-[#1d1b16] tracking-tight">
              {formatRupiah(totalSalesToday)}
            </h3>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-emerald-700">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              <span>+15.4% dari kemarin</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Transaksi */}
        <div className="bg-white rounded-3xl p-5 border border-[#ede7df] shadow-[0px_4px_20px_rgba(162,210,255,0.12)] flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#72787f]">
              Total Transaksi
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#cae6ff] flex items-center justify-center text-[#40627b]">
              <span className="material-symbols-outlined text-[22px]">receipt_long</span>
            </div>
          </div>
          <div>
            <h3 className="text-2xl lg:text-[26px] font-bold text-[#1d1b16] tracking-tight">
              {totalTransactionsCount}
            </h3>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-emerald-700">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              <span>+5 transaksi dari kemarin</span>
            </div>
          </div>
        </div>

        {/* Card 3: Produk Terjual */}
        <div className="bg-white rounded-3xl p-5 border border-[#ede7df] shadow-[0px_4px_20px_rgba(162,210,255,0.12)] flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#72787f]">
              Produk Terjual
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#cecfb7]/40 flex items-center justify-center text-[#5e604d]">
              <span className="material-symbols-outlined text-[22px]">shopping_basket</span>
            </div>
          </div>
          <div>
            <h3 className="text-2xl lg:text-[26px] font-bold text-[#1d1b16] tracking-tight">
              {totalItemsSold} <span className="text-sm font-normal text-[#72787f]">item</span>
            </h3>
            <p className="text-xs text-[#72787f] mt-2">Tersebar di 5 kategori</p>
          </div>
        </div>

        {/* Card 4: Stok Menipis */}
        <div className="bg-[#ffdad6]/40 rounded-3xl p-5 border border-[#ba1a1a]/20 shadow-[0px_4px_20px_rgba(186,26,26,0.08)] flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#93000a]">
              Stok Menipis
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#ffdad6] flex items-center justify-center text-[#ba1a1a]">
              <span className="material-symbols-outlined text-[22px]">warning</span>
            </div>
          </div>
          <div>
            <h3 className="text-2xl lg:text-[26px] font-bold text-[#93000a] tracking-tight">
              {lowStockProducts.length} <span className="text-sm font-normal text-[#ba1a1a]">produk</span>
            </h3>
            <button
              onClick={() => setCurrentScreen('stok')}
              className="text-xs font-bold text-[#93000a] underline mt-2 block hover:opacity-80 text-left"
            >
              Butuh perhatian segera &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Middle Bento Grid: Sales Trend Chart & Quick Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Bar Chart (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-[#ede7df] shadow-[0px_4px_20px_rgba(162,210,255,0.12)] flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-lg font-bold text-[#1d1b16]">Trend Penjualan</h3>
              <p className="text-xs text-[#72787f]">Pergerakan omset dalam 7 hari terakhir</p>
            </div>

            <div className="flex items-center bg-[#f3ede4] p-1 rounded-full border border-[#ede7df] self-start">
              <button
                onClick={() => setChartPeriod('harian')}
                className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all ${
                  chartPeriod === 'harian'
                    ? 'bg-[#30628a] text-white shadow-xs'
                    : 'text-[#41474e] hover:text-[#1d1b16]'
                }`}
              >
                Harian
              </button>
              <button
                onClick={() => setChartPeriod('mingguan')}
                className={`px-3.5 py-1 rounded-full text-xs font-bold transition-all ${
                  chartPeriod === 'mingguan'
                    ? 'bg-[#30628a] text-white shadow-xs'
                    : 'text-[#41474e] hover:text-[#1d1b16]'
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
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-[11px] font-bold bg-[#1d1b16] text-white px-2 py-1 rounded-lg whitespace-nowrap -mb-1 shadow-md z-10 pointer-events-none">
                  {formatRupiah(item.amount)}
                </div>

                {/* Animated Pillar */}
                <div
                  style={{ height: item.height }}
                  className={`w-full max-w-[48px] rounded-t-xl transition-all duration-300 group-hover:scale-y-105 origin-bottom ${
                    item.isPeak
                      ? 'bg-[#30628a] shadow-[0px_4px_12px_rgba(48,98,138,0.3)]'
                      : 'bg-[#bee1ff] hover:bg-[#a2d2ff]'
                  }`}
                />

                {/* Day Label */}
                <span className="text-xs font-semibold text-[#72787f]">{item.day}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 mt-2 border-t border-[#f3ede4] flex items-center justify-between text-xs text-[#72787f]">
            <span>Puncak penjualan tertinggi pada hari <strong>Sabtu (Rp 1.450.000)</strong></span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">trending_up</span> Rata-rata Rp 905.000/hari
            </span>
          </div>
        </div>

        {/* Stok Menipis Alert List (1 col) */}
        <div className="bg-white rounded-3xl p-6 border border-[#ede7df] shadow-[0px_4px_20px_rgba(162,210,255,0.12)] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#ba1a1a] text-[20px]">
                crisis_alert
              </span>
              <h3 className="text-base font-bold text-[#1d1b16]">Perlu Restok Segera</h3>
            </div>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#ffdad6] text-[#93000a]">
              {lowStockProducts.length}
            </span>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto max-h-56">
            {lowStockProducts.slice(0, 4).map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-[#f9f3ea] border border-[#ede7df]"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-10 h-10 rounded-xl object-cover border border-[#ede7df]"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#1d1b16] truncate">{p.name}</p>
                    <span className="text-[11px] text-[#72787f] font-mono">{p.sku}</span>
                  </div>
                </div>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${
                    p.stock === 0
                      ? 'bg-[#ffdad6] text-[#93000a]'
                      : 'bg-[#feebd0] text-[#8c4f00]'
                  }`}
                >
                  {p.stock === 0 ? 'Habis (0)' : `Sisa ${p.stock}`}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setCurrentScreen('stok')}
            className="w-full mt-4 py-2.5 rounded-xl bg-[#f3ede4] hover:bg-[#ede7df] text-[#30628a] font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Buka Manajemen Stok</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Bottom Section: Leaderboard & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Selling Leaderboard */}
        <div className="bg-white rounded-3xl p-6 border border-[#ede7df] shadow-[0px_4px_20px_rgba(162,210,255,0.12)]">
          <h3 className="text-lg font-bold text-[#1d1b16] mb-1">Produk Terlaris</h3>
          <p className="text-xs text-[#72787f] mb-4">Paling banyak dipesan minggu ini</p>

          <div className="space-y-3">
            {topSelling.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-2xl bg-[#f9f3ea]/70 border border-[#ede7df]"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                      idx === 0
                        ? 'bg-amber-400 text-amber-950 shadow-xs'
                        : idx === 1
                        ? 'bg-slate-300 text-slate-900'
                        : idx === 2
                        ? 'bg-amber-700 text-amber-100'
                        : 'bg-[#ede7df] text-[#41474e]'
                    }`}
                  >
                    #{idx + 1}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1d1b16]">{item.name}</h4>
                    <p className="text-[11px] text-[#72787f]">{item.cat}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-[#30628a] block">
                    {item.sold} Terjual
                  </span>
                  <span className="text-[10px] text-[#72787f]">{formatRupiah(item.revenue)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Transaksi Terakhir Table (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-[#ede7df] shadow-[0px_4px_20px_rgba(162,210,255,0.12)] flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-[#1d1b16]">Transaksi Terakhir</h3>
              <p className="text-xs text-[#72787f]">Aktivitas kasir terbaru secara live</p>
            </div>
            <button
              onClick={() => setCurrentScreen('riwayat')}
              className="text-xs font-bold text-[#30628a] hover:underline flex items-center gap-1"
            >
              <span>Lihat Semua</span>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#ede7df] text-[#72787f] font-semibold uppercase tracking-wider">
                  <th className="pb-3 px-2">Faktur</th>
                  <th className="pb-3 px-2">Waktu</th>
                  <th className="pb-3 px-2">Kasir</th>
                  <th className="pb-3 px-2">Metode</th>
                  <th className="pb-3 px-2 text-right">Total</th>
                  <th className="pb-3 px-2 text-center">Status</th>
                  <th className="pb-3 px-2 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f3ede4]">
                {transactions.slice(0, 5).map((trx) => (
                  <tr key={trx.id} className="hover:bg-[#f9f3ea]/50 transition-colors">
                    <td className="py-3 px-2 font-mono font-bold text-[#30628a]">
                      {trx.invoiceNumber}
                    </td>
                    <td className="py-3 px-2 text-[#41474e]">{trx.timeStr}</td>
                    <td className="py-3 px-2 font-medium text-[#1d1b16]">{trx.cashierName}</td>
                    <td className="py-3 px-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#f3ede4] text-[#41474e]">
                        {trx.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right font-bold text-[#1d1b16]">
                      {formatRupiah(trx.total)}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          trx.status === 'Selesai'
                            ? 'bg-[#e6f4ea] text-[#137333]'
                            : 'bg-[#fef7e0] text-[#b06000]'
                        }`}
                      >
                        {trx.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <button
                        onClick={() => setActiveReceiptTransaction(trx)}
                        className="w-7 h-7 rounded-full inline-flex items-center justify-center text-[#30628a] hover:bg-[#bee1ff] transition-colors"
                        title="Lihat / Cetak Struk"
                      >
                        <span className="material-symbols-outlined text-[18px]">receipt</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
