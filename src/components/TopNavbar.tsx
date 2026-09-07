import React, { useState, useEffect } from 'react';
import { usePOS } from '../context/POSContext';

interface TopNavbarProps {
  onToggleMobileMenu: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ onToggleMobileMenu }) => {
  const {
    currentScreen,
    setCurrentScreen,
    searchQuery,
    setSearchQuery,
    cashiers,
    activeCashier,
    setActiveCashierId,
    showToast,
    soundTheme,
    setSoundTheme,
    setIsAssistantOpen,
    playBeep,
  } = usePOS();

  const [showCashierMenu, setShowCashierMenu] = useState(false);
  const [showSoundMenu, setShowSoundMenu] = useState(false);
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
    <header className="fixed top-0 right-0 left-0 md:left-[280px] h-20 bg-[#fffdfa]/90 backdrop-blur-md flex items-center justify-between px-4 md:px-8 z-30 border-b border-[#ede5d8] transition-all">
      <div className="flex items-center gap-3 md:gap-5 flex-1 min-w-0">
        {/* Mobile Hamburger */}
        <button
          onClick={onToggleMobileMenu}
          className="p-2.5 rounded-xl text-[#78716c] hover:bg-[#f7f3eb] md:hidden transition-colors shrink-0"
          aria-label="Buka Menu"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>

        {/* Screen Title */}
        <div className="hidden sm:block truncate">
          <h2 className="text-xl md:text-2xl font-bold text-[#292524] tracking-tight truncate">
            {getScreenTitle()}
          </h2>
          <p className="text-[11px] text-[#78716c] font-medium hidden md:block">
            Smart POS Terminal
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full max-w-xs md:max-w-sm">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#78716c] text-[20px] pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={getSearchPlaceholder()}
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#fdfbf7] border border-[#ede5d8] focus:border-[#fde68a] focus:bg-white focus:ring-2 focus:ring-[#fef9c3] text-[#292524] placeholder:text-[#a8a29e] text-sm font-medium outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a8a29e] hover:text-[#57534e]"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Action Buttons & Profile */}
      <div className="flex items-center gap-2 md:gap-2.5 shrink-0 ml-3">
        {/* Real-time Clock Badge */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#fef9c3] text-[#713f12] text-xs font-bold border border-[#fde68a]">
          <span className="material-symbols-outlined text-[16px] text-[#854d0e]">schedule</span>
          <span>{currentTime}</span>
        </div>

        {/* Smart AI Barista Trigger Button */}
        <button
          onClick={() => setIsAssistantOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#fef9c3] hover:bg-[#fef08a] text-[#713f12] text-xs font-bold shadow-2xs hover:shadow-xs active:scale-95 transition-all border border-[#fde68a]"
          title="Buka Asisten Pintar & Rekomendasi Menu"
        >
          <span className="material-symbols-outlined text-[18px] text-[#854d0e]">
            auto_awesome
          </span>
          <span className="hidden sm:inline">Asisten AI</span>
        </button>

        {/* Audio Chime Quick Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowSoundMenu(!showSoundMenu)}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-[#fdfbf7] text-[#57534e] hover:bg-[#fef9c3] hover:text-[#713f12] transition-all relative active:scale-95 border border-[#ede5d8]"
            title={`Suara Kasir: ${soundTheme}`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {soundTheme === 'mute' ? 'volume_off' : 'music_note'}
            </span>
            {soundTheme !== 'mute' && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-amber-500 border-2 border-white" />
            )}
          </button>

          {showSoundMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowSoundMenu(false)} />
              <div className="absolute right-0 top-12 w-48 bg-[#fffdfa] rounded-2xl shadow-[0px_12px_32px_rgba(120,113,108,0.15)] border border-[#ede5d8] py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#78716c] px-3 py-1">
                  Nada Suara Kasir
                </p>
                {[
                  { id: 'chime', label: 'Sweet Chime ✨' },
                  { id: 'bell', label: 'Cafe Bell 🔔' },
                  { id: 'click', label: 'Bubble ASMR 🫧' },
                  { id: 'mute', label: 'Mute / Senyap 🔇' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setSoundTheme(s.id as 'chime' | 'bell' | 'click' | 'mute');
                      setShowSoundMenu(false);
                      if (s.id !== 'mute') {
                        playBeep('success');
                      }
                      showToast(`Suara kasir: ${s.label}`, 'info');
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between transition-colors ${
                      soundTheme === s.id
                        ? 'bg-[#fef9c3] font-bold text-[#713f12]'
                        : 'text-[#292524] hover:bg-[#f7f3eb]'
                    }`}
                  >
                    <span>{s.label}</span>
                    {soundTheme === s.id && (
                      <span className="material-symbols-outlined text-sm text-[#854d0e]">check</span>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Cashier Account Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowCashierMenu(!showCashierMenu)}
            className="flex items-center gap-2.5 p-1 rounded-full hover:bg-[#f7f3eb] transition-colors group"
            title="Ganti Akun Kasir"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#dfd5c3] bg-[#fdfbf7] shrink-0 shadow-xs ring-2 ring-[#fef9c3]">
              <img
                src={activeCashier.avatarUrl}
                alt={activeCashier.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://api.dicebear.com/7.x/adventurer/svg?seed=Aisyah&backgroundColor=fef9c3';
                }}
              />
            </div>
            <div className="hidden lg:block text-left pr-1">
              <p className="text-xs font-bold text-[#292524] leading-tight truncate max-w-[110px]">
                {activeCashier.name}
              </p>
              <p className="text-[10px] text-[#78716c] font-semibold">{activeCashier.role}</p>
            </div>
            <span className="material-symbols-outlined text-[#78716c] text-sm hidden lg:block">
              arrow_drop_down
            </span>
          </button>

          {/* Cashier Menu Dropdown */}
          {showCashierMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowCashierMenu(false)} />
              <div className="absolute right-0 top-12 w-64 bg-[#fffdfa] rounded-2xl shadow-[0px_12px_32px_rgba(120,113,108,0.15)] border border-[#ede5d8] py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2 border-b border-[#ede5d8] mb-1">
                  <p className="text-xs text-[#78716c]">Sedang Bertugas</p>
                  <p className="font-bold text-[#292524] text-sm">{activeCashier.name}</p>
                  <span className="inline-block px-2 py-0.5 mt-1 text-[10px] font-bold bg-[#fef9c3] text-[#713f12] rounded-full border border-[#fde68a]">
                    {activeCashier.role}
                  </span>
                </div>

                <div className="px-3 py-1 max-h-48 overflow-y-auto">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#78716c] px-2 py-1">
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
                          ? 'bg-[#fef9c3] font-bold text-[#713f12] border border-[#fde68a]'
                          : 'hover:bg-[#f7f3eb] text-[#292524]'
                      }`}
                    >
                      <img
                        src={cashier.avatarUrl}
                        alt={cashier.name}
                        className="w-7 h-7 rounded-full object-cover border border-[#ede5d8]"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://api.dicebear.com/7.x/adventurer/svg?seed=Aisyah&backgroundColor=fef9c3';
                        }}
                      />
                      <div className="flex-1 truncate">
                        <p className="leading-tight">{cashier.name}</p>
                        <span className="text-[10px] text-[#78716c]">{cashier.role}</span>
                      </div>
                      {cashier.id === activeCashier.id && (
                        <span className="material-symbols-outlined text-[16px] text-[#854d0e]">
                          check
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="px-3 pt-2 mt-1 border-t border-[#ede5d8]">
                  <button
                    onClick={() => {
                      setCurrentScreen('pengaturan');
                      setShowCashierMenu(false);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-[#fef9c3] hover:bg-[#fef08a] text-[#713f12] text-xs font-bold flex items-center justify-center gap-1.5 transition-all border border-[#fde68a] shadow-2xs"
                  >
                    <span className="material-symbols-outlined text-[16px]">manage_accounts</span>
                    <span>Kelola & Edit Akun Kasir</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
