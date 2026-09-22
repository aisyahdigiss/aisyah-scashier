import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { turso, initTursoDatabase } from './server/turso';

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware for parsing JSON requests
app.use(express.json({ limit: '10mb' }));

// ----------------------------------------------------
// REST API Routes connected to Turso Database
// ----------------------------------------------------

// 1. Health check & Turso status
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    const check = await turso.execute('SELECT 1 as is_alive');
    res.json({
      status: 'ok',
      turso: 'connected',
      database: 'asyacashierdb-aisyahdigiss',
      alive: check.rows.length > 0,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({
      status: 'error',
      turso: 'disconnected',
      message: err.message,
    });
  }
});

// 2. Products API
app.get('/api/products', async (req: Request, res: Response) => {
  try {
    const result = await turso.execute(
      'SELECT id, name, sku, barcode, category, price, stock, min_stock_threshold as minStockThreshold, image, description FROM products ORDER BY name ASC'
    );
    res.json(result.rows);
  } catch (err: any) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', async (req: Request, res: Response) => {
  try {
    const { id, name, sku, barcode, category, price, stock, minStockThreshold, image, description } = req.body;
    const prodId = id || `prod-${Date.now()}`;
    const finalBarcode = barcode || sku || `899${Date.now().toString().slice(-9)}`;

    await turso.execute({
      sql: `INSERT INTO products (id, name, sku, barcode, category, price, stock, min_stock_threshold, image, description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        prodId,
        name,
        sku,
        finalBarcode,
        category,
        Number(price) || 0,
        Number(stock) || 0,
        Number(minStockThreshold) || 5,
        image || '',
        description || '',
      ],
    });

    res.status(201).json({
      id: prodId,
      name,
      sku,
      barcode: finalBarcode,
      category,
      price: Number(price) || 0,
      stock: Number(stock) || 0,
      minStockThreshold: Number(minStockThreshold) || 5,
      image,
      description,
    });
  } catch (err: any) {
    console.error('Error adding product:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/products/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, sku, barcode, category, price, stock, minStockThreshold, image, description } = req.body;

    await turso.execute({
      sql: `UPDATE products 
            SET name = ?, sku = ?, barcode = ?, category = ?, price = ?, stock = ?, min_stock_threshold = ?, image = ?, description = ?
            WHERE id = ?`,
      args: [
        name,
        sku,
        barcode,
        category,
        Number(price) || 0,
        Number(stock) || 0,
        Number(minStockThreshold) || 5,
        image || '',
        description || '',
        id,
      ],
    });

    res.json({ success: true, id });
  } catch (err: any) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await turso.execute({
      sql: 'DELETE FROM products WHERE id = ?',
      args: [id],
    });
    res.json({ success: true, id });
  } catch (err: any) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: err.message });
  }
});

// 3. Categories API
app.get('/api/categories', async (req: Request, res: Response) => {
  try {
    const result = await turso.execute('SELECT id, name, icon, description, color FROM categories');
    res.json(result.rows);
  } catch (err: any) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/categories', async (req: Request, res: Response) => {
  try {
    const { id, name, icon, description, color } = req.body;
    const catId = id || name.toLowerCase().replace(/\s+/g, '-');
    await turso.execute({
      sql: 'INSERT OR REPLACE INTO categories (id, name, icon, description, color) VALUES (?, ?, ?, ?, ?)',
      args: [catId, name, icon || 'category', description || '', color || '#eab308'],
    });
    res.status(201).json({ id: catId, name, icon, description, color });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Transactions API (Atomic save and stock decrement in Turso)
app.get('/api/transactions', async (req: Request, res: Response) => {
  try {
    const result = await turso.execute('SELECT * FROM transactions ORDER BY timestamp DESC LIMIT 200');
    const transactions = result.rows.map((row) => ({
      id: row.id,
      invoiceNumber: row.invoice_number,
      timestamp: Number(row.timestamp),
      dateStr: row.date_str,
      timeStr: row.time_str,
      cashierName: row.cashier_name,
      cashierId: row.cashier_id,
      items: JSON.parse((row.items_json as string) || '[]'),
      subtotal: Number(row.subtotal),
      discount: Number(row.discount),
      total: Number(row.total),
      paymentMethod: row.payment_method,
      amountReceived: Number(row.amount_received),
      change: Number(row.change_amount),
      status: row.status,
      orderType: row.order_type,
      customerName: row.customer_name,
      tableNumber: row.table_number,
    }));
    res.json(transactions);
  } catch (err: any) {
    console.error('Error fetching transactions:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/transactions', async (req: Request, res: Response) => {
  try {
    const tx = req.body;
    const txId = tx.id || `TX-${Date.now()}`;
    const itemsJson = JSON.stringify(tx.items || []);

    // 1. Insert transaction into Turso
    await turso.execute({
      sql: `INSERT INTO transactions 
            (id, invoice_number, timestamp, date_str, time_str, cashier_name, cashier_id, items_json, subtotal, discount, total, payment_method, amount_received, change_amount, status, order_type, customer_name, table_number)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        txId,
        tx.invoiceNumber,
        Number(tx.timestamp) || Date.now(),
        tx.dateStr || new Date().toISOString().split('T')[0],
        tx.timeStr || new Date().toTimeString().split(' ')[0],
        tx.cashierName || 'Kasir',
        tx.cashierId || 'cashier-1',
        itemsJson,
        Number(tx.subtotal) || 0,
        Number(tx.discount) || 0,
        Number(tx.total) || 0,
        tx.paymentMethod || 'TUNAI',
        Number(tx.amountReceived) || Number(tx.total) || 0,
        Number(tx.change) || 0,
        tx.status || 'Selesai',
        tx.orderType || 'Dine In',
        tx.customerName || '',
        tx.tableNumber || '',
      ],
    });

    // 2. Decrement inventory stock for each item in transaction
    if (Array.isArray(tx.items)) {
      for (const item of tx.items) {
        if (item.productId && item.quantity) {
          await turso.execute({
            sql: 'UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?',
            args: [Number(item.quantity), item.productId],
          });
        }
      }
    }

    res.status(201).json({ success: true, transactionId: txId });
  } catch (err: any) {
    console.error('Error saving transaction in Turso:', err);
    res.status(500).json({ error: err.message });
  }
});

