"use client";

import { useState } from "react";

import { ErrorState } from "@/components/ui/error-state";
import { strings } from "@/lib/strings";

/**
 * `/sample` 전용 클라이언트 경계 — `BoardErrorStatePreview.tsx`·`ChatMessageListPreview.tsx`와
 * 같은 이유(서버 컴포넌트인 `sections/crews.tsx`가 `onRetry` 클로저를 직접 넘길 수 없다, RSC는
 * 함수를 직렬화하지 않는다). 무한 스크롤 다음 페이지 조회 실패(FR-014 AC3, D-030 ③)를
 * 재현한다 — `CrewGrid`가 실제로 이 오류를 만나면 같은 문구·같은 재시도 버튼을 보여준다.
 */
export function CrewExploreErrorStatePreview() {
  const [retried, setRetried] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <ErrorState
        title={strings.crew.explore.errors.loadMoreFailed}
        onRetry={() => setRetried(true)}
        retryLabel={strings.common.actions.retry}
      />
      {retried && (
        <p className="text-xs text-muted-foreground">
          다시 시도를 눌렀습니다 — 실제 화면에서는 CrewGrid가 loadMoreCrewsAction을 다시 호출합니다.
        </p>
      )}
    </div>
  );
}
