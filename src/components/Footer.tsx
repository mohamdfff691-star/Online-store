import React from 'react';
import { Phone, MapPin, MessageSquare, Shield, Clock } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { Language } from '../types';
import { useTranslation } from '../utils/i18n';

interface FooterProps {
  onSelectCategory: (cat: 'all' | 'phones' | 'fashion') => void;
  onNavigateView: (view: 'shop' | 'orders' | 'admin') => void;
  onOpenAdminLogin: () => void;
  isLightMode?: boolean;
  lang?: Language;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  onNavigateView,
  onOpenAdminLogin,
  isLightMode = false,
  lang = 'ar',
}) => {
  const t = useTranslation(lang);

  return (
    <footer
      className={`border-t transition-colors ${
        isLightMode
          ? 'bg-neutral-100 border-neutral-200 text-neutral-800'
          : 'bg-[#09090B] border-white/10 text-neutral-300'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <BrandLogo size="md" isLightMode={isLightMode} lang={lang} />
            <p className="text-xs text-neutral-400 leading-relaxed">
              {t.footerDesc}
            </p>
            <div className="flex items-center gap-2 text-xs text-[#D4AF37]">
              <MapPin className="w-4 h-4 shrink-0" />
              <span>{lang === 'ar' ? 'مدينة غليزان، 48000 · الجزائر' : 'Relizane Ville, 48000 · Algeria'}</span>
            </div>
          </div>

          {/* Catalog Links */}
          <div className="space-y-3">
            <h4 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
              {t.footerCollections}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => {
                    onNavigateView('shop');
                    onSelectCategory('phones');
                  }}
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  {t.phoneAccessories}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigateView('shop');
                    onSelectCategory('fashion');
                  }}
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  {t.fashionAccessories}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    onNavigateView('shop');
                    onSelectCategory('all');
                  }}
                  className="hover:text-[#D4AF37] transition-colors"
                >
                  {t.allProducts}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateView('orders')}
                  className="hover:text-[#D4AF37] transition-colors text-neutral-300"
                >
                  {t.myOrders}
                </button>
              </li>
            </ul>
          </div>

          {/* Delivery & Guarantees */}
          <div className="space-y-3">
            <h4 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
              {t.footerServices}
            </h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{t.footerDeliveryRelizane}</span>
              </li>
              <li className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>{t.footerDelivery58}</span>
              </li>
              <li className="flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-[#25D366]" />
                <span>{t.footerSupportWhatsApp}</span>
              </li>
            </ul>
          </div>

          {/* Direct Contact */}
          <div className="space-y-3">
            <h4 className="font-cinzel text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
              {t.footerDirectContact}
            </h4>
            <p className="text-xs text-neutral-400">
              {t.footerCallOrWhatsApp}
            </p>
            <div className="space-y-2 pt-1">
              <a
                href="tel:+213556896329"
                className="flex items-center gap-2 text-xs font-mono font-bold text-white hover:text-[#D4AF37] transition-colors"
                dir="ltr"
              >
                <Phone className="w-4 h-4 text-[#D4AF37]" />
                <span>+213 5 56896329</span>
              </a>
              <a
                href="https://wa.me/213556896329"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#25D366]/20 text-[#25D366] text-xs font-semibold hover:bg-[#25D366]/30 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? 'واتساب الرسمي' : 'Official WhatsApp'}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar with Admin access - ZERO CREDENTIAL HINTS */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <div>
            &copy; {new Date().getFullYear()} RLZ SHOP Relizane · {t.footerRights}
          </div>

          {/* Discrete Owner Admin Access */}
          <button
            type="button"
            onClick={onOpenAdminLogin}
            className="text-[11px] text-neutral-500 hover:text-[#D4AF37] transition-colors underline-offset-4 hover:underline"
          >
            {t.footerAdminLink}
          </button>
        </div>
      </div>
    </footer>
  );
};
