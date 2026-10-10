import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { ProductCard } from './components/ProductCard';
import { EmptyInventory } from './components/EmptyInventory';
import { CartDrawer } from './components/CartDrawer';
import { CustomerOrderHistory } from './components/CustomerOrderHistory';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLoginModal } from './components/AdminLoginModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { MobileBottomBar } from './components/MobileBottomBar';
import { MobileFrameSimulator } from './components/MobileFrameSimulator';
import { Footer } from './components/Footer';
import { Product, CartItem, CustomerOrder, ProductCategory, Theme, ViewMode, OrderStatus, Language } from './types';
import { useTranslation } from './utils/i18n';
import {
  fetchGlobalProducts,
  createProductOnServer,
  updateProductOnServer,
  deleteProductOnServer,
  seedDemoProductsOnServer,
  clearProductsOnServer,
  submitOrderToServer,
  fetchOrdersFromServer,
  updateOrderStatusOnServer,
  deleteOrderOnServer,
  clearStoredAdminToken,
  syncProductsWithServer,
} from './api/client';
import { Plus, Search, Smartphone, Shirt, Layers } from 'lucide-react';

const STORAGE_PRODUCTS_KEY = 'rlz_shop_products_v1';
const STORAGE_ORDERS_KEY = 'rlz_shop_orders_v1';
const STORAGE_CUSTOMER_ORDERS_KEY = 'rlz_customer_orders_v1';
const STORAGE_ADMIN_AUTH_KEY = 'rlz_admin_auth_v2';
const STORAGE_LANG_KEY = 'rlz_shop_lang';

// Curated demo catalog only loaded if the store owner explicitly chooses to test the store
const DEMO_PRESET_PRODUCTS: Product[] = [
  {
    id: 'rlz-p-1',
    title: 'Coque Titanium Gold & Noir Mat iPhone 16 Pro Max',
    category: 'phones',
    subCategory: 'Coques Prestige',
    description: 'Finition titane brossé avec inserts or royal et protection d\'objectifs renforcée. Compatible charge MagSafe sans fil rapide.',
    price: 4200,
    image: '/src/assets/images/rlz_shop_phone_acc_1791585318914.jpg',
    inStock: true,
    createdAt: Date.now() - 3600000 * 24,
    badge: 'Best-Seller',
  },
  {
    id: 'rlz-p-2',
    title: 'Câble Tressé Or & Chargeur Rapide 65W GaN Relizane Edition',
    category: 'phones',
    subCategory: 'Chargeurs & Câbles',
    description: 'Ultra-rapide avec connecteurs renforcés plaqués or et tresse nylon haute résistance. Recharge 100% en 35 minutes.',
    price: 3800,
    image: '/src/assets/images/rlz_shop_phone_acc_1791585318914.jpg',
    inStock: true,
    createdAt: Date.now() - 3600000 * 18,
    badge: 'Exclusif',
  },
  {
    id: 'rlz-p-3',
    title: 'Montre Chronographe Royal Gold & Cuir Italien RLZ',
    category: 'fashion',
    subCategory: 'Horlogerie & Montres',
    description: 'Mouvement de précision haute fiabilité, boîtier or royal et bracelet en cuir véritable gaufré. Livrée dans son écrin de luxe RLZ SHOP.',
    price: 12500,
    image: '/src/assets/images/rlz_shop_fashion_acc_1791585335234.jpg',
    inStock: true,
    createdAt: Date.now() - 3600000 * 12,
    badge: 'Prestige',
  },
  {
    id: 'rlz-p-4',
    title: 'Porte-Cartes Slim Cuir Saffiano & Lunettes Solaires Aviator',
    category: 'fashion',
    subCategory: 'Maroquinerie & Lunettes',
    description: 'Pack élégance contemporaine avec verres solaires polarisés haute filtration UV400 et porte-cartes compact anti-piratage RFID.',
    price: 6900,
    image: '/src/assets/images/rlz_shop_fashion_acc_1791585335234.jpg',
    inStock: true,
    createdAt: Date.now() - 3600000 * 6,
    badge: 'Nouveau',
  },
];

