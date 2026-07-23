import { strings } from "@/lib/strings";

/**
 * Meetup 상세 페이지 (SC-17, PRD §6 "Meetup 상세 페이지", F034~F037). 참석/불참 응답·정원 마감
 * 비활성화·참석자 목록은 Task 016B 이후 채운다 — 그때 `params`의 meetupId(현재는 라우트
 * 세그먼트로만 존재)로 Meetup을 조회한다. 진입 경로가 통합 캘린더·알림·원 제안글 세 곳이라
 * `/calendar` 하위가 아니라 최상위 리소스 경로로 둔다(R-016/FR-052 — 경로가 아니라 meetupId
 * 기준).
 */
export default function MeetupDetailPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
      <h1 className="text-xl font-semibold text-foreground">
        {strings.meetup.detail.title}
      </h1>
    </main>
  );
}
