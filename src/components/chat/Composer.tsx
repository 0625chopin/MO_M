"use client";

import { AlertTriangleIcon, SendIcon } from "lucide-react";
import { useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CHAT_MESSAGE_MAX_LENGTH, validateChatMessageBody } from "@/lib/rules/chat-message-validation";
import { strings, t } from "@/lib/strings";

import type { FormEvent } from "react";

export interface ComposerProps {
  /** `chat:send_message` 판정 결과 — 컨테이너가 이미 계산해 내려준다(D-030 ①). 지금은 항상
   *  true다(컨테이너가 이 판정으로 방 접근 자체를 게이트하므로 거부되면 이 컴포넌트까지
   *  도달하지 않는다) — 그래도 읽기 전용 뷰어가 생길 미래를 대비해 prop을 남겨 둔다. */
  canSend: boolean;
  /** 클라이언트 검증(E4)을 통과한 본문을 그대로 올려보낸다 — `clientKey` 채번, Server Action
   *  호출, 낙관적 렌더·재전송·실패 처리는 전부 `MessageRoomContainer`(부모)가 소유한다(Task
   *  020B, 아래 모듈 docstring 참고). */
  onSubmit: (body: string) => void;
}

/**
 * 메시지 입력 폼(FR-051 정상 흐름 ①②, E4). **전송 소유권을 Task 020A에서 020B로 넘기며
 * `MessageRoomContainer`로 옮겼다** — 재전송(FR-051 E1)이 이 입력창이 아니라 실패한 메시지
 * 말풍선(`MessageBubble`)에서 트리거되므로, "같은 본문을 같은 방식으로 다시 보낸다"는 로직을
 * 두 곳(Composer·MessageBubble)이 각자 구현하지 않으려면 공유 지점이 필요했고, 그 자리는
 * 컨테이너가 맞다(구독도 이미 거기서 소유한다, D-030 ①). 그래서 이 컴포넌트는 이제
 * `sendChatMessageAction`을 직접 호출하지 않는다 — 클라이언트 측 즉시 검증(E4)만 하고,
 * 통과하면 `onSubmit(body)`를 부른 뒤 **결과를 기다리지 않고 그 자리에서 입력창을 비운다**
 * (낙관적 렌더 — 실제 채팅 앱의 통상 UX와 같다. 메시지는 목록에 "전송 중" 상태로 바로
 * 나타나고, 실패하면 그 말풍선 자리에 재전송 버튼이 뜬다).
 *
 * **`useTransition`을 쓰지 않는다** — 이 컴포넌트 안에는 더 이상 기다릴 비동기 작업이 없다
 * (전송 자체가 낙관적이라 서버 응답을 기다리지 않는다). `docs/CONVENTIONS.md` "Server Action
 * 폼 상태 관리" 절의 두 갈래(리다이렉트 폼 → `useActionState` / 같은 화면에 남는 폼 →
 * `useTransition`+수동 상태) 중 어느 쪽도 이 컴포넌트에는 해당하지 않는다 — Server Action을
 * 직접 호출하는 쪽이 아니기 때문이다. 그 절이 요구하는 처리(성공/실패를 이벤트 핸들러의
 * 비동기 콜백 안에서 다루고 `useEffect`로 지켜보지 않는 것)는 지금 이 로직을 실제로 수행하는
 * `MessageRoomContainer.submitMessage`가 그대로 따른다.
 */
export function Composer({ canSend, onSubmit }: ComposerProps) {
  const [body, setBody] = useState("");
  const [formError, setFormError] = useState<string | undefined>();

  if (!canSend) return null;

  const isOverLimit = body.length > CHAT_MESSAGE_MAX_LENGTH;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validation = validateChatMessageBody(body);
    if (!validation.valid) {
      setFormError(
        validation.violations.includes("too_long")
          ? t((s) => s.chat.message.errors.tooLong, { max: CHAT_MESSAGE_MAX_LENGTH })
          : strings.chat.message.errors.empty,
      );
      return;
    }
    setFormError(undefined);
    onSubmit(body.trim());
    setBody("");
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 border-t border-border p-3">
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
          aria-invalid={isOverLimit}
          className="max-h-40"
        />
        <Button
          type="submit"
          size="icon"
          disabled={body.trim().length === 0 || isOverLimit}
          aria-label={strings.chat.message.send}
        >
          <SendIcon aria-hidden="true" />
        </Button>
      </div>
    </form>
  );
}
