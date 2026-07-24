/**
 * 초대 응답(수락·거절) 가능 여부 판정 — 순수 함수 (NFR-036, R-015, Task 017B). FR-021 예외
 * 흐름 E1(만료된 초대)·E2(크루가 이미 해산)를 한 곳에 모은다 — `respond-to-invitation.ts`
 * (Server Action)와 받은 초대함 목록(각 카드의 수락·거절 버튼 활성화 판정)이 같은 기준을
 * 쓴다(`invite-eligibility.ts`·`join-request-eligibility.ts`와 같은 이유).
 *
 * **E3(초대가 철회됨)는 이 판정의 대상이 아니다** — 초대자 쪽 "초대 철회" 기능 자체가 아직
 * 없다(Task 017A가 만든 초대 발급·응답 경로에는 철회가 없다). 데이터가 없는 상태를 판정할 수는
 * 없으므로, 그 기능이 생기면 `InvitationStatus`에 값을 추가하고 이 함수도 함께 갱신한다.
 */
import type { Crew, Invitation, ISODateTimeString } from "@/lib/types";

export type InvitationResponseIneligibleReason = "already_responded" | "crew_unavailable" | "expired";

export type InvitationResponseEligibility =
  | { eligible: true }
  | { eligible: false; reason: InvitationResponseIneligibleReason };

export interface InvitationResponseEligibilityInput {
  invitation: Pick<Invitation, "status" | "expiresAt">;
  /** 초대를 보낸 크루. 조회 자체가 실패했으면(해산 후 완전 삭제 등) `null`. */
  crew: Pick<Crew, "status"> | null;
  nowIso: ISODateTimeString;
}

/** ISO 8601 문자열은 사전식 비교가 시각 순서와 일치한다(`Date` 객체를 만들지 않고 비교 가능). */
export function evaluateInvitationResponseEligibility(
  input: InvitationResponseEligibilityInput,
): InvitationResponseEligibility {
  const { invitation, crew, nowIso } = input;

  if (invitation.status !== "pending") {
    return { eligible: false, reason: "already_responded" };
  }
  if (!crew || crew.status !== "active") {
    return { eligible: false, reason: "crew_unavailable" };
  }
  if (invitation.expiresAt <= nowIso) {
    return { eligible: false, reason: "expired" };
  }
  return { eligible: true };
}
