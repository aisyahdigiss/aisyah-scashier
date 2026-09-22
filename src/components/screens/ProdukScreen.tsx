import React, { useState, useMemo } from 'react';
import { usePOS } from '../../context/POSContext';
import { Product } from '../../types';
import { BarcodeScannerModal } from '../modals/BarcodeScannerModal';

interface ProductModalProps {
  product?: Product | null;
  onClose: () => void;
}

export const ProdukScreen: React.FC = () => {
  const {
    products,
    categories,
    deleteProduct,
    searchQuery,
  } = usePOS();

  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [stockStatusFilter, setStockStatusFilter] = useState<string>('Semua');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isBarcodeSearchOpen, setIsBarcodeSearchOpen] = useState<boolean>(false);
  const [barcodeFilterQuery, setBarcodeFilterQuery] = useState<string>('');

  const formatRupiah = (val: number) => `Rp ${val.toLocaleString('id-ID')}`;

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat =
        selectedCategory === 'Semua' ||
        p.category.toLowerCase() === selectedCategory.toLowerCase();

      const q = searchQuery.toLowerCase();
      const matchSearch =
        searchQuery === '' ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.barcode && p.barcode.toLowerCase().includes(q));

      const matchBarcodeFilter =
        barcodeFilterQuery === '' ||
        (p.barcode && p.barcode.toLowerCase() === barcodeFilterQuery.toLowerCase()) ||
        p.sku.toLowerCase() === barcodeFilterQuery.toLowerCase();

      let matchStock = true;
      if (stockStatusFilter === 'Aman') {
        matchStock = p.stock > p.minStockThreshold;
      } else if (stockStatusFilter === 'Menipis') {
        matchStock = p.stock > 0 && p.stock <= p.minStockThreshold;
      } else if (stockStatusFilter === 'Habis') {
        matchStock = p.stock === 0;
      }

      return matchCat && matchSearch && matchBarcodeFilter && matchStock;
    });
  }, [products, selectedCategory, searchQuery, barcodeFilterQuery, stockStatusFilter]);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#292524] tracking-tight">
            Manajemen Produk
          </h1>
          <p className="text-sm text-[#78716c] mt-1">
            Kelola daftar produk, stok persediaan, dan harga jual barang toko dengan mudah.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setIsBarcodeSearchOpen(true)}
            className="px-4 py-2.5 rounded-full bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-sm flex items-center gap-2 shadow-xs transition-all active:scale-95 shrink-0"
            title="Scan barcode produk untuk mencari & memfilter barang"
          >
            <span className="material-symbols-outlined text-[20px]">barcode_scanner</span>
            <span>Scan Cek Produk</span>
          </button>

          <button
            onClick={handleAdd}
            className="px-5 py-2.5 rounded-full bg-[#fef9c3] hover:bg-[#fef08a] text-[#713f12] font-bold text-sm flex items-center gap-2 shadow-2xs transition-all active:scale-95 shrink-0 border border-[#fde68a]"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span>Tambah Produk</span>
          </button>
        </div>
      </div>

      {/* Active Barcode Filter Notification */}
      {barcodeFilterQuery && (
        <div className="bg-[#e0f2fe] border-2 border-[#bae6fd] p-3 rounded-2xl flex items-center justify-between gap-3 text-[#0369a1] animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px]">filter_alt</span>
            <span className="text-xs font-bold">
              Filter Barcode Aktif:{' '}
              <strong className="font-mono bg-white px-2 py-0.5 rounded border border-[#bae6fd] text-[#0f172a]">
                {barcodeFilterQuery}
              </strong>
            </span>
          </div>
          <button
            type="button"
            onClick={() => setBarcodeFilterQuery('')}
            className="px-3 py-1 bg-white hover:bg-stone-100 rounded-xl text-xs font-bold text-[#0369a1] border border-[#bae6fd] shadow-2xs"
          >
            Hapus Filter Barcode
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-[#fffdfa]/95 backdrop-blur-xs p-4 rounded-3xl border border-[#ede5d8] shadow-[0px_4px_20px_rgba(168,153,128,0.08)] flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-0">
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-[#78716c]">Kategori:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-[#fdfbf7] border border-[#ede5d8] text-xs font-semibold text-[#292524] rounded-xl px-3 py-2 outline-none focus:border-[#eab308]"
            >
              <option value="Semua">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-[#78716c]">Status Stok:</label>
            <select
              value={stockStatusFilter}
              onChange={(e) => setStockStatusFilter(e.target.value)}
              className="bg-[#fdfbf7] border border-[#ede5d8] text-xs font-semibold text-[#292524] rounded-xl px-3 py-2 outline-none focus:border-[#eab308]"
            >
              <option value="Semua">Semua Status</option>
              <option value="Aman">Stok Aman (&gt; threshold)</option>
              <option value="Menipis">Stok Menipis (Kritis)</option>
              <option value="Habis">Stok Habis (0)</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-[#78716c] font-medium">
          Menampilkan <strong className="text-[#292524]">{filteredProducts.length}</strong> dari {products.length} produk
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-[#fffdfa]/80 rounded-3xl p-12 text-center border border-[#ede5d8]">
          <span className="material-symbols-outlined text-5xl text-[#854d0e] mb-3">inventory_2</span>
          <h3 className="text-lg font-bold text-[#292524]">Tidak ada produk yang cocok</h3>
          <p className="text-xs text-[#78716c] mt-1">Coba sesuaikan filter pencarian atau kategori.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredProducts.map((product) => {
            const isOutOfStock = product.stock <= 0;
            const isLowStock = product.stock > 0 && product.stock <= product.minStockThreshold;

            return (
              <div
                key={product.id}
                className="bg-[#fffdfa]/95 backdrop-blur-xs rounded-3xl p-4 border border-[#ede5d8] shadow-[0px_4px_20px_rgba(168,153,128,0.1)] flex flex-col justify-between group hover:shadow-[0px_8px_24px_rgba(168,153,128,0.18)] hover:border-[#dfd5c3] transition-all duration-200"
              >
                <div>
                  {/* Image container */}
                  <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-[#f7f3eb] mb-3 border border-[#ede5d8]">
                    <img
                      src={product.image}
                      alt={product.name}
                      className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                        isOutOfStock ? 'grayscale-[50%]' : ''
                      }`}
                    />

                    {/* Stock status pill */}
                    <div className="absolute top-2.5 right-2.5">
                      {isOutOfStock ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-stone-200 text-stone-700 border border-stone-300 shadow-xs">
                          HABIS
                        </span>
                      ) : isLowStock ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#fef9c3] text-[#713f12] border border-[#fde68a] shadow-2xs">
                          Menipis: {product.stock}
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/95 backdrop-blur-xs text-[#292524] border border-[#ede5d8] shadow-xs">
                          Tersedia: {product.stock}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-medium text-[#78716c] uppercase tracking-wider">
                        {product.sku}
                      </span>
                      <span className="text-[11px] font-bold text-[#713f12] bg-[#fef9c3] px-2 py-0.5 rounded-full border border-[#fde68a]">
                        {product.category}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-[#292524] leading-snug line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-lg font-extrabold text-[#713f12]">
                      {formatRupiah(product.price)}
                    </p>

                    {/* Barcode Badge */}
                    <div className="pt-1 flex items-center justify-between text-[11px] font-mono text-[#475569] bg-stone-100/90 px-2 py-1 rounded-xl border border-stone-200">
                      <span className="flex items-center gap-1.5 min-w-0">
                        <span className="material-symbols-outlined text-[15px] text-[#0284c7] shrink-0">barcode</span>
                        <span className="font-bold truncate">{product.barcode || product.sku}</span>
                      </span>
                      <span className="text-[10px] text-stone-400 font-sans font-medium shrink-0 ml-1">Barcode</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-4 mt-3 border-t border-[#f7f3eb]">
                  <button
                    onClick={() => handleEdit(product)}
                    className="py-2 px-3 rounded-xl bg-[#fef9c3] hover:bg-[#fef08a] text-[#713f12] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-[#fde68a] active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(product.id)}
                    className="py-2 px-3 rounded-xl bg-[#fdfbf7] hover:bg-rose-50 text-[#78716c] hover:text-rose-600 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-[#ede5d8] active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[16px]">delete</span>
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => {
            setIsModalOpen(false);
            setEditingProduct(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-[#fffdfa] rounded-3xl p-6 max-w-sm w-full border border-[#ede5d8] shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border border-amber-200">
              <span className="material-symbols-outlined text-2xl">delete_forever</span>
            </div>
            <div className="text-center">
              <h3 className="font-bold text-lg text-[#292524]">Hapus Produk?</h3>
              <p className="text-xs text-[#78716c] mt-1">
                Tindakan ini tidak dapat dibatalkan. Produk akan dihapus permanen dari sistem.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="py-2.5 rounded-xl bg-[#f7f3eb] text-[#57534e] font-bold text-xs hover:bg-[#eee7d8] border border-[#ede5d8]"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  deleteProduct(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="py-2.5 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 shadow-sm"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barcode Lookup & Search Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isBarcodeSearchOpen}
        onClose={() => setIsBarcodeSearchOpen(false)}
        mode="input"
        title="Scan Barcode Cek Produk"
        onScanCode={(code) => {
          setBarcodeFilterQuery(code);
        }}
      />
    </div>
  );
};

const ProductFormModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  const { categories, addProduct, updateProduct, showToast } = usePOS();

  const [name, setName] = useState(product?.name || '');
  const [sku, setSku] = useState(product?.sku || `SKU-${Math.floor(100 + Math.random() * 900)}`);
  const [barcode, setBarcode] = useState(
    product?.barcode || (product?.sku ? `899${Math.floor(100000000 + Math.random() * 900000000)}` : '')
  );
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [category, setCategory] = useState(product?.category || categories[0]?.name || 'Minuman Kopi');
  const [price, setPrice] = useState(product?.price?.toString() || '25000');
  const [stock, setStock] = useState(product?.stock?.toString() || '20');
  const [minThreshold, setMinThreshold] = useState(product?.minStockThreshold?.toString() || '10');
  const [image, setImage] = useState(
    product?.image ||
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDQKFTo1cMYTrVnSx6gA9lJCsxrUvyIZ_QvC87o0u7manpYH1hDDsAO7BgzqxQV32_lHhPhYDaf967o8XZdzmDVmlyL3-iLE9VE2PN2JiMBRM5_8eUtCdCwA7LmdFcFzj6t3cV4KjKd7AUHb3A1GSf6HWaBDQ4MQNgwQ3wxrpi-7T9dJVl3YsmHSN2PFP_EypUS7dymZ8fu99B0QIF7Qdd05jrEYyF_9H0txOqu3yEOaYnQYNNVn3t7bg'
  );

  const presetImages = [
    { label: 'Kopi Cup', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDQKFTo1cMYTrVnSx6gA9lJCsxrUvyIZ_QvC87o0u7manpYH1hDDsAO7BgzqxQV32_lHhPhYDaf967o8XZdzmDVmlyL3-iLE9VE2PN2JiMBRM5_8eUtCdCwA7LmdFcFzj6t3cV4KjKd7AUHb3A1GSf6HWaBDQ4MQNgwQ3wxrpi-7T9dJVl3YsmHSN2PFP_EypUS7dymZ8fu99B0QIF7Qdd05jrEYyF_9H0txOqu3yEOaYnQYNNVn3t7bg' },
    { label: 'Matcha Iced', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBV-N2Zl8mYlIkkx18ma6DgE5yrhMDNMKRV3BJpsYfKitSCxDVaodyKiAecgQsB8z03fLd4149vTid_F-lPmoCmbkjtdzeJM1oygceQbZ-bW_Gv-RpI2bIaVJFlJrKIF6-Do44PzVxokn1kpB905PEQ799HwN6iyAdZ13-9v4D6VgFZ6Qh02p3RcbwRRH1RiYpTKPUq04SusRsE4eFcMgnzLsEpiwSckoWQZswiFMV1pSNVNNFLHbWGsQ' },
    { label: 'Croissant', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHfnD7m2Fj8WpHM8aJmVcYkuzrhJjVQn7r44tR4C1lX37IEA4BN6Dgfc-cH8cvdwsK3PUzeNzLSlsCj9ZbW58VnYm2U1Rhtk2uZTI6O9fj5mO8efihRQaa5OqYUyyvh2STKXeTsU5NSeWuEwPQU7jtQAO2zlLIW2JBFxSSX52IyhJZw6QmDGfd_Ls0xXzBCD5TZL8y-G6gMo1hcDqYqmUUkKjElim8fmK-fW5kQCuQJ_rrIXEr8U2YRA' },
    { label: 'Buku ATK', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBm5Iu2JlBGTS56lMnJBZ6ordTCR-pDyaFpvonCeEOHoo2CRHIffmmRDvdP6WvUrmugPm4I7bEoMs7qx2gEMhTp8u5I-A8XaZP-AJ_l4OCx1AiecKmpAfY2vFKHxj8YTVmUtm5LrJuIMkGmR5zHi52MdblOHN1mZnJBeQ26ZkUfT6XwPVioyt-jX011Lqejxy-mDRdMLBjFL5hG2qiVbWuU4ObwfN8l8Kfg3LqFnYk4dCUSVcre02-VCw' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Nama produk tidak boleh kosong', 'warning');
      return;
    }
    const numPrice = parseFloat(price) || 0;
    const numStock = parseInt(stock) || 0;
    const numMin = parseInt(minThreshold) || 5;
    const finalBarcode = barcode.trim() || sku.trim() || `899${Date.now().toString().slice(-9)}`;

    if (product) {
      updateProduct(product.id, {
        name,
        sku,
        barcode: finalBarcode,
        category,
        price: numPrice,
        stock: numStock,
        minStockThreshold: numMin,
        image,
      });
    } else {
      addProduct({
        name,
        sku,
        barcode: finalBarcode,
        category,
        price: numPrice,
        stock: numStock,
        minStockThreshold: numMin,
        image,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-[#fffdfa] rounded-3xl p-6 max-w-lg w-full border border-[#ede5d8] shadow-2xl space-y-4 my-8 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-[#ede5d8]">
          <h2 className="text-xl font-bold text-[#292524]">
            {product ? 'Edit Produk' : 'Tambah Produk Baru'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-[#f7f3eb] text-[#78716c]">
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-bold text-[#57534e] block mb-1">Nama Produk</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Caramel Macchiato"
                className="w-full px-3.5 py-2.5 bg-[#fdfbf7] border border-[#ede5d8] rounded-xl text-sm font-semibold text-[#292524] outline-none focus:border-[#eab308]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#57534e] block mb-1">SKU / Kode Toko</label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="KOP-001"
                className="w-full px-3.5 py-2.5 bg-[#fdfbf7] border border-[#ede5d8] rounded-xl text-sm font-mono text-[#292524] outline-none focus:border-[#eab308]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-[#57534e]">Barcode Produk</label>
                <button
                  type="button"
                  onClick={() => setIsScannerOpen(true)}
                  className="text-[10px] font-bold text-[#0284c7] hover:text-[#0369a1] flex items-center gap-0.5"
                  title="Scan barcode produk fisik menggunakan kamera"
                >
                  <span className="material-symbols-outlined text-[13px]">barcode_scanner</span>
                  <span>Scan Kamera</span>
                </button>
              </div>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="899..."
                  className="flex-1 px-3.5 py-2.5 bg-[#fdfbf7] border border-[#ede5d8] rounded-xl text-sm font-mono font-bold text-[#292524] outline-none focus:border-[#eab308]"
                />
                <button
                  type="button"
                  onClick={() => setIsScannerOpen(true)}
                  className="px-2.5 py-2 rounded-xl bg-[#e0f2fe] text-[#0369a1] hover:bg-[#bae6fd] border border-[#bae6fd] text-xs font-bold flex items-center justify-center shrink-0"
                  title="Buka Kamera Barcode Scanner"
                >
                  <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#57534e] block mb-1">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#fdfbf7] border border-[#ede5d8] rounded-xl text-sm font-semibold text-[#292524] outline-none focus:border-[#eab308]"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#57534e] block mb-1">Harga Jual (Rp)</label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="35000"
                className="w-full px-3.5 py-2.5 bg-[#fdfbf7] border border-[#ede5d8] rounded-xl text-sm font-semibold text-[#292524] outline-none focus:border-[#eab308]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#57534e] block mb-1">Jumlah Stok Awal</label>
              <input
                type="number"
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="50"
                className="w-full px-3.5 py-2.5 bg-[#fdfbf7] border border-[#ede5d8] rounded-xl text-sm font-semibold text-[#292524] outline-none focus:border-[#eab308]"
              />
            </div>

            <div className="col-span-2">
              <label className="text-xs font-bold text-[#57534e] block mb-1">Batas Minimum Stok (Peringatan)</label>
              <input
                type="number"
                value={minThreshold}
                onChange={(e) => setMinThreshold(e.target.value)}
                placeholder="10"
                className="w-full px-3.5 py-2.5 bg-[#fdfbf7] border border-[#ede5d8] rounded-xl text-sm font-semibold text-[#292524] outline-none focus:border-[#eab308]"
              />
            </div>

            <div className="col-span-2">
              <label className="text-xs font-bold text-[#57534e] block mb-1">Pilih Gambar Sampel / URL</label>
              <div className="flex items-center gap-2 mb-2">
                {presetImages.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setImage(p.url)}
                    className={`flex-1 text-[11px] font-bold py-1.5 px-2 rounded-lg border transition-colors ${
                      image === p.url
                        ? 'bg-[#fef9c3] border-[#fde68a] text-[#713f12]'
                        : 'bg-[#fdfbf7] border-[#ede5d8] text-[#78716c]'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2 bg-[#fdfbf7] border border-[#ede5d8] rounded-xl text-xs text-[#78716c] outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#ede5d8]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full bg-[#f7f3eb] hover:bg-[#eee7d8] text-[#57534e] font-bold text-xs border border-[#ede5d8]"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#fef9c3] hover:bg-[#fef08a] text-[#713f12] font-bold text-xs shadow-2xs border border-[#fde68a] transition-all active:scale-95"
            >
              {product ? 'Simpan Perubahan' : 'Tambah Produk'}
            </button>
          </div>
        </form>

        {/* Input Scanner Modal */}
        <BarcodeScannerModal
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          mode="input"
          title="Scan Barcode untuk Produk"
          onScanCode={(code) => {
            setBarcode(code);
            if (!sku || sku.startsWith('SKU-')) {
              setSku(code);
            }
          }}
        />
      </div>
    </div>
  );
};
