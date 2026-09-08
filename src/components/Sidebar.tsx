import React from 'react';
import { usePOS } from '../context/POSContext';
import { ScreenType } from '../types';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const {
    currentScreen,
    setCurrentScreen,
    cart,
    setIsAssistantOpen,
    settings,
    storeStatus,
    setIsStoreLogoModalOpen,
    currentUser,
    logout,
    sidebarMode,
    toggleSidebarMode,
    zenFocusMode,
  } = usePOS();

  const isCompact = sidebarMode === 'compact';
  const isHidden = sidebarMode === 'hidden' || zenFocusMode;

  const menuItems: { id: ScreenType; label: string; icon: string; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    {
      id: 'kasir',
      label: 'Kasir Terminal',
      icon: 'point_of_sale',
      badge: cart.length > 0 ? cart.reduce((acc, c) => acc + c.quantity, 0) : undefined,
    },
    { id: 'produk', label: 'Produk', icon: 'inventory_2' },
    { id: 'kategori', label: 'Kategori', icon: 'category' },
    { id: 'stok', label: 'Stok Barang', icon: 'layers' },
    { id: 'riwayat', label: 'Riwayat Transaksi', icon: 'receipt_long' },
    { id: 'laporan', label: 'Laporan Penjualan', icon: 'assessment' },
    { id: 'pengaturan', label: 'Pengaturan', icon: 'settings' },
  ];

  return (
    <>
      {/* Mobile/Overlay Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-stone-900/40 z-40 backdrop-blur-xs transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen bg-white border-r border-[#ede7db] shadow-xs flex flex-col z-50 transition-all duration-300 ease-in-out ${
          isCompact ? 'w-[76px] py-4 px-2' : 'w-[260px] py-4 px-3'
        } ${
          mobileOpen
            ? 'translate-x-0'
            : isHidden
            ? '-translate-x-full'
            : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className={`mb-3 ${isCompact ? 'flex justify-center' : 'px-2 py-1'}`}>
          <div className="flex items-center justify-between gap-2">
            <div
              onClick={() => setIsStoreLogoModalOpen(true)}
              className={`relative rounded-xl overflow-hidden bg-[#fcfbf9] p-0.5 flex items-center justify-center shrink-0 border border-[#ede7db] cursor-pointer group/logo shadow-2xs ${
                isCompact ? 'w-11 h-11' : 'w-11 h-11'
              }`}
              title="Klik untuk ganti foto toko"
            >
              <img
                src={settings.logoUrl}
                alt={settings.storeName}
                className="w-full h-full object-cover rounded-lg group-hover/logo:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-stone-900/40 rounded-lg opacity-0 group-hover/logo:opacity-100 transition-opacity flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-[14px]">photo_camera</span>
              </div>
            </div>

            {!isCompact && (
              <div className="min-w-0 flex-1">
                <h1 className="text-[15px] font-bold text-[#1c1917] tracking-tight leading-tight truncate">
                  {settings.storeName}
                </h1>
                <p className="text-[11px] text-[#78716c] font-medium truncate">{settings.branchName}</p>
              </div>
            )}

            {!isCompact && (
              <button
                type="button"
                onClick={toggleSidebarMode}
                className="hidden md:flex w-7 h-7 rounded-lg text-[#78716c] hover:text-[#1c1917] hover:bg-stone-100 items-center justify-center transition-colors shrink-0"
                title="Perkecil menu bilah sisi (Mode Ikon Ringkas)"
              >
                <span className="material-symbols-outlined text-[18px]">first_page</span>
              </button>
            )}
          </div>
        </div>

        {/* Smart AI Quick Banner */}
        <button
          onClick={() => {
            setIsAssistantOpen(true);
            setMobileOpen(false);
          }}
          className={`mb-3 rounded-xl border border-[#ede7db] bg-[#fcfbf9] hover:bg-sky-50 hover:border-sky-200 transition-all group active:scale-[0.98] flex items-center shadow-2xs ${
            isCompact ? 'w-11 h-11 p-0 mx-auto justify-center' : 'mx-1 p-2 gap-2 text-left'
          }`}
          title="Asisten Cerdas POS (Rekomendasi & Analisis)"
        >
          <div className="w-7 h-7 rounded-lg bg-[#e0f2fe] text-[#0284c7] flex items-center justify-center shrink-0 border border-[#bae6fd]">
            <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
          </div>
          {!isCompact && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#1c1917] truncate">Asisten Cerdas POS</p>
              <p className="text-[10px] text-[#78716c] truncate">Rekomendasi Menu</p>
            </div>
          )}
        </button>

        {/* Navigation Links */}
        <nav className="flex-1 flex flex-col gap-1 overflow-y-auto pr-0.5">
          {menuItems.map((item) => {
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentScreen(item.id);
                  setMobileOpen(false);
                }}
                title={isCompact ? item.label : undefined}
                className={`relative flex items-center rounded-xl transition-all duration-150 group active:scale-[0.98] ${
                  isCompact
                    ? 'w-11 h-11 p-0 mx-auto justify-center'
                    : 'px-3 py-2 justify-between text-left'
                } ${
                  isActive
                    ? 'bg-[#e0f2fe] text-[#0369a1] font-bold border border-[#bae6fd]'
                    : 'text-[#57534e] hover:bg-[#fcfbf9] hover:text-[#1c1917]'
                }`}
              >
                <div className={`flex items-center ${isCompact ? 'justify-center' : 'gap-3 min-w-0'}`}>
                  <span
                    className={`material-symbols-outlined text-[20px] shrink-0 transition-transform group-hover:scale-105 ${
                      isActive ? 'text-[#0284c7]' : 'text-[#78716c]'
                    }`}
                    style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                  >
                    {item.icon}
                  </span>
                  {!isCompact && (
                    <span className="truncate text-xs font-medium">{item.label}</span>
                  )}
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  isCompact ? (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#0284c7] ring-2 ring-white" />
                  ) : (
                    <span className="bg-[#0284c7] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full shadow-2xs">
                      {item.badge}
                    </span>
                  )
                )}
              </button>
            );
          })}
        </nav>

        {/* Cashier Quick Status Footer */}
        <div className="pt-2 border-t border-[#ede7db] mt-auto">
          {isCompact ? (
            <div
              onClick={() => {
                setCurrentScreen('pengaturan');
                setMobileOpen(false);
              }}
              className="w-11 h-11 mx-auto rounded-xl border border-[#ede7db] bg-[#fcfbf9] flex items-center justify-center cursor-pointer hover:bg-stone-100 transition-colors"
              title={`Status: Toko ${storeStatus === 'BUKA' ? 'Buka' : 'Tutup'} (${settings.openTime} - ${settings.closeTime})`}
            >
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  storeStatus === 'BUKA'
                    ? 'bg-emerald-500'
                    : storeStatus === 'SEGERA_TUTUP'
                    ? 'bg-amber-500 animate-ping'
                    : 'bg-rose-500'
                }`}
              />
            </div>
          ) : (
            <div
              onClick={() => {
                setCurrentScreen('pengaturan');
                setMobileOpen(false);
              }}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border cursor-pointer transition-all ${
                storeStatus === 'BUKA'
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900 hover:bg-emerald-100/70'
                  : storeStatus === 'SEGERA_TUTUP'
                  ? 'bg-amber-50 border-amber-200 text-amber-900 hover:bg-amber-100'
                  : 'bg-rose-50/70 border-rose-200 text-rose-900 hover:bg-rose-100/70'
              }`}
              title="Klik untuk melihat jam operasional toko"
            >
              <div
                className={`w-2 h-2 rounded-full shrink-0 ${
                  storeStatus === 'BUKA'
                    ? 'bg-emerald-500'
                    : storeStatus === 'SEGERA_TUTUP'
                    ? 'bg-amber-500 animate-ping'
                    : 'bg-rose-500'
                }`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate">
                  {storeStatus === 'BUKA'
                    ? 'Toko Buka'
                    : storeStatus === 'SEGERA_TUTUP'
                    ? 'Segera Tutup'
                    : 'Toko Tutup'}
                </p>
                <p className="text-[10px] opacity-80 truncate">
                  {settings.openTime} - {settings.closeTime}
                </p>
              </div>
              <span className="material-symbols-outlined text-[14px] opacity-70">
                chevron_right
              </span>
            </div>
          )}

          {/* Active User Card & Logout Button */}
          {currentUser && (
            isCompact ? (
              <div className="mt-2 flex flex-col items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentScreen('pengaturan');
                    setMobileOpen(false);
                  }}
                  className="w-9 h-9 rounded-xl overflow-hidden border border-[#bae6fd] shadow-2xs"
                  title={`${currentUser.fullName} (${currentUser.role})`}
                >
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.fullName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://api.dicebear.com/7.x/adventurer/svg?seed=Aisyah&backgroundColor=bae6fd';
                    }}
                  />
                </button>
                <button
                  type="button"
                  onClick={logout}
                  className="w-7 h-7 rounded-lg text-[#78716c] hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors"
                  title="Logout"
                >
                  <span className="material-symbols-outlined text-[16px]">logout</span>
                </button>
              </div>
            ) : (
              <div className="mt-2 p-1.5 rounded-xl bg-[#f0f9ff] border border-[#bae6fd] flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-white border border-[#bae6fd] overflow-hidden shrink-0 shadow-2xs">
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.fullName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://api.dicebear.com/7.x/adventurer/svg?seed=Aisyah&backgroundColor=bae6fd';
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#0c4a6e] truncate leading-tight">
                      {currentUser.fullName}
                    </p>
                    <span className="inline-block text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#bae6fd] text-[#0369a1]">
                      {currentUser.role}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={logout}
                  className="w-7 h-7 rounded-lg bg-white hover:bg-rose-50 text-[#78716c] hover:text-rose-600 flex items-center justify-center border border-[#bae6fd] shadow-2xs transition-colors shrink-0"
                  title="Keluar dari Akun (Logout)"
                >
                  <span className="material-symbols-outlined text-[16px]">logout</span>
                </button>
              </div>
            )
          )}
        </div>
      </aside>
    </>
  );
};
