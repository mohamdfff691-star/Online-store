import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
const app = express();
const PORT = process.env.PORT || 3e3;
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use("/api", (_req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-admin-token");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  next();
});
const DATA_DIR = path.resolve(process.cwd(), "data");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
function readJsonFile(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2), "utf-8");
      return fallback;
    }
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return fallback;
  }
}
function writeJsonFile(filePath, data) {
  try {
    const tempPath = `${filePath}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), "utf-8");
    fs.renameSync(tempPath, filePath);
  } catch (err) {
    console.error(`Error writing to ${filePath}:`, err);
  }
}
readJsonFile(PRODUCTS_FILE, []);
readJsonFile(ORDERS_FILE, []);
const ADMIN_USERNAME = "RLZ_Admin_2026";
const ADMIN_PIN = "RLZ#Secure!96329";
const ADMIN_SECRET_TOKEN = "rlz_auth_token_96329_verified";
function verifyAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  const adminToken = req.headers["x-admin-token"];
  if (authHeader === `Bearer ${ADMIN_SECRET_TOKEN}` || adminToken === ADMIN_SECRET_TOKEN || authHeader === ADMIN_SECRET_TOKEN) {
    return next();
  }
  return res.status(401).json({ error: "Unauthorized: Admin access required." });
}
app.get("/api/health", (_req, res) => {
  const products = readJsonFile(PRODUCTS_FILE, []);
  const orders = readJsonFile(ORDERS_FILE, []);
  res.json({
    status: "ok",
    store: "RLZ SHOP Relizane",
    productsCount: products.length,
    ordersCount: orders.length,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.post("/api/admin/login", (req, res) => {
  const { username, pin } = req.body;
  if (username === ADMIN_USERNAME && pin === ADMIN_PIN) {
    return res.json({
      success: true,
      token: ADMIN_SECRET_TOKEN,
      message: "Admin authenticated successfully"
    });
  }
  return res.status(401).json({
    success: false,
    error: "Invalid credentials. Access denied."
  });
});
app.get("/api/products", (_req, res) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  const products = readJsonFile(PRODUCTS_FILE, []);
  res.json(products);
});
app.post("/api/products", verifyAdmin, (req, res) => {
  const productData = req.body;
  if (!productData.title || typeof productData.price !== "number") {
    return res.status(400).json({ error: "Invalid product data" });
  }
  const products = readJsonFile(PRODUCTS_FILE, []);
  const newProduct = {
    ...productData,
    id: productData.id || `rlz-${Date.now()}-${Math.floor(Math.random() * 1e3)}`,
    createdAt: productData.createdAt || Date.now()
  };
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
app.post("/api/products/sync", verifyAdmin, (req, res) => {
  const { products: incomingProducts } = req.body;
  let current = readJsonFile(PRODUCTS_FILE, []);
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
app.put("/api/products/:id", verifyAdmin, (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const products = readJsonFile(PRODUCTS_FILE, []);
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Product not found" });
  }
  products[index] = { ...products[index], ...updateData, id };
  writeJsonFile(PRODUCTS_FILE, products);
  console.log(`[RLZ SHOP DB] Updated product globally: ${products[index].title}`);
  res.json(products[index]);
});
app.delete("/api/products/:id", verifyAdmin, (req, res) => {
  const { id } = req.params;
  let products = readJsonFile(PRODUCTS_FILE, []);
  const initialLength = products.length;
  products = products.filter((p) => p.id !== id);
  if (products.length === initialLength) {
    return res.status(404).json({ error: "Product not found" });
  }
  writeJsonFile(PRODUCTS_FILE, products);
  console.log(`[RLZ SHOP DB] Deleted product globally: ${id}`);
  res.json({ success: true, message: "Product deleted" });
});
app.post("/api/products/seed", verifyAdmin, (req, res) => {
  const { demoProducts } = req.body;
  if (Array.isArray(demoProducts)) {
    writeJsonFile(PRODUCTS_FILE, demoProducts);
    console.log(`[RLZ SHOP DB] Seeded ${demoProducts.length} demo products globally`);
    return res.json({ success: true, count: demoProducts.length });
  }
  return res.status(400).json({ error: "Invalid demo products payload" });
});
app.post("/api/products/clear", verifyAdmin, (_req, res) => {
  writeJsonFile(PRODUCTS_FILE, []);
  console.log(`[RLZ SHOP DB] Cleared global inventory`);
  res.json({ success: true, message: "Products inventory cleared" });
});
app.post("/api/orders", (req, res) => {
  const orderData = req.body;
  if (!orderData.customerName || !orderData.phone || !Array.isArray(orderData.items)) {
    return res.status(400).json({ error: "Invalid order data" });
  }
  const orders = readJsonFile(ORDERS_FILE, []);
  const newOrder = {
    ...orderData,
    createdAt: orderData.createdAt || (/* @__PURE__ */ new Date()).toISOString(),
    status: orderData.status || "pending"
  };
  orders.unshift(newOrder);
  writeJsonFile(ORDERS_FILE, orders);
  console.log(`[RLZ SHOP ORDERS] New Order: #${newOrder.id} from ${newOrder.customerName} (${newOrder.totalAmount} DZD)`);
  res.status(201).json(newOrder);
});
app.get("/api/orders", verifyAdmin, (_req, res) => {
  const orders = readJsonFile(ORDERS_FILE, []);
  res.json(orders);
});
app.put("/api/orders/:id/status", verifyAdmin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const orders = readJsonFile(ORDERS_FILE, []);
  const index = orders.findIndex((o) => o.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Order not found" });
  }
  orders[index].status = status;
  writeJsonFile(ORDERS_FILE, orders);
  res.json(orders[index]);
});
app.delete("/api/orders/:id", verifyAdmin, (req, res) => {
  const { id } = req.params;
  let orders = readJsonFile(ORDERS_FILE, []);
  orders = orders.filter((o) => o.id !== id);
  writeJsonFile(ORDERS_FILE, orders);
  res.json({ success: true });
});
async function startServer() {
  const distPath = path.resolve(process.cwd(), "dist");
  const isProduction = process.env.NODE_ENV === "production" || fs.existsSync(distPath) && !process.env.VITE_DEV;
  if (isProduction && fs.existsSync(distPath)) {
    console.log(`[RLZ SHOP] Serving production build from ${distPath}`);
    app.use(express.static(distPath));
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api")) {
        return next();
      }
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    console.log(`[RLZ SHOP] Starting Vite middleware for development`);
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: "0.0.0.0",
        port: Number(PORT)
      },
      appType: "spa"
    });
    app.use(vite.middlewares);
  }
  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`[RLZ SHOP] Full-Stack server running on http://0.0.0.0:${PORT}`);
  });
}
startServer().catch((err) => {
  console.error("[RLZ SHOP] Failed to start server:", err);
});
