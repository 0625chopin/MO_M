import { strings } from "@/lib/strings";

/**
 * 랜딩 페이지 (SC-01, PRD §6 "랜딩 페이지"). 비로그인 방문자의 진입점 — 로그인 상태 접근 시
 * 홈 대시보드(`/home`)로 리다이렉트하는 인증 경계 로직은 Task 011(AppShell)에서 붙는다(D-030 ④).
 */
export default function LandingPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
      <h1 className="text-xl font-semibold text-foreground">
        {strings.landing.hero.title}
      </h1>
    </main>
  );
}
