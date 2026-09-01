import React from 'react';
import { usePOS } from '../context/POSContext';
import { ScreenType } from '../types';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const { currentScreen, setCurrentScreen, cart } = usePOS();

  const menuItems: { id: ScreenType; label: string; icon: string; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'kasir', label: 'Kasir', icon: 'point_of_sale', badge: cart.length > 0 ? cart.reduce((acc, c) => acc + c.quantity, 0) : undefined },
    { id: 'produk', label: 'Produk', icon: 'inventory_2' },
    { id: 'kategori', label: 'Kategori', icon: 'category' },
    { id: 'stok', label: 'Stok', icon: 'layers' },
    { id: 'riwayat', label: 'Riwayat Penjualan', icon: 'receipt_long' },
    { id: 'laporan', label: 'Laporan', icon: 'assessment' },
    { id: 'pengaturan', label: 'Pengaturan', icon: 'settings' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen w-[280px] bg-white shadow-[0px_4px_20px_rgba(162,210,255,0.15)] flex flex-col py-4 px-4 z-50 transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center gap-3.5 px-2 py-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#cde5ff]/60 p-1 flex items-center justify-center shrink-0 shadow-sm border border-[#a2d2ff]/30">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCE2HoiLmZQRIX6cFoOKSRMEEJtVyOOFgHnp5PRNcZbvnRO3dfYq60cJnzl4K_XNQkA2ikHEbZO_3oMjCbrGnws0-5ngiCx52fpFNgaihVDKuL_0zDlla_HKcC9kmXBZy-Ytp00I1hUGSd3sKUf8E_r6oWgFxpAmn0tYwvtMLGUZERefT5TaPoD6Z4EI2UGCpixZq0IobaHBcYfgf5DtkVozMMreTLwW1Wc84CWtRcReTn4qlWgVe7dLA"
              alt="KASIRKU POS"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
          <div>
            <h1 className="text-[22px] font-bold text-[#30628a] tracking-tight leading-none">
              KASIRKU
            </h1>
            <p className="text-[13px] font-medium text-[#41474e] mt-1">POS System</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 flex flex-col gap-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentScreen(item.id);
                  setMobileOpen(false);
                }}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 text-left font-medium text-[15px] group active:scale-[0.98] ${
                  isActive
                    ? 'bg-[#bee1ff] text-[#001e2f] border-l-4 border-[#30628a] font-bold shadow-xs'
                    : 'text-[#41474e] hover:bg-[#f9f3ea] hover:text-[#1d1b16]'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span
                    className={`material-symbols-outlined text-[22px] transition-transform group-hover:scale-110 ${
                      isActive ? 'text-[#30628a]' : 'text-[#41474e]'
                    }`}
                    style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="bg-[#30628a] text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-xs">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Cashier Quick Status Footer */}
        <div className="pt-3 border-t border-[#ede7df] mt-auto">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[#f9f3ea] border border-[#ede7df]/80">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#1d1b16] truncate">Kasir Online</p>
              <p className="text-[11px] text-[#41474e]">Cloud Sync Realtime</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
