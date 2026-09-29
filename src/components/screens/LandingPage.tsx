import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { POPULAR_BARCODE_CATALOG, BarcodeCatalogItem } from '../../data/barcodeCatalog';
import { EyeCareTheme } from '../../types';

// High-fidelity bundled assets with Vite resolution
import HERO_IMAGE from '../../assets/images/hero_pos_cashier_terminal_1790553530543.jpg';
import SCANNER_FEATURE_IMAGE from '../../assets/images/feature_barcode_scanner_1790553541493.jpg';
import RECEIPT_FEATURE_IMAGE from '../../assets/images/feature_thermal_receipt_1790553553154.jpg';
import INVENTORY_FEATURE_IMAGE from '../../assets/images/feature_stock_inventory_1790553565187.jpg';

// Cloud CDN fallbacks for extreme reliability across any deployment environment
const FALLBACK_HERO_IMAGE = 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=1000&auto=format&fit=crop&q=80';
const FALLBACK_SCANNER_IMAGE = 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=1000&auto=format&fit=crop&q=80';
const FALLBACK_RECEIPT_IMAGE = 'https://images.unsplash.com/photo-1556740758-90de374c12ad?w=1000&auto=format&fit=crop&q=80';
const FALLBACK_INVENTORY_IMAGE = 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1000&auto=format&fit=crop&q=80';

