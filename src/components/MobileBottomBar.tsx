import React from 'react';
import { ShoppingBag, Package, Grid, Home, MessageSquare } from 'lucide-react';
import { ProductCategory, Language } from '../types';
import { useTranslation } from '../utils/i18n';

interface MobileBottomBarProps {
  activeView: 'shop' | 'orders' | 'admin';
  onNavigateView: (view: 'shop' | 'orders' | 'admin') => void;
  currentCategory: ProductCategory;
  onSelectCategory: (cat: ProductCategory) => void;
  cartCount: number;
  onOpenCart: () => void;
  isLightMode?: boolean;
  lang?: Language;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({
  activeView,
  onNavigateView,
  currentCategory,
  onSelectCategory,
  cartCount,
  onOpenCart,
  isLightMode = false,
  lang = 'ar',
}) => {
  const t = useTranslation(lang);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-xl md:hidden transition-colors ${
        isLightMode
          ? 'bg-white/95 border-neutral-200 text-neutral-800'
          : 'bg-[#0A0A0C]/95 border-white/10 text-white'
      }`}
    >
      <div className="grid grid-cols-5 h-16 max-w-md mx-auto items-center px-1">
        {/* Tab 1: Shop */}
        <button
          onClick={() => {
            onNavigateView('shop');
            onSelectCategory('all');
          }}
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            activeView === 'shop' && currentCategory === 'all'
              ? 'text-[#D4AF37]'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Home className="w-4 h-4" />
          <span className="text-[10px] font-medium">{lang === 'ar' ? 'الرئيسية' : 'Shop'}</span>
        </button>

        {/* Tab 2: Téléphones */}
        <button
          onClick={() => {
            onNavigateView('shop');
            onSelectCategory('phones');
          }}
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            activeView === 'shop' && currentCategory === 'phones'
              ? 'text-[#D4AF37]'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span className="text-[10px] font-medium">{lang === 'ar' ? 'هواتف' : 'Phones'}</span>
        </button>

        {/* Tab 3: Panier */}
        <button
          onClick={onOpenCart}
          className="relative flex flex-col items-center justify-center gap-1 text-neutral-300 hover:text-[#D4AF37] transition-colors"
        >
          <div className="relative">
            <ShoppingBag className="w-4 h-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 ltr:-right-2 rtl:-left-2 w-4 h-4 rounded-full bg-[#D4AF37] text-black text-[9px] font-extrabold flex items-center justify-center font-mono">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium">{t.cart}</span>
        </button>

        {/* Tab 4: Mes Commandes (Customer Order History) */}
        <button
          onClick={() => onNavigateView('orders')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            activeView === 'orders'
              ? 'text-[#D4AF37]'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Package className="w-4 h-4" />
          <span className="text-[10px] font-medium">{lang === 'ar' ? 'طلباتي' : 'Orders'}</span>
        </button>

        {/* Tab 5: WhatsApp Direct */}
        <a
          href="https://wa.me/213556896329?text=Salam%20RLZ%20SHOP%20Relizane!"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-1 text-[#25D366] hover:text-[#20ba59] transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          <span className="text-[10px] font-medium">واتساب</span>
        </a>
      </div>
    </div>
  );
};
