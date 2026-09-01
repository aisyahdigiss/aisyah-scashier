import React from 'react';
import { usePOS } from '../../context/POSContext';

export const ReceiptModal: React.FC = () => {
  const { activeReceiptTransaction, setActiveReceiptTransaction, settings } = usePOS();

  if (!activeReceiptTransaction) return null;

  const trx = activeReceiptTransaction;
  const formatRupiah = (val: number) => `Rp ${val.toLocaleString('id-ID')}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-[#ede7df] shadow-2xl space-y-4 my-8 animate-in zoom-in-95 duration-200">
        {/* Actions Bar (Top) */}
        <div className="flex items-center justify-between pb-2 border-b border-[#ede7df]">
          <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs">
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span>Transaksi Sukses</span>
          </div>
          <button
            onClick={() => setActiveReceiptTransaction(null)}
            className="w-7 h-7 rounded-full flex items-center justify-center text-[#72787f] hover:bg-[#f3ede4]"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Printable Thermal Receipt Paper Container */}
        <div
          id="printable-receipt"
          className="bg-[#fafafa] p-5 rounded-2xl border border-dashed border-[#c1c7cf] font-mono text-xs text-[#1d1b16] space-y-3"
        >
          {/* Header */}
          <div className="text-center space-y-1">
            <h2 className="font-bold text-base tracking-wider uppercase text-black">
              {settings.storeName}
            </h2>
            <p className="text-[11px] text-[#41474e]">{settings.branchName}</p>
            <p className="text-[10px] text-[#72787f] leading-tight">{settings.address}</p>
            <p className="text-[10px] text-[#72787f]">Telp: {settings.phone}</p>
          </div>

          <div className="border-t border-dashed border-gray-400 my-2" />

          {/* Meta Info */}
          <div className="text-[11px] space-y-0.5">
            <div className="flex justify-between">
              <span>No. Faktur:</span>
              <span className="font-bold">{trx.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Waktu:</span>
              <span>
                {trx.dateStr} {trx.timeStr}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Kasir:</span>
              <span>{trx.cashierName}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-400 my-2" />

          {/* Item List */}
          <div className="space-y-2">
            {trx.items.map((item, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="font-bold">{item.name}</div>
                <div className="flex justify-between text-[#41474e] text-[11px]">
                  <span>
                    {item.quantity} x {item.price.toLocaleString('id-ID')}
                  </span>
                  <span className="font-bold text-black">
                    {item.subtotal.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-gray-400 my-2" />

          {/* Totals */}
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatRupiah(trx.subtotal)}</span>
            </div>
            {trx.discount > 0 && (
              <div className="flex justify-between text-emerald-800 font-bold">
                <span>Diskon</span>
                <span>-{formatRupiah(trx.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm text-black pt-1 border-t border-gray-300">
              <span>TOTAL</span>
              <span>{formatRupiah(trx.total)}</span>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-400 my-2" />

          {/* Payment Info */}
          <div className="space-y-0.5 text-[11px]">
            <div className="flex justify-between">
              <span>Metode:</span>
              <span className="font-bold">{trx.paymentMethod}</span>
            </div>
            {trx.paymentMethod === 'TUNAI' && (
              <>
                <div className="flex justify-between">
                  <span>Bayar:</span>
                  <span>{formatRupiah(trx.amountReceived)}</span>
                </div>
                <div className="flex justify-between font-bold text-black">
                  <span>Kembali:</span>
                  <span>{formatRupiah(trx.change)}</span>
                </div>
              </>
            )}
          </div>

          {/* Footer Barcode */}
          <div className="pt-3 text-center space-y-1.5">
            <div className="flex justify-center tracking-widest text-[16px] font-mono select-none opacity-80">
              ||||| | |||| ||| ||||| || |||
            </div>
            <p className="text-[10px] text-gray-500 uppercase">
              *** Terima Kasih Atas Kunjungan Anda ***
            </p>
            <p className="text-[9px] text-gray-400">Barang yang sudah dibeli tidak dapat ditukar</p>
          </div>
        </div>

        {/* Action Buttons (Bottom) */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            onClick={() => setActiveReceiptTransaction(null)}
            className="py-2.5 rounded-xl bg-[#f3ede4] hover:bg-[#ede7df] text-[#41474e] font-bold text-xs transition-colors"
          >
            Tutup
          </button>
          <button
            onClick={handlePrint}
            className="py-2.5 rounded-xl bg-[#30628a] hover:bg-[#275b82] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            <span>Cetak Struk</span>
          </button>
        </div>
      </div>
    </div>
  );
};
