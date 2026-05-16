export default function TradeCadetLogo({
  className = "h-11 w-11",
  iconClassName = "h-full w-full",
  showWordmark = false,
  titleClassName = "text-base font-semibold text-white",
  subtitleClassName = "text-[11px] uppercase tracking-[0.24em] text-emerald-300/75",
  subtitle = "Trading Journal",
}) {
  return (
    <div className="flex items-center gap-3">
      <div className={className}>
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={iconClassName}
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="tradeCadetShieldGradient" x1="10" y1="8" x2="54" y2="56">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="100%" stopColor="#22D3EE" />
            </linearGradient>
          </defs>
          <path
            d="M32 6L50 13V29C50 41.2 42.2 52.3 32 58C21.8 52.3 14 41.2 14 29V13L32 6Z"
            fill="url(#tradeCadetShieldGradient)"
            fillOpacity="0.16"
            stroke="url(#tradeCadetShieldGradient)"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path d="M25 39V24" stroke="#F8FAFC" strokeWidth="3" strokeLinecap="round" />
          <rect
            x="21"
            y="27"
            width="8"
            height="10"
            rx="2"
            fill="#F8FAFC"
            fillOpacity="0.96"
          />
          <path d="M39 34V21" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" />
          <rect x="35" y="24" width="8" height="8" rx="2" fill="#22C55E" />
          <path
            d="M22 44.5L28.5 50L42.5 36"
            stroke="#F8FAFC"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {showWordmark ? (
        <div>
          <p className={subtitleClassName}>TradeCadet</p>
          <h1 className={titleClassName}>{subtitle}</h1>
        </div>
      ) : null}
    </div>
  );
}
