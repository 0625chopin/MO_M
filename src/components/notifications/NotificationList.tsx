"use client";

import { BellOff } from "lucide-react";

import type { NotificationItemViewModel } from "@/components/notifications/notification-view-models";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { strings } from "@/lib/strings";
import type { Id } from "@/lib/types";
import { cn } from "@/lib/utils";


export interface NotificationListProps {
  notifications: NotificationItemViewModel[];
  onSelect?: (id: Id) => void;
  onMarkAllRead?: () => void;
  className?: string;
}

/**
 * 알림 센터 목록(Task 023, FR-071) — 표현 컴포넌트(D-030 ①). `NotificationBell`의 팝오버와
 * `/notifications` 전체 페이지가 이 컴포넌트를 함께 쓴다(같은 화면 요소를 두 군데서 다시
 * 짜지 않는다). 빈 상태(FR-071 AC4)는 이 컴포넌트가 직접 그린다 — 호출부가 매번 `length === 0`
 * 을 판정하지 않게 한다. "모두 읽음"(FR-071 AC3)은 안읽음 항목이 하나라도 있을 때만 보인다.
 */
export function NotificationList({ notifications, onSelect, onMarkAllRead, className }: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <Empty className="border-none p-6">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BellOff aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>{strings.notification.center.empty}</EmptyTitle>
        </EmptyHeader>
        <EmptyContent>
          <EmptyDescription>{strings.notification.center.emptyDescription}</EmptyDescription>
        </EmptyContent>
      </Empty>
    );
  }

  const hasUnread = notifications.some((n) => !n.isRead);

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {onMarkAllRead && hasUnread && (
        <div className="flex justify-end px-1 pb-1">
          <Button type="button" variant="ghost" size="sm" onClick={onMarkAllRead}>
            {strings.notification.center.markAllRead}
          </Button>
        </div>
      )}
      <ul className="flex flex-col gap-1">
        {notifications.map((notification) => (
          <li key={notification.id}>
            <NotificationItem notification={notification} onSelect={onSelect} />
          </li>
        ))}
      </ul>
    </div>
  );
}
