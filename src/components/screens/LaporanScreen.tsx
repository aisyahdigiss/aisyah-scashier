import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';

export const LaporanScreen: React.FC = () => {
  const { transactions, products, categories, showToast } = usePOS();
  const [reportPeriod, setReportPeriod] = useState<'bulan_ini' | 'minggu_ini' | 'hari_ini'>('bulan_ini');

  const formatRupiah = (val: number) => `Rp ${val.toLocaleString('id-ID')}`;

  const totalOmset = transactions.reduce((acc, t) => acc + (t.status === 'Selesai' ? t.total : 0), 0) + 14850000;
  const totalTrxCount = transactions.length + 240;
  const avgBasketSize = Math.round(totalOmset / (totalTrxCount || 1));
  const estimatedGrossProfit = Math.round(totalOmset * 0.42);

  // Payment Breakdown
  const paymentBreakdown = [
    { method: 'QRIS Dinamis', count: 124, percentage: 48, color: 'bg-[#30628a]', text: 'text-[#30628a]' },
    { method: 'Uang Tunai (Cash)', count: 82, percentage: 32, color: 'bg-emerald-600', text: 'text-emerald-700' },
    { method: 'Kartu Debit/Kredit', count: 52, percentage: 20, color: 'bg-amber-500', text: 'text-amber-700' },
  ];

  // Category Breakdown
  const categoryStats = [
    { name: 'Minuman Kopi', percentage: 42, revenue: 6237000 },
    { name: 'Pastry & Cake', percentage: 28, revenue: 4158000 },
    { name: 'Minuman Non-Kopi', percentage: 18, revenue: 2673000 },
    { name: 'Merchandise & ATK', percentage: 12, revenue: 1782000 },
  ];

  const handleExportCSV = () => {
    try {
      const headers = ['No Faktur', 'Tanggal', 'Waktu', 'Kasir', 'Metode', 'Total', 'Status'];
      const rows = transactions.map((t) => [
        t.invoiceNumber,
        t.dateStr,
        t.timeStr,
        t.cashierName,
        t.paymentMethod,
        t.total,
        t.status,
      ]);

      const csvContent =
        'data:text/csv;charset=utf-8,' +
        [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Laporan_Penjualan_Kasirku_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast('Laporan berhasil diekspor ke CSV!', 'success');
    } catch {
      showToast('Gagal mengekspor laporan', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1d1b16] tracking-tight">
            Laporan & Analisis Penjualan
          </h1>
          <p className="text-sm text-[#41474e] mt-1">
            Analisis tren pendapatan, distribusi metode pembayaran, dan kinerja kategori produk.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#f3ede4] p-1 rounded-full border border-[#ede7df] flex items-center">
            <button
              onClick={() => setReportPeriod('hari_ini')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                reportPeriod === 'hari_ini' ? 'bg-[#30628a] text-white shadow-xs' : 'text-[#41474e]'
              }`}
            >
              Hari Ini
            </button>
            <button
              onClick={() => setReportPeriod('minggu_ini')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                reportPeriod === 'minggu_ini' ? 'bg-[#30628a] text-white shadow-xs' : 'text-[#41474e]'
              }`}
            >
              Minggu Ini
            </button>
            <button
              onClick={() => setReportPeriod('bulan_ini')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                reportPeriod === 'bulan_ini' ? 'bg-[#30628a] text-white shadow-xs' : 'text-[#41474e]'
              }`}
            >
              Bulan Ini
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-full bg-white hover:bg-[#ede7df] text-[#30628a] border border-[#ede7df] font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">file_download</span>
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* 4 Financial Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-3xl p-5 border border-[#ede7df] shadow-[0px_4px_20px_rgba(162,210,255,0.12)]">
          <span className="text-xs font-semibold text-[#72787f] uppercase">Total Omset Kotor</span>
          <h3 className="text-2xl font-bold text-[#1d1b16] mt-2">{formatRupiah(totalOmset)}</h3>
          <p className="text-xs font-semibold text-emerald-700 mt-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">trending_up</span> +18.2% vs periode lalu
          </p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#ede7df] shadow-[0px_4px_20px_rgba(162,210,255,0.12)]">
          <span className="text-xs font-semibold text-[#72787f] uppercase">Estimasi Laba Kotor (42%)</span>
          <h3 className="text-2xl font-bold text-[#30628a] mt-2">{formatRupiah(estimatedGrossProfit)}</h3>
          <p className="text-xs text-[#72787f] mt-2">Margin keuntungan rata-rata</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#ede7df] shadow-[0px_4px_20px_rgba(162,210,255,0.12)]">
          <span className="text-xs font-semibold text-[#72787f] uppercase">Jumlah Transaksi</span>
          <h3 className="text-2xl font-bold text-[#1d1b16] mt-2">{totalTrxCount} Faktur</h3>
          <p className="text-xs text-emerald-700 font-semibold mt-2">Tingkat keberhasilan 99.4%</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-[#ede7df] shadow-[0px_4px_20px_rgba(162,210,255,0.12)]">
          <span className="text-xs font-semibold text-[#72787f] uppercase">Rata-rata Belanja (AOV)</span>
          <h3 className="text-2xl font-bold text-[#1d1b16] mt-2">{formatRupiah(avgBasketSize)}</h3>
          <p className="text-xs text-[#72787f] mt-2">Per struk transaksi</p>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods Breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-[#ede7df] shadow-[0px_4px_20px_rgba(162,210,255,0.12)] flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#1d1b16]">Distribusi Pembayaran</h3>
            <p className="text-xs text-[#72787f] mb-6">Metode pembayaran yang paling digemari pelanggan</p>

            <div className="space-y-4">
              {paymentBreakdown.map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-[#1d1b16]">{item.method}</span>
                    <span className={item.text}>{item.percentage}% ({item.count} trx)</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-[#f3ede4] overflow-hidden">
                    <div
                      style={{ width: `${item.percentage}%` }}
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3.5 mt-6 rounded-2xl bg-[#f9f3ea] border border-[#ede7df] text-xs text-[#41474e]">
            <strong>Insight:</strong> Transaksi digital (QRIS & Kartu) mencakup <strong>68%</strong> dari total penerimaan outlet.
          </div>
        </div>

        {/* Category Contribution */}
        <div className="bg-white rounded-3xl p-6 border border-[#ede7df] shadow-[0px_4px_20px_rgba(162,210,255,0.12)] flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#1d1b16]">Kontribusi Kategori Penjualan</h3>
            <p className="text-xs text-[#72787f] mb-6">Porsi omset berdasarkan kategori menu</p>

            <div className="space-y-4">
              {categoryStats.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-[#f9f3ea] border border-[#ede7df]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#bee1ff] text-[#30628a] font-bold flex items-center justify-center text-xs">
                      {item.percentage}%
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-[#1d1b16]">{item.name}</h4>
                      <p className="text-[11px] text-[#72787f]">{formatRupiah(item.revenue)}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#30628a]">
                    Porsi #{idx + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3.5 mt-6 rounded-2xl bg-[#bee1ff]/30 border border-[#bee1ff] text-xs text-[#001e2f]">
            Kategori <strong>Minuman Kopi</strong> merupakan kontributor terbesar dengan 42% pendapatan.
          </div>
        </div>
      </div>
    </div>
  );
};
