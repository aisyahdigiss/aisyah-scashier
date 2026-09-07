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
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#292524] tracking-tight">
            Detail Stok & Inventaris
          </h1>
          <p className="text-sm text-[#78716c] mt-1">
            Pantau pergerakan stok dan kelola persediaan barang secara real-time.
          </p>
        </div>

        {/* Top Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsGeneralRestockOpen(true)}
            className="px-5 py-2.5 rounded-full bg-[#fef9c3] hover:bg-[#fef08a] text-[#713f12] font-bold text-sm flex items-center gap-2 shadow-2xs transition-all active:scale-95 border border-[#fde68a]"
          >
            <span className="material-symbols-outlined text-[20px]">add_box</span>
            <span>+ Input Stok Masuk</span>
          </button>
          <button
            onClick={() => setIsGeneralAdjustOpen(true)}
            className="px-5 py-2.5 rounded-full bg-[#fffdfa] hover:bg-[#fef9c3] text-[#713f12] font-bold text-sm flex items-center gap-2 border border-[#ede5d8] transition-all active:scale-95 shadow-2xs"
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
          className={`bg-[#fffdfa]/95 backdrop-blur-xs rounded-3xl p-5 border cursor-pointer transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
            activeTab === 'Aman'
              ? 'border-[#eab308] shadow-md ring-2 ring-[#fef9c3]'
              : 'border-[#ede5d8] shadow-[0px_4px_20px_rgba(168,153,128,0.1)] hover:border-[#dfd5c3]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#78716c]">
              Stok Aman
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#fef9c3] text-[#713f12] flex items-center justify-center border border-[#fde68a]">
              <span className="material-symbols-outlined text-[22px]">check_circle</span>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-[#292524] tracking-tight">{safeCount}</h3>
            <p className="text-xs text-[#78716c] mt-1">Persediaan dalam batas ideal</p>
          </div>
          <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-7xl text-[#713f12]/5 select-none pointer-events-none">
            check_circle
          </span>
        </div>

        {/* Stok Menipis */}
        <div
          onClick={() => setActiveTab('Menipis')}
          className={`bg-[#fffdfa]/95 backdrop-blur-xs rounded-3xl p-5 border cursor-pointer transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
            activeTab === 'Menipis'
              ? 'border-[#eab308] shadow-md ring-2 ring-[#fef9c3]'
              : 'border-[#ede5d8] shadow-[0px_4px_20px_rgba(168,153,128,0.1)] hover:border-[#dfd5c3]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#78716c]">
              Stok Menipis
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#fef9c3] text-[#713f12] flex items-center justify-center border border-[#fde68a]">
              <span className="material-symbols-outlined text-[22px]">warning</span>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-[#292524] tracking-tight">{lowCount}</h3>
            <p className="text-xs text-[#78716c] mt-1">Perlu pemesanan ulang segera</p>
          </div>
          <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-7xl text-[#713f12]/5 select-none pointer-events-none">
            warning
          </span>
        </div>

        {/* Stok Habis */}
        <div
          onClick={() => setActiveTab('Habis')}
          className={`bg-[#fffdfa]/95 backdrop-blur-xs rounded-3xl p-5 border cursor-pointer transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
            activeTab === 'Habis'
              ? 'border-[#eab308] shadow-md ring-2 ring-[#fef9c3]'
              : 'border-[#ede5d8] shadow-[0px_4px_20px_rgba(168,153,128,0.1)] hover:border-[#dfd5c3]'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#78716c]">
              Stok Habis
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#fef9c3] text-[#713f12] flex items-center justify-center border border-[#fde68a]">
              <span className="material-symbols-outlined text-[22px]">error</span>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-extrabold text-[#292524] tracking-tight">{outCount}</h3>
            <p className="text-xs text-[#78716c] mt-1">Produk perlu diisi ulang</p>
          </div>
          <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-7xl text-[#713f12]/5 select-none pointer-events-none">
            error
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-[#f7f3eb] p-1.5 rounded-2xl w-fit border border-[#ede5d8]">
        {(['Semua', 'Aman', 'Menipis', 'Habis'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab
                ? 'bg-[#fef9c3] text-[#713f12] shadow-2xs border border-[#fde68a]'
                : 'text-[#78716c] hover:text-[#292524] hover:bg-white/50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Inventory Table Container */}
      <div className="bg-[#fffdfa]/95 backdrop-blur-xs rounded-3xl p-6 border border-[#ede5d8] shadow-[0px_4px_20px_rgba(168,153,128,0.1)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#ede5d8] text-xs font-bold uppercase tracking-wider text-[#78716c]">
                <th className="pb-3 px-3">Produk</th>
                <th className="pb-3 px-3">Kategori</th>
                <th className="pb-3 px-3 font-mono">SKU</th>
                <th className="pb-3 px-3 text-center">Sisa Stok</th>
                <th className="pb-3 px-3 text-center">Status</th>
                <th className="pb-3 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f7f3eb]">
              {filteredProducts.map((p) => {
                const isOutOfStock = p.stock <= 0;
                const isLowStock = p.stock > 0 && p.stock <= p.minStockThreshold;

                return (
                  <tr key={p.id} className="hover:bg-[#fdfbf7] transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-10 h-10 rounded-xl object-cover border border-[#ede5d8]"
                        />
                        <div>
                          <p className="font-bold text-[#292524] text-sm">{p.name}</p>
                          <span className="text-xs text-[#78716c]">
                            Min. batas: {p.minStockThreshold} pcs
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-xs font-semibold text-[#57534e]">
                      {p.category}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-xs font-bold text-[#713f12]">
                      {p.sku}
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold text-sm">
                      <span className="text-[#292524]">{p.stock}</span>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          isOutOfStock
                            ? 'bg-stone-200 text-stone-700 border border-stone-300'
                            : isLowStock
                            ? 'bg-[#fef9c3] text-[#713f12] border border-[#fde68a]'
                            : 'bg-white/95 text-[#292524] border border-[#ede5d8]'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#eab308]" />
                        {isOutOfStock ? 'Habis' : isLowStock ? 'Menipis' : 'Aman'}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setRestockModalProduct(p)}
                          className="px-3 py-1.5 rounded-xl bg-[#fef9c3] hover:bg-[#fef08a] text-[#713f12] font-bold text-xs flex items-center gap-1 transition-colors border border-[#fde68a]"
                        >
                          <span className="material-symbols-outlined text-[14px]">add</span>
                          <span>Restok</span>
                        </button>
                        <button
                          onClick={() => setAdjustModalProduct(p)}
                          className="px-3 py-1.5 rounded-xl bg-[#f7f3eb] hover:bg-[#eee7d8] text-[#57534e] font-bold text-xs flex items-center gap-1 transition-colors border border-[#ede5d8]"
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
        <div className="pt-4 mt-3 border-t border-[#ede5d8] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#78716c]">
          <span>
            Menampilkan 1-{filteredProducts.length} dari {products.length} produk
          </span>
          <div className="flex items-center gap-1">
            <button className="px-3 py-1 rounded-lg bg-[#fef9c3] text-[#713f12] font-bold border border-[#fde68a]">1</button>
            <button className="px-3 py-1 rounded-lg bg-[#f7f3eb] text-[#57534e] font-bold hover:bg-[#eee7d8] border border-[#ede5d8]">
              2
            </button>
            <button className="px-3 py-1 rounded-lg bg-[#f7f3eb] text-[#57534e] font-bold hover:bg-[#eee7d8] border border-[#ede5d8]">
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
    <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-[#fffdfa] rounded-3xl p-6 max-w-md w-full border border-[#ede5d8] shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-[#ede5d8]">
          <h2 className="text-lg font-bold text-[#292524]">Input Stok Masuk</h2>
          <button onClick={onClose} className="p-1 text-[#78716c] hover:bg-[#f7f3eb] rounded-full">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-3 bg-[#fdfbf7] rounded-2xl border border-[#ede5d8] flex items-center gap-3">
          <img
            src={product.image}
            alt={product.name}
            className="w-12 h-12 rounded-xl object-cover border border-[#ede5d8]"
          />
          <div>
            <h4 className="font-bold text-sm text-[#292524]">{product.name}</h4>
            <p className="text-xs text-[#713f12] font-mono">{product.sku}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-[#f7f3eb] text-center border border-[#ede5d8]">
            <span className="text-[11px] text-[#78716c] block">Stok Saat Ini</span>
            <span className="text-lg font-bold text-[#292524]">{product.stock}</span>
          </div>
          <div className="p-3 rounded-xl bg-[#fef9c3] text-center border border-[#fde68a]">
            <span className="text-[11px] text-[#713f12] block">Stok Baru Nanti</span>
            <span className="text-lg font-bold text-[#713f12]">{estimatedNewStock}</span>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-[#57534e] block mb-1">Jumlah Masuk (Pcs)</label>
          <input
            type="number"
            min="1"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#fdfbf7] border border-[#ede5d8] rounded-xl text-base font-bold text-[#292524] outline-none focus:border-[#eab308]"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-[#57534e] block mb-1">Catatan</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3.5 py-2 bg-[#fdfbf7] border border-[#ede5d8] rounded-xl text-xs text-[#292524] outline-none"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#ede5d8]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full bg-[#f7f3eb] text-[#57534e] text-xs font-bold border border-[#ede5d8]"
          >
            Batal
          </button>
          <button
            onClick={() => onConfirm(addAmount, note)}
            disabled={addAmount <= 0}
            className="px-6 py-2 rounded-full bg-[#fef9c3] hover:bg-[#fef08a] text-[#713f12] text-xs font-bold shadow-2xs border border-[#fde68a] disabled:opacity-50"
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
    <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-[#fffdfa] rounded-3xl p-6 max-w-md w-full border border-[#ede5d8] shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-[#ede5d8]">
          <h2 className="text-lg font-bold text-[#292524]">Penyesuaian Stok (Opname)</h2>
          <button onClick={onClose} className="p-1 text-[#78716c] hover:bg-[#f7f3eb] rounded-full">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-3 bg-[#fdfbf7] rounded-2xl border border-[#ede5d8] flex items-center gap-3">
          <img
            src={product.image}
            alt={product.name}
            className="w-12 h-12 rounded-xl object-cover border border-[#ede5d8]"
          />
          <div>
            <h4 className="font-bold text-sm text-[#292524]">{product.name}</h4>
            <p className="text-xs text-[#713f12] font-mono">{product.sku}</p>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-[#57534e] block mb-1">
            Jumlah Stok Fisik Sebenarnya
          </label>
          <input
            type="number"
            min="0"
            value={newStockStr}
            onChange={(e) => setNewStockStr(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#fdfbf7] border border-[#ede5d8] rounded-xl text-base font-bold text-[#292524] outline-none focus:border-[#eab308]"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-[#57534e] block mb-1">Alasan Penyesuaian</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3.5 py-2 bg-[#fdfbf7] border border-[#ede5d8] rounded-xl text-xs text-[#292524] outline-none"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#ede5d8]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full bg-[#f7f3eb] text-[#57534e] text-xs font-bold border border-[#ede5d8]"
          >
            Batal
          </button>
          <button
            onClick={() => onConfirm(newStockNum, note)}
            className="px-6 py-2 rounded-full bg-[#fef9c3] hover:bg-[#fef08a] text-[#713f12] text-xs font-bold shadow-2xs border border-[#fde68a]"
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
    <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-[#fffdfa] rounded-3xl p-6 max-w-md w-full border border-[#ede5d8] shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-[#ede5d8]">
          <h2 className="text-lg font-bold text-[#292524]">
            {mode === 'restock' ? 'Input Stok Masuk' : 'Update Stok (Opname)'}
          </h2>
          <button onClick={onClose} className="p-1 text-[#78716c] hover:bg-[#f7f3eb] rounded-full">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#57534e] block mb-1">Pilih Produk</label>
            <select
              value={selectedProdId}
              onChange={(e) => setSelectedProdId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#fdfbf7] border border-[#ede5d8] rounded-xl text-sm font-semibold text-[#292524] outline-none focus:border-[#eab308]"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku}) - Sisa: {p.stock}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-[#57534e] block mb-1">
              {mode === 'restock' ? 'Jumlah Tambahan (+Pcs)' : 'Jumlah Stok Baru'}
            </label>
            <input
              type="number"
              min="0"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#fdfbf7] border border-[#ede5d8] rounded-xl text-base font-bold text-[#292524] outline-none focus:border-[#eab308]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#57534e] block mb-1">Catatan</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2 bg-[#fdfbf7] border border-[#ede5d8] rounded-xl text-xs text-[#292524] outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#ede5d8]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full bg-[#f7f3eb] text-[#57534e] text-xs font-bold border border-[#ede5d8]"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-full bg-[#fef9c3] hover:bg-[#fef08a] text-[#713f12] text-xs font-bold shadow-2xs border border-[#fde68a]"
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
