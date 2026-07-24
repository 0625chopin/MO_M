/**
 * 크루 홈의 "가입 신청 버튼 상태 기계" — 순수 함수 (NFR-036, R-015, Task 016B, ROADMAP
 * "가입 신청 버튼 상태 기계 4.5인일"). `CrewHomeContainer`가 세션·크루 공개 범위·멤버십을
 * 조합해 호출하고, `JoinRequestButton`(표현 컴포넌트)은 이 결과의 `kind`만 보고 렌더한다 —
 * 판정을 컴포넌트에 인라인하지 않는다(R-015).
 *
 * `evaluateJoinRequestEligibility`(같은 디렉터리)를 재사용해 "신청 가능한가"의 세부 사유를
 * 다시 만들지 않는다 — 이 함수는 그 위에 "로그인 여부"·"이미 크루원인가"·"초대받은 상태인가"
 * 같은 **버튼 자체의 존재 여부**를 얹는다. 두 함수가 겹치는 것처럼 보일 수 있는 지점(공개
 * 범위·상태별 분기)은 의도적이다 — 이 함수는 UI 상태(버튼이 뭘로 보이는가), 그 함수는 API
 * 게이트(요청이 통과하는가)로 관심사가 다르다(`request-join-crew.ts`가 두 판정을 각각
 * 독립적으로 다시 호출해 서버에서도 신뢰한다 — 클라이언트 상태를 그대로 믿지 않는다).
 */

import { isActiveMembership } from "@/lib/rules/crew-membership-transition";
import { evaluateJoinRequestEligibility } from "@/lib/rules/join-request-eligibility";
import type { CrewMembership, CrewVisibility } from "@/lib/types";

export type JoinRequestButtonState =
  /** 이미 활성 크루원(member/staff/owner 무관) — 가입 관련 버튼 자체가 필요 없다. */
  | { kind: "member" }
  /** private 크루의 비소속자 — 버튼 없음, 이름 + "초대 전용" 안내만(D-007, FR-012 AC2). */
  | { kind: "private_locked" }
  /** public 크루를 보는 비로그인 방문자 — "가입하고 참여하기" → 로그인 유도(FR-012 AC3). */
  | { kind: "guest_prompt" }
  /** 이미 초대를 받은 상태 — 응답은 초대함(FR-021)에서 하므로 여기선 안내만. */
  | { kind: "invited" }
  /** 가입 신청 대기 중 — "신청 대기 중 · 철회"(FR-022 AC3). */
  | { kind: "pending" }
  /** 과거 강퇴 이력으로 재신청 차단(FR-022 E3). */
  | { kind: "blocked" }
  /** 신청 가능. */
  | { kind: "requestable" };

export interface JoinRequestButtonStateInput {
  isAuthenticated: boolean;
  crewVisibility: CrewVisibility;
  /** 로그인하지 않았으면 조회 자체가 의미 없으므로 항상 `null`을 넘긴다. */
  membership: Pick<CrewMembership, "status"> | null;
}

export function resolveJoinRequestButtonState(
  input: JoinRequestButtonStateInput,
): JoinRequestButtonState {
  const { isAuthenticated, crewVisibility, membership } = input;

  if (membership && isActiveMembership(membership.status)) {
    return { kind: "member" };
  }
  if (crewVisibility === "private") {
    return { kind: "private_locked" };
  }
  if (!isAuthenticated) {
    return { kind: "guest_prompt" };
  }
  if (membership?.status === "invited") {
    return { kind: "invited" };
  }

  const eligibility = evaluateJoinRequestEligibility({ crewVisibility, membership });
  if (eligibility.eligible) {
    return { kind: "requestable" };
  }
  if (eligibility.reason === "already_pending") {
    return { kind: "pending" };
  }
  // "private_crew"·"already_member"는 위 두 분기에서 이미 걸러졌다 — 여기 남는 것은
  // "banned"뿐이다. 만약 그 가정이 깨지면(이 함수와 evaluateJoinRequestEligibility의 판정이
  // 서로 어긋나면) 안전한 쪽(막힘)으로 떨어뜨린다 — 신청 버튼을 잘못 노출하는 것보다는 낫다.
  return { kind: "blocked" };
}
