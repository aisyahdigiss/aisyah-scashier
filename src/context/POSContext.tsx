import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
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
  StoreOperationalStatus,
  HeldOrder,
  CashierShift,
  AuthUser,
  EyeCareTheme,
  SidebarLayoutMode,
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_TRANSACTIONS,
  INITIAL_SETTINGS,
  INITIAL_CASHIERS,
  INITIAL_USERS,
  STORE_PHOTO_PRESETS,
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
  
  // Store Operational Status & Closing Warning
  storeStatus: StoreOperationalStatus;
  setStoreOperationalStatus: (status: StoreOperationalStatus) => void;
  
  // Store Logo Modal
  isStoreLogoModalOpen: boolean;
  setIsStoreLogoModalOpen: (open: boolean) => void;
  updateStoreLogo: (url: string) => void;

  // Held Orders (Open Bills / Parkir Tagihan)
  heldOrders: HeldOrder[];
  isHeldOrdersModalOpen: boolean;
  setIsHeldOrdersModalOpen: (open: boolean) => void;
  holdCurrentCart: (note?: string) => boolean;
  restoreHeldOrder: (heldOrderId: string) => void;
  deleteHeldOrder: (heldOrderId: string) => void;

  // Enterprise Cashier Shift & Cash Register Closing
  currentShift: CashierShift;
  isShiftModalOpen: boolean;
  setIsShiftModalOpen: (open: boolean) => void;
  openNewShift: (startingCash: number) => void;
  closeCurrentShift: (actualCashEnding: number, notes?: string) => CashierShift;
  shiftHistory: CashierShift[];

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
  
  // User Authentication & Super Admin
  currentUser: AuthUser | null;
  users: AuthUser[];
  login: (username: string, password: string) => { success: boolean; message: string; user?: AuthUser };
  register: (userData: {
    username: string;
    password: string;
    fullName: string;
    role: 'Super Admin' | 'Manager' | 'Kasir';
    email: string;
    phone?: string;
  }) => { success: boolean; message: string; user?: AuthUser };
  logout: () => void;
  switchUser: (userId: string) => void;
  
  // Profile Photo Management & Kasir Sync
  isPhotoModalOpen: boolean;
  setIsPhotoModalOpen: (open: boolean) => void;
  openPhotoModal: () => void;
  updateUserProfilePhoto: (newAvatarUrl: string) => void;
  
  // Audio chime
  playBeep: (type?: 'beep' | 'success' | 'error') => void;

  // View Optimization & Eye-Comfort Controls
  sidebarMode: SidebarLayoutMode;
  setSidebarMode: (mode: SidebarLayoutMode) => void;
  toggleSidebarMode: () => void;
  zenFocusMode: boolean;
  setZenFocusMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  toggleZenFocusMode: () => void;
  eyeCareTheme: EyeCareTheme;
  setEyeCareTheme: (theme: EyeCareTheme) => void;
  antiGlareFilter: boolean;
  setAntiGlareFilter: (val: boolean | ((prev: boolean) => boolean)) => void;
  uiDensity: 'relaxed' | 'compact';
  setUiDensity: (density: 'relaxed' | 'compact') => void;
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

  // Authentication & Super Admin State
  const [users, setUsers] = useState<AuthUser[]>(() => {
    const saved = localStorage.getItem('kasirku_users');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('kasirku_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    // Default to the primary user (Aisyah Sya - Super Admin & Kasir Utama)
    return INITIAL_USERS[0];
  });

  const [activeCashierId, setActiveCashierIdState] = useState<string>(() => {
    const savedUser = localStorage.getItem('kasirku_current_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed?.id) return parsed.id;
      } catch {
        // ignore
      }
    }
    return INITIAL_USERS[0]?.id || 'cashier-1';
  });

  // Active cashier is strictly unified with the logged-in currentUser
  const activeCashier: CashierAccount = useMemo(() => {
    if (currentUser) {
      return {
        id: currentUser.id,
        name: currentUser.fullName,
        role: currentUser.role === 'Super Admin' ? 'Manager' : currentUser.role,
        avatarUrl: currentUser.avatarUrl,
        active: true,
      };
    }
    return cashiers.find((c) => c.id === activeCashierId) || cashiers[0];
  }, [currentUser, cashiers, activeCashierId]);

  // Profile Photo Modal State
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState<boolean>(false);
  const openPhotoModal = () => setIsPhotoModalOpen(true);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [activeReceiptTransaction, setActiveReceiptTransaction] = useState<Transaction | null>(null);

  // Store Logo Modal
  const [isStoreLogoModalOpen, setIsStoreLogoModalOpen] = useState<boolean>(false);

  // Eye-Care & View Customization States
  const [sidebarMode, setSidebarMode] = useState<SidebarLayoutMode>(() => {
    return (localStorage.getItem('kasirku_sidebar_mode') as SidebarLayoutMode) || 'expanded';
  });

  const [zenFocusMode, setZenFocusMode] = useState<boolean>(() => {
    return localStorage.getItem('kasirku_zen_focus') === 'true';
  });

  const [eyeCareTheme, setEyeCareTheme] = useState<EyeCareTheme>(() => {
    return (localStorage.getItem('kasirku_eyecare_theme') as EyeCareTheme) || 'warm-beige';
  });

  const [antiGlareFilter, setAntiGlareFilter] = useState<boolean>(() => {
    return localStorage.getItem('kasirku_antiglare') === 'true';
  });

  const [uiDensity, setUiDensity] = useState<'relaxed' | 'compact'>(() => {
    return (localStorage.getItem('kasirku_density') as 'relaxed' | 'compact') || 'relaxed';
  });

  useEffect(() => {
    localStorage.setItem('kasirku_sidebar_mode', sidebarMode);
  }, [sidebarMode]);

  useEffect(() => {
    localStorage.setItem('kasirku_zen_focus', String(zenFocusMode));
  }, [zenFocusMode]);

  useEffect(() => {
    localStorage.setItem('kasirku_eyecare_theme', eyeCareTheme);
  }, [eyeCareTheme]);

  useEffect(() => {
    localStorage.setItem('kasirku_antiglare', String(antiGlareFilter));
  }, [antiGlareFilter]);

  useEffect(() => {
    localStorage.setItem('kasirku_density', uiDensity);
  }, [uiDensity]);

  const toggleSidebarMode = () => {
    setSidebarMode((prev) => {
      if (prev === 'expanded') return 'compact';
      if (prev === 'compact') return 'hidden';
      return 'expanded';
    });
  };

  const toggleZenFocusMode = () => {
    setZenFocusMode((prev) => !prev);
  };

  // Held Orders (Open Bills / Parkir Tagihan)
  const [heldOrders, setHeldOrders] = useState<HeldOrder[]>(() => {
    const saved = localStorage.getItem('kasirku_held_orders');
    return saved ? JSON.parse(saved) : [];
  });
  const [isHeldOrdersModalOpen, setIsHeldOrdersModalOpen] = useState<boolean>(false);

  // Enterprise Shift & Cash Register Management
  const [shiftHistory, setShiftHistory] = useState<CashierShift[]>(() => {
    const saved = localStorage.getItem('kasirku_shift_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentShift, setCurrentShift] = useState<CashierShift>(() => {
    const saved = localStorage.getItem('kasirku_current_shift');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    const defaultUser = INITIAL_USERS[0];
    return {
      id: `shift-${Date.now()}`,
      cashierId: defaultUser.id,
      cashierName: defaultUser.fullName,
      startTime: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      startTimestamp: Date.now(),
      startingCash: 200000,
      totalCashSales: 0,
      totalNonCashSales: 0,
      totalTransactions: 0,
      expectedCash: 200000,
      status: 'OPEN',
    };
  });
  const [isShiftModalOpen, setIsShiftModalOpen] = useState<boolean>(false);

  // Store Operational Status & Closing Hour Logic
  const computeStoreStatus = (): StoreOperationalStatus => {
    if (!settings.autoStatusByHours) {
      return settings.manualStatus || 'BUKA';
    }
    const now = new Date();
    const curMins = now.getHours() * 60 + now.getMinutes();
    const [openH, openM] = (settings.openTime || '08:00').split(':').map(Number);
    const [closeH, closeM] = (settings.closeTime || '22:00').split(':').map(Number);
    const openTotal = (openH || 8) * 60 + (openM || 0);
    const closeTotal = (closeH || 22) * 60 + (closeM || 0);
    const warnMins = settings.closingWarningMinutes || 30;
    const warnStart = Math.max(openTotal, closeTotal - warnMins);

    if (curMins < openTotal || curMins >= closeTotal) {
      return 'TUTUP';
    } else if (curMins >= warnStart && curMins < closeTotal) {
      return 'SEGERA_TUTUP';
    } else {
      return 'BUKA';
    }
  };

  const [storeStatus, setStoreStatus] = useState<StoreOperationalStatus>(computeStoreStatus);

  useEffect(() => {
    const updateStatus = () => {
      setStoreStatus(computeStoreStatus());
    };
    updateStatus();
    const timer = setInterval(updateStatus, 10000);
    return () => clearInterval(timer);
  }, [settings]);

  const setStoreOperationalStatus = (status: StoreOperationalStatus) => {
    setSettings((prev) => ({
      ...prev,
      autoStatusByHours: false,
      manualStatus: status,
    }));
    setStoreStatus(status);
    if (status === 'BUKA') {
      showToast('Status toko diatur: Buka Operasional', 'success');
    } else if (status === 'SEGERA_TUTUP') {
      showToast('Status toko diatur: Segera Tutup (Last Order)', 'warning');
    } else {
      showToast('Status toko diatur: Toko Tutup', 'info');
    }
  };

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

  useEffect(() => {
    localStorage.setItem('kasirku_held_orders', JSON.stringify(heldOrders));
  }, [heldOrders]);

  useEffect(() => {
    localStorage.setItem('kasirku_current_shift', JSON.stringify(currentShift));
  }, [currentShift]);

  useEffect(() => {
    localStorage.setItem('kasirku_shift_history', JSON.stringify(shiftHistory));
  }, [shiftHistory]);

  // Ensure active open shift is always synchronized with activeCashier (so user and cashier never mismatch)
  useEffect(() => {
    if (activeCashier && currentShift && currentShift.status === 'OPEN') {
      if (currentShift.cashierName !== activeCashier.name || currentShift.cashierId !== activeCashier.id) {
        setCurrentShift((prev) => ({
          ...prev,
          cashierId: activeCashier.id,
          cashierName: activeCashier.name,
        }));
      }
    }
  }, [activeCashier]);

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

    // Update active cashier shift register
    setCurrentShift((prev) => {
      const isCash = method === 'TUNAI';
      const addedCash = isCash ? newTransaction.total : 0;
      const addedNonCash = !isCash ? newTransaction.total : 0;
      const updatedCashSales = prev.totalCashSales + addedCash;
      const updatedNonCashSales = prev.totalNonCashSales + addedNonCash;
      return {
        ...prev,
        totalCashSales: updatedCashSales,
        totalNonCashSales: updatedNonCashSales,
        totalTransactions: prev.totalTransactions + 1,
        expectedCash: prev.startingCash + updatedCashSales,
      };
    });

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

  // Held Orders (Open Bills) Methods
  const holdCurrentCart = (note?: string): boolean => {
    if (cart.length === 0) {
      showToast('Keranjang kasir masih kosong', 'warning');
      return false;
    }
    const newHeld: HeldOrder = {
      id: `hold-${Date.now()}`,
      createdAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      customerName: customerName.trim() || 'Pelanggan Walk-In',
      tableNumber: tableNumber.trim(),
      orderType,
      items: [...cart],
      subtotal: cartSubtotal,
      discount: cartDiscount,
      total: cartTotal,
      note,
    };
    setHeldOrders((prev) => [newHeld, ...prev]);
    setCart([]);
    setCartDiscount(0);
    setCustomerName('');
    setTableNumber('');
    playAudioTone('beep', soundTheme);
    showToast(`Pesanan ${newHeld.customerName} berhasil ditunda/parkir`, 'info');
    return true;
  };

  const restoreHeldOrder = (heldOrderId: string) => {
    const target = heldOrders.find((h) => h.id === heldOrderId);
    if (!target) return;
    setCart(target.items);
    setCartDiscount(target.discount);
    setCustomerName(target.customerName);
    setTableNumber(target.tableNumber);
    setOrderType(target.orderType);
    setHeldOrders((prev) => prev.filter((h) => h.id !== heldOrderId));
    setIsHeldOrdersModalOpen(false);
    setCurrentScreen('kasir');
    playAudioTone('success', soundTheme);
    showToast(`Pesanan ${target.customerName} dipulihkan ke kasir`, 'success');
  };

  const deleteHeldOrder = (heldOrderId: string) => {
    setHeldOrders((prev) => prev.filter((h) => h.id !== heldOrderId));
    showToast('Pesanan parkir dihapus', 'info');
  };

  // Enterprise Cashier Shift Methods
  const openNewShift = (startingCash: number) => {
    const newShift: CashierShift = {
      id: `shift-${Date.now()}`,
      cashierId: activeCashier.id,
      cashierName: activeCashier.name,
      startTime: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      startTimestamp: Date.now(),
      startingCash,
      totalCashSales: 0,
      totalNonCashSales: 0,
      totalTransactions: 0,
      expectedCash: startingCash,
      status: 'OPEN',
    };
    setCurrentShift(newShift);
  };

  const closeCurrentShift = (actualCashEnding: number, notes?: string): CashierShift => {
    const diff = actualCashEnding - currentShift.expectedCash;
    const closed: CashierShift = {
      ...currentShift,
      endTime: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      endTimestamp: Date.now(),
      actualCashEnding,
      difference: diff,
      status: 'CLOSED',
      closingNotes: notes,
    };
    setShiftHistory((prev) => [closed, ...prev]);
    setCurrentShift(closed);
    return closed;
  };

  const updateStoreLogo = (url: string) => {
    updateSettings({ logoUrl: url });
    showToast('Foto profil toko berhasil diperbarui!', 'success');
  };

  const resetToDefaultData = () => {
    setProducts(INITIAL_PRODUCTS);
    setCategories(INITIAL_CATEGORIES);
    setTransactions(INITIAL_TRANSACTIONS);
    setSettings(INITIAL_SETTINGS);
    setCashiers(INITIAL_CASHIERS);
    setCart([]);
    setHeldOrders([]);
    setUsers(INITIAL_USERS);
    localStorage.removeItem('kasirku_users');
    showToast('Data dikembalikan ke pengaturan awal', 'info');
  };

  const login = (username: string, password: string): { success: boolean; message: string; user?: AuthUser } => {
    const cleanUsername = username.trim().toLowerCase();
    const foundUser = users.find(
      (u) => u.username.toLowerCase() === cleanUsername || u.email.toLowerCase() === cleanUsername
    );

    if (!foundUser) {
      playAudioTone('error', soundTheme);
      showToast('Username atau email tidak ditemukan!', 'error');
      return { success: false, message: 'Username atau email tidak terdaftar.' };
    }

    if (foundUser.password !== password) {
      playAudioTone('error', soundTheme);
      showToast('Password salah! Periksa kembali password Anda.', 'error');
      return { success: false, message: 'Password tidak sesuai.' };
    }

    setCurrentUser(foundUser);
    setActiveCashierIdState(foundUser.id);
    localStorage.setItem('kasirku_current_user', JSON.stringify(foundUser));
    playAudioTone('success', soundTheme);
    confetti({ particleCount: 65, spread: 70, origin: { y: 0.6 } });
    showToast(`Selamat datang, ${foundUser.fullName} (${foundUser.role})!`, 'success');
    return { success: true, message: 'Login berhasil.', user: foundUser };
  };

  const register = (userData: {
    username: string;
    password: string;
    fullName: string;
    role: 'Super Admin' | 'Manager' | 'Kasir';
    email: string;
    phone?: string;
  }): { success: boolean; message: string; user?: AuthUser } => {
    const cleanUsername = userData.username.trim().toLowerCase();
    const cleanEmail = userData.email.trim().toLowerCase();

    // Check if username or email already exists
    const exists = users.some(
      (u) => u.username.toLowerCase() === cleanUsername || u.email.toLowerCase() === cleanEmail
    );

    if (exists) {
      playAudioTone('error', soundTheme);
      showToast('Username atau Email sudah terdaftar!', 'error');
      return { success: false, message: 'Username atau Email sudah terdaftar.' };
    }

    const newUser: AuthUser = {
      id: `user-${Date.now()}`,
      username: userData.username.trim(),
      password: userData.password,
      fullName: userData.fullName.trim(),
      role: userData.role || 'Kasir',
      email: userData.email.trim(),
      phone: userData.phone?.trim() || '',
      avatarUrl: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(
        userData.fullName
      )}&backgroundColor=bae6fd`,
      createdAt: new Date().toISOString().split('T')[0],
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('kasirku_users', JSON.stringify(updatedUsers));

    // Also sync to cashier lists if Kasir or Manager
    if (userData.role === 'Kasir' || userData.role === 'Manager') {
      const newCashier: CashierAccount = {
        id: newUser.id,
        name: `${newUser.fullName} (${newUser.role})`,
        role: userData.role,
        avatarUrl: newUser.avatarUrl,
        active: true,
      };
      setCashiers((prev) => [...prev, newCashier]);
    }

    setCurrentUser(newUser);
    setActiveCashierIdState(newUser.id);
    localStorage.setItem('kasirku_current_user', JSON.stringify(newUser));
    playAudioTone('success', soundTheme);
    confetti({ particleCount: 75, spread: 80, origin: { y: 0.6 } });
    showToast(`Akun ${newUser.fullName} berhasil didaftarkan sebagai ${newUser.role}!`, 'success');
    return { success: true, message: 'Pendaftaran berhasil.', user: newUser };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('kasirku_current_user');
    playAudioTone('beep', soundTheme);
    showToast('Anda telah keluar dari akun.', 'info');
  };

  const switchUser = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
      setActiveCashierIdState(user.id);
      localStorage.setItem('kasirku_current_user', JSON.stringify(user));
      showToast(`Beralih ke kasir/pengguna: ${user.fullName} (${user.role})`, 'info');
    }
  };

  const updateUserProfilePhoto = (newAvatarUrl: string) => {
    if (!newAvatarUrl) return;

    // 1. Update currentUser if logged in
    if (currentUser) {
      const updatedUser: AuthUser = { ...currentUser, avatarUrl: newAvatarUrl };
      setCurrentUser(updatedUser);
      localStorage.setItem('kasirku_current_user', JSON.stringify(updatedUser));

      // 2. Update users array
      setUsers((prevUsers) => {
        const nextUsers = prevUsers.map((u) =>
          u.id === currentUser.id ? { ...u, avatarUrl: newAvatarUrl } : u
        );
        localStorage.setItem('kasirku_users', JSON.stringify(nextUsers));
        return nextUsers;
      });
    }

    // 3. Update cashiers list so they stay perfectly in sync
    const targetId = currentUser ? currentUser.id : activeCashierId;
    const targetName = currentUser ? currentUser.fullName : activeCashier.name;

    setCashiers((prevCashiers) => {
      const nextCashiers = prevCashiers.map((c) => {
        if (c.id === targetId || c.name === targetName || c.name.startsWith(targetName)) {
          return { ...c, avatarUrl: newAvatarUrl };
        }
        return c;
      });
      localStorage.setItem('kasirku_cashiers', JSON.stringify(nextCashiers));
      return nextCashiers;
    });

    playAudioTone('success', soundTheme);
    try {
      confetti({ particleCount: 65, spread: 70, origin: { y: 0.6 } });
    } catch {
      // ignore
    }
    showToast('Foto profil kasir berhasil diperbarui!', 'success');
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
        storeStatus,
        setStoreOperationalStatus,
        isStoreLogoModalOpen,
        setIsStoreLogoModalOpen,
        updateStoreLogo,
        heldOrders,
        isHeldOrdersModalOpen,
        setIsHeldOrdersModalOpen,
        holdCurrentCart,
        restoreHeldOrder,
        deleteHeldOrder,
        currentShift,
        isShiftModalOpen,
        setIsShiftModalOpen,
        openNewShift,
        closeCurrentShift,
        shiftHistory,
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
        currentUser,
        users,
        login,
        register,
        logout,
        switchUser,
        isPhotoModalOpen,
        setIsPhotoModalOpen,
        openPhotoModal,
        updateUserProfilePhoto,
        playBeep: (type) => playAudioTone(type, soundTheme),
        sidebarMode,
        setSidebarMode,
        toggleSidebarMode,
        zenFocusMode,
        setZenFocusMode,
        toggleZenFocusMode,
        eyeCareTheme,
        setEyeCareTheme,
        antiGlareFilter,
        setAntiGlareFilter,
        uiDensity,
        setUiDensity,
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
