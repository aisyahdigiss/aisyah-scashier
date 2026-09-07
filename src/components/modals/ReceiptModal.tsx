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
    <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-[#fffdfa] rounded-3xl p-5 md:p-6 max-w-sm w-full border border-[#ede5d8] shadow-[0px_10px_35px_rgba(168,153,128,0.25)] space-y-4 my-6 animate-in zoom-in-95 duration-200">
        {/* Header Modal Bar */}
        <div className="flex items-center justify-between pb-2 border-b border-[#ede5d8]">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-[#fef9c3] text-[#713f12] flex items-center justify-center text-xs font-bold border border-[#fde68a] shadow-2xs">
              <span className="material-symbols-outlined text-[16px]">receipt_long</span>
            </span>
            <div>
              <h3 className="font-bold text-sm text-[#292524]">Struk Pembelian</h3>
              <p className="text-[11px] text-[#78716c] font-semibold">Struk Resmi Kasir</p>
            </div>
          </div>

          <button
            onClick={() => setActiveReceiptTransaction(null)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#78716c] hover:bg-[#f7f3eb] hover:text-[#292524] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Printable Receipt Container */}
        <div
          id="printable-receipt"
          className="relative bg-[#fffdfa] p-5 rounded-3xl border-2 border-dashed border-[#ede5d8] text-xs text-[#292524] space-y-3 shadow-xs"
        >
          {/* Subtle Top Pastel Dot Accents */}
          <div className="flex justify-center items-center gap-2 pb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#fefce8] border border-[#fde68a]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#fef9c3] border border-[#fde68a]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#fef08a] border border-[#fde68a]" />
          </div>

          {/* Store Information */}
          <div className="text-center space-y-1">
            <h2 className="font-extrabold text-base tracking-wide uppercase text-[#292524]">
              {settings.storeName}
            </h2>
            <p className="text-xs font-bold text-[#713f12]">{settings.branchName}</p>
            <p className="text-[10px] text-[#78716c] leading-relaxed max-w-[240px] mx-auto">
              {settings.address}
            </p>
            <p className="text-[10px] text-[#78716c]">Telp: {settings.phone}</p>
          </div>

          {/* Soft Dashed Divider */}
          <div className="border-t border-dashed border-[#ede5d8] my-2" />

          {/* Order Type & Customer Details */}
          <div className="bg-[#fef9c3]/50 p-2.5 rounded-2xl border border-[#fde68a] text-[11px] space-y-1 text-[#57534e]">
            <div className="flex justify-between items-center">
              <span className="text-[#78716c]">No. Faktur</span>
              <span className="font-mono font-bold text-[#713f12] bg-white px-2 py-0.5 rounded-md border border-[#ede5d8]">
                {trx.invoiceNumber}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[#78716c]">Pesanan</span>
              <span className="font-bold text-[#292524]">
                {trx.orderType || 'Dine In'}{' '}
                {trx.tableNumber ? `(${trx.tableNumber})` : ''}
              </span>
            </div>

            {trx.customerName && (
              <div className="flex justify-between items-center">
                <span className="text-[#78716c]">Pelanggan</span>
                <span className="font-bold text-[#292524]">{trx.customerName}</span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-[#78716c]">Waktu</span>
              <span className="font-medium text-[#292524]">
                {trx.dateStr} • {trx.timeStr}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[#78716c]">Kasir</span>
              <span className="font-bold text-[#713f12]">{trx.cashierName}</span>
            </div>
          </div>

          {/* Item List Header */}
          <div className="pt-1 pb-0.5 flex justify-between text-[10px] font-bold text-[#78716c] uppercase tracking-wider">
            <span>Menu Pesanan</span>
            <span>Subtotal</span>
          </div>

          {/* Items List */}
          <div className="divide-y divide-dashed divide-[#ede5d8] my-1">
            {trx.items.map((item, idx) => (
              <div key={idx} className="py-2 flex justify-between items-start gap-2 text-xs">
                <div className="space-y-0.5 flex-1 min-w-0">
                  <div className="font-bold text-[#292524]">{item.name}</div>
                  <div className="text-[11px] text-[#78716c]">
                    {item.quantity} x {formatRupiah(item.price)}
                  </div>
                  {item.notes && (
                    <div className="text-[10px] text-[#713f12] font-semibold italic">
                      ↳ Catatan: {item.notes}
                    </div>
                  )}
                </div>
                <span className="font-bold text-[#292524] shrink-0">
                  {formatRupiah(item.subtotal)}
                </span>
              </div>
            ))}
          </div>

          {/* Calculation & Total Box */}
          <div className="bg-[#fef9c3]/40 p-3 rounded-2xl border border-[#fde68a] space-y-1.5 text-xs">
            <div className="flex justify-between text-[#78716c]">
              <span>Subtotal</span>
              <span className="font-semibold text-[#292524]">{formatRupiah(trx.subtotal)}</span>
            </div>

            {trx.discount > 0 && (
              <div className="flex justify-between text-[#713f12] font-bold">
                <span>Diskon</span>
                <span>-{formatRupiah(trx.discount)}</span>
              </div>
            )}

            <div className="flex justify-between items-baseline font-bold text-sm text-[#292524] pt-1.5 border-t border-dashed border-[#fde68a]">
              <span>Total Bayar</span>
              <span className="text-base font-extrabold text-[#713f12]">
                {formatRupiah(trx.total)}
              </span>
            </div>
          </div>

          {/* Payment Method Details */}
          <div className="text-[11px] space-y-1 px-1">
            <div className="flex justify-between items-center text-[#78716c]">
              <span>Metode Bayar</span>
              <span className="font-bold text-[#713f12] bg-[#fef9c3] px-2.5 py-0.5 rounded-full border border-[#fde68a]">
                {trx.paymentMethod}
              </span>
            </div>
            {trx.paymentMethod === 'TUNAI' && (
              <>
                <div className="flex justify-between text-[#78716c]">
                  <span>Uang Diterima</span>
                  <span className="font-medium text-[#292524]">
                    {formatRupiah(trx.amountReceived)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-[#292524]">
                  <span>Kembalian</span>
                  <span className="text-emerald-700">{formatRupiah(trx.change)}</span>
                </div>
              </>
            )}
          </div>

          {/* Message Box */}
          <div className="mt-3 p-3 rounded-2xl bg-[#fdfbf7] border border-[#ede5d8] text-center space-y-1">
            <p className="text-xs font-bold text-[#713f12] leading-snug">
              Terima kasih atas kunjungan Anda!
            </p>
            <p className="text-[11px] text-[#78716c]">
              Semoga hari Anda menyenangkan~
            </p>
          </div>

          {/* Footer Note */}
          <div className="pt-1 text-center space-y-1">
            <div className="flex justify-center font-mono tracking-widest text-[10px] text-[#78716c] opacity-60">
              ||| | |||| ||| ||||| || |||
            </div>
            <p className="text-[10px] text-[#78716c]">
              Simpan struk ini sebagai bukti transaksi resmi
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            onClick={() => setActiveReceiptTransaction(null)}
            className="py-2.5 rounded-xl bg-[#f7f3eb] hover:bg-[#eee7d8] text-[#57534e] font-bold text-xs transition-colors border border-[#ede5d8]"
          >
            Tutup
          </button>
          <button
            onClick={handlePrint}
            className="py-2.5 rounded-xl bg-[#fef9c3] hover:bg-[#fef08a] text-[#713f12] font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all active:scale-95 border border-[#fde68a]"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            <span>Cetak Struk</span>
          </button>
        </div>
      </div>
    </div>
  );
};
