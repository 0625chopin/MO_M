import { strings } from "@/lib/strings";

/**
 * 멤버 관리 페이지 (SC-14, PRD §6 "멤버 관리 페이지", F004·F009·F012·F013·F015). 정렬 목록·초대
 * 다이얼로그·승인/반려 탭·임원 임명은 Task 017A에서 채운다 — 그때 `params`의 crewId(현재는
 * 라우트 세그먼트로만 존재)로 멤버 목록을 조회한다.
 */
export default function CrewMembersPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
      <h1 className="text-xl font-semibold text-foreground">
        {strings.crew.members.title}
      </h1>
    </main>
  );
}
