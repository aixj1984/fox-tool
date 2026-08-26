import { cn } from "@/lib/utils";

type IconProps = {
  className?: string;
  width?: number;
  height?: number;
};

// Share / link icon (used by share button) — small inline SVG fallback
export function ShareLinkIcon({ className, width = 20, height = 20 }: IconProps) {
  return (
    <svg
      className={cn(className)}
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

// Back-to-top arrow (matches nav-top.png shape: upward chevron/arrow)
export function ArrowUpIcon({ className, width = 14, height = 16 }: IconProps) {
  return (
    <svg
      className={cn(className)}
      width={width}
      height={height}
      viewBox="0 0 14 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 14V3" />
      <path d="M2.5 7.5 7 3l4.5 4.5" />
    </svg>
  );
}

// QQ group icon (matches nav-qqgroup.png: penguin-ish chat bubble)
export function QqGroupIcon({ className, width = 14, height = 16 }: IconProps) {
  return (
    <svg
      className={cn(className)}
      width={width}
      height={height}
      viewBox="0 0 17 18"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M8.5 2C5.46 2 3 4.24 3 7c0 1.6.84 3.02 2.13 3.92L4.5 13l2.6-1.3c.45.1.92.15 1.4.15 3.04 0 5.5-2.24 5.5-5S11.54 2 8.5 2Z" />
      <circle cx="6.6" cy="7" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="10.4" cy="7" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

// "更多" arrow icon used in banner titles
export function MoreArrowIcon({ className, width = 12, height = 12 }: IconProps) {
  return (
    <svg
      className={cn(className)}
      width={width}
      height={height}
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 6h6" />
      <path d="M6 3l3 3-3 3" />
    </svg>
  );
}
