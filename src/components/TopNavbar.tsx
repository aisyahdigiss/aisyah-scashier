import React, { useState, useEffect } from 'react';
import { usePOS } from '../context/POSContext';

interface TopNavbarProps {
  onToggleMobileMenu: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ onToggleMobileMenu }) => {
  const {
    currentScreen,
    searchQuery,
    setSearchQuery,
    cashiers,
    activeCashier,
    setActiveCashierId,
    showToast,
  } = usePOS();

  const [showCashierMenu, setShowCashierMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getScreenTitle = () => {
    switch (currentScreen) {
      case 'dashboard':
        return 'Overview Dashboard';
      case 'kasir':
        return 'Kasir Terminal';
      case 'produk':
        return 'Manajemen Produk';
      case 'kategori':
        return 'Kategori Produk';
      case 'stok':
        return 'Detail Stok';
      case 'riwayat':
        return 'Riwayat Penjualan';
      case 'laporan':
        return 'Laporan Keuangan';
      case 'pengaturan':
        return 'Pengaturan Toko';
      default:
        return 'KASIRKU POS';
    }
  };

  const getSearchPlaceholder = () => {
    switch (currentScreen) {
      case 'kasir':
      case 'produk':
      case 'stok':
        return 'Cari produk atau SKU...';
      case 'kategori':
        return 'Cari kategori...';
      case 'riwayat':
        return 'Cari no faktur / kasir...';
      default:
        return 'Cari sesuatu...';
    }
  };

  return (
    <header className="fixed top-0 right-0 left-0 md:left-[280px] h-20 bg-[#fff9f0]/95 backdrop-blur-md flex items-center justify-between px-4 md:px-8 z-30 border-b border-[#ede7df]/80 transition-all">
      <div className="flex items-center gap-3 md:gap-6 flex-1 min-w-0">
        {/* Mobile Hamburger */}
        <button
          onClick={onToggleMobileMenu}
          className="p-2.5 rounded-xl text-[#41474e] hover:bg-[#f9f3ea] md:hidden transition-colors shrink-0"
          aria-label="Buka Menu"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>

        {/* Screen Title */}
        <h2 className="text-xl md:text-2xl font-bold text-[#30628a] tracking-tight truncate hidden sm:block">
          {getScreenTitle()}
        </h2>

        {/* Search Bar */}
        <div className="relative w-full max-w-xs md:max-w-sm">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#72787f] text-[20px] pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={getSearchPlaceholder()}
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#f9f3ea] border border-[#ede7df] focus:border-[#30628a] focus:bg-white focus:ring-2 focus:ring-[#30628a]/20 text-[#1d1b16] placeholder:text-[#72787f] text-sm font-normal outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Action Buttons & Profile */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0 ml-3">
        {/* Real-time Clock Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f3ede4] text-[#40627b] text-xs font-semibold border border-[#ede7df]">
          <span className="material-symbols-outlined text-[16px]">schedule</span>
          <span>{currentTime}</span>
        </div>

        {/* Notification button */}
        <button
          onClick={() => showToast('Tidak ada notifikasi baru', 'info')}
          className="w-10 h-10 rounded-full flex items-center justify-center text-[#41474e] hover:bg-[#ede7df] hover:text-[#30628a] transition-all relative active:scale-95"
          title="Notifikasi"
        >
          <span className="material-symbols-outlined text-[22px]">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-orange-500" />
        </button>

        {/* Cashier Account Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowCashierMenu(!showCashierMenu)}
            className="flex items-center gap-2.5 p-1 rounded-full hover:bg-[#ede7df] transition-colors group"
            title="Profil Pengguna"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#a2d2ff] bg-[#cde5ff] shrink-0 shadow-xs">
              <img
                src={activeCashier.avatarUrl}
                alt={activeCashier.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="hidden xl:block text-left pr-1">
              <p className="text-xs font-bold text-[#1d1b16] leading-tight truncate max-w-[120px]">
                {activeCashier.name}
              </p>
              <p className="text-[11px] text-[#40627b] font-medium">{activeCashier.role}</p>
            </div>
            <span className="material-symbols-outlined text-[#72787f] text-sm hidden xl:block">
              arrow_drop_down
            </span>
          </button>

          {/* Cashier Menu Dropdown */}
          {showCashierMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowCashierMenu(false)}
              />
              <div className="absolute right-0 top-12 w-64 bg-white rounded-2xl shadow-[0px_12px_32px_rgba(0,0,0,0.12)] border border-[#ede7df] py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2 border-b border-[#ede7df] mb-1">
                  <p className="text-xs text-[#72787f]">Sedang Bertugas</p>
                  <p className="font-bold text-[#1d1b16] text-sm">{activeCashier.name}</p>
                  <span className="inline-block px-2 py-0.5 mt-1 text-[10px] font-semibold bg-[#bee1ff] text-[#001e2f] rounded-full">
                    {activeCashier.role}
                  </span>
                </div>

                <div className="px-3 py-1">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#72787f] px-2 py-1">
                    Ganti Akun Kasir
                  </p>
                  {cashiers.map((cashier) => (
                    <button
                      key={cashier.id}
                      onClick={() => {
                        setActiveCashierId(cashier.id);
                        setShowCashierMenu(false);
                      }}
                      className={`w-full flex items-center gap-3 px-2 py-2 rounded-xl text-left text-xs transition-colors ${
                        cashier.id === activeCashier.id
                          ? 'bg-[#f3ede4] font-bold text-[#30628a]'
                          : 'hover:bg-[#f9f3ea] text-[#1d1b16]'
                      }`}
                    >
                      <img
                        src={cashier.avatarUrl}
                        alt={cashier.name}
                        className="w-7 h-7 rounded-full object-cover border border-[#ede7df]"
                      />
                      <div className="flex-1 truncate">
                        <p className="leading-tight">{cashier.name}</p>
                        <span className="text-[10px] text-[#72787f]">{cashier.role}</span>
                      </div>
                      {cashier.id === activeCashier.id && (
                        <span className="material-symbols-outlined text-[16px] text-[#30628a]">
                          check
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
