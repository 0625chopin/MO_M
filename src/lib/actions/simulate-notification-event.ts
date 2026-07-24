"use server";

import { createNotification } from "@/lib/data";
import type { Notification, NotificationType } from "@/lib/types";

/**
 * `/sample` 전용 데모 액션(Task 023) — 실제 알림 생성 파이프라인(Task 034, pg_cron)이 아직
 * 없어 "이런 유형의 알림이 오면 어떻게 보이는가"를 눈으로 확인할 자리가 필요하다(`poll.tsx`의
 * "투표 종료 트리거 시뮬레이션"과 같은 성격 — Mock인 것은 **발화 방식**뿐이고, 이 액션이
 * 호출하는 `createNotification`은 100% 프로덕션 코드다).
 *
 * 수신자는 항상 `profile-1`(로그인 데모 계정 `chopin0625`/`0625chopin`과 연결된 시드
 * 프로필, `CLAUDE.md` "테스트계정" 참고)로 고정한다 — `/sample`은 인증 세션과 무관하게
 * 열리므로 실제 로그인 사용자를 추측할 수 없다. payload는 `fixtures.ts` 시드에 실재하는
 * id(crew-1·crew-2·post-3·meetup-1 등)를 손으로 채워, 실제로 `notification-routing.ts`가
 * 계산하는 링크가 살아있는 경로로 이어지는지까지 함께 보인다.
 */
const SAMPLE_RECIPIENT_ID = "profile-1";

const SAMPLE_PAYLOAD_BY_TYPE: Record<NotificationType, Record<string, unknown>> = {
  poll_closed: { pollId: "poll-2", outcome: "passed", crewId: "crew-1", postId: "post-3" },
  join_request_received: { crewId: "crew-1", joinRequestId: "join-request-1" },
  join_request_approved: { crewId: "crew-2", joinRequestId: "join-request-1" },
  join_request_rejected: { crewId: "crew-2", joinRequestId: "join-request-1" },
  invitation_received: { crewId: "crew-2", invitationId: "invitation-1" },
  staff_appointed: { crewId: "crew-1" },
  member_removed: { crewId: "crew-2", reason: "규칙 위반" },
  meetup_created: { crewId: "crew-1", meetupId: "meetup-1" },
  meetup_cancelled: { crewId: "crew-1", meetupId: "meetup-1" },
  post_commented: { crewId: "crew-1", postId: "post-3" },
};

export async function simulateNotificationEventAction(type: NotificationType): Promise<Notification> {
  return createNotification({
    recipientId: SAMPLE_RECIPIENT_ID,
    type,
    channel: "in_app",
    payload: SAMPLE_PAYLOAD_BY_TYPE[type],
  });
}
