import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  ScreenType,
  Product,
  Category,
  CartItem,
  Transaction,
  StoreSettings,
  CashierAccount,
  StockLog,
  PaymentMethod,
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_TRANSACTIONS,
  INITIAL_SETTINGS,
  INITIAL_CASHIERS,
} from '../data/initialData';

interface ToastData {
  id: string;
  message: string;
  type: 'error' | 'success' | 'warning' | 'info';
}

interface POSContextType {
  currentScreen: ScreenType;
  setCurrentScreen: (screen: ScreenType) => void;
  products: Product[];
  categories: Category[];
  cart: CartItem[];
  transactions: Transaction[];
  stockLogs: StockLog[];
  settings: StoreSettings;
  cashiers: CashierAccount[];
  activeCashier: CashierAccount;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  toasts: ToastData[];
  showToast: (message: string, type?: 'error' | 'success' | 'warning' | 'info') => void;
  removeToast: (id: string) => void;
  
  // Cart Actions
  addToCart: (product: Product, notes?: string) => boolean;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, delta: number) => void;
  updateCartItemNotes: (productId: string, notes: string) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartDiscount: number;
  setCartDiscount: (amount: number) => void;
  cartTotal: number;
  
  // Modern Cafe Order Details
  orderType: 'Dine In' | 'Take Away';
  setOrderType: (type: 'Dine In' | 'Take Away') => void;
  customerName: string;
  setCustomerName: (name: string) => void;
  tableNumber: string;
  setTableNumber: (table: string) => void;

  // Smart AI Barista & Sound
  soundTheme: 'chime' | 'bell' | 'click' | 'mute';
  setSoundTheme: (theme: 'chime' | 'bell' | 'click' | 'mute') => void;
  isAssistantOpen: boolean;
  setIsAssistantOpen: (open: boolean) => void;
  
  // Checkout & Payment
  isPaymentModalOpen: boolean;
  setIsPaymentModalOpen: (open: boolean) => void;
  activeReceiptTransaction: Transaction | null;
  setActiveReceiptTransaction: (trx: Transaction | null) => void;
  processPayment: (method: PaymentMethod, amountReceived: number) => Promise<Transaction>;
  
  // Product & Inventory Management
  addProduct: (productData: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, productData: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  restockProduct: (productId: string, addedStock: number, note?: string) => void;
  adjustStock: (productId: string, newStock: number, note?: string) => void;
  
  // Category Management
  addCategory: (categoryData: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, categoryData: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  
  // Settings & Cashier
  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  setActiveCashierId: (cashierId: string) => void;
  addCashier: (name: string, role: 'Manager' | 'Kasir', avatarUrl?: string) => void;
  updateCashier: (id: string, data: { name?: string; role?: 'Manager' | 'Kasir'; avatarUrl?: string }) => void;
  deleteCashier: (id: string) => void;
  resetToDefaultData: () => void;
  
  // Audio chime
  playBeep: (type?: 'beep' | 'success' | 'error') => void;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

// Web Audio API subtle aesthetic synth sounds
function playAudioTone(type: 'beep' | 'success' | 'error' = 'beep', theme: 'chime' | 'bell' | 'click' | 'mute' = 'chime') {
  if (theme === 'mute') return;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (theme === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(type === 'error' ? 220 : 650, ctx.currentTime);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
      return;
    }

    if (theme === 'bell') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      if (type === 'beep') {
        osc.frequency.setValueAtTime(1046.5, ctx.currentTime); // C6
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
        osc.start();
        osc.stop(ctx.currentTime + 0.18);
      } else if (type === 'success') {
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
        osc.frequency.setValueAtTime(1318.5, ctx.currentTime + 0.1); // E6
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      } else {
        osc.frequency.setValueAtTime(330, ctx.currentTime);
        gain.gain.setValueAtTime(0.09, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      }
      return;
    }

    // Default: 'chime' (sweet harmonic pastel bell chime)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'beep') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'success') {
      osc.type = 'triangle';
      // Harmonic arpeggio (C5 -> E5 -> G5 -> C6)
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16); // G5
      osc.frequency.setValueAtTime(1046.5, ctx.currentTime + 0.24); // C6
      gain.gain.setValueAtTime(0.09, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } else if (type === 'error') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.setValueAtTime(180, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.09, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    }
  } catch {
    // Gracefully ignore audio autoplay policies
  }
}

