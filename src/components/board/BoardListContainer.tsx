import { notFound } from "next/navigation";

import { getBoardListHref } from "@/components/board/board-links";
import type { BoardPostSummary } from "@/components/board/board-view-models";
import { BoardList } from "@/components/board/BoardList";
import { resolveBoardViewer } from "@/components/board/resolve-board-viewer";
import { getBoardByCrewId, getPollByPostId, getProfileById, listPostsByPage } from "@/lib/data";
import { checkPermission } from "@/lib/rules/permission";
import { strings } from "@/lib/strings";
import type { Id } from "@/lib/types";

/**
 * 게시판 목록 컨테이너(D-030 ①) — Mock 조회를 소유한다. `BoardList`(표현)는 이 컴포넌트가
 * 조인해 넘기는 `BoardPostSummary[]`만 받는다.
 *
 * `board:read` 판정이 거부되면 `cause: { code: "forbidden" }`를 실어 던진다 — 가장 가까운
 * `error.tsx`가 `classifyError`로 이를 읽어 `RouteErrorBoundary(kind="forbidden")`를 그린다
 * (Task 014, D-030 ③). 크루 자체가 없으면(게시판도 없음) `notFound()`로 404 처리한다.
 */
export async function BoardListContainer({ crewId, page }: { crewId: Id; page: number }) {
  const board = await getBoardByCrewId(crewId);
  if (!board) {
    notFound();
  }

  const { role } = await resolveBoardViewer(crewId);
  const readPermission = checkPermission({ role, action: "board:read" });
  if (!readPermission.allowed) {
    throw new Error("게시판을 볼 권한이 없다.", {
      cause: { code: "forbidden", message: readPermission.reason ?? "board:read denied" },
    });
  }

  const canWrite = checkPermission({ role, action: "post:create" }).allowed;

  const postsPage = await listPostsByPage(board.id, { page });
  const posts: BoardPostSummary[] = await Promise.all(
    postsPage.items.map(async (post) => {
      const [author, poll] = await Promise.all([
        getProfileById(post.authorId),
        post.type === "meetup_proposal" ? getPollByPostId(post.id) : Promise.resolve(null),
      ]);
      return {
        id: post.id,
        title: post.title,
        type: post.type,
        authorDisplayName: author?.displayName ?? strings.common.profile.unknownAuthor,
        authorAvatarUrl: author?.avatarUrl ?? null,
        createdAt: post.createdAt,
        pollStatus: poll?.status ?? null,
      };
    }),
  );

  return (
    <BoardList
      crewId={crewId}
      posts={posts}
      totalCount={postsPage.totalCount}
      page={postsPage.page}
      totalPages={postsPage.totalPages}
      canWrite={canWrite}
      writeHref={`${getBoardListHref(crewId)}/new`}
    />
  );
}
