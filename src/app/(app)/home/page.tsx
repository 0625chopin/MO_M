import { strings } from "@/lib/strings";

/**
 * 홈 대시보드 페이지 (SC-06, PRD §6 "홈 대시보드 페이지"). 소속 크루 카드·다가오는 Meetup 요약
 * (F031)·최근 알림 미리보기(F039)는 Task 016B 이후 채운다.
 */
export default function HomeDashboardPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
      <h1 className="text-xl font-semibold text-foreground">
        {strings.home.dashboard.title}
      </h1>
    </main>
  );
}
