import { AlertTriangleIcon, Loader2Icon } from "lucide-react";

import { formatMessageTime } from "@/components/chat/format-message-time";
import type { ChatTimelineItem } from "@/components/chat/message-view-models";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { strings } from "@/lib/strings";
import { cn } from "@/lib/utils";

export interface MessageBubbleProps {
  message: ChatTimelineItem;
  /** 뷰어 본인이 보낸 메시지인지 — 컨테이너가 `viewerProfileId === message.senderId`로 미리
   *  판정해 내려준다(D-030 ①, 표현 컴포넌트는 세션을 모른다). */
  isOwn: boolean;
  /** `message.deliveryStatus === "failed"`일 때만 쓰인다(FR-051 E1 "실패 표시 + 재전송 버튼"). */
  onRetry?: () => void;
}

/**
 * 채팅 말풍선 하나(FR-051). 순수 표현 컴포넌트 — `lib/data`·`lib/realtime`을 참조하지 않는다.
 * 본인 메시지는 오른쪽 정렬 + `--primary` 채움, 상대 메시지는 왼쪽 정렬 + 발신자 아바타·이름 +
 * `--muted` 채움으로 구분한다(색만으로 구분하지 않는다 — 정렬·아바타 유무 자체가 이미 구조적
 * 차이다, WCAG 1.4.1). 말풍선 모서리를 발신 방향 쪽만 살짝 좁혀(`rounded-br-sm`/`rounded-bl-sm`)
 * 꼬리 없는 말풍선에도 방향성을 준다.
 *
 * **낙관적 렌더·재전송(Task 020B, FR-051 정상 흐름 ③④·E1)**: `deliveryStatus`가 `"pending"`이면
 * 말풍선을 옅게 칠하고 타임스탬프 자리에 스피너를 보여준다(전송 중임을 색 하나로만 전달하지
 * 않는다 — 애니메이션 자체가 이미 구조적 신호). `"failed"`면 말풍선 아래에 경고 아이콘 + 문구 +
 * `onRetry`를 호출하는 재전송 버튼을 덧붙인다. `deliveryStatus`는 항상 본인 메시지에서만
 * `"pending"`/`"failed"`가 되므로(다른 사용자의 메시지는 서버가 확정한 뒤에만 이 화면에
 * 도착한다) 상대 메시지 쪽 분기는 신경 쓰지 않는다.
 */
export function MessageBubble({ message, isOwn, onRetry }: MessageBubbleProps) {
  if (message.deletedAt) {
    return (
      <div className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
        <p className="text-sm text-muted-foreground italic">{strings.chat.message.deleted}</p>
      </div>
    );
  }

  const isPending = message.deliveryStatus === "pending";
  const isFailed = message.deliveryStatus === "failed";

  return (
    <div
      className={cn(
        "flex flex-col gap-1 @sm:max-w-[75%]",
        isOwn ? "items-end self-end" : "items-start self-start",
      )}
    >
      <div className={cn("flex items-end gap-2", isOwn && "flex-row-reverse")}>
        {!isOwn && (
          <Avatar size="sm" className="mb-0.5 shrink-0">
            <AvatarImage src={message.senderAvatarUrl ?? undefined} alt="" />
            <AvatarFallback>{message.senderDisplayName.slice(0, 1)}</AvatarFallback>
          </Avatar>
        )}
        <div className={cn("flex min-w-0 flex-col gap-1", isOwn ? "items-end" : "items-start")}>
          {!isOwn && (
            <span className="px-0.5 text-xs text-muted-foreground">{message.senderDisplayName}</span>
          )}
          <div className={cn("flex items-end gap-1.5", isOwn && "flex-row-reverse")}>
            <MessageContent message={message} isOwn={isOwn} pending={isPending} />
            {isPending ? (
              <span
                className="mb-0.5 flex shrink-0 items-center gap-1 text-[11px] text-muted-foreground"
                role="status"
              >
                <Loader2Icon aria-hidden="true" className="size-3 animate-spin" />
                <span className="sr-only">{strings.chat.message.sending}</span>
              </span>
            ) : (
              <time
                className="tnum shrink-0 text-[11px] text-muted-foreground"
                dateTime={message.createdAt}
              >
                {formatMessageTime(message.createdAt)}
              </time>
            )}
          </div>
        </div>
      </div>
      {isFailed && (
        <div className="flex items-center gap-1.5 pr-1 text-xs text-destructive">
          <AlertTriangleIcon aria-hidden="true" className="size-3.5 shrink-0" />
          <span>{strings.chat.message.sendFailedInline}</span>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="font-medium underline underline-offset-2 hover:text-destructive/80"
            >
              {strings.chat.message.resend}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function MessageContent({
  message,
  isOwn,
  pending,
}: {
  message: ChatTimelineItem;
  isOwn: boolean;
  pending: boolean;
}) {
  if (message.type === "post_link") {
    // FR-052의 실제 카드(제목·작성자·유형·투표 상태)는 Task 020C(PostLinkCard) 몫이다 — 여기서는
    // 메시지 유형이 게시글 공유라는 것만 시각적으로 구분해 둔다.
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card px-3 py-2 text-sm text-muted-foreground">
        {strings.chat.postCard.linkedPost}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "min-w-0 rounded-2xl px-3 py-2 text-sm break-words whitespace-pre-wrap",
        isOwn
          ? "rounded-br-sm bg-primary text-primary-foreground"
          : "rounded-bl-sm bg-muted text-foreground",
        pending && "opacity-60",
      )}
    >
      {message.body}
    </div>
  );
}
