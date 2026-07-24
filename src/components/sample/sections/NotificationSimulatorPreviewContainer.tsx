"use client";

import { useState } from "react";

import { getNotificationRoomId, NOTIFICATION_CREATED_EVENT } from "@/components/notifications/notification-channel";
import { NotificationBellContainer } from "@/components/notifications/NotificationBellContainer";
import { ToastHostContainer } from "@/components/notifications/ToastHostContainer";
import { Button } from "@/components/ui/button";
import { simulateNotificationEventAction } from "@/lib/actions/simulate-notification-event";
import { publishMockEvent } from "@/lib/realtime";
import { strings } from "@/lib/strings";
import type { NotificationType } from "@/lib/types";

const SAMPLE_PROFILE_ID = "profile-1";

const DEMO_TYPES: { type: NotificationType; label: string }[] = [
  { type: "poll_closed", label: "투표 종료" },
  { type: "join_request_received", label: "가입 신청 접수" },
  { type: "invitation_received", label: "초대 수신" },
  { type: "meetup_created", label: "모임 생성" },
];

/**
 * ToastHost·NotificationBell 종단 시연(Task 023) — `PollAutoCloseSimulatorPreview`와 같은
 * 성격이다: **발화 방식만** Mock(버튼 클릭)이고, 실제로 도는 코드(`simulateNotificationEventAction`
 * → `createNotification` → `publishMockEvent`)는 100% 프로덕션 파이프라인이다. 버튼을 누르면
 * ① 알림 레코드가 실제로 생성되고 ② `notification:{profileId}` 방에 이벤트가 발행되어 ③ 아래
 * 미리 마운트해 둔 `ToastHostContainer`가 토스트를 띄우고 `NotificationBellContainer`의 배지·
 * 목록이 함께 갱신된다 — 헤더·토스트·알림 센터가 같은 구독 인터페이스(D-030 ②)로 묶여 있음을
 * 눈으로 보여준다.
 */
export function NotificationSimulatorPreviewContainer() {
  const [pendingType, setPendingType] = useState<NotificationType | null>(null);

  async function trigger(type: NotificationType) {
    setPendingType(type);
    try {
      const notification = await simulateNotificationEventAction(type);
      publishMockEvent(getNotificationRoomId(SAMPLE_PROFILE_ID), {
        type: NOTIFICATION_CREATED_EVENT,
        roomId: getNotificationRoomId(SAMPLE_PROFILE_ID),
        payload: notification,
        occurredAt: notification.createdAt,
      });
    } finally {
      setPendingType(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {DEMO_TYPES.map(({ type, label }) => (
          <Button
            key={type}
            type="button"
            variant="outline"
            size="sm"
            disabled={pendingType !== null}
            onClick={() => void trigger(type)}
          >
            {label}
          </Button>
        ))}
      </div>
      <div className="flex items-center gap-2 rounded-lg border border-border p-3">
        <span className="text-xs text-muted-foreground">{strings.notification.center.title}</span>
        <NotificationBellContainer profileId={SAMPLE_PROFILE_ID} initialNotifications={[]} initialUnreadCount={0} />
      </div>
      <ToastHostContainer profileId={SAMPLE_PROFILE_ID} />
    </div>
  );
}
