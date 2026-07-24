/**
 * 크루 필터 선택 판정 — Task 021B(FR-061 AC5, D-014·R-017).
 *
 * **왜 `calendar-types.ts`가 아니라 여기인가(CORE 재검증 지적, 7일차)**: 처음엔 `calendar-types.ts`
 * (plain ts — `MonthCalendar.tsx`의 `"use client"` 값 export 함정을 피하려고 만든 공유 모듈,
 * 그 파일 docstring 참고)에 뒀다. 그런데 그 함정 회피 논리는 "`MonthCalendar.tsx`에 두면 안
 * 된다"만 정당화하지 "`calendar-types.ts`에 있어야 한다"까지는 정당화하지 않는다 —
 * `lib/rules/`도 `"use client"`가 없는 plain ts라 같은 이유로 안전하다. 실제 결정 기준은 함정
 * 회피가 아니라 **이 함수의 성격**이다: 쿠키 원본(`undefined`/빈 문자열/유효한 값/전부 stale인
 * 값 네 갈래)과 실제 소속 크루 목록을 받아 "최종적으로 무엇을 선택 상태로 볼 것인가"를
 * **결정**한다 — `resolveCrewColorCollision`(D-026 충돌 회피 판정)이 3일차에 `crew-palette.ts`
 * (데이터)에서 `lib/rules/crew-color-hash.ts`(판정)로 이관된 것과 정확히 같은 종류의 이동이다
 * (`lib/rules/README.md` "crew-palette.ts와의 경계" 절 참고, 이번이 그 전례의 반대 방향
 * 재적용이다). 반면 `serializeCrewFilterSelection`(쉼표 join)은 분기·결정이 없는 순수 포맷팅이라
 * `normalizePaletteIndex`가 데이터 모듈에 남은 것과 같은 이유로 `calendar-types.ts`에 그대로
 * 둔다 — 데이터의 경계를 감싸는 유틸일 뿐 판정이 아니다.
 *
 * 이 파일은 `react`·`next`·`@/app/*`·`@/components/*`·`@/lib/data/*`·`@/lib/realtime/*`를
 * import하지 않는다(zone 1, `eslint.config.mjs`) — 문자열·배열 연산만 하는 순수 함수다.
 */

/**
 * 쿠키 원본 문자열을 실제 소속 크루 id 집합과 교집합해 유효한 선택 목록으로 되돌린다.
 * - 쿠키 자체가 **없으면**(`undefined` — 최초 방문, 필터를 아직 만진 적 없음) **기본값 = 전체
 *   선택**(모든 소속 크루가 보이는 상태)으로 되돌아간다 — FR-061 AC1 "두 크루의 Meetup이
 *   함께 보인다"가 필터를 만지기 전의 기본 기대다.
 * - 쿠키가 **빈 문자열**("")이면 사용자가 필터에서 **의도적으로 전부 해제**한 상태다 — 이때는
 *   그대로 빈 배열을 반환한다. `undefined`(안 만짐)와 `""`(전부 끔)를 같이 취급해 전체 선택으로
 *   되돌리면, 크루를 다 꺼서 "아무 일정도 안 보이게" 하려던 사용자의 마지막 선택을 조용히
 *   무시하게 된다 — 실제로 처음 구현에서 이 둘을 falsy 체크 하나로 뭉뚱그렸다가 재현·수정했다.
 * - 쿠키에 남아 있지만 더 이상 소속이 아닌 크루 id(탈퇴·강퇴됨)는 조용히 걸러낸다. 다만
 *   **걸러낸 결과가 전부 사라지면**(쿠키의 모든 id가 stale) 그건 "의도적으로 전부 해제"가
 *   아니라 "쿠키가 낡아서 아무것도 못 찾은" 경우이므로 전체 선택으로 복구한다 — 위 두 번째
 *   규칙과 다른 경로다(전자는 쿠키가 원래부터 비어 있었고, 이건 비었던 적 없는 값이 전부
 *   무효화된 경우).
 */
export function parseCrewFilterSelection(
  rawCookieValue: string | undefined,
  memberCrewIds: readonly string[],
): string[] {
  if (rawCookieValue === undefined) return [...memberCrewIds];

  const requested = rawCookieValue.split(",").filter(Boolean);
  if (requested.length === 0) return []; // 명시적으로 전부 해제한 상태 — 그대로 존중한다.

  const requestedSet = new Set(requested);
  const valid = memberCrewIds.filter((id) => requestedSet.has(id));
  // 쿠키에 유효한 id가 하나도 안 남으면(전부 stale) 전체 선택으로 폴백한다 — "필터가 전부
  // 무효화돼 아무것도 안 보이는" 상태보다 안전하다(fail-closed가 아니라 fail-visible).
  return valid.length > 0 ? valid : [...memberCrewIds];
}
