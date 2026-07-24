import { AlertTriangleIcon, Loader2Icon, SendIcon } from "lucide-react";

import type { MessageViewModel } from "@/components/chat/message-view-models";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { MessageListSkeleton } from "@/components/chat/MessageListSkeleton";
import type { RouteErrorKind } from "@/components/errors/route-error-kind";
import { RouteErrorBoundaryPreview } from "@/components/errors/RouteErrorBoundaryPreview";
import { PreviewFrame } from "@/components/sample/PreviewFrame";
import { ChatMessageListPreview } from "@/components/sample/sections/ChatMessageListPreview";
import { defineSection } from "@/components/sample/showcase-types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { strings } from "@/lib/strings";

/**
 * Task 020A — 채팅 MessageList/Bubble/Composer(FR-050·051). `MessageList`·`MessageBubble`은
 * 순수 표현 컴포넌트라 `lib/data`를 참조하지 않으므로 실제 컴포넌트를 그대로 렌더링한다(아래
 * 고정 데이터는 `MessageListContainer`가 만드는 조인 결과 모양을 손으로 채운 것이다, `board.tsx`
 * 와 같은 패턴). **`MessageList`는 `ChatMessageListPreview`(`/sample` 전용 클라이언트 래퍼)를
 * 거쳐 렌더한다** — `onLoadMore`가 필수 함수 prop인데 이 파일(서버 컴포넌트)은 클로저를 직접
 * 넘길 수 없다(RSC는 함수를 직렬화하지 않는다, `BoardErrorStatePreview.tsx`와 같은 이유—
 * DESIGN 020A 교차검증 BLOCKER 2로 드러나 고쳤다).
 *
 * **`Composer`만 예외** — 실제 `sendChatMessageAction` Server Action을 `useTransition`으로
 * 직접 호출해(`auth.tsx`의 `SignupForm` 등과 같은 이유, 실제 부작용이 있는 폼이라 그대로
 * 렌더링하지 않는다) 여기서 그대로 렌더링하면 쇼케이스를 둘러보다 실수로 제출해 공용 Mock
 * 스토어의 `room-1`에 실제 메시지가 쌓인다. 그래서 `Composer`는 같은 UI 원자·같은 문구를 쓰는
 * 정적 프리뷰만 둔다.
 *
 * "오류"는 두 층으로 나눠 등록한다(D-030 ③): **방 접근 자체의 거부**(`chat:send_message` 판정
 * 실패 — `MessageListContainer`가 던지고 `error.tsx`가 받는다, 게시판의 `board:read` 거부와
 * 같은 패턴) · **구독 중 발생하는 도메인 오류**(`MessageList`의 `connectionError` prop — 실시간
 * 연결이 끊긴 상태에서도 이미 불러온 메시지는 계속 보여준다).
 */

const VIEWER_PROFILE_ID = "profile-1";

const SAMPLE_MESSAGES: MessageViewModel[] = [
  {
    id: "sample-message-1",
    roomId: "room-1",
    senderId: "profile-2",
    senderDisplayName: "김유나",
    senderAvatarUrl: null,
    type: "text",
    body: "다들 코스 확인해주세요~",
    refPostId: null,
    clientKey: "sample-message-1",
    createdAt: "2026-07-20T09:05:00.000Z",
    deletedAt: null,
  },
  {
    id: "sample-message-2",
    roomId: "room-1",
    senderId: VIEWER_PROFILE_ID,
    senderDisplayName: "서지훈",
    senderAvatarUrl: null,
    type: "text",
    body: "넵! 확인했습니다. 이번 주도 화이팅이에요 🙌",
    refPostId: null,
    clientKey: "sample-message-2",
    createdAt: "2026-07-20T09:07:00.000Z",
    deletedAt: null,
  },
  {
    id: "sample-message-3",
    roomId: "room-1",
    senderId: "profile-2",
    senderDisplayName: "김유나",
    senderAvatarUrl: null,
    type: "post_link",
    body: null,
    refPostId: "post-2",
    clientKey: "sample-message-3",
    createdAt: "2026-07-22T10:01:00.000Z",
    deletedAt: null,
  },
  {
    id: "sample-message-4",
    roomId: "room-1",
    senderId: "profile-2",
    senderDisplayName: "김유나",
    senderAvatarUrl: null,
    type: "text",
    body: "(이 메시지는 삭제됐어요)",
    refPostId: null,
    clientKey: "sample-message-4",
    createdAt: "2026-07-22T10:03:00.000Z",
    deletedAt: "2026-07-22T10:04:00.000Z",
  },
];

const DOMAIN_ERROR_ITEMS: Array<{ kind: RouteErrorKind; name: string; note: string }> = [
  {
    kind: "forbidden",
    name: "채팅방 접근 권한 없음 (RLS 403)",
    note: "chat:send_message 판정 거부 — 비소속 크루의 채팅방에 접근하면 이 화면이 뜬다(lib/rules/permission.ts, MessageListContainer가 던지고 error.tsx가 받는다). FR-050 AC3(탈퇴한 사용자 403)도 같은 경로다.",
  },
];

