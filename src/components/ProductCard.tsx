import React from 'react';
import { ShoppingBag, MessageCircle, Eye, Check } from 'lucide-react';
import { Product, Language } from '../types';
import { useTranslation } from '../utils/i18n';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
  isLightMode?: boolean;
  lang?: Language;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onQuickView,
  isLightMode = false,
  lang = 'ar',
}) => {
  const [addedAnim, setAddedAnim] = React.useState(false);
  const t = useTranslation(lang);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    setAddedAnim(true);
    setTimeout(() => setAddedAnim(false), 1200);
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = encodeURIComponent(
      lang === 'ar'
        ? `سلام متجر RLZ SHOP! أود طلب هذا المنتج من غليزان:\n\n• المنتج: ${product.title}\n• السعر: ${product.price.toLocaleString()} ${t.currency}\n• الفئة: ${
            product.category === 'phones' ? t.phoneAccessories : t.fashionAccessories
          }\n\nيرجى تأكيد التوفر وإجراءات التوصيل. شكرًا!`
        : `Salam RLZ SHOP! I would like to order this item from Relizane:\n\n• Product: ${product.title}\n• Price: ${product.price.toLocaleString()} DZD\n• Category: ${
            product.category === 'phones' ? 'Phone Accessories' : 'Fashion'
          }\n\nPlease confirm availability and delivery details. Thanks!`
    );
    window.open(`https://wa.me/213556896329?text=${text}`, '_blank');
  };

  const formatPrice = (price: number) => {
    return `${new Intl.NumberFormat(lang === 'ar' ? 'ar-DZ' : 'en-US').format(price)} ${t.currency}`;
  };

  return (
    <div
      onClick={() => onQuickView(product)}
      className={`group relative flex flex-col cursor-pointer transition-all duration-300 rounded-xl overflow-hidden border ${
        isLightMode
          ? 'bg-white border-neutral-200/80 hover:border-[#D4AF37] hover:shadow-xl hover:shadow-[#D4AF37]/5'
          : 'bg-[#111113] border-white/10 hover:border-[#D4AF37]/60 hover:shadow-2xl hover:shadow-black'
      }`}
    >
      {/* Product Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-neutral-900">
        <img
          src={product.image}
          alt={product.title}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src =
              product.category === 'phones'
                ? 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=80'
                : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
          }}
        />

        {/* Subtle Category & Stock Ribbon */}
        <div className="absolute top-2.5 ltr:left-2.5 rtl:right-2.5 flex items-center gap-1.5 text-[11px] font-medium tracking-wider uppercase px-2 py-0.5 rounded bg-black/75 backdrop-blur-md text-[#D4AF37] border border-[#D4AF37]/30">
          <span>{product.category === 'phones' ? t.highTech : t.fashion}</span>
          {product.badge && (
            <>
              <span className="opacity-50">·</span>
              <span className="text-white">{product.badge}</span>
            </>
          )}
        </div>

        {/* Quick View Hover Indicator */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-black/85 text-white border border-[#D4AF37]/40 shadow-lg">
            <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
            {t.details}
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex flex-col flex-1 p-3.5 sm:p-4">
        {/* Unboxed category metadata per constitution */}
        <div className="flex items-center gap-1 text-[11px] tracking-wider uppercase text-neutral-400">
          <span>{product.category === 'phones' ? t.phoneAccessories : t.fashionAccessories}</span>
          {product.subCategory && (
            <>
              <span>/</span>
              <span>{product.subCategory}</span>
            </>
          )}
        </div>

        {/* Title */}
        <h3
          className={`font-sans font-semibold text-sm sm:text-base mt-1 line-clamp-1 transition-colors ${
            isLightMode ? 'text-neutral-900 group-hover:text-[#AA820A]' : 'text-neutral-100 group-hover:text-[#E5C158]'
          }`}
        >
          {product.title}
        </h3>

        {/* Prominent Price Right Under Each Product */}
        <div className="mt-2 flex items-baseline justify-between border-b border-dashed pb-2.5 border-neutral-700/40">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-medium">
              {t.priceLabel}
            </span>
            <span className="font-cinzel font-bold text-lg sm:text-xl text-[#D4AF37] tracking-tight tabular-nums">
              {formatPrice(product.price)}
            </span>
          </div>
          <span
            className={`text-[11px] font-medium ${
              product.inStock ? 'text-emerald-500' : 'text-rose-500'
            }`}
          >
            {product.inStock ? t.inStock : t.outOfStock}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          {/* Add to Cart Button */}
          <button
            type="button"
            disabled={!product.inStock}
            onClick={handleAdd}
            className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
              addedAnim
                ? 'bg-emerald-600 text-white'
                : product.inStock
                ? isLightMode
                  ? 'bg-black text-white hover:bg-neutral-800'
                  : 'bg-white text-black hover:bg-neutral-200'
                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
            }`}
            title={t.addToCart}
          >
            {addedAnim ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>{t.addedToCart}</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{t.addToCart}</span>
              </>
            )}
          </button>

          {/* Quick WhatsApp Direct Order Button */}
          <button
            type="button"
            onClick={handleWhatsApp}
            className="flex items-center justify-center gap-1 py-2 px-2.5 rounded-lg text-xs font-semibold bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#25D366] border border-[#25D366]/40 transition-colors"
            title={t.whatsappOrder}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>{t.whatsappOrder}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
