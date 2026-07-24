import { strings } from "@/lib/strings";

/**
 * 글쓰기 페이지 (SC-11, PRD §6 "글쓰기 페이지", F016·F019). 유형 토글·날짜 유효성 검사·임시
 * 저장은 Task 016B 이후 채운다 — 그때 `params`의 crewId(현재는 라우트 세그먼트로만 존재)로
 * 게시판을 조회한다.
 */
export default function CrewBoardWritePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
      <h1 className="text-xl font-semibold text-foreground">
        {strings.board.write.title}
      </h1>
    </main>
  );
}
