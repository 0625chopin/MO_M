import { strings } from "@/lib/strings";

import type { ReactNode } from "react";

/**
 * 인증 화면 3종(회원가입·로그인·온보딩, Task 015A) 공통 뼈대 — 좌측 브랜드 패널 + 우측 폼
 * 슬롯의 분할 레이아웃. `@3xl`(48rem=768px) 이상에서 2단, 그 아래에서는 브랜드 패널이 위로
 * 접혀 1단으로 쌓인다.
 *
 * **뷰포트가 아니라 컨테이너 쿼리로 짰다**(`docs/CONVENTIONS.md` "도메인 컴포넌트는 컨테이너
 * 쿼리로 짠다") — `/sample`의 폭 토글(360/768/1280)이 `PreviewFrame` 안에서 실제 재배치를
 * 보여줘야 검증 도구로 의미가 있다. 768 임계값을 `@3xl`로 맞춘 것은 `PreviewFrame`의 768
 * 토글에서 정확히 2단으로 전환되는 것을 눈으로 확인하기 위해서다.
 *
 * 데이터를 조회하지 않는 순수 표현 컴포넌트라 `*Container.tsx`가 아니다 — 3개 페이지의
 * 컨테이너(`SignupFormContainer` 등)가 이 레이아웃을 공유해서 쓴다. `<main>` 랜드마크는
 * 이 컴포넌트가 소유한다(`AppShell`은 `<div id="main-content">`만 두고 각 페이지가 `<main>`을
 * 갖는 기존 규약, `AppShell.tsx` 참고).
 */
export function AuthLayout({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="@container flex flex-1 flex-col @3xl:grid @3xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
      <div className="flex flex-col justify-center gap-4 bg-primary px-6 py-10 text-primary-foreground @3xl:px-12 @3xl:py-16">
        <span className="text-xs font-medium tracking-[0.2em] text-primary-foreground/70 uppercase">
          {eyebrow}
        </span>
        <h1 className="text-2xl leading-tight font-semibold text-balance @3xl:text-3xl">{title}</h1>
        <p className="max-w-sm text-sm leading-relaxed text-primary-foreground/80">{description}</p>
        <p className="mt-6 max-w-sm border-t border-primary-foreground/15 pt-6 text-xs leading-relaxed text-primary-foreground/60 @3xl:mt-10">
          {strings.landing.hero.title}
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-10 @3xl:px-12 @3xl:py-16">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </main>
  );
}
