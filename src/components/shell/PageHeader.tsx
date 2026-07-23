import { ChevronLeft } from "lucide-react";
import Link from "next/link";


import { strings } from "@/lib/strings";
import { cn } from "@/lib/utils";

import type { ReactNode } from "react";

export interface PageHeaderProps {
  /** 로딩 상태(`status="loading"`)에서는 스켈레톤으로 대체되므로 빈 문자열이어도 안전하다. */
  title: string;
  description?: string;
  /** 지정하면 좌측에 뒤로 가기 링크를 그린다. 상세 페이지(게시글·Meetup 등)에서 쓴다. */
  backHref?: string;
  /** 제목 우측에 붙는 액션 슬롯(예: "글쓰기" 버튼). */
  actions?: ReactNode;
  /**
   * `loading`: 스켈레톤. `error`: `errorMessage`를 `role="alert"`로 노출한다 — 네트워크 실패뿐
   * 아니라 정원 마감·동시 수정 충돌 같은 **도메인 오류**도 여기로 전달한다(D-030 ③).
   */
  status?: "default" | "loading" | "error";
  errorMessage?: string;
  className?: string;
}

/**
 * 페이지별 제목 바. 표현 컴포넌트 — 문구는 전부 호출부가 `strings` 모듈에서 가져와 props로
 * 넘긴다(NFR-023). 이 컴포넌트 자신은 `common.actions.goBack`(뒤로 가기 버튼 접근성 라벨)
 * 하나만 문자열 모듈을 직접 참조한다.
 */
export function PageHeader({
  title,
  description,
  backHref,
  actions,
  status = "default",
  errorMessage,
  className,
}: PageHeaderProps) {
  if (status === "loading") {
    return (
      <div className={cn("flex flex-col gap-2 border-b border-border p-4", className)} aria-busy="true">
        <div className="h-6 w-40 animate-pulse rounded bg-muted" />
        <div className="h-4 w-64 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-1 border-b border-border p-4", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          {backHref && (
            <Link
              href={backHref}
              aria-label={strings.common.actions.goBack}
              className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <ChevronLeft aria-hidden="true" className="size-5" />
            </Link>
          )}
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      {status === "error" && errorMessage && (
        <p role="alert" className="text-sm text-destructive">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
