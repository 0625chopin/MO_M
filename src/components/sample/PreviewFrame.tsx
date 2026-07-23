import { cn } from "@/lib/utils";

import type { CSSProperties, ReactNode } from "react";


/**
 * `/sample`에서 `position: sticky`/`fixed` 요소(`HeaderNav`·`MobileTabBar`)를 미리보기 상자
 * **안에** 가둔다. `transform`이 걸린 조상은 CSS 스펙상 `position: fixed` 자손의 containing
 * block이 된다 — 이 트릭이 없으면 미리보기 안의 `MobileTabBar`가 실제 뷰포트 하단에
 * 고정되어 루트 레이아웃이 이미 그리고 있는 진짜 `MobileTabBar`와 겹쳐 보인다.
 *
 * 컨테이너 쿼리 기반 뷰포트 크기 조절(360/768/1280 리사이즈 컨트롤)은 Task 012 소관이라
 * 여기서는 만들지 않는다 — 이 컴포넌트는 "가두기"만 한다.
 */
export function PreviewFrame({
  height = 200,
  className,
  children,
}: {
  height?: number;
  className?: string;
  children: ReactNode;
}) {
  const style: CSSProperties = { height, transform: "translateZ(0)" };

  return (
    <div
      style={style}
      className={cn(
        "relative isolate overflow-hidden rounded-lg border border-border bg-background",
        className,
      )}
    >
      {children}
    </div>
  );
}
