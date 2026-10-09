import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 3000;

// Enable large JSON bodies for product image uploads (base64)
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

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

// Admin Auth Token verification middleware
const ADMIN_USERNAME = 'RLZ_Admin_2026';
const ADMIN_PIN = 'RLZ#Secure!96329';
const ADMIN_SECRET_TOKEN = 'rlz_auth_token_96329_verified';

function verifyAdmin(req: Request, res: Response, next: () => void) {
  const authHeader = req.headers.authorization;
  const adminToken = req.headers['x-admin-token'];
  if (
    authHeader === `Bearer ${ADMIN_SECRET_TOKEN}` ||
    adminToken === ADMIN_SECRET_TOKEN
  ) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized: Admin access required.' });
}

// ======================== API ROUTES ========================

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

// 2. Public: Get All Products (Global Cloud Store)
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

  products.unshift(newProduct);
  writeJsonFile(PRODUCTS_FILE, products);

  console.log(`[RLZ SHOP DB] Added product: ${newProduct.title} (${newProduct.price} DZD)`);
  res.status(201).json(newProduct);
});

// 4. Admin: Update Product
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

  console.log(`[RLZ SHOP DB] Updated product: ${products[index].title}`);
  res.json(products[index]);
});

// 5. Admin: Delete Product
app.delete('/api/products/:id', verifyAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  let products = readJsonFile<any[]>(PRODUCTS_FILE, []);
  const initialLength = products.length;
  products = products.filter((p) => p.id !== id);

  if (products.length === initialLength) {
    return res.status(404).json({ error: 'Product not found' });
  }

  writeJsonFile(PRODUCTS_FILE, products);
  console.log(`[RLZ SHOP DB] Deleted product: ${id}`);
  res.json({ success: true, message: 'Product deleted' });
});

// 6. Admin: Seed Demo Products
app.post('/api/products/seed', verifyAdmin, (req: Request, res: Response) => {
  const { demoProducts } = req.body;
  if (Array.isArray(demoProducts)) {
    writeJsonFile(PRODUCTS_FILE, demoProducts);
    return res.json({ success: true, count: demoProducts.length });
  }
  return res.status(400).json({ error: 'Invalid demo products payload' });
});

// 7. Admin: Clear All Products
app.post('/api/products/clear', verifyAdmin, (_req: Request, res: Response) => {
  writeJsonFile(PRODUCTS_FILE, []);
  res.json({ success: true, message: 'Products inventory cleared' });
});

// 8. Public: Customer Submits Order
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

// 9. Admin: Get All Orders
app.get('/api/orders', verifyAdmin, (_req: Request, res: Response) => {
  const orders = readJsonFile(ORDERS_FILE, []);
  res.json(orders);
});

// 10. Admin: Update Order Status
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

// 11. Admin: Delete Order
app.delete('/api/orders/:id', verifyAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  let orders = readJsonFile<any[]>(ORDERS_FILE, []);
  orders = orders.filter((o) => o.id !== id);
  writeJsonFile(ORDERS_FILE, orders);
  res.json({ success: true });
});

// ======================== VITE & STATIC FILES ========================

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // In development: mount Vite middleware
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: Number(PORT),
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production: serve built dist folder
    const distPath = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[RLZ SHOP] Full-Stack server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[RLZ SHOP] Failed to start server:', err);
});
