import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 3000;

// Enable large JSON bodies for high-res product photo uploads (base64)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Set CORS & disable caching on all API requests
app.use('/api', (_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-admin-token');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  next();
});

// Ensure database directory exists
const DATA_DIR = path.resolve(process.cwd(), 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper to read data safely
function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2), 'utf-8');
      return fallback;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return fallback;
  }
}

// Helper to write data safely
function writeJsonFile<T>(filePath: string, data: T): void {
  try {
    const tempPath = `${filePath}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempPath, filePath);
  } catch (err) {
    console.error(`Error writing to ${filePath}:`, err);
  }
}

// Initialise DB files if missing
readJsonFile(PRODUCTS_FILE, []);
readJsonFile(ORDERS_FILE, []);

// Admin Auth Token verification
const ADMIN_USERNAME = 'RLZ_Admin_2026';
const ADMIN_PIN = 'RLZ#Secure!96329';
const ADMIN_SECRET_TOKEN = 'rlz_auth_token_96329_verified';

function verifyAdmin(req: Request, res: Response, next: () => void) {
  const authHeader = req.headers.authorization;
  const adminToken = req.headers['x-admin-token'];
  if (
    authHeader === `Bearer ${ADMIN_SECRET_TOKEN}` ||
    adminToken === ADMIN_SECRET_TOKEN ||
    authHeader === ADMIN_SECRET_TOKEN
  ) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized: Admin access required.' });
}

// ======================== API ROUTES ========================

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  const products = readJsonFile<any[]>(PRODUCTS_FILE, []);
  const orders = readJsonFile<any[]>(ORDERS_FILE, []);
  res.json({
    status: 'ok',
    store: 'RLZ SHOP Relizane',
    productsCount: products.length,
    ordersCount: orders.length,
    timestamp: new Date().toISOString(),
  });
});

// 1. Admin Login Endpoint
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { username, pin } = req.body;
  if (username === ADMIN_USERNAME && pin === ADMIN_PIN) {
    return res.json({
      success: true,
      token: ADMIN_SECRET_TOKEN,
      message: 'Admin authenticated successfully',
    });
  }
  return res.status(401).json({
    success: false,
    error: 'Invalid credentials. Access denied.',
  });
});

// 2. Public: Get All Products (Global Cloud Store for all phones & devices)
app.get('/api/products', (_req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  const products = readJsonFile(PRODUCTS_FILE, []);
  res.json(products);
});

// 3. Admin: Add New Product
app.post('/api/products', verifyAdmin, (req: Request, res: Response) => {
  const productData = req.body;
  if (!productData.title || typeof productData.price !== 'number') {
    return res.status(400).json({ error: 'Invalid product data' });
  }

  const products = readJsonFile<any[]>(PRODUCTS_FILE, []);
  const newProduct = {
    ...productData,
    id: productData.id || `rlz-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    createdAt: productData.createdAt || Date.now(),
  };

  // Avoid duplicates
  const exists = products.find((p) => p.id === newProduct.id);
  if (!exists) {
    products.unshift(newProduct);
  } else {
    const idx = products.findIndex((p) => p.id === newProduct.id);
    products[idx] = newProduct;
  }

  writeJsonFile(PRODUCTS_FILE, products);
  console.log(`[RLZ SHOP DB] Added/Updated product globally: ${newProduct.title} (${newProduct.price} DZD)`);
  res.status(201).json(newProduct);
});

// 4. Admin: Auto-Sync / Migration Endpoint
app.post('/api/products/sync', verifyAdmin, (req: Request, res: Response) => {
  const { products: incomingProducts } = req.body;
  let current = readJsonFile<any[]>(PRODUCTS_FILE, []);

  if (Array.isArray(incomingProducts) && incomingProducts.length > 0) {
    for (const p of incomingProducts) {
      const idx = current.findIndex((c) => c.id === p.id);
      if (idx === -1) {
        current.push(p);
      } else {
        current[idx] = { ...current[idx], ...p };
      }
    }
    writeJsonFile(PRODUCTS_FILE, current);
    console.log(`[RLZ SHOP DB] Synced ${current.length} total products globally`);
  }

  res.json(current);
});

