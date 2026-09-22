import { createClient, Client } from '@libsql/client';
import dotenv from 'dotenv';
dotenv.config();

const url =
  process.env.TURSO_DATABASE_URL ||
  'libsql://asyacashierdb-aisyahdigiss.aws-ap-northeast-1.turso.io';

const authToken =
  process.env.TURSO_AUTH_TOKEN ||
  'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODk5NTEzNTYsImlkIjoiMDFhMGMxNjctZWYwMS03ODVmLWEzOTQtOTg4MGE0ZTRjMjM5Iiwia2lkIjoiWmVyN2xMZ0ZKaVZrV0lrMVYzM1ZiZEU1a2tBWDZtMThVaXVEbU5VWFI3SSIsInJpZCI6ImI3MDIzZDA1LThlOTEtNGNmMC1iM2RlLTg2MGFkNTQ2OTE0NSJ9.VCoyIaqyGcRUgiBf4QzmSROrNqRxfGAMsKPpjcae-q0yF2f7MeR6-KGPnURjAcXnUJBvLCJTFLfIbn6yBXgXAA';

export const turso: Client = createClient({
  url,
  authToken,
});

export async function initTursoDatabase() {
  try {
    // 1. Categories table
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        icon TEXT,
        description TEXT,
        color TEXT
      );
    `);

    // 2. Products table
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        sku TEXT UNIQUE NOT NULL,
        barcode TEXT,
        category TEXT NOT NULL,
        price REAL NOT NULL,
        stock INTEGER NOT NULL,
        min_stock_threshold INTEGER DEFAULT 5,
        image TEXT,
        description TEXT
      );
    `);

    // 3. Transactions table
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        invoice_number TEXT UNIQUE NOT NULL,
        timestamp INTEGER NOT NULL,
        date_str TEXT NOT NULL,
        time_str TEXT NOT NULL,
        cashier_name TEXT,
        cashier_id TEXT,
        items_json TEXT NOT NULL,
        subtotal REAL NOT NULL,
        discount REAL DEFAULT 0,
        total REAL NOT NULL,
        payment_method TEXT NOT NULL,
        amount_received REAL,
        change_amount REAL,
        status TEXT DEFAULT 'Selesai',
        order_type TEXT,
        customer_name TEXT,
        table_number TEXT
      );
    `);

    // 4. Stock logs table
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS stock_logs (
        id TEXT PRIMARY KEY,
        product_id TEXT,
        product_name TEXT,
        sku TEXT,
        type TEXT,
        amount INTEGER,
        previous_stock INTEGER,
        new_stock INTEGER,
        timestamp TEXT,
        note TEXT,
        operator TEXT
      );
    `);

    // 5. Cashier Shifts table
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS cashier_shifts (
        id TEXT PRIMARY KEY,
        cashier_id TEXT,
        cashier_name TEXT,
        start_time TEXT,
        start_timestamp INTEGER,
        starting_cash REAL,
        end_time TEXT,
        end_timestamp INTEGER,
        total_cash_sales REAL,
        total_non_cash_sales REAL,
        total_transactions INTEGER,
        expected_cash REAL,
        actual_cash_ending REAL,
        difference REAL,
        status TEXT,
        closing_notes TEXT
      );
    `);

    // 6. Held Orders table
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS held_orders (
        id TEXT PRIMARY KEY,
        data_json TEXT NOT NULL,
        timestamp INTEGER NOT NULL
      );
    `);

    // 7. Store Settings table
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS store_settings (
        id TEXT PRIMARY KEY DEFAULT 'main',
        settings_json TEXT NOT NULL
      );
    `);

    // 8. Auth Users table
    await turso.execute(`
      CREATE TABLE IF NOT EXISTS auth_users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT,
        full_name TEXT NOT NULL,
        role TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        avatar_url TEXT,
        created_at TEXT
      );
    `);

    // Seed default categories and products if empty
    const productCountResult = await turso.execute('SELECT COUNT(*) as count FROM products');
    const productCount = Number(productCountResult.rows[0]?.count || 0);

    if (productCount === 0) {
      console.log('Turso Database: Seeding initial categories and products...');

      // Seed categories
      const initialCats = [
        { id: 'kopi', name: 'Minuman Kopi', icon: 'local_cafe', description: 'Berbagai jenis minuman kopi espresso & manual brew.' },
        { id: 'pastry', name: 'Pastry & Cake', icon: 'cake', description: 'Kue kering, roti, dan dessert manis.' },
        { id: 'makanan', name: 'Makanan Berat', icon: 'fastfood', description: 'Hidangan utama, nasi, pasta, dan makanan berat.' },
        { id: 'non-kopi', name: 'Minuman Non-Kopi', icon: 'blender', description: 'Jus, teh, matcha, dan minuman segar.' },
        { id: 'merchandise', name: 'Merchandise & ATK', icon: 'inventory', description: 'Mug, tumbler, buku catatan, dan ATK.' },
      ];

      for (const cat of initialCats) {
        await turso.execute({
          sql: 'INSERT OR IGNORE INTO categories (id, name, icon, description, color) VALUES (?, ?, ?, ?, ?)',
          args: [cat.id, cat.name, cat.icon, cat.description, '#eab308'],
        });
      }

      // Seed initial products
      const initialProducts = [
        {
          id: 'prod-1',
          name: 'Cappuccino Latte',
          sku: 'KOP-001',
          barcode: '899100100101',
          category: 'Minuman Kopi',
          price: 35000,
          stock: 45,
          min_stock_threshold: 10,
          image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDQKFTo1cMYTrVnSx6gA9lJCsxrUvyIZ_QvC87o0u7manpYH1hDDsAO7BgzqxQV32_lHhPhYDaf967o8XZdzmDVmlyL3-iLE9VE2PN2JiMBRM5_8eUtCdCwA7LmdFcFzj6t3cV4KjKd7AUHb3A1GSf6HWaBDQ4MQNgwQ3wxrpi-7T9dJVl3YsmHSN2PFP_EypUS7dymZ8fu99B0QIF7Qdd05jrEYyF_9H0txOqu3yEOaYnQYNNVn3t7bg',
          description: 'Espresso murni dengan steamed milk lembut.',
        },
        {
          id: 'prod-2',
          name: 'Iced Matcha Latte',
          sku: 'NON-002',
          barcode: '899100100102',
          category: 'Minuman Non-Kopi',
          price: 40000,
          stock: 5,
          min_stock_threshold: 10,
          image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBV-N2Zl8mYlIkkx18ma6DgE5yrhMDNMKRV3BJpsYfKitSCxDVaodyKiAecgQsB8z03fLd4149vTid_F-lPmoCmbkjtdzeJM1oygceQbZ-bW_Gv-RpI2bIaVJFlJrKIF6-Do44PzVxokn1kpB905PEQ799HwN6iyAdZ13-9v4D6VgFZ6Qh02p3RcbwRRH1RiYpTKPUq04SusRsE4eFcMgnzLsEpiwSckoWQZswiFMV1pSNVNNFLHbWGsQ',
          description: 'Matcha Uji Jepang premium dengan susu segar.',
        },
        {
          id: 'prod-3',
          name: 'Butter Croissant',
          sku: 'PAS-003',
          barcode: '899100100103',
          category: 'Pastry & Cake',
          price: 28000,
          stock: 25,
          min_stock_threshold: 8,
          image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCHfnD7m2Fj8WpHM8aJmVcYkuzrhJjVQn7r44tR4C1lX37IEA4BN6Dgfc-cH8cvdwsK3PUzeNzLSlsCj9ZbW58VnYm2U1Rhtk2uZTI6O9fj5mO8efihRQaa5OqYUyyvh2STKXeTsU5NSeWuEwPQU7jtQAO2zlLIW2JBFxSSX52IyhJZw6QmDGfd_Ls0xXzBCD5TZL8y-G6gMo1hcDqYqmUUkKjElim8fmK-fW5kQCuQJ_rrIXEr8U2YRA',
          description: 'Croissant panggang renyah beraroma mentega Prancis.',
        },
        {
          id: 'prod-4',
          name: 'Buku Catatan Grid A5',
          sku: 'ATK-004',
          barcode: '899100100104',
          category: 'Merchandise & ATK',
          price: 25000,
          stock: 30,
          min_stock_threshold: 5,
          image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBm5Iu2JlBGTS56lMnJBZ6ordTCR-pDyaFpvonCeEOHoo2CRHIffmmRDvdP6WvUrmugPm4I7bEoMs7qx2gEMhTp8u5I-A8XaZP-AJ_l4OCx1AiecKmpAfY2vFKHxj8YTVmUtm5LrJuIMkGmR5zHi52MdblOHN1mZnJBeQ26ZkUfT6XwPVioyt-jX011Lqejxy-mDRdMLBjFL5hG2qiVbWuU4ObwfN8l8Kfg3LqFnYk4dCUSVcre02-VCw',
          description: 'Buku catatan bersampul kraft dengan kertas grid halus.',
        },
        {
          id: 'prod-5',
          name: 'Signature Caramel Macchiato',
          sku: 'KOP-005',
          barcode: '899100100105',
          category: 'Minuman Kopi',
          price: 38000,
          stock: 0,
          min_stock_threshold: 10,
          image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDQKFTo1cMYTrVnSx6gA9lJCsxrUvyIZ_QvC87o0u7manpYH1hDDsAO7BgzqxQV32_lHhPhYDaf967o8XZdzmDVmlyL3-iLE9VE2PN2JiMBRM5_8eUtCdCwA7LmdFcFzj6t3cV4KjKd7AUHb3A1GSf6HWaBDQ4MQNgwQ3wxrpi-7T9dJVl3YsmHSN2PFP_EypUS7dymZ8fu99B0QIF7Qdd05jrEYyF_9H0txOqu3yEOaYnQYNNVn3t7bg',
          description: 'Susu vanila kental, espresso shot, dan saus karamel gurih.',
        },
      ];

      for (const p of initialProducts) {
        await turso.execute({
          sql: `INSERT OR IGNORE INTO products 
                (id, name, sku, barcode, category, price, stock, min_stock_threshold, image, description)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            p.id,
            p.name,
            p.sku,
            p.barcode,
            p.category,
            p.price,
            p.stock,
            p.min_stock_threshold,
            p.image,
            p.description,
          ],
        });
      }
    }

    console.log('Turso Database schema and tables initialized successfully.');
  } catch (err) {
    console.error('Turso Database initialization error:', err);
    throw err;
  }
}
