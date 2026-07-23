import { redirect } from "next/navigation";

import { isAuthenticated } from "@/components/shell/auth-session";
import { getAuthSession } from "@/components/shell/get-auth-session";
import { strings } from "@/lib/strings";

/**
 * 회원가입 페이지 (SC-02, PRD §6 "회원가입 페이지", F001). 인증 스택이 아직 없어(Task 030,
 * I-016 차단) 폼 구현은 뒤로 미룬다. 이미 로그인 상태에서의 접근 차단(PRD §2.2 각주1)만
 * Task 011의 인증 경계로 먼저 붙인다.
 */
export default async function SignupPage() {
  const session = await getAuthSession();
  if (isAuthenticated(session)) {
    redirect("/home");
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
      <h1 className="text-xl font-semibold text-foreground">
        {strings.auth.signup.title}
      </h1>
    </main>
  );
}
