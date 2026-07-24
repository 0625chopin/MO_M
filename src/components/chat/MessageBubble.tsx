import { formatMessageTime } from "@/components/chat/format-message-time";
import type { MessageViewModel } from "@/components/chat/message-view-models";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { strings } from "@/lib/strings";
import { cn } from "@/lib/utils";

export interface MessageBubbleProps {
  message: MessageViewModel;
  /** 뷰어 본인이 보낸 메시지인지 — 컨테이너가 `viewerProfileId === message.senderId`로 미리
   *  판정해 내려준다(D-030 ①, 표현 컴포넌트는 세션을 모른다). */
  isOwn: boolean;
}

/**
 * 채팅 말풍선 하나(FR-051). 순수 표현 컴포넌트 — `lib/data`·`lib/realtime`을 참조하지 않는다.
 * 본인 메시지는 오른쪽 정렬 + `--primary` 채움, 상대 메시지는 왼쪽 정렬 + 발신자 아바타·이름 +
 * `--muted` 채움으로 구분한다(색만으로 구분하지 않는다 — 정렬·아바타 유무 자체가 이미 구조적
 * 차이다, WCAG 1.4.1). 말풍선 모서리를 발신 방향 쪽만 살짝 좁혀(`rounded-br-sm`/`rounded-bl-sm`)
 * 꼬리 없는 말풍선에도 방향성을 준다.
 */
export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  if (message.deletedAt) {
    return (
      <div className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
        <p className="text-sm text-muted-foreground italic">{strings.chat.message.deleted}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-end gap-2 @sm:max-w-[75%]",
        isOwn ? "flex-row-reverse self-end" : "self-start",
      )}
    >
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
          <MessageContent message={message} isOwn={isOwn} />
          <time
            className="tnum shrink-0 text-[11px] text-muted-foreground"
            dateTime={message.createdAt}
          >
            {formatMessageTime(message.createdAt)}
          </time>
        </div>
      </div>
    </div>
  );
}

function MessageContent({ message, isOwn }: { message: MessageViewModel; isOwn: boolean }) {
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
      )}
    >
      {message.body}
    </div>
  );
}
