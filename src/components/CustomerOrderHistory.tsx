import React, { useState } from 'react';
import { Package, Search, Calendar, MapPin, Phone, MessageSquare, ChevronDown, ChevronUp, ShoppingBag, Clock } from 'lucide-react';
import { CustomerOrder, OrderStatus, Language } from '../types';
import { useTranslation } from '../utils/i18n';

interface CustomerOrderHistoryProps {
  orders: CustomerOrder[];
  onBackToShop: () => void;
  isLightMode?: boolean;
  lang?: Language;
}

export const CustomerOrderHistory: React.FC<CustomerOrderHistoryProps> = ({
  orders,
  onBackToShop,
  isLightMode = false,
  lang = 'ar',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(orders[0]?.id || null);
  const t = useTranslation(lang);

  const filteredOrders = orders.filter((order) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      order.id.toLowerCase().includes(q) ||
      order.phone.includes(q) ||
      order.customerName.toLowerCase().includes(q) ||
      order.wilaya.toLowerCase().includes(q)
    );
  });

  const getStatusDisplay = (status: OrderStatus) => {
    switch (status) {
      case 'confirmed':
        return { label: t.statusConfirmed, bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
      case 'shipped':
        return { label: t.statusShipped, bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
      case 'delivered':
        return { label: t.statusDelivered, bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
      case 'cancelled':
        return { label: t.statusCancelled, bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
      case 'pending':
      default:
        return { label: t.statusPending, bg: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' };
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-DZ' : 'en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(d);
    } catch {
      return isoString;
    }
  };

  const contactShopForOrder = (order: CustomerOrder) => {
    const msg = encodeURIComponent(
      lang === 'ar'
        ? `سلام متجر RLZ SHOP! أود الاستفسار عن حالة طلبي رقم #${order.id} المسجل باسم ${order.customerName} (${order.phone}).\nالمجموع: ${order.totalAmount.toLocaleString()} ${t.currency}.`
        : `Salam RLZ SHOP! I would like to inquire about my order #${order.id} placed by ${order.customerName} (${order.phone}).\nTotal: ${order.totalAmount.toLocaleString()} DZD.`
    );
    window.open(`https://wa.me/213556896329?text=${msg}`, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-neutral-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#D4AF37]">
            <Package className="w-4 h-4" />
            <span>{t.orderHistoryBadge}</span>
          </div>
          <h1 className="font-cinzel text-2xl sm:text-3xl font-extrabold mt-1 tracking-tight">
            {t.orderHistoryTitle}
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            {t.orderHistoryDesc}
          </p>
        </div>

        <button
          onClick={onBackToShop}
          className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border text-xs font-semibold transition-colors ${
            isLightMode
              ? 'border-neutral-300 bg-white hover:bg-neutral-100 text-black'
              : 'border-white/10 bg-neutral-900 hover:bg-neutral-800 text-white'
          }`}
        >
          <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />
          <span>{t.backToShop}</span>
        </button>
      </div>

      {/* Search / Filter by Phone or Order ID */}
      {orders.length > 0 && (
        <div className="mb-6 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchOrdersPlaceholder}
            className={`w-full ltr:pl-10 ltr:pr-4 rtl:pr-10 rtl:pl-4 py-3 rounded-xl text-xs border outline-none focus:border-[#D4AF37] transition-colors ${
              isLightMode
                ? 'bg-white border-neutral-300 text-black shadow-sm'
                : 'bg-[#121214] border-white/10 text-white'
            }`}
          />
          <Search className="w-4 h-4 text-neutral-400 absolute ltr:left-3.5 rtl:right-3.5 top-3.5" />
        </div>
      )}

      {/* Orders List or Empty State */}
      {orders.length === 0 ? (
        <div
          className={`py-16 px-6 text-center rounded-2xl border ${
            isLightMode ? 'bg-white border-neutral-200' : 'bg-[#111113] border-white/10'
          }`}
        >
          <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 flex items-center justify-center mx-auto mb-4 text-[#D4AF37]">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="font-cinzel text-xl font-bold">{t.noOrdersTitle}</h3>
          <p className="text-xs text-neutral-400 mt-2 max-w-sm mx-auto">
            {t.noOrdersDesc}
          </p>
          <button
            onClick={onBackToShop}
            className="mt-6 px-6 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#c49f2e] text-black font-semibold text-xs tracking-wider uppercase transition-colors"
          >
            {t.discoverCollection}
          </button>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-12 text-center text-neutral-400 text-xs">
          {t.noSearchResults} "{searchQuery}".
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const statusInfo = getStatusDisplay(order.status);

            return (
              <div
                key={order.id}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isLightMode
                    ? 'bg-white border-neutral-200 shadow-sm hover:border-[#D4AF37]/50'
                    : 'bg-[#121215] border-white/10 hover:border-[#D4AF37]/40'
                }`}
              >
                {/* Order Summary Top Bar */}
                <div
                  onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] shrink-0 mt-0.5 sm:mt-0">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-xs tracking-wider text-neutral-200" dir="ltr">
                          #{order.id}
                        </span>
                        <span className={`text-[11px] px-2.5 py-0.5 rounded-full border font-medium ${statusInfo.bg}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(order.createdAt)}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#D4AF37]" />
                          {order.wilaya}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-white/5">
                    <div className="text-left rtl:text-right sm:text-right rtl:sm:text-left">
                      <div className="text-[10px] text-neutral-400 uppercase tracking-wider">{t.totalLabel}</div>
                      <div className="font-cinzel font-bold text-base sm:text-lg text-[#D4AF37] tabular-nums">
                        {order.totalAmount.toLocaleString()} {t.currency}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="p-1 rounded-lg text-neutral-400 hover:text-white"
                      aria-label="Toggle details"
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-white/5 p-4 sm:p-6 bg-black/20 space-y-5">
                    {/* Items Grid */}
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
                        {t.orderedItems} ({order.items.reduce((s, i) => s + i.quantity, 0)})
                      </h4>
                      <div className="divide-y divide-white/5 border border-white/5 rounded-xl overflow-hidden bg-neutral-900/40">
                        {order.items.map((it, idx) => (
                          <div key={idx} className="p-3 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={it.product.image}
                                alt={it.product.title}
                                className="w-12 h-12 rounded-lg object-cover bg-neutral-800 shrink-0"
                              />
                              <div className="min-w-0">
                                <h5 className="text-xs font-semibold text-neutral-200 truncate">
                                  {it.product.title}
                                </h5>
                                <div className="text-[11px] text-neutral-400">
                                  {lang === 'ar' ? 'الكمية:' : 'Qty:'} <span className="text-white font-medium">{it.quantity}</span> × {it.product.price.toLocaleString()} {t.currency}
                                </div>
                              </div>
                            </div>
                            <div className="text-xs font-bold text-[#D4AF37] font-mono tabular-nums shrink-0">
                              {(it.product.price * it.quantity).toLocaleString()} {t.currency}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery & Payment Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-white/5 space-y-1.5">
                        <div className="font-semibold text-neutral-200 flex items-center gap-1.5 text-xs text-[#D4AF37]">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{t.deliveryAddressHeader}</span>
                        </div>
                        <div className="text-neutral-300 font-medium">{order.customerName}</div>
                        <div className="text-neutral-400 font-mono" dir="ltr">{order.phone}</div>
                        <div className="text-neutral-400">
                          {order.commune}, {order.wilaya}
                        </div>
                        <div className="text-neutral-400 text-[11px]">{order.address}</div>
                        <div className="text-[10px] text-neutral-500 pt-1">
                          {order.deliveryType === 'home' ? t.homeDelivery : t.deskDelivery}
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-white/5 space-y-1.5">
                        <div className="font-semibold text-neutral-200 flex items-center gap-1.5 text-xs text-[#D4AF37]">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{t.paymentAndTracking}</span>
                        </div>
                        <div className="flex justify-between text-neutral-400">
                          <span>{t.subtotalLabel}</span>
                          <span className="text-neutral-200 tabular-nums">{order.subtotal.toLocaleString()} {t.currency}</span>
                        </div>
                        <div className="flex justify-between text-neutral-400">
                          <span>{t.deliveryFeeLabel}</span>
                          <span className="text-neutral-200 tabular-nums">{order.deliveryFee.toLocaleString()} {t.currency}</span>
                        </div>
                        <div className="flex justify-between font-bold text-neutral-100 pt-1 border-t border-white/10">
                          <span>{t.totalLabel}</span>
                          <span className="text-[#D4AF37] tabular-nums">{order.totalAmount.toLocaleString()} {t.currency}</span>
                        </div>
                        <div className="text-[11px] text-emerald-400 font-medium pt-1">
                          {t.codPaymentNotice}
                        </div>
                      </div>
                    </div>

                    {/* WhatsApp Direct follow up */}
                    <div className="flex flex-col sm:flex-row gap-2 pt-2">
                      <button
                        onClick={() => contactShopForOrder(order)}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/40 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>{t.contactShopOrderWhatsApp}</span>
                      </button>

                      <a
                        href="tel:+213556896329"
                        className="py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium flex items-center justify-center gap-2 transition-colors"
                      >
                        <Phone className="w-4 h-4 text-[#D4AF37]" />
                        <span>{t.callBoutique}</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
