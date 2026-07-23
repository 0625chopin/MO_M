import { strings } from "@/lib/strings";

/**
 * 회원가입 페이지 (SC-02, PRD §6 "회원가입 페이지", F001). 인증 스택이 아직 없어(Task 030,
 * I-016 차단) 폼 구현은 뒤로 미룬다.
 */
export default function SignupPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
      <h1 className="text-xl font-semibold text-foreground">
        {strings.auth.signup.title}
      </h1>
    </main>
  );
}
