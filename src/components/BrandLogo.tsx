export function BrandLogo({ size = 56 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="10" y="18" width="28" height="36" rx="2" fill="#243447" />
      <rect x="14" y="24" width="6" height="6" rx="1" fill="#dceaf5" />
      <rect x="24" y="24" width="6" height="6" rx="1" fill="#dceaf5" />
      <rect x="14" y="34" width="6" height="6" rx="1" fill="#dceaf5" />
      <rect x="24" y="34" width="6" height="6" rx="1" fill="#dceaf5" />
      <rect x="20" y="44" width="8" height="10" rx="1" fill="#8a95a5" />
      <path
        d="M42 14l4 4-16 16-4-1-1-4 17-15z"
        fill="#5b6777"
        stroke="#1c2430"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M46 18l4 4 3-3-4-4-3 3z"
        fill="#8a6d3b"
        stroke="#1c2430"
        strokeWidth="1"
      />
      <circle cx="48" cy="46" r="8" fill="#2f5f8a" />
      <path
        d="M45 46h6M48 43v6"
        stroke="#f7f8fa"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
