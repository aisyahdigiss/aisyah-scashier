import React, { useState, useMemo } from 'react';
import { usePOS } from '../../context/POSContext';
import { Product } from '../../types';

export const StokScreen: React.FC = () => {
  const {
    products,
    restockProduct,
    adjustStock,
    searchQuery,
  } = usePOS();

  const [activeTab, setActiveTab] = useState<'Semua' | 'Aman' | 'Menipis' | 'Habis'>('Semua');
  const [restockModalProduct, setRestockModalProduct] = useState<Product | null>(null);
  const [adjustModalProduct, setAdjustModalProduct] = useState<Product | null>(null);
  const [isGeneralRestockOpen, setIsGeneralRestockOpen] = useState(false);
  const [isGeneralAdjustOpen, setIsGeneralAdjustOpen] = useState(false);

  // Summary counts
  const safeCount = products.filter((p) => p.stock > p.minStockThreshold).length;
  const lowCount = products.filter((p) => p.stock > 0 && p.stock <= p.minStockThreshold).length;
  const outCount = products.filter((p) => p.stock === 0).length;

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        searchQuery === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());

      let matchTab = true;
      if (activeTab === 'Aman') matchTab = p.stock > p.minStockThreshold;
      else if (activeTab === 'Menipis') matchTab = p.stock > 0 && p.stock <= p.minStockThreshold;
      else if (activeTab === 'Habis') matchTab = p.stock === 0;

      return matchSearch && matchTab;
    });
  }, [products, searchQuery, activeTab]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1d1b16] tracking-tight">
            Detail Stok & Inventaris
          </h1>
          <p className="text-sm text-[#41474e] mt-1">
            Pantau pergerakan stok dan kelola persediaan barang secara real-time.
          </p>
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsGeneralRestockOpen(true)}
            className="px-5 py-2.5 rounded-full bg-[#30628a] hover:bg-[#275b82] text-white font-bold text-sm flex items-center gap-2 shadow-[0px_4px_16px_rgba(48,98,138,0.25)] transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">add_box</span>
            <span>+ Input Stok Masuk</span>
          </button>
          <button
            onClick={() => setIsGeneralAdjustOpen(true)}
            className="px-5 py-2.5 rounded-full bg-[#f3ede4] hover:bg-[#ede7df] text-[#30628a] font-bold text-sm flex items-center gap-2 border border-[#ede7df] transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">tune</span>
            <span>Update Stok</span>
          </button>
        </div>
      </div>

      {/* 3 Bento Summary Stat Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Stok Aman */}
        <div
          onClick={() => setActiveTab('Aman')}
          className={`bg-white rounded-3xl p-5 border cursor-pointer transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
            activeTab === 'Aman'
              ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
              : 'border-[#ede7df] shadow-[0px_4px_20px_rgba(162,210,255,0.12)] hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Stok Aman
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">check_circle</span>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-[#1d1b16] tracking-tight">{safeCount}</h3>
            <p className="text-xs text-[#72787f] mt-1">Persediaan dalam batas ideal</p>
          </div>
          {/* Watermark Icon */}
          <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-7xl text-emerald-500/5 select-none pointer-events-none">
            check_circle
          </span>
        </div>

        {/* Stok Menipis */}
        <div
          onClick={() => setActiveTab('Menipis')}
          className={`bg-white rounded-3xl p-5 border-l-4 border-l-amber-500 cursor-pointer transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
            activeTab === 'Menipis'
              ? 'border-amber-500 shadow-md ring-2 ring-amber-500/20'
              : 'border-[#ede7df] shadow-[0px_4px_20px_rgba(162,210,255,0.12)] hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Stok Menipis
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">warning</span>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-amber-700 tracking-tight">{lowCount}</h3>
            <p className="text-xs text-[#72787f] mt-1">Perlu pemesanan ulang segera</p>
          </div>
        </div>

        {/* Stok Habis */}
        <div
          onClick={() => setActiveTab('Habis')}
          className={`bg-white rounded-3xl p-5 border-l-4 border-l-[#ba1a1a] cursor-pointer transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
            activeTab === 'Habis'
              ? 'border-[#ba1a1a] shadow-md ring-2 ring-[#ba1a1a]/20'
              : 'border-[#ede7df] shadow-[0px_4px_20px_rgba(162,210,255,0.12)] hover:border-red-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#93000a]">
              Stok Habis
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">error</span>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-[#ba1a1a] tracking-tight">{outCount}</h3>
            <p className="text-xs text-[#72787f] mt-1">Produk tidak dapat dijual</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-[#f3ede4] p-1.5 rounded-2xl w-fit border border-[#ede7df]">
        {(['Semua', 'Aman', 'Menipis', 'Habis'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab
                ? 'bg-[#30628a] text-white shadow-xs'
                : 'text-[#41474e] hover:text-[#1d1b16] hover:bg-white/50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Inventory Table Container */}
      <div className="bg-white rounded-3xl p-6 border border-[#ede7df] shadow-[0px_4px_20px_rgba(162,210,255,0.12)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#ede7df] text-xs font-bold uppercase tracking-wider text-[#72787f]">
                <th className="pb-3 px-3">Produk</th>
                <th className="pb-3 px-3">Kategori</th>
                <th className="pb-3 px-3 font-mono">SKU</th>
                <th className="pb-3 px-3 text-center">Sisa Stok</th>
                <th className="pb-3 px-3 text-center">Status</th>
                <th className="pb-3 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3ede4]">
              {filteredProducts.map((p) => {
                const isOutOfStock = p.stock <= 0;
                const isLowStock = p.stock > 0 && p.stock <= p.minStockThreshold;

                return (
                  <tr key={p.id} className="hover:bg-[#f9f3ea]/60 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-10 h-10 rounded-xl object-cover border border-[#ede7df]"
                        />
                        <div>
                          <p className="font-bold text-[#1d1b16] text-sm">{p.name}</p>
                          <span className="text-xs text-[#72787f]">
                            Min. batas: {p.minStockThreshold} pcs
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-xs font-semibold text-[#41474e]">
                      {p.category}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-xs font-bold text-[#30628a]">
                      {p.sku}
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold text-sm">
                      <span
                        className={
                          isOutOfStock
                            ? 'text-[#ba1a1a]'
                            : isLowStock
                            ? 'text-amber-700'
                            : 'text-[#1d1b16]'
                        }
                      >
                        {p.stock}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          isOutOfStock
                            ? 'bg-[#ffdad6] text-[#93000a]'
                            : isLowStock
                            ? 'bg-[#feebd0] text-[#8c4f00]'
                            : 'bg-emerald-50 text-emerald-800'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isOutOfStock
                              ? 'bg-[#ba1a1a]'
                              : isLowStock
                              ? 'bg-amber-600'
                              : 'bg-emerald-600'
                          }`}
                        />
                        {isOutOfStock ? 'Habis' : isLowStock ? 'Menipis' : 'Aman'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setRestockModalProduct(p)}
                          className="px-3 py-1.5 rounded-xl bg-[#bee1ff] hover:bg-[#a2d2ff] text-[#001e2f] font-bold text-xs flex items-center gap-1 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[14px]">add</span>
                          <span>Restok</span>
                        </button>
                        <button
                          onClick={() => setAdjustModalProduct(p)}
                          className="px-3 py-1.5 rounded-xl bg-[#f3ede4] hover:bg-[#ede7df] text-[#41474e] font-bold text-xs flex items-center gap-1 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[14px]">tune</span>
                          <span>Ubah</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="pt-4 mt-3 border-t border-[#ede7df] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#72787f]">
          <span>
            Menampilkan 1-{filteredProducts.length} dari {products.length} produk
          </span>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1 rounded-lg bg-[#30628a] text-white font-bold">1</button>
            <button className="px-3 py-1 rounded-lg bg-[#f3ede4] text-[#41474e] font-bold hover:bg-[#ede7df]">
              2
            </button>
            <button className="px-3 py-1 rounded-lg bg-[#f3ede4] text-[#41474e] font-bold hover:bg-[#ede7df]">
              3
            </button>
          </div>
        </div>
      </div>

      {/* Restock Modal Single */}
      {restockModalProduct && (
        <RestockDialog
          product={restockModalProduct}
          onClose={() => setRestockModalProduct(null)}
          onConfirm={(qty, note) => {
            restockProduct(restockModalProduct.id, qty, note);
            setRestockModalProduct(null);
          }}
        />
      )}

      {/* Adjust Modal Single */}
      {adjustModalProduct && (
        <AdjustDialog
          product={adjustModalProduct}
          onClose={() => setAdjustModalProduct(null)}
          onConfirm={(newStock, note) => {
            adjustStock(adjustModalProduct.id, newStock, note);
            setAdjustModalProduct(null);
          }}
        />
      )}

      {/* General Restock Modal */}
      {isGeneralRestockOpen && (
        <GeneralStockDialog
          mode="restock"
          products={products}
          onClose={() => setIsGeneralRestockOpen(false)}
          onRestock={(id, qty, note) => {
            restockProduct(id, qty, note);
            setIsGeneralRestockOpen(false);
          }}
        />
      )}

      {/* General Adjust Modal */}
      {isGeneralAdjustOpen && (
        <GeneralStockDialog
          mode="adjust"
          products={products}
          onClose={() => setIsGeneralAdjustOpen(false)}
          onAdjust={(id, newStock, note) => {
            adjustStock(id, newStock, note);
            setIsGeneralAdjustOpen(false);
          }}
        />
      )}
    </div>
  );
};

