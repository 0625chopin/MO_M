import * as React from "react"

import { cn } from "@/lib/utils"

function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    // 이 파일은 원시 래퍼라 `htmlFor`·자식이 전부 `...props`로 각 호출부에서 들어온다
    // (정적 분석기가 볼 수 없다). 실제 연결 여부는 각 호출부(Input.tsx 등, "라벨
    // htmlFor/id 연결")가 책임진다(Task 024 접근성 QA에서 jsx-a11y 전체 규칙셋을 켜며 확인).
    // eslint-disable-next-line jsx-a11y/label-has-associated-control
    <label
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Label }
