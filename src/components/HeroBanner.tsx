import React from 'react';
import { ShoppingBag, MessageCircle, MapPin, Phone, ShieldCheck, Sparkles } from 'lucide-react';
import { ProductCategory, Language } from '../types';
import { useTranslation } from '../utils/i18n';

interface HeroBannerProps {
  onSelectCategory: (cat: ProductCategory) => void;
  isLightMode?: boolean;
  lang?: Language;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onSelectCategory,
  isLightMode = false,
  lang = 'ar',
}) => {
  const t = useTranslation(lang);

  return (
    <section className="relative overflow-hidden border-b border-[#D4AF37]/20">
      {/* Background Photography with Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/rlz_shop_hero_banner_1791585299181.jpg"
          alt="RLZ SHOP Relizane Showroom"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter brightness-[0.45] scale-105"
        />
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/40" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20 flex flex-col items-center text-center">
        {/* Relizane Location Marker */}
        <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/60 border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-semibold tracking-wider uppercase mb-5 backdrop-blur-md">
          <MapPin className="w-3.5 h-3.5" />
          <span>{t.locationBadge}</span>
        </div>

        {/* Hero Title */}
        <h1 className="font-cinzel text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight max-w-4xl text-balance">
          {t.heroTitlePrefix}<span className="text-[#D4AF37]">{t.heroTitleHighlight}</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-4 text-xs sm:text-sm lg:text-base text-neutral-300 max-w-2xl leading-relaxed text-balance">
          {t.heroSubtitle}
        </p>

        {/* Key Trust Signals */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-neutral-300">
          <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10">
            <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
            <span>{t.trustCod}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <span>{t.trustFastDelivery}</span>
          </div>
          <a
            href="tel:+213556896329"
            className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-lg border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-black/60 transition-colors"
          >
            <Phone className="w-4 h-4" />
            <span className="font-mono font-bold" dir="ltr">+213 5 56896329</span>
          </a>
        </div>

        {/* Direct Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => onSelectCategory('phones')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#c49f2e] text-black font-bold text-xs uppercase tracking-wider transition-all shadow-xl shadow-[#D4AF37]/20 flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{t.btnPhoneAcc}</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectCategory('fashion')}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-black/80 hover:bg-black text-white border border-[#D4AF37]/50 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
          >
            <span>{t.btnFashionAcc}</span>
          </button>

          <a
            href="https://wa.me/213556896329?text=Salam%20RLZ%20SHOP%20Relizane!"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-md"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{t.btnWhatsAppDirect}</span>
          </a>
        </div>
      </div>
    </section>
  );
};
