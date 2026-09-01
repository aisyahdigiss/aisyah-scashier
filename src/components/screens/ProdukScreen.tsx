import React, { useState, useMemo } from 'react';
import { usePOS } from '../../context/POSContext';
import { Product } from '../../types';

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

  const formatRupiah = (val: number) => `Rp ${val.toLocaleString('id-ID')}`;

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat =
        selectedCategory === 'Semua' ||
        p.category.toLowerCase() === selectedCategory.toLowerCase();

      const matchSearch =
        searchQuery === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase());

      let matchStock = true;
      if (stockStatusFilter === 'Aman') {
        matchStock = p.stock > p.minStockThreshold;
      } else if (stockStatusFilter === 'Menipis') {
        matchStock = p.stock > 0 && p.stock <= p.minStockThreshold;
      } else if (stockStatusFilter === 'Habis') {
        matchStock = p.stock === 0;
      }

      return matchCat && matchSearch && matchStock;
    });
  }, [products, selectedCategory, searchQuery, stockStatusFilter]);

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
          <h1 className="text-2xl md:text-3xl font-bold text-[#1d1b16] tracking-tight">
            Manajemen Produk
          </h1>
          <p className="text-sm text-[#41474e] mt-1">
            Kelola daftar produk, stok persediaan, dan harga jual barang toko.
          </p>
        </div>

        <button
          onClick={handleAdd}
          className="px-5 py-2.5 rounded-full bg-[#30628a] hover:bg-[#275b82] text-white font-bold text-sm flex items-center gap-2 shadow-[0px_4px_16px_rgba(48,98,138,0.25)] transition-all active:scale-95 shrink-0"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span>Tambah Produk</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#ede7df] shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-0">
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-[#72787f]">Kategori:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-[#f9f3ea] border border-[#ede7df] text-xs font-semibold text-[#1d1b16] rounded-xl px-3 py-2 outline-none focus:border-[#30628a]"
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
            <label className="text-xs font-semibold text-[#72787f]">Status Stok:</label>
            <select
              value={stockStatusFilter}
              onChange={(e) => setStockStatusFilter(e.target.value)}
              className="bg-[#f9f3ea] border border-[#ede7df] text-xs font-semibold text-[#1d1b16] rounded-xl px-3 py-2 outline-none focus:border-[#30628a]"
            >
              <option value="Semua">Semua Status</option>
              <option value="Aman">Stok Aman (&gt; threshold)</option>
              <option value="Menipis">Stok Menipis (Kritis)</option>
              <option value="Habis">Stok Habis (0)</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-[#72787f] font-medium">
          Menampilkan <strong>{filteredProducts.length}</strong> dari {products.length} produk
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#ede7df]">
          <span className="material-symbols-outlined text-5xl text-[#72787f] mb-3">inventory_2</span>
          <h3 className="text-lg font-bold text-[#1d1b16]">Tidak ada produk yang cocok</h3>
          <p className="text-xs text-[#72787f] mt-1">Coba sesuaikan filter pencarian atau kategori.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredProducts.map((product) => {
            const isOutOfStock = product.stock <= 0;
            const isLowStock = product.stock > 0 && product.stock <= product.minStockThreshold;

            return (
              <div
                key={product.id}
                className="bg-white rounded-3xl p-4 border border-[#ede7df] shadow-[0px_4px_20px_rgba(162,210,255,0.12)] flex flex-col justify-between group hover:shadow-[0px_8px_24px_rgba(48,98,138,0.15)] hover:border-[#30628a]/40 transition-all duration-200"
              >
                <div>
                  {/* Image container */}
                  <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-[#f9f3ea] mb-3">
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
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#ffdad6] text-[#93000a] border border-[#ba1a1a]/20 shadow-xs">
                          HABIS
                        </span>
                      ) : isLowStock ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#feebd0] text-[#8c4f00] border border-[#ffb950]/30 shadow-xs">
                          Menipis: {product.stock}
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-xs text-[#1d1b16] border border-[#ede7df] shadow-xs">
                          Tersedia: {product.stock}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-medium text-[#72787f] uppercase tracking-wider">
                        {product.sku}
                      </span>
                      <span className="text-[11px] font-semibold text-[#30628a] bg-[#bee1ff]/50 px-2 py-0.5 rounded-full">
                        {product.category}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-[#1d1b16] leading-snug line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-lg font-bold text-[#30628a]">
                      {formatRupiah(product.price)}
                    </p>
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-4 mt-3 border-t border-[#f3ede4]">
                  <button
                    onClick={() => handleEdit(product)}
                    className="py-2 px-3 rounded-xl bg-[#f3ede4] hover:bg-[#ede7df] text-[#30628a] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(product.id)}
                    className="py-2 px-3 rounded-xl bg-[#ffdad6]/40 hover:bg-[#ffdad6] text-[#ba1a1a] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors active:scale-95"
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-[#ede7df] shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-2xl">delete_forever</span>
            </div>
            <div className="text-center">
              <h3 className="font-bold text-lg text-[#1d1b16]">Hapus Produk?</h3>
              <p className="text-xs text-[#72787f] mt-1">
                Tindakan ini tidak dapat dibatalkan. Produk akan dihapus permanen dari sistem.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="py-2.5 rounded-xl bg-[#f3ede4] text-[#41474e] font-bold text-xs hover:bg-[#ede7df]"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  deleteProduct(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="py-2.5 rounded-xl bg-[#ba1a1a] text-white font-bold text-xs hover:bg-[#93000a] shadow-sm"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ProductFormModal: React.FC<ProductModalProps> = ({ product, onClose }) => {
  const { categories, addProduct, updateProduct, showToast } = usePOS();

  const [name, setName] = useState(product?.name || '');
  const [sku, setSku] = useState(product?.sku || `SKU-${Math.floor(100 + Math.random() * 900)}`);
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

    if (product) {
      updateProduct(product.id, {
        name,
        sku,
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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-[#ede7df] shadow-2xl space-y-4 my-8 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-[#ede7df]">
          <h2 className="text-xl font-bold text-[#1d1b16]">
            {product ? 'Edit Produk' : 'Tambah Produk Baru'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-[#f3ede4] text-[#72787f]">
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-bold text-[#41474e] block mb-1">Nama Produk</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Caramel Macchiato"
                className="w-full px-3.5 py-2.5 bg-[#f9f3ea] border border-[#ede7df] rounded-xl text-sm font-semibold text-[#1d1b16] outline-none focus:border-[#30628a]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#41474e] block mb-1">SKU / Kode</label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="KOP-001"
                className="w-full px-3.5 py-2.5 bg-[#f9f3ea] border border-[#ede7df] rounded-xl text-sm font-mono text-[#1d1b16] outline-none focus:border-[#30628a]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#41474e] block mb-1">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#f9f3ea] border border-[#ede7df] rounded-xl text-sm font-semibold text-[#1d1b16] outline-none focus:border-[#30628a]"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#41474e] block mb-1">Harga Jual (Rp)</label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="35000"
                className="w-full px-3.5 py-2.5 bg-[#f9f3ea] border border-[#ede7df] rounded-xl text-sm font-semibold text-[#1d1b16] outline-none focus:border-[#30628a]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#41474e] block mb-1">Jumlah Stok Awal</label>
              <input
                type="number"
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="50"
                className="w-full px-3.5 py-2.5 bg-[#f9f3ea] border border-[#ede7df] rounded-xl text-sm font-semibold text-[#1d1b16] outline-none focus:border-[#30628a]"
              />
            </div>

            <div className="col-span-2">
              <label className="text-xs font-bold text-[#41474e] block mb-1">Batas Minimum Stok (Peringatan)</label>
              <input
                type="number"
                value={minThreshold}
                onChange={(e) => setMinThreshold(e.target.value)}
                placeholder="10"
                className="w-full px-3.5 py-2.5 bg-[#f9f3ea] border border-[#ede7df] rounded-xl text-sm font-semibold text-[#1d1b16] outline-none focus:border-[#30628a]"
              />
            </div>

            <div className="col-span-2">
              <label className="text-xs font-bold text-[#41474e] block mb-1">Pilih Gambar Sampel / URL</label>
              <div className="flex items-center gap-2 mb-2">
                {presetImages.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setImage(p.url)}
                    className={`flex-1 text-[11px] font-bold py-1.5 px-2 rounded-lg border transition-colors ${
                      image === p.url
                        ? 'bg-[#bee1ff] border-[#30628a] text-[#001e2f]'
                        : 'bg-[#f9f3ea] border-[#ede7df] text-[#41474e]'
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
                className="w-full px-3.5 py-2 bg-[#f9f3ea] border border-[#ede7df] rounded-xl text-xs text-[#72787f] outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#ede7df]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full bg-[#f3ede4] hover:bg-[#ede7df] text-[#41474e] font-bold text-xs"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#30628a] hover:bg-[#275b82] text-white font-bold text-xs shadow-md"
            >
              {product ? 'Simpan Perubahan' : 'Tambah Produk'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
