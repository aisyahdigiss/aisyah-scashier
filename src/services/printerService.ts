/**
 * Global Automatic Mini Printer & Bluetooth Printer Service
 * Supports Web Bluetooth API, Web Serial (USB/COM), ESC/POS commands, and Global Auto-Detection.
 */

import { PrinterDevice, PrinterConfig, Transaction } from '../types';

export interface AutoDetectionResult {
  supported: {
    bluetooth: boolean;
    serial: boolean;
    usb: boolean;
  };
  foundDevices: PrinterDevice[];
  autoConnected?: PrinterDevice | null;
  message: string;
  source: 'bluetooth' | 'usb-serial' | 'storage' | 'simulator';
}

// Common Bluetooth Printer Service UUIDs (ESC/POS SPP & BLE)
export const BLUETOOTH_PRINTER_SERVICES = [
  '000018f0-0000-1000-8000-00805f9b34fb', // Standard Print Service
  'e7810a71-73ae-499d-8c15-faa9aef0c3f2', // Common Panda / Blueprint / BellaV / Zjiang
  '49535343-fe7d-4ae5-8fa9-9fafd205e455', // ISSC Transparent Data
  '0000ff00-0000-1000-8000-00805f9b34fb', // Custom ESC/POS
  '00001101-0000-1000-8000-00805f9b34fb', // SPP Serial Port Profile
  '000018f1-0000-1000-8000-00805f9b34fb', // Alternative BLE Printer
  '0000ffe0-0000-1000-8000-00805f9b34fb', // HMSoft / CC2541 BLE module (widely used in mini POS)
  '49535343-aca3-481c-91ec-d31116110e2c', // Microchip / ISSC BLE
  '0000fee7-0000-1000-8000-00805f9b34fb', // Tencent / WeChat Mini POS
  '0000ae00-0000-1000-8000-00805f9b34fb', // POS-58 BLE
];

// Active device handle references
let activeBluetoothDevice: any = null;
let activeGattServer: any = null;
let activeCharacteristic: any = null;
let activeSerialPort: any = null;

export const DEFAULT_PRINTER_CONFIG: PrinterConfig = {
  autoDetectOnLaunch: true,
  autoReconnect: true,
  autoScanInterval: true,
  notifyOnConnectionChange: true,
  autoPrintOnPayment: true,
  paperWidth: 58,
  cutPaper: true,
  printLogo: true,
  headerNote: 'Terima kasih atas kunjungan Anda',
  footerNote: 'Barang yang sudah dibeli tidak dapat ditukar',
  numberOfCopies: 1,
};

/**
 * Check browser APIs availability
 */
export const checkHardwareSupport = () => {
  const isNav = typeof navigator !== 'undefined';
  return {
    bluetooth: isNav && !!(navigator as any).bluetooth,
    serial: isNav && !!(navigator as any).serial,
    usb: isNav && !!(navigator as any).usb,
  };
};

/**
 * Returns true if a hardware device or simulator is actively ready to receive prints
 */
export const isHardwareConnected = (device?: PrinterDevice | null): boolean => {
  if (!device) return false;
  if (device.type === 'simulator' || device.type === 'system') return true;
  if (device.type === 'bluetooth') return !!(activeGattServer && activeGattServer.connected);
  if (device.type === 'usb-serial') return !!(activeSerialPort && activeSerialPort.readable);
  return device.status === 'connected';
};

/**
 * Automatically scan previously paired or connected devices on system launch
 */
