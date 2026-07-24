/**
 * 채팅 메시지 본문 검증 — 순수 함수 (NFR-036, R-015, Task 020A).
 *
 * FR-051 E4 "길이 초과(2000자) → 전송 차단"의 판정 로직. `Composer`(클라이언트, 즉시 피드백용)와
 * `sendChatMessageAction`(서버, 신뢰 경계 — 클라이언트 검증은 우회될 수 있다) 양쪽이 이 함수
 * 하나를 그대로 재사용한다 — 판정 로직을 화면이나 Server Action에 인라인하지 않는다(R-015).
 */

/** FR-051 E4 그대로의 값 — 요구사항 문서에 명시된 상한이라 잠정값이 아니다(I-033·I-034와 다르다). */
export const CHAT_MESSAGE_MAX_LENGTH = 2000;

export type ChatMessageViolation = "empty" | "too_long";

export interface ChatMessageCheckResult {
  valid: boolean;
  violations: ChatMessageViolation[];
}

/** 공백만 있는 메시지는 빈 메시지로 취급한다. */
export function validateChatMessageBody(body: string): ChatMessageCheckResult {
  const trimmed = body.trim();
  const violations: ChatMessageViolation[] = [];
  if (trimmed.length === 0) violations.push("empty");
  if (trimmed.length > CHAT_MESSAGE_MAX_LENGTH) violations.push("too_long");
  return { valid: violations.length === 0, violations };
}
