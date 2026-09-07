import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';

export const LaporanScreen: React.FC = () => {
  const { transactions, showToast } = usePOS();
  const [reportPeriod, setReportPeriod] = useState<'bulan_ini' | 'minggu_ini' | 'hari_ini'>('bulan_ini');

  const formatRupiah = (val: number) => `Rp ${val.toLocaleString('id-ID')}`;

  const totalOmset = transactions.reduce((acc, t) => acc + (t.status === 'Selesai' ? t.total : 0), 0) + 14850000;
  const totalTrxCount = transactions.length + 240;
  const avgBasketSize = Math.round(totalOmset / (totalTrxCount || 1));
  const estimatedGrossProfit = Math.round(totalOmset * 0.42);

  // Payment Breakdown
  const paymentBreakdown = [
    { method: 'QRIS Dinamis', count: 124, percentage: 48, color: 'bg-[#fef08a]', text: 'text-[#713f12]' },
    { method: 'Uang Tunai (Cash)', count: 82, percentage: 32, color: 'bg-[#fef9c3]', text: 'text-[#713f12]' },
    { method: 'Kartu Debit/Kredit', count: 52, percentage: 20, color: 'bg-[#faeed6]', text: 'text-[#713f12]' },
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
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#292524] tracking-tight">
            Laporan & Analisis Penjualan
          </h1>
          <p className="text-sm text-[#78716c] mt-1">
            Analisis tren pendapatan, distribusi metode pembayaran, dan kinerja kategori produk.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#f7f3eb] p-1 rounded-full border border-[#ede5d8] flex items-center">
            <button
              onClick={() => setReportPeriod('hari_ini')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                reportPeriod === 'hari_ini'
                  ? 'bg-[#fef9c3] text-[#713f12] shadow-2xs border border-[#fde68a]'
                  : 'text-[#78716c] hover:text-[#292524]'
              }`}
            >
              Hari Ini
            </button>
            <button
              onClick={() => setReportPeriod('minggu_ini')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                reportPeriod === 'minggu_ini'
                  ? 'bg-[#fef9c3] text-[#713f12] shadow-2xs border border-[#fde68a]'
                  : 'text-[#78716c] hover:text-[#292524]'
              }`}
            >
              Minggu Ini
            </button>
            <button
              onClick={() => setReportPeriod('bulan_ini')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                reportPeriod === 'bulan_ini'
                  ? 'bg-[#fef9c3] text-[#713f12] shadow-2xs border border-[#fde68a]'
                  : 'text-[#78716c] hover:text-[#292524]'
              }`}
            >
              Bulan Ini
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-full bg-[#fffdfa] hover:bg-[#fef9c3] text-[#713f12] border border-[#ede5d8] font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">file_download</span>
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* 4 Financial Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-[#fffdfa]/95 backdrop-blur-xs rounded-3xl p-5 border border-[#ede5d8] shadow-[0px_4px_20px_rgba(168,153,128,0.1)]">
          <span className="text-xs font-bold text-[#78716c] uppercase">Total Omset Kotor</span>
          <h3 className="text-2xl font-extrabold text-[#713f12] mt-2">{formatRupiah(totalOmset)}</h3>
          <p className="text-xs font-bold text-[#713f12] mt-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">trending_up</span> +18.2% vs periode lalu
          </p>
        </div>

        <div className="bg-[#fffdfa]/95 backdrop-blur-xs rounded-3xl p-5 border border-[#ede5d8] shadow-[0px_4px_20px_rgba(168,153,128,0.1)]">
          <span className="text-xs font-bold text-[#78716c] uppercase">Estimasi Laba Kotor (42%)</span>
          <h3 className="text-2xl font-extrabold text-[#292524] mt-2">{formatRupiah(estimatedGrossProfit)}</h3>
          <p className="text-xs text-[#78716c] mt-2">Margin keuntungan rata-rata</p>
        </div>

        <div className="bg-[#fffdfa]/95 backdrop-blur-xs rounded-3xl p-5 border border-[#ede5d8] shadow-[0px_4px_20px_rgba(168,153,128,0.1)]">
          <span className="text-xs font-bold text-[#78716c] uppercase">Jumlah Transaksi</span>
          <h3 className="text-2xl font-extrabold text-[#292524] mt-2">{totalTrxCount} Faktur</h3>
          <p className="text-xs text-[#713f12] font-semibold mt-2">Tingkat keberhasilan 99.4%</p>
        </div>

        <div className="bg-[#fffdfa]/95 backdrop-blur-xs rounded-3xl p-5 border border-[#ede5d8] shadow-[0px_4px_20px_rgba(168,153,128,0.1)]">
          <span className="text-xs font-bold text-[#78716c] uppercase">Rata-rata Belanja (AOV)</span>
          <h3 className="text-2xl font-extrabold text-[#292524] mt-2">{formatRupiah(avgBasketSize)}</h3>
          <p className="text-xs text-[#78716c] mt-2">Per struk transaksi</p>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods Breakdown */}
        <div className="bg-[#fffdfa]/95 backdrop-blur-xs rounded-3xl p-6 border border-[#ede5d8] shadow-[0px_4px_20px_rgba(168,153,128,0.1)] flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#292524]">Distribusi Pembayaran</h3>
            <p className="text-xs text-[#78716c] mb-6">Metode pembayaran yang paling digemari pelanggan</p>

            <div className="space-y-4">
              {paymentBreakdown.map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-[#292524]">{item.method}</span>
                    <span className={item.text}>{item.percentage}% ({item.count} trx)</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-[#f7f3eb] overflow-hidden border border-[#ede5d8]">
                    <div
                      style={{ width: `${item.percentage}%` }}
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3.5 mt-6 rounded-2xl bg-[#fdfbf7] border border-[#ede5d8] text-xs text-[#57534e]">
            <strong>Insight:</strong> Transaksi digital (QRIS & Kartu) mencakup <strong>68%</strong> dari total penerimaan outlet.
          </div>
        </div>

        {/* Category Contribution */}
        <div className="bg-[#fffdfa]/95 backdrop-blur-xs rounded-3xl p-6 border border-[#ede5d8] shadow-[0px_4px_20px_rgba(168,153,128,0.1)] flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#292524]">Kontribusi Kategori Penjualan</h3>
            <p className="text-xs text-[#78716c] mb-6">Porsi omset berdasarkan kategori menu</p>

            <div className="space-y-4">
              {categoryStats.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-[#fdfbf7] border border-[#ede5d8]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#fef9c3] text-[#713f12] font-extrabold flex items-center justify-center text-xs border border-[#fde68a]">
                      {item.percentage}%
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-[#292524]">{item.name}</h4>
                      <p className="text-[11px] text-[#78716c]">{formatRupiah(item.revenue)}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#713f12]">
                    Porsi #{idx + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3.5 mt-6 rounded-2xl bg-[#fdfbf7] border border-[#ede5d8] text-xs text-[#57534e]">
            Kategori <strong>Minuman Kopi</strong> merupakan kontributor terbesar dengan 42% pendapatan.
          </div>
        </div>
      </div>
    </div>
  );
};
