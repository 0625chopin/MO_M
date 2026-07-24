# 4일차 작업 로그 (2026-07-24)

## 회차 요약
- 활성 팀원: DESIGN · CREW · BOARD (3명). **CORE는 유휴** — 다음 담당인 Task 015A가 Task 013(DESIGN, 5~6주차)을 기다린다
- 이번 회차 배치 근거: 완료 집합 {001, 002, 003, 004, 005, 006, 007, 008, 009A, 009B, 011} 기준 선행조건이 충족된 미완료 Task는 **DESIGN 012**(의존 002·011 ✓ — 3일차 011 완료로 열림), **BOARD 014**(의존 011 ✓ — 같은 이유), **CREW 010**(의존 006·009A·009B ✓, 선행 대기 009A ✓ — 3일차 009A·009B 완료로 열림) 3건이다. 배치 안에서 **012 → 014** 선후가 있다(BOARD가 DESIGN이 만든 쇼케이스 등록 인터페이스 위에 오류 화면을 얹는다). CREW 010은 `src/lib/data/mock` 영역이라 012와 병렬 착수했다
- 결과: 이슈 2건 발견 / 전건 해소, 전체 테스트 3/3 통과. 추가로 3일차부터 잠복해 있던 `/sample` 500 런타임 결함을 이번 회차에 발견·해소했다

## 팀원별 완료 내역

### DESIGN (02.DESIGN.md)
- 완료 Task: **012 · `/sample` 쇼케이스 셸과 4상태 토글**
- 산출물: `src/components/sample/showcase-types.ts`(`ShowcaseItem`·`ShowcaseSection` 타입 + `defineSection` 헬퍼), `registry.ts`(`SHOWCASE_SECTIONS` 단일 진입점), `ShowcaseSectionBlock.tsx`, `sections/{foundation,certainty,shell,primitives}.tsx`, `README.md`. 수정: `src/app/sample/page.tsx`(617줄 → 60줄), `docs/CONVENTIONS.md`
- 비고: 4상태 토글·앵커 내비·폭 토글 자체는 3일차 Task 011과 디자인 개편(D-038)에서 이미 있었다. **이번 회차의 실제 산출은 "다른 팀원이 자기 컴포넌트를 얹을 등록 인터페이스"** 다 — 그전까지 섹션·항목이 `page.tsx`에 함수로 하드코딩돼 있어 BOARD가 오류 화면을 등록할 자리가 없었다. 같은 회차에 BOARD가 이 인터페이스를 실제로 써서 검증됐다

### CREW (03.CREW.md)
- 완료 Task: **010 · Mock 시드 데이터 생성**
- 산출물: `src/lib/data/mock/seed/` 11개 파일 — `prng.ts`(mulberry32, 고정 시드 20260724), `time.ts`(고정 앵커 `SEED_NOW`), `content-bank.ts`, `generate-{profiles,crews,board,polls,meetups,chat,notifications}.ts`, `verify-crew-color-collision.ts`, `index.ts`(`buildBulkSeed`). 수정: `fixtures.ts`, `src/lib/data/mock/README.md`, `docs/ISSUES.md`(I-030·I-031 등재), `docs/ROADMAP/team/03.CREW.md`
- 실측 규모: profiles 300 · crews 15 · crewMemberships 300 · boards 15 · chatRooms 15 · posts 200 · **polls 72** · meetups 60 · pollEligibleVoters 1,980 · pollVotes 1,354 · meetupAttendances 858 · notifications 186 · chatMessages 2,000
- 비고: Task 007의 공개 read/write 시그니처는 한 줄도 바꾸지 않았다(`git diff` 0줄 확인 — NFR-034·R-003의 근거). 부수로 실버그 3건을 잡았다: `resetFixtures()`가 `idCounter`를 초기화하지 않던 문제, crew-1·crew-2의 `colorKey`가 실제 해시값과 달랐던 문제, `generatePosts`의 얕은 참조 공유로 4건이 중복 카운트되던 문제

### BOARD (04.BOARD.md)
- 완료 Task: **014 · 전역 오류·경계 화면 (SC-E1)**
- 산출물: `src/app/not-found.tsx`(Server), `src/app/error.tsx`(Client, `unstable_retry`), `src/app/global-error.tsx`(자체 `<html>/<body>`), `src/components/errors/{route-error-kind.ts,RouteErrorBoundary.tsx,RouteErrorBoundaryPreview.tsx}`, `src/components/sample/sections/errors.tsx`. 수정: `src/lib/strings/ko.ts`(문구 4개 추가), `src/components/sample/registry.ts`(import 1줄 + 배열 1줄)
- 비고: `RouteErrorKind = DataErrorCode | "network" | "full"` — 새 오류 분류 체계를 만들지 않고 `lib/data/contracts.ts`·`auth-session.ts`·`meetup.types.ts`의 기존 값을 재사용했다. DESIGN의 등록 인터페이스를 **새 섹션 파일 1개 + registry 1줄**로만 썼고 `page.tsx`·다른 섹션 파일은 건드리지 않았다 — 인터페이스 설계가 의도대로 작동함이 실증됐다

