/**
 * 크루 캘린더 색 배정 순수 함수 — Task 009B (D-006, D-026, NFR-025, R-015).
 *
 * 3.5절 "배정 방식": `paletteIndex = hash(crew.id) mod 12`(D-006, Crew 단위
 * 결정론적 배정 — 서버·클라이언트 어디서 계산해도 같은 값이 나와야 한다).
 * "충돌 처리": 같은 날짜 셀 안에서 색이 겹치면 색각 이상 ΔE 최대화 순서로
 * 다음 색을 임시 배정한다(D-026 — 이 순서는 `CREW_PALETTE` 배열 자체의
 * 순서이지, 별도 상수가 아니다).
 *
 * ## `src/lib/crew-palette.ts`와의 경계 (1일차 이월 결정 처리 — 3일차)
 *
 * 1일차 교차검증에서 "`resolveCrewColorCollision`·`normalizePaletteIndex`를
 * `lib/rules/`로 옮기는 작업은 CREW의 `hash(crewId)` 함수가 합류하는 시점에
 * 함께 처리한다"고 이월했다(`docs/CONVENTIONS.md` 남은 리스크 절,
 * `src/lib/rules/README.md`). 이번 회차에 두 함수를 **일부만** 이관했다:
 *
 * - **이관함 — `resolveCrewColorCollision`**: D-026의 충돌 회피 "판정"(주어진
 *   후보 인덱스와 셀 안의 점유 인덱스 집합을 보고 실제로 쓸 인덱스를
 *   *결정*한다) 그 자체다. `lib/rules/README.md`가 이미 "색 해시"를 이
 *   디렉터리 몫으로 분류해 뒀고, 이 판정은 아래 `crewColorIndex`(신규
 *   `hash(crewId) mod 12`)와 항상 한 파이프라인으로 호출된다 — 호출자가
 *   "이 크루가 이 날짜 셀에서 받는 색 인덱스"를 구하려면 두 함수를 함께
 *   쓴다. 그렇다면 판정 로직을 한 파일에 모아 두는 편이 R-015(판정이
 *   흩어지면 화면에 인라인되기 쉽다)를 줄인다. 실제 이관 시점에 기존
 *   소비자가 있는지 저장소 전체를 검색했으나(`grep -rn "resolveCrewColorCollision"`)
 *   `crew-palette.ts` 자신 말고는 없어 이동 비용이 0이었다.
 * - **현행 유지 — `normalizePaletteIndex`**: `CREW_PALETTE_SIZE`(팔레트
 *   *데이터*의 크기)에 대한 나머지 연산일 뿐이고, `crew-palette.ts`의 데이터
 *   조회 함수 `getCrewColor(index)`가 계속 이 정규화를 쓴다. "판정"이
 *   아니라 "팔레트 데이터의 경계를 감싸는 유틸"이라 데이터와 같은 파일에
 *   두는 편이 자연스럽다 — 옮기면 `crew-palette.ts`가 `lib/rules/`를
 *   가져와야 하는데, 데이터 모듈이 판정 모듈에 의존하는 방향은 거꾸로다.
 *   이 파일은 대신 `CREW_PALETTE_SIZE`와 `normalizePaletteIndex`를
 *   `crew-palette.ts`에서 가져와 쓴다(판정이 데이터에 의존하는, 자연스러운
 *   방향).
 *
 * `docs/CONVENTIONS.md`·`src/lib/rules/README.md`도 이 결정에 맞춰 갱신했다.
 */

import { CREW_PALETTE_SIZE, normalizePaletteIndex } from "@/lib/crew-palette";

/**
 * `crew.id`(UUID 문자열)를 32비트 정수로 접는 결정론적 해시(djb2 변형).
 * 암호학적 해시가 아니다 — 여기 필요한 성질은 "같은 입력 → 같은 출력"과
 * "12개 버킷에 대체로 고르게 퍼진다"뿐이다(D-006). `>>> 0`으로 부호 없는
 * 32비트 정수로 고정해 서버·클라이언트 어디서 실행해도 동일한 값이 나오게
 * 한다(부호 있는 정수 오버플로는 엔진마다 표현이 갈릴 수 있다).
 */
export function hashCrewId(crewId: string): number {
  let hash = 5381;
  for (let i = 0; i < crewId.length; i++) {
    hash = (hash * 33) ^ crewId.charCodeAt(i);
  }
  return hash >>> 0;
}

/**
 * D-006 배정 방식: `hash(crew.id) mod 12`. 충돌 회피 이전의 "기본 인덱스"만
 * 반환한다 — 같은 날짜 셀 충돌 회피가 필요하면 {@link resolveCrewColorCollision}
 * 을 이어서 호출한다(아래 {@link assignCrewColorForDateCell} 참고).
 */
export function crewColorIndex(crewId: string): number {
  return normalizePaletteIndex(hashCrewId(crewId));
}

/**
 * D-026 같은 날짜 셀 충돌 회피. `baseIndex`(보통 {@link crewColorIndex}의
 * 결과)가 그 셀에 이미 나와 있는 인덱스(`occupiedIndices`)와 겹치면, 팔레트의
 * 색각 이상 ΔE 최대화 순서(`CREW_PALETTE` 배열 순서 그 자체 — 인덱스
 * 숫자상의 인접 여부가 아니다)를 따라 다음 빈 인덱스를 찾는다.
 *
 * 전역 유일성은 보장하지 않는다 — 12개 초과 동시 크루는 수학적으로 불가능
 * (D-014, R-017)하므로 애초에 요구하지 않는다. 12칸을 모두 순회해도 빈
 * 자리가 없으면(같은 셀에 12개 크루가 이미 있으면) `baseIndex`를 그대로
 * 반환한다 — 이 경우 색만으로는 구분되지 않으므로 크루명 텍스트 라벨과
 * `aria-label`이 구분을 책임진다(NFR-019, D-026 "불가침" 규칙).
 */
export function resolveCrewColorCollision(
  baseIndex: number,
  occupiedIndices: Iterable<number>,
): number {
  const occupied = new Set<number>();
  for (const i of occupiedIndices) occupied.add(normalizePaletteIndex(i));

  const start = normalizePaletteIndex(baseIndex);
  for (let step = 0; step < CREW_PALETTE_SIZE; step++) {
    const candidate = normalizePaletteIndex(start + step);
    if (!occupied.has(candidate)) return candidate;
  }
  return start;
}

/**
 * 편의 함수 — `hash(crewId) mod 12` 다음 같은 날짜 셀 충돌 회피까지 한
 * 호출로 끝낸다. 캘린더 렌더링(컨테이너)이 "이 크루가 오늘 이 셀에서 받는
 * 팔레트 인덱스"를 구할 때 쓰는 진입점.
 */
export function assignCrewColorForDateCell(
  crewId: string,
  occupiedIndicesInCell: Iterable<number>,
): number {
  return resolveCrewColorCollision(crewColorIndex(crewId), occupiedIndicesInCell);
}
