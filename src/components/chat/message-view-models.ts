import type { PostLinkCardViewModel } from "@/components/chat/post-link-card-view-models";
import { resolvePostLinkCard } from "@/components/chat/resolve-post-link-card";
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
  /** `type === "post_link"`이고 `refPostId`가 있을 때만 값이 있다 — `toMessageViewModel`이
   *  `resolvePostLinkCard`(Task 020C, FR-052)로 조인해 채운다. `PostLinkCard`가 그대로 받는다. */
  postLinkCard: PostLinkCardViewModel | null;
  clientKey: string;
  createdAt: ISODateTimeString;
  deletedAt: ISODateTimeString | null;
}

/** FR-051 AC3 "최신 50건" — 초기 조회·이어 로드 양쪽이 공유하는 페이지 크기. */
export const MESSAGE_PAGE_SIZE = 50;

/**
 * 메시지 하나의 전송 상태(Task 020B, FR-051 정상 흐름 ③④·E1). 서버가 확정한 메시지는
 * 항상 `"sent"`다 — `MessageRoomContainer`가 `messages` 배열을 화면용으로 매핑할 때 부여한다.
 * `"pending"`·`"failed"`는 아직 서버 확인을 받지 못한 로컬 전용(낙관적) 항목에만 쓰인다.
 */
export type MessageDeliveryStatus = "sent" | "pending" | "failed";

/**
 * `MessageList`·`MessageBubble`이 실제로 받는 타임라인 항목 — `MessageViewModel`에
 * `deliveryStatus`만 얹는다. 서버 확정 메시지·로컬 낙관적 메시지를 같은 배열에 섞어 렌더하기
 * 위한 통합 모양이다(Task 020B).
 */
export interface ChatTimelineItem extends MessageViewModel {
  deliveryStatus: MessageDeliveryStatus;
}

export interface OptimisticMessageInput {
  clientKey: string;
  roomId: Id;
  senderId: Id;
  body: string;
  createdAt: ISODateTimeString;
}

/**
 * 낙관적 렌더(FR-051 정상 흐름 ③)용 임시 타임라인 항목을 만든다. 서버 확정 전이라 진짜 `id`가
 * 없으므로 `clientKey`를 그대로 `id`로 쓴다 — 재전송해도 같은 `clientKey`를 재사용하므로
 * `MessageList`의 React `key`가 안정적으로 유지된다(재전송 중 말풍선이 다시 마운트되지 않는다).
 * 본인 메시지에서만 만들어지고(`MessageBubble`은 `isOwn`일 때 발신자 이름·아바타를 그리지
 * 않는다) `senderDisplayName`·`senderAvatarUrl`은 화면에 실제로 나타나지 않는 자리표시자다.
 * `type`은 텍스트로 고정한다 — 게시글 공유 카드(FR-052)의 낙관적 렌더는 Task 020C 범위다.
 */
export function createOptimisticTimelineItem(input: OptimisticMessageInput): ChatTimelineItem {
  return {
    id: input.clientKey,
    roomId: input.roomId,
    senderId: input.senderId,
    senderDisplayName: "",
    senderAvatarUrl: null,
    type: "text",
    body: input.body,
    refPostId: null,
    postLinkCard: null,
    clientKey: input.clientKey,
    createdAt: input.createdAt,
    deletedAt: null,
    deliveryStatus: "pending",
  };
}

/**
 * `MessageListContainer`(초기 조회)·`send-chat-message.ts`·`load-earlier-messages.ts`(Server
 * Action) 세 곳이 공유하는 조인 로직. 한 곳에서만 바뀌면 되도록 여기 모아 둔다.
 *
 * `crewId`는 이 메시지가 속한 채팅방의 크루다(`ChatRoom.crewId`, 방 하나는 크루 하나에
 * 고정) — `type === "post_link"`일 때 `resolvePostLinkCard`(Task 020C, FR-052)가 "다른 크루
 * 게시글인가"를 판정하는 기준으로 쓴다. `Promise`를 반환하도록 바뀐 것은 이 조인이 추가된
 * Task 020C부터다 — 세 호출부 모두 이미 `Promise.all`/`map(async ...)` 안에서 부르고 있어
 * 호출 형태 자체는 바뀌지 않는다(`await`만 그대로 유효하다).
 */
export async function toMessageViewModel(
  message: ChatMessage,
  author: Pick<Profile, "displayName" | "avatarUrl"> | null,
  crewId: Id,
): Promise<MessageViewModel> {
  return {
    id: message.id,
    roomId: message.roomId,
    senderId: message.senderId,
    senderDisplayName: author?.displayName ?? strings.common.profile.unknownAuthor,
    senderAvatarUrl: author?.avatarUrl ?? null,
    type: message.type,
    body: message.body,
    refPostId: message.refPostId,
    postLinkCard:
      message.type === "post_link" && message.refPostId
        ? await resolvePostLinkCard(message.refPostId, crewId)
        : null,
    clientKey: message.clientKey,
    createdAt: message.createdAt,
    deletedAt: message.deletedAt,
  };
}
