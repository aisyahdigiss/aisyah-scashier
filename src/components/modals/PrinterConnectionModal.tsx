import React, { useState } from 'react';
import { usePOS } from '../../context/POSContext';
import { checkHardwareSupport } from '../../services/printerService';
import { PrinterDevice } from '../../types';

export const PrinterConnectionModal: React.FC = () => {
  const {
    activePrinter,
    printerList,
    isPrinterScanning,
    printerConfig,
    printerLogs,
    clearPrinterLogs,
    isPrinterModalOpen,
    setIsPrinterModalOpen,
    autoDetectPrinter,
    connectBluetoothPrinter,
    connectUsbPrinter,
    disconnectPrinter,
    setPrinterPaperWidth,
    updatePrinterConfig,
    printTestReceipt,
    playBeep,
    showToast,
  } = usePOS();

  const [activeTab, setActiveTab] = useState<'status' | 'scan' | 'logs' | 'settings'>('status');
  const [isTestPrinting, setIsTestPrinting] = useState(false);
  const [logFilter, setLogFilter] = useState<'all' | 'Bluetooth' | 'USB/Serial' | 'AutoDetect'>('all');

  if (!isPrinterModalOpen) return null;

  const hardwareSupport = checkHardwareSupport();

  const handleTestPrint = async () => {
    setIsTestPrinting(true);
    playBeep('beep');
    try {
      await printTestReceipt();
    } finally {
      setIsTestPrinting(false);
    }
  };

  const handleSelectSimulatedPrinter = () => {
    const simDevice: PrinterDevice = {
      id: 'sim-printer-active',
      name: `Printer Thermal Mini ${printerConfig.paperWidth}mm (Virtual POS)`,
      type: 'simulator',
      paperWidth: printerConfig.paperWidth,
      status: 'connected',
      lastConnectedAt: new Date().toISOString(),
      signalStrength: 'Sangat Kuat',
      batteryLevel: 100,
    };
    localStorage.setItem('kasirku_active_printer', JSON.stringify(simDevice));
    autoDetectPrinter(true);
    playBeep('success');
    showToast('Printer Virtual siap digunakan secara otomatis!', 'success');
  };

  const filteredLogs = printerLogs.filter((log) => {
    if (logFilter === 'all') return true;
    return log.source === logFilter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="bg-white dark:bg-stone-900 rounded-3xl border border-[#ede5d8] dark:border-stone-800 shadow-2xl max-w-2xl w-full overflow-hidden transition-all transform scale-100 flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="p-5 bg-linear-to-r from-[#f0f9ff] via-[#e0f2fe] to-[#f8fafc] dark:from-stone-900 dark:via-stone-850 dark:to-stone-900 border-b border-[#bae6fd] dark:border-stone-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#0284c7] text-white flex items-center justify-center shadow-md shrink-0 relative">
              <span className="material-symbols-outlined text-[24px]">print</span>
              {activePrinter && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-stone-900 animate-pulse" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-extrabold text-[#0c4a6e] dark:text-sky-300">
                  Deteksi Printer Mini & Bluetooth Global
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-[#bae6fd] dark:bg-sky-950 text-[#0369a1] dark:text-sky-300 whitespace-nowrap">
                  ESC/POS Ritel & Portabel
                </span>
              </div>
              <p className="text-xs text-[#0369a1] dark:text-sky-400">
                Sistem otomatis memindai koneksi printer Bluetooth, kabel USB thermal, dan driver sistem.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsPrinterModalOpen(false)}
            className="w-8 h-8 rounded-full bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 flex items-center justify-center border border-stone-200 dark:border-stone-700 transition-colors shadow-2xs cursor-pointer"
            aria-label="Tutup"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-stone-100 dark:border-stone-800 px-4 sm:px-6 pt-2 bg-[#fcfbf9] dark:bg-stone-900/60 gap-1 sm:gap-2 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('status')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'status'
                ? 'border-[#0284c7] text-[#0284c7] dark:text-sky-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">sensors</span>
            <span>Status & Sambungan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('scan')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'scan'
                ? 'border-[#0284c7] text-[#0284c7] dark:text-sky-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
            }`}
          >
            <span className={`material-symbols-outlined text-[16px] ${isPrinterScanning ? 'animate-spin' : ''}`}>
              bluetooth_searching
            </span>
            <span>Deteksi & Pindai Port</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('logs')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'logs'
                ? 'border-[#0284c7] text-[#0284c7] dark:text-sky-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">receipt_long</span>
            <span>Log Deteksi ({printerLogs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'settings'
                ? 'border-[#0284c7] text-[#0284c7] dark:text-sky-400'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">tune</span>
            <span>Pengaturan Otomatis</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* TAB 1: STATUS & SAMBUNGAN AKTIF */}
          {activeTab === 'status' && (
            <div className="space-y-4">
              {/* Active Printer Spotlight Box */}
              <div
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  activePrinter
                    ? 'bg-linear-to-r from-emerald-50 via-teal-50/50 to-white dark:from-emerald-950/20 dark:via-teal-950/10 dark:to-stone-900 border-emerald-200 dark:border-emerald-800/60 shadow-xs'
                    : 'bg-[#fcfbf9] dark:bg-stone-850 border-stone-200 dark:border-stone-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                        activePrinter
                          ? 'bg-emerald-600 text-white'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-400'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[24px]">
                        {activePrinter?.type === 'bluetooth'
                          ? 'bluetooth_connected'
                          : activePrinter?.type === 'usb-serial'
                          ? 'cable'
                          : activePrinter
                          ? 'print'
                          : 'print_disabled'}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-extrabold text-stone-900 dark:text-white truncate">
                          {activePrinter ? activePrinter.name : 'Belum Ada Printer Terhubung'}
                        </h4>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            activePrinter
                              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                              : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                          }`}
                        >
                          {activePrinter ? '● Terhubung & Siap Cetak' : 'Standby / Offline'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-stone-600 dark:text-stone-300">
                        <span>
                          Lebar Kertas:{' '}
                          <strong className="text-stone-900 dark:text-white">
                            {activePrinter?.paperWidth || printerConfig.paperWidth} mm
                          </strong>
                        </span>
                        <span>•</span>
                        <span>
                          Tipe:{' '}
                          <strong className="text-stone-900 dark:text-white">
                            {activePrinter?.type === 'bluetooth'
                              ? 'Bluetooth ESC/POS'
                              : activePrinter?.type === 'usb-serial'
                              ? 'USB / COM Serial'
                              : 'Driver Sistem / Virtual'}
                          </strong>
                        </span>
                        {activePrinter?.batteryLevel && (
                          <>
                            <span>•</span>
                            <span>Baterai: {activePrinter.batteryLevel}% 🔋</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions for connected printer */}
                  <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                    {activePrinter ? (
                      <>
                        <button
                          type="button"
                          onClick={handleTestPrint}
                          disabled={isTestPrinting}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]">receipt</span>
                          <span>{isTestPrinting ? 'Mencetak...' : 'Tes Cetak'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={disconnectPrinter}
                          className="px-2.5 py-2 rounded-xl bg-white dark:bg-stone-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 text-xs font-bold border border-rose-200 dark:border-rose-900 transition-colors shadow-2xs cursor-pointer"
                          title="Putus Sambungan Printer"
                        >
                          <span className="material-symbols-outlined text-[16px]">link_off</span>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => autoDetectPrinter(false)}
                        disabled={isPrinterScanning}
                        className="px-4 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                      >
                        <span className={`material-symbols-outlined text-[16px] ${isPrinterScanning ? 'animate-spin' : ''}`}>
                          {isPrinterScanning ? 'sync' : 'search'}
                        </span>
                        <span>{isPrinterScanning ? 'Memindai...' : 'Deteksi Sekarang'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Global Auto-Detect Engine Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/40 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#0284c7] text-white flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px]">autorenew</span>
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-sky-950 dark:text-sky-200">
                      Pemindaian Otomatis Global
                    </h5>
                    <p className="text-[11px] text-sky-800 dark:text-sky-300 mt-0.5">
                      {printerConfig.autoScanInterval
                        ? 'Aktif: Sistem memeriksa koneksi Bluetooth & port USB secara otomatis tiap 20 detik.'
                        : 'Nonaktif: Pemindaian dilakukan manual saat tombol ditekan.'}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px]">bolt</span>
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
                      Auto-Print Transaksi Kasir
                    </h5>
                    <p className="text-[11px] text-emerald-800 dark:text-emerald-300 mt-0.5">
                      {printerConfig.autoPrintOnPayment
                        ? 'Aktif: Struk langsung dicetak ke printer saat pembayaran transaksi sukses.'
                        : 'Nonaktif: Kasir mencetak struk secara manual sesuai kebutuhan.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Hardware API Compatibility Overview */}
              <div className="space-y-2 pt-1">
                <h5 className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  Dukungan Peramban & Antarmuka Perangkat Keras:
                </h5>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div
                    className={`p-2.5 rounded-xl border ${
                      hardwareSupport.bluetooth
                        ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : 'bg-stone-50 dark:bg-stone-850 text-stone-500 border-stone-200 dark:border-stone-800'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px] block mx-auto mb-0.5">
                      bluetooth
                    </span>
                    <span className="text-[10px] font-bold block">Web Bluetooth</span>
                    <span className="text-[9px] font-semibold">
                      {hardwareSupport.bluetooth ? '✓ Didukung' : '× Terbatas'}
                    </span>
                  </div>

                  <div
                    className={`p-2.5 rounded-xl border ${
                      hardwareSupport.serial
                        ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : 'bg-stone-50 dark:bg-stone-850 text-stone-500 border-stone-200 dark:border-stone-800'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px] block mx-auto mb-0.5">
                      cable
                    </span>
                    <span className="text-[10px] font-bold block">USB Serial (COM)</span>
                    <span className="text-[9px] font-semibold">
                      {hardwareSupport.serial ? '✓ Didukung' : '× Terbatas'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl border bg-sky-50 dark:bg-sky-950/20 text-[#0369a1] dark:text-sky-300 border-sky-200 dark:border-sky-800">
                    <span className="material-symbols-outlined text-[18px] block mx-auto mb-0.5">
                      print
                    </span>
                    <span className="text-[10px] font-bold block">Driver Sistem</span>
                    <span className="text-[9px] font-semibold">✓ Selalu Siap</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DETEKSI & PINDAI PORT */}
          {activeTab === 'scan' && (
            <div className="space-y-4">
              {/* Radar Sonar Banner */}
              <div className="p-4 rounded-2xl bg-linear-to-r from-sky-900 to-stone-900 text-white relative overflow-hidden flex items-center justify-between gap-4">
                <div className="relative z-10">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-extrabold text-white">
                      {isPrinterScanning
                        ? 'Memindai Sinyal Bluetooth & Port USB...'
                        : 'Pemindai Deteksi Otomatis Siap'}
                    </h4>
                    {isPrinterScanning && (
                      <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                    )}
                  </div>
                  <p className="text-xs text-sky-200 mt-1 max-w-md">
                    Nyalakan printer mini Bluetooth atau pasang kabel USB. Sistem akan mendeteksi sinyal printer dalam jarak jangkau.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => autoDetectPrinter(false)}
                  disabled={isPrinterScanning}
                  className="relative z-10 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
                >
                  <span className={`material-symbols-outlined text-[16px] ${isPrinterScanning ? 'animate-spin' : ''}`}>
                    radar
                  </span>
                  <span>{isPrinterScanning ? 'Memindai...' : 'Pindai Sekarang'}</span>
                </button>

                {/* Radar decorative circles */}
                <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full border border-sky-500/20 pointer-events-none" />
                <div className="absolute -right-16 -bottom-16 w-56 h-56 rounded-full border border-sky-500/10 pointer-events-none" />
              </div>

              {/* Connection Types Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Bluetooth Mini Printer */}
                <div className="p-4 rounded-2xl border border-sky-100 dark:border-sky-900/50 bg-[#f0f9ff] dark:bg-sky-950/20 flex flex-col justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#0284c7] text-white flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">bluetooth</span>
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-stone-900 dark:text-white">
                        Printer Bluetooth Mini (58mm/80mm)
                      </h5>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 leading-relaxed">
                        Panda, Blueprint, VSC, Eppos, Goojprt, Zjiang, BellaV portabel.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={connectBluetoothPrinter}
                    disabled={isPrinterScanning}
                    className="w-full py-2.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">add_link</span>
                    <span>Pasangkan Bluetooth</span>
                  </button>
                </div>

                {/* 2. USB Serial Thermal */}
                <div className="p-4 rounded-2xl border border-amber-100 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 flex flex-col justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">cable</span>
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-stone-900 dark:text-white">
                        Kabel USB / Serial Thermal (COM)
                      </h5>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 leading-relaxed">
                        Printer kasir thermal yang terhubung kabel USB ke PC/Laptop kasir.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={connectUsbPrinter}
                    disabled={isPrinterScanning}
                    className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">usb</span>
                    <span>Pilih Port USB</span>
                  </button>
                </div>

                {/* 3. Driver Sistem Bawaan */}
                <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-850 flex flex-col justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-stone-700 text-white flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">laptop</span>
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-stone-900 dark:text-white">
                        Driver Sistem OS (Windows/Mac/Linux)
                      </h5>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 leading-relaxed">
                        Gunakan printer yang terinstal di panel kontrol perangkat Anda.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleTestPrint}
                    className="w-full py-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-stone-200 dark:border-stone-700"
                  >
                    <span className="material-symbols-outlined text-[16px]">print</span>
                    <span>Cetak via Driver</span>
                  </button>
                </div>

                {/* 4. Simulator Thermal Virtual */}
                <div className="p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 flex flex-col justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">smart_toy</span>
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-stone-900 dark:text-white">
                        Printer Thermal Virtual (Simulasi)
                      </h5>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 leading-relaxed">
                        Uji coba cetak struk tanpa perangkat fisik, langsung siap digunakan.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSelectSimulatedPrinter}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    <span>Aktifkan Virtual</span>
                  </button>
                </div>
              </div>

              {/* Discovered / Remembered Devices List */}
              {printerList.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h5 className="text-xs font-bold text-stone-700 dark:text-stone-300">
                    Daftar Printer Tersimpan / Terdeteksi ({printerList.length}):
                  </h5>
                  <div className="space-y-1.5">
                    {printerList.map((dev) => {
                      const isConnected = activePrinter?.id === dev.id;
                      return (
                        <div
                          key={dev.id}
                          className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                            isConnected
                              ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
                              : 'bg-white dark:bg-stone-850 border-stone-200 dark:border-stone-800 hover:bg-stone-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="material-symbols-outlined text-[18px] text-stone-500">
                              {dev.type === 'bluetooth' ? 'bluetooth' : 'print'}
                            </span>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-stone-900 dark:text-white truncate">
                                {dev.name}
                              </p>
                              <span className="text-[10px] text-stone-500 dark:text-stone-400">
                                {dev.paperWidth}mm • {dev.type}
                              </span>
                            </div>
                          </div>

                          {isConnected ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              Aktif
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                localStorage.setItem('kasirku_active_printer', JSON.stringify(dev));
                                autoDetectPrinter(false);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 text-xs font-bold text-stone-700 dark:text-stone-300"
                            >
                              Gunakan
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LOG DETEKSI OTOMATIS (LIVE DIAGNOSTICS) */}
          {activeTab === 'logs' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-stone-100 dark:border-stone-800">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-stone-700 dark:text-stone-300">Filter Sumber:</span>
                  {(['all', 'AutoDetect', 'Bluetooth', 'USB/Serial'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setLogFilter(mode)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                        logFilter === mode
                          ? 'bg-[#0284c7] text-white'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                      }`}
                    >
                      {mode === 'all' ? 'Semua' : mode}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={clearPrinterLogs}
                  className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[15px]">delete_sweep</span>
                  <span>Bersihkan Log</span>
                </button>
              </div>

              {/* Log List */}
              <div className="bg-stone-950 text-stone-200 font-mono text-[11px] rounded-2xl p-4 max-h-80 overflow-y-auto space-y-2 border border-stone-800 shadow-inner">
                {filteredLogs.length === 0 ? (
                  <p className="text-stone-500 italic text-center py-6">
                    Belum ada riwayat aktivitas deteksi printer.
                  </p>
                ) : (
                  filteredLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-2.5 pb-1 border-b border-stone-850">
                      <span className="text-stone-500 shrink-0">[{log.timestamp}]</span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase shrink-0 ${
                          log.source === 'Bluetooth'
                            ? 'bg-sky-950 text-sky-400 border border-sky-800'
                            : log.source === 'USB/Serial'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        }`}
                      >
                        {log.source}
                      </span>
                      <span
                        className={`break-words ${
                          log.type === 'error'
                            ? 'text-rose-400'
                            : log.type === 'warning'
                            ? 'text-amber-300'
                            : log.type === 'success'
                            ? 'text-emerald-400'
                            : 'text-stone-300'
                        }`}
                      >
                        {log.message}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: PENGATURAN OTOMATIS & CETAK */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              {/* Paper Width Selection */}
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                  Lebar Kertas Struk Kasir
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPrinterPaperWidth(58)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      printerConfig.paperWidth === 58
                        ? 'bg-[#e0f2fe] dark:bg-sky-950/40 border-[#0284c7] dark:border-sky-500 text-[#0369a1] dark:text-sky-300 ring-2 ring-sky-100 shadow-xs'
                        : 'bg-white dark:bg-stone-850 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold">58 mm (Mini Portabel)</span>
                      {printerConfig.paperWidth === 58 && (
                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                      Standar printer Bluetooth saku kasir ritel, kafe, & UMKM (32 karakter/baris).
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPrinterPaperWidth(80)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      printerConfig.paperWidth === 80
                        ? 'bg-[#e0f2fe] dark:bg-sky-950/40 border-[#0284c7] dark:border-sky-500 text-[#0369a1] dark:text-sky-300 ring-2 ring-sky-100 shadow-xs'
                        : 'bg-white dark:bg-stone-850 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold">80 mm (Standar POS)</span>
                      {printerConfig.paperWidth === 80 && (
                        <span className="material-symbols-outlined text-[18px]">check_circle</span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1">
                      Standar printer kasir besar restoran & minimarket (48 karakter/baris).
                    </p>
                  </button>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-2.5 pt-2 border-t border-stone-100 dark:border-stone-800">
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#fcfbf9] dark:bg-stone-850 border border-stone-200 dark:border-stone-800">
                  <div>
                    <h5 className="text-xs font-bold text-stone-800 dark:text-stone-200">
                      Deteksi Otomatis Saat Buka Aplikasi (Launch Scan)
                    </h5>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      Memindai perangkat Bluetooth/USB yang telah dipasangkan setiap kali POS dibuka.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={printerConfig.autoDetectOnLaunch}
                    onChange={(e) => updatePrinterConfig({ autoDetectOnLaunch: e.target.checked })}
                    className="w-4 h-4 text-[#0284c7] rounded border-stone-300"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#fcfbf9] dark:bg-stone-850 border border-stone-200 dark:border-stone-800">
                  <div>
                    <h5 className="text-xs font-bold text-stone-800 dark:text-stone-200">
                      Sambung Ulang Otomatis (Auto-Reconnect)
                    </h5>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      Jika koneksi printer terputus sesaat, sistem otomatis mencoba menyambung kembali.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={printerConfig.autoReconnect}
                    onChange={(e) => updatePrinterConfig({ autoReconnect: e.target.checked })}
                    className="w-4 h-4 text-[#0284c7] rounded border-stone-300"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#fcfbf9] dark:bg-stone-850 border border-stone-200 dark:border-stone-800">
                  <div>
                    <h5 className="text-xs font-bold text-stone-800 dark:text-stone-200">
                      Pemindaian Berkala Latar Belakang (Tiap 20 Detik)
                    </h5>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      Mendeteksi printer otomatis saat printer baru dinyalakan tanpa perlu klik tombol.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={printerConfig.autoScanInterval}
                    onChange={(e) => updatePrinterConfig({ autoScanInterval: e.target.checked })}
                    className="w-4 h-4 text-[#0284c7] rounded border-stone-300"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#fcfbf9] dark:bg-stone-850 border border-stone-200 dark:border-stone-800">
                  <div>
                    <h5 className="text-xs font-bold text-stone-800 dark:text-stone-200">
                      Notifikasi Suara & Toast Saat Tersambung
                    </h5>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      Memberikan nada lonceng sukses dan pesan ketika printer berhasil terhubung.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={printerConfig.notifyOnConnectionChange}
                    onChange={(e) => updatePrinterConfig({ notifyOnConnectionChange: e.target.checked })}
                    className="w-4 h-4 text-[#0284c7] rounded border-stone-300"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#fcfbf9] dark:bg-stone-850 border border-stone-200 dark:border-stone-800">
                  <div>
                    <h5 className="text-xs font-bold text-stone-800 dark:text-stone-200">
                      Cetak Otomatis Setiap Transaksi Selesai
                    </h5>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      Struk langsung dicetak ke printer thermal begitu pembayaran kasir sukses.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={printerConfig.autoPrintOnPayment}
                    onChange={(e) => updatePrinterConfig({ autoPrintOnPayment: e.target.checked })}
                    className="w-4 h-4 text-[#0284c7] rounded border-stone-300"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#fcfbf9] dark:bg-stone-850 border border-stone-200 dark:border-stone-800">
                  <div>
                    <h5 className="text-xs font-bold text-stone-800 dark:text-stone-200">
                      Potong Kertas Otomatis (Auto-Cut ESC/POS)
                    </h5>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      Kirim perintah pemotong kertas otomatis setelah baris struk selesai dicetak.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={printerConfig.cutPaper}
                    onChange={(e) => updatePrinterConfig({ cutPaper: e.target.checked })}
                    className="w-4 h-4 text-[#0284c7] rounded border-stone-300"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Action Bar */}
        <div className="p-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between shrink-0 bg-stone-50 dark:bg-stone-900">
          <button
            type="button"
            onClick={handleTestPrint}
            disabled={isTestPrinting}
            className="px-4 py-2 rounded-xl bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-stone-200 dark:border-stone-700 shadow-2xs"
          >
            <span className="material-symbols-outlined text-[16px]">receipt_long</span>
            <span>{isTestPrinting ? 'Mencetak...' : 'Cetak Struk Tes'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPrinterModalOpen(false)}
            className="px-6 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
