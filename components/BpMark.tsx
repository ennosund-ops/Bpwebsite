import { cx } from "@/lib/utils";

/**
 * BP CLUB geometric wordmark, hand-drawn as SVG so it is crisp at any size
 * and needs no external asset (also used for the favicon).
 * Recreated from the brand reference: rounded geometric "BP" + tracked "CLUB".
 */
export function BpMark({
  withClub = true,
  className,
  title = "BP CLUB",
}: {
  withClub?: boolean;
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 200 150"
      className={cx("h-auto", className)}
      role="img"
      aria-label={title}
      fill="none"
    >
      <g
        stroke="currentColor"
        strokeWidth={14}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* B */}
        <path d="M20 18 L20 104" />
        <path d="M20 18 L44 18 C66 18 66 54 44 54 L20 54" />
        <path d="M20 54 L52 54 C74 54 74 104 52 104 L20 104" />
        {/* P */}
        <path d="M112 18 L112 104" />
        <path d="M112 18 L138 18 C160 18 160 60 138 60 L112 60" />
      </g>

      {withClub && (
        <text
          x="100"
          y="138"
          textAnchor="middle"
          fill="currentColor"
          fontFamily="var(--font-mono), monospace"
          fontSize="20"
          fontWeight={600}
          letterSpacing="10"
        >
          CLUB
        </text>
      )}
    </svg>
  );
}
