import React from 'react';
import { usePOS } from '../../context/POSContext';

interface SmartAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SmartAssistantDrawer: React.FC<SmartAssistantDrawerProps> = ({ isOpen, onClose }) => {
  const {
    products,
    addToCart,
    setCartDiscount,
    cartTotal,
    soundTheme,
    setSoundTheme,
    activeCashier,
    setCurrentScreen,
    showToast,
    playBeep,
  } = usePOS();

  if (!isOpen) return null;

  const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock <= p.minStockThreshold);

  // Quick Bundle Combos
  const handleAddBundle = (productNames: string[], discountAmount: number, bundleTitle: string) => {
    let addedCount = 0;
    productNames.forEach((name) => {
      const prod = products.find((p) => p.name.toLowerCase().includes(name.toLowerCase()) && p.stock > 0);
      if (prod) {
        addToCart(prod, 'Bundle Promo ✨');
        addedCount++;
      }
    });

    if (addedCount > 0) {
      if (discountAmount > 0) {
        setCartDiscount(discountAmount);
      }
      showToast(`Paket "${bundleTitle}" berhasil dimasukkan ke pesanan!`, 'success');
      playBeep('success');
      onClose();
    } else {
      showToast('Produk untuk paket ini sedang kehabisan stok', 'warning');
    }
  };

  const handleApplyHappyHour = () => {
    if (cartTotal <= 0) {
      showToast('Tambahkan produk ke keranjang terlebih dahulu', 'warning');
      return;
    }
    const discount = Math.round(cartTotal * 0.1);
    setCartDiscount(discount);
    showToast(`Diskon Happy Hour 10% (Rp ${discount.toLocaleString('id-ID')}) diterapkan!`, 'success');
    playBeep('success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
      {/* Backdrop with soft blur */}
      <div
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <aside className="relative w-full max-w-md bg-[#ffffff] h-full shadow-[0px_10px_40px_rgba(100,116,139,0.2)] border-l border-[#cbd5e1] flex flex-col z-10 overflow-hidden">
        {/* Pastel Blue-Grey Top Bar */}
        <div className="p-5 pb-4 bg-[#f8fafc] border-b border-[#cbd5e1] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#e2e8f0] shadow-xs flex items-center justify-center border border-[#cbd5e1] text-[#334155]">
              <span className="material-symbols-outlined text-[24px]">auto_awesome</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-base text-[#1e293b]">Asisten Cerdas POS</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#cbd5e1] text-[#0f172a]">
                  AI Copilot
                </span>
              </div>
              <p className="text-xs text-[#64748b]">Rekomendasi, bundle & kontrol cerdas</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#475569] hover:text-[#0f172a] flex items-center justify-center transition-colors shadow-xs border border-[#cbd5e1]"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Active Shift & Cashier Badge */}
          <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-[#cbd5e1] shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={activeCashier.avatarUrl}
                alt={activeCashier.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-[#cbd5e1]"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://api.dicebear.com/7.x/adventurer/svg?seed=Aisyah&backgroundColor=e2e8f0';
                }}
              />
              <div>
                <p className="text-xs text-[#64748b]">Kasir Aktif</p>
                <p className="text-sm font-bold text-[#1e293b]">{activeCashier.name}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#e2e8f0] text-[#334155] border border-[#cbd5e1]">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-pulse" />
                Shift Pagi - Siang
              </span>
            </div>
          </div>

          {/* AI Smart Bundle Suggestions */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#334155] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                Rekomendasi Bundle Terlaris
              </h4>
              <span className="text-[11px] text-[#64748b]">Hemat 10-15%</span>
            </div>

            <div className="space-y-2.5">
              {/* Bundle 1 */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#cbd5e1] hover:border-[#94a3b8] transition-all group shadow-xs">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#e2e8f0] text-[#334155] mb-1 border border-[#cbd5e1]">
                      BEST SELLER ☕🥐
                    </span>
                    <h5 className="text-sm font-bold text-[#1e293b]">Sweet Morning Pairing</h5>
                    <p className="text-xs text-[#64748b] mt-0.5">
                      Cappuccino Latte + Almond Croissant panggang
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs line-through text-[#94a3b8]">Rp 60.000</span>
                      <span className="text-sm font-bold text-[#1e293b]">Rp 54.000</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#e2e8f0] text-[#334155]">
                        Hemat Rp 6.000
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddBundle(['Cappuccino', 'Croissant'], 6000, 'Sweet Morning Pairing')}
                    className="shrink-0 px-3 py-2 rounded-xl bg-[#64748b] hover:bg-[#475569] text-white text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                    <span>Pilih</span>
                  </button>
                </div>
              </div>

              {/* Bundle 2 */}
              <div className="p-3.5 rounded-2xl bg-white border border-[#cbd5e1] hover:border-[#94a3b8] transition-all group shadow-xs">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#e2e8f0] text-[#334155] mb-1 border border-[#cbd5e1]">
                      POPULER SORE 🍵🍰
                    </span>
                    <h5 className="text-sm font-bold text-[#1e293b]">Zen Matcha Break</h5>
                    <p className="text-xs text-[#64748b] mt-0.5">
                      Iced Matcha Latte + Chocolate Muffin lembut
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs line-through text-[#94a3b8]">Rp 62.000</span>
                      <span className="text-sm font-bold text-[#1e293b]">Rp 55.000</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#e2e8f0] text-[#334155]">
                        Hemat Rp 7.000
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddBundle(['Matcha', 'Muffin'], 7000, 'Zen Matcha Break')}
                    className="shrink-0 px-3 py-2 rounded-xl bg-[#64748b] hover:bg-[#475569] text-white text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                    <span>Pilih</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick AI Shortcuts */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#334155] mb-2.5 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">bolt</span>
              Pintasan Kasir Cepat
            </h4>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={handleApplyHappyHour}
                className="p-3 rounded-2xl bg-white hover:bg-[#f8fafc] border border-[#cbd5e1] text-left transition-all group active:scale-[0.98] shadow-xs"
              >
                <div className="w-8 h-8 rounded-xl bg-[#e2e8f0] text-[#334155] flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-lg">percent</span>
                </div>
                <p className="text-xs font-bold text-[#1e293b]">Happy Hour 10%</p>
                <p className="text-[11px] text-[#64748b]">Diskon otomatis 10%</p>
              </button>

              <button
                onClick={() => {
                  setCurrentScreen('stok');
                  onClose();
                }}
                className="p-3 rounded-2xl bg-white hover:bg-[#f8fafc] border border-[#cbd5e1] text-left transition-all group active:scale-[0.98] shadow-xs"
              >
                <div className="w-8 h-8 rounded-xl bg-[#e2e8f0] text-[#334155] flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-lg">inventory</span>
                </div>
                <p className="text-xs font-bold text-[#1e293b]">Cek Stok Kritis</p>
                <p className="text-[11px] text-[#64748b]">{lowStockProducts.length} item perlu restock</p>
              </button>
            </div>
          </div>

          {/* Audio Chime Theme Selector */}
          <div className="p-4 rounded-2xl bg-white border border-[#cbd5e1] shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#475569] text-lg">volume_up</span>
                <span className="text-xs font-bold text-[#1e293b]">Efek Suara Kasir</span>
              </div>
              <span className="text-[10px] font-semibold text-[#64748b] uppercase">{soundTheme}</span>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'chime', label: 'Chime ✨' },
                { id: 'bell', label: 'Bell 🔔' },
                { id: 'click', label: 'Bubble 🫧' },
                { id: 'mute', label: 'Senyap 🔇' },
              ].map((snd) => (
                <button
                  key={snd.id}
                  onClick={() => {
                    setSoundTheme(snd.id as 'chime' | 'bell' | 'click' | 'mute');
                    showToast(`Suara kasir: ${snd.label}`, 'info');
                    if (snd.id !== 'mute') {
                      playBeep('success');
                    }
                  }}
                  className={`py-2 px-1 rounded-xl text-xs font-medium flex flex-col items-center gap-1 transition-all border ${
                    soundTheme === snd.id
                      ? 'bg-[#cbd5e1] text-[#0f172a] font-bold border-[#94a3b8] shadow-xs'
                      : 'bg-[#f8fafc] hover:bg-[#e2e8f0] text-[#475569] border-[#cbd5e1]'
                  }`}
                >
                  <span className="text-xs">{snd.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Barista Smart Speed Tips */}
          <div className="p-3.5 rounded-2xl bg-[#f8fafc] border border-[#cbd5e1] text-xs text-[#475569]">
            <p className="font-bold text-[#1e293b] flex items-center gap-1.5 mb-1">
              <span className="material-symbols-outlined text-sm text-[#475569]">lightbulb</span>
              Tips Upsell Cafe Kekinian
            </p>
            <p className="leading-relaxed">
              Tanyakan pelanggan apakah ingin opsi <strong>Oat Milk</strong> atau <strong>Extra Espresso Shot</strong> pada menu minuman dingin untuk meningkatkan rata-rata nilai transaksi (AOV).
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-[#cbd5e1] flex items-center justify-between">
          <p className="text-[11px] text-[#64748b]">KASIRKU POS • Blue Grey Pastel Suite</p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full bg-[#475569] text-white text-xs font-bold hover:bg-[#334155] transition-colors"
          >
            Tutup
          </button>
        </div>
      </aside>
    </div>
  );
};
