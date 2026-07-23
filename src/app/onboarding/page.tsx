import { strings } from "@/lib/strings";

/**
 * 온보딩 페이지 (SC-05, PRD §6 "온보딩 페이지", F003). 가입 직후 최초 1회만 진입하며 재방문 시
 * 홈으로 리다이렉트하는 규칙은 인증 경계와 함께 Task 011에서 붙는다(D-030 ④).
 */
export default function OnboardingPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
      <h1 className="text-xl font-semibold text-foreground">
        {strings.auth.onboarding.title}
      </h1>
    </main>
  );
}
