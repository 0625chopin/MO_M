import { Skeleton } from "@/components/ui/skeleton";

/** 받은 초대함 로딩 상태(D-030 ③, Task 017B) — 컨테이너의 `Suspense` 폴백이자 `/sample`
 *  "로딩" 패널이 함께 쓴다(`CrewMembersSkeleton`과 같은 패턴). */
export function InvitationListSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true">
      <Skeleton className="h-4 w-64" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    </div>
  );
}