export const autoDetectConnectedPrinters = async (): Promise<AutoDetectionResult> => {
  const support = checkHardwareSupport();
  const foundDevices: PrinterDevice[] = [];
  let autoConnected: PrinterDevice | null = null;
  let message = 'Pemindaian otomatis selesai.';
  let source: AutoDetectionResult['source'] = 'simulator';

  // 1. Check remembered Web Bluetooth paired devices
  if (support.bluetooth && (navigator as any).bluetooth.getDevices) {
    try {
      const pairedDevices = await (navigator as any).bluetooth.getDevices();
      for (const dev of pairedDevices) {
        const isConnected = !!dev.gatt?.connected;
        const devItem: PrinterDevice = {
          id: dev.id || `bt-${dev.name || 'printer'}`,
          name: dev.name || 'Printer Bluetooth Mini (Paired)',
          type: 'bluetooth',
          paperWidth: 58,
          status: isConnected ? 'connected' : 'disconnected',
          signalStrength: 'Sangat Kuat',
          batteryLevel: 95,
          lastConnectedAt: new Date().toISOString(),
        };

        // Try automatic reconnection if not connected yet
        if (!isConnected && dev.gatt) {
          try {
            const server = await dev.gatt.connect();
            if (server.connected) {
              activeBluetoothDevice = dev;
              activeGattServer = server;
              devItem.status = 'connected';
              autoConnected = devItem;
              source = 'bluetooth';
              message = `Printer Bluetooth "${devItem.name}" berhasil terhubung otomatis!`;
            }
          } catch {
            // device might be turned off or out of range
          }
        } else if (isConnected) {
          activeBluetoothDevice = dev;
          activeGattServer = dev.gatt;
          autoConnected = devItem;
          source = 'bluetooth';
          message = `Printer Bluetooth "${devItem.name}" aktif dan siap digunakan!`;
        }

        foundDevices.push(devItem);
      }
    } catch (err) {
      console.warn('Bluetooth getDevices auto-scan error:', err);
    }
  }

  // 2. Check remembered Web Serial USB ports
  if (support.serial && (navigator as any).serial.getPorts) {
    try {
      const ports = await (navigator as any).serial.getPorts();
      for (let i = 0; i < ports.length; i++) {
        const portInfo = ports[i].getInfo ? ports[i].getInfo() : {};
        const devId = `usb-port-${i}`;
        const devName = `Thermal USB POS-${i + 1} (${portInfo.usbVendorId ? `VID:${portInfo.usbVendorId}` : 'COM'})`;
        const usbDev: PrinterDevice = {
          id: devId,
          name: devName,
          type: 'usb-serial',
          paperWidth: 58,
          status: activeSerialPort === ports[i] ? 'connected' : 'disconnected',
          signalStrength: 'Sangat Kuat',
          vendorId: portInfo.usbVendorId ? String(portInfo.usbVendorId) : undefined,
          productId: portInfo.usbProductId ? String(portInfo.usbProductId) : undefined,
        };

        // If no autoConnected yet, attempt auto-open port
        if (!autoConnected && !activeSerialPort) {
          try {
            await ports[i].open({ baudRate: 9600 });
            activeSerialPort = ports[i];
            usbDev.status = 'connected';
            usbDev.lastConnectedAt = new Date().toISOString();
            autoConnected = usbDev;
            source = 'usb-serial';
            message = `Printer Thermal USB "${devName}" otomatis terhubung!`;
          } catch {
            // Already open or busy
          }
        }

        foundDevices.push(usbDev);
      }
    } catch (err) {
      console.warn('Serial getPorts auto-scan error:', err);
    }
  }

  // 3. Fallback: Check localStorage for previously configured active printer
  const savedConfig = localStorage.getItem('kasirku_active_printer');
  if (savedConfig && !autoConnected) {
    try {
      const parsed = JSON.parse(savedConfig) as PrinterDevice;
      const existing = foundDevices.find((d) => d.id === parsed.id || d.name === parsed.name);
      if (existing) {
        existing.status = 'connected';
        autoConnected = existing;
      } else {
        foundDevices.unshift({
          ...parsed,
          status: 'connected',
        });
        autoConnected = foundDevices[0];
      }
      source = 'storage';
      message = `Printer "${autoConnected.name}" otomatis aktif dari konfigurasi kasir.`;
    } catch {
      // ignore
    }
  }

  // 4. Default: Provide ready-to-use System Print / Virtual Thermal POS
  if (foundDevices.length === 0) {
    const defaultPrinter: PrinterDevice = {
      id: 'default-thermal-sim',
      name: 'Printer Thermal Mini 58mm (Virtual & Driver)',
      type: 'simulator',
      paperWidth: 58,
      status: 'connected',
      lastConnectedAt: new Date().toISOString(),
      signalStrength: 'Sangat Kuat',
      batteryLevel: 100,
    };
    foundDevices.push(defaultPrinter);
    autoConnected = defaultPrinter;
    source = 'simulator';
    message = 'Sistem deteksi global siap. Printer virtual & driver sistem aktif.';
  }

  return {
    supported: support,
    foundDevices,
    autoConnected,
    message,
    source,
  };
};

/**
 * Listen for hardware connect / disconnect events globally
 */
