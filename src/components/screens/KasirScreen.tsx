import React, { useState, useMemo, useEffect } from 'react';
import { usePOS } from '../../context/POSContext';
import { Product } from '../../types';
import { BarcodeScannerModal } from '../modals/BarcodeScannerModal';

export const KasirScreen: React.FC = () => {
  const {
    products,
    categories,
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    updateCartItemNotes,
    clearCart,
    cartSubtotal,
    cartDiscount,
    setCartDiscount,
    cartTotal,
    searchQuery,
    setIsPaymentModalOpen,
    processPayment,
    showToast,
    orderType,
    setOrderType,
    customerName,
    setCustomerName,
    tableNumber,
    setTableNumber,
    setIsAssistantOpen,
    storeStatus,
    settings,
    setCurrentScreen,
    heldOrders,
    setIsHeldOrdersModalOpen,
    holdCurrentCart,
    currentShift,
    setIsShiftModalOpen,
    activeCashier,
    currentUser,
    openPhotoModal,
    isBarcodeModalOpen,
    setIsBarcodeModalOpen,
    openBarcodeModal,
    scanBarcodeAndAddToCart,
  } = usePOS();

  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [quickBarcodeInput, setQuickBarcodeInput] = useState<string>('');
  const [cashReceived, setCashReceived] = useState<string>('50000');
  const [discountInputOpen, setDiscountInputOpen] = useState<boolean>(false);
  const [tempDiscount, setTempDiscount] = useState<string>('0');
  const [activeItemNoteModal, setActiveItemNoteModal] = useState<string | null>(null);
  const [activeNoteText, setActiveNoteText] = useState<string>('');

  // Hardware USB/Bluetooth Barcode Scanner Keyboard Listener
  useEffect(() => {
    let barcodeBuffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      // Global shortcut F2 or Ctrl+B / Cmd+B to open barcode scanner modal
      if (e.key === 'F2' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b')) {
        e.preventDefault();
        openBarcodeModal();
        return;
      }

      const target = e.target as HTMLElement;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');

      const currentTime = Date.now();
      const diff = currentTime - lastKeyTime;
      lastKeyTime = currentTime;

      // Hardware barcode scanner sends characters in rapid burst (< 60ms) and terminates with Enter
      if (e.key === 'Enter') {
        if (barcodeBuffer.length >= 3 && diff < 120) {
          e.preventDefault();
          scanBarcodeAndAddToCart(barcodeBuffer);
          barcodeBuffer = '';
        }
      } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        if (diff > 120 && !isInput) {
          barcodeBuffer = ''; // reset buffer if slow manual typing
        }
        if (!isInput) {
          barcodeBuffer += e.key;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scanBarcodeAndAddToCart, openBarcodeModal]);

  const handleQuickBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickBarcodeInput.trim()) return;
    scanBarcodeAndAddToCart(quickBarcodeInput.trim());
    setQuickBarcodeInput('');
  };

  // Filter products by category and search
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat =
        selectedCategory === 'Semua' ||
        p.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        (selectedCategory === 'ATK' && p.category.includes('ATK')) ||
        (selectedCategory === 'Minuman' && p.category.includes('Minuman')) ||
        (selectedCategory === 'Makanan' && (p.category.includes('Makanan') || p.category.includes('Pastry')));

      const matchSearch =
        searchQuery === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase());

      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const cashAmount = parseFloat(cashReceived.replace(/\D/g, '')) || 0;
  const changeAmount = Math.max(0, cashAmount - cartTotal);

  const formatRupiah = (val: number) => {
    return `Rp ${val.toLocaleString('id-ID')}`;
  };

  const handleProductClick = (product: Product) => {
    if (product.stock <= 0) {
      showToast('Stok produk habis', 'error');
      return;
    }
    addToCart(product);
  };

  const handleQuickPay = async () => {
    if (cart.length === 0) {
      showToast('Keranjang belanja masih kosong', 'warning');
      return;
    }
    if (cashAmount < cartTotal) {
      showToast('Uang yang diterima kurang dari total belanja', 'error');
      return;
    }
    await processPayment('TUNAI', cashAmount);
  };

  const handleSetQuickCash = (amt: number) => {
    setCashReceived(amt.toString());
  };

  const quickDiscountPills = [
    { label: '5k', val: 5000 },
    { label: '10k', val: 10000 },
    { label: '10%', isPercent: true },
  ];

  const quickModifierChips = [
    'Less Sugar 🧊',
    'Normal Ice ❄️',
    'Extra Shot ☕',
    'Oat Milk 🥛',
    'Hangat ♨️',
    'Bungkus Terpisah 🛍️',
  ];

  return (
    <div className="flex flex-col xl:flex-row h-full gap-6 pb-24 xl:pb-0">
      {/* Left Area: Category Tabs & Products Grid */}
      <div className="flex-1 flex flex-col min-w-0 space-y-3">
        {/* Store Closing Notice Banner */}
        {storeStatus === 'SEGERA_TUTUP' && (
          <div className="p-3.5 rounded-2xl bg-[#fef9c3] border border-[#fde68a] text-[#713f12] flex items-center justify-between gap-3 shadow-2xs animate-in fade-in duration-300">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="material-symbols-outlined text-[24px] text-amber-700 animate-bounce">
                alarm_on
              </span>
              <div className="text-xs min-w-0">
                <span className="font-extrabold uppercase tracking-wide">
                  Peringatan: Toko Segera Tutup (Jam {settings.closeTime || '22:00'}):
                </span>{' '}
                <span className="font-medium text-[#854d0e]">
                  {settings.closingNoticeText || 'Pemesanan terakhir (last order) sedang berlangsung.'}
                </span>
              </div>
            </div>
            <button
              onClick={() => setCurrentScreen('pengaturan')}
              className="px-3 py-1 bg-white hover:bg-[#fffbeb] text-[#713f12] text-xs font-bold rounded-xl border border-[#fde68a] shadow-xs shrink-0 whitespace-nowrap"
            >
              Ubah Jam
            </button>
          </div>
        )}

        {storeStatus === 'TUTUP' && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-between gap-3 shadow-2xs animate-in fade-in duration-300">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="material-symbols-outlined text-[24px] text-rose-600">
                storefront
              </span>
              <div className="text-xs min-w-0">
                <span className="font-extrabold uppercase tracking-wide">Outlet Sedang Tutup:</span>{' '}
                <span className="font-medium">
                  Jam buka outlet ({settings.openTime || '08:00'} - {settings.closeTime || '22:00'}). Kasir tetap dapat memproses transaksi manual bila diperlukan.
                </span>
              </div>
            </div>
            <button
              onClick={() => setCurrentScreen('pengaturan')}
              className="px-3 py-1 bg-white hover:bg-rose-100 text-rose-800 text-xs font-bold rounded-xl border border-rose-300 shadow-xs shrink-0 whitespace-nowrap"
            >
              Buka Toko
            </button>
          </div>
        )}

        {/* Enterprise Cashier Bar (High Contrast, Unified Kasir & Login Sync, Quick Photo Change) */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-[#cbd5e1] shadow-xs">
          {/* Active Cashier & Profile Section */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Cashier Avatar with Camera Action Button */}
            <div className="relative group/avatar shrink-0">
              <img
                src={currentUser?.avatarUrl || activeCashier.avatarUrl}
                alt={activeCashier.name}
                className="w-10 h-10 rounded-xl object-cover border-2 border-[#94a3b8] shadow-xs"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://api.dicebear.com/7.x/adventurer/svg?seed=Aisyah&backgroundColor=bae6fd';
                }}
              />
              <button
                type="button"
                onClick={openPhotoModal}
                title="Klik untuk ubah foto profil kasir"
                aria-label="Ubah foto profil kasir"
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#0284c7] hover:bg-[#0369a1] text-white flex items-center justify-center shadow-xs border border-white transition-transform group-hover/avatar:scale-110 active:scale-90"
              >
                <span className="material-symbols-outlined text-[11px]">photo_camera</span>
              </button>
            </div>

            {/* Cashier Name & Role */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#475569]">
                  Kasir Bertugas
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-[#0284c7] text-white">
                  {currentUser ? currentUser.role : activeCashier.role}
                </span>
                {currentUser?.username && (
                  <span className="text-[10px] font-mono text-[#64748b] hidden sm:inline">
                    @{currentUser.username}
                  </span>
                )}
              </div>
              <p className="text-sm font-extrabold text-[#0f172a] truncate leading-tight mt-0.5">
                {currentUser ? currentUser.fullName : activeCashier.name}
              </p>
            </div>

            {/* Quick Change Photo Button */}
            <button
              type="button"
              onClick={openPhotoModal}
              className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#1e293b] text-xs font-bold border border-[#cbd5e1] transition-all active:scale-95 shadow-2xs"
              title="Ubah foto profil kasir yang sedang login"
            >
              <span className="material-symbols-outlined text-[14px] text-[#0284c7]">add_a_photo</span>
              <span>Ubah Foto</span>
            </button>
          </div>

          {/* Quick Shift & Status Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Shift & Drawer Button */}
            <button
              type="button"
              onClick={() => setIsShiftModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-[#f8fafc] hover:bg-white text-[#0f172a] text-xs font-bold border border-[#cbd5e1] hover:border-[#94a3b8] transition-all flex items-center gap-1.5 shadow-2xs active:scale-95"
              title="Buka detail shift & laci kasir"
            >
              <span className="material-symbols-outlined text-[16px] text-[#0284c7]">point_of_sale</span>
              <span>Laci Kas:</span>
              <span className="text-[11px] font-mono font-bold text-[#0369a1] bg-[#e0f2fe] px-1.5 py-0.2 rounded border border-[#bae6fd]">
                Rp {(currentShift?.expectedCash || 0).toLocaleString('id-ID')}
              </span>
            </button>

            {/* Held Orders Pill Button */}
            <button
              type="button"
              onClick={() => setIsHeldOrdersModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#fffbeb] text-[#78350f] text-xs font-bold border border-[#cbd5e1] hover:border-[#fde68a] transition-all flex items-center gap-1.5 shadow-2xs active:scale-95"
              title="Lihat pesanan yang diparkir / pending"
            >
              <span className="material-symbols-outlined text-[16px] text-[#d97706]">pause_circle</span>
              <span>Parkir</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-[#fef9c3] text-[#713f12] border border-[#fde68a]">
                {heldOrders.length}
              </span>
            </button>

            {/* Operational Hours Indicator */}
            <div className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-xl bg-[#f8fafc] border border-[#cbd5e1] text-[#334155]">
              <span
                className={`w-2 h-2 rounded-full ${
                  storeStatus === 'BUKA'
                    ? 'bg-emerald-500'
                    : storeStatus === 'SEGERA_TUTUP'
                    ? 'bg-amber-500 animate-ping'
                    : 'bg-rose-500'
                }`}
              />
              <span className="text-[11px]">
                {storeStatus === 'BUKA'
                  ? `Buka (${settings.openTime} - ${settings.closeTime})`
                  : storeStatus === 'SEGERA_TUTUP'
                  ? `Segera Tutup (${settings.closeTime})`
                  : 'Outlet Tutup'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Barcode Scanner Bar */}
        <div className="bg-white/95 backdrop-blur-xs rounded-2xl p-2.5 sm:p-3 border border-[#cbd5e1] shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Left: Camera Scan Action Button & Hardware Status */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={openBarcodeModal}
              id="open-barcode-scanner-btn"
              className="px-4 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-black text-xs shadow-xs flex items-center gap-2 transition-all duration-150 active:scale-95 group shrink-0"
              title="Buka Kamera Barcode Scanner (Shortcut: F2 atau Ctrl+B)"
            >
              <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <span className="material-symbols-outlined text-[18px]">barcode_scanner</span>
              </div>
              <div className="text-left">
                <span className="block leading-none">Scan Barcode (Kamera)</span>
                <span className="text-[9px] text-white/80 font-mono font-medium">Shortcut [F2]</span>
              </div>
            </button>

            {/* Live Hardware USB Scanner status badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-[#475569] text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Scanner USB / Gun Aktif</span>
            </div>
          </div>

          {/* Right: Quick Barcode Input field */}
          <form
            onSubmit={handleQuickBarcodeSubmit}
            className="flex items-center gap-1.5 flex-1 sm:max-w-xs"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={quickBarcodeInput}
                onChange={(e) => setQuickBarcodeInput(e.target.value)}
                placeholder="Scan / ketik barcode..."
                className="w-full pl-8 pr-3 py-1.5 bg-[#f8fafc] border border-[#cbd5e1] focus:border-[#0284c7] focus:bg-white rounded-xl text-xs font-mono font-bold text-[#0f172a] outline-none transition-colors placeholder:text-stone-400 placeholder:font-sans"
              />
              <span className="material-symbols-outlined text-[16px] text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                qr_code
              </span>
            </div>
            <button
              type="submit"
              disabled={!quickBarcodeInput.trim()}
              className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-40 text-white text-xs font-bold transition-all shrink-0"
              title="Masukkan barcode ke keranjang"
            >
              + Enter
            </button>
          </form>
        </div>

        {/* Category Pills Bar with Pastel Yellow & Warm Beige Palette */}
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar py-1">
          <button
            onClick={() => setSelectedCategory('Semua')}
            className={`px-5 py-2.5 rounded-full text-sm font-extrabold whitespace-nowrap transition-all duration-200 active:scale-95 ${
              selectedCategory === 'Semua'
                ? 'bg-[#fef9c3] text-[#713f12] shadow-2xs border border-[#fde68a]'
                : 'bg-[#fffdfa]/90 text-[#57534e] hover:bg-[#fef9c3] border border-[#ede5d8]'
            }`}
          >
            ✨ Semua Menu
          </button>
          <button
            onClick={() => setSelectedCategory('Minuman')}
            className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-200 active:scale-95 ${
              selectedCategory === 'Minuman'
                ? 'bg-[#fef9c3] text-[#713f12] shadow-2xs border border-[#fde68a]'
                : 'bg-[#fffdfa]/90 text-[#57534e] hover:bg-[#fef9c3] border border-[#ede5d8]'
            }`}
          >
            ☕ Minuman
          </button>
          <button
            onClick={() => setSelectedCategory('Makanan')}
            className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-200 active:scale-95 ${
              selectedCategory === 'Makanan'
                ? 'bg-[#fef9c3] text-[#713f12] shadow-2xs border border-[#fde68a]'
                : 'bg-[#fffdfa]/90 text-[#57534e] hover:bg-[#fef9c3] border border-[#ede5d8]'
            }`}
          >
            🍔 Makanan
          </button>
          <button
            onClick={() => setSelectedCategory('Pastry')}
            className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-200 active:scale-95 ${
              selectedCategory === 'Pastry'
                ? 'bg-[#fef9c3] text-[#713f12] shadow-2xs border border-[#fde68a]'
                : 'bg-[#fffdfa]/90 text-[#57534e] hover:bg-[#fef9c3] border border-[#ede5d8]'
            }`}
          >
            🥐 Pastry & Cake
          </button>
          <button
            onClick={() => setSelectedCategory('ATK')}
            className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-200 active:scale-95 ${
              selectedCategory === 'ATK'
                ? 'bg-[#fef9c3] text-[#713f12] shadow-2xs border border-[#fde68a]'
                : 'bg-[#fffdfa]/90 text-[#57534e] hover:bg-[#fef9c3] border border-[#ede5d8]'
            }`}
          >
            🎁 Merchandise
          </button>
          {categories.map((cat) => {
            if (['Minuman', 'Makanan', 'Pastry & Cake', 'ATK'].includes(cat.name)) return null;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all duration-200 active:scale-95 ${
                  selectedCategory === cat.name
                    ? 'bg-[#fef9c3] text-[#713f12] shadow-2xs border border-[#fde68a]'
                    : 'bg-[#fffdfa]/90 text-[#57534e] hover:bg-[#fef9c3] border border-[#ede5d8]'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center p-8 bg-[#fffdfa]/80 backdrop-blur-xs rounded-3xl border border-[#ede5d8]">
              <div className="w-16 h-16 rounded-full bg-[#fef9c3] flex items-center justify-center mb-3 text-[#854d0e]">
                <span className="material-symbols-outlined text-3xl">search_off</span>
              </div>
              <p className="font-bold text-[#292524] text-lg">Menu tidak ditemukan</p>
              <p className="text-sm text-[#78716c] mt-1">
                Coba cari dengan kata kunci lain atau gunakan tombol Asisten Cerdas.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
              {filteredProducts.map((product) => {
                const isOutOfStock = product.stock <= 0;
                const isLowStock = product.stock > 0 && product.stock <= product.minStockThreshold;

                return (
                  <div
                    key={product.id}
                    id={`product-card-${product.id}`}
                    onClick={() => handleProductClick(product)}
                    className={`bg-[#fffdfa]/95 backdrop-blur-xs rounded-3xl p-3.5 flex flex-col border border-[#ede5d8] transition-all duration-200 cursor-pointer select-none group relative overflow-hidden ${
                      isOutOfStock
                        ? 'opacity-70 grayscale-[25%] hover:border-amber-300'
                        : 'hover:shadow-[0px_8px_20px_rgba(254,240,138,0.35)] hover:border-[#fde68a] hover:-translate-y-1 active:scale-[0.99]'
                    }`}
                  >
                    {/* Product Image Container */}
                    <div className="relative aspect-4/3 w-full rounded-2xl overflow-hidden bg-[#f7f3eb] mb-3 border border-[#ede5d8]">
                      <img
                        src={product.image}
                        alt={product.name}
                        className={`w-full h-full object-cover transition-transform duration-300 ${
                          isOutOfStock ? 'grayscale-[30%]' : 'group-hover:scale-105'
                        }`}
                        loading="lazy"
                      />

                      {/* Stock Pill Badge Top-Right */}
                      <div className="absolute top-2 right-2">
                        {isOutOfStock ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#eee7d8] text-[#78716c] border border-[#dfd5c3] shadow-xs">
                            Habis
                          </span>
                        ) : isLowStock ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#fef9c3] text-[#713f12] border border-[#fde68a] shadow-2xs">
                            Sisa {product.stock}
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/90 backdrop-blur-xs text-[#57534e] border border-[#ede5d8] shadow-xs">
                            Stok: {product.stock}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[10px] font-mono font-bold text-[#854d0e] uppercase tracking-wider">
                            {product.sku}
                          </span>
                          <span className="text-[10px] text-[#78716c] truncate max-w-[100px]">
                            {product.category}
                          </span>
                        </div>
                        <h3 className="font-bold text-sm text-[#292524] line-clamp-2 leading-snug group-hover:text-[#713f12] transition-colors">
                          {product.name}
                        </h3>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-[#f7f3eb] flex items-center justify-between">
                        <span className="text-sm md:text-base font-extrabold text-[#713f12]">
                          {formatRupiah(product.price)}
                        </span>
                        <span className="w-8 h-8 rounded-full bg-[#fef9c3] group-hover:bg-[#fef08a] flex items-center justify-center text-[#713f12] font-bold shadow-2xs transition-all border border-[#fde68a]">
                          <span className="material-symbols-outlined text-[18px]">add</span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Area: Order Cart Panel (410px wide) */}
      <div className="w-full xl:w-[410px] shrink-0 flex flex-col bg-[#fffdfa]/95 backdrop-blur-md rounded-3xl border border-[#ede5d8] shadow-[0px_8px_30px_rgba(168,153,128,0.12)] p-5 overflow-hidden">
        {/* Dine In / Take Away Switcher */}
        <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-[#f7f3eb] border border-[#ede5d8] mb-3">
          <button
            onClick={() => setOrderType('Dine In')}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              orderType === 'Dine In'
                ? 'bg-[#fef9c3] text-[#713f12] shadow-2xs border border-[#fde68a]'
                : 'text-[#57534e] hover:text-[#292524]'
            }`}
          >
            <span>☕ Dine In</span>
          </button>
          <button
            onClick={() => setOrderType('Take Away')}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              orderType === 'Take Away'
                ? 'bg-[#fef9c3] text-[#713f12] shadow-2xs border border-[#fde68a]'
                : 'text-[#57534e] hover:text-[#292524]'
            }`}
          >
            <span>🛍️ Take Away</span>
          </button>
        </div>

        {/* Customer Name & Table Number Inputs */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#78716c] block mb-1">
              {orderType === 'Dine In' ? 'No. Meja' : 'Label Pesanan'}
            </label>
            <input
              type="text"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder={orderType === 'Dine In' ? 'Meja 01' : 'Bungkus #1'}
              className="w-full px-3 py-1.5 rounded-xl bg-[#fdfbf7] border border-[#ede5d8] text-xs font-semibold text-[#292524] focus:border-[#fde68a] focus:ring-1 focus:ring-[#fef9c3] outline-none placeholder:text-[#a8a29e]"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#78716c] block mb-1">
              Nama Pelanggan
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Contoh: Kak Cindy"
              className="w-full px-3 py-1.5 rounded-xl bg-[#fdfbf7] border border-[#ede5d8] text-xs font-semibold text-[#292524] focus:border-[#fde68a] focus:ring-1 focus:ring-[#fef9c3] outline-none placeholder:text-[#a8a29e]"
            />
          </div>
        </div>

        {/* Cart Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#ede5d8]">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-[#292524] tracking-tight">Rincian Pesanan</h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#fef9c3] text-[#713f12] border border-[#fde68a]">
              {cart.reduce((sum, item) => sum + item.quantity, 0)} item
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsAssistantOpen(true)}
              className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#fef9c3] hover:bg-[#fef08a] text-[#713f12] border border-[#fde68a] transition-colors flex items-center gap-1"
              title="Rekomendasi Cerdas"
            >
              <span className="material-symbols-outlined text-[14px] text-[#854d0e]">auto_awesome</span>
              <span>Bundle AI</span>
            </button>
            {cart.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={holdCurrentCart}
                  className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#fdfbf7] hover:bg-[#fef9c3] text-[#713f12] border border-[#ede5d8] hover:border-[#fde68a] transition-all flex items-center gap-1 shadow-2xs active:scale-95"
                  title="Parkir pesanan ini dan layani pelanggan lain terlebih dahulu"
                >
                  <span className="material-symbols-outlined text-[14px]">pause</span>
                  <span>Hold Bill</span>
                </button>
                <button
                  onClick={clearCart}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[#78716c] hover:bg-[#fef9c3] hover:text-[#713f12] transition-colors"
                  title="Kosongkan Keranjang"
                >
                  <span className="material-symbols-outlined text-[18px]">delete_outline</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto py-2 divide-y divide-[#f7f3eb] min-h-[190px] max-h-[300px]">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <div className="w-12 h-12 rounded-full bg-[#fef9c3] flex items-center justify-center text-[#854d0e] mb-2 border border-[#fde68a]">
                <span className="material-symbols-outlined text-2xl">shopping_bag</span>
              </div>
              <p className="text-sm font-bold text-[#292524]">Keranjang Masih Kosong</p>
              <p className="text-xs text-[#78716c] mt-0.5 max-w-[200px]">
                Pilih menu di samping atau klik Rekomendasi Bundle AI
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.product.id} className="py-2.5 flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs md:text-sm text-[#292524] truncate">
                      {item.product.name}
                    </h4>
                    <p className="text-xs text-[#854d0e] font-semibold">
                      {formatRupiah(item.product.price)}
                    </p>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-1.5 bg-[#f7f3eb] p-1 rounded-full border border-[#ede5d8]">
                    <button
                      onClick={() => {
                        if (item.quantity === 1) {
                          removeFromCart(item.product.id);
                        } else {
                          updateCartQuantity(item.product.id, -1);
                        }
                      }}
                      className="w-6 h-6 rounded-full bg-white text-[#292524] flex items-center justify-center font-bold text-xs shadow-xs hover:bg-[#fef9c3] active:scale-95 transition-all border border-[#ede5d8]"
                    >
                      -
                    </button>
                    <span className="w-5 text-center text-xs font-bold text-[#292524]">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartQuantity(item.product.id, 1)}
                      className="w-6 h-6 rounded-full bg-white text-[#292524] flex items-center justify-center font-bold text-xs shadow-xs hover:bg-[#fef9c3] active:scale-95 transition-all border border-[#ede5d8]"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Item Notes / Modifier Chip */}
                <div className="flex items-center justify-between gap-2">
                  {item.notes ? (
                    <button
                      onClick={() => {
                        setActiveItemNoteModal(item.product.id);
                        setActiveNoteText(item.notes || '');
                      }}
                      className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#fef9c3] text-[#713f12] border border-[#fde68a] truncate max-w-[280px] hover:bg-[#fef08a] transition-colors flex items-center gap-1"
                    >
                      <span>📝 {item.notes}</span>
                      <span className="text-[10px] text-[#854d0e]">✎</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setActiveItemNoteModal(item.product.id);
                        setActiveNoteText('');
                      }}
                      className="text-[10px] font-semibold text-[#854d0e] hover:text-[#713f12] flex items-center gap-1"
                    >
                      <span>+ Catatan khusus</span>
                    </button>
                  )}
                  <span className="text-xs font-bold text-[#292524]">
                    {formatRupiah(item.product.price * item.quantity)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Calculation & Checkout Footer */}
        <div className="pt-3 border-t border-[#ede5d8] space-y-2.5 bg-transparent">
          {/* Subtotal */}
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-[#78716c]">Subtotal</span>
            <span className="font-bold text-[#292524]">{formatRupiah(cartSubtotal)}</span>
          </div>

          {/* Discount Row & Quick Pills */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-[#78716c]">Diskon</span>
              <button
                onClick={() => setDiscountInputOpen(!discountInputOpen)}
                className="text-[11px] text-[#854d0e] hover:underline font-bold"
              >
                {discountInputOpen ? 'Tutup' : cartDiscount > 0 ? 'Ubah' : '+ Tambah'}
              </button>
            </div>

            <div className="flex items-center gap-1">
              {quickDiscountPills.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (p.isPercent) {
                      const disc = Math.round(cartSubtotal * 0.1);
                      setCartDiscount(disc);
                    } else {
                      setCartDiscount(p.val || 0);
                    }
                  }}
                  className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-[#fdfbf7] hover:bg-[#fef9c3] text-[#713f12] transition-colors border border-[#ede5d8]"
                >
                  {p.label}
                </button>
              ))}
              <span className="font-bold text-amber-800 ml-1">
                {cartDiscount > 0 ? `-${formatRupiah(cartDiscount)}` : 'Rp 0'}
              </span>
            </div>
          </div>

          {/* Inline Discount Input */}
          {discountInputOpen && (
            <div className="flex items-center gap-2 p-2 bg-[#fdfbf7] rounded-xl border border-[#ede5d8] animate-in fade-in duration-150">
              <span className="text-xs font-bold text-[#713f12]">Rp</span>
              <input
                type="number"
                value={tempDiscount}
                onChange={(e) => setTempDiscount(e.target.value)}
                placeholder="0"
                className="w-full text-xs font-semibold bg-white px-2 py-1 rounded-md border border-[#ede5d8] outline-none"
              />
              <button
                onClick={() => {
                  const disc = Math.max(0, parseInt(tempDiscount) || 0);
                  setCartDiscount(disc);
                  setDiscountInputOpen(false);
                }}
                className="px-3 py-1 bg-[#fef9c3] hover:bg-[#fef08a] text-[#713f12] text-xs font-bold rounded-md border border-[#fde68a]"
              >
                Pakai
              </button>
            </div>
          )}

          {/* Total */}
          <div className="flex items-center justify-between pt-1.5 border-t border-[#f7f3eb]">
            <span className="text-sm font-extrabold text-[#292524]">Total Pembayaran</span>
            <span className="text-xl font-extrabold text-[#713f12]">{formatRupiah(cartTotal)}</span>
          </div>

          {/* Cash Received Input & Presets */}
          <div className="bg-[#fdfbf7] p-3 rounded-2xl border border-[#ede5d8] space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-[#78716c]">Uang Diterima</label>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleSetQuickCash(cartTotal)}
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#fef9c3] text-[#713f12] border border-[#fde68a] hover:bg-[#fef08a] transition-colors"
                >
                  Uang Pas
                </button>
                <button
                  onClick={() => handleSetQuickCash(50000)}
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#fef9c3] text-[#713f12] border border-[#fde68a] hover:bg-[#fef08a] transition-colors"
                >
                  50k
                </button>
                <button
                  onClick={() => handleSetQuickCash(100000)}
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#fef9c3] text-[#713f12] border border-[#fde68a] hover:bg-[#fef08a] transition-colors"
                >
                  100k
                </button>
              </div>
            </div>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-xs text-[#78716c]">
                Rp
              </span>
              <input
                type="text"
                value={cashReceived}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setCashReceived(val);
                }}
                placeholder="0"
                className="w-full pl-9 pr-3 py-1.5 bg-white rounded-xl border border-[#ede5d8] focus:border-[#eab308] text-sm font-bold text-[#292524] outline-none"
              />
            </div>

            {/* Kembalian */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <span className="text-[#78716c]">Kembalian:</span>
              <span
                className={`font-bold ${
                  cashAmount >= cartTotal ? 'text-amber-800' : 'text-stone-400'
                }`}
              >
                {cashAmount >= cartTotal ? formatRupiah(changeAmount) : 'Kurang'}
              </span>
            </div>
          </div>

          {/* Action Buttons: BAYAR (Cash) or Choose Payment Method (QRIS/Card) */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            <button
              onClick={() => {
                if (cart.length === 0) {
                  showToast('Keranjang masih kosong', 'warning');
                  return;
                }
                setIsPaymentModalOpen(true);
              }}
              className="col-span-1 py-3 rounded-2xl bg-[#fdfbf7] hover:bg-[#fef9c3] text-[#713f12] font-bold flex flex-col items-center justify-center text-xs transition-all border border-[#ede5d8] active:scale-95 shadow-2xs"
              title="Metode Pembayaran Lain (QRIS / Kartu)"
            >
              <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span>
              <span className="text-[10px] mt-0.5">QRIS/Card</span>
            </button>

            <button
              onClick={handleQuickPay}
              disabled={cart.length === 0}
              className={`col-span-3 py-3 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                cart.length === 0
                  ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  : 'pastel-gradient-btn'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">payments</span>
              <span>BAYAR SEKARANG</span>
            </button>
          </div>
        </div>
      </div>

      {/* Item Note & Modifier Modal */}
      {activeItemNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div
            className="fixed inset-0 bg-stone-900/30 backdrop-blur-xs"
            onClick={() => setActiveItemNoteModal(null)}
          />
          <div className="relative w-full max-w-sm bg-[#fffdfa] rounded-3xl p-5 shadow-[0px_10px_35px_rgba(168,153,128,0.2)] border border-[#ede5d8] z-10">
            <h4 className="font-bold text-sm text-[#292524] mb-1">Catatan Khusus Menu</h4>
            <p className="text-xs text-[#78716c] mb-3">Pilih opsi cepat atau ketik catatan kustom:</p>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {quickModifierChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveNoteText((prev) => (prev ? `${prev}, ${chip}` : chip));
                  }}
                  className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#fdfbf7] hover:bg-[#fef9c3] text-[#713f12] transition-colors border border-[#ede5d8]"
                >
                  {chip}
                </button>
              ))}
            </div>

            <textarea
              value={activeNoteText}
              onChange={(e) => setActiveNoteText(e.target.value)}
              placeholder="Contoh: Gula 50%, tanpa sedotan..."
              rows={2}
              className="w-full p-2.5 rounded-xl bg-[#fdfbf7] border border-[#ede5d8] focus:border-[#eab308] text-xs font-medium outline-none resize-none mb-3"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  updateCartItemNotes(activeItemNoteModal, '');
                  setActiveItemNoteModal(null);
                }}
                className="px-3 py-1.5 rounded-full text-xs font-semibold text-[#78716c] hover:text-[#292524]"
              >
                Hapus
              </button>
              <button
                onClick={() => {
                  updateCartItemNotes(activeItemNoteModal, activeNoteText);
                  setActiveItemNoteModal(null);
                  showToast('Catatan pesanan disimpan', 'info');
                }}
                className="px-4 py-1.5 rounded-full bg-[#fef9c3] hover:bg-[#fef08a] text-[#713f12] text-xs font-bold border border-[#fde68a] shadow-2xs"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barcode Scanner Camera Modal */}
      <BarcodeScannerModal
        isOpen={isBarcodeModalOpen}
        onClose={() => setIsBarcodeModalOpen(false)}
        mode="cart"
      />
    </div>
  );
};
