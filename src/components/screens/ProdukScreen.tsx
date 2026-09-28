import React, { useState, useMemo, useEffect } from 'react';
import { usePOS } from '../../context/POSContext';
import { Product } from '../../types';
import { BarcodeScannerModal } from '../modals/BarcodeScannerModal';
import { lookupBarcodeInfo, POPULAR_BARCODE_CATALOG, BarcodeCatalogItem } from '../../data/barcodeCatalog';

interface ProductModalProps {
  product?: Product | null;
  initialBarcode?: string;
  initialData?: Partial<Product> | null;
  onClose: () => void;
}

export const ProdukScreen: React.FC = () => {
  const {
    products,
    categories,
    deleteProduct,
    searchQuery,
    pendingNewProductBarcode,
    setPendingNewProductBarcode,
    pendingNewProductData,
    setPendingNewProductData,
    findProductByBarcode,
    playBeep,
    showToast,
  } = usePOS();

  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [stockStatusFilter, setStockStatusFilter] = useState<string>('Semua');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProductInitialBarcode, setNewProductInitialBarcode] = useState<string>('');
  const [newProductInitialData, setNewProductInitialData] = useState<Partial<Product> | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isBarcodeSearchOpen, setIsBarcodeSearchOpen] = useState<boolean>(false);
  const [isScanNewProductOpen, setIsScanNewProductOpen] = useState<boolean>(false);
  const [barcodeFilterQuery, setBarcodeFilterQuery] = useState<string>('');

  // Automatically open modal when pendingNewProductBarcode is triggered from elsewhere (e.g. Kasir or Scanner)
  useEffect(() => {
    if (pendingNewProductBarcode) {
      setNewProductInitialBarcode(pendingNewProductBarcode);
      setNewProductInitialData(pendingNewProductData || null);
      setEditingProduct(null);
      setIsModalOpen(true);
      setPendingNewProductBarcode(null);
      setPendingNewProductData(null);
    }
  }, [pendingNewProductBarcode, pendingNewProductData, setPendingNewProductBarcode, setPendingNewProductData]);

  // Global listener for USB / Bluetooth hardware barcode scanner gun
  useEffect(() => {
    let buffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if an input is active or a modal is currently open
      if (
        isModalOpen ||
        isBarcodeSearchOpen ||
        isScanNewProductOpen ||
        ['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)
      ) {
        return;
      }

      const now = Date.now();
      if (now - lastKeyTime > 150) {
        buffer = '';
      }
      lastKeyTime = now;

      if (e.key === 'Enter') {
        if (buffer.length >= 3) {
          e.preventDefault();
          const scannedCode = buffer.trim();
          buffer = '';
          const existing = findProductByBarcode(scannedCode);
          if (existing) {
            playBeep('success');
            showToast(`Produk "${existing.name}" ditemukan dari scanner!`, 'success');
            setEditingProduct(existing);
            setIsModalOpen(true);
          } else {
            playBeep('beep');
            showToast(`Barcode ${scannedCode} belum terdaftar. Membuka form barang baru...`, 'info');
            setNewProductInitialBarcode(scannedCode);
            setEditingProduct(null);
            setIsModalOpen(true);
          }
        }
        buffer = '';
      } else if (e.key.length === 1) {
        buffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, isBarcodeSearchOpen, isScanNewProductOpen, findProductByBarcode, playBeep, showToast]);

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
    setNewProductInitialBarcode('');
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setNewProductInitialBarcode('');
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

        {/* Strategic, non-cluttered action bar */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Primary Feature: Scan Barcode to automatically input new product */}
          <button
            type="button"
            onClick={() => setIsScanNewProductOpen(true)}
            className="px-4 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center gap-2 shadow-xs transition-all active:scale-95 shrink-0"
            title="Scan barcode produk fisik untuk otomatis membuka & mengisi form barang baru"
          >
            <span className="material-symbols-outlined text-[20px]">qr_code_scanner</span>
            <span>Scan Input Barang Baru</span>
          </button>

          {/* Secondary Feature: Check existing product barcode */}
          <button
            type="button"
            onClick={() => setIsBarcodeSearchOpen(true)}
            className="px-4 py-2.5 rounded-full bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-sm flex items-center gap-2 shadow-xs transition-all active:scale-95 shrink-0"
            title="Scan barcode produk untuk mencari & memfilter barang di daftar"
          >
            <span className="material-symbols-outlined text-[20px]">barcode_scanner</span>
            <span>Cek Barcode</span>
          </button>

          {/* Standard Add Product */}
          <button
            onClick={handleAdd}
            className="px-5 py-2.5 rounded-full bg-[#fef9c3] hover:bg-[#fef08a] text-[#713f12] font-bold text-sm flex items-center gap-2 shadow-2xs transition-all active:scale-95 shrink-0 border border-[#fde68a]"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span>Tambah Manual</span>
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
                      src={product.image || 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500&auto=format&fit=crop&q=80'}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        if (!target.src.includes('unsplash.com')) {
                          target.src = 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500&auto=format&fit=crop&q=80';
                        }
                      }}
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
          initialBarcode={newProductInitialBarcode}
          initialData={newProductInitialData}
          onClose={() => {
            setIsModalOpen(false);
            setEditingProduct(null);
            setNewProductInitialBarcode('');
            setNewProductInitialData(null);
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

      {/* Barcode Scanner to Automatically Input New Product */}
      <BarcodeScannerModal
        isOpen={isScanNewProductOpen}
        onClose={() => setIsScanNewProductOpen(false)}
        mode="new_product"
        title="Scan Barcode Barang Baru (Input Otomatis)"
        onScanCode={(code, prefill) => {
          const existing = findProductByBarcode(code);
          if (existing) {
            playBeep('success');
            showToast(`Produk "${existing.name}" sudah ada dengan barcode ini!`, 'info');
            setEditingProduct(existing);
            setNewProductInitialBarcode('');
            setNewProductInitialData(null);
            setIsModalOpen(true);
          } else {
            playBeep('success');
            showToast(
              prefill?.name
                ? `Kemasan "${prefill.name}" terdeteksi! Form barang baru siap diisi dengan foto asli.`
                : `Barcode ${code} terbaca! Form barang baru siap diisi.`,
              'success'
            );
            setNewProductInitialBarcode(code);
            setNewProductInitialData(prefill || null);
            setEditingProduct(null);
            setIsModalOpen(true);
          }
        }}
      />
    </div>
  );
};

