/**
 * 크루원 초대 가능 여부 판정 — 순수 함수 (NFR-036, R-015, Task 017A). FR-020 예외 흐름
 * E1(이미 멤버)·E2(대기 중인 초대 존재)를 판정한다. `invite-crew-member.ts`(Server Action)와
 * 향후 초대 다이얼로그의 버튼 비활성화 판정이 같은 기준을 쓰도록 이 한 곳에 모은다
 * (`join-request-eligibility.ts`와 같은 이유).
 *
 * E3(대상자가 나를 차단)·E4(옵트아웃)는 이 함수의 대상이 아니다 — 옵트아웃은
 * `handle-search.ts`가 검색 결과 자체를 `found: false`로 합류시켜 이미 걸러내고(초대 대상을
 * 특정할 수조차 없다), 차단(`Block`, `moderation.types.ts`)은 v0.2까지 데이터 모델만
 * 선반영된 상태라 판정할 데이터가 없다(Task 042A 이후 대상).
 */
import type { CrewMembership, Id } from "@/lib/types";

export type InviteIneligibleReason = "self_invite" | "already_member" | "already_invited";

export type InviteEligibility =
  | { eligible: true }
  | { eligible: false; reason: InviteIneligibleReason };

export interface InviteEligibilityInput {
  inviterId: Id;
  inviteeId: Id;
  /** 초대 대상의 현재 멤버십 레코드. 아직 어떤 관계도 없으면 `null`. */
  membership: Pick<CrewMembership, "status"> | null;
}

export function evaluateInviteEligibility(input: InviteEligibilityInput): InviteEligibility {
  const { inviterId, inviteeId, membership } = input;

  if (inviterId === inviteeId) {
    return { eligible: false, reason: "self_invite" };
  }

  switch (membership?.status) {
    case "active":
      // E1 — 이미 크루원.
      return { eligible: false, reason: "already_member" };
    case "invited":
      // E2 — 이미 대기 중인 초대(중복 발송 차단).
      return { eligible: false, reason: "already_invited" };
    default:
      // requested·declined·rejected·left·removed·무관계는 전부 초대 가능. 강퇴 이력(removed)도
      // 가입 신청과 달리 초대는 오너·임원의 명시적 의사이므로 차단하지 않는다(FR-020은 FR-022
      // E3 같은 재초대 제한을 두지 않는다).
      return { eligible: true };
  }
}
