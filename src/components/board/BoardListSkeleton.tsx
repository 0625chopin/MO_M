import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/** 게시판 목록 로딩 상태. `loading.tsx`(Suspense fallback)와 `/sample` 양쪽이 공유한다. */
export function BoardListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-8 w-16" />
      </div>
      {Array.from({ length: rows }, (_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-2/3" />
          </CardHeader>
          <CardFooter className="justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="size-6 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-4 w-16" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
