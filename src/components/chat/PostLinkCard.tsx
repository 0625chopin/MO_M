import { LockIcon, Trash2Icon } from "lucide-react";
import Link from "next/link";

import { getPostDetailHref } from "@/components/board/board-links";
import { PollStatusBadge } from "@/components/board/PollStatusBadge";
import { PostTypeBadge } from "@/components/board/PostTypeBadge";
import type { PostLinkCardViewModel } from "@/components/chat/post-link-card-view-models";
import { PollCountdown } from "@/components/poll/PollCountdown";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { strings } from "@/lib/strings";

/**
 * 채팅 게시글 공유 카드(FR-052·053, Task 020C). 순수 표현 컴포넌트 — `lib/data`를 참조하지
 * 않고 `resolvePostLinkCard`가 이미 조인·판정한 `PostLinkCardViewModel`만 props로 받는다
 * (D-030 ①). `MessageBubble`이 `message.type === "post_link"`일 때 그린다.
 *
 * **일반글/제안글**은 `BoardListItem.tsx`와 같은 Card 조립(유형 배지 + 제목 + 작성자)을 그대로
 * 재사용해 같은 시각 언어를 쓴다(AC1). 제안글은 `PollCountdown`을 더해 투표 상태·남은 시간을
 * 보여준다(AC3) — `PollPanel`이 쓰는 것과 같은 컴포넌트라 문구·서식이 갈라지지 않는다.
 *
 * **삭제됨(FR-052 E2)·다른 크루(FR-052 E1)**는 카드 대신 옅은 안내 문구만 보여주고 `Link`로
 * 감싸지 않는다 — 클릭해도 이동하지 않는다(FR-053 AC3). "다른 크루"는 제목조차 내려받지
 * 않으므로(`resolvePostLinkCard`가 `forbidden`만 반환) 정보 유출 여지가 구조적으로 없다.
 *
 * **이동은 `getPostDetailHref(crewId, postId)`로만 만든다(R-016)** — 경로 문자열을 어디에도
 * 저장하지 않고 항상 리소스 ID로부터 다시 계산한다. `Link`가 클라이언트 라우팅을 담당하므로
 * 전체 새로고침이 없고(FR-053 AC1), 네이티브 `<a>`라 키보드 포커스 후 Enter로도 동일하게
 * 동작한다(AC4, 별도 키보드 핸들러 불필요).
 */
export function PostLinkCard({ state }: { state: PostLinkCardViewModel }) {
  if (state.kind === "deleted") {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-dashed border-border bg-card px-3 py-2 text-sm text-muted-foreground">
        <Trash2Icon aria-hidden="true" className="size-4 shrink-0" />
        {strings.chat.postCard.deletedPost}
      </div>
    );
  }

  if (state.kind === "forbidden") {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-dashed border-border bg-card px-3 py-2 text-sm text-muted-foreground">
        <LockIcon aria-hidden="true" className="size-4 shrink-0" />
        {strings.chat.postCard.otherCrewPost}
      </div>
    );
  }

  return (
    <Link
      href={getPostDetailHref(state.crewId, state.postId)}
      className="block w-full max-w-72 rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50 @sm:max-w-80"
    >
      <Card size="sm" className="transition-colors hover:bg-muted/40">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-1.5">
            <PostTypeBadge type={state.postType} />
            {state.poll && <PollStatusBadge status={state.poll.status} />}
          </div>
          <CardTitle className="line-clamp-2">{state.title}</CardTitle>
          {state.poll && (
            <PollCountdown
              status={state.poll.status}
              closesAt={state.poll.closesAt}
              remainingMs={state.poll.remainingMs}
              isAwaitingClosure={state.poll.isAwaitingClosure}
            />
          )}
        </CardHeader>
        <CardFooter className="gap-2 text-xs text-muted-foreground">
          <Avatar size="sm">
            {state.authorAvatarUrl && <AvatarImage src={state.authorAvatarUrl} alt="" />}
            <AvatarFallback>{state.authorDisplayName.slice(0, 1)}</AvatarFallback>
          </Avatar>
          <span className="truncate">{state.authorDisplayName}</span>
        </CardFooter>
      </Card>
    </Link>
  );
}
