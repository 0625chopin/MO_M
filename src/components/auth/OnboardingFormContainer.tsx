import { AuthLayout } from "@/components/auth/AuthLayout";
import { OnboardingForm } from "@/components/auth/OnboardingForm";
import type { AuthSession } from "@/components/shell/auth-session";
import { getProfileById } from "@/lib/data";
import { strings } from "@/lib/strings";

/**
 * FR-004 온보딩 컨테이너(D-030 ①) — 이 화면에서 처음으로 "진짜" 조회가 필요한 컨테이너다.
 * `session`은 `page.tsx`가 이미 `getAuthSession()`으로 확인해 인증 가드를 통과시킨 값을 그대로
 * 받는다(중복 쿠키 조회를 피한다) — `session.profileId`로 실제 프로필 레코드를 가져와
 * 표시 이름·핸들 기본값을 채운다.
 *
 * `profile`이 null인 경우(이론상 세션의 `profileId`가 가리키는 프로필이 없음 — Mock 단계
 * 경쟁 조건 정도로만 발생 가능)는 세션의 `displayName`으로 폴백한다. 예외를 던지지 않는다
 * (D-030 ③) — 온보딩은 처음 겪는 화면이라 여기서 전역 오류로 튕기면 첫인상이 나쁘다.
 */
export async function OnboardingFormContainer({
  session,
}: {
  session: Extract<AuthSession, { status: "authenticated" }>;
}) {
  const profile = await getProfileById(session.profileId);

  return (
    <AuthLayout
      eyebrow={strings.common.appName}
      title={strings.auth.onboarding.title}
      description={strings.auth.onboarding.description}
    >
      <OnboardingForm
        handle={profile?.handle ?? ""}
        displayName={profile?.displayName ?? session.displayName}
        searchOptOut={profile?.searchOptOut ?? false}
      />
    </AuthLayout>
  );
}
