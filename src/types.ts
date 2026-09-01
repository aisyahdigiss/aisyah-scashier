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
}

export type PaymentMethod = 'TUNAI' | 'QRIS' | 'KARTU';

export interface TransactionItem {
  productId: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  subtotal: number;
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
}

export interface CashierAccount {
  id: string;
  name: string;
  role: 'Manager' | 'Kasir';
  avatarUrl: string;
  active: boolean;
}
