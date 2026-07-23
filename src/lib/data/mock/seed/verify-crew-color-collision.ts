import { assignCrewColorForDateCell } from "@/lib/rules/crew-color-hash";
import type { Crew, Id } from "@/lib/types";

/**
 * R-017 실증 — 15개 크루를 12색 팔레트에 `hash(crewId) mod 12`로 배정하면 비둘기집
 * 원리로 최소 한 쌍은 같은 colorKey를 받는다. 이 함수는 그 쌍을 실제로 찾아 반환한다
 * (하드코딩된 crew id에 기대지 않는다 — `generateId` 카운터가 어떤 값에서 시작하든
 * 성립해야 한다, 특히 `resetFixtures()`가 반복 호출되는 향후 테스트 환경에서도).
 */
export function findColorKeyCollisionPair(crews: readonly Crew[]): [Crew, Crew] {
  const byColorKey = new Map<number, Crew[]>();
  for (const crew of crews) {
    const list = byColorKey.get(crew.colorKey) ?? [];
    list.push(crew);
    byColorKey.set(crew.colorKey, list);
  }
  for (const list of byColorKey.values()) {
    if (list.length >= 2) return [list[0], list[1]];
  }
  throw new Error(
    `크루 ${crews.length}개 중 colorKey(0-11) 충돌 쌍을 찾지 못했다 — R-017의 전제(크루 수가 12색을 ` +
      "초과한다)가 이 시드에서 깨졌다는 뜻이다.",
  );
}

/**
 * D-026 같은 날짜 셀 충돌 회피가 이 시드 데이터에 대해 실제로 동작하는지 실행 시점에
 * 증명한다 — "크루가 15개라 이론상 충돌한다"가 아니라, 캘린더 렌더링이 쓸 실제 함수
 * (`assignCrewColorForDateCell`)를 그대로 호출해 crewA·crewB가 같은 날짜 셀에서 서로
 * 다른 색 인덱스로 갈리는지 확인한다. 실패하면(즉 여전히 같은 인덱스로 남으면)
 * `crew-color-hash.ts`의 회귀이므로 즉시 예외를 던져 드러낸다 — 이 시드 모듈이
 * `import`될 때(=매번 개발 서버 시작·빌드 시) 항상 실행되는 자기 검증이다.
 */
export function verifyCrewColorCollisionDemo(
  crewA: Crew,
  crewB: Crew,
  dateCellCrewIds: readonly Id[],
): void {
  if (crewA.colorKey !== crewB.colorKey) {
    throw new Error(
      `crewA(${crewA.id})와 crewB(${crewB.id})의 colorKey가 같지 않다(${crewA.colorKey} vs ` +
        `${crewB.colorKey}) — 충돌 시나리오로 쓸 수 없다.`,
    );
  }
  if (!dateCellCrewIds.includes(crewA.id) || !dateCellCrewIds.includes(crewB.id)) {
    throw new Error("같은 날짜 셀에 crewA·crewB가 모두 있어야 D-026 충돌 회피를 실증할 수 있다.");
  }

  const occupied: number[] = [];
  const resolvedByCrewId = new Map<Id, number>();
  for (const crewId of dateCellCrewIds) {
    const finalIndex = assignCrewColorForDateCell(crewId, occupied);
    occupied.push(finalIndex);
    resolvedByCrewId.set(crewId, finalIndex);
  }

  if (resolvedByCrewId.get(crewA.id) === resolvedByCrewId.get(crewB.id)) {
    throw new Error(
      `D-026 충돌 회피가 crewA(${crewA.id})·crewB(${crewB.id})를 구분하지 못했다 — 둘 다 인덱스 ` +
        `${resolvedByCrewId.get(crewA.id)}로 남았다.`,
    );
  }
}
