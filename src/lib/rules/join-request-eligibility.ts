/**
 * 가입 신청 가능 여부 판정 — 순수 함수 (NFR-036, R-015, Task 016B). FR-022 사전조건("크루가
 * public, 신청자가 비멤버")과 예외 흐름 E1(비공개 크루 차단)·E3(강퇴 이력 차단)를 한 곳에
 * 모은다 — `request-join-crew.ts`(Server Action)와 `join-request-button-state.ts`(버튼 상태
 * 기계) 둘 다 이 함수를 호출해 "신청 가능한가"를 같은 기준으로 판정한다(판정이 두 곳에
 * 따로 인라인되면 하나만 고쳤을 때 어긋난다).
 *
 * `checkPermission`(`permission.ts`)의 `crew:request_join` 행과는 역할이 다르다 — 그 행은
 * "역할(전역 role)이 신청이라는 행위 자체를 할 수 있는가"(guest 불가·이미 크루원이면 불가)만
 * 보고, 크루의 공개 범위나 이 신청자의 과거 이력은 보지 않는다(매트릭스 셀 자체가 이 크루
 * 컨텍스트를 모른다). 이 함수는 그 나머지 — FR-022의 크루별 조건 — 를 담당한다. 두 판정은
 * AND로 합쳐 쓴다.
 */

import type { CrewMembership, CrewVisibility } from "@/lib/types";

export type JoinRequestIneligibleReason =
  | "private_crew"
  | "already_member"
  | "already_pending"
  | "banned";

export type JoinRequestEligibility =
  | { eligible: true }
  | { eligible: false; reason: JoinRequestIneligibleReason };

export interface JoinRequestEligibilityInput {
  crewVisibility: CrewVisibility;
  /** 신청자의 현재 멤버십 레코드. 아직 어떤 관계도 없으면 `null`. */
  membership: Pick<CrewMembership, "status"> | null;
}

export function evaluateJoinRequestEligibility(
  input: JoinRequestEligibilityInput,
): JoinRequestEligibility {
  const { crewVisibility, membership } = input;

  // E1 — private 크루는 가입 신청 버튼 자체가 노출되지 않고 API도 403(D-007, FR-022 E1).
  if (crewVisibility !== "public") {
    return { eligible: false, reason: "private_crew" };
  }

  switch (membership?.status) {
    case "active":
      return { eligible: false, reason: "already_member" };
    case "invited":
    case "requested":
      // E2 — 이미 대기 중인 초대·신청이 있으면 중복 신청을 막는다.
      return { eligible: false, reason: "already_pending" };
    case "removed":
      // E3 — 과거 강퇴 이력은 재신청을 차단한다(해제는 오너 전용, FR-027 E3 — Task 017A 몫).
      return { eligible: false, reason: "banned" };
    case "declined":
    case "rejected":
    case "left":
    case undefined:
      // 초대 거절·과거 반려·자진 탈퇴·무관계는 전부 재신청 가능(FR-021 AC2 "영구 차단 아님"과
      // 같은 원칙 — FR-022는 강퇴만 명시적으로 차단한다).
      return { eligible: true };
  }
}
