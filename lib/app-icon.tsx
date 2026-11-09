import { ImageResponse } from "next/og";

const BACKGROUND = "#b45309";
const FOREGROUND = "#fffdf8";
const MASKABLE_SCALE = 0.7;
const ROUNDED_SCALE = 0.22;

function Calendar({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke={FOREGROUND}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2.5" y="3.5" width="11" height="10" rx="2" />
      <path d="M2.5 7h11M5.5 2v3M10.5 2v3" />
    </svg>
  );
}

export function renderAppIcon(size: number, maskable: boolean) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: BACKGROUND,
          borderRadius: maskable ? 0 : size * ROUNDED_SCALE,
        }}
      >
        <Calendar size={size * (maskable ? MASKABLE_SCALE * 0.8 : 0.75)} />
      </div>
    ),
    { width: size, height: size }
  );
}
