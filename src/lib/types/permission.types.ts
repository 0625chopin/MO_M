import type { CrewVisibility } from "./crew.types";

/**
 * 3.1절 전역 역할. `CrewMembershipRole`(owner/staff/member, crew.types.ts)과
 * 달리 크루 컨텍스트에 role을 투영한 파생값이며 저장되는 컬럼이 아니다 —
 * 권한 판정 순수 함수(`lib/rules/`, NFR-036)의 입력으로만 쓰인다.
 */
export type UserRole =
  | "guest"
  | "member"
  | "crew_member"
  | "crew_staff"
  | "crew_owner"
  | "system_admin";

/**
 * 3.3절 권한 매트릭스의 행(●/○/− 판정 대상) 중 **크루 컨텍스트에서 판정 가능한
 * 행위만** 포함한다. 회원가입(FR-001)·로그인/로그아웃(FR-002) 두 행은 이 매트릭스에
 * 있지만 제외했다 — 크루 스코프 role이 아니라 세션·라우트 경계이며, `proxy.ts`가 아닌
 * 레이아웃에서 처리한다(D-030 ④). 2일차 교차검증(CREW)에서 "크루 검색·목록 열람"
 * (FR-014)·"크루 상세(공개 정보) 열람"(FR-011) 두 행이 누락되어 `crewVisibility`
 * 컨텍스트 필드가 참조되지 않는 문제가 지적됐고, 재검토 중 "초대 수락·거절"(FR-021)·
 * "가입 신청"(FR-022) 두 행도 같은 방식으로 누락된 것을 추가로 발견해 함께 채웠다 —
 * 아래 목록은 회원가입·로그인 두 행을 제외한 33개 행 전부와 1:1 대응한다.
 */
export type PermissionAction =
  | "crew:create"
  | "crew:browse"
  | "crew:read"
  | "crew:update_info"
  | "crew:update_visibility"
  | "crew:disband"
  | "crew:invite_member"
  | "invitation:respond"
  | "crew:request_join"
  | "crew:approve_join_request"
  | "crew:appoint_staff"
  | "crew:transfer_ownership"
  | "crew:leave"
  | "crew:remove_member"
  | "board:read"
  | "post:create"
  | "post:update_own"
  | "post:delete_own"
  | "post:delete_any"
  | "comment:create"
  | "poll:create_proposal"
  | "poll:vote"
  | "poll:close_early"
  | "chat:send_message"
  | "chat:delete_own_message"
  | "chat:delete_any_message"
  | "calendar:view"
  | "meetup:cancel_or_update"
  | "report:create"
  | "report:handle"
  | "block:create"
  | "profile:update_own"
  | "profile:withdraw"
  | "search:by_handle";

/**
 * 3.3절 각주 ¹~⁵의 조건부 허용(○)을 표현하는 컨텍스트. 필요한 필드만
 * 채우면 되며, 판정 함수는 action에 따라 관련 필드만 본다.
 */
export interface PermissionCheckContext {
  /** ¹ 본인 여부(자기 프로필 수정, 자기 게시글 수정·삭제 등). */
  isSelf?: boolean;
  /** ⁵ 제안 작성자 본인(투표 조기 종료, Meetup 취소·변경). */
  isProposalAuthor?: boolean;
  /** ² 오너의 크루 탈퇴·회원 탈퇴 전제조건 — 오너 이양 또는 크루 해산이 이미 처리됐는지. */
  hasOwnerSuccessorOrDisband?: boolean;
  /** ⁴ 강퇴 대상의 role — 임원은 일반 크루원만 강퇴할 수 있다(오너·임원 강퇴는 오너 전용). */
  targetRole?: UserRole;
  /**
   * ³ 대상 크루의 공개 범위 — public이면 비회원도 검색·소개 열람 가능(D-007).
   * `crew:browse`(FR-014)·`crew:read`(FR-011) 두 액션이 이 필드를 본다.
   */
  crewVisibility?: CrewVisibility;
}

export interface PermissionCheckInput {
  role: UserRole;
  action: PermissionAction;
  context?: PermissionCheckContext;
}

export interface PermissionCheckResult {
  allowed: boolean;
  /** 거부 사유 코드 — 로깅/토스트 문구 선택에 쓴다. 노출 문자열 자체는 lib/strings에 둔다. */
  reason?: string;
}