## 교차검증 결과
- CREW → DESIGN(012) **1차**: 3·4·5·6·7번 PASS, 1번(4상태 토글)·2번(컨테이너 쿼리) **FAIL** → 아래 이슈 1·2
- CREW → DESIGN(012) **재검증**: FAIL 2건 모두 **PASS**. 프로브 파일로 `tsc` 에러 발생을 직접 재현하고, 컴파일된 Tailwind CSS에서 `@container (min-width: 24rem)`·`(min-width: 32rem)` 규칙 생성을 대조 확인했다
- BOARD → CREW(010): 9개 항목 **전부 PASS**. 결정성은 3회 스냅샷 바이트 단위 동일로, 규칙 정합은 표본이 아니라 **65개 non-open Poll 전수 재계산 불일치 0건**으로, 색 충돌 자기검증은 일부러 깨보는 방식으로 거짓양성·거짓음성 둘 다 없음이 확인됐다
- CREW → BOARD(014): 8개 항목 **전부 PASS**. `unstable_retry` 채택 근거를 `node_modules/next/dist/docs/.../error.md:329`(v16.2.0 추가)·`error.md:155-157`(`reset` 격하 권고) 원문으로 확인했다

## 발견·해결한 이슈

1. **[DESIGN] `panels`/`content` 배타 관계가 타입·런타임 어디서도 강제되지 않았다.** `showcase-types.ts:21-23`이 둘 다 독립 optional이라 동시에 채워도 컴파일이 통과했고, `ShowcaseSectionBlock.tsx:41`의 분기는 둘 다 있으면 `content`를 경고 없이 무시했다. README·주석은 "배타"라고 못박아 뒀는데 실제로는 안 지켜져도 아무도 모르는 상태였다 — **테스트 러너가 없으므로(R-002) 타입 레벨이 유일한 방어선이다.** → discriminated union(`{ panels; content?: never } | { content; panels?: never }`)으로 변경. (재검증 CREW **pass** — 둘 다 채움·둘 다 비움 각각 TS2322 발생, 정상 3케이스는 에러 없음을 프로브로 실측)

2. **[DESIGN] 컨테이너 쿼리를 실증하는 등록 항목이 0건이었다.** `PreviewFrame`의 `@container` + 폭 토글 메커니즘 자체는 올바르게 짜여 있었으나, 등록된 어떤 항목도 `@sm:`/`@lg:`를 쓰지 않았다 — `foundation.tsx`·`certainty.tsx`·`primitives.tsx`는 전부 **뷰포트 기준** `sm:`/`lg:`를 썼고 `PreviewFrame`으로 감싸지도 않았다. `resizable`이 쓰인 유일한 곳(`shell.tsx`의 AppShell)은 셸이 의도적으로 뷰포트 기준인 예외라 실증 사례가 아니다. **CON-09·NFR-026이 요구하는 것은 도구의 존재가 아니라 작동 실증**인데 README·CONVENTIONS는 "폭 토글이 검증 도구"라고 서술하고 있어 괴리가 있었다. → `foundation.tsx`에 `PreviewFrame resizable` + `grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-3` 항목을 추가하고, "뷰포트 기준 항목은 `PreviewFrame`으로 감싸지 않는다"는 구분을 README에 명시. (재검증 CREW **pass**)

3. **[BOARD·회차 중 자체 해소] `/sample`이 500을 반환했다.** CREW가 012 검증 중 3회 재현했고 서버 로그에 `"Event handlers cannot be passed to Client Component props"`가 반복됐다. 원인은 `RouteErrorBoundary.tsx`가 `onRetry`(함수 prop)를 받으면서 `"use client"` 없이 `not-found.tsx`(Server)와 `error.tsx`(Client) 양쪽에서 공유된 것이다. BOARD가 `"use client"`를 추가하고, `/sample`의 서버 평가 섹션이 클로저를 넘기지 못하는 문제는 `RouteErrorBoundaryPreview`(client 래퍼, `kind` 문자열만 건너감)로 분리 해결했다. **검증**: CREW가 `rm -rf .next` 후 클린 재기동해 `curl /sample` 5회 연속 200·404 정상·로그 재발 0건 실측 → **해소 확인**

### 판정만 하고 고치지 않은 것
- 섹션 `id`·항목 `name` 중복의 런타임 검증 부재: CREW가 **저위험**으로 판정(겹쳐도 앵커 오작동·React key 경고 수준이지 크래시가 아니고, 팀원당 섹션 1개라 충돌 확률이 낮다). 지금 검증 코드를 넣는 것은 과잉이라 보류했다
- `registry.ts`가 공유 파일이라 완전한 충돌 프리는 아니다: 이번 회차에도 DESIGN·BOARD가 동시에 건드렸다. 팀원이 늘면 병합 충돌 여지가 있다

