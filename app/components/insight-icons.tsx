import type { CSSProperties } from "react";

export type IconName =
  | "overview"
  | "globe"
  | "radar"
  | "models"
  | "building"
  | "spark"
  | "source"
  | "search"
  | "chevron"
  | "arrow"
  | "external"
  | "bell"
  | "plus"
  | "close"
  | "check"
  | "shield"
  | "filter"
  | "refresh"
  | "download"
  | "user"
  | "menu"
  | "logout"
  | "clock"
  | "info"
  | "eye";
const paths: Record<IconName, React.ReactNode> = {
  overview: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18Z" />
    </>
  ),
  radar: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v9l6 6M5.7 5.7l12.6 12.6" />
      <circle cx="12" cy="12" r="5" />
    </>
  ),
  models: (
    <>
      <path d="m12 3 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 16l9 5 9-5" />
    </>
  ),
  building: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M9 7h1m4 0h1M9 11h1m4 0h1M9 15h1m4 0h1M10 21v-3h4v3" />
    </>
  ),
  spark: (
    <>
      <path d="m12 3 2.6 6.4L21 12l-6.4 2.6L12 21l-2.6-6.4L3 12l6.4-2.6L12 3ZM20 2v4m-2-2h4" />
    </>
  ),
  source: (
    <>
      <path d="M5 3h11l3 3v15H5V3Zm10 0v5h4M8 12h8M8 16h6" />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 5 5" />
    </>
  ),
  chevron: <path d="m9 5 7 7-7 7" />,
  arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
  external: (
    <>
      <path d="M14 3h7v7m0-7L10 14M11 4H4v16h16v-7" />
    </>
  ),
  bell: (
    <>
      <path d="M18 8a6 6 0 0 0-12 0c0 8-3 8-3 10h18c0-2-3-2-3-10M10 21h4" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  check: <path d="m5 12 4 4L19 6" />,
  shield: (
    <>
      <path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z" />
      <path d="m8 12 3 3 5-6" />
    </>
  ),
  filter: (
    <>
      <path d="M3 5h18l-7 8v6l-4 2v-8L3 5Z" />
    </>
  ),
  refresh: (
    <>
      <path d="M20 7v5h-5M4 17v-5h5" />
      <path d="M19 10A7 7 0 0 0 6 6L4 9m16 6-2 3A7 7 0 0 1 5 14" />
    </>
  ),
  download: (
    <>
      <path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
    </>
  ),
  menu: <path d="M3 6h18M3 12h18M3 18h18" />,
  logout: (
    <>
      <path d="M10 3H4v18h6m4-15 6 6-6 6M8 12h12" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 6v6l4 2" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v6m0-10v1" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
};
export function I({
  name,
  size = 18,
  className,
  style,
}: {
  name: IconName;
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      style={style}
    >
      {paths[name]}
    </svg>
  );
}
export function WindLogo() {
  return (
    <svg
      width="31"
      height="31"
      viewBox="0 0 36 36"
      fill="none"
      aria-hidden="true"
    >
      <rect width="36" height="36" rx="10" fill="#2674eb" />
      <path
        d="M7 12h14c5 0 5-7 0-6M7 18h21c5 0 5 8 0 8M7 24h10c5 0 5 7 0 7"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path d="M7 12h10" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
