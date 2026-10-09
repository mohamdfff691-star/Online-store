import React from 'react';
import { Sun, Moon, ShoppingBag, Smartphone, Monitor, Shield, Lock, Globe } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { ProductCategory, Theme, ViewMode, Language } from '../types';
import { useTranslation } from '../utils/i18n';

interface NavbarProps {
  currentCategory: ProductCategory;
  onSelectCategory: (cat: ProductCategory) => void;
  activeView: 'shop' | 'orders' | 'admin';
  onNavigateView: (view: 'shop' | 'orders' | 'admin') => void;
  cartCount: number;
  onOpenCart: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  viewMode: ViewMode;
  onToggleViewMode: () => void;
  lang: Language;
  onToggleLanguage: () => void;
  isAdmin: boolean;
  onOpenAdminLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentCategory,
  onSelectCategory,
  activeView,
  onNavigateView,
  cartCount,
  onOpenCart,
  theme,
  onToggleTheme,
  viewMode,
  onToggleViewMode,
  lang,
  onToggleLanguage,
  isAdmin,
  onOpenAdminLogin,
}) => {
  const isLightMode = theme === 'light';
  const t = useTranslation(lang);

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b backdrop-blur-xl transition-colors duration-200 ${
        isLightMode
          ? 'bg-white/95 border-neutral-200/90 text-neutral-900 shadow-sm'
          : 'bg-black/95 border-[#D4AF37]/20 text-white shadow-lg shadow-black/40'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-6 sm:gap-8">
        {/* Zone 1: Brand Wordmark / Royal Emblem */}
        <div
          onClick={() => onNavigateView('shop')}
          className="cursor-pointer shrink-0"
        >
          <BrandLogo size="md" isLightMode={isLightMode} lang={lang} />
        </div>

        {/* Zone 2: Navigation Links (single-line, whitespace-nowrap) */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-7 text-xs font-semibold uppercase tracking-wider text-neutral-400">
          <button
            type="button"
            onClick={() => {
              onNavigateView('shop');
              onSelectCategory('all');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-[#D4AF37] ${
              activeView === 'shop' && currentCategory === 'all'
                ? 'text-[#D4AF37] border-b-2 border-[#D4AF37] pb-1'
                : ''
            }`}
          >
            {t.allProducts}
          </button>

          <button
            type="button"
            onClick={() => {
              onNavigateView('shop');
              onSelectCategory('phones');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-[#D4AF37] ${
              activeView === 'shop' && currentCategory === 'phones'
                ? 'text-[#D4AF37] border-b-2 border-[#D4AF37] pb-1'
                : ''
            }`}
          >
            {t.phoneAccessories}
          </button>

          <button
            type="button"
            onClick={() => {
              onNavigateView('shop');
              onSelectCategory('fashion');
            }}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-[#D4AF37] ${
              activeView === 'shop' && currentCategory === 'fashion'
                ? 'text-[#D4AF37] border-b-2 border-[#D4AF37] pb-1'
                : ''
            }`}
          >
            {t.fashionAccessories}
          </button>

          {/* Customer Order History Link */}
          <button
            type="button"
            onClick={() => onNavigateView('orders')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-[#D4AF37] ${
              activeView === 'orders'
                ? 'text-[#D4AF37] border-b-2 border-[#D4AF37] pb-1'
                : ''
            }`}
          >
            {t.myOrders}
          </button>
        </nav>

        {/* Zone 3: Interactive Controls & Cart Action */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Multi-Language Toggle (AR / EN) */}
          <button
            type="button"
            onClick={onToggleLanguage}
            aria-label="تغيير اللغة / Change Language"
            title={lang === 'ar' ? 'Switch to English' : 'التحويل إلى العربية'}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              isLightMode
                ? 'border-neutral-200 bg-neutral-100 hover:bg-neutral-200 text-neutral-800'
                : 'border-white/10 bg-[#161619] hover:bg-neutral-800 text-neutral-200 hover:text-[#D4AF37]'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="font-mono text-[11px] uppercase tracking-wide">
              {lang === 'ar' ? 'EN' : 'عربي'}
            </span>
          </button>

          {/* Dual Theme Toggle: Sun / Moon */}
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={t.themeToggle}
            title={t.themeToggle}
            className={`p-2 rounded-xl border transition-colors ${
              isLightMode
                ? 'border-neutral-200 bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                : 'border-white/10 bg-[#161619] hover:bg-neutral-800 text-[#D4AF37]'
            }`}
          >
            {isLightMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {/* View Mode Switcher: Mobile View vs Desktop View */}
          <button
            type="button"
            onClick={onToggleViewMode}
            aria-label={viewMode === 'mobile' ? t.desktopView : t.mobileView}
            title={viewMode === 'mobile' ? t.desktopView : t.mobileView}
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
              viewMode === 'mobile'
                ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#D4AF37]'
                : isLightMode
                ? 'border-neutral-200 bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                : 'border-white/10 bg-[#161619] hover:bg-neutral-800 text-neutral-300'
            }`}
          >
            {viewMode === 'mobile' ? (
              <>
                <Smartphone className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span className="whitespace-nowrap">{t.mobileView}</span>
              </>
            ) : (
              <>
                <Monitor className="w-3.5 h-3.5" />
                <span className="whitespace-nowrap">{t.desktopView}</span>
              </>
            )}
          </button>

          {/* Store Owner / Admin Shortcut - STRICTLY ZERO HINTS */}
          {isAdmin ? (
            <button
              type="button"
              onClick={() => onNavigateView('admin')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-semibold hover:bg-[#D4AF37]/30 transition-colors"
              title={t.adminBadge}
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.adminBadge}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenAdminLogin}
              className="p-2 rounded-xl text-neutral-500 hover:text-[#D4AF37] hover:bg-white/5 transition-colors"
              title={t.adminAccess}
            >
              <Lock className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Shopping Cart Drawer Trigger */}
          <button
            type="button"
            onClick={onOpenCart}
            className={`relative flex items-center gap-2 px-3 py-2 rounded-xl font-medium text-xs transition-all ${
              cartCount > 0
                ? 'bg-[#D4AF37] text-black hover:bg-[#c49f2e] shadow-md shadow-[#D4AF37]/20 font-bold'
                : isLightMode
                ? 'bg-black text-white hover:bg-neutral-800'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">{t.cart}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[11px] font-mono tabular-nums ${
                cartCount > 0
                  ? 'bg-black text-[#D4AF37]'
                  : 'bg-white/20 text-white'
              }`}
            >
              {cartCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
