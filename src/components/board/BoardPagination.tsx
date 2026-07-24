import Link from "next/link";

import { getBoardListHref } from "@/components/board/board-links";
import { buttonVariants } from "@/components/ui/button";
import { strings, t } from "@/lib/strings";
import type { Id } from "@/lib/types";
import { cn } from "@/lib/utils";


/**
 * 20건 페이지네이션(FR-031 AC2). 번호 기반 — `?page=N` 검색 파라미터로 서버 컴포넌트가 다시
 * 렌더한다(클라이언트 상태 없이 링크 이동만으로 동작, JS 비활성 환경에서도 접근 가능).
 * `totalPages`가 1 이하이면 컨테이너가 아예 렌더하지 않는다.
 */
export function BoardPagination({
  crewId,
  page,
  totalPages,
}: {
  crewId: Id;
  page: number;
  totalPages: number;
}) {
  const base = getBoardListHref(crewId);
  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  return (
    <nav aria-label={strings.board.list.title} className="flex items-center justify-center gap-3">
      {prevDisabled ? (
        <span aria-disabled="true" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "opacity-50")}>
          {strings.board.list.pagination.prev}
        </span>
      ) : (
        <Link href={`${base}?page=${page - 1}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
          {strings.board.list.pagination.prev}
        </Link>
      )}

      <span className="tnum text-sm text-muted-foreground">
        {t((s) => s.board.list.pagination.pageStatus, { page, totalPages })}
      </span>

      {nextDisabled ? (
        <span aria-disabled="true" className={cn(buttonVariants({ variant: "outline", size: "sm" }), "opacity-50")}>
          {strings.board.list.pagination.next}
        </span>
      ) : (
        <Link href={`${base}?page=${page + 1}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
          {strings.board.list.pagination.next}
        </Link>
      )}
    </nav>
  );
}
