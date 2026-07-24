import { strings } from "@/lib/strings";
import type { ChatMessage, ChatMessageType, Id, ISODateTimeString, Profile } from "@/lib/types";

/**
 * 표현 컴포넌트(`MessageBubble.tsx`·`MessageList.tsx`)가 받는 메시지 모양. `ChatMessage`와
 * `Profile`(발신자)을 컨테이너·Server Action이 이미 조인해 이 평평한(flat) 구조로 내려준다 —
 * `BoardPostSummary`(`components/board/board-view-models.ts`)와 같은 패턴이다. 전부 직렬화
 * 가능한 원시값이다(NFR-037) — 이 값은 `RealtimeEvent.payload`(Broadcast)로도 그대로 실려
 * 나가야 하므로 클래스 인스턴스·함수를 담지 않는다.
 */
export interface MessageViewModel {
  id: Id;
  roomId: Id;
  senderId: Id;
  senderDisplayName: string;
  senderAvatarUrl: string | null;
  type: ChatMessageType;
  body: string | null;
  refPostId: Id | null;
  clientKey: string;
  createdAt: ISODateTimeString;
  deletedAt: ISODateTimeString | null;
}

/** FR-051 AC3 "최신 50건" — 초기 조회·이어 로드 양쪽이 공유하는 페이지 크기. */
export const MESSAGE_PAGE_SIZE = 50;

/**
 * `MessageListContainer`(초기 조회)·`send-chat-message.ts`·`load-earlier-messages.ts`(Server
 * Action) 세 곳이 공유하는 조인 로직. 한 곳에서만 바뀌면 되도록 여기 모아 둔다.
 */
export function toMessageViewModel(
  message: ChatMessage,
  author: Pick<Profile, "displayName" | "avatarUrl"> | null,
): MessageViewModel {
  return {
    id: message.id,
    roomId: message.roomId,
    senderId: message.senderId,
    senderDisplayName: author?.displayName ?? strings.common.profile.unknownAuthor,
    senderAvatarUrl: author?.avatarUrl ?? null,
    type: message.type,
    body: message.body,
    refPostId: message.refPostId,
    clientKey: message.clientKey,
    createdAt: message.createdAt,
    deletedAt: message.deletedAt,
  };
}
