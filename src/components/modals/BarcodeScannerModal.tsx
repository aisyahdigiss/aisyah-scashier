import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { usePOS } from '../../context/POSContext';
import { Product } from '../../types';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'cart' | 'input';
  onScanCode?: (code: string) => void;
  title?: string;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  mode = 'cart',
  onScanCode,
  title,
}) => {
  const { products, scanBarcodeAndAddToCart, showToast, playBeep } = usePOS();

  const [manualCode, setManualCode] = useState<string>('');
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [availableCameras, setAvailableCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [lastScannedResult, setLastScannedResult] = useState<{
    code: string;
    product?: Product;
    success: boolean;
    timestamp: number;
  } | null>(null);
  const [scanHistory, setScanHistory] = useState<
    Array<{ code: string; name: string; price: number; time: string }>
  >([]);
  const [continuousMode, setContinuousMode] = useState<boolean>(true);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const lastScanTimestampRef = useRef<number>(0);
  const lastScannedCodeRef = useRef<string>('');
  const scannerContainerId = 'kasirku-barcode-reader';

  // Available sample products for instant one-click testing
  const sampleProducts = products.filter((p) => p.barcode || p.sku).slice(0, 6);

  // Process a scanned or entered code
  const handleProcessBarcode = (rawCode: string) => {
    const code = rawCode.trim();
    if (!code) return;

    // Cooldown check for continuous scanning (prevent spamming same code within 1.2s)
    const now = Date.now();
    if (
      continuousMode &&
      code === lastScannedCodeRef.current &&
      now - lastScanTimestampRef.current < 1200
    ) {
      return;
    }

    lastScanTimestampRef.current = now;
    lastScannedCodeRef.current = code;

    // Mode: input (for ProdukScreen form)
    if (mode === 'input') {
      playBeep('success');
      setLastScannedResult({ code, success: true, timestamp: now });
      showToast(`Barcode terbaca: ${code}`, 'success');
      if (onScanCode) {
        onScanCode(code);
      }
      setTimeout(() => {
        onClose();
      }, 400);
      return;
    }

    // Mode: cart (for KasirScreen)
    const result = scanBarcodeAndAddToCart(code);
    setLastScannedResult({
      code,
      product: result.product,
      success: result.success,
      timestamp: now,
    });

    if (result.success && result.product) {
      const time = new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setScanHistory((prev) => [
        {
          code,
          name: result.product!.name,
          price: result.product!.price,
          time,
        },
        ...prev.slice(0, 9),
      ]);

      // If single-scan mode, close modal after short delay
      if (!continuousMode) {
        setTimeout(() => {
          onClose();
        }, 600);
      }
    }
  };

  // Start Camera scanning using html5-qrcode
  const startCamera = async (cameraId?: string) => {
    setCameraError(null);

    try {
      // Get cameras if not yet loaded
      if (availableCameras.length === 0) {
        try {
          const devices = await Html5Qrcode.getCameras();
          if (devices && devices.length > 0) {
            setAvailableCameras(devices);
            if (!cameraId) {
              // Prefer back camera if available
              const backCam = devices.find(
                (d) =>
                  d.label.toLowerCase().includes('back') ||
                  d.label.toLowerCase().includes('rear') ||
                  d.label.toLowerCase().includes('belakang')
              );
              cameraId = backCam ? backCam.id : devices[0].id;
              setSelectedCameraId(cameraId);
            }
          }
        } catch {
          // Continue with default environment constraint
        }
      }

      // Cleanup existing instance if any
      if (html5QrCodeRef.current) {
        try {
          if (html5QrCodeRef.current.isScanning) {
            await html5QrCodeRef.current.stop();
          }
          await html5QrCodeRef.current.clear();
        } catch {
          // ignore cleanup errors
        }
        html5QrCodeRef.current = null;
      }

      const html5QrCode = new Html5Qrcode(scannerContainerId);
      html5QrCodeRef.current = html5QrCode;

      const cameraConfig = cameraId
        ? { deviceId: { exact: cameraId } }
        : { facingMode: 'environment' };

      const qrConfig = {
        fps: 15,
        qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
          const minDim = Math.min(viewfinderWidth, viewfinderHeight);
          return {
            width: Math.floor(minDim * 0.85),
            height: Math.floor(minDim * 0.55),
          };
        },
        aspectRatio: 1.333,
      };

      await html5QrCode.start(
        cameraConfig,
        qrConfig,
        (decodedText) => {
          handleProcessBarcode(decodedText);
        },
        () => {
          // Normal frame pass without barcode detected
        }
      );

      setCameraActive(true);
    } catch (err: any) {
      console.warn('Camera start error:', err);
      setCameraActive(false);
      setCameraError(
        err?.message ||
          'Kamera tidak dapat diakses. Pastikan izin kamera aktif atau gunakan input manual & sampel barcode di bawah.'
      );
    }
  };

  // Stop Camera
  const stopCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        await html5QrCodeRef.current.clear();
      } catch (err) {
        console.warn('Error stopping scanner:', err);
      }
      html5QrCodeRef.current = null;
    }
    setCameraActive(false);
  };

  // Effect when modal open state changes
  useEffect(() => {
    if (isOpen) {
      // Small timeout to allow DOM element to render
      const timer = setTimeout(() => {
        startCamera(selectedCameraId);
      }, 150);
      return () => clearTimeout(timer);
    } else {
      stopCamera();
      setLastScannedResult(null);
      setManualCode('');
    }
  }, [isOpen]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleProcessBarcode(manualCode.trim());
    setManualCode('');
  };

  if (!isOpen) return null;

  return (
    <div
      id="barcode-scanner-modal-backdrop"
      className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        id="barcode-scanner-modal-content"
        className="bg-white rounded-3xl p-5 sm:p-6 max-w-xl w-full border-2 border-[#cbd5e1] shadow-2xl space-y-4 my-6 text-[#0f172a] animate-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#0284c7] text-white flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[24px]">barcode_scanner</span>
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-[#0f172a] tracking-tight flex items-center gap-2">
                <span>{title || (mode === 'cart' ? 'Scan Barcode Kasir' : 'Scan Barcode Produk')}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd]">
                  {mode === 'cart' ? 'POS Register' : 'Input SKU'}
                </span>
              </h2>
              <p className="text-xs font-semibold text-[#64748b]">
                {mode === 'cart'
                  ? 'Arahkan kamera ke barcode barang atau ketik/klik sampel untuk masukkan ke keranjang.'
                  : 'Scan barcode produk fisik untuk otomatis mengisi kode SKU / barcode.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup Scanner"
            className="p-1.5 rounded-full hover:bg-stone-100 text-[#64748b] hover:text-[#0f172a] transition-colors"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        {/* Live Camera Scanner Box */}
        <div className="relative rounded-2xl overflow-hidden bg-stone-900 border-2 border-stone-800 shadow-inner flex flex-col items-center justify-center min-h-[220px] sm:min-h-[260px]">
          {/* Target for html5-qrcode */}
          <div id={scannerContainerId} className="w-full max-w-md overflow-hidden" />

          {/* Animated Laser Overlay when active */}
          {cameraActive && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
              {/* Target box viewfinder boundary */}
              <div className="relative w-64 h-36 sm:w-72 sm:h-44 border-2 border-dashed border-[#38bdf8]/80 rounded-2xl shadow-[0_0_20px_rgba(56,189,248,0.2)]">
                {/* Corner accents */}
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-[#0284c7]" />
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-[#0284c7]" />
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-[#0284c7]" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-[#0284c7]" />

                {/* Animated scanning laser line */}
                <div className="w-full h-0.5 bg-rose-500 shadow-[0_0_12px_#f43f5e] animate-pulse relative top-1/2 -translate-y-1/2" />
              </div>
              <p className="mt-3 text-[11px] font-bold text-white/90 bg-stone-950/80 px-3 py-1 rounded-full backdrop-blur-xs border border-white/20">
                Posisikan barcode di dalam kotak scanner
              </p>
            </div>
          )}

          {/* Fallback / Permission Error State */}
          {!cameraActive && (
            <div className="p-6 text-center text-white space-y-3 max-w-sm">
              <div className="w-12 h-12 rounded-full bg-stone-800 text-amber-400 flex items-center justify-center mx-auto border border-stone-700">
                <span className="material-symbols-outlined text-[26px]">videocam_off</span>
              </div>
              <div>
                <p className="font-bold text-sm text-stone-200">
                  {cameraError ? 'Kamera Belum Aktif' : 'Menghubungkan ke Kamera...'}
                </p>
                <p className="text-xs text-stone-400 mt-1">
                  {cameraError ||
                    'Klik tombol coba lagi atau gunakan input manual & sampel barcode di bawah.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => startCamera(selectedCameraId)}
                className="px-4 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-black shadow-md transition-transform active:scale-95 flex items-center gap-1.5 mx-auto"
              >
                <span className="material-symbols-outlined text-[16px]">refresh</span>
                <span>Coba Hubungkan Kamera</span>
              </button>
            </div>
          )}

          {/* Scanner Controls Bar (Top Floating) */}
          <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-2 z-10">
            {/* Camera Switcher */}
            {availableCameras.length > 1 && (
              <select
                value={selectedCameraId}
                onChange={(e) => {
                  setSelectedCameraId(e.target.value);
                  startCamera(e.target.value);
                }}
                className="bg-stone-950/80 text-white text-[11px] font-bold px-2.5 py-1.5 rounded-lg border border-stone-700 backdrop-blur-xs outline-none"
              >
                {availableCameras.map((cam, idx) => (
                  <option key={cam.id} value={cam.id}>
                    {cam.label || `Kamera ${idx + 1}`}
                  </option>
                ))}
              </select>
            )}

            {/* Continuous Mode Toggle */}
            {mode === 'cart' && (
              <button
                type="button"
                onClick={() => setContinuousMode(!continuousMode)}
                className={`ml-auto flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black border backdrop-blur-xs transition-colors ${
                  continuousMode
                    ? 'bg-emerald-600/90 text-white border-emerald-400'
                    : 'bg-stone-900/80 text-stone-300 border-stone-700'
                }`}
                title="Scan terus-menerus tanpa menutup modal"
              >
                <span className="material-symbols-outlined text-[14px]">
                  {continuousMode ? 'repeat' : 'looks_one'}
                </span>
                <span>{continuousMode ? 'Scan Beruntun: ON' : 'Scan 1x'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Last Scanned Result Alert */}
        {lastScannedResult && (
          <div
            className={`p-3 rounded-2xl border flex items-center justify-between gap-3 animate-in fade-in duration-150 ${
              lastScannedResult.success
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : 'bg-rose-50 border-rose-300 text-rose-950'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="material-symbols-outlined text-[22px] shrink-0 text-emerald-600">
                {lastScannedResult.success ? 'check_circle' : 'error'}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-black truncate">
                  {lastScannedResult.product
                    ? `${lastScannedResult.product.name} (+1 ke keranjang)`
                    : `Kode: ${lastScannedResult.code}`}
                </p>
                <p className="text-[11px] font-mono text-stone-600">
                  Barcode: <span className="font-bold">{lastScannedResult.code}</span>
                  {lastScannedResult.product && (
                    <span className="ml-2 font-bold text-emerald-700">
                      • Rp {lastScannedResult.product.price.toLocaleString('id-ID')}
                    </span>
                  )}
                </p>
              </div>
            </div>
            {lastScannedResult.success && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-200 text-emerald-900 shrink-0">
                BERHASIL
              </span>
            )}
          </div>
        )}

        {/* Manual Barcode Input Form */}
        <div>
          <label className="block text-xs font-black text-[#334155] mb-1">
            Input Barcode Manual / Scanner Gun (USB)
          </label>
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Ketik atau paste barcode (contoh: 899100100101 atau KOP-001)..."
                className="w-full px-3.5 py-2.5 bg-stone-50 border-2 border-stone-300 rounded-xl text-xs font-mono font-bold text-[#0f172a] focus:bg-white focus:border-[#0284c7] outline-none transition-colors"
                autoFocus
              />
              {manualCode && (
                <button
                  type="button"
                  onClick={() => setManualCode('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                >
                  <span className="material-symbols-outlined text-[16px]">cancel</span>
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={!manualCode.trim()}
              className="px-4 py-2.5 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] disabled:opacity-50 text-white text-xs font-black shadow-xs flex items-center gap-1.5 transition-transform active:scale-95 shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
              <span>Proses</span>
            </button>
          </form>
        </div>

        {/* Quick Sample Barcode Simulation Chips */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[11px] font-black uppercase tracking-wider text-[#475569] flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-[#0284c7]">touch_app</span>
              <span>Klik Sampel Barcode Produk (Simulasi Instan):</span>
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {sampleProducts.map((p) => {
              const codeToUse = p.barcode || p.sku;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleProcessBarcode(codeToUse)}
                  className="p-2 rounded-xl bg-stone-50 hover:bg-[#e0f2fe] border border-stone-300 hover:border-[#0284c7] text-left transition-all group flex flex-col justify-between active:scale-95 shadow-2xs"
                  title={`Klik untuk scan barcode ${p.name}`}
                >
                  <div className="flex items-center gap-1.5">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-7 h-7 rounded-lg object-cover border border-stone-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-[11px] font-black text-[#0f172a] truncate group-hover:text-[#0369a1]">
                        {p.name}
                      </p>
                      <p className="text-[10px] font-bold text-emerald-700">
                        Rp {p.price.toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="text-[9px] font-mono font-bold text-[#475569] bg-white px-1.5 py-0.5 rounded border border-stone-300 truncate">
                      {codeToUse}
                    </span>
                    <span className="text-[10px] font-black text-[#0284c7] group-hover:translate-x-0.5 transition-transform">
                      Scan +
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scan History in Current Session */}
        {scanHistory.length > 0 && mode === 'cart' && (
          <div className="pt-2 border-t border-stone-200">
            <p className="text-[11px] font-bold text-[#64748b] mb-1">
              Riwayat Scan Terakhir ({scanHistory.length} produk di keranjang):
            </p>
            <div className="max-h-24 overflow-y-auto space-y-1">
              {scanHistory.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs px-2.5 py-1 rounded-lg bg-stone-50 border border-stone-200 text-[#334155]"
                >
                  <span className="font-bold truncate max-w-[200px]">{item.name}</span>
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="text-emerald-700 font-bold">
                      Rp {item.price.toLocaleString('id-ID')}
                    </span>
                    <span className="text-stone-400">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-stone-200">
          <p className="text-[11px] text-[#64748b] font-medium hidden sm:inline">
            Tip: Scanner fisik USB/Bluetooth juga aktif secara otomatis.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-[#1e293b] font-black text-xs border border-stone-300 transition-colors"
          >
            {mode === 'cart' ? 'Selesai & Ke Kasir' : 'Batal'}
          </button>
        </div>
      </div>
    </div>
  );
};