const ProductFormModal: React.FC<ProductModalProps> = ({
  product,
  initialBarcode,
  initialData,
  onClose,
}) => {
  const { categories, addProduct, updateProduct, showToast, playBeep } = usePOS();

  const [name, setName] = useState(product?.name || initialData?.name || '');
  const [sku, setSku] = useState(
    product?.sku ||
      initialData?.sku ||
      (initialBarcode ? `SKU-${initialBarcode.slice(-6)}` : `SKU-${Math.floor(100 + Math.random() * 900)}`)
  );
  const [barcode, setBarcode] = useState(
    product?.barcode ||
      initialBarcode ||
      initialData?.barcode ||
      (product?.sku ? `899${Math.floor(100000000 + Math.random() * 900000000)}` : '')
  );
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [category, setCategory] = useState(
    product?.category || initialData?.category || categories[0]?.name || 'Minuman Kopi'
  );
  const [price, setPrice] = useState(
    product?.price?.toString() || initialData?.price?.toString() || '25000'
  );
  const [stock, setStock] = useState(product?.stock?.toString() || '20');
  const [minThreshold, setMinThreshold] = useState(product?.minStockThreshold?.toString() || '10');
  const [image, setImage] = useState(
    product?.image || initialData?.image || '/images/caramel_macchiato.jpg'
  );
  const [imageLoadError, setImageLoadError] = useState(false);
  const [isDetectingPackaging, setIsDetectingPackaging] = useState(false);
  const [detectedPackaging, setDetectedPackaging] = useState<BarcodeCatalogItem | null>(null);

  const presetImages = [
    {
      label: 'Beng-Beng 25g (Kemasan Asli)',
      url: 'https://images.openfoodfacts.org/images/products/899/600/135/5008/front_en.3.400.jpg',
      barcode: '8996001355008',
      name: 'Beng-Beng Wafer Cokelat Karamel Crispy 25g',
      category: 'Snack & Makanan',
      price: '3000',
    },
    {
      label: 'Indomie Mi Goreng 85g',
      url: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=500&auto=format&fit=crop&q=80',
      barcode: '8998866200227',
      name: 'Indomie Mi Goreng Spesial 85g',
      category: 'Snack & Makanan',
      price: '3500',
    },
    {
      label: 'Teh Botol Sosro Kotak',
      url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&auto=format&fit=crop&q=80',
      barcode: '8992775211116',
      name: 'Teh Botol Sosro Kotak 250ml',
      category: 'Minuman Kopi',
      price: '4000',
    },
    {
      label: 'Aqua Air Mineral 600ml',
      url: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=500&auto=format&fit=crop&q=80',
      barcode: '8992753111117',
      name: 'Aqua Air Mineral Botol 600ml',
      category: 'Minuman Kopi',
      price: '3500',
    },
    {
      label: 'Iced Caramel Macchiato',
      url: '/images/caramel_macchiato.jpg',
      name: 'Iced Caramel Macchiato',
      category: 'Minuman Kopi',
      price: '28000',
    },
    {
      label: 'Croissant Mentega',
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHfnD7m2Fj8WpHM8aJmVcYkuzrhJjVQn7r44tR4C1lX37IEA4BN6Dgfc-cH8cvdwsK3PUzeNzLSlsCj9ZbW58VnYm2U1Rhtk2uZTI6O9fj5mO8efihRQaa5OqYUyyvh2STKXeTsU5NSeWuEwPQU7jtQAO2zlLIW2JBFxSSX52IyhJZw6QmDGfd_Ls0xXzBCD5TZL8y-G6gMo1hcDqYqmUUkKjElim8fmK-fW5kQCuQJ_rrIXEr8U2YRA',
      name: 'Butter Croissant Premium',
      category: 'Snack & Makanan',
      price: '22000',
    },
  ];

  const handleAutoDetectPackaging = async (codeToTest?: string) => {
    const targetCode = (codeToTest || barcode).trim();
    if (!targetCode) {
      showToast('Ketik atau scan barcode terlebih dahulu', 'warning');
      return;
    }
    setIsDetectingPackaging(true);
    try {
      const match = await lookupBarcodeInfo(targetCode);
      if (match) {
        setDetectedPackaging(match);
        setBarcode(match.barcode);
        if (!sku || sku.startsWith('SKU-')) {
          setSku(`SKU-${match.barcode.slice(-6)}`);
        }
        if (!name || !product || name === 'Produk Baru') {
          setName(match.name);
        }
        if (!product || price === '25000') {
          setPrice(match.price.toString());
        }
        if (match.category) {
          setCategory(match.category);
        }
        setImage(match.image);
        setImageLoadError(false);
        playBeep('success');
        showToast(`Foto & data kemasan asli "${match.name}" berhasil diterapkan!`, 'success');
      } else {
        showToast(`Kemasan untuk barcode ${targetCode} belum terdaftar di database kemasan`, 'info');
      }
    } catch {
      showToast('Gagal memuat info kemasan', 'error');
    } finally {
      setIsDetectingPackaging(false);
    }
  };

  const isWebpageUrl =
    image &&
    (image.includes('lifestyleofafoodie.com') ||
      (!image.startsWith('data:') &&
        !image.startsWith('/images/') &&
        !/\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(image) &&
        image.includes('http')));

  const generateRandomBarcode = () => {
    const code = `899${Math.floor(100000000 + Math.random() * 900000000)}`;
    setBarcode(code);
    if (!sku || sku.startsWith('SKU-')) {
      setSku(`SKU-${code.slice(-6)}`);
    }
    playBeep('beep');
    showToast(`Barcode ${code} berhasil dibuat!`, 'info');
  };

  // Hardware USB Barcode scanner listener while modal is open
  useEffect(() => {
    let buffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isScannerOpen) return;

      const now = Date.now();
      if (now - lastKeyTime > 120) {
        buffer = '';
      }
      lastKeyTime = now;

      if (e.key === 'Enter') {
        if (buffer.length >= 3) {
          e.preventDefault();
          const scanned = buffer.trim();
          buffer = '';
          setBarcode(scanned);
          if (!sku || sku.startsWith('SKU-')) {
            setSku(`SKU-${scanned.slice(-6)}`);
          }
          playBeep('success');
          showToast(`Barcode ${scanned} terbaca dari scanner fisik!`, 'success');
          handleAutoDetectPackaging(scanned);
        }
        buffer = '';
      } else if (e.key.length === 1) {
        buffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isScannerOpen, sku, playBeep, showToast]);

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

        {/* Auto-scanned barcode notification banner */}
        {initialBarcode && !product && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-2.5 text-emerald-950 animate-in fade-in">
            <span className="material-symbols-outlined text-[24px] text-emerald-600 shrink-0">
              qr_code_scanner
            </span>
            <div className="text-xs">
              <p className="font-bold">
                Barcode Otomatis Terdeteksi:{' '}
                <span className="font-mono bg-white px-2 py-0.5 rounded border border-emerald-300 text-emerald-800">
                  {initialBarcode}
                </span>
              </p>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                Barcode telah otomatis terisi. Silakan lengkapi nama barang, kategori, dan harga.
              </p>
            </div>
          </div>
        )}

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
                <div className="flex items-center gap-1.5">
                  <label className="text-xs font-bold text-[#57534e]">Barcode Produk</label>
                  <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1 py-0.2 rounded font-semibold">
                    Scanner Aktif
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={generateRandomBarcode}
                    className="text-[10px] font-bold text-amber-700 hover:text-amber-800 flex items-center gap-0.5"
                    title="Buat barcode acak format EAN-13 Indonesia (899)"
                  >
                    <span className="material-symbols-outlined text-[13px]">autorenew</span>
                    <span>Acak 899</span>
                  </button>
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
              </div>
              <div className="flex gap-1.5">
                <div className="relative flex-1">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-stone-400">
                    barcode
                  </span>
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="899..."
                    className="w-full pl-9 pr-3.5 py-2.5 bg-[#fdfbf7] border border-[#ede5d8] rounded-xl text-sm font-mono font-bold text-[#292524] outline-none focus:border-[#eab308]"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleAutoDetectPackaging()}
                  disabled={isDetectingPackaging || !barcode.trim()}
                  className="px-2.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1 shrink-0 shadow-2xs active:scale-95 transition-all"
                  title="Deteksi nama produk dan foto kemasan asli dari barcode ini"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {isDetectingPackaging ? 'sync' : 'auto_awesome'}
                  </span>
                  <span className="hidden sm:inline">
                    {isDetectingPackaging ? 'Mencari...' : 'Cari Foto'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsScannerOpen(true)}
                  className="px-3 py-2 rounded-xl bg-[#0284c7] text-white hover:bg-[#0369a1] text-xs font-bold flex items-center gap-1.5 justify-center shrink-0 shadow-2xs active:scale-95 transition-all"
                  title="Buka Kamera Barcode Scanner"
                >
                  <span className="material-symbols-outlined text-[17px]">photo_camera</span>
                  <span className="hidden sm:inline">Scan</span>
                </button>
              </div>

              {/* Quick Indonesian Packaging Barcode Quick-Select Chips */}
              <div className="mt-2 p-2 bg-[#fffbeb] border border-[#fde68a] rounded-xl">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">inventory_2</span>
                    <span>Coba Barcode Kemasan Asli (Foto Otomatis):</span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_BARCODE_CATALOG.slice(0, 5).map((item) => (
                    <button
                      key={item.barcode}
                      type="button"
                      onClick={() => {
                        handleAutoDetectPackaging(item.barcode);
                      }}
                      className="px-2 py-1 rounded-lg bg-white hover:bg-amber-100 border border-amber-300 text-[11px] font-bold text-[#292524] flex items-center gap-1.5 active:scale-95 transition-all shadow-2xs"
                      title={`Klik untuk pasang barcode ${item.barcode} dan foto asli ${item.name}`}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        className="w-4 h-4 rounded object-cover border border-amber-200"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/images/caramel_macchiato.jpg';
                        }}
                      />
                      <span className="truncate max-w-[130px]">{item.name.split(' ')[0]} {item.name.split(' ')[1]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-[10px] text-stone-500 mt-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px] text-emerald-600">check_circle</span>
                <span>Barcode & foto asli otomatis terisi saat scan produk (misal: Beng-Beng / Indomie).</span>
              </p>
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

            <div className="col-span-2 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#57534e]">Foto Produk</label>
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#fef9c3] hover:bg-[#fef08a] border border-[#fde68a] text-[11px] font-bold text-[#713f12] transition-colors shadow-2xs">
                  <span className="material-symbols-outlined text-[15px]">upload</span>
                  <span>Upload dari HP / Laptop</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 5 * 1024 * 1024) {
                          showToast('Ukuran foto maksimal 5MB', 'warning');
                          return;
                        }
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          if (typeof event.target?.result === 'string') {
                            setImage(event.target.result);
                            setImageLoadError(false);
                            showToast('Foto berhasil dimuat dari perangkat', 'success');
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>

              {/* Live Preview Card */}
              <div className="flex items-center gap-3 p-3 bg-[#f7f3eb] rounded-2xl border border-[#ede5d8]">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-stone-200 border border-[#ede5d8] shrink-0">
                  <img
                    src={image || '/images/caramel_macchiato.jpg'}
                    alt="Pratinjau Produk"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/images/caramel_macchiato.jpg';
                      setImageLoadError(true);
                    }}
                    onLoad={() => setImageLoadError(false)}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-xs font-bold text-[#292524]">Pratinjau Foto</span>
                    {!imageLoadError && !isWebpageUrl && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Siap Ditampilkan
                      </span>
                    )}
                  </div>
                  {imageLoadError ? (
                    <p className="text-[11px] text-rose-600 font-medium leading-tight">
                      Tautan gambar tidak dapat dimuat. Gunakan URL foto langsung (.jpg/.png) atau tombol Upload File.
                    </p>
                  ) : isWebpageUrl ? (
                    <div className="space-y-1">
                      <p className="text-[11px] text-amber-800 font-medium leading-tight">
                        Tautan ini mengarah ke halaman web artikel (HTML), bukan file gambar langsung.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setImage('/images/caramel_macchiato.jpg');
                          setImageLoadError(false);
                          showToast('Foto Iced Caramel Macchiato resmi berhasil diterapkan!', 'success');
                        }}
                        className="text-[10px] font-bold text-[#713f12] bg-[#fef9c3] hover:bg-[#fef08a] px-2 py-1 rounded-lg border border-[#fde68a] inline-flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[13px]">coffee</span>
                        <span>Pasang Foto Iced Caramel Macchiato</span>
                      </button>
                    </div>
                  ) : (
                    <p className="text-[11px] text-[#78716c] truncate">
                      {image.startsWith('data:') ? 'Foto dari perangkat lokal' : image}
                    </p>
                  )}
                </div>
              </div>

              {/* Preset Buttons */}
              <div>
                <span className="text-[11px] text-[#78716c] block mb-1.5 font-medium">Pilihan Cepat Foto Berkualitas:</span>
                <div className="flex flex-wrap gap-1.5">
                  {presetImages.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setImage(p.url);
                        setImageLoadError(false);
                      }}
                      className={`text-[11px] font-bold py-1 px-2.5 rounded-lg border transition-colors ${
                        image === p.url
                          ? 'bg-[#fef9c3] border-[#fde68a] text-[#713f12]'
                          : 'bg-[#fdfbf7] border-[#ede5d8] text-[#78716c] hover:bg-[#f7f3eb]'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* URL Input */}
              <div>
                <span className="text-[11px] text-[#78716c] block mb-1 font-medium">Atau masukkan Link URL Gambar Langsung:</span>
                <input
                  type="text"
                  value={image}
                  onChange={(e) => {
                    setImage(e.target.value);
                    setImageLoadError(false);
                  }}
                  placeholder="https://contoh.com/foto.jpg"
                  className="w-full px-3.5 py-2 bg-[#fdfbf7] border border-[#ede5d8] rounded-xl text-xs text-[#292524] outline-none focus:border-[#eab308]"
                />
              </div>
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
          onScanCode={(code, prefill) => {
            setBarcode(code);
            if (!sku || sku.startsWith('SKU-')) {
              setSku(`SKU-${code.slice(-6)}`);
            }
            if (prefill) {
              if (prefill.name && (!name || !product || name === 'Produk Baru')) setName(prefill.name);
              if (prefill.price && (!product || price === '25000')) setPrice(prefill.price.toString());
              if (prefill.category) setCategory(prefill.category);
              if (prefill.image) {
                setImage(prefill.image);
                setImageLoadError(false);
              }
              playBeep('success');
              showToast(`Foto & info kemasan "${prefill.name}" berhasil diterapkan!`, 'success');
            } else {
              handleAutoDetectPackaging(code);
            }
          }}
        />
      </div>
    </div>
  );
};
