"use client";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";

/**
 * `/sample` 전용 클라이언트 경계. `toast.show(...)` 호출은 클로저(함수)라 서버 컴포넌트인
 * `sections/overlays.tsx`에서 직접 만들 수 없다(`sections/errors.tsx`의
 * `RouteErrorBoundaryPreview`와 같은 이유). 실제 렌더는 루트 레이아웃에 한 번 배치한
 * `<Toaster />`(`src/app/layout.tsx`)가 맡는다 — 이 컴포넌트는 트리거 버튼만 제공한다.
 */
export function ToastTriggerPreview() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() =>
          toast.show({
            title: "임시 저장됨",
            description: "작성 중이던 내용을 30초마다 자동으로 저장해요.",
          })
        }
      >
        일반 알림 (polite)
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={() =>
          toast.destructive({
            title: "크루에서 나갔어요",
            description: "다시 가입하려면 초대가 필요해요.",
            timeout: 0,
          })
        }
      >
        파괴적 알림 (assertive)
      </Button>
    </div>
  );
}
