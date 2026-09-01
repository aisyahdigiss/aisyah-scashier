import React, { useState, useMemo } from 'react';
import { usePOS } from '../../context/POSContext';
import { Product } from '../../types';

export const KasirScreen: React.FC = () => {
  const {
    products,
    categories,
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    cartSubtotal,
    cartDiscount,
    setCartDiscount,
    cartTotal,
    searchQuery,
    setIsPaymentModalOpen,
    processPayment,
    showToast,
  } = usePOS();

  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [cashReceived, setCashReceived] = useState<string>('50000');
  const [discountInputOpen, setDiscountInputOpen] = useState<boolean>(false);
  const [tempDiscount, setTempDiscount] = useState<string>('0');

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

  return (
    <div className="flex flex-col xl:flex-row h-full gap-6 pb-20 xl:pb-0">
      {/* Left Area: Categories & Products Catalog */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar py-1 mb-4">
          <button
            onClick={() => setSelectedCategory('Semua')}
            className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-150 ${
              selectedCategory === 'Semua'
                ? 'bg-[#30628a] text-white shadow-sm'
                : 'bg-[#f3ede4] text-[#41474e] hover:bg-[#ede7df] hover:text-[#1d1b16]'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setSelectedCategory('Minuman')}
            className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-150 ${
              selectedCategory === 'Minuman'
                ? 'bg-[#30628a] text-white shadow-sm'
                : 'bg-[#f3ede4] text-[#41474e] hover:bg-[#ede7df] hover:text-[#1d1b16]'
            }`}
          >
            Minuman
          </button>
          <button
            onClick={() => setSelectedCategory('Makanan')}
            className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-150 ${
              selectedCategory === 'Makanan'
                ? 'bg-[#30628a] text-white shadow-sm'
                : 'bg-[#f3ede4] text-[#41474e] hover:bg-[#ede7df] hover:text-[#1d1b16]'
            }`}
          >
            Makanan
          </button>
          <button
            onClick={() => setSelectedCategory('Pastry')}
            className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-150 ${
              selectedCategory === 'Pastry'
                ? 'bg-[#30628a] text-white shadow-sm'
                : 'bg-[#f3ede4] text-[#41474e] hover:bg-[#ede7df] hover:text-[#1d1b16]'
            }`}
          >
            Pastry & Cake
          </button>
          <button
            onClick={() => setSelectedCategory('ATK')}
            className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-150 ${
              selectedCategory === 'ATK'
                ? 'bg-[#30628a] text-white shadow-sm'
                : 'bg-[#f3ede4] text-[#41474e] hover:bg-[#ede7df] hover:text-[#1d1b16]'
            }`}
          >
            ATK
          </button>
          {categories.map((cat) => {
            if (['Minuman', 'Makanan', 'Pastry & Cake', 'ATK'].includes(cat.name)) return null;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-150 ${
                  selectedCategory === cat.name
                    ? 'bg-[#30628a] text-white shadow-sm'
                    : 'bg-[#f3ede4] text-[#41474e] hover:bg-[#ede7df] hover:text-[#1d1b16]'
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
            <div className="flex flex-col items-center justify-center h-64 text-center p-8 bg-white rounded-3xl border border-[#ede7df]">
              <span className="material-symbols-outlined text-5xl text-[#72787f] mb-3">
                search_off
              </span>
              <p className="font-bold text-[#1d1b16] text-lg">Produk tidak ditemukan</p>
              <p className="text-sm text-[#41474e] mt-1">
                Coba kata kunci lain atau pilih kategori yang berbeda.
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
                    className={`bg-white rounded-2xl p-3 flex flex-col border border-[#ede7df] transition-all duration-200 cursor-pointer select-none group relative overflow-hidden ${
                      isOutOfStock
                        ? 'opacity-80 hover:border-[#ba1a1a]/40'
                        : 'hover:shadow-[0px_8px_20px_rgba(48,98,138,0.12)] hover:border-[#30628a]/40 hover:-translate-y-0.5 active:scale-[0.99]'
                    }`}
                  >
                    {/* Product Image Container */}
                    <div className="relative aspect-4/3 w-full rounded-xl overflow-hidden bg-[#f9f3ea] mb-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className={`w-full h-full object-cover transition-transform duration-300 ${
                          isOutOfStock ? 'grayscale-[40%]' : 'group-hover:scale-105'
                        }`}
                        loading="lazy"
                      />

                      {/* Stock Pill Badge Top-Right */}
                      <div className="absolute top-2 right-2">
                        {isOutOfStock ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#ffdad6] text-[#93000a] border border-[#ba1a1a]/20 shadow-xs">
                            Habis
                          </span>
                        ) : isLowStock ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#feebd0] text-[#8c4f00] border border-[#ffb950]/30 shadow-xs">
                            Stok: {product.stock}
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-xs text-[#1d1b16] border border-[#ede7df] shadow-xs">
                            Stok: {product.stock}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[11px] font-mono font-medium text-[#72787f] block uppercase tracking-wider mb-0.5">
                          {product.sku}
                        </span>
                        <h3 className="font-semibold text-sm text-[#1d1b16] line-clamp-2 leading-snug">
                          {product.name}
                        </h3>
                      </div>

                      <div className="mt-3 pt-2 border-t border-[#f3ede4] flex items-center justify-between">
                        <span className="text-sm md:text-base font-bold text-[#30628a]">
                          {formatRupiah(product.price)}
                        </span>
                        <span className="w-7 h-7 rounded-full bg-[#f3ede4] flex items-center justify-center text-[#30628a] group-hover:bg-[#30628a] group-hover:text-white transition-colors">
                          <span className="material-symbols-outlined text-[16px]">add</span>
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

      {/* Right Area: Order Cart Panel (400px wide) */}
      <div className="w-full xl:w-[400px] shrink-0 flex flex-col bg-white rounded-3xl border border-[#ede7df] shadow-[0px_4px_20px_rgba(162,210,255,0.15)] p-5 overflow-hidden">
        {/* Cart Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#ede7df]">
          <div className="flex items-center gap-2.5">
            <h3 className="text-xl font-bold text-[#1d1b16] tracking-tight">Pesanan</h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#bee1ff] text-[#001e2f]">
              {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
          </div>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="w-9 h-9 rounded-full flex items-center justify-center text-[#ba1a1a] hover:bg-[#ffdad6]/60 transition-colors"
              title="Kosongkan Keranjang"
            >
              <span className="material-symbols-outlined text-[20px]">delete_outline</span>
            </button>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto py-3 divide-y divide-[#f3ede4] min-h-[220px]">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-10">
              <span className="material-symbols-outlined text-4xl text-[#72787f] mb-2 opacity-50">
                shopping_cart
              </span>
              <p className="text-sm font-semibold text-[#1d1b16]">Keranjang Kosong</p>
              <p className="text-xs text-[#72787f] mt-1 max-w-[200px]">
                Pilih produk di sebelah kiri untuk menambahkan pesanan
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.product.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-[#1d1b16] truncate">
                    {item.product.name}
                  </h4>
                  <p className="text-xs text-[#72787f] mt-0.5">
                    {formatRupiah(item.product.price)}
                  </p>
                </div>

                {/* Stepper Quantity Pill */}
                <div className="flex items-center gap-2 bg-[#f3ede4] p-1 rounded-full border border-[#ede7df]">
                  <button
                    onClick={() => {
                      if (item.quantity === 1) {
                        removeFromCart(item.product.id);
                      } else {
                        updateCartQuantity(item.product.id, -1);
                      }
                    }}
                    className="w-7 h-7 rounded-full bg-white text-[#1d1b16] flex items-center justify-center font-bold text-sm shadow-xs hover:bg-[#ede7df] active:scale-95 transition-all"
                  >
                    -
                  </button>
                  <span className="w-5 text-center text-sm font-bold text-[#1d1b16]">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateCartQuantity(item.product.id, 1)}
                    className="w-7 h-7 rounded-full bg-white text-[#1d1b16] flex items-center justify-center font-bold text-sm shadow-xs hover:bg-[#ede7df] active:scale-95 transition-all"
                  >
                    +
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Calculation & Checkout Footer */}
        <div className="pt-4 border-t border-[#ede7df] space-y-3 bg-white">
          {/* Subtotal */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#72787f]">Subtotal</span>
            <span className="font-semibold text-[#1d1b16]">{formatRupiah(cartSubtotal)}</span>
          </div>

          {/* Discount Row */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5">
              <span className="text-[#72787f]">Diskon</span>
              <button
                onClick={() => setDiscountInputOpen(!discountInputOpen)}
                className="text-xs text-[#30628a] hover:underline font-medium"
              >
                {discountInputOpen ? 'Batal' : cartDiscount > 0 ? 'Ubah' : '+ Tambah'}
              </button>
            </div>
            <span className="font-semibold text-emerald-700">
              {cartDiscount > 0 ? `-${formatRupiah(cartDiscount)}` : 'Rp 0'}
            </span>
          </div>

          {/* Inline Discount Input */}
          {discountInputOpen && (
            <div className="flex items-center gap-2 p-2 bg-[#f9f3ea] rounded-xl border border-[#ede7df] animate-in fade-in duration-150">
              <span className="text-xs text-[#72787f]">Rp</span>
              <input
                type="number"
                value={tempDiscount}
                onChange={(e) => setTempDiscount(e.target.value)}
                placeholder="0"
                className="w-full text-xs font-semibold bg-white px-2 py-1 rounded-md border border-[#ede7df] outline-none"
              />
              <button
                onClick={() => {
                  const disc = Math.max(0, parseInt(tempDiscount) || 0);
                  setCartDiscount(disc);
                  setDiscountInputOpen(false);
                }}
                className="px-3 py-1 bg-[#30628a] text-white text-xs font-bold rounded-md"
              >
                Terapkan
              </button>
            </div>
          )}

          {/* Total */}
          <div className="flex items-center justify-between pt-2 border-t border-[#f3ede4]">
            <span className="text-base font-bold text-[#1d1b16]">Total</span>
            <span className="text-2xl font-bold text-[#1d1b16]">{formatRupiah(cartTotal)}</span>
          </div>

          {/* Cash Received Input */}
          <div className="bg-[#f9f3ea] p-3 rounded-2xl border border-[#ede7df] space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#41474e]">Uang Diterima</label>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleSetQuickCash(cartTotal)}
                  className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white text-[#30628a] border border-[#ede7df] hover:bg-[#30628a] hover:text-white transition-colors"
                >
                  Pas
                </button>
                <button
                  onClick={() => handleSetQuickCash(50000)}
                  className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white text-[#30628a] border border-[#ede7df] hover:bg-[#30628a] hover:text-white transition-colors"
                >
                  50k
                </button>
                <button
                  onClick={() => handleSetQuickCash(100000)}
                  className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white text-[#30628a] border border-[#ede7df] hover:bg-[#30628a] hover:text-white transition-colors"
                >
                  100k
                </button>
              </div>
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-sm text-[#72787f]">
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
                className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-[#ede7df] focus:border-[#30628a] text-base font-bold text-[#1d1b16] outline-none"
              />
            </div>

            {/* Kembalian */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-medium text-[#72787f]">Kembalian</span>
              <span
                className={`text-sm font-bold ${
                  cashAmount >= cartTotal ? 'text-[#5e604d]' : 'text-[#ba1a1a]'
                }`}
              >
                {cashAmount >= cartTotal ? formatRupiah(changeAmount) : 'Uang Kurang'}
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
              className="col-span-1 py-3.5 rounded-2xl bg-[#f3ede4] hover:bg-[#ede7df] text-[#30628a] font-bold flex flex-col items-center justify-center text-xs transition-all border border-[#ede7df] active:scale-95"
              title="Pilih Metode QRIS / Kartu"
            >
              <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span>
              <span className="text-[10px] mt-0.5">Metode Lain</span>
            </button>

            <button
              onClick={handleQuickPay}
              disabled={cart.length === 0}
              className={`col-span-3 py-3.5 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] ${
                cart.length === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-[#30628a] hover:bg-[#275b82] text-white shadow-[0px_4px_16px_rgba(48,98,138,0.25)]'
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">payments</span>
              <span>BAYAR</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
