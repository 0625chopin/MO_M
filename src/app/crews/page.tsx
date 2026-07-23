import { strings } from "@/lib/strings";

/**
 * 크루 탐색 페이지 (SC-07, PRD §6 "크루 탐색 페이지", F008). `private` 크루 비노출 규칙(D-017)은
 * 데이터 접근 레이어에서 구현하며 이 화면 스캐폴드와 무관하다. `nav.crews`("내 크루")와는 의미가
 * 달라 재사용하지 않는다.
 */
export default function CrewExplorePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
      <h1 className="text-xl font-semibold text-foreground">
        {strings.crew.explore.title}
      </h1>
    </main>
  );
}
