import { redirect } from "next/navigation";

import { OnboardingFormContainer } from "@/components/auth/OnboardingFormContainer";
import { isAuthenticated } from "@/components/shell/auth-session";
import { getAuthSession } from "@/components/shell/get-auth-session";

/**
 * 온보딩 페이지 (SC-05, PRD §6 "온보딩 페이지", FR-004, Task 015A). 가입 직후 최초 1회만
 * 진입하며 재방문 시 홈으로 리다이렉트하는 규칙은 Task 011의 인증 경계 그대로다(D-030 ④).
 *
 * PRD §2.2: 비회원은 접근 불가(로그인 유도) · 회원은 최초 1회만 접근, 이후 재방문 시 홈으로
 * 리다이렉트. `hasCompletedOnboarding`은 `completeOnboardingAction`이 저장을 마치면 세션
 * 쿠키에 true로 갱신한다(`lib/actions/complete-onboarding.ts`).
 *
 * 이미 확인한 `session`을 그대로 `OnboardingFormContainer`에 넘긴다 — 컨테이너가 같은 쿠키를
 * 다시 조회할 필요가 없다(`isAuthenticated`로 타입이 이미 `authenticated`로 좁혀졌다).
 */
export default async function OnboardingPage() {
  const session = await getAuthSession();
  if (!isAuthenticated(session)) {
    redirect("/login");
  }
  if (session.hasCompletedOnboarding) {
    redirect("/home");
  }

  return <OnboardingFormContainer session={session} />;
}
