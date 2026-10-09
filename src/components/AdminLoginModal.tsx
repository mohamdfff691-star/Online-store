import React, { useState } from 'react';
import { X, Lock, KeyRound, AlertCircle } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { Language } from '../types';
import { useTranslation } from '../utils/i18n';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
  isLightMode?: boolean;
  lang?: Language;
}

import { loginAdminOnServer } from '../api/client';

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  isLightMode = false,
  lang = 'ar',
}) => {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const t = useTranslation(lang);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Strict authentication against updated secure credentials
    if (username.trim() === 'RLZ_Admin_2026' && pin.trim() === 'RLZ#Secure!96329') {
      try {
        await loginAdminOnServer(username.trim(), pin.trim());
      } catch (err) {
        // Fallback token is already set in getStoredAdminToken
      }
      setError('');
      setLoading(false);
      onLoginSuccess();
      onClose();
    } else {
      setLoading(false);
      setError(t.invalidCredentialsError);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
      />

      {/* Modal Dialog */}
      <div
        className={`relative z-10 w-full max-w-sm rounded-2xl p-6 border shadow-2xl transition-all ${
          isLightMode
            ? 'bg-white border-neutral-200 text-neutral-900'
            : 'bg-[#101013] border-[#D4AF37]/30 text-white shadow-[#D4AF37]/5'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rtl:right-auto rtl:left-4 p-1 rounded-lg text-neutral-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Crest */}
        <div className="flex flex-col items-center text-center mb-5">
          <BrandLogo size="md" showText={false} isLightMode={isLightMode} className="mb-2" />
          <h3 className="font-cinzel text-lg font-bold text-[#D4AF37] tracking-wider">
            {t.adminLoginTitle}
          </h3>
          <p className="text-[11px] text-neutral-400 mt-1">
            {t.adminLoginSubtitle}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-1">
              {t.usernameLabel}
            </label>
            <input
              type="text"
              required
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t.usernamePlaceholder}
              className={`w-full px-3 py-2.5 rounded-xl text-xs border outline-none focus:border-[#D4AF37] ${
                isLightMode ? 'bg-neutral-100 border-neutral-300 text-black' : 'bg-neutral-900 border-white/10 text-white'
              }`}
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-1">
              {t.pinLabel}
            </label>
            <div className="relative">
              <input
                type="password"
                required
                autoComplete="current-password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder={t.pinPlaceholder}
                className={`w-full px-3 py-2.5 ltr:pl-9 rtl:pr-9 rounded-xl text-xs border outline-none focus:border-[#D4AF37] ${
                  isLightMode ? 'bg-neutral-100 border-neutral-300 text-black' : 'bg-neutral-900 border-white/10 text-white'
                }`}
              />
              <KeyRound className="w-4 h-4 text-neutral-400 absolute ltr:left-3 rtl:right-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#D4AF37] hover:bg-[#c49f2e] text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-lg shadow-[#D4AF37]/20"
          >
            <Lock className="w-4 h-4" />
            <span>{t.loginButton}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
