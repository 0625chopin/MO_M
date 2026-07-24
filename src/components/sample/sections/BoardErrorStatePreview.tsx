"use client";

import { useState } from "react";

import { ErrorState } from "@/components/ui/error-state";
import { strings } from "@/lib/strings";

/**
 * `/sample` 전용 클라이언트 경계. `ErrorState`(Task 013 원자)는 `onRetry` 콜백을 받는데
 * 서버 컴포넌트인 `sections/board.tsx`가 클로저(함수)를 직접 props로 넘길 수 없다
 * (`sections/errors.tsx`의 `RouteErrorBoundaryPreview`와 같은 이유 — React Server Component는
 * 함수를 직렬화하지 않는다). 게시판 목록·상세의 "조회 실패"(AC4) 인라인 오류를 재현한다.
 */
export function BoardErrorStatePreview() {
  const [retried, setRetried] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <ErrorState
        title={strings.error.network.title}
        description={strings.error.network.description}
        onRetry={() => setRetried(true)}
      />
      {retried && (
        <p className="text-xs text-muted-foreground">
          다시 시도를 눌렀습니다 — 실제 화면에서는 서버 컴포넌트가 다시 조회합니다.
        </p>
      )}
    </div>
  );
}