export const registerGlobalPrinterListeners = (
  onPrinterEvent: (event: 'connected' | 'disconnected', device: PrinterDevice) => void
) => {
  const support = checkHardwareSupport();
  const cleanups: Array<() => void> = [];

  // Web Serial connect/disconnect
  if (support.serial && (navigator as any).serial) {
    const handleSerialConnect = (e: any) => {
      const portInfo = e.port?.getInfo ? e.port.getInfo() : {};
      const newDev: PrinterDevice = {
        id: `usb-auto-${Date.now()}`,
        name: `Printer Thermal USB (Plug & Play VID:${portInfo.usbVendorId || 'POS'})`,
        type: 'usb-serial',
        paperWidth: 58,
        status: 'connected',
        lastConnectedAt: new Date().toISOString(),
        signalStrength: 'Sangat Kuat',
        vendorId: portInfo.usbVendorId ? String(portInfo.usbVendorId) : undefined,
        productId: portInfo.usbProductId ? String(portInfo.usbProductId) : undefined,
      };
      onPrinterEvent('connected', newDev);
    };

    const handleSerialDisconnect = (e: any) => {
      const dev: PrinterDevice = {
        id: `usb-disc`,
        name: 'Printer Thermal USB',
        type: 'usb-serial',
        paperWidth: 58,
        status: 'disconnected',
      };
      activeSerialPort = null;
      onPrinterEvent('disconnected', dev);
    };

    (navigator as any).serial.addEventListener('connect', handleSerialConnect);
    (navigator as any).serial.addEventListener('disconnect', handleSerialDisconnect);

    cleanups.push(() => {
      (navigator as any).serial.removeEventListener('connect', handleSerialConnect);
      (navigator as any).serial.removeEventListener('disconnect', handleSerialDisconnect);
    });
  }

  // Web USB connect/disconnect
  if (support.usb && (navigator as any).usb) {
    const handleUsbConnect = (e: any) => {
      const newDev: PrinterDevice = {
        id: `usb-${e.device?.serialNumber || Date.now()}`,
        name: e.device?.productName || 'Printer Thermal USB Terdeteksi',
        type: 'usb-serial',
        paperWidth: 58,
        status: 'connected',
        lastConnectedAt: new Date().toISOString(),
        signalStrength: 'Sangat Kuat',
      };
      onPrinterEvent('connected', newDev);
    };

    const handleUsbDisconnect = (e: any) => {
      const dev: PrinterDevice = {
        id: `usb-disc`,
        name: e.device?.productName || 'Printer Thermal USB',
        type: 'usb-serial',
        paperWidth: 58,
        status: 'disconnected',
      };
      onPrinterEvent('disconnected', dev);
    };

    (navigator as any).usb.addEventListener('connect', handleUsbConnect);
    (navigator as any).usb.addEventListener('disconnect', handleUsbDisconnect);

    cleanups.push(() => {
      (navigator as any).usb.removeEventListener('connect', handleUsbConnect);
      (navigator as any).usb.removeEventListener('disconnect', handleUsbDisconnect);
    });
  }

  return () => {
    cleanups.forEach((c) => c());
  };
};

/**
 * Request pair & connect to a Bluetooth Thermal Mini Printer
 */
export const requestBluetoothPrinter = async (
  onDisconnect?: () => void
): Promise<{ success: boolean; device?: PrinterDevice; message: string }> => {
  const support = checkHardwareSupport();
  if (!support.bluetooth) {
    return {
      success: false,
      message: 'Peramban ini tidak mendukung Web Bluetooth. Gunakan Google Chrome atau Microsoft Edge.',
    };
  }

  try {
    // Request device with acceptAllDevices and optional services
    const device = await (navigator as any).bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: BLUETOOTH_PRINTER_SERVICES,
    });

    if (!device) {
      return { success: false, message: 'Pemilihan perangkat Bluetooth dibatalkan.' };
    }

    activeBluetoothDevice = device;

    // Listen for disconnect event
    device.addEventListener('gattserverdisconnected', () => {
      activeGattServer = null;
      activeCharacteristic = null;
      if (onDisconnect) onDisconnect();
    });

    // Connect to GATT Server
    let gattServer = device.gatt;
    if (!gattServer.connected) {
      gattServer = await device.gatt.connect();
    }
    activeGattServer = gattServer;

    // Try finding the writable characteristic for ESC/POS printing
    try {
      const services = await gattServer.getPrimaryServices();
      for (const service of services) {
        const characteristics = await service.getCharacteristics();
        for (const char of characteristics) {
          if (char.properties.write || char.properties.writeWithoutResponse) {
            activeCharacteristic = char;
            break;
          }
        }
        if (activeCharacteristic) break;
      }
    } catch (e) {
      console.warn('Could not pre-fetch characteristic:', e);
    }

    const printerDev: PrinterDevice = {
      id: device.id || `bt-${device.name || 'printer'}`,
      name: device.name || 'Printer Bluetooth Mini',
      type: 'bluetooth',
      paperWidth: 58,
      status: 'connected',
      lastConnectedAt: new Date().toISOString(),
      signalStrength: 'Sangat Kuat',
      batteryLevel: 95,
    };

    localStorage.setItem('kasirku_active_printer', JSON.stringify(printerDev));
    return {
      success: true,
      device: printerDev,
      message: `Berhasil terhubung ke "${printerDev.name}" secara global!`,
    };
  } catch (err: any) {
    console.error('Bluetooth connection error:', err);
    return {
      success: false,
      message: err.message || 'Gagal menyambungkan ke printer Bluetooth.',
    };
  }
};