export const LandingPage: React.FC = () => {
  const {
    setCurrentScreen,
    addToCart,
    showToast,
    playBeep,
    eyeCareTheme,
    setEyeCareTheme,
    isDarkMode,
    toggleDarkMode,
    settings,
    products,
    currentUser,
    logout,
    openAuth,
  } = usePOS();

  const handleOpenKasir = () => {
    playBeep('success');
    if (currentUser) {
      setCurrentScreen('kasir');
    } else {
      openAuth('signin');
      showToast('Silakan masuk dengan password Anda untuk membuka kasir.', 'info');
    }
  };

  // Interactive Barcode Simulator State
  const [selectedDemoProduct, setSelectedDemoProduct] = useState<BarcodeCatalogItem>(
    POPULAR_BARCODE_CATALOG[0] // Beng-Beng Wafer Cokelat Karamel Crispy 25g
  );
  const [customBarcodeInput, setCustomBarcodeInput] = useState<string>('');
  const [isScanningSimulated, setIsScanningSimulated] = useState<boolean>(false);
  const [scannedResult, setScannedResult] = useState<BarcodeCatalogItem | null>(POPULAR_BARCODE_CATALOG[0]);
  const [demoFeedbackMessage, setDemoFeedbackMessage] = useState<string | null>(null);

  // Interactive ROI Calculator State
  const [dailyTransactions, setDailyTransactions] = useState<number>(140);
  const [avgTicketPrice, setAvgTicketPrice] = useState<number>(35000);

  // FAQ Accordion State
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(0);

  // Interactive Alur Kasir Workflow State
  const [activeAlurStep, setActiveAlurStep] = useState<number>(0);

  // Simulate scanning of an item
  const handleSimulateScan = (item: BarcodeCatalogItem) => {
    setSelectedDemoProduct(item);
    setIsScanningSimulated(true);
    playBeep('beep');
    setDemoFeedbackMessage(null);

    setTimeout(() => {
      setIsScanningSimulated(false);
      setScannedResult(item);
      playBeep('success');
      setDemoFeedbackMessage(`Barcode ${item.barcode} terdeteksi! Kemasan asli ${item.name} berhasil dimuat.`);
    }, 450);
  };

  const handleCustomBarcodeSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customBarcodeInput.trim()) return;

    setIsScanningSimulated(true);
    playBeep('beep');

    const clean = customBarcodeInput.trim();
    setTimeout(() => {
      setIsScanningSimulated(false);
      const match = POPULAR_BARCODE_CATALOG.find(
        (c) => c.barcode === clean || (c.aliases && c.aliases.includes(clean))
      );

      if (match) {
        setScannedResult(match);
        setSelectedDemoProduct(match);
        playBeep('success');
        setDemoFeedbackMessage(`Ditemukan: ${match.name} (${match.brand})`);
      } else {
        // Fallback demo simulation
        const fallbackItem: BarcodeCatalogItem = {
          barcode: clean,
          name: `Produk Barcode #${clean}`,
          brand: 'Katalog Retail',
          category: 'Snack & Retail',
          price: 5000,
          image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=400&q=80',
          description: 'Produk ritel baru terdeteksi via pemindai optik.',
        };
        setScannedResult(fallbackItem);
        playBeep('beep');
        setDemoFeedbackMessage(`Barcode #${clean} siap ditambahkan ke daftar katalog outlet.`);
      }
    }, 400);
  };

  // Add the demo scanned item into cashier cart and navigate to cashier terminal
  const handleAddDemoToCartAndOpenKasir = (item: BarcodeCatalogItem) => {
    playBeep('success');

    // Check if product already exists in store catalog
    let matchedProduct = products.find((p) => p.barcode === item.barcode);

    if (!matchedProduct) {
      matchedProduct = {
        id: `demo-${Date.now()}`,
        name: item.name,
        sku: `BC-${item.barcode.slice(-5)}`,
        barcode: item.barcode,
        category: item.category || 'Snack & Makanan',
        price: item.price,
        stock: 50,
        minStockThreshold: 10,
        image: item.image,
        description: item.description,
      };
    }

    addToCart(matchedProduct);
    if (currentUser) {
      showToast(`"${item.name}" dimasukkan ke keranjang kasir!`, 'success');
      setCurrentScreen('kasir');
    } else {
      showToast(`"${item.name}" masuk keranjang! Masuk dengan password untuk melanjutkan.`, 'info');
      openAuth('signin');
    }
  };

  // Calculations for efficiency preview
  const estimatedSecondsSavedPerTrx = 18; // 18 seconds faster than manual paper/slow POS
  const totalHoursSavedPerMonth = Math.round(
    (dailyTransactions * estimatedSecondsSavedPerTrx * 30) / 3600
  );
  const estimatedMonthlyTurnover = dailyTransactions * avgTicketPrice * 30;

  const faqs = [
    {
      q: 'Apakah Kasirku dapat menggunakan hardware barcode scanner fisik (USB/Wireless)?',
      a: 'Tentu. Kasirku dirancang kompatibel langsung dengan pemindai barcode laser/CCD tipe USB plug-and-play maupun nirkabel 2.4GHz / Bluetooth. Selain itu, kasir juga dapat memanfaatkan kamera laptop, tablet, atau smartphone secara langsung.',
    },
    {
      q: 'Bagaimana cara kerja deteksi foto kemasan asli seperti Beng-Beng atau Indomie?',
      a: 'Kasirku terintegrasi dengan basis data katalog kemasan ritel nasional. Saat barcode kemasan discan (misalnya 8996001355008 untuk Beng-Beng Wafer), sistem langsung mengenali nama resmi produk, produsen, dan menampilkan foto kemasan otentik tanpa perlu kasir memotret secara manual.',
    },
    {
      q: 'Dapatkah saya mencetak struk belanja ke printer thermal?',
      a: 'Ya, sistem mendukung printer struk thermal standar ritel ukuran 58mm dan 80mm melalui koneksi ESC/POS, USB, maupun Bluetooth. Tersedia juga opsi unduh struk digital format PDF dan pengiriman bukti transaksi langsung via WhatsApp pelanggan.',
    },
    {
      q: 'Apakah kasir tetap berfungsi jika koneksi internet terputus?',
      a: 'Ya, Kasirku dibangun dengan arsitektur Offline-First. Seluruh transaksi kasir, perhitungan kembalian, dan cetak struk tetap beroperasi penuh tanpa jeda meski offline, lalu otomatis tersinkronisasi kembali ke cloud Turso saat internet aktif.',
    },
    {
      q: 'Bagaimana sistem mencatat rekonsiliasi kas saat tutup toko / pergantian shift?',
      a: 'Fitur Shift Kasir Enterprise mencatat modal awal kasir, merekam semua arus kas masuk (tunai, QRIS, kartu), dan memandu kasir menghitung uang fisik di laci kas saat tutup shift untuk memastikan nihil selisih kas.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f6f4ee] text-[#1c1917] selection:bg-[#bae6fd] selection:text-[#0369a1]">
      {/* ---------------- TOP BAR CONTRACT ---------------- */}
      <header className="sticky top-0 z-50 bg-[#f6f4ee]/95 backdrop-blur-md border-b border-[#ede7db]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3">
            <span className="font-display font-extrabold text-xl sm:text-2xl tracking-tight text-[#1c1917]">
              KASIRKU POS
            </span>
          </div>

          {/* Zone 2: Clean text navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#57534e]">
            <a href="#fitur" className="hover:text-[#1c1917] transition-colors">
              Fitur Unggulan
            </a>
            <a href="#barcode-kemasan" className="hover:text-[#1c1917] transition-colors">
              Deteksi Barcode
            </a>
            <a href="#alur-kasir" className="hover:text-[#1c1917] transition-colors">
              Alur Kasir
            </a>
            <a href="#kalkulator" className="hover:text-[#1c1917] transition-colors">
              Efisiensi
            </a>
            <a href="#faq" className="hover:text-[#1c1917] transition-colors">
              Tanya Jawab
            </a>
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Dark / Light Mode Quick Toggle */}
            <button
              type="button"
              onClick={toggleDarkMode}
              className={`p-2 rounded-xl border flex items-center justify-center transition-colors shadow-2xs cursor-pointer ${
                isDarkMode
                  ? 'bg-amber-400/10 text-amber-300 border-amber-400/30 hover:bg-amber-400/20'
                  : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
              }`}
              title={isDarkMode ? 'Beralih ke Mode Terang (Light Mode)' : 'Beralih ke Mode Gelap (Dark Mode)'}
            >
              <span className="material-symbols-outlined text-[19px]">
                {isDarkMode ? 'light_mode' : 'dark_mode'}
              </span>
            </button>

            {/* Quick Eye-Care Theme Switcher */}
            <div className="hidden sm:flex items-center bg-[#ede7db]/70 p-1 rounded-lg">
              {(
                [
                  { id: 'warm-beige', label: 'Beige' },
                  { id: 'matcha-sage', label: 'Matcha' },
                  { id: 'slate-charcoal', label: 'Slate' },
                  { id: 'nordic-sky', label: 'Sky' },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setEyeCareTheme(t.id as EyeCareTheme)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                    eyeCareTheme === t.id
                      ? 'bg-white text-[#1c1917] shadow-xs'
                      : 'text-[#78716c] hover:text-[#1c1917]'
                  }`}
                  title={`Ganti tema: ${t.label}`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {!currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    playBeep('beep');
                    openAuth('signin');
                  }}
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-[#0284c7] bg-[#f0f9ff] hover:bg-[#e0f2fe] border border-[#bae6fd] rounded-xl transition-all shadow-2xs"
                >
                  Masuk (Sign In)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playBeep('beep');
                    openAuth('signup');
                  }}
                  className="hidden sm:inline-flex px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold text-[#1c1917] bg-white hover:bg-stone-50 border border-[#e2dbcc] rounded-xl transition-all shadow-2xs"
                >
                  Daftar (Sign Up)
                </button>
                <button
                  type="button"
                  onClick={handleOpenKasir}
                  className="px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-white bg-[#0284c7] hover:bg-[#0369a1] active:scale-98 rounded-xl shadow-xs transition-all flex items-center gap-1.5 whitespace-nowrap"
                >
                  <span>Terminal Kasir</span>
                  <span className="material-symbols-outlined text-[16px] leading-none">arrow_forward</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-white border border-[#e2dbcc] shadow-2xs">
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.fullName}
                    className="w-6 h-6 rounded-lg object-cover border border-stone-200"
                  />
                  <div className="text-left">
                    <p className="text-[11px] font-black text-[#1c1917] leading-tight truncate max-w-[100px]">
                      {currentUser.fullName}
                    </p>
                    <span className="text-[9px] font-bold text-[#0284c7] block">
                      {currentUser.role}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playBeep('success');
                    setCurrentScreen('kasir');
                  }}
                  className="px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-white bg-[#0284c7] hover:bg-[#0369a1] active:scale-98 rounded-xl shadow-xs transition-all flex items-center gap-1.5 whitespace-nowrap"
                >
                  <span>Buka Kasir</span>
                  <span className="material-symbols-outlined text-[16px] leading-none">arrow_forward</span>
                </button>
                <button
                  type="button"
                  onClick={logout}
                  className="p-2 text-[#78716c] hover:text-rose-600 bg-white hover:bg-rose-50 border border-[#e2dbcc] rounded-xl transition-all shadow-2xs"
                  title="Keluar dari akun (Logout)"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ---------------- HERO SECTION ---------------- */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden border-b border-[#ede7db]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Proposition & CTA */}
            <div className="lg:col-span-7 space-y-6">
              {/* Unboxed editorial kicker with subtle separator */}
              <div className="flex items-center gap-2 text-xs font-semibold text-[#78716c]">
                <span>Sistem Kasir Generasi Baru</span>
                <span aria-hidden="true">·</span>
                <span>Untuk Cafe, Resto & Retail Indonesia</span>
                <span aria-hidden="true">·</span>
                <span>Edisi 2026</span>
              </div>

              <h1 className="font-display text-3xl sm:text-5xl lg:text-[54px] font-extrabold tracking-tight text-[#1c1917] leading-[1.12] text-balance">
                Mesin Kasir Cerdas, Presisi, dan Elegan untuk Bisnis Anda.
              </h1>

              <p className="text-base sm:text-lg text-[#57534e] max-w-2xl leading-relaxed">
                Platform Point of Sale lengkap dengan deteksi instan foto kemasan asli saat scan barcode,
                pembayaran kilat QRIS & tunai, rekonsiliasi shift terverifikasi, dan kontrol stok barang
                real-time tanpa kerumitan.
              </p>

              {/* Primary Action Row */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleOpenKasir}
                  className="px-6 py-3.5 text-sm font-bold text-white bg-[#0284c7] hover:bg-[#0369a1] active:scale-98 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">point_of_sale</span>
                  <span>Mulai Transaksi Kasir Sekarang</span>
                </button>

                {!currentUser && (
                  <button
                    type="button"
                    onClick={() => {
                      playBeep('beep');
                      openAuth('signup');
                    }}
                    className="px-5 py-3.5 text-sm font-bold text-[#0284c7] bg-[#f0f9ff] hover:bg-[#e0f2fe] border border-[#bae6fd] active:scale-98 rounded-xl transition-all flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[19px]">person_add</span>
                    <span>Daftar Akun Baru (Sign Up)</span>
                  </button>
                )}

                <a
                  href="#barcode-kemasan"
                  className="px-5 py-3.5 text-sm font-semibold text-[#1c1917] bg-white hover:bg-stone-100 border border-[#ede7db] active:scale-98 rounded-xl transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[19px] text-[#0284c7]">qr_code_scanner</span>
                  <span>Uji Coba Deteksi Barcode</span>
                </a>
              </div>

              {/* Trust markers & Adjacency proof */}
              <div className="pt-4 border-t border-[#ede7db] grid grid-cols-3 gap-4">
                <div>
                  <div className="font-mono text-xl sm:text-2xl font-bold text-[#1c1917] tabular-nums">
                    &lt; 2.4s
                  </div>
                  <div className="text-xs text-[#78716c] font-medium mt-0.5">Kecepatan Checkout</div>
                </div>
                <div>
                  <div className="font-mono text-xl sm:text-2xl font-bold text-[#1c1917] tabular-nums">
                    99.9%
                  </div>
                  <div className="text-xs text-[#78716c] font-medium mt-0.5">Akurasi Stok & Kas</div>
                </div>
                <div>
                  <div className="font-mono text-xl sm:text-2xl font-bold text-[#1c1917] tabular-nums">
                    100%
                  </div>
                  <div className="text-xs text-[#78716c] font-medium mt-0.5">Operasional Offline</div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Asset (Touchscreen Terminal Showcase) */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-[#ede7db] shadow-xl bg-white group">
                <img
                  src={HERO_IMAGE}
                  alt="Terminal Kasir KASIRKU POS"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = FALLBACK_HERO_IMAGE;
                  }}
                  className="w-full aspect-[4/3] object-cover group-hover:scale-102 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none" />

                {/* Overlaid Terminal Status Floating Widget */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="flex items-center justify-between text-xs text-white/80 pb-2 border-b border-white/20">
                    <span className="flex items-center gap-1.5 font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Status Register: Buka & Siap Transaksi
                    </span>
                    <span className="font-mono tabular-nums text-[11px]">Cabang Utama</span>
                  </div>

                  <div className="pt-2.5 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] text-white/70">Toko Aktif</p>
                      <p className="text-sm font-bold text-white truncate">{settings.storeName}</p>
                    </div>

                    <button
                      type="button"
                      onClick={handleOpenKasir}
                      className="px-3.5 py-1.5 bg-white text-[#1c1917] hover:bg-stone-100 text-xs font-bold rounded-lg shadow-sm transition-all"
                    >
                      Buka Kasir
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- FEATURE 01: BARCODE KEMASAN ASLI (FLAGSHIP INTERACTIVE DEMO) ---------------- */}
      <section id="barcode-kemasan" className="py-16 md:py-24 border-b border-[#ede7db] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <div className="text-xs font-semibold text-[#78716c] uppercase tracking-wider mb-2">
              01. Inovasi Unggulan Kasirku
            </div>
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-[#1c1917] tracking-tight text-balance">
              Deteksi Otomatis Barcode & Foto Kemasan Asli Seketika.
            </h2>
            <p className="mt-3 text-base text-[#57534e] leading-relaxed">
              Katakan selamat tinggal pada input data kemasan yang melelahkan. Scan barcode produk kemasan
              populer seperti Beng-Beng, Indomie, Teh Botol Sosro, dan sistem langsung menampilkan foto
              kemasan otentik, nama resmi, serta harga rekomendasi.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Interactive Demo Sandbox Controller */}
            <div className="lg:col-span-7 bg-[#fbf9f4] border border-[#ede7db] rounded-2xl p-6 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-[#ede7db] mb-6">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-[#0284c7]">
                    sensors
                  </span>
                  <span className="text-sm font-bold text-[#1c1917]">
                    Simulator Pemindai Barcode Interaktif
                  </span>
                </div>
                <span className="text-xs text-[#78716c] font-medium">Klik contoh produk di bawah</span>
              </div>

              {/* Sample Product Buttons to Trigger Immediate Scan */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-[#57534e] mb-2.5">
                  Pilih Produk Kemasan untuk Simulasi Scan:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {POPULAR_BARCODE_CATALOG.slice(0, 6).map((item) => {
                    const isSelected = selectedDemoProduct.barcode === item.barcode;
                    return (
                      <button
                        key={item.barcode}
                        onClick={() => handleSimulateScan(item)}
                        className={`text-left p-2.5 rounded-xl border transition-all flex items-center gap-2.5 ${
                          isSelected
                            ? 'bg-[#0284c7]/10 border-[#0284c7] text-[#0369a1]'
                            : 'bg-white border-[#ede7db] hover:border-stone-400 text-[#1c1917]'
                        }`}
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1621996346565-e3d5d6281e04?w=200&auto=format&fit=crop&q=80';
                          }}
                          className="w-10 h-10 object-contain rounded-lg bg-white shrink-0 p-0.5 border border-stone-100"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate leading-tight">{item.name}</p>
                          <p className="text-[11px] font-mono text-[#78716c] truncate mt-0.5">
                            {item.barcode}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Barcode Input form */}
              <form onSubmit={handleCustomBarcodeSearch} className="mb-6">
                <label className="block text-xs font-semibold text-[#57534e] mb-1.5">
                  Atau Masukkan Nomor Barcode Kemasan Lainnya:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customBarcodeInput}
                    onChange={(e) => setCustomBarcodeInput(e.target.value)}
                    placeholder="Ketik barcode misal: 8996001355008..."
                    className="flex-1 px-3.5 py-2.5 bg-white border border-[#ede7db] rounded-xl text-xs sm:text-sm text-[#1c1917] focus:outline-hidden focus:border-[#0284c7] font-mono"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-[#1c1917] hover:bg-stone-800 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 shrink-0"
                  >
                    <span className="material-symbols-outlined text-[16px]">search</span>
                    <span>Pindai</span>
                  </button>
                </div>
              </form>

              {/* Optical Laser Scan Animation Effect Container */}
              <div className="relative rounded-xl overflow-hidden border border-[#ede7db] bg-stone-900 p-4 min-h-[140px] flex items-center justify-center">
                {isScanningSimulated ? (
                  <div className="flex flex-col items-center justify-center space-y-2 py-4">
                    {/* Simulated laser scan line */}
                    <div className="w-full h-0.5 bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.9)] animate-pulse" />
                    <p className="text-xs text-red-400 font-mono tracking-wider">
                      MEMINDAI BARCODE OPTIK...
                    </p>
                  </div>
                ) : scannedResult ? (
                  <div className="w-full flex items-center gap-4 text-white">
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-xl overflow-hidden p-1.5 shrink-0 flex items-center justify-center">
                      <img
                        src={scannedResult.image}
                        alt={scannedResult.name}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1621996346565-e3d5d6281e04?w=400&auto=format&fit=crop&q=80';
                        }}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-semibold mb-1">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        <span>Foto Kemasan Asli Terverifikasi</span>
                      </div>
                      <h4 className="text-sm sm:text-base font-bold text-white truncate leading-tight">
                        {scannedResult.name}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-stone-300 mt-1">
                        <span>Brand: {scannedResult.brand}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono text-stone-400">{scannedResult.barcode}</span>
                      </div>
                      <div className="mt-2 text-sm font-bold text-emerald-300 font-mono">
                        Rp {scannedResult.price.toLocaleString('id-ID')}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-stone-400">Tekan salah satu tombol untuk memindai.</p>
                )}
              </div>

              {/* Feedback Message */}
              {demoFeedbackMessage && (
                <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
                  <span className="truncate">{demoFeedbackMessage}</span>
                  {scannedResult && (
                    <button
                      onClick={() => handleAddDemoToCartAndOpenKasir(scannedResult)}
                      className="ml-3 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shrink-0 transition-colors"
                    >
                      + Masukkan Kasir
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Physical Context Photo & Narrative */}
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-2xl overflow-hidden border border-[#ede7db] shadow-md bg-stone-100">
                <img
                  src={SCANNER_FEATURE_IMAGE}
                  alt="Pemindai Barcode Kemasan Ritel"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = FALLBACK_SCANNER_IMAGE;
                  }}
                  className="w-full aspect-[4/3] object-cover"
                />
              </div>

              <div className="space-y-4">
                <h3 className="font-display text-lg font-bold text-[#1c1917]">
                  Mengapa Deteksi Kemasan Asli Mengubah Segalanya?
                </h3>
                <ul className="space-y-3 text-sm text-[#57534e]">
                  <li className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[18px] text-[#0284c7] shrink-0 mt-0.5">
                      verified
                    </span>
                    <span>
                      <strong>Nihil Salah Input Barang</strong>: Kasir dapat langsung mencocokkan kemasan
                      fisik di tangan pembeli dengan thumbnail kemasan resmi di layar.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[18px] text-[#0284c7] shrink-0 mt-0.5">
                      fast_forward
                    </span>
                    <span>
                      <strong>Entri Barang Baru 1-Klik</strong>: Barcode kemasan belum terdaftar di outlet
                      dapat langsung disimpan dengan foto aslinya tanpa perlu kamera HP terpisah.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined text-[18px] text-[#0284c7] shrink-0 mt-0.5">
                      inventory_2
                    </span>
                    <span>
                      <strong>Katalog Nasional Terintegrasi</strong>: Mendukung varian Beng-Beng, Indomie,
                      Teh Botol, Susu Ultra, dan ratusan barang kemasan ritel lainnya.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- FEATURE 02: BENTO GRID CAPABILITIES ---------------- */}
      <section id="fitur" className="py-16 md:py-24 border-b border-[#ede7db] bg-[#fbf9f4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <div className="text-xs font-semibold text-[#78716c] uppercase tracking-wider mb-2">
              02. Ekosistem Fitur Lengkap
            </div>
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-[#1c1917] tracking-tight text-balance">
              Dibangun dari Fondasi Nyata Kasir Toko & Kafe Modern.
            </h2>
            <p className="mt-3 text-base text-[#57534e] leading-relaxed">
              Setiap tombol, alur, dan perhitungan dirancang untuk menghilangkan antrean panjang dan
              memastikan buku keuangan toko Anda selalu klop setiap pergantian shift.
            </p>
          </div>

          {/* Asymmetric Bento-Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 (Span 2): Fast Multi-Payment & Thermal Receipt */}
            <div className="lg:col-span-2 bg-white border border-[#ede7db] rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-[#0284c7]/10 flex items-center justify-center text-[#0284c7]">
                    <span className="material-symbols-outlined text-[24px]">payments</span>
                  </div>
                  <h3 className="font-display text-xl font-bold text-[#1c1917]">
                    Checkout Kilat QRIS Dinamis, Tunai & Kartu
                  </h3>
                  <p className="text-sm text-[#57534e] leading-relaxed">
                    Kalkulator pecahan uang pas pintar (Rp 10.000 hingga Rp 100.000) mempercepat hitungan
                    kembalian hingga 3 kali lebih cepat. Dukungan QRIS interaktif dan struk thermal 58/80mm
                    memastikan pelanggan pulang tanpa menunggu lama.
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs text-[#78716c]">
                    <span>Hitung Kembalian Otomatis</span>
                    <span aria-hidden="true">·</span>
                    <span>Struk Cetak & PDF</span>
                    <span aria-hidden="true">·</span>
                    <span>Kirim Nota WhatsApp</span>
                  </div>
                </div>

                <div className="rounded-xl overflow-hidden border border-[#ede7db] shadow-inner">
                  <img
                    src={RECEIPT_FEATURE_IMAGE}
                    alt="Cetak Struk Thermal & QRIS"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = FALLBACK_RECEIPT_IMAGE;
                    }}
                    className="w-full aspect-[4/3] object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Card 2 (Span 1): Shift Kasir & Tutup Buku Harian */}
            <div className="bg-white border border-[#ede7db] rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-xs">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                  <span className="material-symbols-outlined text-[24px]">lock_clock</span>
                </div>
                <h3 className="font-display text-xl font-bold text-[#1c1917]">
                  Shift Kasir & Tutup Buku Harian
                </h3>
                <p className="text-sm text-[#57534e] leading-relaxed">
                  Pencatatan modal kas awal, pembukuan transaksi per kasir, dan penutupan shift
                  tervalidasi dengan rekonsiliasi kas riil di laci kasir vs sistem untuk mencegah
                  kebocoran dana.
                </p>
              </div>

              <div className="pt-6 border-t border-[#ede7db] flex items-center justify-between text-xs text-[#78716c]">
                <span>Rekonsiliasi Modal Awal</span>
                <span className="font-bold text-[#1c1917]">Nihil Selisih</span>
              </div>
            </div>

            {/* Card 3 (Span 1): Parkir Tagihan / Hold Order */}
            <div className="bg-white border border-[#ede7db] rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-xs">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-600">
                  <span className="material-symbols-outlined text-[24px]">pause_circle</span>
                </div>
                <h3 className="font-display text-xl font-bold text-[#1c1917]">
                  Parkir Tagihan (Hold Order)
                </h3>
                <p className="text-sm text-[#57534e] leading-relaxed">
                  Pelanggan tertinggal dompet atau ingin menambah pesanan? Parkir keranjang belanjanya
                  dalam satu klik dan layani pembeli berikutnya tanpa harus membatalkan transaksi.
                </p>
              </div>

              <div className="pt-6 border-t border-[#ede7db] flex items-center justify-between text-xs text-[#78716c]">
                <span>Multi-Antrean Dinamis</span>
                <span className="font-bold text-emerald-600">Anti-Macet</span>
              </div>
            </div>

            {/* Card 4 (Span 2): Real-Time Stock & Eye-Care System */}
            <div className="lg:col-span-2 bg-white border border-[#ede7db] rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                <div className="rounded-xl overflow-hidden border border-[#ede7db] shadow-inner order-last sm:order-first">
                  <img
                    src={INVENTORY_FEATURE_IMAGE}
                    alt="Manajemen Stok dan Inventaris Toko"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = FALLBACK_INVENTORY_IMAGE;
                    }}
                    className="w-full aspect-[4/3] object-cover"
                  />
                </div>

                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                    <span className="material-symbols-outlined text-[24px]">inventory_2</span>
                  </div>
                  <h3 className="font-display text-xl font-bold text-[#1c1917]">
                    Kontrol Stok Otomatis & Layar Ramah Mata
                  </h3>
                  <p className="text-sm text-[#57534e] leading-relaxed">
                    Pengingat stok menipis otomatis mencegah barang kehabisan saat jam ramai. Dilengkapi 4
                    palet layar ramah mata (Warm Beige, Matcha Sage, Slate, Sky) dan filter anti-silau
                    untuk kenyamanan kasir bekerja berjam-jam tanpa lelah mata.
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs text-[#78716c]">
                    <span>Peringatan Stok Menipis</span>
                    <span aria-hidden="true">·</span>
                    <span>Log Pergerakan Barang</span>
                    <span aria-hidden="true">·</span>
                    <span>Filter Blue-Light Optik</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- FEATURE 03: INTERACTIVE ALUR TRANSAKSI KASIR ---------------- */}
      <section id="alur-kasir" className="py-16 md:py-24 border-b border-[#ede7db] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <div className="text-xs font-semibold text-[#0284c7] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#0284c7]" />
              <span>Alur Operasional Interaktif</span>
            </div>
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-[#1c1917] tracking-tight text-balance">
              Alur Kasir Kilat: Dari Scan Produk Hingga Tutup Shift.
            </h2>
            <p className="mt-3 text-base text-[#57534e] leading-relaxed">
              Pelajari alur 4 langkah praktis yang membuat kasir toko & kafe dapat melayani ratusan
              pelanggan setiap hari dengan cepat, akurat, dan tanpa selisih uang kas.
            </p>
          </div>

          {/* Interactive Step Tabs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            {[
              {
                step: 1,
                title: 'Scan Kemasan',
                icon: 'qr_code_scanner',
                desc: 'Deteksi otomatis nama & foto kemasan',
              },
              {
                step: 2,
                title: 'Catatan & Parkir',
                icon: 'edit_note',
                desc: 'Modifier pesanan & tahan nota antrean',
              },
              {
                step: 3,
                title: 'Hitung & Bayar',
                icon: 'payments',
                desc: 'QRIS dinamis, uang pas & kartu',
              },
              {
                step: 4,
                title: 'Struk & Shift',
                icon: 'receipt_long',
                desc: 'Thermal 58/80mm & Z-Report kasir',
              },
            ].map((s, idx) => (
              <button
                key={s.step}
                type="button"
                onClick={() => {
                  setActiveAlurStep(idx);
                  playBeep('beep');
                }}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  activeAlurStep === idx
                    ? 'bg-[#f0f9ff] border-[#0284c7] shadow-sm ring-2 ring-[#0284c7]/20'
                    : 'bg-[#fdfbf7] hover:bg-stone-50 border-[#ede7db]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${
                      activeAlurStep === idx
                        ? 'bg-[#0284c7] text-white'
                        : 'bg-[#ede7db] text-[#57534e]'
                    }`}
                  >
                    0{s.step}
                  </span>
                  <span
                    className={`material-symbols-outlined text-[20px] ${
                      activeAlurStep === idx ? 'text-[#0284c7]' : 'text-[#78716c]'
                    }`}
                  >
                    {s.icon}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-[#1c1917] leading-tight">{s.title}</h4>
                <p className="text-[11px] text-[#78716c] mt-1 leading-snug">{s.desc}</p>
              </button>
            ))}
          </div>

          {/* Interactive Step Preview Display */}
          <div className="bg-[#fcfbf9] border-2 border-[#e2dbcc] rounded-3xl p-6 sm:p-10 shadow-sm">
            {activeAlurStep === 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 space-y-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd]">
                    Langkah 1: Input Cepat & Akurat
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-[#1c1917]">
                    Deteksi Instan Foto Kemasan Saat Barcode Discan
                  </h3>
                  <p className="text-sm text-[#57534e] leading-relaxed">
                    Arahkan pemindai barcode ke kemasan makanan atau minuman. Sistem langsung mencocokkan
                    kode dengan basis data ritel nasional, memuat gambar asli kemasan, dan menambahkan ke
                    keranjang tanpa kasir perlu mengetik manual.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        const el = document.getElementById('barcode-kemasan');
                        el?.scrollIntoView({ behavior: 'smooth' });
                        playBeep('beep');
                      }}
                      className="px-4 py-2.5 rounded-xl bg-[#0284c7] text-white text-xs font-bold hover:bg-[#0369a1] transition-all flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">qr_code_scanner</span>
                      <span>Uji Simulator Scan Barcode</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleOpenKasir}
                      className="px-4 py-2.5 rounded-xl bg-white text-[#1c1917] border border-[#cbd5e1] hover:bg-stone-50 text-xs font-bold transition-all"
                    >
                      Buka Mesin Kasir
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-6 bg-white rounded-2xl p-5 border border-[#ede7db] shadow-inner space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                    <span className="text-xs font-bold text-[#0284c7] flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Status Scanner: Siap Scan
                    </span>
                    <span className="text-[11px] font-mono text-[#78716c]">Barcode: 8996001355008</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <img
                      src={POPULAR_BARCODE_CATALOG[0].image}
                      alt="Demo Kemasan"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1621996346565-e3d5d6281e04?w=300&auto=format&fit=crop&q=80';
                      }}
                      className="w-20 h-20 rounded-xl object-cover border border-stone-200 shadow-2xs"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold text-[#0284c7] uppercase">
                        {POPULAR_BARCODE_CATALOG[0].brand}
                      </span>
                      <h4 className="font-extrabold text-sm text-[#1c1917] truncate">
                        {POPULAR_BARCODE_CATALOG[0].name}
                      </h4>
                      <p className="text-xs font-mono font-bold text-[#0284c7] mt-1">
                        Rp {POPULAR_BARCODE_CATALOG[0].price.toLocaleString('id-ID')}
                      </p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Foto Kemasan Terverifikasi
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeAlurStep === 1 && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 space-y-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-[#fef9c3] text-[#713f12] border border-[#fde68a]">
                    Langkah 2: Kelola Antrean Fleksibel
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-[#1c1917]">
                    Kustomisasi Modifier & Parkir Tagihan Pelanggan
                  </h3>
                  <p className="text-sm text-[#57534e] leading-relaxed">
                    Setiap menu kafe dapat ditambahkan catatan khusus (Less Sugar, Oat Milk, Meja 05).
                    Jika ada pembeli yang ingin menambah pesanan, fitur <strong>Parkir Tagihan (Hold Order)</strong>{' '}
                    menyimpan keranjang belanja tanpa menghapus data agar kasir dapat melayani pelanggan berikutnya.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleOpenKasir}
                      className="px-4 py-2.5 rounded-xl bg-[#0284c7] text-white text-xs font-bold hover:bg-[#0369a1] transition-all flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">pause_circle</span>
                      <span>Coba Parkir Pesanan di Kasir</span>
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-6 bg-white rounded-2xl p-5 border border-[#ede7db] shadow-inner space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-200 text-xs">
                    <span className="font-bold text-[#1c1917]">Daftar Pesanan Meja #04</span>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      Parkir Tagihan Aktif
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-[#fdfbf7] border border-stone-200 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-[#1c1917]">Kopi Susu Gula Aren</p>
                        <p className="text-[10px] text-[#78716c]">Catatan: Less Sugar 🧊, Extra Shot ☕</p>
                      </div>
                      <span className="font-bold text-[#1c1917]">Rp 22.000</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#fdfbf7] border border-stone-200 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-[#1c1917]">Butter Croissant</p>
                        <p className="text-[10px] text-[#78716c]">Catatan: Hangat ♨️</p>
                      </div>
                      <span className="font-bold text-[#1c1917]">Rp 18.000</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeAlurStep === 2 && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 space-y-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd]">
                    Langkah 3: Pembayaran Super Cepat
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-[#1c1917]">
                    Kalkulator Uang Pas, Kembalian Instan & QRIS Dinamis
                  </h3>
                  <p className="text-sm text-[#57534e] leading-relaxed">
                    Kasir tidak perlu menghitung manual di kalkulator terpisah. Tersedia tombol cepat
                    pecahan uang (Uang Pas, 50k, 100k) serta QRIS dinamis langsung di layar kasir untuk
                    menyelesaikan transaksi dalam hitungan detik.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleOpenKasir}
                      className="px-4 py-2.5 rounded-xl bg-[#0284c7] text-white text-xs font-bold hover:bg-[#0369a1] transition-all flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">payments</span>
                      <span>Mulai Transaksi Pembayaran</span>
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-6 bg-white rounded-2xl p-5 border border-[#ede7db] shadow-inner space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-stone-200">
                    <span className="text-xs font-bold text-[#78716c]">Total Pembayaran</span>
                    <span className="text-lg font-black text-[#0284c7]">Rp 40.000</span>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" className="flex-1 py-1.5 rounded-lg bg-[#e0f2fe] text-[#0369a1] text-xs font-bold border border-[#bae6fd]">
                      Uang Pas
                    </button>
                    <button type="button" className="flex-1 py-1.5 rounded-lg bg-[#f0f9ff] text-[#0284c7] text-xs font-bold border border-[#bae6fd]">
                      Rp 50.000
                    </button>
                    <button type="button" className="flex-1 py-1.5 rounded-lg bg-[#f0f9ff] text-[#0284c7] text-xs font-bold border border-[#bae6fd]">
                      Rp 100.000
                    </button>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex justify-between items-center text-xs">
                    <span className="text-emerald-800 font-bold">Kembalian Otomatis:</span>
                    <span className="text-sm font-black text-emerald-700">Rp 10.000</span>
                  </div>
                </div>
              </div>
            )}

            {activeAlurStep === 3 && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-6 space-y-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Langkah 4: Struk & Rekonsiliasi Kas
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-[#1c1917]">
                    Struk Thermal Otomatis & Z-Report Penutupan Shift
                  </h3>
                  <p className="text-sm text-[#57534e] leading-relaxed">
                    Begitu pembayaran lunas, struk thermal 58mm/80mm dapat langsung dicetak atau dikirim
                    via WhatsApp. Di akhir jam kerja, kasir melakukan tutup shift dan rekonsiliasi kas riil
                    untuk memastikan laci kas toko tidak pernah tekor.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      type="button"
                      onClick={handleOpenKasir}
                      className="px-4 py-2.5 rounded-xl bg-[#0284c7] text-white text-xs font-bold hover:bg-[#0369a1] transition-all flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                      <span>Buka Terminal Kasir Sekarang</span>
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-6 bg-white rounded-2xl p-5 border border-[#ede7db] shadow-inner space-y-3 font-mono text-xs">
                  <div className="text-center pb-2 border-b border-dashed border-stone-300">
                    <p className="font-bold text-sm text-[#1c1917]">{settings.storeName}</p>
                    <p className="text-[10px] text-stone-500">Struk Pembayaran Sah · Thermal 58mm</p>
                  </div>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span>1x Kopi Gula Aren</span>
                      <span>22.000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>1x Butter Croissant</span>
                      <span>18.000</span>
                    </div>
                    <div className="flex justify-between font-bold pt-1 border-t border-dashed border-stone-300">
                      <span>TOTAL LUNAS (QRIS)</span>
                      <span>40.000</span>
                    </div>
                  </div>
                  <div className="pt-2 text-center text-[10px] text-emerald-600 font-bold">
                    ✓ Transaksi Berhasil & Masuk Laporan Shift
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ---------------- SECTION 03: INTERACTIVE ROI / EFFICIENCY CALCULATOR ---------------- */}
      <section id="kalkulator" className="py-16 md:py-24 border-b border-[#ede7db] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <div className="text-xs font-semibold text-[#78716c] uppercase tracking-wider mb-2">
              03. Dampak Nyata pada Waktu & Finansial
            </div>
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-[#1c1917] tracking-tight text-balance">
              Kalkulator Efisiensi Kasir Toko Anda.
            </h2>
            <p className="mt-3 text-base text-[#57534e] leading-relaxed">
              Geser perkiraan transaksi harian toko Anda dan lihat berapa banyak jam kerja serta potensi
              antrean yang berhasil dipangkas setiap bulannya.
            </p>
          </div>

          <div className="bg-[#fbf9f4] border border-[#ede7db] rounded-2xl p-6 sm:p-10 shadow-xs">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Sliders Area */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-bold text-[#1c1917]">
                      Jumlah Transaksi Toko per Hari
                    </label>
                    <span className="font-mono text-base font-extrabold text-[#0284c7] tabular-nums">
                      {dailyTransactions} transaksi
                    </span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="500"
                    step="10"
                    value={dailyTransactions}
                    onChange={(e) => setDailyTransactions(Number(e.target.value))}
                    className="w-full accent-[#0284c7] cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-[#78716c] mt-1 font-mono">
                    <span>20 trx/hari</span>
                    <span>250 trx/hari</span>
                    <span>500 trx/hari</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-bold text-[#1c1917]">
                      Rata-Rata Nilai Belanja (Average Ticket Size)
                    </label>
                    <span className="font-mono text-base font-extrabold text-[#1c1917] tabular-nums">
                      Rp {avgTicketPrice.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="15000"
                    max="200000"
                    step="5000"
                    value={avgTicketPrice}
                    onChange={(e) => setAvgTicketPrice(Number(e.target.value))}
                    className="w-full accent-[#0284c7] cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-[#78716c] mt-1 font-mono">
                    <span>Rp 15.000</span>
                    <span>Rp 100.000</span>
                    <span>Rp 200.000</span>
                  </div>
                </div>
              </div>

              {/* Calculated Outputs */}
              <div className="lg:col-span-5 bg-white border border-[#ede7db] rounded-xl p-6 space-y-5">
                <div>
                  <p className="text-xs text-[#78716c] font-medium">Estimasi Waktu Kasir Dihemat</p>
                  <p className="font-mono text-3xl font-extrabold text-[#0284c7] tabular-nums mt-0.5">
                    ~{totalHoursSavedPerMonth} Jam / Bulan
                  </p>
                  <p className="text-xs text-[#57534e] mt-1">
                    Lebih banyak waktu untuk melayani pembeli dan meracik pesanan daripada berkutat pada
                    antrean kasir lambat.
                  </p>
                </div>

                <div className="pt-4 border-t border-[#ede7db]">
                  <p className="text-xs text-[#78716c] font-medium">Estimasi Omset Terkelola Rapi</p>
                  <p className="font-mono text-xl font-bold text-[#1c1917] tabular-nums mt-0.5">
                    Rp {estimatedMonthlyTurnover.toLocaleString('id-ID')}
                  </p>
                  <p className="text-xs text-[#57534e] mt-1">
                    Seluruh aliran uang tercatat otomatis tanpa risiko nota kertas hilang atau tercecer.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleOpenKasir}
                  className="w-full py-2.5 bg-[#1c1917] hover:bg-stone-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Buktikan Langsung di Mesin Kasir</span>
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- SECTION 04: TESTIMONIALS ---------------- */}
      <section className="py-16 md:py-24 border-b border-[#ede7db] bg-[#fbf9f4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <div className="text-xs font-semibold text-[#78716c] uppercase tracking-wider mb-2">
              Bukti Pengguna Nyata
            </div>
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-[#1c1917] tracking-tight">
              Dipercaya Pemilik Gerai Kopi, Butik & Retail Modern.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-[#ede7db] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
              <p className="text-sm text-[#57534e] leading-relaxed italic mb-6">
                “Deteksi barcode kemasan aslinya luar biasa. Saat scan wafer Beng-Beng atau minuman botol,
                fotonya langsung muncul di layar tablet kasir. Kasir baru kami tidak pernah salah ketik
                produk lagi.”
              </p>
              <div>
                <p className="text-sm font-bold text-[#1c1917]">Rian Pratama</p>
                <p className="text-xs text-[#78716c]">Owner Kopi Senja Roastery · Jakarta</p>
              </div>
            </div>

            <div className="bg-white border border-[#ede7db] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
              <p className="text-sm text-[#57534e] leading-relaxed italic mb-6">
                “Fitur shift kasirnya sangat rapi. Dulu kami butuh 40 menit setiap malam untuk menghitung
                laci kas. Sekarang kasir tinggal masukkan uang fisik, langsung ketahuan jika ada selisih.”
              </p>
              <div>
                <p className="text-sm font-bold text-[#1c1917]">Maya Anggraini</p>
                <p className="text-xs text-[#78716c]">Store Manager Retail Mart · Bandung</p>
              </div>
            </div>

            <div className="bg-white border border-[#ede7db] rounded-2xl p-6 shadow-xs flex flex-col justify-between">
              <p className="text-sm text-[#57534e] leading-relaxed italic mb-6">
                “Tema layarnya sangat nyaman di mata kasir. Mode Matcha Sage dan Warm Beige membuat kasir
                kami tidak cepat lelah mata meski melayani ratusan antrean di akhir pekan.”
              </p>
              <div>
                <p className="text-sm font-bold text-[#1c1917]">Dian Kusuma</p>
                <p className="text-xs text-[#78716c]">Pengelola Golden Bakery & Pastry · Surabaya</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- SECTION 05: FAQ ACCORDION ---------------- */}
      <section id="faq" className="py-16 md:py-24 border-b border-[#ede7db] bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="text-xs font-semibold text-[#78716c] uppercase tracking-wider mb-2">
              Informasi Penting
            </div>
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-[#1c1917] tracking-tight">
              Pertanyaan yang Sering Diajukan (FAQ)
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = expandedFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="border border-[#ede7db] rounded-xl overflow-hidden bg-[#fbf9f4] transition-colors"
                >
                  <button
                    onClick={() => setExpandedFaqIndex(isOpen ? null : idx)}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 font-display font-bold text-sm sm:text-base text-[#1c1917] hover:text-[#0284c7] transition-colors"
                  >
                    <span>{faq.q}</span>
                    <span className="material-symbols-outlined text-[20px] text-[#78716c] shrink-0">
                      {isOpen ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 text-xs sm:text-sm text-[#57534e] leading-relaxed border-t border-[#ede7db]/50 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------- SECTION 06: CALL TO ACTION BANNER ---------------- */}
      <section className="py-16 md:py-20 bg-[#1c1917] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight text-white text-balance">
            Siap Mempercepat Operasional Toko & Kafe Anda?
          </h2>
          <p className="text-sm sm:text-base text-stone-300 max-w-2xl mx-auto leading-relaxed">
            Tidak perlu instalasi rumit. Buka mesin kasir langsung di browser Anda, scan barcode produk,
            dan nikmati kemudahan transaksi kasir modern sekarang.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleOpenKasir}
              className="px-6 py-3.5 text-sm font-bold text-white bg-[#0284c7] hover:bg-[#0369a1] active:scale-98 rounded-xl shadow-lg transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">storefront</span>
              <span>Buka Terminal Kasir Sekarang</span>
            </button>

            <button
              onClick={() => {
                playBeep('beep');
                setCurrentScreen('dashboard');
              }}
              className="px-5 py-3.5 text-sm font-semibold text-white bg-stone-800 hover:bg-stone-700 active:scale-98 rounded-xl transition-all"
            >
              Lihat Dashboard Analitik
            </button>
          </div>
        </div>
      </section>

      {/* ---------------- QUIET FOOTER ---------------- */}
      <footer className="bg-[#141211] text-stone-400 py-10 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-sm text-white tracking-tight">
                KASIRKU POS
              </span>
              <span>·</span>
              <span>{settings.storeName} ({settings.branchName})</span>
            </div>

            <div className="flex items-center gap-5 text-stone-400">
              <button
                onClick={() => setCurrentScreen('kasir')}
                className="hover:text-white transition-colors"
              >
                Mesin Kasir
              </button>
              <button
                onClick={() => setCurrentScreen('produk')}
                className="hover:text-white transition-colors"
              >
                Katalog Produk
              </button>
              <button
                onClick={() => setCurrentScreen('pengaturan')}
                className="hover:text-white transition-colors"
              >
                Pengaturan
              </button>
            </div>

            <div>
              <p>© 2026 KASIRKU POS. Sistem Manajemen Retail & Kasir Modern.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
