import type { Profile } from "@/lib/types";

/**
 * 핸들 검색 결과 판정 — 순수 함수 (FR-006, D-005, NFR-013, R-012, Task 015B).
 *
 * **R-012가 요구하는 것**: "핸들이 존재하지 않음"과 "핸들은 존재하지만 검색 노출 옵트아웃"을
 * 사용자가 구분할 수 없어야 한다. 이 함수가 그 보장을 코드 구조로 강제하는 지점이다 — 아래
 * `projectHandleSearchResult`를 보면 두 경우가 **완전히 같은 return문 한 줄**로 수렴한다.
 * 호출자(Server Action)가 "없음"과 "옵트아웃"을 구분하는 branch를 따로 만들 수 없도록,
 * 애초에 그 구분이 판정 함수 밖으로 나가지 않게 막았다 — 이 함수를 통과하면 두 사례는 이미
 * 하나의 값(`{ found: false }`)이 되어 있어서, 그 이후 어떤 코드도 실수로 문구·상태코드·분기를
 * 다르게 줄 수 없다.
 *
 * **NFR-013이 요구하는 것**: 검색 응답은 핸들·표시 이름·아바타 **3필드만** 반환한다. 이 함수의
 * 반환 타입(`HandleSearchResult`)이 그 자체로 그 제약이다 — `found: true` 분기가 애초에
 * `Profile`의 다른 필드(`id`·`bio`·`status` 등)를 담을 자리가 없다. 참고로 프로필 `id`도 여기
 * 포함하지 않는다 — 초대(FR-020, Task 017A)처럼 실제로 그 사용자를 지목해야 하는 후속 동작은
 * 검색 결과가 아니라 **핸들 문자열을 다시 서버에 제출**해 서버가 그 시점에 다시 조회하게
 * 한다(id를 클라이언트에 노출하지 않는다).
 *
 * 남은 위험(문서화만, 이 함수의 책임 밖): Mock 스토어는 배열 `find`라 두 분기의 실행 시간
 * 차이가 이론상으로도 무시할 수준이다. 진짜 응답 지연 상수화(레이트 리밋 포함, NFR-016)는
 * v0.2·실데이터 연동 이후 대상이다(요구사항 3.6절, R-012 "대응" 절 참고) — 지금은 "같은 코드
 * 경로"까지만 보장한다.
 */
export type HandleSearchResult =
  | { found: true; handle: string; displayName: string; avatarUrl: string | null }
  | { found: false };

export function projectHandleSearchResult(
  profile: Pick<Profile, "handle" | "displayName" | "avatarUrl" | "searchOptOut"> | null,
): HandleSearchResult {
  if (profile === null || profile.searchOptOut) {
    // 미존재 · 옵트아웃 — 동일한 한 줄. 분기를 나누지 않는 것 자체가 R-012 대응이다.
    return { found: false };
  }
  return {
    found: true,
    handle: profile.handle,
    displayName: profile.displayName,
    avatarUrl: profile.avatarUrl,
  };
}
