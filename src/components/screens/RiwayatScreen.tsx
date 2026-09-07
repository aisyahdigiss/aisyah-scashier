import React, { useState, useMemo } from 'react';
import { usePOS } from '../../context/POSContext';
import { Transaction } from '../../types';

export const RiwayatScreen: React.FC = () => {
  const { transactions, setActiveReceiptTransaction, searchQuery } = usePOS();
  const [methodFilter, setMethodFilter] = useState<string>('Semua');
  const [statusFilter, setStatusFilter] = useState<string>('Semua');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const formatRupiah = (val: number) => `Rp ${val.toLocaleString('id-ID')}`;

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchSearch =
        searchQuery === '' ||
        t.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.cashierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.items.some((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchMethod = methodFilter === 'Semua' || t.paymentMethod === methodFilter;
      const matchStatus = statusFilter === 'Semua' || t.status === statusFilter;

      return matchSearch && matchMethod && matchStatus;
    });
  }, [transactions, searchQuery, methodFilter, statusFilter]);

  const totalFilteredRevenue = filteredTransactions.reduce(
    (acc, t) => acc + (t.status === 'Selesai' ? t.total : 0),
    0
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#292524] tracking-tight">
            Riwayat Penjualan
          </h1>
          <p className="text-sm text-[#78716c] mt-1">
            Daftar lengkap seluruh transaksi penjualan dan cetak ulang struk kasir.
          </p>
        </div>

        <div className="px-4 py-2 bg-[#fffdfa]/95 backdrop-blur-xs rounded-2xl border border-[#ede5d8] shadow-xs flex items-center gap-3">
          <span className="text-xs font-semibold text-[#78716c]">Total Terfilter:</span>
          <span className="text-base font-extrabold text-[#713f12]">
            {formatRupiah(totalFilteredRevenue)}
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#fffdfa]/95 backdrop-blur-xs p-4 rounded-3xl border border-[#ede5d8] shadow-[0px_4px_20px_rgba(168,153,128,0.08)] flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Method Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-[#78716c]">Metode:</label>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="bg-[#fdfbf7] border border-[#ede5d8] text-xs font-semibold text-[#292524] rounded-xl px-3 py-2 outline-none focus:border-[#eab308]"
            >
              <option value="Semua">Semua Metode</option>
              <option value="TUNAI">Tunai (Cash)</option>
              <option value="QRIS">QRIS</option>
              <option value="KARTU">Kartu Debit/Kredit</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-[#78716c]">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#fdfbf7] border border-[#ede5d8] text-xs font-semibold text-[#292524] rounded-xl px-3 py-2 outline-none focus:border-[#eab308]"
            >
              <option value="Semua">Semua Status</option>
              <option value="Selesai">Selesai</option>
              <option value="Pending">Pending</option>
              <option value="Batal">Batal</option>
            </select>
          </div>
        </div>

        <span className="text-xs text-[#78716c]">
          {filteredTransactions.length} transaksi ditemukan
        </span>
      </div>

      {/* Transactions Table Container */}
      <div className="bg-[#fffdfa]/95 backdrop-blur-xs rounded-3xl p-6 border border-[#ede5d8] shadow-[0px_4px_20px_rgba(168,153,128,0.1)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#ede5d8] text-xs font-bold uppercase tracking-wider text-[#78716c]">
                <th className="pb-3 px-3">No. Faktur</th>
                <th className="pb-3 px-3">Tanggal & Waktu</th>
                <th className="pb-3 px-3">Kasir</th>
                <th className="pb-3 px-3">Item Pesanan</th>
                <th className="pb-3 px-3">Metode</th>
                <th className="pb-3 px-3 text-right">Total Transaksi</th>
                <th className="pb-3 px-3 text-center">Status</th>
                <th className="pb-3 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f7f3eb]">
              {filteredTransactions.map((trx) => (
                <tr key={trx.id} className="hover:bg-[#fdfbf7] transition-colors">
                  <td className="py-4 px-3 font-mono font-bold text-[#713f12]">
                    {trx.invoiceNumber}
                  </td>
                  <td className="py-4 px-3 text-xs text-[#57534e]">
                    <div className="font-semibold text-[#292524]">{trx.dateStr}</div>
                    <div className="text-[11px] text-[#78716c]">{trx.timeStr} WIB</div>
                  </td>
                  <td className="py-4 px-3 font-medium text-xs text-[#292524]">{trx.cashierName}</td>
                  <td className="py-4 px-3 text-xs text-[#57534e] max-w-[200px] truncate">
                    {trx.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                  </td>
                  <td className="py-4 px-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#fef9c3] text-[#713f12] border border-[#fde68a]">
                      {trx.paymentMethod}
                    </span>
                  </td>
                  <td className="py-4 px-3 text-right font-bold text-[#292524]">
                    {formatRupiah(trx.total)}
                  </td>
                  <td className="py-4 px-3 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                        trx.status === 'Selesai'
                          ? 'bg-[#fef9c3] text-[#713f12] border border-[#fde68a]'
                          : 'bg-stone-200 text-stone-700 border border-stone-300'
                      }`}
                    >
                      {trx.status}
                    </span>
                  </td>
                  <td className="py-4 px-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setSelectedTransaction(trx)}
                        className="p-1.5 rounded-lg text-[#78716c] hover:bg-[#fef9c3] hover:text-[#713f12] transition-colors"
                        title="Detail Transaksi"
                      >
                        <span className="material-symbols-outlined text-[18px]">visibility</span>
                      </button>
                      <button
                        onClick={() => setActiveReceiptTransaction(trx)}
                        className="p-1.5 rounded-lg text-[#713f12] hover:bg-[#fef08a] transition-colors"
                        title="Cetak Struk"
                      >
                        <span className="material-symbols-outlined text-[18px]">print</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[#fffdfa] rounded-3xl p-6 max-w-lg w-full border border-[#ede5d8] shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#ede5d8]">
              <div>
                <h3 className="font-bold text-lg text-[#292524]">
                  Detail Faktur {selectedTransaction.invoiceNumber}
                </h3>
                <p className="text-xs text-[#78716c]">
                  {selectedTransaction.dateStr} • {selectedTransaction.timeStr} WIB oleh Kasir{' '}
                  {selectedTransaction.cashierName}
                </p>
              </div>
              <button
                onClick={() => setSelectedTransaction(null)}
                className="p-1 text-[#78716c] hover:bg-[#f7f3eb] rounded-full"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Items list */}
            <div className="divide-y divide-[#f7f3eb] max-h-60 overflow-y-auto pr-1">
              {selectedTransaction.items.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-[#292524]">{item.name}</p>
                    <p className="text-[#78716c]">
                      {item.quantity} x {formatRupiah(item.price)}
                    </p>
                  </div>
                  <span className="font-bold text-[#292524]">{formatRupiah(item.subtotal)}</span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="pt-3 border-t border-[#ede5d8] space-y-1.5 text-xs">
              <div className="flex justify-between text-[#78716c]">
                <span>Subtotal</span>
                <span>{formatRupiah(selectedTransaction.subtotal)}</span>
              </div>
              {selectedTransaction.discount > 0 && (
                <div className="flex justify-between text-[#713f12] font-semibold">
                  <span>Diskon</span>
                  <span>-{formatRupiah(selectedTransaction.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm text-[#292524] pt-1 border-t border-[#f7f3eb]">
                <span>Total Bayar</span>
                <span>{formatRupiah(selectedTransaction.total)}</span>
              </div>
              <div className="flex justify-between text-[#78716c]">
                <span>Metode Pembayaran</span>
                <span className="font-bold text-[#713f12]">
                  {selectedTransaction.paymentMethod}
                </span>
              </div>
              {selectedTransaction.paymentMethod === 'TUNAI' && (
                <>
                  <div className="flex justify-between text-[#78716c]">
                    <span>Uang Diterima</span>
                    <span>{formatRupiah(selectedTransaction.amountReceived)}</span>
                  </div>
                  <div className="flex justify-between text-[#78716c]">
                    <span>Kembalian</span>
                    <span>{formatRupiah(selectedTransaction.change)}</span>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#ede5d8]">
              <button
                onClick={() => setSelectedTransaction(null)}
                className="px-4 py-2 rounded-full bg-[#f7f3eb] text-[#57534e] text-xs font-bold border border-[#ede5d8]"
              >
                Tutup
              </button>
              <button
                onClick={() => {
                  const trx = selectedTransaction;
                  setSelectedTransaction(null);
                  setActiveReceiptTransaction(trx);
                }}
                className="px-5 py-2 rounded-full bg-[#fef9c3] hover:bg-[#fef08a] text-[#713f12] text-xs font-bold flex items-center gap-1.5 shadow-2xs border border-[#fde68a] transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                <span>Cetak Struk Nota</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
