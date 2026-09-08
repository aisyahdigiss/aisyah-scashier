import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';

export const ClosingShiftModal: React.FC = () => {
  const {
    currentShift,
    activeCashier,
    isShiftModalOpen,
    setIsShiftModalOpen,
    closeCurrentShift,
    openNewShift,
    showToast,
    settings,
  } = usePOS();

  const [actualCashInput, setActualCashInput] = useState<string>(
    currentShift ? currentShift.expectedCash.toString() : '200000'
  );
  const [closingNotes, setClosingNotes] = useState<string>('');
  const [isShiftCompleted, setIsShiftCompleted] = useState<boolean>(false);
  const [closedSummary, setClosedSummary] = useState<any>(null);

  if (!isShiftModalOpen) return null;

  const formatRupiah = (val: number) => `Rp ${val.toLocaleString('id-ID')}`;

  const actualCash = parseFloat(actualCashInput.replace(/\D/g, '')) || 0;
  const difference = currentShift ? actualCash - currentShift.expectedCash : 0;

  const handleCloseShift = () => {
    const summary = closeCurrentShift(actualCash, closingNotes);
    setClosedSummary(summary);
    setIsShiftCompleted(true);
    showToast('Tutup kasir shift berhasil dicatat!', 'success');
  };

  const handleStartNewShift = () => {
    openNewShift(actualCash);
    setIsShiftCompleted(false);
    setIsShiftModalOpen(false);
    showToast('Shift kasir baru telah dibuka!', 'success');
  };

  const handlePrintZReport = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity"
        onClick={() => setIsShiftModalOpen(false)}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-xl bg-[#fffdfa] rounded-3xl p-6 shadow-[0px_16px_50px_rgba(120,113,108,0.2)] border border-[#ede5d8] z-10 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#ede5d8]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#fef9c3] text-[#713f12] flex items-center justify-center border border-[#fde68a] shadow-2xs">
              <span className="material-symbols-outlined text-[22px]">point_of_sale</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#292524]">
                {isShiftCompleted ? 'Laporan Tutup Shift (Z-Report)' : 'Rekap Tutup Kasir & Shift'}
              </h3>
              <p className="text-xs text-[#78716c]">
                Kasir: <strong>{activeCashier.name}</strong> • Mulai shift: {currentShift?.startTime}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsShiftModalOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#78716c] hover:bg-[#f7f3eb] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {/* Outlet Info Badge */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#fdfbf7] rounded-2xl border border-[#ede5d8]">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#854d0e]">store</span>
              <span className="text-xs font-bold text-[#292524]">{settings.storeName}</span>
              <span className="text-xs text-[#78716c]">({settings.branchName})</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#fef9c3] text-[#713f12] border border-[#fde68a]">
              Shift Aktif
            </span>
          </div>

          {/* Financial Breakdown Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div className="p-3 bg-[#fdfbf7] rounded-2xl border border-[#ede5d8]">
              <span className="text-[11px] text-[#78716c] font-medium block">Modal Awal Laci</span>
              <span className="text-sm font-bold text-[#292524] mt-0.5 block">
                {formatRupiah(currentShift?.startingCash || 0)}
              </span>
            </div>

            <div className="p-3 bg-[#fdfbf7] rounded-2xl border border-[#ede5d8]">
              <span className="text-[11px] text-[#78716c] font-medium block">Penjualan Tunai</span>
              <span className="text-sm font-bold text-amber-800 mt-0.5 block">
                {formatRupiah(currentShift?.totalCashSales || 0)}
              </span>
            </div>

            <div className="p-3 bg-[#fdfbf7] rounded-2xl border border-[#ede5d8]">
              <span className="text-[11px] text-[#78716c] font-medium block">Non-Tunai (QRIS/Card)</span>
              <span className="text-sm font-bold text-[#292524] mt-0.5 block">
                {formatRupiah(currentShift?.totalNonCashSales || 0)}
              </span>
            </div>

            <div className="p-3 bg-[#fdfbf7] rounded-2xl border border-[#ede5d8]">
              <span className="text-[11px] text-[#78716c] font-medium block">Total Transaksi</span>
              <span className="text-sm font-bold text-[#292524] mt-0.5 block">
                {currentShift?.totalTransactions || 0} Faktur
              </span>
            </div>

            <div className="col-span-2 p-3 bg-[#fef9c3]/70 rounded-2xl border border-[#fde68a]">
              <span className="text-[11px] text-[#713f12] font-semibold block">
                Estimasi Fisik Uang di Laci (Modal + Tunai)
              </span>
              <span className="text-base font-extrabold text-[#713f12] mt-0.5 block">
                {formatRupiah(currentShift?.expectedCash || 0)}
              </span>
            </div>
          </div>

          {!isShiftCompleted ? (
            <>
              {/* Actual Cash Input Form */}
              <div className="space-y-2 bg-[#fdfbf7] p-4 rounded-2xl border border-[#ede5d8]">
                <label className="text-xs font-bold text-[#57534e] block">
                  Hitung Uang Fisik Aktual di Laci Kasir:
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-xs text-[#78716c]">
                    Rp
                  </span>
                  <input
                    type="text"
                    value={actualCashInput}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setActualCashInput(val);
                    }}
                    placeholder="0"
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#ede5d8] rounded-xl text-sm font-bold text-[#292524] outline-none focus:border-[#eab308]"
                  />
                </div>

                {/* Quick Difference Indicator */}
                <div className="flex items-center justify-between text-xs pt-1 px-1">
                  <span className="text-[#78716c]">Selisih Kas (Aktual - Estimasi):</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                      difference === 0
                        ? 'bg-green-100 text-green-800'
                        : difference > 0
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {difference === 0
                      ? 'Cocok (Pas Rp 0)'
                      : difference > 0
                      ? `Lebih ${formatRupiah(difference)}`
                      : `Kurang ${formatRupiah(Math.abs(difference))}`}
                  </span>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-bold text-[#57534e] block mb-1">
                  Catatan Serah Terima / Penutupan Shift (Opsional)
                </label>
                <textarea
                  value={closingNotes}
                  onChange={(e) => setClosingNotes(e.target.value)}
                  placeholder="Contoh: Seluruh transaksi selesai, laci uang aman, diserahkan ke kasir shift malam..."
                  rows={2}
                  className="w-full p-2.5 rounded-xl bg-[#fdfbf7] border border-[#ede5d8] focus:border-[#eab308] text-xs font-medium outline-none resize-none"
                />
              </div>
            </>
          ) : (
            /* Completed Shift View (Receipt Style) */
            <div className="p-4 bg-white rounded-2xl border border-dashed border-[#dfd5c3] space-y-3 print:border-none">
              <div className="text-center pb-3 border-b border-[#ede5d8]">
                <h4 className="font-extrabold text-sm text-[#292524]">{settings.storeName}</h4>
                <p className="text-[11px] text-[#78716c]">LAPORAN PENUTUPAN KASIR (Z-REPORT)</p>
                <p className="text-[10px] text-[#a8a29e] mt-0.5">
                  Waktu: {new Date().toLocaleString('id-ID')}
                </p>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#78716c]">Kasir Bertugas:</span>
                  <span className="font-bold">{activeCashier.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#78716c]">Waktu Buka Shift:</span>
                  <span>{currentShift?.startTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#78716c]">Modal Awal:</span>
                  <span>{formatRupiah(closedSummary?.startingCash || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#78716c]">Penjualan Tunai:</span>
                  <span className="font-bold">{formatRupiah(closedSummary?.totalCashSales || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#78716c]">Penjualan Non-Tunai:</span>
                  <span>{formatRupiah(closedSummary?.totalNonCashSales || 0)}</span>
                </div>
                <div className="flex justify-between border-t border-[#ede5d8] pt-1.5">
                  <span className="font-bold">Total Fisik Diserahkan:</span>
                  <span className="font-extrabold text-[#713f12]">
                    {formatRupiah(closedSummary?.actualCashEnding || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#78716c]">Selisih:</span>
                  <span className="font-bold">
                    {closedSummary?.difference === 0
                      ? 'Rp 0 (Cocok)'
                      : formatRupiah(closedSummary?.difference || 0)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#ede5d8]">
          {!isShiftCompleted ? (
            <>
              <button
                type="button"
                onClick={() => setIsShiftModalOpen(false)}
                className="px-4 py-2 rounded-full text-xs font-bold text-[#78716c] hover:bg-[#f7f3eb] transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleCloseShift}
                className="px-5 py-2.5 rounded-full bg-[#fef9c3] hover:bg-[#fef08a] text-[#713f12] text-xs font-bold border border-[#fde68a] shadow-2xs transition-all active:scale-95 flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">lock</span>
                <span>Konfirmasi Tutup Kasir</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handlePrintZReport}
                className="px-4 py-2 rounded-full bg-white hover:bg-[#f7f3eb] text-[#57534e] text-xs font-bold border border-[#ede5d8] shadow-2xs flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">print</span>
                <span>Cetak Laporan</span>
              </button>
              <button
                type="button"
                onClick={handleStartNewShift}
                className="px-5 py-2 rounded-full bg-[#fef9c3] hover:bg-[#fef08a] text-[#713f12] text-xs font-bold border border-[#fde68a] shadow-2xs flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                <span>Buka Shift Baru</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