export const POSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('kasir');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toasts, setToasts] = useState<ToastData[]>([]);

  // Aesthetic POS state: Order Types, Customer Name, Table Number, Sound Theme & Smart Assistant
  const [orderType, setOrderType] = useState<'Dine In' | 'Take Away'>('Dine In');
  const [customerName, setCustomerName] = useState<string>('');
  const [tableNumber, setTableNumber] = useState<string>('');
  const [soundTheme, setSoundTheme] = useState<'chime' | 'bell' | 'click' | 'mute'>('chime');
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);

  // LocalStorage state initialization
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('kasirku_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('kasirku_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    return [
      {
        product: INITIAL_PRODUCTS.find((p) => p.sku === 'SKU-BK001') || INITIAL_PRODUCTS[0],
        quantity: 2,
      },
    ];
  });

  const [cartDiscount, setCartDiscount] = useState<number>(0);

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('kasirku_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [stockLogs, setStockLogs] = useState<StockLog[]>(() => {
    const saved = localStorage.getItem('kasirku_stock_logs');
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem('kasirku_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [cashiers, setCashiers] = useState<CashierAccount[]>(() => {
    const saved = localStorage.getItem('kasirku_cashiers');
    return saved ? JSON.parse(saved) : INITIAL_CASHIERS;
  });

  const [activeCashierId, setActiveCashierIdState] = useState<string>('cashier-1');
  const activeCashier = cashiers.find((c) => c.id === activeCashierId) || cashiers[0];

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [activeReceiptTransaction, setActiveReceiptTransaction] = useState<Transaction | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('kasirku_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('kasirku_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('kasirku_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('kasirku_stock_logs', JSON.stringify(stockLogs));
  }, [stockLogs]);

  useEffect(() => {
    localStorage.setItem('kasirku_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('kasirku_cashiers', JSON.stringify(cashiers));
  }, [cashiers]);

  const showToast = (message: string, type: 'error' | 'success' | 'warning' | 'info' = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    if (type === 'error') playAudioTone('error', soundTheme);
    else if (type === 'success') playAudioTone('success', soundTheme);

    setTimeout(() => {
      removeToast(id);
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Cart Calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cartTotal = Math.max(0, cartSubtotal - cartDiscount);

  // Cart Operations
  const addToCart = (product: Product, notes?: string): boolean => {
    if (product.stock <= 0) {
      showToast('Stok produk habis', 'error');
      return false;
    }

    const existingIndex = cart.findIndex(
      (item) => item.product.id === product.id && (item.notes || '') === (notes || '')
    );
    if (existingIndex > -1) {
      const currentQty = cart[existingIndex].quantity;
      if (currentQty >= product.stock) {
        showToast(`Stok ${product.name} hanya tersisa ${product.stock}`, 'warning');
        return false;
      }
      setCart((prev) =>
        prev.map((item, idx) =>
          idx === existingIndex ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCart((prev) => [...prev, { product, quantity: 1, notes }]);
    }
    playAudioTone('beep', soundTheme);
    return true;
  };

  const updateCartItemNotes = (productId: string, notes: string) => {
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, notes } : item))
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
    playAudioTone('beep', soundTheme);
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > item.product.stock) {
              showToast(`Maksimal stok ${item.product.stock}`, 'warning');
              return item;
            }
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    });
    playAudioTone('beep', soundTheme);
  };

  const clearCart = () => {
    setCart([]);
    setCartDiscount(0);
    playAudioTone('beep', soundTheme);
  };

  // Checkout process
  const processPayment = async (
    method: PaymentMethod,
    amountReceived: number
  ): Promise<Transaction> => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
    const dateStr = now.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const newInvoiceNumber = `TRX-${(1000 + transactions.length + 1).toString().padStart(4, '0')}`;

    const trxItems = cart.map((item) => ({
      productId: item.product.id,
      name: item.product.name,
      sku: item.product.sku,
      price: item.product.price,
      quantity: item.quantity,
      subtotal: item.product.price * item.quantity,
      notes: item.notes,
    }));

    const change = Math.max(0, amountReceived - cartTotal);

    const newTransaction: Transaction = {
      id: `trx-${Date.now()}`,
      invoiceNumber: newInvoiceNumber,
      timestamp: Date.now(),
      dateStr,
      timeStr,
      cashierName: activeCashier.name.split(' ')[0],
      cashierId: activeCashier.id,
      items: trxItems,
      subtotal: cartSubtotal,
      discount: cartDiscount,
      total: cartTotal,
      paymentMethod: method,
      amountReceived,
      change,
      status: 'Selesai',
      orderType,
      customerName: customerName.trim() || undefined,
      tableNumber: tableNumber.trim() || undefined,
    };

    // Deduct stock for all items
    setProducts((prevProducts) => {
      return prevProducts.map((p) => {
        const bought = cart.find((item) => item.product.id === p.id);
        if (bought) {
          const newStock = Math.max(0, p.stock - bought.quantity);
          return { ...p, stock: newStock };
        }
        return p;
      });
    });

    // Record stock movements
    const newStockLogs: StockLog[] = cart.map((item) => ({
      id: `log-${Date.now()}-${item.product.id}`,
      productId: item.product.id,
      productName: item.product.name,
      sku: item.product.sku,
      type: 'KELUAR',
      amount: item.quantity,
      previousStock: item.product.stock,
      newStock: Math.max(0, item.product.stock - item.quantity),
      timestamp: `${dateStr} ${timeStr}`,
      note: `Penjualan ${newInvoiceNumber}`,
      operator: activeCashier.name,
    }));

    setStockLogs((prev) => [...newStockLogs, ...prev]);
    setTransactions((prev) => [newTransaction, ...prev]);

    // Clear current cart & reset temporary customer inputs
    setCart([]);
    setCartDiscount(0);
    setCustomerName('');
    setTableNumber('');
    setIsPaymentModalOpen(false);
    setActiveReceiptTransaction(newTransaction);

    // Audio & celebratory visual effect with pastel confetti
    playAudioTone('success', soundTheme);
    try {
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#94a3b8', '#cbd5e1', '#64748b', '#e2e8f0', '#475569'],
      });
    } catch {
      // Ignore
    }

    showToast(`Transaksi ${newInvoiceNumber} Berhasil!`, 'success');
    return newTransaction;
  };

  // Product Management
  const addProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
    };
    setProducts((prev) => [newProduct, ...prev]);
    showToast(`Produk "${newProduct.name}" berhasil ditambahkan`, 'success');
  };

  const updateProduct = (id: string, productData: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...productData } : p))
    );
    showToast('Data produk berhasil diperbarui', 'success');
  };

  const deleteProduct = (id: string) => {
    const prod = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setCart((prev) => prev.filter((item) => item.product.id !== id));
    showToast(`Produk "${prod?.name || ''}" berhasil dihapus`, 'info');
  };

  const restockProduct = (productId: string, addedStock: number, note = 'Input Stok Masuk') => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const previousStock = prod.stock;
    const newStock = previousStock + addedStock;

    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
    );

    const log: StockLog = {
      id: `log-${Date.now()}`,
      productId,
      productName: prod.name,
      sku: prod.sku,
      type: 'MASUK',
      amount: addedStock,
      previousStock,
      newStock,
      timestamp: new Date().toLocaleString('id-ID'),
      note,
      operator: activeCashier.name,
    };
    setStockLogs((prev) => [log, ...prev]);
    showToast(`Stok ${prod.name} bertambah +${addedStock}`, 'success');
  };

  const adjustStock = (productId: string, newStock: number, note = 'Penyesuaian Stok') => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const previousStock = prod.stock;
    const diff = newStock - previousStock;

    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: newStock } : p))
    );

    const log: StockLog = {
      id: `log-${Date.now()}`,
      productId,
      productName: prod.name,
      sku: prod.sku,
      type: 'PENYESUAIAN',
      amount: Math.abs(diff),
      previousStock,
      newStock,
      timestamp: new Date().toLocaleString('id-ID'),
      note,
      operator: activeCashier.name,
    };
    setStockLogs((prev) => [log, ...prev]);
    showToast(`Stok ${prod.name} diperbarui menjadi ${newStock}`, 'info');
  };

  // Category Management
  const addCategory = (categoryData: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...categoryData,
      id: `cat-${Date.now()}`,
    };
    setCategories((prev) => [...prev, newCategory]);
    showToast(`Kategori "${newCategory.name}" berhasil dibuat`, 'success');
  };

  const updateCategory = (id: string, categoryData: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...categoryData } : c))
    );
    showToast('Kategori berhasil diperbarui', 'success');
  };

  const deleteCategory = (id: string) => {
    const cat = categories.find((c) => c.id === id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
    showToast(`Kategori "${cat?.name || ''}" dihapus`, 'info');
  };

  // Settings
  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    showToast('Pengaturan toko tersimpan!', 'success');
  };

  const setActiveCashierId = (cashierId: string) => {
    setActiveCashierIdState(cashierId);
    const cashier = cashiers.find((c) => c.id === cashierId);
    showToast(`Beralih ke akun ${cashier?.name}`, 'info');
  };

  const addCashier = (name: string, role: 'Manager' | 'Kasir', avatarUrl?: string) => {
    const newCashier: CashierAccount = {
      id: `cashier-${Date.now()}`,
      name,
      role,
      avatarUrl:
        avatarUrl ||
        'https://lh3.googleusercontent.com/aida-public/AB6AXuC11vXIThX3TR5KuZyFSiUYfwE4vKkRMxMMZq7F0ryBGcEoiGawA_XLgxQd5jGpkZs4xDe2mxsOjUm5j_lGHlgkiprrdR0MEtwcB849F47NIZaZ1T_V6PoWFBpv23aMXmAODkIp4lQBDkjQLgqk8f04of5M1HH7xIXPUPeUWhVnHkWH7M4wIEDTGAFAp4GG5Vy2z3K9v-VXK1fWREpKRX9yPnqMoOZLS-70rbZOtoU56o__Xr5PHYLZLA',
      active: false,
    };
    setCashiers((prev) => [...prev, newCashier]);
    showToast(`Akun kasir ${name} berhasil didaftarkan`, 'success');
  };

  const updateCashier = (
    id: string,
    data: { name?: string; role?: 'Manager' | 'Kasir'; avatarUrl?: string }
  ) => {
    setCashiers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data } : c))
    );
    showToast('Data kasir berhasil diperbarui', 'success');
  };

  const deleteCashier = (id: string) => {
    if (cashiers.length <= 1) {
      showToast('Tidak dapat menghapus kasir terakhir', 'warning');
      return;
    }
    const target = cashiers.find((c) => c.id === id);
    const newCashiers = cashiers.filter((c) => c.id !== id);
    setCashiers(newCashiers);

    // If active cashier was deleted, switch to first available cashier
    if (activeCashierId === id && newCashiers.length > 0) {
      setActiveCashierIdState(newCashiers[0].id);
    }
    showToast(`Akun kasir "${target?.name || ''}" berhasil dihapus`, 'info');
  };

  const resetToDefaultData = () => {
    setProducts(INITIAL_PRODUCTS);
    setCategories(INITIAL_CATEGORIES);
    setTransactions(INITIAL_TRANSACTIONS);
    setSettings(INITIAL_SETTINGS);
    setCashiers(INITIAL_CASHIERS);
    setCart([]);
    showToast('Data dikembalikan ke pengaturan awal', 'info');
  };

  return (
    <POSContext.Provider
      value={{
        currentScreen,
        setCurrentScreen,
        products,
        categories,
        cart,
        transactions,
        stockLogs,
        settings,
        cashiers,
        activeCashier,
        searchQuery,
        setSearchQuery,
        toasts,
        showToast,
        removeToast,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        updateCartItemNotes,
        clearCart,
        cartSubtotal,
        cartDiscount,
        setCartDiscount,
        cartTotal,
        orderType,
        setOrderType,
        customerName,
        setCustomerName,
        tableNumber,
        setTableNumber,
        soundTheme,
        setSoundTheme,
        isAssistantOpen,
        setIsAssistantOpen,
        isPaymentModalOpen,
        setIsPaymentModalOpen,
        activeReceiptTransaction,
        setActiveReceiptTransaction,
        processPayment,
        addProduct,
        updateProduct,
        deleteProduct,
        restockProduct,
        adjustStock,
        addCategory,
        updateCategory,
        deleteCategory,
        updateSettings,
        setActiveCashierId,
        addCashier,
        updateCashier,
        deleteCashier,
        resetToDefaultData,
        playBeep: (type) => playAudioTone(type, soundTheme),
      }}
    >
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = () => {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
};
