import { strings } from "@/lib/strings";

/**
 * 로그인 페이지 (SC-03, PRD §6 "로그인 페이지", F002). 인증 스택이 아직 없어(Task 030,
 * I-016 차단) 폼 구현은 뒤로 미룬다.
 */
export default function LoginPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
      <h1 className="text-xl font-semibold text-foreground">
        {strings.auth.login.title}
      </h1>
    </main>
  );
}
