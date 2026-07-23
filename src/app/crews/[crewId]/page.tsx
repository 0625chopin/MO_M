import { strings } from "@/lib/strings";

/**
 * 크루 홈 페이지 (SC-09, PRD §6 "크루 홈 페이지", F006·F011). `public`/`private` 접근 조건 분기와
 * 가입 신청 상태 기계는 Task 016B에서 채운다 — 그때 `params`의 crewId(현재는 라우트 세그먼트로만
 * 존재)로 크루 데이터를 조회한다. 리소스 링크는 경로 문자열이 아니라 crewId 기준으로 구성한다
 * (R-016/FR-052).
 */
export default function CrewHomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
      <h1 className="text-xl font-semibold text-foreground">
        {strings.crew.home.title}
      </h1>
    </main>
  );
}
