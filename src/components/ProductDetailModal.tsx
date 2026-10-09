import React from 'react';
import { X, ShoppingBag, MessageCircle, ShieldCheck, Truck, Check } from 'lucide-react';
import { Product, Language } from '../types';
import { useTranslation } from '../utils/i18n';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  isLightMode?: boolean;
  lang?: Language;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  isLightMode = false,
  lang = 'ar',
}) => {
  const [added, setAdded] = React.useState(false);
  const t = useTranslation(lang);

  if (!product) return null;

  const handleAdd = () => {
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      lang === 'ar'
        ? `سلام متجر RLZ SHOP غليزان! أود الاستفسار وطلب هذا المنتج:\n\n• المنتج: ${product.title}\n• السعر: ${product.price.toLocaleString()} ${t.currency}\n• الفئة: ${
            product.category === 'phones' ? t.phoneAccessories : t.fashionAccessories
          }\n\nيرجى تزويدي بتفاصيل التوصيل. شكرًا!`
        : `Salam RLZ SHOP Relizane! I would like to order this item:\n\n• Product: ${product.title}\n• Price: ${product.price.toLocaleString()} DZD\n• Category: ${
            product.category === 'phones' ? 'Phone Accessories' : 'Fashion'
          }\n\nPlease provide delivery details. Thanks!`
    );
    window.open(`https://wa.me/213556896329?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
      />

      {/* Modal Card */}
      <div
        className={`relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl transition-all ${
          isLightMode ? 'bg-white border-neutral-200 text-neutral-900' : 'bg-[#101013] border-white/10 text-white'
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rtl:right-auto rtl:left-4 z-20 p-2 rounded-xl bg-black/60 text-white hover:bg-black/90 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-square md:aspect-auto bg-neutral-950">
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            {product.badge && (
              <span className="absolute top-4 ltr:left-4 rtl:right-4 text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded bg-black/80 text-[#D4AF37] border border-[#D4AF37]/40">
                {product.badge}
              </span>
            )}
          </div>

          {/* Details */}
          <div className="p-6 flex flex-col justify-between">
            <div>
              {/* Category */}
              <div className="text-xs uppercase tracking-wider text-neutral-400 font-medium">
                {product.category === 'phones' ? t.phoneAccessories : t.fashionAccessories}
                {product.subCategory && ` · ${product.subCategory}`}
              </div>

              {/* Title */}
              <h2 className="font-cinzel text-xl sm:text-2xl font-bold mt-1.5 leading-snug">
                {product.title}
              </h2>

              {/* Prominent Price */}
              <div className="mt-4 pb-4 border-b border-white/10 flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">
                    {t.officialPrice}
                  </span>
                  <span className="font-cinzel font-bold text-2xl text-[#D4AF37] tabular-nums">
                    {product.price.toLocaleString()} {t.currency}
                  </span>
                </div>
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    product.inStock
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {product.inStock ? t.inStock : t.outOfStock}
                </span>
              </div>

              {/* Description */}
              <div className="mt-4 text-xs text-neutral-300 leading-relaxed">
                {product.description || (
                  <p>{t.guaranteeNotice}</p>
                )}
              </div>

              {/* Trust perks */}
              <div className="mt-5 space-y-2 text-[11px] text-neutral-400 border-t border-white/5 pt-4">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#D4AF37]" />
                  <span>{t.algeria58Notice}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                  <span>{t.inspectionNotice}</span>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="mt-6 space-y-2 pt-4 border-t border-white/10">
              <button
                type="button"
                disabled={!product.inStock}
                onClick={handleAdd}
                className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                  added
                    ? 'bg-emerald-600 text-white'
                    : product.inStock
                    ? 'bg-[#D4AF37] hover:bg-[#c49f2e] text-black shadow-lg shadow-[#D4AF37]/20'
                    : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{t.addedToCart}</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>{t.addToCart}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleWhatsApp}
                className="w-full py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{t.orderViaWhatsApp}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
