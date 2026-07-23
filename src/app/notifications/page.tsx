import { strings } from "@/lib/strings";

/**
 * 알림 센터 페이지 (SC-18, PRD §6 "알림 센터 페이지", F025·F039). 읽지 않음 배지·항목 클릭 시
 * 이동·일괄 읽음 처리는 Task 016B 이후 채운다.
 */
export default function NotificationCenterPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
      <h1 className="text-xl font-semibold text-foreground">
        {strings.notification.center.title}
      </h1>
    </main>
  );
}
