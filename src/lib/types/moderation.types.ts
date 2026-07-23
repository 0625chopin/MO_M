import type { Id, ISODateTimeString } from "./common.types";

/** FR-080 AC1의 신고 대상 4종. v0.2 대상 — 데이터 모델만 선반영. */
export type ReportTargetType = "post" | "comment" | "chat_message" | "profile";

/**
 * 값 집합은 FR-082 AC1("처리(삭제/기각/계정 제재)")에서 역산했다 — 실제로
 * 어떤 조치가 취해졌는지는 이 필드가 아니라 AuditLog.action에 남는다.
 */
export type ReportStatus = "pending" | "resolved" | "dismissed";

/** FR-080, v0.2 대상 — 데이터 모델만 선반영. */
export interface Report {
  id: Id;
  reporterId: Id;
  targetType: ReportTargetType;
  targetId: Id;
  reason: string;
  status: ReportStatus;
}

/** FR-081, v0.2 대상 — 데이터 모델만 선반영. */
export interface Block {
  blockerId: Id;
  blockedId: Id;
}

/**
 * 클라이언트 쓰기 불가 — 서버 로직 전용. NFR-015 대상 행위(권한 변경·강퇴·
 * 해산·투표 종료·게시물 강제 삭제)를 기록한다.
 */
export interface AuditLog {
  id: Id;
  actorId: Id;
  crewId: Id | null;
  action: string;
  targetId: Id;
  createdAt: ISODateTimeString;
}
