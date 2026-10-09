import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  isLightMode?: boolean;
  lang?: 'ar' | 'en';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  isLightMode = false,
  lang = 'ar',
}) => {
  const sizeMap = {
    sm: { icon: 34, title: 'text-sm', sub: 'text-[9px]' },
    md: { icon: 46, title: 'text-base', sub: 'text-[11px]' },
    lg: { icon: 68, title: 'text-xl', sub: 'text-xs' },
    xl: { icon: 110, title: 'text-3xl', sub: 'text-sm' },
  };

  const { icon, title, sub } = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Royal Crest SVG Emblem */}
      <div 
        style={{ width: icon, height: icon }}
        className="relative shrink-0 flex items-center justify-center rounded-lg bg-black/90 p-1 shadow-md border border-[#D4AF37]/40 ring-1 ring-[#D4AF37]/20"
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-[0_2px_4px_rgba(212,175,55,0.35)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF2A3" />
              <stop offset="35%" stopColor="#E5C158" />
              <stop offset="70%" stopColor="#C99726" />
              <stop offset="100%" stopColor="#AA7A1E" />
            </linearGradient>
            <linearGradient id="goldSoft" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#B38728" />
              <stop offset="50%" stopColor="#FBF5B7" />
              <stop offset="100%" stopColor="#AA771C" />
            </linearGradient>
          </defs>

          {/* Top Royal Crown */}
          <path
            d="M 38 31 L 43 35 L 50 25 L 57 35 L 62 31 L 60 38 L 40 38 Z"
            fill="url(#goldGrad)"
          />
          {/* Crown Pearls */}
          <circle cx="38" cy="30" r="1.5" fill="#FFF2A3" />
          <circle cx="50" cy="24" r="2" fill="#FFF2A3" />
          <circle cx="62" cy="30" r="1.5" fill="#FFF2A3" />
          <circle cx="44" cy="34" r="1.2" fill="#FFF2A3" />
          <circle cx="56" cy="34" r="1.2" fill="#FFF2A3" />

          {/* Crown Base Band */}
          <rect x="40" y="38" width="20" height="2" rx="1" fill="url(#goldSoft)" />
          <circle cx="45" cy="39" r="0.7" fill="#111" />
          <circle cx="50" cy="39" r="0.7" fill="#111" />
          <circle cx="55" cy="39" r="0.7" fill="#111" />

          {/* Upper Filigree Flourishes (Left side) */}
          <path
            d="M 38 38 C 30 36 22 26 31 19 C 32 23 30 26 34 27 C 32 21 38 18 42 20 C 40 23 38 25 39 28 C 33 28 35 34 38 38 Z"
            fill="url(#goldGrad)"
          />
          <path
            d="M 28 30 C 22 31 20 25 24 23 C 26 26 29 27 28 30 Z"
            fill="url(#goldGrad)"
          />

          {/* Upper Filigree Flourishes (Right side - mirrored) */}
          <path
            d="M 62 38 C 70 36 78 26 69 19 C 68 23 70 26 66 27 C 68 21 62 18 58 20 C 60 23 62 25 61 28 C 67 28 65 34 62 38 Z"
            fill="url(#goldGrad)"
          />
          <path
            d="M 72 30 C 78 31 80 25 76 23 C 74 26 71 27 72 30 Z"
            fill="url(#goldGrad)"
          />

          {/* Center Royal Capital 'R' */}
          <text
            x="50"
            y="58"
            textAnchor="middle"
            fontFamily="Cinzel, serif"
            fontSize="26"
            fontWeight="bold"
            fill="url(#goldGrad)"
            letterSpacing="1"
          >
            R
          </text>

          {/* Lower Arc Line and Acanthus Ornament */}
          <path
            d="M 36 63 C 43 65 57 65 64 63 C 60 66 40 66 36 63 Z"
            fill="url(#goldSoft)"
          />
          {/* Lower Central Trefoil Leaf */}
          <path
            d="M 50 64 C 47 67 48 72 50 74 C 52 72 53 67 50 64 Z"
            fill="url(#goldGrad)"
          />
          <path
            d="M 46 66 C 42 67 43 71 47 70 C 47 68 47 67 46 66 Z"
            fill="url(#goldGrad)"
          />
          <path
            d="M 54 66 C 58 67 57 71 53 70 C 53 68 53 67 54 66 Z"
            fill="url(#goldGrad)"
          />

          {/* Lower Filigree Wings (Left) */}
          <path
            d="M 37 64 C 29 67 22 75 30 81 C 31 77 30 74 34 73 C 32 78 37 81 41 80 C 39 77 37 75 38 72 C 34 71 35 66 37 64 Z"
            fill="url(#goldGrad)"
          />
          {/* Lower Filigree Wings (Right) */}
          <path
            d="M 63 64 C 71 67 78 75 70 81 C 69 77 70 74 66 73 C 68 78 63 81 59 80 C 61 77 63 75 62 72 C 66 71 65 66 63 64 Z"
            fill="url(#goldGrad)"
          />

          {/* Under Wings dots/sprouts */}
          <circle cx="27" cy="74" r="1.3" fill="url(#goldGrad)" />
          <circle cx="73" cy="74" r="1.3" fill="url(#goldGrad)" />
        </svg>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center tracking-[0.28em] font-cinzel font-extrabold leading-none">
            <span className={isLightMode ? 'text-black' : 'text-white'}>RLZ</span>
            <span className="text-[#D4AF37] ml-1">SHOP</span>
          </div>
          <div className={`tracking-[0.25em] font-sans font-medium uppercase mt-0.5 ${sub} ${
            isLightMode ? 'text-neutral-500' : 'text-neutral-400'
          }`}>
            {lang === 'ar' ? 'غليزان · الجزائر' : 'Relizane · Algeria'}
          </div>
        </div>
      )}
    </div>
  );
};
