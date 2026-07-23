/**
 * 크루 멤버십 상태 전이 순수 함수 — Task 009B (NFR-036, R-015).
 *
 * `docs/requirements/requirements.md` 2.4절 "Crew 멤버십 상태" 다이어그램을
 * 그대로 옮긴다. 다이어그램의 각 화살표가 `TRANSITIONS`의 한 항목과 1:1
 * 대응하므로, 다이어그램이 바뀌면 이 표만 고치면 된다(그 외 로직은 표를
 * 읽기만 한다).
 *
 * ```
 * [*] --> invited   : 오너/임원이 초대 (FR-020)
 * [*] --> requested : 사용자가 가입 신청 (FR-022)
 * invited --> active   : 사용자 수락 (FR-021)
 * invited --> declined : 사용자 거절 (FR-021)
 * requested --> active   : 오너/임원 승인 (FR-023)
 * requested --> rejected : 오너/임원 반려 (FR-023)
 * active --> left    : 본인 탈퇴 (FR-026)
 * active --> removed : 강퇴 (FR-027)
 * declined/rejected/left/removed --> [*] (종결 상태, 이후 전이 없음)
 * ```
 *
 * React·Next·데이터 레이어를 import하지 않는다(zone 1). 실제 멤버십 레코드
 * 조회·갱신은 이 함수의 몫이 아니다 — 호출자(Server Action)가 현재 상태를
 * 인자로 넘기고, 반환된 다음 상태를 저장하는 것도 호출자 책임이다.
 */

import type { CrewMembership, CrewMembershipRole, CrewMembershipStatus, UserRole } from "@/lib/types";

/**
 * 2.4절 다이어그램의 화살표(엣지) 이름. `invite`·`request`는 상태가 없는
 * [*]에서 시작하므로 {@link createCrewMembershipStatus}가 별도로 다룬다.
 */
export type CrewMembershipEvent =
  | "accept_invitation"
  | "decline_invitation"
  | "approve_request"
  | "reject_request"
  | "leave"
  | "remove";

/**
 * 상태별 허용 이벤트 → 다음 상태. 값이 없는 이벤트(예: `declined`에서
 * `leave`)는 다이어그램에 화살표가 없다는 뜻 — 정의되지 않은 조합은 전부
 * 여기서 `undefined`가 되고, {@link transitionCrewMembershipStatus}가 이를
 * `null`(불허 전이)로 변환한다.
 *
 * `Record<CrewMembershipStatus, ...>` 타입이 7개 상태를 전부 요구하므로
 * 다이어그램의 상태 하나를 빠뜨리면 컴파일 에러가 난다.
 */
const TRANSITIONS: Record<CrewMembershipStatus, Partial<Record<CrewMembershipEvent, CrewMembershipStatus>>> = {
  invited: {
    accept_invitation: "active",
    decline_invitation: "declined",
  },
  requested: {
    approve_request: "active",
    reject_request: "rejected",
  },
  active: {
    leave: "left",
    remove: "removed",
  },
  // 종결 상태 — 2.4절 다이어그램에서 모두 `--> [*]`로만 끝나고 나가는
  // 화살표가 없다. 빈 객체 자체가 "여기서는 어떤 이벤트도 허용되지 않는다"는
  // 뜻이라 별도 처리 없이 TRANSITIONS[status][event] 조회가 자연히 실패한다.
  declined: {},
  rejected: {},
  left: {},
  removed: {},
};

/**
 * 2.4절의 `[*] --> invited`(FR-020 초대) / `[*] --> requested`(FR-022 가입
 * 신청) — 아직 멤버십 레코드가 없는 최초 생성 시점의 상태를 정한다.
 */
export function createCrewMembershipStatus(origin: "invite" | "request"): CrewMembershipStatus {
  return origin === "invite" ? "invited" : "requested";
}

/**
 * 현재 상태에서 이벤트가 발생했을 때의 다음 상태. 다이어그램에 없는
 * (state, event) 조합이면 `null`(전이 불허)을 반환한다 — 예외를 던지지
 * 않는다. 호출자가 UI 에러 상태(D-030 ③ "도메인 오류")로 다루기 쉽도록
 * 값으로 실패를 표현한다.
 */
export function transitionCrewMembershipStatus(
  current: CrewMembershipStatus,
  event: CrewMembershipEvent,
): CrewMembershipStatus | null {
  return TRANSITIONS[current][event] ?? null;
}

/** 현재 상태에서 해당 이벤트가 다이어그램상 허용되는지만 확인한다(부작용 없음). */
export function canTransitionCrewMembership(
  current: CrewMembershipStatus,
  event: CrewMembershipEvent,
): boolean {
  return transitionCrewMembershipStatus(current, event) !== null;
}

/**
 * 종결 상태 — 2.4절 다이어그램에서 `--> [*]`로 끝나는 4개 상태
 * (`declined`·`rejected`·`left`·`removed`). `active`는 종결이 아니다(그 자체가
 * 계속 유지되는 정상 상태이지 최종 도착점이 아니다).
 */
export function isTerminalMembershipStatus(status: CrewMembershipStatus): boolean {
  return Object.keys(TRANSITIONS[status]).length === 0;
}

/** 크루 컨텍스트 권한 판정(`permission.ts`)이 "소속 중"으로 취급할 상태인지. */
export function isActiveMembership(status: CrewMembershipStatus): boolean {
  return status === "active";
}

/**
 * `CrewMembership.role`(크루별 role: owner/staff/member)과 상태를 3.1절
 * 전역 `UserRole`(권한 판정 입력)로 투영한다. `permission.types.ts`가 명시하듯
 * `UserRole`은 저장 컬럼이 아니라 판정 시점의 파생값이므로, 이 변환을
 * 호출부(컨테이너·Server Action)마다 따로 구현하면 판정이 화면에 흩어지는
 * R-015 신호가 된다 — 여기 한 곳에 모아 둔다.
 *
 * `status !== "active"`이면(예: `invited`·`left`·`removed`) 그 크루에 대해서는
 * 아직/더 이상 소속이 아니므로 가장 낮은 전역 역할인 `"member"`로 취급한다.
 * 실제로 `"member"`조차 아닌 `"guest"`인지는 이 함수가 알 수 없다 — 로그인
 * 여부는 세션·레이아웃 경계(D-030 ④)의 몫이라 호출자가 별도로 판단해야 한다.
 */
export function deriveUserRoleForPermissionCheck(
  membership: Pick<CrewMembership, "role" | "status"> | null,
): UserRole {
  if (!membership || !isActiveMembership(membership.status)) {
    return "member";
  }
  return membershipRoleToUserRole(membership.role);
}

function membershipRoleToUserRole(role: CrewMembershipRole): UserRole {
  switch (role) {
    case "owner":
      return "crew_owner";
    case "staff":
      return "crew_staff";
    case "member":
      return "crew_member";
  }
}
