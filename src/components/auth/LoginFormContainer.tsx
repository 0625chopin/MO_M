import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";
import { strings } from "@/lib/strings";

/**
 * FR-002 로그인 컨테이너(D-030 ①). "조회"라 부를 만한 것은 쿼리스트링에서 복귀 경로를 읽는
 * 것뿐이다(FR-002 AC3) — `page.tsx`가 Next 16 비동기 `searchParams`를 이미 풀어 props로
 * 내려준다(요청 단위 값이라 여기서 다시 `await`할 게 없다).
 */
export function LoginFormContainer({ redirectTo }: { redirectTo?: string }) {
  return (
    <AuthLayout
      eyebrow={strings.common.appName}
      title={strings.auth.login.title}
      description={strings.auth.login.description}
    >
      <LoginForm redirectTo={redirectTo} />
    </AuthLayout>
  );
}
