# `/sample` 쇼케이스 등록 인터페이스 (Task 012)

`/sample`은 카테고리 섹션 + 앵커 내비 + 4상태(기본·로딩·빈·오류) 토글 + 컨테이너 쿼리 기반
뷰포트 프리뷰 프레임으로 구성된다(CON-09, D-030 ③, NFR-026). 실제 렌더링은
`src/app/sample/page.tsx`가 아니라 이 디렉터리의 `registry.ts`가 조립한
`SHOWCASE_SECTIONS` 배열이 결정한다 — **컴포넌트를 새로 등록할 때 `page.tsx`를 고치지
않는다.**

## 새 카테고리 등록하기

1. `src/components/sample/sections/<my-domain>.tsx`를 만들고 `defineSection`으로 섹션
   하나를 내보낸다.
2. `registry.ts`의 `SHOWCASE_SECTIONS` 배열에 import + 한 줄을 추가한다.

이 두 단계만으로 앵커 내비 항목과 섹션이 자동으로 뜬다 — `page.tsx`나 다른 팀원의 섹션
파일은 건드리지 않는다.

```tsx
// src/components/sample/sections/errors.tsx
import { PreviewFrame } from "@/components/sample/PreviewFrame";
import { defineSection } from "@/components/sample/showcase-types";
// import { RouteErrorBoundary } from "@/components/errors/RouteErrorBoundary"; // 실제 컴포넌트로 교체

export const errorsSection = defineSection({
  id: "errors",
  label: "오류 경계",
  title: "전역 오류·경계 화면",
  description: "라우트 단위 error.tsx·not-found.tsx가 렌더하는 화면입니다.",
  items: [
    {
      name: "RouteErrorBoundary",
      note: "네트워크 실패뿐 아니라 RLS 403·정원 마감 같은 도메인 오류도 다룹니다(D-030 ③).",
      panels: {
        default: <PreviewFrame height={200}>{/* 기본 상태 데모 */}</PreviewFrame>,
        error: <PreviewFrame height={200}>{/* 도메인 오류 데모 */}</PreviewFrame>,
      },
    },
  ],
});
```

```ts
// src/components/sample/registry.ts
import { errorsSection } from "@/components/sample/sections/errors"; // 추가

export const SHOWCASE_SECTIONS: ShowcaseSection[] = [
  foundationSection,
  certaintySection,
  shellSection,
  primitivesSection,
  errorsSection, // 추가
];
```

## 타입 (`showcase-types.ts`)

```ts
// panels(상태 토글)와 content(정적 데모)는 discriminated union이라 정확히 하나만 채운다 —
// 둘 다 쓰거나 둘 다 비우면 컴파일 에러다(테스트 러너가 없어 이게 유일한 방어선).
type ShowcaseItem =
  | { name: string; note?: ReactNode; panels: Partial<Record<SampleState, ReactNode>>; content?: never }
  | { name: string; note?: ReactNode; content: ReactNode; panels?: never };

interface ShowcaseSection {
  id: string;         // 앵커 링크 slug, 섹션 간 고유
  label: string;       // 앵커 내비 라벨
  title: string;        // 섹션 헤더 제목
  description: ReactNode;
  items: ShowcaseItem[];
}
```

`SampleState`는 `"default" | "loading" | "empty" | "error"`(`StatePreview.tsx`). `panels`는
`StatePreview`에 그대로 전달되므로 일부 상태만 채워도 된다(예: 빈 화면 컴포넌트는
`empty`·`error`만).

## 지켜야 할 규칙

- **`content`(정적 데모) vs `panels`(4상태 토글) 선택 기준**: 컴포넌트가 **비동기 데이터를
  다루지 않으면**(로딩·빈 상태·도메인 오류라는 개념 자체가 없으면) `content`를 쓴다 — 예:
  Button·Badge·Card·Dialog·BottomSheet·Toast·Tabs는 항상 그 자리에 그 모양으로 있거나(정적
  UI) 비제어로 열리고 닫힐 뿐이라 "로딩 중인 버튼" 같은 상태가 의미 없다. 반대로 **원자가
  드러내는 값이 서버 조회·검증 결과에 좌우되면** `panels`를 쓴다 — 폼 필드(Input 등)는
  기본·오류(aria-invalid) 두 상태만, 목록형(Empty)은 빈·오류 두 상태만 채우는 식으로
  **의미 있는 상태만** 채운다(타입이 `Partial<Record<SampleState, ReactNode>>`라 강제하지
  않는다). 이 기준은 타입 레벨로 강제되지 않으므로(discriminated union은 "`content`·`panels`
  중 정확히 하나"만 강제한다) 리뷰에서 판단이 갈리면 이 항목을 근거로 삼는다.
- **4상태의 "오류"는 도메인 오류를 포함한다**(RLS 403·정원 마감·동시 수정 충돌 — D-030 ③).
  네트워크 실패만 넣지 않는다.
- **도메인 컴포넌트는 컨테이너 쿼리(`@container` + `@sm:`/`@lg:`)로 짠다.** `PreviewFrame`의
  360/768/1280/전체 폭 토글은 컨테이너 쿼리에만 반응한다 — Tailwind의 `sm:`/`lg:`(뷰포트
  기준)는 프레임 폭만 줄여서는 반응하지 않는다. 앱 셸 4종은 뷰포트 기준(`md:`)이 의도적
  예외다(`PreviewFrame.tsx` 주석 참고) — 부모가 항상 뷰포트인 전역 셸이라 컨테이너 쿼리
  대상이 아니다.
  - **`@sm:`/`@lg:`(컨테이너 쿼리)로 짠 항목만 `PreviewFrame`(특히 `resizable`)으로
    감싼다.** `sm:`/`lg:`(뷰포트 기준)를 쓰는 항목을 `PreviewFrame`으로 감싸면 폭 토글을
    눌러도 안이 재배치되지 않아 "토글이 고장났다"는 오해를 산다 — `foundation.tsx`의
    "시맨틱 색"(뷰포트 기준, `PreviewFrame` 없음)과 "컨테이너 쿼리"(`@sm:`/`@lg:`,
    `PreviewFrame resizable`로 감쌈) 두 항목이 이 구분의 실제 예시다. 후자는 폭 토글을
    360으로 내리면(컨테이너 쿼리 `@sm` 임계값 24rem=384px 미만) 1열로, 768 이상으로 올리면
    (`@lg` 임계값 32rem=512px 이상) 3열로 실제 재배치된다 — 이게 이 도구가 검증 수단으로
    작동한다는 실측 근거다.
- **색·간격·폰트에 임의 값을 쓰지 않는다.** `globals.css`의 `@theme inline` 토큰만 쓴다.
- **쇼케이스 크롬(섹션 제목·설명·상태 토글 라벨)은 `strings` 모듈을 거치지 않는다** —
  `/sample`은 제품 화면이 아니라 내부 개발 도구다(팀장 판정, 2026-07-24). 단, 이 페이지가
  렌더링하는 실제 제품 컴포넌트(`HeaderNav`·`PageHeader` 등)에 주입하는 문구는 예외 없이
  `strings`를 거친 값이어야 한다.
- **기존 카테고리에 항목만 추가**하려면 해당 섹션 파일의 `items` 배열에 추가한다. 소유자가
  다른 파일이면 충돌 여지가 있으니, 그럴 땐 새 섹션을 만드는 편이 낫다.
