import { AuthLayout } from "@/components/auth/AuthLayout";
import { SignupForm } from "@/components/auth/SignupForm";
import { strings } from "@/lib/strings";

/**
 * FR-001 회원가입 컨테이너(D-030 ①). 조회할 데이터가 없다 — 회원가입은 비회원 전용 화면이라
 * 미리 내려줄 세션·프로필이 없다. 그래도 3층 구조(page → Container → View)는 지킨다 — 나중에
 * 초대 토큰 쿼리 파라미터(`?invite=...`)로 "가입 후 자동 크루 가입"을 잇는 조회가 생기면
 * 이 자리에 추가한다. 데이터가 없다는 이유로 층을 건너뛰면 그 시점에 `SignupForm`(표현
 * 컴포넌트)까지 고쳐야 한다 — D-030이 피하려는 바로 그 상황이다.
 */
export function SignupFormContainer() {
  return (
    <AuthLayout
      eyebrow={strings.common.appName}
      title={strings.auth.signup.title}
      description={strings.auth.signup.description}
    >
      <SignupForm />
    </AuthLayout>
  );
}
