import type { Id, ISODateTimeString } from "./common.types";

export type PollStatus =
  | "open"
  | "closed_passed"
  | "closed_rejected"
  | "closed_invalid"
  | "cancelled";

/** 종료된 투표의 판정 결과. PollStatus의 closed_* 3종과 1:1 대응(FR-043 AC3, D-035). */
export type PollOutcome = "passed" | "rejected" | "invalid";

export interface Poll {
  id: Id;
  postId: Id;
  opensAt: ISODateTimeString;
  closesAt: ISODateTimeString;
  status: PollStatus;
  /** 종료 주체(제안자/임원/오너의 profileId). 기한 도래로 자동 종료됐으면 null(D-035). */
  closedBy: Id | null;
  result: PollOutcome | null;
  /** 판정 완료 시각. FR-045 AC2의 "5초"는 이 시각이 t=0이다(D-024). */
  decidedAt: ISODateTimeString | null;
}

/**
 * D-025 — 배열 컬럼 `eligibleSnapshot`을 대체하는 조인 테이블. PK는
 * (pollId, profileId). 투표 생성 시각의 대상자 스냅샷을 고정한다(3.4절).
 */
export interface PollEligibleVoter {
  pollId: Id;
  profileId: Id;
  /** 종료 알림 발송 시각·재시도 횟수(D-015 강퇴자 제외 발송, NFR-029 재시도 3회). */
  notifiedAt: ISODateTimeString | null;
  notifyAttempts: number;
}

export type VoteChoice = "for" | "against" | "abstain";

export interface PollVote {
  pollId: Id;
  voterId: Id;
  choice: VoteChoice;
  votedAt: ISODateTimeString;
  /** 강퇴 시 무효화 플래그(D-003) — true면 정족수·판정 집계에서 제외한다. */
  invalidated: boolean;
}

// ---- 판정 결과 타입 (rules/의 정족수·투표 판정 순수 함수가 이 시그니처를 구현) ----

/**
 * 정족수 판정 입력. D-032 — required = ceil(eligibleVoterCount / 3), floor 아님.
 * eligibleVoterCount·votedCount는 호출부가 D-022("스냅샷 ∩ 현재 투표 가능자")로
 * 이미 걸러서 넣는다 — 이 타입 자체는 그 필터링을 강제하지 않는다.
 */
export interface QuorumCheckInput {
  eligibleVoterCount: number;
  votedCount: number;
}

export interface QuorumCheckResult {
  required: number;
  actual: number;
  met: boolean;
}

/**
 * 무효화되지 않은 표의 선택지별 집계. 기권은 정족수 분모에는 포함하되
 * 가결 판정(찬성 > 반대)에서는 제외한다(D-003).
 */
export interface PollTally {
  forCount: number;
  againstCount: number;
  abstainCount: number;
}

export interface PollDecisionInput {
  tally: PollTally;
  quorum: QuorumCheckResult;
}

/**
 * 최종 판정. 규칙(D-003): 정족수 미달 → invalid, 정족수 충족 + 동수 → rejected,
 * 정족수 충족 + 찬성 > 반대 → passed, 그 외(찬성 < 반대) → rejected.
 */
export interface PollDecisionResult {
  outcome: PollOutcome;
  quorum: QuorumCheckResult;
  tally: PollTally;
}
