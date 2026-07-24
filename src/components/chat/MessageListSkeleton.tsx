import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** 채팅방 최초 진입 로딩 상태. `Suspense` fallback과 `/sample` 양쪽이 공유한다(BoardListSkeleton과
 *  같은 패턴, `docs/CONVENTIONS.md`). 좌우를 번갈아 채워 말풍선 목록의 형태를 흉내 낸다. */
export function MessageListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="flex flex-1 flex-col justify-end gap-3 p-4">
      {Array.from({ length: rows }, (_, i) => {
        const isOwn = i % 3 === 1;
        return (
          <div
            key={i}
            className={cn("flex items-end gap-2", isOwn ? "flex-row-reverse self-end" : "self-start")}
          >
            {!isOwn && <Skeleton className="size-6 shrink-0 rounded-full" />}
            <Skeleton className={cn("h-9 rounded-2xl", i % 2 === 0 ? "w-40" : "w-24")} />
          </div>
        );
      })}
    </div>
  );
}
