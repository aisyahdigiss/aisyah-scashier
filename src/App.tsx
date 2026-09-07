import React, { useState } from 'react';
import { POSProvider, usePOS } from './context/POSContext';
import { Sidebar } from './components/Sidebar';
import { TopNavbar } from './components/TopNavbar';
import { ToastContainer } from './components/ToastContainer';
import { PaymentModal } from './components/modals/PaymentModal';
import { ReceiptModal } from './components/modals/ReceiptModal';
import { SmartAssistantDrawer } from './components/common/SmartAssistantDrawer';

import { KasirScreen } from './components/screens/KasirScreen';
import { DashboardScreen } from './components/screens/DashboardScreen';
import { ProdukScreen } from './components/screens/ProdukScreen';
import { KategoriScreen } from './components/screens/KategoriScreen';
import { StokScreen } from './components/screens/StokScreen';
import { RiwayatScreen } from './components/screens/RiwayatScreen';
import { LaporanScreen } from './components/screens/LaporanScreen';
import { PengaturanScreen } from './components/screens/PengaturanScreen';

const MainLayout: React.FC = () => {
  const { currentScreen, isAssistantOpen, setIsAssistantOpen } = usePOS();
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
    <div className="min-h-screen pastel-mesh-bg text-[#1e293b] flex relative selection:bg-[#cbd5e1] selection:text-[#0f172a]">
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

      {/* Global Modals & Smart AI Drawer */}
      <ToastContainer />
      <PaymentModal />
      <ReceiptModal />
      <SmartAssistantDrawer
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
      />
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
