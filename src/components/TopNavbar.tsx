import React, { useState, useEffect } from 'react';
import { usePOS } from '../context/POSContext';
import { EyeComfortModal } from './modals/EyeComfortModal';

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
    currentUser,
    users,
    logout,
    switchUser,
    openPhotoModal,
    sidebarMode,
    toggleSidebarMode,
    zenFocusMode,
    toggleZenFocusMode,
    eyeCareTheme,
    antiGlareFilter,
    dbStatus,
    syncWithTurso,
  } = usePOS();

  const [showCashierMenu, setShowCashierMenu] = useState(false);
  const [showSoundMenu, setShowSoundMenu] = useState(false);
  const [showEyeComfortModal, setShowEyeComfortModal] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  const isCompact = sidebarMode === 'compact' && !zenFocusMode;
  const isHidden = sidebarMode === 'hidden' || zenFocusMode;

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
    <>
      <header
        className={`fixed top-0 right-0 left-0 ${
          isCompact ? 'md:left-[76px]' : isHidden ? 'md:left-0' : 'md:left-[260px]'
        } h-18 bg-white/95 backdrop-blur-md flex items-center justify-between px-3 sm:px-6 z-30 border-b border-[#ede7db] transition-all duration-300`}
      >
        <div className="flex items-center gap-2.5 sm:gap-4 flex-1 min-w-0">
          {/* Universal Hamburger & Sidebar Toggle Button */}
          <button
            type="button"
            onClick={() => {
              if (window.innerWidth < 768 || sidebarMode === 'hidden') {
                onToggleMobileMenu();
              } else {
                toggleSidebarMode();
              }
            }}
            className="w-10 h-10 rounded-xl text-[#57534e] hover:text-[#1c1917] hover:bg-stone-100 flex items-center justify-center transition-colors shrink-0 border border-[#ede7db]"
            title={
              sidebarMode === 'expanded'
                ? 'Perkecil Bilah Sisi (Mode Ringkas Ikon)'
                : sidebarMode === 'compact'
                ? 'Sembunyikan Bilah Sisi (Layar Lebar Bersih)'
                : 'Buka Menu Navigasi'
            }
            aria-label="Toggle Menu Sidebar"
          >
            <span className="material-symbols-outlined text-[22px]">
              {sidebarMode === 'expanded' && !isHidden ? 'menu_open' : 'menu'}
            </span>
          </button>

          {/* Screen Title */}
          <div className="hidden sm:block truncate">
            <h2 className="text-lg md:text-xl font-bold text-[#1c1917] tracking-tight truncate">
              {getScreenTitle()}
            </h2>
            <p className="text-[11px] text-[#78716c] font-medium hidden md:block">
              {zenFocusMode ? 'Mode Fokus Minimalis Aktif' : 'Smart POS Terminal'}
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full max-w-xs md:max-w-sm">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#78716c] text-[18px] pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={getSearchPlaceholder()}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#fcfbf9] border border-[#ede7db] focus:border-[#0284c7] focus:bg-white focus:ring-2 focus:ring-[#e0f2fe] text-[#1c1917] placeholder:text-[#a8a29e] text-xs md:text-sm font-medium outline-none transition-all"
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
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-2">
          {/* Zen Focus Mode Button */}
          <button
            type="button"
            onClick={toggleZenFocusMode}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
              zenFocusMode
                ? 'bg-[#0284c7] text-white border-[#0284c7] shadow-2xs'
                : 'bg-[#fcfbf9] text-[#57534e] border-[#ede7db] hover:bg-stone-100 hover:text-[#1c1917]'
            }`}
            title={zenFocusMode ? 'Keluar dari Mode Fokus Zen' : 'Aktifkan Mode Fokus Zen (Layar Kasir Penuh)'}
          >
            <span className="material-symbols-outlined text-[18px]">
              {zenFocusMode ? 'fullscreen_exit' : 'center_focus_strong'}
            </span>
            <span className="hidden lg:inline whitespace-nowrap">
              {zenFocusMode ? 'Fokus Aktif' : 'Mode Zen'}
            </span>
          </button>

          {/* Eye Comfort & Display Settings Modal Button */}
          <button
            type="button"
            onClick={() => setShowEyeComfortModal(true)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all relative border ${
              antiGlareFilter || eyeCareTheme !== 'warm-beige'
                ? 'bg-[#e0f2fe] text-[#0284c7] border-[#bae6fd]'
                : 'bg-[#fcfbf9] text-[#57534e] border-[#ede7db] hover:bg-stone-100 hover:text-[#1c1917]'
            }`}
            title="Kenyamanan Tampilan & Mata (Anti-Silau, Warna Sejuk, Kepadatan)"
          >
            <span className="material-symbols-outlined text-[20px]">visibility</span>
            {(antiGlareFilter || eyeCareTheme !== 'warm-beige') && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#0284c7]" />
            )}
          </button>

          {/* Turso Cloud Database Status Badge */}
          <button
            onClick={() => syncWithTurso()}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all border shadow-2xs ${
              dbStatus === 'connected'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                : dbStatus === 'syncing'
                ? 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse'
                : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
            }`}
            title={`Turso Cloud DB: ${
              dbStatus === 'connected'
                ? 'Terhubung ke asyacashierdb-aisyahdigiss (Klik untuk sinkronisasi)'
                : dbStatus === 'syncing'
                ? 'Sedang menyinkronkan data...'
                : 'Offline - menggunakan penyimpanan lokal (Klik untuk hubungkan ulang)'
            }`}
          >
            <span className="material-symbols-outlined text-[16px] text-emerald-600">
              {dbStatus === 'connected' ? 'cloud_done' : dbStatus === 'syncing' ? 'sync' : 'cloud_off'}
            </span>
            <span className="text-[11px] font-medium tracking-tight">
              {dbStatus === 'connected' ? 'Turso: Online' : dbStatus === 'syncing' ? 'Sync Turso...' : 'Turso: Offline'}
            </span>
          </button>

          {/* Real-time Clock Badge */}
          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#fcfbf9] text-[#57534e] text-xs font-mono font-bold border border-[#ede7db]">
            <span className="material-symbols-outlined text-[16px] text-[#78716c]">schedule</span>
            <span>{currentTime}</span>
          </div>

          {/* Smart AI Barista Trigger Button */}
          <button
            onClick={() => setIsAssistantOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#fcfbf9] hover:bg-[#e0f2fe] text-[#0284c7] text-xs font-bold transition-all border border-[#bae6fd]"
            title="Buka Asisten Pintar & Rekomendasi Menu"
          >
            <span className="material-symbols-outlined text-[18px]">
              auto_awesome
            </span>
            <span className="hidden md:inline whitespace-nowrap">Asisten AI</span>
          </button>

          {/* Audio Chime Quick Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowSoundMenu(!showSoundMenu)}
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#fcfbf9] text-[#57534e] hover:bg-stone-100 transition-all relative border border-[#ede7db]"
              title={`Suara Kasir: ${soundTheme}`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {soundTheme === 'mute' ? 'volume_off' : 'music_note'}
              </span>
              {soundTheme !== 'mute' && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
              )}
            </button>

            {showSoundMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowSoundMenu(false)} />
                <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-lg border border-[#ede7db] py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
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
                          ? 'bg-[#e0f2fe] font-bold text-[#0369a1]'
                          : 'text-[#1c1917] hover:bg-[#fcfbf9]'
                      }`}
                    >
                      <span>{s.label}</span>
                      {soundTheme === s.id && (
                        <span className="material-symbols-outlined text-sm text-[#0284c7]">check</span>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* User Account / Cashier Switcher - High Contrast */}
          <div className="relative">
            <button
              onClick={() => setShowCashierMenu(!showCashierMenu)}
              className="flex items-center gap-2 p-1.5 pl-2 rounded-xl bg-white hover:bg-stone-50 border-2 border-[#94a3b8] hover:border-[#0284c7] transition-all group shadow-xs"
              title="Kelola Akun & Ubah Foto Profil"
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-lg overflow-hidden border border-[#0284c7] bg-white shrink-0 shadow-2xs">
                  <img
                    src={currentUser ? currentUser.avatarUrl : activeCashier.avatarUrl}
                    alt={currentUser ? currentUser.fullName : activeCashier.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://api.dicebear.com/7.x/adventurer/svg?seed=Aisyah&backgroundColor=bae6fd';
                    }}
                  />
                </div>
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#0284c7] text-white flex items-center justify-center text-[8px] border border-white">
                  ✎
                </span>
              </div>
              <div className="hidden lg:block text-left pr-1">
                <p className="text-xs font-black text-[#0f172a] leading-tight truncate max-w-[120px]">
                  {currentUser ? currentUser.fullName : activeCashier.name}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="inline-block text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-[#0284c7] text-white leading-none whitespace-nowrap">
                    {currentUser ? currentUser.role : activeCashier.role}
                  </span>
                </div>
              </div>
              <span className="material-symbols-outlined text-[#334155] text-sm pr-0.5 group-hover:text-[#0284c7]">
                arrow_drop_down
              </span>
            </button>

            {/* User & Cashier Menu Dropdown */}
            {showCashierMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowCashierMenu(false)} />
                <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border-2 border-[#cbd5e1] py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* Active User Header */}
                  <div className="px-4 py-3 border-b border-stone-200 bg-[#f8fafc]">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black text-[#0284c7] uppercase tracking-wider">
                        Kasir & Akun Aktif
                      </p>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#0284c7] text-white">
                        {currentUser ? currentUser.role : activeCashier.role}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-2">
                      <div className="relative group/avatar cursor-pointer" onClick={() => { setShowCashierMenu(false); openPhotoModal(); }}>
                        <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-[#0284c7] bg-white shadow-xs">
                          <img
                            src={currentUser ? currentUser.avatarUrl : activeCashier.avatarUrl}
                            alt="Foto Profil"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://api.dicebear.com/7.x/adventurer/svg?seed=Aisyah&backgroundColor=bae6fd';
                            }}
                          />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#0284c7] text-white flex items-center justify-center text-[10px] border border-white shadow-xs">
                          <span className="material-symbols-outlined text-[12px]">photo_camera</span>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-extrabold text-[#0f172a] text-sm leading-tight truncate">
                          {currentUser ? currentUser.fullName : activeCashier.name}
                        </p>
                        {currentUser?.username && (
                          <p className="text-[11px] font-mono font-bold text-[#475569] mt-0.5">
                            @{currentUser.username}
                          </p>
                        )}
                        {currentUser?.email && (
                          <p className="text-[10px] text-[#64748b] truncate">
                            {currentUser.email}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Change Photo Quick Action Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setShowCashierMenu(false);
                        openPhotoModal();
                      }}
                      className="w-full mt-3 py-2 px-3 rounded-xl bg-[#e0f2fe] hover:bg-[#bae6fd] text-[#0369a1] text-xs font-black flex items-center justify-center gap-1.5 transition-all border border-[#7dd3fc] shadow-2xs active:scale-98"
                    >
                      <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                      <span>Ubah Foto Profil Kasir</span>
                    </button>
                  </div>

                  {/* Switchable Users List */}
                  <div className="px-3 py-2 max-h-44 overflow-y-auto">
                    <p className="text-[10px] font-black uppercase tracking-wider text-[#475569] px-2 py-1">
                      Beralih Pengguna / Kasir
                    </p>
                    {users.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u.id);
                          setShowCashierMenu(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left text-xs transition-colors mb-1 ${
                          currentUser?.id === u.id
                            ? 'bg-[#f0f9ff] font-extrabold text-[#0369a1] border border-[#bae6fd]'
                            : 'hover:bg-stone-100 text-[#0f172a]'
                        }`}
                      >
                        <img
                          src={u.avatarUrl}
                          alt={u.fullName}
                          className="w-7 h-7 rounded-lg object-cover border border-stone-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://api.dicebear.com/7.x/adventurer/svg?seed=Aisyah&backgroundColor=bae6fd';
                          }}
                        />
                        <div className="flex-1 truncate">
                          <p className="leading-tight font-bold truncate text-[#0f172a]">{u.fullName}</p>
                          <span className="text-[10px] text-[#64748b] font-medium">{u.role}</span>
                        </div>
                        {currentUser?.id === u.id && (
                          <span className="material-symbols-outlined text-[18px] text-[#0284c7]">
                            check_circle
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Actions Footer */}
                  <div className="px-3 pt-2 mt-1 border-t border-stone-200 space-y-1.5">
                    <button
                      onClick={() => {
                        setCurrentScreen('pengaturan');
                        setShowCashierMenu(false);
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-[#f8fafc] hover:bg-stone-100 text-[#334155] text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all border border-stone-300"
                    >
                      <span className="material-symbols-outlined text-[16px]">manage_accounts</span>
                      <span>Pengaturan Toko & Kasir</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowCashierMenu(false);
                        logout();
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all border border-rose-300"
                    >
                      <span className="material-symbols-outlined text-[16px]">logout</span>
                      <span>Keluar (Logout) / Ganti Akun</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Eye Comfort & Display Settings Modal */}
      <EyeComfortModal
        isOpen={showEyeComfortModal}
        onClose={() => setShowEyeComfortModal(false)}
      />
    </>
  );
};
