import type { Id, ISODateTimeString } from "./common.types";

/**
 * 계정 상태값. PRD §7·requirements.md 5.2절 모두 `status` 필드만 명시하고 값
 * 집합을 정의하지 않아, D-010(탈퇴 익명화)·FR-082(계정 제재)에서 근거를 역산해
 * 추론했다. 스키마 확정(Task 028) 전에 고객 확인이 필요하다.
 */
export type ProfileStatus = "active" | "suspended" | "withdrawn";

export interface Profile {
  id: Id;
  handle: string;
  displayName: string;
  avatarUrl: string | null;
  /** 자기소개. D-035로 PRD §7에 복구된 필드. */
  bio: string | null;
  status: ProfileStatus;
  /** true면 핸들 검색 결과에서 제외된다(3.6절) — 초대 대상은 될 수 없고 본인 가입 신청은 가능. */
  searchOptOut: boolean;
  /** 탈퇴 익명화 시각. 탈퇴 전에는 null(D-010 — 삭제 로직 자체는 v0.2 대상이나 타입은 지금 확정한다). */
  anonymizedAt: ISODateTimeString | null;
}

/**
 * 로그인 시도 기록 — 계정 단위 잠금(D-020)의 근거 테이블. Supabase Auth의
 * 레이트 리밋이 IP/프로젝트 단위라 "자격 증명이 맞아도 거부"(FR-002 AC4)를
 * 표현할 수 없어 자체 구현한다. **클라이언트는 이 타입의 데이터에 접근하지
 * 않는다** — 로그인 경로(Server Action/Edge Function) 전용.
 */
export interface AuthAttempt {
  identifier: string;
  attemptedAt: ISODateTimeString;
  succeeded: boolean;
}
