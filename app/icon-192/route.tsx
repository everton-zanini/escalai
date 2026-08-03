import type { NextRequest } from "next/server";
import { renderAppIcon } from "@/lib/app-icon";

export function GET(request: NextRequest) {
  const maskable = request.nextUrl.searchParams.has("maskable");
  return renderAppIcon(192, maskable);
}
