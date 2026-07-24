import Link from "next/link";

import { getPostDetailHref } from "@/components/board/board-links";
import { BOARD_LIST_VISIBLE_POLL_STATUSES, type BoardPostSummary } from "@/components/board/board-view-models";
import { formatPostDate } from "@/components/board/format-post-date";
import { PollStatusBadge } from "@/components/board/PollStatusBadge";
import { PostTypeBadge } from "@/components/board/PostTypeBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { Id } from "@/lib/types";

/** 게시판 목록의 카드 한 줄. 순수 표현 — `lib/data`를 참조하지 않고 조인된 값만 props로 받는다. */
export function BoardListItem({ crewId, post }: { crewId: Id; post: BoardPostSummary }) {
  const showPollBadge =
    post.pollStatus !== null && BOARD_LIST_VISIBLE_POLL_STATUSES.includes(post.pollStatus);

  return (
    <Link
      href={getPostDetailHref(crewId, post.id)}
      className="block rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <Card className="transition-colors hover:bg-muted/40">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-1.5">
            <PostTypeBadge type={post.type} />
            {showPollBadge && post.pollStatus && <PollStatusBadge status={post.pollStatus} />}
          </div>
          <CardTitle className="truncate">{post.title}</CardTitle>
        </CardHeader>
        <CardFooter className="justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Avatar size="sm">
              {post.authorAvatarUrl && <AvatarImage src={post.authorAvatarUrl} alt="" />}
              <AvatarFallback>{post.authorDisplayName.slice(0, 1)}</AvatarFallback>
            </Avatar>
            <span className="truncate">{post.authorDisplayName}</span>
          </div>
          <time dateTime={post.createdAt} className="tnum shrink-0">
            {formatPostDate(post.createdAt)}
          </time>
        </CardFooter>
      </Card>
    </Link>
  );
}
