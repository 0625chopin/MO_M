import { Skeleton } from "@/components/ui/skeleton";

/** 알림 목록 로딩 상태. `/sample`과 실제 컨테이너의 Suspense fallback이 공유한다. */
export function NotificationListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-1" aria-busy="true">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-start gap-3 rounded-lg p-2.5">
          <Skeleton className="size-8 shrink-0 rounded-full" />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}
