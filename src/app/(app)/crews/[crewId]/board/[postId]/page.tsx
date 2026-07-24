import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

import { getBoardListHref } from "@/components/board/board-links";
import { PostDetailContainer } from "@/components/board/PostDetailContainer";
import { PostDetailSkeleton } from "@/components/board/PostDetailSkeleton";
import { strings } from "@/lib/strings";

/**
 * 게시글 상세 페이지(SC-12, FR-031·032, Task 018A). 얇은 껍데기 — 실제 조회·권한·잠금 판정은
 * `PostDetailContainer`가 한다(D-030 ①). 투표 UI(FR-040~045)는 Task 019 몫이라 여기서는 상태
 * 배지만 보여준다(`PostDetail.tsx` 참고) — 범위를 넘지 않는다.
 *
 * Next.js 16에서 `params`는 비동기다 — await 한다.
 */
export default async function CrewBoardPostPage({
  params,
}: {
  params: Promise<{ crewId: string; postId: string }>;
}) {
  const { crewId, postId } = await params;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-4 sm:p-6">
      <Link
        href={getBoardListHref(crewId)}
        className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        {strings.board.list.title}
      </Link>
      <Suspense fallback={<PostDetailSkeleton />}>
        <PostDetailContainer crewId={crewId} postId={postId} />
      </Suspense>
    </main>
  );
}
