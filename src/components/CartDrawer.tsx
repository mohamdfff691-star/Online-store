import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, Send, Phone, MapPin, Truck, CheckCircle2 } from 'lucide-react';
import { CartItem, CustomerOrder, Language } from '../types';
import { ALGERIA_WILAYAS, Wilaya } from '../data/wilayas';
import { useTranslation } from '../utils/i18n';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onOrderCompleted: (order: CustomerOrder) => void;
  isLightMode?: boolean;
  lang?: Language;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onOrderCompleted,
  isLightMode = false,
  lang = 'ar',
}) => {
  const t = useTranslation(lang);

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedWilayaCode, setSelectedWilayaCode] = useState('48'); // Relizane default
  const [commune, setCommune] = useState(lang === 'ar' ? 'غليزان' : 'Relizane');
  const [address, setAddress] = useState('');
  const [deliveryType, setDeliveryType] = useState<'home' | 'desk'>('home');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState<CustomerOrder | null>(null);

  const selectedWilaya: Wilaya =
    ALGERIA_WILAYAS.find((w) => w.code === selectedWilayaCode) || ALGERIA_WILAYAS[0];

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryFee =
    items.length > 0
      ? deliveryType === 'home'
        ? selectedWilaya.homeDeliveryFee
        : selectedWilaya.deskDeliveryFee
      : 0;
  const total = subtotal + deliveryFee;

  const validateForm = () => {
    if (!customerName.trim()) {
      setFormError(lang === 'ar' ? 'يرجى إدخال اسمك الكامل.' : 'Please enter your full name.');
      return false;
    }
    if (!phone.trim() || phone.length < 9) {
      setFormError(lang === 'ar' ? 'يرجى إدخال رقم هاتف جزائري صحيح (مثال: 0556896329).' : 'Please enter a valid phone number (e.g. 0556896329).');
      return false;
    }
    if (!address.trim()) {
      setFormError(lang === 'ar' ? 'يرجى تحديد عنوان الاستلام أو الحي.' : 'Please provide your address or neighborhood.');
      return false;
    }
    setFormError('');
    return true;
  };

  const createOrderObject = (directWhatsApp = false): CustomerOrder => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = `RLZ-${selectedWilaya.code}-${randomSuffix}`;
    const wilayaDisplay = lang === 'ar' ? `${selectedWilaya.code} - ${selectedWilaya.arabicName}` : selectedWilaya.name;

    return {
      id: orderId,
      customerName,
      phone,
      wilaya: wilayaDisplay,
      wilayaCode: selectedWilaya.code,
      commune,
      address,
      deliveryType,
      deliveryFee,
      items: [...items],
      subtotal,
      totalAmount: total,
      status: 'pending',
      createdAt: new Date().toISOString(),
      notes,
    };
  };

  const handleCheckoutCOD = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const order = createOrderObject(false);
    onOrderCompleted(order);
    setIsSubmitted(order);
    onClearCart();
  };

  const handleCheckoutWhatsApp = () => {
    if (!validateForm()) return;

    const order = createOrderObject(true);
    onOrderCompleted(order);

    const itemsSummary = items
      .map((it) => `• ${it.product.title} (x${it.quantity}) - ${(it.product.price * it.quantity).toLocaleString()} ${t.currency}`)
      .join('\n');

    const message = encodeURIComponent(
      `*طلب جديد من متجر RLZ SHOP (${order.id})*\n\n` +
      `*الاسم:* ${customerName}\n` +
      `*الهاتف:* ${phone}\n` +
      `*الولاية:* ${selectedWilaya.code} - ${selectedWilaya.arabicName} (${selectedWilaya.name})\n` +
      `*البلدية:* ${commune}\n` +
      `*العنوان:* ${address}\n` +
      `*طريقة التوصيل:* ${deliveryType === 'home' ? 'توصيل للمنزل' : 'استلام من المكتب'}\n\n` +
      `*المنتجات:*\n${itemsSummary}\n\n` +
      `*مجموع المنتجات:* ${subtotal.toLocaleString()} ${t.currency}\n` +
      `*التوصيل:* ${deliveryFee.toLocaleString()} ${t.currency}\n` +
      `*المجموع الإجمالي:* ${total.toLocaleString()} ${t.currency} (الدفع عند الاستلام)\n\n` +
      `يرجى تأكيد الطلب. شكرًا!`
    );

    window.open(`https://wa.me/213556896329?text=${message}`, '_blank');
    setIsSubmitted(order);
    onClearCart();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
      />

      {/* Slide-over Content Container */}
      <div
        className={`relative z-10 w-full max-w-md h-full flex flex-col shadow-2xl overflow-hidden transition-all duration-300 ${
          isLightMode ? 'bg-[#FCFAF7] text-neutral-900' : 'bg-[#0E0E10] text-neutral-100'
        }`}
      >
        {/* Header */}
        <div className={`p-4 border-b flex items-center justify-between ${
          isLightMode ? 'border-neutral-200 bg-white' : 'border-white/10 bg-[#141417]'
        }`}>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
            <h2 className="font-cinzel font-bold text-base tracking-wide">
              {t.cartTitle}
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] font-semibold">
              {items.reduce((s, i) => s + i.quantity, 0)}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-800/40 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Modal state */}
        {isSubmitted ? (
          <div className="p-6 flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4 text-emerald-500">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="font-cinzel font-bold text-xl text-[#D4AF37]">
              {t.orderSuccessTitle}
            </h3>
            <p className="text-xs mt-1 text-neutral-400 font-mono">
              {t.orderRef} <span className="font-bold text-white" dir="ltr">{isSubmitted.id}</span>
            </p>
            <p className={`text-xs mt-3 leading-relaxed ${isLightMode ? 'text-neutral-600' : 'text-neutral-300'}`}>
              {t.orderSuccessDesc}
            </p>

            <div className={`mt-6 w-full p-4 rounded-xl text-left rtl:text-right text-xs space-y-1.5 border ${
              isLightMode ? 'bg-neutral-100 border-neutral-200' : 'bg-neutral-900/80 border-white/10'
            }`}>
              <div className="flex justify-between">
                <span className="text-neutral-400">{t.totalLabel}</span>
                <span className="font-bold text-[#D4AF37] font-cinzel text-sm">{isSubmitted.totalAmount.toLocaleString()} {t.currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">{t.wilayaLabel}</span>
                <span className="text-neutral-200">{isSubmitted.wilaya}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">{t.codPaymentNotice}</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col w-full gap-2">
              <button
                onClick={() => {
                  setIsSubmitted(null);
                  onClose();
                }}
                className="w-full py-3 rounded-xl bg-[#D4AF37] hover:bg-[#c49f2e] text-black font-semibold text-xs tracking-wider uppercase transition-colors"
              >
                {t.continueShopping}
              </button>
            </div>
          </div>
        ) : items.length === 0 ? (
          /* Empty Cart State */
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] mb-3">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <p className="font-cinzel text-lg font-bold">{t.cartEmptyTitle}</p>
            <p className="text-xs text-neutral-400 mt-1 max-w-xs">
              {t.cartEmptyDesc}
            </p>
            <button
              onClick={onClose}
              className="mt-6 px-6 py-2.5 rounded-xl bg-[#D4AF37] text-black text-xs font-bold uppercase tracking-wider hover:bg-[#c49f2e] transition-colors"
            >
              {t.discoverCollection}
            </button>
          </div>
        ) : (
          /* Items List & Checkout Form */
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Products List */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                {t.selectedItems} ({items.length})
              </h4>
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className={`flex gap-3 p-2.5 rounded-xl border ${
                    isLightMode ? 'bg-white border-neutral-200' : 'bg-[#151518] border-white/5'
                  }`}
                >
                  <img
                    src={item.product.image}
                    alt={item.product.title}
                    className="w-16 h-16 rounded-lg object-cover bg-neutral-800 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-semibold truncate text-neutral-100">
                      {item.product.title}
                    </h5>
                    <p className="text-[11px] text-[#D4AF37] font-semibold mt-0.5">
                      {item.product.price.toLocaleString()} {t.currency}
                    </p>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-white/10 rounded-lg overflow-hidden" dir="ltr">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                          className="px-2 py-0.5 hover:bg-neutral-800 text-neutral-300"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-medium tabular-nums text-neutral-200">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          className="px-2 py-0.5 hover:bg-neutral-800 text-neutral-300"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.product.id)}
                        className="text-neutral-400 hover:text-rose-400 p-1"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Algerian Checkout Form */}
            <form onSubmit={handleCheckoutCOD} className="space-y-3 pt-3 border-t border-dashed border-neutral-700/40">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{t.deliveryInfoTitle}</span>
                </h4>
              </div>

              {formError && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                  {formError}
                </div>
              )}

              {/* Name input */}
              <div>
                <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                  {t.fullNameLabel}
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={t.fullNamePlaceholder}
                  className={`w-full px-3 py-2 rounded-lg text-xs border outline-none focus:border-[#D4AF37] transition-colors ${
                    isLightMode ? 'bg-white border-neutral-300 text-black' : 'bg-neutral-900 border-white/10 text-white'
                  }`}
                />
              </div>

              {/* Phone input */}
              <div>
                <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                  {t.phoneLabel}
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t.phonePlaceholder}
                    className={`w-full px-3 py-2 rounded-lg text-xs border outline-none focus:border-[#D4AF37] transition-colors ${
                      isLightMode ? 'bg-white border-neutral-300 text-black' : 'bg-neutral-900 border-white/10 text-white'
                    }`}
                  />
                </div>
              </div>

              {/* Wilaya selector */}
              <div>
                <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                  {t.wilayaLabel}
                </label>
                <select
                  value={selectedWilayaCode}
                  onChange={(e) => setSelectedWilayaCode(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg text-xs border outline-none focus:border-[#D4AF37] transition-colors ${
                    isLightMode ? 'bg-white border-neutral-300 text-black' : 'bg-neutral-900 border-white/10 text-white'
                  }`}
                >
                  {ALGERIA_WILAYAS.map((w) => (
                    <option key={w.code} value={w.code}>
                      {w.code} - {lang === 'ar' ? w.arabicName : w.name.split('-')[1]?.trim() || w.name} ({w.homeDeliveryFee} {t.currency})
                    </option>
                  ))}
                </select>
              </div>

              {/* Commune & Address */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                    {t.communeLabel}
                  </label>
                  <input
                    type="text"
                    required
                    value={commune}
                    onChange={(e) => setCommune(e.target.value)}
                    placeholder={t.communePlaceholder}
                    className={`w-full px-3 py-2 rounded-lg text-xs border outline-none focus:border-[#D4AF37] transition-colors ${
                      isLightMode ? 'bg-white border-neutral-300 text-black' : 'bg-neutral-900 border-white/10 text-white'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                    {t.addressLabel}
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={t.addressPlaceholder}
                    className={`w-full px-3 py-2 rounded-lg text-xs border outline-none focus:border-[#D4AF37] transition-colors ${
                      isLightMode ? 'bg-white border-neutral-300 text-black' : 'bg-neutral-900 border-white/10 text-white'
                    }`}
                  />
                </div>
              </div>

              {/* Delivery Type Switch */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setDeliveryType('home')}
                  className={`p-2 rounded-lg text-left rtl:text-right border text-xs transition-colors ${
                    deliveryType === 'home'
                      ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-white'
                      : 'border-white/10 text-neutral-400'
                  }`}
                >
                  <div className="font-semibold text-neutral-200">{t.homeDelivery}</div>
                  <div className="text-[10px] text-[#D4AF37]">{selectedWilaya.homeDeliveryFee} {t.currency}</div>
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryType('desk')}
                  className={`p-2 rounded-lg text-left rtl:text-right border text-xs transition-colors ${
                    deliveryType === 'desk'
                      ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-white'
                      : 'border-white/10 text-neutral-400'
                  }`}
                >
                  <div className="font-semibold text-neutral-200">{t.deskDelivery}</div>
                  <div className="text-[10px] text-[#D4AF37]">{selectedWilaya.deskDeliveryFee} {t.currency}</div>
                </button>
              </div>

              {/* Summary Calculation */}
              <div className={`p-3 rounded-xl space-y-1.5 text-xs border mt-3 ${
                isLightMode ? 'bg-neutral-100 border-neutral-200' : 'bg-neutral-900/60 border-white/10'
              }`}>
                <div className="flex justify-between text-neutral-400">
                  <span>{t.subtotalLabel}</span>
                  <span className="tabular-nums font-medium text-neutral-200">{subtotal.toLocaleString()} {t.currency}</span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5" />
                    <span>{t.deliveryFeeLabel}</span>
                  </span>
                  <span className="tabular-nums font-medium text-neutral-200">{deliveryFee.toLocaleString()} {t.currency}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-white/10 font-cinzel font-bold text-sm text-[#D4AF37]">
                  <span>{t.totalLabel}</span>
                  <span className="tabular-nums text-base">{total.toLocaleString()} {t.currency}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#D4AF37] hover:bg-[#c49f2e] text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-lg shadow-[#D4AF37]/15"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t.confirmOrderCod}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCheckoutWhatsApp}
                  className="w-full py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-md"
                >
                  <Send className="w-4 h-4" />
                  <span>{t.orderViaWhatsApp}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
