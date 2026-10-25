import React from "react";

interface BankLogoProps {
  code: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function BankLogo({ code, className = "", size = "md" }: BankLogoProps) {
  const normalized = (code || "").toUpperCase().replace(/_VA$/i, "").trim();

  const sizeClasses = {
    sm: "h-6 w-12",
    md: "h-8 w-16",
    lg: "h-10 w-20",
  }[size];

  switch (normalized) {
    case "BCA":
      return (
        <svg
          viewBox="0 0 100 36"
          className={`${sizeClasses} ${className}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Bank Central Asia (BCA)"
        >
          <rect width="100" height="36" rx="6" fill="#003874" />
          <path
            d="M26 12h-9c-.6 0-1 .4-1 1v10c0 .6.4 1 1 1h9c3.3 0 6-2.7 6-6s-2.7-6-6-6zm-1 8.5h-5.5v-5H25c1.4 0 2.5 1.1 2.5 2.5s-1.1 2.5-2.5 2.5z"
            fill="#FFFFFF"
          />
          <path
            d="M48.5 12h-9c-3.6 0-6.5 2.9-6.5 6.5s2.9 6.5 6.5 6.5h9c.6 0 1-.4 1-1v-2.2c0-.6-.4-1-1-1h-7.8c-1.5 0-2.8-1-3.1-2.4-.1-.3-.1-.6-.1-.9 0-1.9 1.6-3.5 3.5-3.5h7.5c.6 0 1-.4 1-1V13c0-.6-.4-1-1-1z"
            fill="#FFFFFF"
          />
          <path
            d="M66.5 12h-6.8c-.5 0-.9.3-1 .8L52.5 23c-.3.6.1 1 .7 1h3.3c.4 0 .8-.3 1-.7l1.2-2.8h7.8l1.2 2.8c.2.4.5.7 1 .7h3.3c.6 0 1-.5.7-1l-6.2-10.2c-.2-.5-.6-.8-1-.8zm-4.7 7l2.4-5.5 2.4 5.5h-4.8z"
            fill="#FFFFFF"
          />
          <ellipse cx="86" cy="18" rx="5.5" ry="5.5" fill="#E31837" />
          <path d="M83.5 18l2.5-2.5 2.5 2.5-2.5 2.5-2.5-2.5z" fill="#FFFFFF" />
        </svg>
      );

    case "MANDIRI":
      return (
        <svg
          viewBox="0 0 100 36"
          className={`${sizeClasses} ${className}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Bank Mandiri"
        >
          <rect width="100" height="36" rx="6" fill="#002D62" />
          {/* Golden Ribbon */}
          <path
            d="M66 8c-3 0-6.5 1.8-9 4.5-2.5-2.7-6-4.5-9-4.5 4 2 7 6 7 10s-3 8-7 10c3 0 6.5-1.8 9-4.5 2.5 2.7 6 4.5 9 4.5-4-2-7-6-7-10s3-8 7-10z"
            fill="#F5A623"
          />
          <text
            x="32"
            y="23"
            fill="#FFFFFF"
            fontSize="14"
            fontFamily="sans-serif"
            fontWeight="800"
            letterSpacing="-0.5"
            textAnchor="middle"
          >
            mandiri
          </text>
        </svg>
      );

    case "BNI":
      return (
        <svg
          viewBox="0 0 100 36"
          className={`${sizeClasses} ${className}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Bank Negara Indonesia (BNI)"
        >
          <rect width="100" height="36" rx="6" fill="#006677" />
          <text
            x="34"
            y="24"
            fill="#FFFFFF"
            fontSize="18"
            fontFamily="sans-serif"
            fontWeight="900"
            letterSpacing="-0.5"
            textAnchor="middle"
          >
            BNI
          </text>
          {/* Orange 46 emblem */}
          <rect x="64" y="9" width="26" height="18" rx="4" fill="#E85514" />
          <text
            x="77"
            y="23"
            fill="#FFFFFF"
            fontSize="12"
            fontFamily="sans-serif"
            fontWeight="900"
            textAnchor="middle"
          >
            46
          </text>
        </svg>
      );

    case "BRI":
      return (
        <svg
          viewBox="0 0 100 36"
          className={`${sizeClasses} ${className}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Bank Rakyat Indonesia (BRI)"
        >
          <rect width="100" height="36" rx="6" fill="#00529C" />
          <text
            x="50"
            y="24"
            fill="#FFFFFF"
            fontSize="18"
            fontFamily="sans-serif"
            fontWeight="900"
            letterSpacing="0.5"
            textAnchor="middle"
          >
            BRI
          </text>
          <path d="M78 12c3 2.5 5 6 5 10" stroke="#FF7A00" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case "CIMB":
    case "CIMB NIAGA":
      return (
        <svg
          viewBox="0 0 100 36"
          className={`${sizeClasses} ${className}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="CIMB Niaga"
        >
          <rect width="100" height="36" rx="6" fill="#7D0A14" />
          {/* Red chevron logo */}
          <polygon points="12,18 20,11 20,25" fill="#ED1C24" />
          <text
            x="58"
            y="23"
            fill="#FFFFFF"
            fontSize="12"
            fontFamily="sans-serif"
            fontWeight="800"
            letterSpacing="-0.3"
            textAnchor="middle"
          >
            CIMB NIAGA
          </text>
        </svg>
      );

    case "PERMATA":
      return (
        <svg
          viewBox="0 0 100 36"
          className={`${sizeClasses} ${className}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Permata Bank"
        >
          <rect width="100" height="36" rx="6" fill="#0B2F44" />
          {/* Diamond facet */}
          <polygon points="17,11 23,18 17,25 11,18" fill="#00A859" />
          <polygon points="21,11 27,18 21,25 15,18" fill="#0072CE" opacity="0.8" />
          <text
            x="58"
            y="23"
            fill="#FFFFFF"
            fontSize="12"
            fontFamily="sans-serif"
            fontWeight="800"
            letterSpacing="-0.3"
            textAnchor="middle"
          >
            Permata
          </text>
        </svg>
      );

    case "BSI":
      return (
        <svg
          viewBox="0 0 100 36"
          className={`${sizeClasses} ${className}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Bank Syariah Indonesia (BSI)"
        >
          <rect width="100" height="36" rx="6" fill="#00A39D" />
          {/* Golden star tip */}
          <circle cx="20" cy="18" r="7" fill="#FFB700" />
          <path d="M20 12l1.5 4.5h4.5l-3.5 2.5 1.5 4.5-4-2.8-4 2.8 1.5-4.5-3.5-2.5h4.5z" fill="#00A39D" />
          <text
            x="56"
            y="24"
            fill="#FFFFFF"
            fontSize="16"
            fontFamily="sans-serif"
            fontWeight="900"
            letterSpacing="0.5"
            textAnchor="middle"
          >
            BSI
          </text>
        </svg>
      );

    case "QRIS":
      return (
        <svg
          viewBox="0 0 100 36"
          className={`${sizeClasses} ${className}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="QRIS (Quick Response Code Indonesian Standard)"
        >
          <rect width="100" height="36" rx="6" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
          <rect x="10" y="8" width="6" height="6" fill="#D32F2F" />
          <rect x="18" y="8" width="4" height="4" fill="#1E293B" />
          <rect x="10" y="16" width="4" height="4" fill="#1E293B" />
          <rect x="16" y="14" width="6" height="6" fill="#D32F2F" />
          <text
            x="60"
            y="23"
            fill="#D32F2F"
            fontSize="15"
            fontFamily="sans-serif"
            fontWeight="900"
            letterSpacing="1"
            textAnchor="middle"
          >
            QRIS
          </text>
        </svg>
      );

    case "GOPAY":
      return (
        <svg
          viewBox="0 0 100 36"
          className={`${sizeClasses} ${className}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="GoPay"
        >
          <rect width="100" height="36" rx="6" fill="#00AED6" />
          <circle cx="22" cy="18" r="6" stroke="#FFFFFF" strokeWidth="2.5" />
          <circle cx="22" cy="18" r="2" fill="#FFFFFF" />
          <text
            x="58"
            y="23"
            fill="#FFFFFF"
            fontSize="14"
            fontFamily="sans-serif"
            fontWeight="800"
            textAnchor="middle"
          >
            gopay
          </text>
        </svg>
      );

    case "OVO":
      return (
        <svg
          viewBox="0 0 100 36"
          className={`${sizeClasses} ${className}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="OVO"
        >
          <rect width="100" height="36" rx="6" fill="#4C3494" />
          <text
            x="50"
            y="24"
            fill="#FFFFFF"
            fontSize="16"
            fontFamily="sans-serif"
            fontWeight="900"
            letterSpacing="1"
            textAnchor="middle"
          >
            OVO
          </text>
        </svg>
      );

    case "DANA":
      return (
        <svg
          viewBox="0 0 100 36"
          className={`${sizeClasses} ${className}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="DANA"
        >
          <rect width="100" height="36" rx="6" fill="#118EEA" />
          <text
            x="50"
            y="24"
            fill="#FFFFFF"
            fontSize="15"
            fontFamily="sans-serif"
            fontWeight="900"
            letterSpacing="1"
            textAnchor="middle"
          >
            DANA
          </text>
        </svg>
      );

    case "SHOPEEPAY":
      return (
        <svg
          viewBox="0 0 100 36"
          className={`${sizeClasses} ${className}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="ShopeePay"
        >
          <rect width="100" height="36" rx="6" fill="#EE4D2D" />
          <text
            x="50"
            y="22"
            fill="#FFFFFF"
            fontSize="11"
            fontFamily="sans-serif"
            fontWeight="800"
            letterSpacing="0.2"
            textAnchor="middle"
          >
            ShopeePay
          </text>
        </svg>
      );

    default:
      return (
        <div
          className={`${sizeClasses} ${className} rounded-md bg-slate-800 text-white flex items-center justify-center font-black text-[11px] tracking-wider uppercase px-1 shadow-xs`}
        >
          {normalized.slice(0, 7)}
        </div>
      );
  }
}
