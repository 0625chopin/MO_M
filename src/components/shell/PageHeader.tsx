import { ChevronLeft } from "lucide-react";
import Link from "next/link";

import { Skeleton } from "@/components/ui/skeleton";
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
   * 제목 위에 놓이는 짧은 분류 라벨(예: 크루 이름, "투표 진행 중"). 넓은 트래킹으로 세워
   * 제목과 다른 층위임을 드러낸다. 디자인 개편에서 추가한 슬롯이다 — 크루 하위 페이지는
   * "어느 크루인지"가 제목만큼 중요한데(PRD §5 크루 하위 메뉴) 그걸 담을 자리가 없었다.
   *
   * **모노를 쓰지 않는다.** 여기 들어올 값은 대개 크루 이름(한글)인데 Geist Mono에는 한글
   * 글리프가 없어 OS 폰트로 폴백된다 — 라틴 크루명과 한글 크루명이 서로 다른 서체로 보인다.
   */
  eyebrow?: string;
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
 *
 * **디자인 개편에서 바뀐 것**: 손으로 짠 스켈레톤을 `Skeleton`으로 교체하고, `eyebrow` 슬롯과
 * 제목 트래킹(`tracking-display`)을 더했다. 오류 문구는 텍스트만 붉게 칠하던 것을 좌측
 * 세로선이 붙은 블록으로 바꿨다 — 색만으로 상태를 전달하지 않기 위해서다(NFR-018/WCAG 1.4.1,
 * 색각 이상 사용자에게 붉은 글씨는 그냥 글씨다).
 */
export function PageHeader({
  title,
  description,
  backHref,
  actions,
  eyebrow,
  status = "default",
  errorMessage,
  className,
}: PageHeaderProps) {
  if (status === "loading") {
    return (
      <div
        className={cn("flex flex-col gap-2 border-b border-border px-4 py-5", className)}
        aria-busy="true"
      >
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-1.5 border-b border-border px-4 py-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          {backHref && (
            <Link
              href={backHref}
              aria-label={strings.common.actions.goBack}
              className="-ml-1 flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <ChevronLeft aria-hidden="true" className="size-5" />
            </Link>
          )}
          <div className="flex min-w-0 flex-col gap-0.5">
            {eyebrow && (
              <span className="truncate text-[11px] font-medium tracking-[0.14em] text-muted-foreground">
                {eyebrow}
              </span>
            )}
            <h1 className="truncate text-xl font-semibold text-foreground">{title}</h1>
          </div>
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
      {description && (
        <p className="text-sm leading-normal text-muted-foreground">{description}</p>
      )}
      {status === "error" && errorMessage && (
        <p
          role="alert"
          className="mt-1 border-l-2 border-destructive py-0.5 pl-2.5 text-sm text-destructive"
        >
          {errorMessage}
        </p>
      )}
    </div>
  );
}
