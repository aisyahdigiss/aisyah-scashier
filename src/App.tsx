import React, { useState } from 'react';
import { POSProvider, usePOS } from './context/POSContext';
import { Sidebar } from './components/Sidebar';
import { TopNavbar } from './components/TopNavbar';
import { ToastContainer } from './components/ToastContainer';
import { PaymentModal } from './components/modals/PaymentModal';
import { ReceiptModal } from './components/modals/ReceiptModal';

import { KasirScreen } from './components/screens/KasirScreen';
import { DashboardScreen } from './components/screens/DashboardScreen';
import { ProdukScreen } from './components/screens/ProdukScreen';
import { KategoriScreen } from './components/screens/KategoriScreen';
import { StokScreen } from './components/screens/StokScreen';
import { RiwayatScreen } from './components/screens/RiwayatScreen';
import { LaporanScreen } from './components/screens/LaporanScreen';
import { PengaturanScreen } from './components/screens/PengaturanScreen';

const MainLayout: React.FC = () => {
  const { currentScreen } = usePOS();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const renderActiveScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <DashboardScreen />;
      case 'kasir':
        return <KasirScreen />;
      case 'produk':
        return <ProdukScreen />;
      case 'kategori':
        return <KategoriScreen />;
      case 'stok':
        return <StokScreen />;
      case 'riwayat':
        return <RiwayatScreen />;
      case 'laporan':
        return <LaporanScreen />;
      case 'pengaturan':
        return <PengaturanScreen />;
      default:
        return <KasirScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-[#fff9f0] text-[#1d1b16] flex">
      {/* Sidebar Navigation */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Main Content Body */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-[280px]">
        {/* Top Header Navbar */}
        <TopNavbar onToggleMobileMenu={() => setMobileSidebarOpen((prev) => !prev)} />

        {/* Content View Container */}
        <main className="flex-1 px-4 md:px-8 pt-24 pb-8 overflow-y-auto">
          {renderActiveScreen()}
        </main>
      </div>

      {/* Global Modals & Notifications */}
      <ToastContainer />
      <PaymentModal />
      <ReceiptModal />
    </div>
  );
};

export default function App() {
  return (
    <POSProvider>
      <MainLayout />
    </POSProvider>
  );
}

