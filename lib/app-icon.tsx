import fs from "fs";
import path from "path";
import { ImageResponse } from "next/og";

const iconDataUri = `data:image/png;base64,${fs
  .readFileSync(path.join(process.cwd(), "public", "escalai_icon.png"))
  .toString("base64")}`;

const MASKABLE_BACKGROUND = "#1d4ed8";
const MASKABLE_SCALE = 0.8;

export function renderAppIcon(size: number, maskable: boolean) {
  return new ImageResponse(
    maskable ? (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: MASKABLE_BACKGROUND,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={iconDataUri}
          width={size * MASKABLE_SCALE}
          height={size * MASKABLE_SCALE}
        />
      </div>
    ) : (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={iconDataUri} width={size} height={size} />
    ),
    { width: size, height: size }
  );
}
