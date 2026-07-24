import { RouteErrorBoundary } from "@/components/errors/RouteErrorBoundary";

/**
 * SC-E1 404 화면(D-030 ①, 얇은 라우트 파일 + 표현 컴포넌트). Next.js 16 규약상 Server
 * Component이며 props를 받지 않는다 — `notFound()`가 던져진 세그먼트뿐 아니라 앱 전체에서
 * 매칭되지 않는 URL도 이 파일(`app/not-found.tsx`)이 함께 처리한다.
 *
 * `AppShell`을 직접 감싸지 않는다 — `src/app/layout.tsx`가 이미 모든 세그먼트를 `AppShell`로
 * 감싸므로 헤더·탭바는 그대로 유지된다. 페이지가 `<main>` 랜드마크를 소유한다(`AppShell`
 * 주석 참고).
 */
export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <RouteErrorBoundary kind="not_found" />
    </main>
  );
}
