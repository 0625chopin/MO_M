import { strings } from "@/lib/strings";

/**
 * 채팅방 페이지 (SC-13, PRD §6 "채팅방 페이지", F026~F029). 실시간 송수신은 D-030 ②를 따라
 * `lib/realtime` 배럴을 통해 구독을 감싼 컨테이너에서 붙인다(Task 008 이후) — 그때 `params`의
 * crewId(현재는 라우트 세그먼트로만 존재)로 채팅방을 조회한다.
 */
export default function CrewChatPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
      <h1 className="text-xl font-semibold text-foreground">
        {strings.chat.room.title}
      </h1>
    </main>
  );
}
