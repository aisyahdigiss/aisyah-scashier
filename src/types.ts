export type ScreenType =
  | 'dashboard'
  | 'kasir'
  | 'produk'
  | 'kategori'
  | 'stok'
  | 'riwayat'
  | 'laporan'
  | 'pengaturan';

export type StockStatus = 'Aman' | 'Menipis' | 'Habis';

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  category: string;
  price: number;
  stock: number;
  minStockThreshold: number;
  image: string;
  description?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string; // Material symbol or Lucide icon name
  description: string;
  color?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
}

export type PaymentMethod = 'TUNAI' | 'QRIS' | 'KARTU';

export interface TransactionItem {
  productId: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  subtotal: number;
  notes?: string;
}

export interface Transaction {
  id: string;
  invoiceNumber: string;
  timestamp: number;
  dateStr: string;
  timeStr: string;
  cashierName: string;
  cashierId: string;
  items: TransactionItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  amountReceived: number;
  change: number;
  status: 'Selesai' | 'Pending' | 'Batal';
  orderType?: 'Dine In' | 'Take Away';
  customerName?: string;
  tableNumber?: string;
}

export interface StockLog {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  type: 'MASUK' | 'KELUAR' | 'PENYESUAIAN';
  amount: number;
  previousStock: number;
  newStock: number;
  timestamp: string;
  note: string;
  operator: string;
}

export type StoreOperationalStatus = 'BUKA' | 'SEGERA_TUTUP' | 'TUTUP';

export interface HeldOrder {
  id: string;
  createdAt: string;
  timestamp: number;
  customerName: string;
  tableNumber: string;
  orderType: 'Dine In' | 'Take Away';
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  note?: string;
}

export interface CashierShift {
  id: string;
  cashierId: string;
  cashierName: string;
  startTime: string;
  startTimestamp: number;
  startingCash: number;
  endTime?: string;
  endTimestamp?: number;
  totalCashSales: number;
  totalNonCashSales: number;
  totalTransactions: number;
  expectedCash: number;
  actualCashEnding?: number;
  difference?: number;
  status: 'OPEN' | 'CLOSED';
  closingNotes?: string;
}

export interface StoreSettings {
  storeName: string;
  branchName: string;
  phone: string;
  address: string;
  logoUrl: string;
  paymentMethods: {
    qris: boolean;
    kartu: boolean;
    tunai: boolean;
  };
  printReceiptAutomatically: boolean;
  defaultDiscount: number;
  
  // Enterprise Store Hours & Operational Status
  openTime: string;
  closeTime: string;
  closingWarningMinutes: number;
  autoStatusByHours: boolean;
  manualStatus: StoreOperationalStatus;
  closingNoticeText?: string;
}

export interface CashierAccount {
  id: string;
  name: string;
  role: 'Manager' | 'Kasir';
  avatarUrl: string;
  active: boolean;
}

export type EyeCareTheme = 'warm-beige' | 'matcha-sage' | 'slate-charcoal' | 'nordic-sky';
export type SidebarLayoutMode = 'expanded' | 'compact' | 'hidden';

export interface AuthUser {
  id: string;
  username: string;
  password?: string;
  fullName: string;
  role: 'Super Admin' | 'Manager' | 'Kasir';
  email: string;
  phone?: string;
  avatarUrl: string;
  createdAt: string;
}
