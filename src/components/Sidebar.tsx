import React from 'react';
import { usePOS } from '../context/POSContext';
import { ScreenType } from '../types';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const { currentScreen, setCurrentScreen, cart, setIsAssistantOpen } = usePOS();

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
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-stone-900/40 z-40 md:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen w-[280px] bg-[#fffdfa]/95 backdrop-blur-md shadow-[0px_4px_25px_rgba(168,153,128,0.12)] border-r border-[#ede5d8] flex flex-col py-4 px-4 z-50 transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-3.5 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#fef9c3] p-1 flex items-center justify-center shrink-0 shadow-xs border border-[#fde68a]">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCE2HoiLmZQRIX6cFoOKSRMEEJtVyOOFgHnp5PRNcZbvnRO3dfYq60cJnzl4K_XNQkA2ikHEbZO_3oMjCbrGnws0-5ngiCx52fpFNgaihVDKuL_0zDlla_HKcC9kmXBZy-Ytp00I1hUGSd3sKUf8E_r6oWgFxpAmn0tYwvtMLGUZERefT5TaPoD6Z4EI2UGCpixZq0IobaHBcYfgf5DtkVozMMreTLwW1Wc84CWtRcReTn4qlWgVe7dLA"
              alt="KASIRKU POS"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-[20px] font-extrabold text-[#292524] tracking-tight leading-none">
                KASIRKU
              </h1>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#fef9c3] text-[#713f12] border border-[#fde68a]">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-[#78716c] font-medium mt-0.5">Sistem Kasir Toko</p>
          </div>
        </div>

        {/* Smart AI Quick Banner */}
        <button
          onClick={() => {
            setIsAssistantOpen(true);
            setMobileOpen(false);
          }}
          className="mx-1 mb-3 p-2.5 rounded-2xl bg-[#fdfbf7] hover:bg-[#fef9c3] border border-[#ede5d8] text-left flex items-center gap-2.5 transition-all group active:scale-[0.98] shadow-2xs"
        >
          <div className="w-8 h-8 rounded-xl bg-[#fef9c3] text-[#713f12] flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform border border-[#fde68a]">
            <span className="material-symbols-outlined text-lg">auto_awesome</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[#292524] truncate">Asisten Cerdas POS</p>
            <p className="text-[10px] text-[#78716c] truncate">Bundle & Rekomendasi Menu</p>
          </div>
        </button>

        {/* Navigation Links */}
        <nav className="flex-1 flex flex-col gap-1.5 overflow-y-auto pr-1">
          {menuItems.map((item) => {
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentScreen(item.id);
                  setMobileOpen(false);
                }}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-all duration-200 text-left font-medium text-[14px] group active:scale-[0.98] ${
                  isActive
                    ? 'bg-[#fef9c3] text-[#713f12] font-bold shadow-xs border border-[#fde68a]'
                    : 'text-[#57534e] hover:bg-[#f7f3eb] hover:text-[#292524]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`material-symbols-outlined text-[20px] transition-transform group-hover:scale-110 ${
                      isActive ? 'text-[#854d0e]' : 'text-[#78716c]'
                    }`}
                    style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                  >
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="bg-[#fef08a] text-[#713f12] text-[11px] font-extrabold px-2 py-0.5 rounded-full shadow-xs border border-[#fde68a]">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Cashier Quick Status Footer */}
        <div className="pt-3 border-t border-[#ede5d8] mt-auto">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-[#fdfbf7] border border-[#ede5d8]">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#292524] truncate">Sistem Online</p>
              <p className="text-[10px] text-[#78716c]">Cloud Sync Realtime</p>
            </div>
            <span className="text-xs font-mono font-bold text-[#713f12] bg-[#fef9c3] px-2 py-0.5 rounded-md border border-[#fde68a]">
              OK
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
