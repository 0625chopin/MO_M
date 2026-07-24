"use client";

import { useState } from "react";

import type { RouteErrorKind } from "@/components/errors/route-error-kind";
import { RouteErrorBoundary } from "@/components/errors/RouteErrorBoundary";

/**
 * `/sample` 전용 데모 래퍼. `RouteErrorBoundary`의 `onRetry`는 함수라 `src/app/sample/page.tsx`
 * (Server Component) → `registry.ts` → `sections/errors.tsx`에서 만든 클로저를 그대로 props로
 * 넘길 수 없다 — React Server Component는 함수를 직렬화하지 않는다. 이 파일을 클라이언트
 * 경계로 두고 직렬화 가능한 `kind`(문자열)만 건너오게 해서, 실제 라우트 오류 화면과 같은
 * 모양의 "다시 시도" 버튼을 `/sample`에서도 눌러볼 수 있게 한다. 실제 화면(`error.tsx`·
 * `global-error.tsx`)에서는 Next.js의 `unstable_retry`가 이 자리를 대신한다.
 */
export function RouteErrorBoundaryPreview({ kind }: { kind: RouteErrorKind }) {
  const [retried, setRetried] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <RouteErrorBoundary
        kind={kind}
        onRetry={kind === "not_found" ? undefined : () => setRetried(true)}
      />
      {retried && (
        <p className="text-center text-xs text-muted-foreground">
          다시 시도를 눌렀습니다 — 실제 화면에서는 Next.js의 unstable_retry()가 세그먼트를
          다시 렌더링합니다.
        </p>
      )}
    </div>
  );
}
