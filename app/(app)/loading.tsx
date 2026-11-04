import { LoadingOverlay } from "@/components/loading-overlay";
import { Skeleton } from "@/components/ui/skeleton";

export default function AppLoading() {
  return (
    <div className="mx-auto w-full max-w-sm space-y-4 p-4 md:max-w-2xl" aria-busy="true">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-4 w-56" />
      <Skeleton className="h-40 w-full rounded-2xl" />
      <div className="grid gap-3 md:grid-cols-2">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>
      <LoadingOverlay />
    </div>
  );
}
