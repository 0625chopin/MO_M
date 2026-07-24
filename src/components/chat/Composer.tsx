"use client";

import { AlertTriangleIcon, Loader2Icon, SendIcon } from "lucide-react";
import { useState, useTransition } from "react";

import type { MessageViewModel } from "@/components/chat/message-view-models";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { sendChatMessageAction } from "@/lib/actions/send-chat-message";
import { CHAT_MESSAGE_MAX_LENGTH } from "@/lib/rules/chat-message-validation";
import { strings } from "@/lib/strings";
import type { Id } from "@/lib/types";

export interface ComposerProps {
  crewId: Id;
  roomId: Id;
  /** `chat:send_message` 판정 결과 — 컨테이너가 이미 계산해 내려준다(D-030 ①). 지금은 항상
   *  true다(컨테이너가 이 판정으로 방 접근 자체를 게이트하므로 거부되면 이 컴포넌트까지
   *  도달하지 않는다) — 그래도 읽기 전용 뷰어가 생길 미래를 대비해 prop을 남겨 둔다. */
  canSend: boolean;
  /** 전송 성공 시 저장된 메시지를 그대로 올려보낸다 — `MessageRoomContainer`(부모, `*Container.tsx`)
   *  가 이 값을 받아 `lib/realtime`으로 발행한다. `Composer` 자신은 `@/lib/realtime`을 import하지
   *  않는다 — 표현 컴포넌트 zone(ESLint zone 4)이 그 배럴을 막기도 하고(`*Container.tsx`만 허용,
   *  D-030 ①②), 발행 책임을 구독을 실제로 소유한 컨테이너 한 곳에 모아 두는 편이 맞다. */
  onSent?: (message: MessageViewModel) => void;
}

/**
 * 메시지 입력 폼(FR-051 정상 흐름 ①②, E4). `sendChatMessageAction` Server Action을 직접 호출하는
 * 얇은 클라이언트 경계다 — `LoginForm`과 같은 패턴(표현 컴포넌트지만 `lib/actions`는 zone 4가
 * 막지 않는다). 낙관적 렌더·재전송(FR-051 정상 흐름 ③④, E1)은 Task 020B 몫이다 — 이 폼은
 * 전송 결과(저장된 메시지)를 `onSent`로 부모(`MessageRoomContainer`)에 올려보내기만 하고
 * **목록에 직접 append하지 않는다.** 실제 화면 반영은 부모가 `lib/realtime`으로 발행한 이벤트를
 * 자기 구독으로 되받는 경로 하나로 통일된다(다른 사용자의 메시지가 도착하는 경로와 동일) —
 * 이유는 `sendChatMessageAction` 모듈 docstring의 "왜 여기서 발행하지 않는가" 참고.
 *
 * **`useActionState`가 아니라 `useTransition` + 수동 상태를 쓴다** — 처음에는 `useActionState`로
 * 짰지만, "성공하면 입력창을 비운다"를 `state` 변화를 지켜보는 `useEffect`로 구현하면
 * `react-hooks/set-state-in-effect` 린트 오류가 난다(effect 안에서 동기적으로 setState하는
 * 패턴은 React가 명시적으로 비권장한다 — 대신 이벤트 핸들러/그 안의 비동기 콜백에서 하라고
 * 안내한다). 전송 결과를 아는 시점이 바로 그 이벤트 핸들러 안이므로, `startTransition`의
 * 비동기 콜백에서 결과를 받은 즉시 처리한다(D-029 렌더링 전략과도 맞는다). 이 갈림의 일반
 * 기준은 `docs/CONVENTIONS.md` "Server Action 폼 상태 관리" 절 참고 — 성공 시 리다이렉트하는
 * 폼은 `useActionState`(예: `LoginForm`), 성공 후 같은 화면에 남아 입력만 비우는 폼은
 * `useTransition` + 수동 상태(이 컴포넌트)다.
 */
export function Composer({ crewId, roomId, canSend, onSent }: ComposerProps) {
  const [body, setBody] = useState("");
  const [formError, setFormError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  if (!canSend) return null;

  const isOverLimit = body.length > CHAT_MESSAGE_MAX_LENGTH;

  const handleSubmit = (formData: FormData) => {
    formData.set("crewId", crewId);
    formData.set("roomId", roomId);
    formData.set("body", body);
    formData.set("clientKey", crypto.randomUUID());

    startTransition(async () => {
      const result = await sendChatMessageAction({}, formData);
      if (result.formError) {
        setFormError(result.formError);
        return;
      }
      setFormError(undefined);
      setBody("");
      if (result.message) onSent?.(result.message);
    });
  };

  return (
    <form action={handleSubmit} className="flex flex-col gap-2 border-t border-border p-3">
      {formError && (
        <Alert variant="destructive">
          <AlertTriangleIcon aria-hidden="true" />
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}
      <div className="flex items-end gap-2">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={strings.chat.message.inputPlaceholder}
          aria-label={strings.chat.message.inputPlaceholder}
          rows={1}
          maxLength={CHAT_MESSAGE_MAX_LENGTH}
          disabled={isPending}
          aria-invalid={isOverLimit}
          className="max-h-40"
        />
        <Button
          type="submit"
          size="icon"
          disabled={isPending || body.trim().length === 0 || isOverLimit}
          aria-label={strings.chat.message.send}
        >
          {isPending ? (
            <Loader2Icon aria-hidden="true" className="animate-spin" />
          ) : (
            <SendIcon aria-hidden="true" />
          )}
        </Button>
      </div>
    </form>
  );
}
