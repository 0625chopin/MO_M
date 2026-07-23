import { redirect } from "next/navigation";

import { isAuthenticated } from "@/components/shell/auth-session";
import { getAuthSession } from "@/components/shell/get-auth-session";
import { strings } from "@/lib/strings";

/**
 * 온보딩 페이지 (SC-05, PRD §6 "온보딩 페이지", F003). 가입 직후 최초 1회만 진입하며 재방문 시
 * 홈으로 리다이렉트하는 규칙은 인증 경계와 함께 Task 011에서 붙는다(D-030 ④).
 *
 * PRD §2.2: 비회원은 접근 불가(로그인 유도) · 회원은 최초 1회만 접근, 이후 재방문 시 홈으로
 * 리다이렉트. `hasCompletedOnboarding`은 아직 Mock이라 항상 세션에 실려 온다(Task 030 이후
 * 실제 가입 완료 플래그로 교체).
 */
export default async function OnboardingPage() {
  const session = await getAuthSession();
  if (!isAuthenticated(session)) {
    redirect("/login");
  }
  if (session.hasCompletedOnboarding) {
    redirect("/home");
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
      <h1 className="text-xl font-semibold text-foreground">
        {strings.auth.onboarding.title}
      </h1>
    </main>
  );
}