export default function App() {
  // Language State (Arabic default for Algeria, toggleable to English)
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_LANG_KEY);
    return saved === 'en' ? 'en' : 'ar';
  });

  const t = useTranslation(lang);

  // Theme State
  const [theme, setTheme] = useState<Theme>('dark');
  // View Mode (Responsive vs Mobile simulator)
  const [viewMode, setViewMode] = useState<ViewMode>('responsive');

  // Active View ('shop' | 'orders' | 'admin')
  const [activeView, setActiveView] = useState<'shop' | 'orders' | 'admin'>('shop');
  const [currentCategory, setCurrentCategory] = useState<ProductCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Products State - Starts EMPTY per requirement ("Do NOT generate fake/mock/dummy products in initial state")
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PRODUCTS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Global Orders (for Store Owner)
  const [allOrders, setAllOrders] = useState<CustomerOrder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ORDERS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Customer-Facing Order History (saved on guest / customer browser)
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CUSTOMER_ORDERS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Admin Auth State (Strictly authenticated with updated secure credentials)
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_ADMIN_AUTH_KEY) === 'true';
  });
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  // Quick View Modal
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Load global products from shared server database on mount + poll for real-time updates
  useEffect(() => {
    let isMounted = true;

    const syncProducts = async () => {
      try {
        const serverProducts = await fetchGlobalProducts();
        if (isMounted && Array.isArray(serverProducts)) {
          if (serverProducts.length > 0) {
            setProducts(serverProducts);
            localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(serverProducts));
          } else {
            // If server database is currently empty, check if this admin browser had local products from earlier
            const localSaved = localStorage.getItem(STORAGE_PRODUCTS_KEY);
            if (localSaved) {
              try {
                const parsed = JSON.parse(localSaved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  console.log('[RLZ SHOP] Auto-migrating local products to server database...');
                  const synced = await syncProductsWithServer(parsed);
                  if (isMounted && Array.isArray(synced)) {
                    setProducts(synced);
                    return;
                  }
                }
              } catch {
                // ignore
              }
            }
            setProducts([]);
          }
        }
      } catch (err) {
        // Keeps fallback cache if offline
      }
    };

    // Initial fetch
    syncProducts();

    // Poll every 3 seconds so products added on one device appear immediately on all other devices/browsers
    const interval = setInterval(syncProducts, 3000);

    // Re-sync whenever user switches tabs or window regains focus
    const handleFocus = () => syncProducts();
    window.addEventListener('focus', handleFocus);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Sync products to LocalStorage cache
  useEffect(() => {
    localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(products));
  }, [products]);

  // Sync orders to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(allOrders));
  }, [allOrders]);

  // Sync customer order history to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_CUSTOMER_ORDERS_KEY, JSON.stringify(customerOrders));
  }, [customerOrders]);

  // Sync Language and Direction
  useEffect(() => {
    localStorage.setItem(STORAGE_LANG_KEY, lang);
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  }, [lang]);

  // If Admin view is active, load orders from server
  useEffect(() => {
    if (isAdmin && activeView === 'admin') {
      fetchOrdersFromServer()
        .then((orders) => {
          if (Array.isArray(orders)) {
            setAllOrders(orders);
          }
        })
        .catch((err) => console.warn('[RLZ SHOP] Orders fetch error:', err));
    }
  }, [isAdmin, activeView]);

  // Listen to URL hash or path for direct secret route `/rlz-admin`
  useEffect(() => {
    const handleUrlRoute = () => {
      const hash = window.location.hash.toLowerCase();
      const path = window.location.pathname.toLowerCase();
      if (hash.includes('rlz-admin') || hash.includes('admin') || path.includes('rlz-admin')) {
        if (isAdmin) {
          setActiveView('admin');
        } else {
          setIsAdminLoginOpen(true);
        }
      }
    };

    handleUrlRoute();
    window.addEventListener('hashchange', handleUrlRoute);
    return () => window.removeEventListener('hashchange', handleUrlRoute);
  }, [isAdmin]);

  // Handle Theme changes
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === 'responsive' ? 'mobile' : 'responsive'));
  };

  // Cart Handlers
  const handleAddToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Order Placement Handler - Persists globally to server database + locally for customer
  const handleOrderCompleted = async (newOrder: CustomerOrder) => {
    // Save to customer private history immediately
    setCustomerOrders((prev) => [newOrder, ...prev]);
    // Optimistic update for admin view
    setAllOrders((prev) => [newOrder, ...prev]);

    // Persist to central server store
    try {
      await submitOrderToServer(newOrder);
    } catch (err) {
      console.warn('[RLZ SHOP] Failed to persist order to server:', err);
    }
  };

  // Admin Actions
  const handleAdminLoginSuccess = () => {
    setIsAdmin(true);
    localStorage.setItem(STORAGE_ADMIN_AUTH_KEY, 'true');
    setActiveView('admin');
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem(STORAGE_ADMIN_AUTH_KEY);
    clearStoredAdminToken();
    setActiveView('shop');
  };

  // 1. Add Product globally to server database
  const handleAddProduct = async (newProductData: Omit<Product, 'id' | 'createdAt'>) => {
    const tempProduct: Product = {
      ...newProductData,
      id: `rlz-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: Date.now(),
    };
    // Optimistic update
    setProducts((prev) => [tempProduct, ...prev]);

    try {
      const created = await createProductOnServer(newProductData);
      setProducts((prev) => [created, ...prev.filter((p) => p.id !== tempProduct.id)]);
    } catch (err) {
      console.error('[RLZ SHOP] Error saving product to server DB:', err);
    }
  };

  // 2. Update Product globally on server database
  const handleUpdateProduct = async (updated: Product) => {
    // Optimistic update
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));

    try {
      await updateProductOnServer(updated);
    } catch (err) {
      console.error('[RLZ SHOP] Error updating product on server DB:', err);
    }
  };

  // 3. Delete Product globally from server database
  const handleDeleteProduct = async (productId: string) => {
    // Optimistic update
    setProducts((prev) => prev.filter((p) => p.id !== productId));

    try {
      await deleteProductOnServer(productId);
    } catch (err) {
      console.error('[RLZ SHOP] Error deleting product on server DB:', err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    setAllOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    setCustomerOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));

    try {
      await updateOrderStatusOnServer(orderId, status);
    } catch (err) {
      console.warn('[RLZ SHOP] Error updating order status on server:', err);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    setAllOrders((prev) => prev.filter((o) => o.id !== orderId));
    setCustomerOrders((prev) => prev.filter((o) => o.id !== orderId));

    try {
      await deleteOrderOnServer(orderId);
    } catch (err) {
      console.warn('[RLZ SHOP] Error deleting order on server:', err);
    }
  };

  const handleLoadDemoData = async () => {
    setProducts(DEMO_PRESET_PRODUCTS);
    try {
      await seedDemoProductsOnServer(DEMO_PRESET_PRODUCTS);
    } catch (err) {
      console.error('[RLZ SHOP] Error seeding demo products:', err);
    }
  };

  const handleClearAllProducts = async () => {
    setProducts([]);
    try {
      await clearProductsOnServer();
    } catch (err) {
      console.error('[RLZ SHOP] Error clearing products:', err);
    }
  };

  // Filtered Products for Customer Storefront
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      currentCategory === 'all' ? true : p.category === currentCategory;
    const matchesSearch =
      searchQuery.trim() === ''
        ? true
        : p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.subCategory && p.subCategory.toLowerCase().includes(searchQuery.toLowerCase())) ||
          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const cartTotalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const isLightMode = theme === 'light';

  return (
    <MobileFrameSimulator viewMode={viewMode} onToggleViewMode={toggleViewMode}>
      <div
        className={`min-h-screen flex flex-col transition-colors duration-200 ${
          isLightMode
            ? 'bg-[#F9F7F2] text-neutral-900'
            : 'bg-black text-white'
        }`}
      >
        {/* Navigation Top Bar */}
        <Navbar
          currentCategory={currentCategory}
          onSelectCategory={(cat) => {
            setCurrentCategory(cat);
            setActiveView('shop');
          }}
          activeView={activeView}
          onNavigateView={setActiveView}
          cartCount={cartTotalCount}
          onOpenCart={() => setIsCartOpen(true)}
          theme={theme}
          onToggleTheme={toggleTheme}
          viewMode={viewMode}
          onToggleViewMode={toggleViewMode}
          lang={lang}
          onToggleLanguage={toggleLanguage}
          isAdmin={isAdmin}
          onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        />

        {/* Floating Owner Add Button (+) when logged in as Admin */}
        {isAdmin && (
          <button
            onClick={() => setActiveView('admin')}
            className="fixed bottom-20 ltr:right-5 rtl:left-5 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-[#D4AF37] hover:bg-[#c49f2e] text-black font-extrabold shadow-2xl shadow-[#D4AF37]/40 transition-transform hover:scale-105 active:scale-95"
            title={t.addNewProductBtn}
          >
            <Plus className="w-5 h-5" />
            <span className="text-xs uppercase tracking-wider font-sans">{t.addNewProductBtn}</span>
          </button>
        )}

        {/* VIEW 1: ADMIN DASHBOARD (Protected Route) */}
        {activeView === 'admin' ? (
          isAdmin ? (
            <AdminDashboard
              products={products}
              orders={allOrders}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onDeleteOrder={handleDeleteOrder}
              onLoadDemoData={handleLoadDemoData}
              onClearAllProducts={handleClearAllProducts}
              onLogout={handleAdminLogout}
              onExitAdminView={() => setActiveView('shop')}
              isLightMode={isLightMode}
              lang={lang}
            />
          ) : (
            <div className="py-20 text-center">
              <p className="text-sm text-neutral-400">{t.adminLoginSubtitle}</p>
              <button
                onClick={() => setIsAdminLoginOpen(true)}
                className="mt-4 px-5 py-2.5 rounded-xl bg-[#D4AF37] text-black font-bold text-xs"
              >
                {t.loginButton}
              </button>
            </div>
          )
        ) : activeView === 'orders' ? (
          /* VIEW 2: CUSTOMER ORDER HISTORY */
          <CustomerOrderHistory
            orders={customerOrders}
            onBackToShop={() => setActiveView('shop')}
            isLightMode={isLightMode}
            lang={lang}
          />
        ) : (
          /* VIEW 3: REGULAR CUSTOMER PUBLIC STOREFRONT (Route: `/`) */
          <main className="flex-1 pb-20 md:pb-12">
            {/* Luxury Showroom Hero Banner */}
            <HeroBanner
              onSelectCategory={(cat) => {
                setCurrentCategory(cat);
                const el = document.getElementById('catalog-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              isLightMode={isLightMode}
              lang={lang}
            />

            {/* Catalog Section */}
            <div id="catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 pt-10">
              {/* Category Segmented Controls & Search Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                {/* Segmented Filter Buttons */}
                <div className={`flex items-center gap-1 p-1 rounded-xl border w-fit ${
                  isLightMode
                    ? 'bg-neutral-200/60 border-neutral-300'
                    : 'bg-[#121215] border-white/10'
                }`}>
                  <button
                    type="button"
                    onClick={() => setCurrentCategory('all')}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      currentCategory === 'all'
                        ? 'bg-[#D4AF37] text-black shadow-sm'
                        : isLightMode
                        ? 'text-neutral-700 hover:text-black'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>{t.allFilter} ({products.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentCategory('phones')}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      currentCategory === 'phones'
                        ? 'bg-[#D4AF37] text-black shadow-sm'
                        : isLightMode
                        ? 'text-neutral-700 hover:text-black'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>{t.phoneAccessories}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentCategory('fashion')}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      currentCategory === 'fashion'
                        ? 'bg-[#D4AF37] text-black shadow-sm'
                        : isLightMode
                        ? 'text-neutral-700 hover:text-black'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    <Shirt className="w-3.5 h-3.5" />
                    <span>{t.fashionAccessories}</span>
                  </button>
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-80">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    className={`w-full ltr:pl-9 ltr:pr-4 rtl:pr-9 rtl:pl-4 py-2.5 rounded-xl text-xs border outline-none transition-colors ${
                      isLightMode
                        ? 'bg-white border-neutral-300 text-black focus:border-[#D4AF37]'
                        : 'bg-[#121215] border-white/10 text-white focus:border-[#D4AF37]'
                    }`}
                  />
                  <Search className="w-4 h-4 text-neutral-400 absolute ltr:left-3 rtl:right-3 top-3" />
                </div>
              </div>

              {/* Products Grid or Empty Inventory State */}
              {products.length === 0 ? (
                /* No fake/dummy products initially per instructions */
                <EmptyInventory
                  isAdmin={isAdmin}
                  onOpenAddModal={() => setActiveView('admin')}
                  onLoadDemoSample={handleLoadDemoData}
                  isLightMode={isLightMode}
                  lang={lang}
                />
              ) : filteredProducts.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-sm text-neutral-400">
                    {t.noSearchResults} "{searchQuery}".
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setCurrentCategory('all');
                    }}
                    className="mt-3 px-4 py-2 rounded-lg bg-neutral-800 text-neutral-200 text-xs hover:text-white"
                  >
                    {t.resetFilters}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                      onQuickView={setQuickViewProduct}
                      isLightMode={isLightMode}
                      lang={lang}
                    />
                  ))}
                </div>
              )}
            </div>
          </main>
        )}

        {/* Footer */}
        <Footer
          onSelectCategory={(cat) => {
            setCurrentCategory(cat);
            setActiveView('shop');
          }}
          onNavigateView={setActiveView}
          onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
          isLightMode={isLightMode}
          lang={lang}
        />

        {/* Mobile-First Bottom Navigation Bar */}
        <MobileBottomBar
          activeView={activeView}
          onNavigateView={setActiveView}
          currentCategory={currentCategory}
          onSelectCategory={(cat) => {
            setCurrentCategory(cat);
            setActiveView('shop');
          }}
          cartCount={cartTotalCount}
          onOpenCart={() => setIsCartOpen(true)}
          isLightMode={isLightMode}
          lang={lang}
        />

        {/* Shopping Cart Drawer */}
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveFromCart}
          onClearCart={handleClearCart}
          onOrderCompleted={handleOrderCompleted}
          isLightMode={isLightMode}
          lang={lang}
        />

        {/* Product Detail Modal */}
        <ProductDetailModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onAddToCart={handleAddToCart}
          isLightMode={isLightMode}
          lang={lang}
        />

        {/* Admin Login Modal */}
        <AdminLoginModal
          isOpen={isAdminLoginOpen}
          onClose={() => setIsAdminLoginOpen(false)}
          onLoginSuccess={handleAdminLoginSuccess}
          isLightMode={isLightMode}
          lang={lang}
        />
      </div>
    </MobileFrameSimulator>
  );
}
