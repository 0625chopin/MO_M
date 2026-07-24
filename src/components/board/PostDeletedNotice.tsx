import { Trash2 } from "lucide-react";
import Link from "next/link";

import { getBoardListHref } from "@/components/board/board-links";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { strings } from "@/lib/strings";
import type { Id } from "@/lib/types";

/**
 * 삭제된(또는 존재한 적 없는) 게시글에 접근했을 때(FR-032 AC4). 채팅의 공유 링크뿐 아니라
 * 이 라우트에 직접 진입해도 같은 안내를 쓴다 — 게시글 엔티티 하나에 문구 세트 하나
 * (`common.post.deleted`, `ko.ts` §4). 일반 404(`RouteErrorBoundary`)보다 이 도메인 전용
 * 안내가 더 구체적이라 여기서 별도로 그린다 — `notFound()`로 위임하지 않는다.
 */
export function PostDeletedNotice({ crewId }: { crewId: Id }) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Trash2 aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>{strings.board.detail.deleted}</EmptyTitle>
        <EmptyDescription>{strings.board.detail.deletedDescription}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button size="sm" nativeButton={false} render={<Link href={getBoardListHref(crewId)} />}>
          {strings.board.detail.backToList}
        </Button>
      </EmptyContent>
    </Empty>
  );
}
