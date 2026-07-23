# `src/lib/rules/`

**React 비의존 순수 함수**(NFR-036). 투표 판정·정족수(D-032: `ceil(대상자 수 / 3)`)·권한 판정·
색 해시(`hash(crew.id) mod 12`) 등 — 네이티브 앱 전환(R-015) 시 그대로 재사용해야 하는 핵심
비즈니스 규칙이 여기 있다. React Compiler는 컴포넌트·훅만 메모이즈하므로(`CLAUDE.md`) 이 계층은
애초에 최적화 대상이 아니다.

## 무엇이 여기 오는가

- 입력을 인자로 받고 출력을 반환하는 **순수 함수**만 둔다.
- `react`·`react-dom`·`next`·`@/app/*`·`@/components/*`·`@/lib/data/*`·`@/lib/realtime/*`·
  Supabase 클라이언트를 import하지 않는다 — `eslint.config.mjs`(zone 1)가 이를 강제한다.
  데이터는 **인자로 받는다**, 직접 조회하지 않는다.

## `src/lib/crew-palette.ts`와의 경계 (참고 — DESIGN 산출물)

이 회차에 DESIGN이 `src/lib/crew-palette.ts`(팔레트 12색 상수 + `resolveCrewColorCollision`
충돌 회피 워크)를 `lib/rules/`가 아니라 **`lib/` 바로 아래**에 만들었다. 그 파일 자체가
"`hash(crew.id) mod 12`는 CREW의 도메인 레이어(React 비의존 순수 함수) 몫"이라고 명시하고
있어, 실제 **해시→인덱스 판정 함수**(`crewColorIndex(crewId): number` 같은 형태)는 이 디렉터리
(`lib/rules/`)에 오는 것이 맞다. 정리하면:

- **`lib/crew-palette.ts`** (lib 최상위, 이미 존재): 팔레트 **데이터**(12색 hex·대비값)와 그
  데이터에 결합된 충돌 회피 워크 — `globals.css`의 `--crew-N` 토큰과 손으로 동기화해야 하는
  "디자인 토큰"에 가깝다.
- **`lib/rules/crew-color-hash.ts`** (여기, 아직 없음): `hash(crewId) -> index` 순수 함수 —
  "판정" 로직이라 규약상 이 디렉터리 몫이다.

이 구분이 맞는지는 CORE(Task 006/007)와 DESIGN이 리뷰에서 확정한다 — 이번 Task 001에서는
`crew-palette.ts` 파일을 옮기지 않았다(파일 담당 경계상 DESIGN 산출물).

자세한 배치 원칙은 [`docs/CONVENTIONS.md`](../../../docs/CONVENTIONS.md) 참고.