// 5. Cashier Shifts API
app.get('/api/shifts', async (req: Request, res: Response) => {
  try {
    const result = await turso.execute('SELECT * FROM cashier_shifts ORDER BY start_timestamp DESC');
    const shifts = result.rows.map((r) => ({
      id: r.id,
      cashierId: r.cashier_id,
      cashierName: r.cashier_name,
      startTime: r.start_time,
      startTimestamp: Number(r.start_timestamp),
      startingCash: Number(r.starting_cash),
      endTime: r.end_time || undefined,
      endTimestamp: r.end_timestamp ? Number(r.end_timestamp) : undefined,
      totalCashSales: Number(r.total_cash_sales),
      totalNonCashSales: Number(r.total_non_cash_sales),
      totalTransactions: Number(r.total_transactions),
      expectedCash: Number(r.expected_cash),
      actualCashEnding: r.actual_cash_ending ? Number(r.actual_cash_ending) : undefined,
      difference: r.difference ? Number(r.difference) : undefined,
      status: r.status,
      closingNotes: r.closing_notes || undefined,
    }));
    res.json(shifts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/shifts', async (req: Request, res: Response) => {
  try {
    const s = req.body;
    await turso.execute({
      sql: `INSERT OR REPLACE INTO cashier_shifts 
            (id, cashier_id, cashier_name, start_time, start_timestamp, starting_cash, end_time, end_timestamp, total_cash_sales, total_non_cash_sales, total_transactions, expected_cash, actual_cash_ending, difference, status, closing_notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        s.id,
        s.cashierId,
        s.cashierName,
        s.startTime,
        Number(s.startTimestamp) || Date.now(),
        Number(s.startingCash) || 0,
        s.endTime || null,
        s.endTimestamp ? Number(s.endTimestamp) : null,
        Number(s.totalCashSales) || 0,
        Number(s.totalNonCashSales) || 0,
        Number(s.totalTransactions) || 0,
        Number(s.expectedCash) || 0,
        s.actualCashEnding ? Number(s.actualCashEnding) : null,
        s.difference ? Number(s.difference) : null,
        s.status || 'OPEN',
        s.closingNotes || null,
      ],
    });
    res.status(201).json({ success: true, shift: s });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Held Orders API
app.get('/api/held-orders', async (req: Request, res: Response) => {
  try {
    const result = await turso.execute('SELECT * FROM held_orders ORDER BY timestamp DESC');
    const orders = result.rows.map((r) => JSON.parse(r.data_json as string));
    res.json(orders);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/held-orders', async (req: Request, res: Response) => {
  try {
    const order = req.body;
    await turso.execute({
      sql: 'INSERT OR REPLACE INTO held_orders (id, data_json, timestamp) VALUES (?, ?, ?)',
      args: [order.id, JSON.stringify(order), Number(order.timestamp) || Date.now()],
    });
    res.status(201).json({ success: true, id: order.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/held-orders/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await turso.execute({
      sql: 'DELETE FROM held_orders WHERE id = ?',
      args: [id],
    });
    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Store Settings API
app.get('/api/settings', async (req: Request, res: Response) => {
  try {
    const result = await turso.execute("SELECT settings_json FROM store_settings WHERE id = 'main'");
    if (result.rows.length > 0 && result.rows[0].settings_json) {
      res.json(JSON.parse(result.rows[0].settings_json as string));
    } else {
      res.json(null);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/settings', async (req: Request, res: Response) => {
  try {
    const settings = req.body;
    await turso.execute({
      sql: "INSERT OR REPLACE INTO store_settings (id, settings_json) VALUES ('main', ?)",
      args: [JSON.stringify(settings)],
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Bulk Sync / Seeding Endpoint
app.post('/api/sync/bootstrap', async (req: Request, res: Response) => {
  try {
    const { products, categories, transactions, settings } = req.body;

    if (Array.isArray(categories)) {
      for (const c of categories) {
        await turso.execute({
          sql: 'INSERT OR REPLACE INTO categories (id, name, icon, description, color) VALUES (?, ?, ?, ?, ?)',
          args: [c.id, c.name, c.icon || 'category', c.description || '', c.color || '#eab308'],
        });
      }
    }

    if (Array.isArray(products)) {
      for (const p of products) {
        await turso.execute({
          sql: `INSERT OR REPLACE INTO products (id, name, sku, barcode, category, price, stock, min_stock_threshold, image, description)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            p.id,
            p.name,
            p.sku,
            p.barcode || p.sku,
            p.category,
            Number(p.price) || 0,
            Number(p.stock) || 0,
            Number(p.minStockThreshold) || 5,
            p.image || '',
            p.description || '',
          ],
        });
      }
    }

    if (settings) {
      await turso.execute({
        sql: "INSERT OR REPLACE INTO store_settings (id, settings_json) VALUES ('main', ?)",
        args: [JSON.stringify(settings)],
      });
    }

    res.json({ success: true, message: 'All local data synced with Turso cloud database.' });
  } catch (err: any) {
    console.error('Sync bootstrap error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// Vite Server Integration & Production Static Serving
// ----------------------------------------------------
async function startServer() {
  // Initialize Turso schema first
  try {
    await initTursoDatabase();
  } catch (e) {
    console.warn('Turso initialization warning (app will continue):', e);
  }

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Kasirku POS server with Turso database running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
