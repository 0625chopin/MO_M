import { strings } from "@/lib/strings";

/**
 * 커뮤니티 게시판 페이지 (SC-10, PRD §6 "커뮤니티 게시판 페이지", F017). 목록·페이지네이션·유형
 * 배지는 Task 016B 이후 채운다 — 그때 `params`의 crewId(현재는 라우트 세그먼트로만 존재)로
 * 게시판을 조회한다.
 */
export default function CrewBoardPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
      <h1 className="text-xl font-semibold text-foreground">
        {strings.board.list.title}
      </h1>
    </main>
  );
}
