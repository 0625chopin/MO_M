import { strings } from "@/lib/strings";

/**
 * 크루 설정 페이지 (SC-15, PRD §6 "크루 설정 페이지", F006·F007·F014·F032). 공개 범위 전환은
 * 오너 전용, 캘린더 색 수동 지정은 팔레트 내로 제한된다(D-016) — 폼 구현은 Task 017B에서 채운다.
 * 그때 `params`의 crewId(현재는 라우트 세그먼트로만 존재)로 크루 설정을 조회한다.
 */
export default function CrewSettingsPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
      <h1 className="text-xl font-semibold text-foreground">
        {strings.crew.settings.title}
      </h1>
    </main>
  );
}
