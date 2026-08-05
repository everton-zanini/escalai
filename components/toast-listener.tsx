"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export function ToastListener() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const type = searchParams.get("toast");
    const message = searchParams.get("toastMsg");
    if (!type || !message) return;

    if (type === "success") toast.success(message);
    else if (type === "error") toast.error(message);

    const params = new URLSearchParams(searchParams);
    params.delete("toast");
    params.delete("toastMsg");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [searchParams, pathname, router]);

  return null;
}