interface RestockDialogProps {
  product: Product;
  onClose: () => void;
  onConfirm: (qty: number, note: string) => void;
}

const RestockDialog: React.FC<RestockDialogProps> = ({ product, onClose, onConfirm }) => {
  const [qty, setQty] = useState('20');
  const [note, setNote] = useState('Penerimaan stok dari supplier');

  const addAmount = parseInt(qty) || 0;
  const estimatedNewStock = product.stock + addAmount;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#ede7df] shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-[#ede7df]">
          <h2 className="text-lg font-bold text-[#1d1b16]">Input Stok Masuk</h2>
          <button onClick={onClose} className="p-1 text-[#72787f]">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-3 bg-[#f9f3ea] rounded-2xl border border-[#ede7df] flex items-center gap-3">
          <img
            src={product.image}
            alt={product.name}
            className="w-12 h-12 rounded-xl object-cover"
          />
          <div>
            <h4 className="font-bold text-sm text-[#1d1b16]">{product.name}</h4>
            <p className="text-xs text-[#72787f] font-mono">{product.sku}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-[#f3ede4] text-center">
            <span className="text-[11px] text-[#72787f] block">Stok Saat Ini</span>
            <span className="text-lg font-bold text-[#1d1b16]">{product.stock}</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-center">
            <span className="text-[11px] text-emerald-800 block">Stok Baru Nanti</span>
            <span className="text-lg font-bold text-emerald-700">{estimatedNewStock}</span>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-[#41474e] block mb-1">Jumlah Masuk (Pcs)</label>
          <input
            type="number"
            min="1"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#f9f3ea] border border-[#ede7df] rounded-xl text-base font-bold text-[#1d1b16] outline-none focus:border-[#30628a]"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-[#41474e] block mb-1">Catatan</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3.5 py-2 bg-[#f9f3ea] border border-[#ede7df] rounded-xl text-xs text-[#1d1b16] outline-none"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#ede7df]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full bg-[#f3ede4] text-[#41474e] text-xs font-bold"
          >
            Batal
          </button>
          <button
            onClick={() => onConfirm(addAmount, note)}
            disabled={addAmount <= 0}
            className="px-6 py-2 rounded-full bg-[#30628a] text-white text-xs font-bold shadow-md hover:bg-[#275b82]"
          >
            Tambah Stok
          </button>
        </div>
      </div>
    </div>
  );
};

interface AdjustDialogProps {
  product: Product;
  onClose: () => void;
  onConfirm: (newStock: number, note: string) => void;
}

const AdjustDialog: React.FC<AdjustDialogProps> = ({ product, onClose, onConfirm }) => {
  const [newStockStr, setNewStockStr] = useState(product.stock.toString());
  const [note, setNote] = useState('Stock opname fisik toko');

  const newStockNum = parseInt(newStockStr) || 0;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#ede7df] shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-[#ede7df]">
          <h2 className="text-lg font-bold text-[#1d1b16]">Penyesuaian Stok (Opname)</h2>
          <button onClick={onClose} className="p-1 text-[#72787f]">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-3 bg-[#f9f3ea] rounded-2xl border border-[#ede7df] flex items-center gap-3">
          <img
            src={product.image}
            alt={product.name}
            className="w-12 h-12 rounded-xl object-cover"
          />
          <div>
            <h4 className="font-bold text-sm text-[#1d1b16]">{product.name}</h4>
            <p className="text-xs text-[#72787f] font-mono">{product.sku}</p>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-[#41474e] block mb-1">
            Jumlah Stok Fisik Sebenarnya
          </label>
          <input
            type="number"
            min="0"
            value={newStockStr}
            onChange={(e) => setNewStockStr(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#f9f3ea] border border-[#ede7df] rounded-xl text-base font-bold text-[#1d1b16] outline-none focus:border-[#30628a]"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-[#41474e] block mb-1">Alasan Penyesuaian</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3.5 py-2 bg-[#f9f3ea] border border-[#ede7df] rounded-xl text-xs text-[#1d1b16] outline-none"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#ede7df]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full bg-[#f3ede4] text-[#41474e] text-xs font-bold"
          >
            Batal
          </button>
          <button
            onClick={() => onConfirm(newStockNum, note)}
            className="px-6 py-2 rounded-full bg-[#30628a] text-white text-xs font-bold shadow-md hover:bg-[#275b82]"
          >
            Simpan Stok
          </button>
        </div>
      </div>
    </div>
  );
};

interface GeneralStockDialogProps {
  mode: 'restock' | 'adjust';
  products: Product[];
  onClose: () => void;
  onRestock?: (id: string, qty: number, note: string) => void;
  onAdjust?: (id: string, newStock: number, note: string) => void;
}

const GeneralStockDialog: React.FC<GeneralStockDialogProps> = ({
  mode,
  products,
  onClose,
  onRestock,
  onAdjust,
}) => {
  const [selectedProdId, setSelectedProdId] = useState(products[0]?.id || '');
  const [amount, setAmount] = useState('10');
  const [note, setNote] = useState(
    mode === 'restock' ? 'Penerimaan stok berkala' : 'Stock opname gudang'
  );

  const selectedProd = products.find((p) => p.id === selectedProdId) || products[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProd) return;
    const num = parseInt(amount) || 0;
    if (mode === 'restock' && onRestock) {
      onRestock(selectedProd.id, num, note);
    } else if (mode === 'adjust' && onAdjust) {
      onAdjust(selectedProd.id, num, note);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-[#ede7df] shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-[#ede7df]">
          <h2 className="text-lg font-bold text-[#1d1b16]">
            {mode === 'restock' ? 'Input Stok Masuk' : 'Update Stok (Opname)'}
          </h2>
          <button onClick={onClose} className="p-1 text-[#72787f]">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#41474e] block mb-1">Pilih Produk</label>
            <select
              value={selectedProdId}
              onChange={(e) => setSelectedProdId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#f9f3ea] border border-[#ede7df] rounded-xl text-sm font-semibold text-[#1d1b16] outline-none"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku}) - Sisa: {p.stock}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-[#41474e] block mb-1">
              {mode === 'restock' ? 'Jumlah Tambahan (+Pcs)' : 'Jumlah Stok Baru'}
            </label>
            <input
              type="number"
              min="0"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#f9f3ea] border border-[#ede7df] rounded-xl text-base font-bold text-[#1d1b16] outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#41474e] block mb-1">Catatan</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#f9f3ea] border border-[#ede7df] rounded-xl text-xs text-[#1d1b16] outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#ede7df]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full bg-[#f3ede4] text-[#41474e] text-xs font-bold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-full bg-[#30628a] text-white text-xs font-bold shadow-md hover:bg-[#275b82]"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
