import { Product, Category, Transaction, CashierShift, HeldOrder, StoreSettings } from '../types';

export const tursoApi = {
  // Check health and Turso connection status
  async checkHealth(): Promise<{ status: string; turso: string; database?: string; error?: string }> {
    try {
      const res = await fetch('/api/health');
      return await res.json();
    } catch (err: any) {
      return { status: 'offline', turso: 'disconnected', error: err.message };
    }
  },

  // Products
  async getProducts(): Promise<Product[] | null> {
    try {
      const res = await fetch('/api/products');
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async addProduct(product: Omit<Product, 'id'> & { id?: string }): Promise<Product | null> {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async updateProduct(id: string, product: Partial<Product>): Promise<boolean> {
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async deleteProduct(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/products/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Categories
  async getCategories(): Promise<Category[] | null> {
    try {
      const res = await fetch('/api/categories');
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async addCategory(category: Category): Promise<boolean> {
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Transactions
  async getTransactions(): Promise<Transaction[] | null> {
    try {
      const res = await fetch('/api/transactions');
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async saveTransaction(transaction: Transaction): Promise<boolean> {
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transaction),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Shifts
  async getShifts(): Promise<CashierShift[] | null> {
    try {
      const res = await fetch('/api/shifts');
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async saveShift(shift: CashierShift): Promise<boolean> {
    try {
      const res = await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shift),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Held Orders
  async getHeldOrders(): Promise<HeldOrder[] | null> {
    try {
      const res = await fetch('/api/held-orders');
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async saveHeldOrder(order: HeldOrder): Promise<boolean> {
    try {
      const res = await fetch('/api/held-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  async deleteHeldOrder(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/held-orders/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Store Settings
  async getSettings(): Promise<StoreSettings | null> {
    try {
      const res = await fetch('/api/settings');
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  },

  async saveSettings(settings: StoreSettings): Promise<boolean> {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Bootstrap Bulk Sync (sync client state to Turso)
  async bootstrapSync(data: {
    products?: Product[];
    categories?: Category[];
    settings?: StoreSettings;
  }): Promise<boolean> {
    try {
      const res = await fetch('/api/sync/bootstrap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.ok;
    } catch {
      return false;
    }
  },
};
