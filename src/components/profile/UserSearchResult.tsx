import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardHeader } from "@/components/ui/card";
import type { HandleSearchResult } from "@/lib/rules/handle-search";
import { strings } from "@/lib/strings";

import type { ReactNode } from "react";

export interface UserSearchResultProps {
  result: HandleSearchResult;
  /**
   * 초대 다이얼로그(Task 017A) 등 검색 맥락별 액션(초대 버튼, "이미 멤버입니다" 배지, FR-006
   * E2~E4)을 끼워 넣는 슬롯. 계정 설정 화면(SC-19)은 초대 개념이 없어 비워 둔다 — 이 컴포넌트
   * 자신은 "누가 이 검색을 하고 있는지"·"어느 크루 맥락인지"를 모른다(props로만 받는 순수
   * 표현 컴포넌트, D-030 ①).
   */
  footer?: ReactNode;
}

/**
 * 핸들 검색 결과 카드(FR-006, D-005, Task 015B). `found`가 아니면 **미존재·옵트아웃을 구분하지
 * 않는 동일한 문구 하나만** 보여준다(R-012) — 그 구분 자체가 `lib/rules/handle-search.ts`의
 * `projectHandleSearchResult`에서 이미 하나의 값으로 합쳐졌으므로, 이 컴포넌트는 애초에 두
 * 경우를 가를 정보를 갖고 있지 않다.
 *
 * NFR-013(3필드 제한)도 이 컴포넌트가 다시 강제할 필요가 없다 — `HandleSearchResult`
 * 타입 자체가 `found: true`일 때 handle·displayName·avatarUrl 외에는 담을 자리가 없다.
 *
 * **`aria-live`는 이 컴포넌트가 아니라 호출부(`UserSearchField`)가 소유한다**(6일차 교차검증
 * W-3, DESIGN). "찾음" 분기(아래 `Card`)와 "없음" 분기 둘 다 알림이 필요한데, 이 컴포넌트가
 * 조건부로 마운트/언마운트되는 자리에 있으면 라이브 리전이 첫 콘텐츠를 놓치는 AT가 있다.
 * `UserSearchField`가 처음부터 DOM에 있는 `aria-live="polite"` 컨테이너로 이 컴포넌트 전체를
 * 감싸고, 이 컴포넌트 자신은 중첩 이중 발화를 피하기 위해 `role="status"`를 갖지 않는다.
 */
export function UserSearchResult({ result, footer }: UserSearchResultProps) {
  if (!result.found) {
    return (
      <p className="px-1 text-sm text-muted-foreground">{strings.account.search.notFound}</p>
    );
  }

  return (
    <Card aria-label={strings.account.search.resultAriaLabel}>
      <CardHeader className="flex-row items-center gap-3">
        <Avatar size="sm">
          {result.avatarUrl && <AvatarImage src={result.avatarUrl} alt="" />}
          <AvatarFallback>{result.displayName.slice(0, 1)}</AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-col">
          <span className="truncate font-medium text-foreground">{result.displayName}</span>
          <span className="truncate text-sm text-muted-foreground">@{result.handle}</span>
        </div>
        {footer && <div className="ml-auto shrink-0">{footer}</div>}
      </CardHeader>
    </Card>
  );
}