## 팀장 전체 테스트 (항상 실행)
- `npm run lint`: **통과** (0 에러 / 0 경고)
- `npx tsc --noEmit`: **통과** (0 에러)
- `npm run build`: **통과** — 컴파일 6.2s / TypeScript 5.7s / 정적 생성 15개 라우트 3.3s, 전체 25.9s. 시드 데이터가 커졌음에도 유의미한 악화 없음(모듈 로드 실측 199ms)
- **추가 — 프로덕션 모드 NFR-014 실측**(교차검증에서 미완으로 남았던 항목): `npm start`로 프로덕션 서버를 띄워 `/sample` 200 · 존재하지 않는 경로 404 확인. 404 응답 본문에 내부 절대 경로·스택 프레임·`webpack-internal` **누출 없음**

## 문서 갱신
- `docs/ROADMAP/team/02.DESIGN.md`: Task 012 `상태: 완료 (4일차, 2026-07-24)`
- `docs/ROADMAP/team/03.CREW.md`: Task 010 `상태: 완료 (4일차, 2026-07-24)` + 공수 줄에 수치 정정 주석(I-031 참조)
- `docs/ROADMAP/team/04.BOARD.md`: Task 014 `상태: 완료 (4일차, 2026-07-24)`
- `docs/ISSUES.md`: **I-030**(초대 만료 시 짝을 이루는 CrewMembership 행의 다음 상태 미정의) · **I-031**(세 문서의 "투표 40"이 FR-060의 가결 Poll:Meetup 1:1 제약과 모순) 등재. "다음 이슈 번호" 줄을 I-032로 갱신(I-030 등재 때 누락됐던 것도 함께 정정)
- `docs/CONVENTIONS.md`: `src/components/sample/` 트리 서술을 새 구조에 맞게 갱신(R-006)
- `docs/team/*.md`: 변경 없음 (팀원 상태 변화 없음)

### 팀장이 처리하지 못하고 남긴 문서 모순
**I-031의 "투표 40"은 세 곳에 있는데 이번 회차에는 한 곳만 정정됐다.** CREW가 자기 소유 문서(`docs/ROADMAP/team/03.CREW.md:52`)에만 주석을 달았고, **`docs/ROADMAP/ROADMAP.md:179`와 `docs/prd/PRD-validation.md:890`은 여전히 "투표 40"인 채로 남아 있다.** 두 문서는 이번 회차 어느 팀원의 소유도 아니라 손대지 않았다 — 다음 회차에 소유자를 정해 정정하거나, 로드맵 전체 갱신 시점에 함께 처리해야 한다. 지금 상태에서 로드맵만 읽는 사람은 시드가 스펙과 다르다고 오판할 수 있다.

## 다음 회차에 열리는 Task
완료 집합이 **{001, 002, 003, 004, 005, 006, 007, 008, 009A, 009B, 010, 011, 012, 014}** 로 갱신된다. 이 기준으로 선행조건이 충족되는 Task:

- **DESIGN Task 013**(기본 원자 컴포넌트 15종) — 의존 004·012 ✓. **012 완료로 열렸다.** 공수 8.0인일(L)로 이번 v0.1에서 가장 큰 단일 Task 축에 들고, **Phase 3 전량(CORE 015A·CREW 016B·BOARD 018A 등)이 이것 하나를 기다린다** — 여기가 밀리면 다음 회차에 나머지 3명이 동시에 멈춘다. 이번에 만든 registry 패턴 위에서 `sections/primitives.tsx`를 확장하는 형태라 새 파일 충돌은 없다
- **CORE·CREW·BOARD는 전부 Task 013 대기다.** CORE 015A(의존 013), CREW 016B(의존 013), BOARD 018A(의존 013) 모두 013 하나에 막혀 있다

즉 다음 회차는 **DESIGN 1인 집중 회차**가 될 가능성이 높다. 013이 크리티컬 패스 단일 병목이므로, 회차를 쪼개 013을 부분 완료로 열어 후속 Task를 조기 착수시킬지 검토할 가치가 있다.

## git
- 브랜치: day-4 (day-3에서 분기)
- 커밋: `65d4b65` "Day 4: /sample 등록 인터페이스·Mock 시드 데이터·전역 오류 화면 (Task 012·010·014)" — 37개 파일(+2,838 / −605). 3일차와 달리 커밋을 쪼개지 않았다. 세 Task가 서로 다른 영역이긴 하나 전부 같은 회차의 산출물이고, `/sample` 500 해소가 DESIGN·BOARD 파일에 걸쳐 있어 되돌린다면 어차피 함께 되돌려야 한다
- 푸시: **완료** — `git push -u origin day-4` 성공, `origin/day-4` 신규 브랜치 생성·추적 설정됨(사용자 승인 후 실행)
