import React from 'react';
import { usePOS } from '../../context/POSContext';
import { HeldOrder } from '../../types';

export const HeldOrdersModal: React.FC = () => {
  const {
    heldOrders,
    isHeldOrdersModalOpen,
    setIsHeldOrdersModalOpen,
    restoreHeldOrder,
    deleteHeldOrder,
    cart,
  } = usePOS();

  if (!isHeldOrdersModalOpen) return null;

  const formatRupiah = (val: number) => `Rp ${val.toLocaleString('id-ID')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity"
        onClick={() => setIsHeldOrdersModalOpen(false)}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-xl bg-[#fffdfa] rounded-3xl p-6 shadow-[0px_16px_50px_rgba(120,113,108,0.2)] border border-[#ede5d8] z-10 flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#ede5d8]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#fef9c3] text-[#713f12] flex items-center justify-center border border-[#fde68a] shadow-2xs">
              <span className="material-symbols-outlined text-[22px]">pause_circle</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-[#292524]">Pesanan Parkir (Hold Bills)</h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#fef9c3] text-[#713f12] border border-[#fde68a]">
                  {heldOrders.length} Tagihan
                </span>
              </div>
              <p className="text-xs text-[#78716c]">
                Buka kembali pesanan yang sebelumnya ditunda untuk melanjutkan transaksi
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsHeldOrdersModalOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#78716c] hover:bg-[#f7f3eb] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Warning if current cart is not empty */}
        {cart.length > 0 && (
          <div className="my-3 p-3 rounded-2xl bg-[#fef9c3]/60 border border-[#fde68a] flex items-center gap-2.5 text-xs text-[#713f12]">
            <span className="material-symbols-outlined text-[18px]">info</span>
            <span>
              <strong>Perhatian:</strong> Keranjang kasir saat ini memiliki {cart.length} item. Memulihkan pesanan parkir akan menggantikan isi keranjang aktif saat ini.
            </span>
          </div>
        )}

        {/* List of Held Orders */}
        <div className="flex-1 overflow-y-auto py-2 space-y-3 pr-1">
          {heldOrders.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center justify-center text-[#a8a29e]">
              <span className="material-symbols-outlined text-[48px] text-[#dfd5c3] mb-2">
                receipt_long
              </span>
              <p className="font-bold text-sm text-[#57534e]">Tidak Ada Pesanan yang Ditunda</p>
              <p className="text-xs text-[#78716c] max-w-xs mt-1">
                Gunakan tombol <strong>Hold Pesanan</strong> di kasir ketika pelanggan ingin menambah pesanan atau menunda pembayaran sementara.
              </p>
            </div>
          ) : (
            heldOrders.map((order: HeldOrder) => (
              <div
                key={order.id}
                className="p-4 rounded-2xl bg-[#fdfbf7] border border-[#ede5d8] hover:border-[#eab308] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs group"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-[#292524]">
                      {order.customerName || 'Pelanggan Walk-In'}
                    </span>
                    {order.tableNumber && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#fef9c3] text-[#713f12] border border-[#fde68a]">
                        Meja {order.tableNumber}
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-100 text-stone-600 border border-stone-200">
                      {order.orderType}
                    </span>
                    <span className="text-[11px] text-[#a8a29e] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">schedule</span>
                      {order.createdAt}
                    </span>
                  </div>

                  <p className="text-xs text-[#78716c] truncate max-w-md">
                    {order.items.map((i) => `${i.product.name} (x${i.quantity})`).join(', ')}
                  </p>

                  {order.note && (
                    <p className="text-[11px] text-amber-800 italic">Catatan: {order.note}</p>
                  )}
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                  <div className="text-right">
                    <span className="text-xs text-[#78716c] block">Total Belanja</span>
                    <span className="text-sm font-extrabold text-[#713f12]">
                      {formatRupiah(order.total)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => restoreHeldOrder(order.id)}
                      className="px-3 py-2 rounded-xl bg-[#fef9c3] hover:bg-[#fef08a] text-[#713f12] text-xs font-bold border border-[#fde68a] shadow-2xs flex items-center gap-1 transition-all active:scale-95"
                      title="Lanjutkan Transaksi"
                    >
                      <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                      <span>Lanjutkan</span>
                    </button>

                    <button
                      onClick={() => deleteHeldOrder(order.id)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Batalkan & Hapus"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#ede5d8] flex justify-end">
          <button
            onClick={() => setIsHeldOrdersModalOpen(false)}
            className="px-5 py-2 rounded-full text-xs font-bold text-[#78716c] hover:text-[#292524] hover:bg-[#f7f3eb] transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
