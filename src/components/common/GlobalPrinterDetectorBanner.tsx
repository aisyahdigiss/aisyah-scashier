import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';

export const GlobalPrinterDetectorBanner: React.FC = () => {
  const {
    activePrinter,
    isPrinterScanning,
    printerConfig,
    globalPrinterBannerVisible,
    setGlobalPrinterBannerVisible,
    openPrinterModal,
    autoDetectPrinter,
    printTestReceipt,
    playBeep,
  } = usePOS();

  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);

  // If user dismissed completely
  if (!globalPrinterBannerVisible) {
    return (
      <button
        type="button"
        onClick={() => setGlobalPrinterBannerVisible(true)}
        className="fixed bottom-4 right-4 z-40 bg-stone-900/90 text-white hover:bg-stone-800 p-2.5 rounded-full shadow-lg border border-stone-700/50 backdrop-blur-md flex items-center gap-2 text-xs font-semibold transition-all hover:scale-105 active:scale-95 cursor-pointer"
        title="Buka Status Printer Global"
      >
        <span className={`material-symbols-outlined text-[18px] ${activePrinter ? 'text-emerald-400' : 'text-stone-400'}`}>
          {activePrinter?.type === 'bluetooth' ? 'bluetooth' : 'print'}
        </span>
        <span className="hidden sm:inline">
          {activePrinter ? activePrinter.name.slice(0, 14) : 'Printer Mini'}
        </span>
        {activePrinter && (
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        )}
      </button>
    );
  }

  const handleTestPrint = async () => {
    setIsTesting(true);
    playBeep('beep');
    try {
      await printTestReceipt();
    } finally {
      setIsTesting(false);
    }
  };

  const isConnected = !!activePrinter && activePrinter.status === 'connected';

  if (isCollapsed) {
    return (
      <div className="fixed bottom-3 right-3 sm:right-6 z-40 animate-fadeIn">
        <div className="bg-stone-900/90 dark:bg-stone-950/90 text-white backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-xl border border-stone-700/60 flex items-center gap-2.5 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span
              className={`material-symbols-outlined text-[18px] ${
                isPrinterScanning
                  ? 'text-sky-400 animate-spin'
                  : isConnected
                  ? 'text-emerald-400'
                  : 'text-amber-400'
              }`}
            >
              {isPrinterScanning
                ? 'sync'
                : isConnected
                ? activePrinter?.type === 'bluetooth'
                  ? 'bluetooth_connected'
                  : 'print'
                : 'sensors'}
            </span>
            <span className="font-bold text-stone-200">
              {isPrinterScanning
                ? 'Auto-Detect Memindai...'
                : isConnected
                ? `${activePrinter.name.slice(0, 16)} (${activePrinter.paperWidth}mm)`
                : 'Printer Mini: Siap Deteksi'}
            </span>
          </div>

          <div className="h-4 w-px bg-stone-700 mx-0.5" />

          <button
            type="button"
            onClick={() => setIsCollapsed(false)}
            className="hover:text-sky-300 text-stone-400 transition-colors p-1"
            title="Perbesar Status Printer"
          >
            <span className="material-symbols-outlined text-[16px]">expand_less</span>
          </button>
          <button
            type="button"
            onClick={() => setGlobalPrinterBannerVisible(false)}
            className="hover:text-rose-400 text-stone-400 transition-colors p-1"
            title="Sembunyikan"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-6 z-40 max-w-lg w-full animate-fadeIn transition-all">
      <div
        className={`rounded-2xl backdrop-blur-md shadow-2xl border transition-all p-3.5 ${
          isConnected
            ? 'bg-stone-900/95 text-white border-emerald-500/40 shadow-emerald-950/20'
            : isPrinterScanning
            ? 'bg-stone-900/95 text-white border-sky-500/40 shadow-sky-950/20'
            : 'bg-stone-900/95 text-white border-amber-500/40 shadow-amber-950/20'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          {/* Status Indicator & Icon */}
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm relative ${
                isConnected
                  ? 'bg-emerald-600 text-white'
                  : isPrinterScanning
                  ? 'bg-sky-600 text-white'
                  : 'bg-stone-800 text-amber-400 border border-amber-500/30'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[20px] ${
                  isPrinterScanning ? 'animate-spin' : ''
                }`}
              >
                {isPrinterScanning
                  ? 'sync'
                  : isConnected
                  ? activePrinter?.type === 'bluetooth'
                    ? 'bluetooth_connected'
                    : activePrinter?.type === 'usb-serial'
                    ? 'cable'
                    : 'print'
                  : 'print_disabled'}
              </span>
              {isConnected && (
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-stone-900 animate-ping" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-xs sm:text-sm font-extrabold text-white truncate">
                  {isConnected
                    ? activePrinter.name
                    : isPrinterScanning
                    ? 'Sedang Memindai Printer Otomatis...'
                    : 'Printer Mini Belum Terhubung'}
                </h4>
                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wide uppercase ${
                    isConnected
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : isPrinterScanning
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {isConnected
                    ? `${activePrinter.type === 'bluetooth' ? 'Bluetooth BLE' : activePrinter.type === 'usb-serial' ? 'USB Serial' : 'Virtual POS'} • Siap Cetak`
                    : isPrinterScanning
                    ? 'Pemindaian Global'
                    : 'Auto-Detect Aktif'}
                </span>
              </div>

              <p className="text-[11px] text-stone-300 mt-0.5 truncate flex items-center gap-2">
                <span>
                  {isConnected
                    ? `Kertas: ${activePrinter.paperWidth}mm • Auto-Print Transaksi: ${
                        printerConfig.autoPrintOnPayment ? 'Aktif' : 'Nonaktif'
                      }`
                    : 'Sistem latar belakang siap menghubungkan printer Bluetooth / USB saat dinyalakan.'}
                </span>
                {isConnected && activePrinter.batteryLevel && (
                  <span className="text-emerald-400 font-bold shrink-0">
                    🔋 {activePrinter.batteryLevel}%
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Quick Collapse / Dismiss */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setIsCollapsed(true)}
              className="w-7 h-7 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Perkecil Banner"
            >
              <span className="material-symbols-outlined text-[16px]">expand_more</span>
            </button>
            <button
              type="button"
              onClick={() => setGlobalPrinterBannerVisible(false)}
              className="w-7 h-7 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Tutup Banner"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="mt-3 pt-2.5 border-t border-stone-800 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => autoDetectPrinter(false)}
              disabled={isPrinterScanning}
              className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-sky-400 text-xs font-bold border border-stone-700 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-[15px] ${isPrinterScanning ? 'animate-spin' : ''}`}>
                autorenew
              </span>
              <span>{isPrinterScanning ? 'Memindai...' : 'Pindai Sekarang'}</span>
            </button>

            {isConnected && (
              <button
                type="button"
                onClick={handleTestPrint}
                disabled={isTesting}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">receipt</span>
                <span>{isTesting ? 'Mencetak...' : 'Tes Cetak'}</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={openPrinterModal}
            className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer ml-auto"
          >
            <span className="material-symbols-outlined text-[15px]">settings_bluetooth</span>
            <span>Kelola & Pengaturan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
