import { Skeleton } from "@/components/ui/skeleton";

/** 크루 탐색 목록 로딩 상태(D-030 ③) — `page.tsx`의 `Suspense` 폴백이자 `/sample` "로딩" 패널이
 *  함께 쓴다. 카드 6장 자리를 잡아 둔다(그리드 재배치가 로딩 → 완료 전환에서 흔들리지 않도록). */
export function CrewGridSkeleton() {
  return (
    <div className="@container" aria-busy="true">
      <div className="grid grid-cols-1 gap-4 @sm:grid-cols-2 @lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="flex flex-col gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
            <div className="flex items-center gap-2">
              <Skeleton className="size-3 rounded-full" />
              <Skeleton className="h-5 w-32" />
            </div>
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
