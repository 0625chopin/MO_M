import { strings } from "@/lib/strings";

/**
 * 크루 탐색 페이지 (SC-07, PRD §6 "크루 탐색 페이지", F008). `private` 크루 비노출 규칙(D-017)은
 * 데이터 접근 레이어에서 구현하며 이 화면 스캐폴드와 무관하다. 제목은 `crew.explore.title`을 쓴다
 * — PRD §5 메뉴 구조의 헤더 항목명("크루 탐색")과 같은 문구라 헤더 내비(`nav-items.ts`)도 이
 * 키를 그대로 재사용한다(3일차 교차검증에서 별도로 있던 `nav.crews` 키가 PRD §5에 대응 항목이
 * 없어 삭제됐다).
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