// 5. Admin: Update Product
app.put('/api/products/:id', verifyAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  const products = readJsonFile<any[]>(PRODUCTS_FILE, []);
  const index = products.findIndex((p) => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  products[index] = { ...products[index], ...updateData, id };
  writeJsonFile(PRODUCTS_FILE, products);

  console.log(`[RLZ SHOP DB] Updated product globally: ${products[index].title}`);
  res.json(products[index]);
});

// 6. Admin: Delete Product
app.delete('/api/products/:id', verifyAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  let products = readJsonFile<any[]>(PRODUCTS_FILE, []);
  const initialLength = products.length;
  products = products.filter((p) => p.id !== id);

  if (products.length === initialLength) {
    return res.status(404).json({ error: 'Product not found' });
  }

  writeJsonFile(PRODUCTS_FILE, products);
  console.log(`[RLZ SHOP DB] Deleted product globally: ${id}`);
  res.json({ success: true, message: 'Product deleted' });
});

// 7. Admin: Seed Demo Products
app.post('/api/products/seed', verifyAdmin, (req: Request, res: Response) => {
  const { demoProducts } = req.body;
  if (Array.isArray(demoProducts)) {
    writeJsonFile(PRODUCTS_FILE, demoProducts);
    console.log(`[RLZ SHOP DB] Seeded ${demoProducts.length} demo products globally`);
    return res.json({ success: true, count: demoProducts.length });
  }
  return res.status(400).json({ error: 'Invalid demo products payload' });
});

// 8. Admin: Clear All Products
app.post('/api/products/clear', verifyAdmin, (_req: Request, res: Response) => {
  writeJsonFile(PRODUCTS_FILE, []);
  console.log(`[RLZ SHOP DB] Cleared global inventory`);
  res.json({ success: true, message: 'Products inventory cleared' });
});

// 9. Public: Customer Submits Order
app.post('/api/orders', (req: Request, res: Response) => {
  const orderData = req.body;
  if (!orderData.customerName || !orderData.phone || !Array.isArray(orderData.items)) {
    return res.status(400).json({ error: 'Invalid order data' });
  }

  const orders = readJsonFile<any[]>(ORDERS_FILE, []);
  const newOrder = {
    ...orderData,
    createdAt: orderData.createdAt || new Date().toISOString(),
    status: orderData.status || 'pending',
  };

  orders.unshift(newOrder);
  writeJsonFile(ORDERS_FILE, orders);

  console.log(`[RLZ SHOP ORDERS] New Order: #${newOrder.id} from ${newOrder.customerName} (${newOrder.totalAmount} DZD)`);
  res.status(201).json(newOrder);
});

// 10. Admin: Get All Orders
app.get('/api/orders', verifyAdmin, (_req: Request, res: Response) => {
  const orders = readJsonFile(ORDERS_FILE, []);
  res.json(orders);
});

// 11. Admin: Update Order Status
app.put('/api/orders/:id/status', verifyAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const orders = readJsonFile<any[]>(ORDERS_FILE, []);
  const index = orders.findIndex((o) => o.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }

  orders[index].status = status;
  writeJsonFile(ORDERS_FILE, orders);
  res.json(orders[index]);
});

// 12. Admin: Delete Order
app.delete('/api/orders/:id', verifyAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  let orders = readJsonFile<any[]>(ORDERS_FILE, []);
  orders = orders.filter((o) => o.id !== id);
  writeJsonFile(ORDERS_FILE, orders);
  res.json({ success: true });
});

// ======================== VITE & STATIC FILES ========================

async function startServer() {
  const distPath = path.resolve(process.cwd(), 'dist');
  const isProduction = process.env.NODE_ENV === 'production' || (fs.existsSync(distPath) && !process.env.VITE_DEV);

  if (isProduction && fs.existsSync(distPath)) {
    console.log(`[RLZ SHOP] Serving production build from ${distPath}`);
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response, next: () => void) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    console.log(`[RLZ SHOP] Starting Vite middleware for development`);
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: Number(PORT),
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[RLZ SHOP] Full-Stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[RLZ SHOP] Failed to start server:', err);
});
