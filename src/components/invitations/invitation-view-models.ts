import type { Id, ISODateTimeString } from "@/lib/types";

/**
 * `InvitationList`(표현)가 받는 초대 한 건의 모양(SC-20, FR-021·028, Task 017B). 크루명·
 * 초대자 표시 이름·만료일은 `InvitationInboxContainer`가 `Invitation`·`Crew`·`Profile` 조인을
 * 이미 끝낸 값이다(R-015 — 표현 컴포넌트는 조회하지 않는다, D-030 ①).
 */
export interface InvitationRowViewModel {
  id: Id;
  crewId: Id;
  crewName: string;
  crewColorIndex: number;
  inviterDisplayName: string;
  /** 발급 후 14일(요구사항 2.2절 용어집). 카드에는 절대 날짜로 표시한다(NFR-025). */
  expiresAt: ISODateTimeString;
}
