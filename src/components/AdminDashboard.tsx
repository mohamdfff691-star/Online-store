import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Package, ShoppingBag, Phone, MessageSquare, Upload, Sparkles, LogOut, Search, ArrowLeft, AlertCircle, X } from 'lucide-react';
import { Product, CustomerOrder, OrderStatus, Language } from '../types';
import { useTranslation } from '../utils/i18n';

interface AdminDashboardProps {
  products: Product[];
  orders: CustomerOrder[];
  onAddProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onDeleteOrder: (orderId: string) => void;
  onLoadDemoData: () => void;
  onClearAllProducts: () => void;
  onLogout: () => void;
  onExitAdminView: () => void;
  isLightMode?: boolean;
  lang?: Language;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  orders,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onUpdateOrderStatus,
  onDeleteOrder,
  onLoadDemoData,
  onClearAllProducts,
  onLogout,
  onExitAdminView,
  isLightMode = false,
  lang = 'ar',
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const t = useTranslation(lang);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'phones' | 'fashion'>('phones');
  const [subCategory, setSubCategory] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [inStock, setInStock] = useState(true);
  const [badge, setBadge] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [formError, setFormError] = useState('');

  // Search filter
  const [productSearch, setProductSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');

  const openAddModal = () => {
    setEditingProduct(null);
    setTitle('');
    setCategory('phones');
    setSubCategory('');
    setPrice('');
    setDescription('');
    setImageUrl('');
    setImagePreview('');
    setInStock(true);
    setBadge('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setTitle(p.title);
    setCategory(p.category);
    setSubCategory(p.subCategory || '');
    setPrice(p.price.toString());
    setDescription(p.description);
    setImageUrl(p.image);
    setImagePreview(p.image);
    setInStock(p.inStock);
    setBadge(p.badge || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        setFormError(lang === 'ar' ? 'حجم الصورة كبير جدًا (الحد الأقصى 4 ميغابايت).' : 'Image file is too large (max 4MB).');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setImageUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePresetSelect = (presetUrl: string) => {
    setImagePreview(presetUrl);
    setImageUrl(presetUrl);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError(lang === 'ar' ? 'يرجى إدخال اسم المنتج.' : 'Please enter the product title.');
      return;
    }
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setFormError(lang === 'ar' ? 'يرجى إدخال سعر صحيح بالدينار الجزائري.' : 'Please enter a valid price in DZD.');
      return;
    }
    const finalImage =
      imageUrl.trim() ||
      imagePreview ||
      (category === 'phones'
        ? '/src/assets/images/rlz_shop_phone_acc_1791585318914.jpg'
        : '/src/assets/images/rlz_shop_fashion_acc_1791585335234.jpg');

    if (editingProduct) {
      onUpdateProduct({
        ...editingProduct,
        title: title.trim(),
        category,
        subCategory: subCategory.trim(),
        price: numPrice,
        description: description.trim(),
        image: finalImage,
        inStock,
        badge: badge.trim(),
      });
    } else {
      onAddProduct({
        title: title.trim(),
        category,
        subCategory: subCategory.trim(),
        price: numPrice,
        description: description.trim(),
        image: finalImage,
        inStock,
        badge: badge.trim(),
      });
    }

    setIsModalOpen(false);
  };

  const filteredProducts = products.filter(
    (p) =>
      p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.subCategory && p.subCategory.toLowerCase().includes(productSearch.toLowerCase()))
  );

  const filteredOrders = orders.filter(
    (o) =>
      o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.phone.includes(orderSearch) ||
      o.wilaya.toLowerCase().includes(orderSearch.toLowerCase())
  );

  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="min-h-screen pb-16">
      {/* Top Admin Navigation Bar */}
      <header className={`border-b sticky top-0 z-30 backdrop-blur-md ${
        isLightMode ? 'bg-white/95 border-neutral-200' : 'bg-[#0E0E10]/95 border-white/10'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onExitAdminView}
              className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-neutral-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-[#D4AF37] rtl:rotate-180" />
              <span className="hidden sm:inline">{t.backToClientView}</span>
            </button>
            <div className="h-4 w-[1px] bg-neutral-700 hidden sm:block" />
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <h1 className="font-cinzel font-bold text-sm sm:text-base text-[#D4AF37] tracking-wider">
                {t.adminHeaderTitle}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Owner Add New Product Button */}
            <button
              onClick={openAddModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#c49f2e] text-black font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-[#D4AF37]/20"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">{t.addNewProductBtn}</span>
              <span className="sm:hidden">(+)</span>
            </button>

            {/* Logout */}
            <button
              onClick={onLogout}
              className="p-2 rounded-xl text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors"
              title={t.logoutBtn}
            >
              <LogOut className="w-4 h-4 rtl:rotate-180" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {/* KPI Metric Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <div className={`p-4 rounded-2xl border ${isLightMode ? 'bg-white border-neutral-200' : 'bg-[#121215] border-white/5'}`}>
            <span className="text-[11px] text-neutral-400 uppercase tracking-wider font-medium">{t.metricCatalogItems}</span>
            <div className="font-cinzel font-bold text-2xl text-white mt-1 tabular-nums">
              {products.length}
            </div>
          </div>

          <div className={`p-4 rounded-2xl border ${isLightMode ? 'bg-white border-neutral-200' : 'bg-[#121215] border-white/5'}`}>
            <span className="text-[11px] text-neutral-400 uppercase tracking-wider font-medium">{t.metricOrdersReceived}</span>
            <div className="font-cinzel font-bold text-2xl text-white mt-1 tabular-nums">
              {orders.length}
            </div>
          </div>

          <div className={`p-4 rounded-2xl border ${isLightMode ? 'bg-white border-neutral-200' : 'bg-[#121215] border-white/5'}`}>
            <span className="text-[11px] text-neutral-400 uppercase tracking-wider font-medium">{t.metricTotalRevenue}</span>
            <div className="font-cinzel font-bold text-2xl text-[#D4AF37] mt-1 tabular-nums">
              {totalRevenue.toLocaleString()} <span className="text-xs">{t.currency}</span>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border ${isLightMode ? 'bg-white border-neutral-200' : 'bg-[#121215] border-white/5'}`}>
            <span className="text-[11px] text-neutral-400 uppercase tracking-wider font-medium">{t.metricPendingDeliveries}</span>
            <div className="font-cinzel font-bold text-2xl text-amber-400 mt-1 tabular-nums">
              {orders.filter((o) => o.status === 'pending' || o.status === 'shipped').length}
            </div>
          </div>
        </div>

        {/* Tab Switcher & Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-neutral-900 border border-white/10 w-fit">
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'products'
                  ? 'bg-[#D4AF37] text-black shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>{t.tabInventory} ({products.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'orders'
                  ? 'bg-[#D4AF37] text-black shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{t.tabOrders} ({orders.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onLoadDemoData}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 hover:border-[#D4AF37]/50 text-neutral-300 hover:text-white text-xs transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{t.loadDemoDataBtn}</span>
            </button>

            {products.length > 0 && (
              <button
                onClick={onClearAllProducts}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 text-xs transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t.clearInventoryBtn}</span>
              </button>
            )}
          </div>
        </div>

        {/* TAB 1: INVENTORY MANAGEMENT */}
        {activeTab === 'products' && (
          <div className={`rounded-2xl border overflow-hidden ${
            isLightMode ? 'bg-white border-neutral-200' : 'bg-[#121215] border-white/5'
          }`}>
            {/* Search Header */}
            <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder={t.searchInventoryPlaceholder}
                  className={`w-full ltr:pl-9 ltr:pr-3 rtl:pr-9 rtl:pl-3 py-2 rounded-xl text-xs border outline-none focus:border-[#D4AF37] ${
                    isLightMode ? 'bg-neutral-100 border-neutral-300 text-black' : 'bg-neutral-900 border-white/10 text-white'
                  }`}
                />
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute ltr:left-3 rtl:right-3 top-3" />
              </div>

              <div className="text-xs text-neutral-400">
                {filteredProducts.length} {t.colProduct}
              </div>
            </div>

            {/* Products Table */}
            {filteredProducts.length === 0 ? (
              <div className="p-12 text-center text-neutral-400">
                <Package className="w-12 h-12 mx-auto text-neutral-600 mb-2" />
                <p className="text-sm font-semibold">{t.noSearchResults}</p>
                <button
                  onClick={openAddModal}
                  className="mt-4 px-4 py-2 rounded-xl bg-[#D4AF37] text-black text-xs font-bold"
                >
                  {t.addNewProductBtn}
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left rtl:text-right text-xs">
                  <thead className={`border-b text-neutral-400 uppercase tracking-wider text-[10px] ${
                    isLightMode ? 'bg-neutral-50 border-neutral-200' : 'bg-neutral-900/40 border-white/5'
                  }`}>
                    <tr>
                      <th className="py-3 px-4">{t.colProduct}</th>
                      <th className="py-3 px-4">{t.colCategory}</th>
                      <th className="py-3 px-4">{t.colPrice}</th>
                      <th className="py-3 px-4">{t.colStock}</th>
                      <th className="py-3 px-4 text-right rtl:text-left">{t.colActions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.image}
                              alt={p.title}
                              className="w-12 h-12 rounded-lg object-cover bg-neutral-800 shrink-0"
                            />
                            <div>
                              <div className="font-semibold text-neutral-100">{p.title}</div>
                              {p.badge && (
                                <span className="text-[10px] text-[#D4AF37] uppercase">{p.badge}</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-neutral-300">
                          {p.category === 'phones' ? t.phoneAccessories : t.fashionAccessories}
                          {p.subCategory && <div className="text-[10px] text-neutral-400">{p.subCategory}</div>}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-[#D4AF37] tabular-nums text-sm">
                          {p.price.toLocaleString()} {t.currency}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => onUpdateProduct({ ...p, inStock: !p.inStock })}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-medium border transition-colors ${
                              p.inStock
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            }`}
                          >
                            {p.inStock ? t.inStock : t.outOfStock}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right rtl:text-left">
                          <div className="flex items-center justify-end rtl:justify-start gap-1.5">
                            <button
                              onClick={() => openEditModal(p)}
                              className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-300 hover:text-[#D4AF37]"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDeleteProduct(p.id)}
                              className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-rose-400"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CUSTOMER ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className={`rounded-2xl border overflow-hidden ${
            isLightMode ? 'bg-white border-neutral-200' : 'bg-[#121215] border-white/5'
          }`}>
            <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder={t.searchOrdersAdminPlaceholder}
                  className={`w-full ltr:pl-9 ltr:pr-3 rtl:pr-9 rtl:pl-3 py-2 rounded-xl text-xs border outline-none focus:border-[#D4AF37] ${
                    isLightMode ? 'bg-neutral-100 border-neutral-300 text-black' : 'bg-neutral-900 border-white/10 text-white'
                  }`}
                />
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute ltr:left-3 rtl:right-3 top-3" />
              </div>
              <div className="text-xs text-neutral-400">
                {filteredOrders.length} {t.tabOrders}
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="p-12 text-center text-neutral-400">
                <ShoppingBag className="w-12 h-12 mx-auto text-neutral-600 mb-2" />
                <p className="text-sm font-semibold">{t.noOrdersTitle}</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {filteredOrders.map((ord) => (
                  <div key={ord.id} className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-xs text-[#D4AF37]" dir="ltr">
                          #{ord.id}
                        </span>
                        <span className="text-xs text-white font-semibold">
                          {ord.customerName}
                        </span>
                        <span className="text-xs text-neutral-400 font-mono" dir="ltr">
                          ({ord.phone})
                        </span>
                      </div>
                      <div className="text-xs text-neutral-400 flex items-center gap-2">
                        <span>{ord.commune}, {ord.wilaya}</span>
                        <span>·</span>
                        <span className="text-neutral-500">{ord.address}</span>
                      </div>
                      <div className="text-xs text-neutral-300 pt-1">
                        {t.orderedItems}: {ord.items.map((i) => `${i.product.title} (x${i.quantity})`).join(', ')}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="text-right rtl:text-left">
                        <div className="font-cinzel font-bold text-base text-[#D4AF37] tabular-nums">
                          {ord.totalAmount.toLocaleString()} {t.currency}
                        </div>
                        <div className="text-[10px] text-neutral-400 uppercase">
                          {ord.deliveryType === 'home' ? t.homeDelivery : t.deskDelivery}
                        </div>
                      </div>

                      {/* Status Selector */}
                      <select
                        value={ord.status}
                        onChange={(e) => onUpdateOrderStatus(ord.id, e.target.value as OrderStatus)}
                        className="px-2.5 py-1.5 rounded-lg text-xs bg-neutral-900 border border-white/10 text-white outline-none focus:border-[#D4AF37]"
                      >
                        <option value="pending">{t.statusPending}</option>
                        <option value="confirmed">{t.statusConfirmed}</option>
                        <option value="shipped">{t.statusShipped}</option>
                        <option value="delivered">{t.statusDelivered}</option>
                        <option value="cancelled">{t.statusCancelled}</option>
                      </select>

                      {/* Direct WhatsApp Call & Message to Customer */}
                      <a
                        href={`https://wa.me/${ord.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                          `Salam ${ord.customerName}, RLZ SHOP Relizane (#${ord.id}).`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/30 transition-colors"
                        title="WhatsApp Customer"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </a>

                      <a
                        href={`tel:${ord.phone}`}
                        className="p-2 rounded-lg bg-neutral-800 text-neutral-200 hover:text-white transition-colors"
                        title="Call Customer"
                      >
                        <Phone className="w-4 h-4" />
                      </a>

                      <button
                        onClick={() => onDeleteOrder(ord.id)}
                        className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-500 hover:text-rose-400 transition-colors"
                        title="Delete Order"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODAL: ADD / EDIT PRODUCT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          <div
            className={`relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-6 border shadow-2xl ${
              isLightMode ? 'bg-white border-neutral-300 text-black' : 'bg-[#101013] border-white/10 text-white'
            }`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <h3 className="font-cinzel font-bold text-lg text-[#D4AF37]">
                {editingProduct ? t.modalEditTitle : t.modalAddTitle}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              {/* Product Title */}
              <div>
                <label className="block font-medium text-neutral-400 mb-1">
                  {t.formProdName}
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Coque Titanium Gold iPhone 16 Pro Max"
                  className={`w-full px-3 py-2.5 rounded-xl border outline-none focus:border-[#D4AF37] ${
                    isLightMode ? 'bg-neutral-100 border-neutral-300 text-black' : 'bg-neutral-900 border-white/10 text-white'
                  }`}
                />
              </div>

              {/* Category & Subcategory */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-400 mb-1">
                    {t.formProdCategory}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as 'phones' | 'fashion')}
                    className={`w-full px-3 py-2.5 rounded-xl border outline-none focus:border-[#D4AF37] ${
                      isLightMode ? 'bg-neutral-100 border-neutral-300 text-black' : 'bg-neutral-900 border-white/10 text-white'
                    }`}
                  >
                    <option value="phones">{t.phoneAccessories}</option>
                    <option value="fashion">{t.fashionAccessories}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-neutral-400 mb-1">
                    {t.formProdSubCat}
                  </label>
                  <input
                    type="text"
                    value={subCategory}
                    onChange={(e) => setSubCategory(e.target.value)}
                    placeholder="e.g. Coques, Montres, Lunettes"
                    className={`w-full px-3 py-2.5 rounded-xl border outline-none focus:border-[#D4AF37] ${
                      isLightMode ? 'bg-neutral-100 border-neutral-300 text-black' : 'bg-neutral-900 border-white/10 text-white'
                    }`}
                  />
                </div>
              </div>

              {/* Price in DZD & Badge */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-400 mb-1">
                    {t.formProdPrice}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="3500"
                    className={`w-full px-3 py-2.5 rounded-xl border outline-none focus:border-[#D4AF37] font-mono ${
                      isLightMode ? 'bg-neutral-100 border-neutral-300 text-black' : 'bg-neutral-900 border-white/10 text-white'
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-medium text-neutral-400 mb-1">
                    {t.formProdBadge}
                  </label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="e.g. Exclusif, Best-Seller"
                    className={`w-full px-3 py-2.5 rounded-xl border outline-none focus:border-[#D4AF37] ${
                      isLightMode ? 'bg-neutral-100 border-neutral-300 text-black' : 'bg-neutral-900 border-white/10 text-white'
                    }`}
                  />
                </div>
              </div>

              {/* Image Upload & Presets */}
              <div>
                <label className="block font-medium text-neutral-400 mb-1">
                  {t.formProdPhoto}
                </label>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 cursor-pointer text-neutral-200 border border-white/10 transition-colors">
                      <Upload className="w-4 h-4 text-[#D4AF37]" />
                      <span>{t.uploadFromDevice}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                    </label>

                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => {
                        setImageUrl(e.target.value);
                        setImagePreview(e.target.value);
                      }}
                      placeholder={t.orPasteUrl}
                      className={`flex-1 px-3 py-2 rounded-xl border outline-none focus:border-[#D4AF37] ${
                        isLightMode ? 'bg-neutral-100 border-neutral-300 text-black' : 'bg-neutral-900 border-white/10 text-white'
                      }`}
                    />
                  </div>

                  {/* Studio Presets Shortcuts */}
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <span className="text-[10px] text-neutral-500">{t.presetsLabel}</span>
                    <button
                      type="button"
                      onClick={() => handlePresetSelect('/src/assets/images/rlz_shop_phone_acc_1791585318914.jpg')}
                      className="px-2 py-0.5 rounded text-[10px] bg-neutral-800 hover:bg-neutral-700 text-[#D4AF37] border border-[#D4AF37]/30"
                    >
                      {t.presetCase}
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePresetSelect('/src/assets/images/rlz_shop_fashion_acc_1791585335234.jpg')}
                      className="px-2 py-0.5 rounded text-[10px] bg-neutral-800 hover:bg-neutral-700 text-[#D4AF37] border border-[#D4AF37]/30"
                    >
                      {t.presetFashion}
                    </button>
                  </div>

                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="mt-2 w-24 h-24 rounded-xl overflow-hidden border border-[#D4AF37]/40 bg-neutral-900">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-medium text-neutral-400 mb-1">
                  {t.formProdDesc}
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details..."
                  className={`w-full px-3 py-2 rounded-xl border outline-none focus:border-[#D4AF37] ${
                    isLightMode ? 'bg-neutral-100 border-neutral-300 text-black' : 'bg-neutral-900 border-white/10 text-white'
                  }`}
                />
              </div>

              {/* In Stock toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="inStockCheck"
                  checked={inStock}
                  onChange={(e) => setInStock(e.target.checked)}
                  className="w-4 h-4 accent-[#D4AF37] rounded"
                />
                <label htmlFor="inStockCheck" className="text-neutral-300 select-none">
                  {t.formProdInStock}
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-white"
                >
                  {t.btnCancel}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#c49f2e] text-black font-bold uppercase tracking-wider shadow-lg shadow-[#D4AF37]/20"
                >
                  {editingProduct ? t.btnSaveEdit : t.btnPublish}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
