import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { PaymentMethod } from '../../types';

export const PaymentModal: React.FC = () => {
  const {
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    cartTotal,
    processPayment,
    settings,
    showToast,
    orderType,
    tableNumber,
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
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-[#fffdfa] rounded-3xl p-6 max-w-lg w-full border border-[#ede5d8] shadow-[0px_10px_35px_rgba(168,153,128,0.25)] space-y-4 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#ede5d8]">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#292524]">Pilih Metode Pembayaran</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#fef9c3] text-[#713f12] border border-[#fde68a]">
                {orderType} {tableNumber ? `• ${tableNumber}` : ''}
              </span>
            </div>
            <p className="text-xs text-[#78716c] mt-0.5">
              Total Tagihan:{' '}
              <strong className="text-[#713f12] text-base font-extrabold">
                {formatRupiah(cartTotal)}
              </strong>
            </p>
          </div>
          <button
            onClick={() => setIsPaymentModalOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#78716c] hover:bg-[#f7f3eb] hover:text-[#292524] transition-colors"
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
                  ? 'bg-[#fef9c3] border-[#fde68a] text-[#713f12] font-bold shadow-2xs'
                  : 'bg-[#fdfbf7] border-[#ede5d8] text-[#57534e] hover:bg-[#fef9c3]/50'
              }`}
            >
              <span className="material-symbols-outlined text-[24px] text-[#713f12]">qr_code_2</span>
              <span className="text-xs">QRIS Instan</span>
            </button>
          )}

          {settings.paymentMethods.tunai && (
            <button
              onClick={() => setSelectedMethod('TUNAI')}
              className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                selectedMethod === 'TUNAI'
                  ? 'bg-[#fef9c3] border-[#fde68a] text-[#713f12] font-bold shadow-2xs'
                  : 'bg-[#fdfbf7] border-[#ede5d8] text-[#57534e] hover:bg-[#fef9c3]/50'
              }`}
            >
              <span className="material-symbols-outlined text-[24px] text-[#713f12]">payments</span>
              <span className="text-xs">Tunai (Cash)</span>
            </button>
          )}

          {settings.paymentMethods.kartu && (
            <button
              onClick={() => setSelectedMethod('KARTU')}
              className={`p-3 rounded-2xl border flex flex-col items-center gap-1.5 transition-all ${
                selectedMethod === 'KARTU'
                  ? 'bg-[#fef9c3] border-[#fde68a] text-[#713f12] font-bold shadow-2xs'
                  : 'bg-[#fdfbf7] border-[#ede5d8] text-[#57534e] hover:bg-[#fef9c3]/50'
              }`}
            >
              <span className="material-symbols-outlined text-[24px] text-[#713f12]">credit_card</span>
              <span className="text-xs">Kartu Debit/EDC</span>
            </button>
          )}
        </div>

        {/* Payment Detail Section */}
        <div className="bg-[#fdfbf7] p-4 rounded-2xl border border-[#ede5d8]">
          {selectedMethod === 'QRIS' && (
            <div className="flex flex-col items-center justify-center py-3 text-center space-y-3">
              <div className="p-3 bg-white rounded-2xl shadow-xs border-2 border-dashed border-[#ede5d8]">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=KASIRKU-ORDER-DEMO-PAYMENT"
                  alt="QRIS Payment Code"
                  className="w-40 h-40 object-contain rounded-lg"
                />
              </div>
              <p className="text-xs text-[#78716c] max-w-xs">
                Scan QRIS dengan GoPay, OVO, Dana, ShopeePay, BCA, atau Mobile Banking apa saja
              </p>
            </div>
          )}

          {selectedMethod === 'TUNAI' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#78716c]">Total Tagihan:</span>
                <span className="font-bold text-[#292524]">{formatRupiah(cartTotal)}</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#57534e] block mb-1">
                  Nominal Uang Diterima
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-sm text-[#78716c]">
                    Rp
                  </span>
                  <input
                    type="text"
                    value={cashAmountStr}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setCashAmountStr(val);
                    }}
                    placeholder="0"
                    className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-[#ede5d8] focus:border-[#eab308] text-base font-bold text-[#292524] outline-none"
                  />
                </div>
              </div>

              {/* Quick Cash Presets */}
              <div className="flex items-center gap-1.5 pt-1">
                {[cartTotal, 50000, 100000, 150000, 200000].map((amt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCashAmountStr(amt.toString())}
                    className="flex-1 py-1.5 rounded-lg text-xs font-bold bg-[#fffdfa] text-[#713f12] border border-[#ede5d8] hover:bg-[#fef08a] transition-colors"
                  >
                    {amt === cartTotal ? 'Pas' : `${amt / 1000}k`}
                  </button>
                ))}
              </div>

              {/* Change calculation */}
              <div className="flex justify-between items-center pt-2 border-t border-[#ede5d8] text-xs">
                <span className="text-[#78716c]">Kembalian:</span>
                <span
                  className={`font-extrabold text-sm ${
                    cashAmount >= cartTotal ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                >
                  {cashAmount >= cartTotal ? formatRupiah(change) : 'Uang Kurang'}
                </span>
              </div>
            </div>
          )}

          {selectedMethod === 'KARTU' && (
            <div className="space-y-3 py-1">
              <div>
                <label className="text-xs font-semibold text-[#57534e] block mb-1">
                  Nomor Referensi EDC / Approval Code
                </label>
                <input
                  type="text"
                  value={cardRef}
                  onChange={(e) => setCardRef(e.target.value)}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-[#ede5d8] focus:border-[#eab308] text-xs font-bold text-[#292524] outline-none font-mono"
                />
              </div>
              <p className="text-xs text-[#78716c]">
                Masukkan kartu ke mesin EDC dan masukkan approval code di atas untuk konfirmasi.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => setIsPaymentModalOpen(false)}
            className="py-3 rounded-2xl bg-[#f7f3eb] hover:bg-[#eee7d8] text-[#57534e] font-bold text-sm transition-colors border border-[#ede5d8]"
          >
            Batal
          </button>
          <button
            onClick={handleConfirm}
            disabled={isProcessing || (selectedMethod === 'TUNAI' && cashAmount < cartTotal)}
            className={`py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
              isProcessing || (selectedMethod === 'TUNAI' && cashAmount < cartTotal)
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300'
                : 'bg-[#fef9c3] hover:bg-[#fef08a] text-[#713f12] font-bold shadow-2xs border border-[#fde68a]'
            }`}
          >
            {isProcessing ? (
              <span className="inline-block w-5 h-5 border-2 border-[#713f12] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">verified</span>
                <span>Konfirmasi Pembayaran</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
