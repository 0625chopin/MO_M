import { notFound } from "next/navigation";

import { PostWriteForm } from "@/components/board/PostWriteForm";
import { resolveBoardViewer } from "@/components/board/resolve-board-viewer";
import { getBoardByCrewId } from "@/lib/data";
import { checkPermission } from "@/lib/rules/permission";
import type { Id } from "@/lib/types";

/**
 * 글쓰기 컨테이너(D-030 ①, Task 018B). 크루원 여부 자체는 `(app)/crews/[crewId]/layout.tsx`
 * (D-039)가 라우트 레벨에서 이미 걸렀다 — 이 컨테이너는 `BoardListContainer`(018A)와 같은
 * 패턴으로 `post:create`(일반글 작성 허용 여부)만 한 번 더 판정한다. D-039가 정한 대로
 * "누가 여기 도달할 수 있는가"는 레이아웃 몫, "그 사람이 정확히 뭘 할 수 있는가"는 컨테이너
 * 몫이다 — 실제 내비게이션 경로에서는 활성 크루원이면 `post:create`가 항상 허용이라 이
 * 판정이 사실상 통과만 하지만, Server Component가 직접 다른 경로로 렌더될 가능성에 대한
 * 방어이자 기존 게시판 컨테이너들과의 일관성을 위해 유지한다.
 *
 * 모임 제안글(`poll:create_proposal`) 판정은 유형을 고른 "이후"에나 의미가 있어 여기서
 * 미리 하지 않는다 — `createPostAction`(Server Action)이 제출 시점에 최종 판정한다.
 */
export async function PostWriteContainer({ crewId }: { crewId: Id }) {
  const board = await getBoardByCrewId(crewId);
  if (!board) {
    notFound();
  }

  const { role } = await resolveBoardViewer(crewId);
  const permission = checkPermission({ role, action: "post:create" });
  if (!permission.allowed) {
    throw new Error("게시글을 작성할 권한이 없다.", {
      cause: { code: "forbidden", message: permission.reason ?? "post:create denied" },
    });
  }

  return <PostWriteForm crewId={crewId} />;
}
