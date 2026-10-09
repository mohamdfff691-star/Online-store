import React from 'react';
import { PackageOpen, Plus, Phone, MessageSquare, Sparkles } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { Language } from '../types';
import { useTranslation } from '../utils/i18n';

interface EmptyInventoryProps {
  isAdmin: boolean;
  onOpenAddModal: () => void;
  onLoadDemoSample?: () => void;
  isLightMode?: boolean;
  lang?: Language;
}

export const EmptyInventory: React.FC<EmptyInventoryProps> = ({
  isAdmin,
  onOpenAddModal,
  onLoadDemoSample,
  isLightMode = false,
  lang = 'ar',
}) => {
  const t = useTranslation(lang);

  return (
    <div
      className={`my-8 py-16 px-6 rounded-2xl border text-center flex flex-col items-center justify-center max-w-2xl mx-auto transition-colors ${
        isLightMode
          ? 'bg-neutral-50 border-neutral-200 text-neutral-800'
          : 'bg-[#111113] border-white/10 text-neutral-200'
      }`}
    >
      {/* Brand Crest */}
      <BrandLogo size="lg" showText={false} className="mb-6 justify-center" isLightMode={isLightMode} lang={lang} />

      <h3 className="font-cinzel font-bold text-2xl tracking-wide text-[#D4AF37]">
        {t.emptyShopTitle}
      </h3>

      <p className={`mt-3 text-sm leading-relaxed max-w-md ${isLightMode ? 'text-neutral-600' : 'text-neutral-400'}`}>
        {t.emptyShopDesc}
      </p>

      {isAdmin ? (
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={onOpenAddModal}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#c49f2e] text-black font-semibold text-sm transition-all shadow-lg shadow-[#D4AF37]/20"
          >
            <Plus className="w-5 h-5" />
            <span>{t.addFirstProduct}</span>
          </button>

          {onLoadDemoSample && (
            <button
              type="button"
              onClick={onLoadDemoSample}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl border text-xs font-medium transition-all ${
                isLightMode
                  ? 'border-neutral-300 hover:bg-neutral-100 text-neutral-700'
                  : 'border-white/20 hover:bg-white/5 text-neutral-300'
              }`}
            >
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span>{t.loadDemoSample}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
          <a
            href="https://wa.me/213556896329?text=Salam%20RLZ%20SHOP%20Relizane"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-medium text-xs transition-colors shadow-md"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{t.contactStoreWhatsApp}</span>
          </a>

          <a
            href="tel:+213556896329"
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border font-medium text-xs transition-colors ${
              isLightMode
                ? 'border-neutral-300 hover:bg-neutral-100 text-neutral-800'
                : 'border-white/20 hover:bg-white/10 text-white'
            }`}
          >
            <Phone className="w-4 h-4 text-[#D4AF37]" />
            <span dir="ltr">+213 5 56896329</span>
          </a>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-dashed border-neutral-700/30 flex items-center gap-2 text-xs text-neutral-500">
        <PackageOpen className="w-4 h-4 text-[#D4AF37]" />
        <span>{t.physicalStoreNote}</span>
      </div>
    </div>
  );
};
