import { ImageResponse } from "next/og";

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
          background: "#4f46e5",
          color: "#ffffff",
          fontSize: maskable ? size * 0.35 : size * 0.625,
          fontWeight: 700,
          fontFamily: "sans-serif",
        }}
      >
        E
      </div>
    ),
    { width: size, height: size }
  );
}
