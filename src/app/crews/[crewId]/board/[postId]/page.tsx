import { strings } from "@/lib/strings";

/**
 * 게시글 상세 페이지 (SC-12, PRD §6 "게시글 상세 페이지", F017·F018·F020~F024·F028). 투표 UI·
 * 집계·판정 사유 표시는 Task 016B 이후 채운다 — 그때 `params`의 crewId·postId(현재는 라우트
 * 세그먼트로만 존재)로 데이터를 조회한다. 리소스 링크는 경로 문자열이 아니라 crewId·postId
 * 기준으로 구성한다(R-016/FR-052).
 */
export default function CrewBoardPostPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
      <h1 className="text-xl font-semibold text-foreground">
        {strings.board.detail.title}
      </h1>
    </main>
  );
}
