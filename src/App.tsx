import React, { useState } from 'react';
import { POSProvider, usePOS } from './context/POSContext';
import { Sidebar } from './components/Sidebar';
import { TopNavbar } from './components/TopNavbar';
import { ToastContainer } from './components/ToastContainer';
import { PaymentModal } from './components/modals/PaymentModal';
import { ReceiptModal } from './components/modals/ReceiptModal';
import { StoreLogoModal } from './components/modals/StoreLogoModal';
import { HeldOrdersModal } from './components/modals/HeldOrdersModal';
import { ClosingShiftModal } from './components/modals/ClosingShiftModal';
import { ChangePhotoModal } from './components/modals/ChangePhotoModal';
import { SmartAssistantDrawer } from './components/common/SmartAssistantDrawer';
import { AuthScreen } from './components/auth/AuthScreen';

import { KasirScreen } from './components/screens/KasirScreen';
import { DashboardScreen } from './components/screens/DashboardScreen';
import { ProdukScreen } from './components/screens/ProdukScreen';
import { KategoriScreen } from './components/screens/KategoriScreen';
import { StokScreen } from './components/screens/StokScreen';
import { RiwayatScreen } from './components/screens/RiwayatScreen';
import { LaporanScreen } from './components/screens/LaporanScreen';
import { PengaturanScreen } from './components/screens/PengaturanScreen';

const MainLayout: React.FC = () => {
  const {
    currentScreen,
    isAssistantOpen,
    setIsAssistantOpen,
    currentUser,
    sidebarMode,
    zenFocusMode,
    eyeCareTheme,
    antiGlareFilter,
    uiDensity,
    isPhotoModalOpen,
    setIsPhotoModalOpen,
  } = usePOS();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const isCompact = sidebarMode === 'compact' && !zenFocusMode;
  const isHidden = sidebarMode === 'hidden' || zenFocusMode;

  // If not logged in, render the Login and Register Screen
  if (!currentUser) {
    return (
      <div
        data-theme={eyeCareTheme}
        className={`min-h-screen ${antiGlareFilter ? 'antiglare-active' : ''}`}
      >
        <AuthScreen />
        <ToastContainer />
      </div>
    );
  }

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

  const getThemeBgClass = () => {
    switch (eyeCareTheme) {
      case 'matcha-sage':
        return 'bg-[#eff5ee]';
      case 'slate-charcoal':
        return 'bg-[#18181b]';
      case 'nordic-sky':
        return 'bg-[#eff5f9]';
      case 'warm-beige':
      default:
        return 'bg-[#f6f4ee]';
    }
  };

  return (
    <div
      data-theme={eyeCareTheme}
      className={`min-h-screen ${getThemeBgClass()} ${
        antiGlareFilter ? 'antiglare-active' : ''
      } text-[#1c1917] flex relative selection:bg-[#cbd5e1] selection:text-[#0f172a] transition-colors duration-300`}
    >
      {/* Sidebar Navigation */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Main Content Body */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isCompact ? 'md:pl-[76px]' : isHidden ? 'md:pl-0' : 'md:pl-[260px]'
        }`}
      >
        {/* Top Header Navbar */}
        <TopNavbar onToggleMobileMenu={() => setMobileSidebarOpen((prev) => !prev)} />

        {/* Content View Container */}
        <main
          className={`flex-1 ${
            uiDensity === 'compact' ? 'px-2 sm:px-4 pt-20 pb-4' : 'px-3 sm:px-6 md:px-8 pt-22 pb-8'
          } overflow-y-auto`}
        >
          {renderActiveScreen()}
        </main>
      </div>

      {/* Global Modals & Smart AI Drawer */}
      <ToastContainer />
      <PaymentModal />
      <ReceiptModal />
      <StoreLogoModal />
      <HeldOrdersModal />
      <ClosingShiftModal />
      <ChangePhotoModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
      />
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