/**
 * Request connection via Web Serial (USB / COM cable)
 */
export const requestSerialPrinter = async (): Promise<{
  success: boolean;
  device?: PrinterDevice;
  message: string;
}> => {
  const support = checkHardwareSupport();
  if (!support.serial) {
    return {
      success: false,
      message: 'Peramban tidak mendukung Web Serial. Gunakan Google Chrome atau Microsoft Edge.',
    };
  }

  try {
    const port = await (navigator as any).serial.requestPort();
    await port.open({ baudRate: 9600 });
    activeSerialPort = port;

    const portInfo = port.getInfo ? port.getInfo() : {};
    const printerDev: PrinterDevice = {
      id: `serial-${Date.now()}`,
      name: 'Printer Thermal USB / Serial (POS-58/80)',
      type: 'usb-serial',
      paperWidth: 58,
      status: 'connected',
      lastConnectedAt: new Date().toISOString(),
      signalStrength: 'Sangat Kuat',
      vendorId: portInfo.usbVendorId ? String(portInfo.usbVendorId) : undefined,
      productId: portInfo.usbProductId ? String(portInfo.usbProductId) : undefined,
    };

    localStorage.setItem('kasirku_active_printer', JSON.stringify(printerDev));
    return { success: true, device: printerDev, message: 'Berhasil terhubung ke Port USB Thermal!' };
  } catch (err: any) {
    console.error('Serial connection error:', err);
    return {
      success: false,
      message: err.message || 'Gagal membuka koneksi port USB Serial.',
    };
  }
};

/**
 * Disconnect active printer hardware
 */
export const disconnectHardwarePrinter = () => {
  if (activeGattServer && activeGattServer.connected) {
    try {
      activeGattServer.disconnect();
    } catch {
      // ignore
    }
  }
  activeBluetoothDevice = null;
  activeGattServer = null;
  activeCharacteristic = null;

  if (activeSerialPort) {
    try {
      activeSerialPort.close();
    } catch {
      // ignore
    }
    activeSerialPort = null;
  }
};

/**
 * Generate formatted ESC/POS byte array for standard 58mm / 80mm thermal receipt
 */
