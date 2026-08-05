import { redirect } from "next/navigation";

export function redirectWithToast(
  path: string,
  type: "success" | "error",
  message: string
): never {
  const separator = path.includes("?") ? "&" : "?";
  redirect(`${path}${separator}toast=${type}&toastMsg=${encodeURIComponent(message)}`);
}
