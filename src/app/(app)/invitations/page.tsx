import { strings } from "@/lib/strings";

/**
 * 받은 초대함 페이지 (SC-20, PRD §6 "받은 초대함 페이지", F010). 수락 시 즉시 크루원(active)
 * 전환 + 크루 홈 이동, 거절해도 재초대 가능(영구 차단 아님) 로직은 Task 015B에서 채운다.
 */
export default function InvitationsPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
      <h1 className="text-xl font-semibold text-foreground">
        {strings.invitation.inbox.title}
      </h1>
    </main>
  );
}