export const generateEscPosReceipt = (
  storeSettings: {
    storeName: string;
    branchName?: string;
    phone?: string;
    address?: string;
  },
  transaction: Transaction,
  paperWidth: 58 | 80 = 58
): Uint8Array => {
  const encoder = new TextEncoder();
  const maxChars = paperWidth === 80 ? 48 : 32;

  const padBetween = (left: string, right: string) => {
    const totalSpaces = Math.max(1, maxChars - left.length - right.length);
    return left + ' '.repeat(totalSpaces) + right;
  };

  const centerText = (text: string) => {
    const pad = Math.max(0, Math.floor((maxChars - text.length) / 2));
    return ' '.repeat(pad) + text;
  };

  const divider = '-'.repeat(maxChars);
  const doubleDivider = '='.repeat(maxChars);

  let textBuffer = '';

  // ESC @: Reset / Initialize printer
  textBuffer += '\x1B\x40';

  // Center header
  textBuffer += '\x1B\x61\x01'; // Center alignment
  textBuffer += '\x1B\x21\x30'; // Double height + bold
  textBuffer += `${storeSettings.storeName.toUpperCase()}\n`;
  textBuffer += '\x1B\x21\x00'; // Normal font
  if (storeSettings.branchName) textBuffer += `${storeSettings.branchName}\n`;
  if (storeSettings.address) textBuffer += `${storeSettings.address}\n`;
  if (storeSettings.phone) textBuffer += `Telp: ${storeSettings.phone}\n`;

  textBuffer += `${doubleDivider}\n`;

  // Left align invoice info
  textBuffer += '\x1B\x61\x00'; // Left align
  textBuffer += padBetween('No. Faktur:', transaction.invoiceNumber) + '\n';
  textBuffer += padBetween('Tanggal:', `${transaction.dateStr} ${transaction.timeStr}`) + '\n';
  textBuffer += padBetween('Kasir:', transaction.cashierName) + '\n';
  if (transaction.customerName) {
    textBuffer += padBetween('Pelanggan:', transaction.customerName) + '\n';
  }
  textBuffer += padBetween('Pesanan:', `${transaction.orderType || 'Dine In'}`) + '\n';

  textBuffer += `${divider}\n`;

  // Items List
  transaction.items.forEach((item) => {
    textBuffer += `${item.name}\n`;
    const qtyPrice = `${item.quantity} x ${item.price.toLocaleString('id-ID')}`;
    const subtotal = item.subtotal.toLocaleString('id-ID');
    textBuffer += padBetween(`  ${qtyPrice}`, subtotal) + '\n';
    if (item.notes) {
      textBuffer += `  *Catatan: ${item.notes}\n`;
    }
  });

  textBuffer += `${divider}\n`;

  // Totals
  textBuffer += padBetween('Subtotal:', `Rp ${transaction.subtotal.toLocaleString('id-ID')}`) + '\n';
  if (transaction.discount && transaction.discount > 0) {
    textBuffer += padBetween('Diskon:', `-Rp ${transaction.discount.toLocaleString('id-ID')}`) + '\n';
  }

  textBuffer += '\x1B\x21\x08'; // Bold
  textBuffer += padBetween('TOTAL BAYAR:', `Rp ${transaction.total.toLocaleString('id-ID')}`) + '\n';
  textBuffer += '\x1B\x21\x00'; // Normal

  textBuffer += padBetween(
    `Metode: ${transaction.paymentMethod}`,
    `Rp ${(transaction.amountReceived || transaction.total).toLocaleString('id-ID')}`
  ) + '\n';

  if (transaction.change && transaction.change > 0) {
    textBuffer += padBetween('Kembalian:', `Rp ${transaction.change.toLocaleString('id-ID')}`) + '\n';
  }

  textBuffer += `${doubleDivider}\n`;

  // Footer
  textBuffer += '\x1B\x61\x01'; // Center alignment
  textBuffer += 'Terima kasih atas kunjungan Anda!\n';
  textBuffer += 'Struk ini adalah bukti pembayaran sah.\n';
  textBuffer += 'Powered by KASIRKU POS\n\n\n\n';

  // Feed & Cut Paper (GS V 66 0)
  textBuffer += '\x1D\x56\x42\x00';

  return encoder.encode(textBuffer);
};

/**
 * Send print raw payload to currently connected printer
 */
export const printThermalReceiptData = async (
  rawBytes: Uint8Array,
  targetPrinter: PrinterDevice
): Promise<boolean> => {
  // 1. If Bluetooth active
  if (targetPrinter.type === 'bluetooth' && activeGattServer?.connected) {
    try {
      // Find write characteristic if not already stored
      let charToWrite = activeCharacteristic;
      if (!charToWrite) {
        const services = await activeGattServer.getPrimaryServices();
        for (const service of services) {
          const characteristics = await service.getCharacteristics();
          for (const char of characteristics) {
            if (char.properties.write || char.properties.writeWithoutResponse) {
              charToWrite = char;
              activeCharacteristic = char;
              break;
            }
          }
          if (charToWrite) break;
        }
      }

      if (charToWrite) {
        // Write in 100-byte chunks to prevent buffer overflow
        const chunkSize = 100;
        for (let i = 0; i < rawBytes.length; i += chunkSize) {
          const chunk = rawBytes.slice(i, i + chunkSize);
          if (charToWrite.properties.writeWithoutResponse) {
            await charToWrite.writeValueWithoutResponse(chunk);
          } else {
            await charToWrite.writeValue(chunk);
          }
        }
        return true;
      }
    } catch (err) {
      console.error('Bluetooth write error:', err);
    }
  }

  // 2. If Serial Port active
  if (targetPrinter.type === 'usb-serial' && activeSerialPort) {
    try {
      const writer = activeSerialPort.writable.getWriter();
      await writer.write(rawBytes);
      writer.releaseLock();
      return true;
    } catch (err) {
      console.error('Serial write error:', err);
    }
  }

  // 3. Fallback: Trigger Browser Print Engine for Thermal / System Driver
  if (typeof window !== 'undefined') {
    window.print();
    return true;
  }

  return true;
};
