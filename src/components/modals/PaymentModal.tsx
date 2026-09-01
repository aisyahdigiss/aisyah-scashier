import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { PaymentMethod } from '../../types';

export const PaymentModal: React.FC = () => {
  const {
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    cartTotal,
    cartSubtotal,
    cartDiscount,
    processPayment,
    settings,
    showToast,
  } = usePOS();

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('QRIS');
  const [cashAmountStr, setCashAmountStr] = useState<string>(cartTotal.toString());
  const [cardRef, setCardRef] = useState<string>('REF-' + Math.floor(100000 + Math.random() * 900000));
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isPaymentModalOpen) return null;

  const cashAmount = parseFloat(cashAmountStr.replace(/\D/g, '')) || 0;
  const change = Math.max(0, cashAmount - cartTotal);

  const formatRupiah = (val: number) => `Rp ${val.toLocaleString('id-ID')}`;

  const handleConfirm = async () => {
    if (selectedMethod === 'TUNAI' && cashAmount < cartTotal) {
      showToast('Uang yang diterima kurang dari total tagihan', 'error');
      return;
    }

    setIsProcessing(true);
    // Simulate brief payment terminal latency
    setTimeout(async () => {
      await processPayment(selectedMethod, selectedMethod === 'TUNAI' ? cashAmount : cartTotal);
      setIsProcessing(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-[#ede7df] shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#ede7df]">
          <div>
            <h2 className="text-xl font-bold text-[#1d1b16]">Pilih Metode Pembayaran</h2>
            <p className="text-xs text-[#72787f]">Total Tagihan: <strong className="text-[#30628a] text-sm">{formatRupiah(cartTotal)}</strong></p>
          </div>
          <button
            onClick={() => setIsPaymentModalOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#72787f] hover:bg-[#f3ede4]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Method Selector Tabs */}
        <div className="grid grid-cols-3 gap-2.5">
          {settings.paymentMethods.qris && (
            <button
              onClick={() => setSelectedMethod('QRIS')}
              className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                selectedMethod === 'QRIS'
                  ? 'bg-[#bee1ff] border-[#30628a] text-[#001e2f] font-bold shadow-xs'
                  : 'bg-[#f9f3ea] border-[#ede7df] text-[#41474e] hover:bg-[#ede7df]'
              }`}
            >
              <span className="material-symbols-outlined text-[24px] text-[#30628a]">qr_code_2</span>
              <span className="text-xs">QRIS</span>
            </button>
          )}

          {settings.paymentMethods.tunai && (
            <button
              onClick={() => setSelectedMethod('TUNAI')}
              className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                selectedMethod === 'TUNAI'
                  ? 'bg-[#bee1ff] border-[#30628a] text-[#001e2f] font-bold shadow-xs'
                  : 'bg-[#f9f3ea] border-[#ede7df] text-[#41474e] hover:bg-[#ede7df]'
              }`}
            >
              <span className="material-symbols-outlined text-[24px] text-[#5e604d]">payments</span>
              <span className="text-xs">Tunai (Cash)</span>
            </button>
          )}

          {settings.paymentMethods.kartu && (
            <button
              onClick={() => setSelectedMethod('KARTU')}
              className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                selectedMethod === 'KARTU'
                  ? 'bg-[#bee1ff] border-[#30628a] text-[#001e2f] font-bold shadow-xs'
                  : 'bg-[#f9f3ea] border-[#ede7df] text-[#41474e] hover:bg-[#ede7df]'
              }`}
            >
              <span className="material-symbols-outlined text-[24px] text-[#40627b]">credit_card</span>
              <span className="text-xs">Kartu Debit/Kredit</span>
            </button>
          )}
        </div>

        {/* Method Specific UI */}
        {selectedMethod === 'QRIS' && (
          <div className="bg-[#f9f3ea] p-5 rounded-2xl border border-[#ede7df] flex flex-col items-center text-center space-y-3">
            <div className="bg-white p-3 rounded-2xl border border-[#ede7df] shadow-xs">
              {/* Dynamic QR Code Representation */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=KASIRKU_QRIS_AMOUNT_${cartTotal}_TIME_${Date.now()}`}
                alt="QRIS Code"
                className="w-40 h-40 object-contain rounded-lg"
              />
            </div>
            <div>
              <p className="font-bold text-sm text-[#1d1b16]">{settings.storeName}</p>
              <p className="text-xs text-[#72787f]">NMID: ID1029384756192 • Standar QRIS Nasional</p>
              <p className="text-xs font-semibold text-emerald-700 mt-1">Scan melalui GoPay, OVO, ShopeePay, BCA Mobile, dll.</p>
            </div>
          </div>
        )}

        {selectedMethod === 'TUNAI' && (
          <div className="space-y-3 bg-[#f9f3ea] p-4 rounded-2xl border border-[#ede7df]">
            <div>
              <label className="text-xs font-bold text-[#41474e] block mb-1">Nominal Uang Diterima</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-sm text-[#72787f]">Rp</span>
                <input
                  type="text"
                  value={cashAmountStr}
                  onChange={(e) => setCashAmountStr(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#ede7df] rounded-xl text-lg font-bold text-[#1d1b16] outline-none focus:border-[#30628a]"
                />
              </div>
            </div>

            {/* Cash presets */}
            <div className="grid grid-cols-4 gap-2">
              {[cartTotal, 50000, 100000, 200000].map((amt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCashAmountStr(amt.toString())}
                  className="py-1.5 px-2 bg-white hover:bg-[#ede7df] border border-[#ede7df] rounded-xl text-xs font-bold text-[#30628a] transition-colors"
                >
                  {idx === 0 ? 'Uang Pas' : formatRupiah(amt)}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#ede7df]">
              <span className="text-xs font-semibold text-[#72787f]">Kembalian:</span>
              <span className={`text-base font-bold ${cashAmount >= cartTotal ? 'text-[#5e604d]' : 'text-[#ba1a1a]'}`}>
                {cashAmount >= cartTotal ? formatRupiah(change) : 'Uang Kurang'}
              </span>
            </div>
          </div>
        )}

        {selectedMethod === 'KARTU' && (
          <div className="space-y-3 bg-[#f9f3ea] p-4 rounded-2xl border border-[#ede7df]">
            <div>
              <label className="text-xs font-bold text-[#41474e] block mb-1">Nomor Approval / No. Referensi EDC</label>
              <input
                type="text"
                value={cardRef}
                onChange={(e) => setCardRef(e.target.value)}
                placeholder="Contoh: REF-839201"
                className="w-full px-3.5 py-2.5 bg-white border border-[#ede7df] rounded-xl text-sm font-mono font-bold text-[#1d1b16] outline-none"
              />
            </div>
            <p className="text-xs text-[#72787f]">Pastikan kartu nasabah telah di-swipe / di-dip pada mesin EDC dan transaksi berhasil di-otorisasi.</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#ede7df]">
          <button
            type="button"
            onClick={() => setIsPaymentModalOpen(false)}
            className="px-5 py-2.5 rounded-full bg-[#f3ede4] hover:bg-[#ede7df] text-[#41474e] font-bold text-xs"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={isProcessing || (selectedMethod === 'TUNAI' && cashAmount < cartTotal)}
            onClick={handleConfirm}
            className={`px-7 py-2.5 rounded-full text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all ${
              isProcessing
                ? 'bg-gray-400 cursor-wait'
                : 'bg-[#30628a] hover:bg-[#275b82] active:scale-95'
            }`}
          >
            {isProcessing ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                <span>Konfirmasi Pembayaran ({formatRupiah(cartTotal)})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