export const chatSection = defineSection({
  id: "chat",
  label: "채팅",
  title: "채팅 — MessageList · MessageBubble · Composer",
  description:
    "FR-050·051. 최신 50건 + 위로 이어 로드(윈도잉, D-023)와 lib/realtime 구독(Task 008)을 소비하는 첫 화면입니다. 낙관적 렌더·재전송·ConnectionBanner는 Task 020B, 게시글 공유 카드(PostLinkCard)는 Task 020C 몫이라 여기서는 자리표시자만 보여줍니다.",
  items: [
    {
      name: "메시지 목록 (MessageList)",
      note: "0건이면 빈 상태로 전환된다(FR-050 AC1). '오류'는 구독 자체의 실패(D-030 ③) — 이미 불러온 메시지는 유지한 채 배너만 뜬다.",
      panels: {
        default: (
          <PreviewFrame height={440}>
            <div className="flex h-full flex-col">
              <ChatMessageListPreview
                messages={SAMPLE_MESSAGES}
                viewerProfileId={VIEWER_PROFILE_ID}
                hasMore
              />
            </div>
          </PreviewFrame>
        ),
        loading: (
          <PreviewFrame height={360}>
            <div className="flex h-full flex-col">
              <MessageListSkeleton rows={5} />
            </div>
          </PreviewFrame>
        ),
        empty: (
          <PreviewFrame height={220}>
            <div className="flex h-full flex-col">
              <ChatMessageListPreview messages={[]} viewerProfileId={VIEWER_PROFILE_ID} />
            </div>
          </PreviewFrame>
        ),
        error: (
          <PreviewFrame height={440}>
            <div className="flex h-full flex-col">
              <ChatMessageListPreview
                messages={SAMPLE_MESSAGES}
                viewerProfileId={VIEWER_PROFILE_ID}
                connectionError={strings.chat.room.connectionErrorDescription}
              />
            </div>
          </PreviewFrame>
        ),
      },
    },
    ...DOMAIN_ERROR_ITEMS.map(({ kind, name, note }) => ({
      name,
      note,
      panels: {
        error: (
          <PreviewFrame height={280}>
            <RouteErrorBoundaryPreview kind={kind} />
          </PreviewFrame>
        ),
      },
    })),
    {
      name: "말풍선 변형 (MessageBubble)",
      note: "본인/상대 · 텍스트/게시글 공유(자리표시자, Task 020C 예정) · 삭제된 메시지 4가지 모양.",
      content: (
        <PreviewFrame height={320}>
          <div className="flex flex-col gap-3 p-4">
            <MessageBubble message={SAMPLE_MESSAGES[1]} isOwn />
            <MessageBubble message={SAMPLE_MESSAGES[0]} isOwn={false} />
            <MessageBubble message={SAMPLE_MESSAGES[2]} isOwn={false} />
            <MessageBubble message={SAMPLE_MESSAGES[3]} isOwn={false} />
          </div>
        </PreviewFrame>
      ),
    },
    {
      name: "입력창 (Composer)",
      note: "실제 컴포넌트는 sendChatMessageAction Server Action에 물려 있어(auth.tsx의 SignupForm과 같은 이유) 여기서는 같은 UI 원자로 만든 정적 프리뷰만 둡니다 — 실제 전송은 /crews/[crewId]/chat에서 확인하세요.",
      panels: {
        default: (
          <PreviewFrame height={120}>
            <div className="flex items-end gap-2 border-t border-border p-3">
              <Textarea placeholder={strings.chat.message.inputPlaceholder} rows={1} className="max-h-40" />
              <Button size="icon" aria-label={strings.chat.message.send}>
                <SendIcon aria-hidden="true" />
              </Button>
            </div>
          </PreviewFrame>
        ),
        loading: (
          <PreviewFrame height={120}>
            <div className="flex items-end gap-2 border-t border-border p-3">
              <Textarea
                placeholder={strings.chat.message.inputPlaceholder}
                rows={1}
                disabled
                className="max-h-40"
              />
              <Button size="icon" disabled aria-label={strings.chat.message.send}>
                <Loader2Icon aria-hidden="true" className="animate-spin" />
              </Button>
            </div>
          </PreviewFrame>
        ),
        error: (
          <PreviewFrame height={160}>
            <div className="flex flex-col gap-2 border-t border-border p-3">
              <Alert variant="destructive">
                <AlertTriangleIcon aria-hidden="true" />
                <AlertDescription>{strings.chat.message.errors.sendFailed}</AlertDescription>
              </Alert>
              <div className="flex items-end gap-2">
                <Textarea placeholder={strings.chat.message.inputPlaceholder} rows={1} className="max-h-40" />
                <Button size="icon" aria-label={strings.chat.message.send}>
                  <SendIcon aria-hidden="true" />
                </Button>
              </div>
            </div>
          </PreviewFrame>
        ),
      },
    },
  ],
});
