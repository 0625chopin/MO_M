import { strings } from "@/lib/strings";

/**
 * 계정 설정 페이지 (SC-19, PRD §6 "계정 설정 페이지", F003). 경로는 requirements.md 5.1.1절
 * 계획대로 `/settings`를 쓴다(`/crews/[crewId]/settings`(SC-15, 크루 설정)와 세그먼트 깊이가
 * 달라 경로 충돌이 없다). 핸들 변경 빈도 제한(30일 1회)·검색 노출 옵트아웃 토글은 Task 015B에서
 * 채운다.
 */
export default function AccountSettingsPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
      <h1 className="text-xl font-semibold text-foreground">
        {strings.account.settings.title}
      </h1>
    </main>
  );
}
