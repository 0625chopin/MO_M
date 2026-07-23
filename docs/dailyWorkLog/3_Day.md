# 3일차 작업 로그 (2026-07-24)

## 회차 요약
- 활성 팀원: CORE · DESIGN · CREW · BOARD (**4명 전원**). 2일차에 005·006이 닫히며 B팀 대기가 풀렸다.
- 이번 회차 배치 근거: 완료 집합 {001, 002, 003, 004, 005, 006} 기준 선행조건이 충족된 미완료 Task는 **CORE 007**(의존 001·006 ✓), **DESIGN 011**(의존 001·003·005 ✓ — 005 완료로 열림), **CREW 009B**(의존 002·006 ✓)·**008**(의존 001·006 ✓), **BOARD 009A**(의존 002·006 ✓) 5건이다. 전부 001~006에만 의존해 배치 내 상호 선후가 없으므로 4명 동시 착수했고, 2건을 진 CREW만 주차 순서대로 009B → 008 순차 진행했다.
- 팀장 사전 조치(동시 편집 충돌 차단): `src/lib/rules/`를 009A·009B가 공유하므로 파일 소유권을 도메인으로 갈랐고(투표·정족수·타임존 = BOARD / 권한·멤버십·색 해시 = CREW), 공용 `index.ts` 배럴은 **아무도 만들지 않도록** 금지했다. `src/lib/crew-palette.ts` 이관은 CREW 단독 소유로 지정하고 DESIGN에게 접근 금지를 명시했다. 회차 내내 파일 충돌 0건.
- 리뷰 짝 대체: DESIGN이 011 작업 중이라 CREW 008의 리뷰(원 짝 DESIGN)를 BOARD가 대신했다. 나머지는 프로필상 리뷰 짝 그대로다.
- 결과: 이슈 **9건** 발견 / 전건 해소, 전체 테스트 3/3 통과.

## 팀원별 완료 내역

### CORE (01.CORE.md)
- 완료 Task: **007 · 데이터 접근 레이어 경계와 Mock 구현**
- 산출물: `src/lib/data/`의 12개 신규 파일 — `contracts.ts`(`DataResult<T>`·`CursorPage<T>`·`DataErrorCode`), `index.ts`(배럴), `mock/fixtures.ts`, `mock/`의 profile·crew·invitation·join-request·board·poll·meetup·chat·notification 9개 도메인 모듈. 부수로 `src/lib/types/poll.types.ts`(`SnapshotVoterStatus` 승격), `src/lib/types/permission.types.ts`(주석 정정), `eslint.config.mjs`(zone 6 공백 수정), `docs/CONVENTIONS.md`(ESLint 규칙 표 갱신 + "3일차 프로브 검증 기록" 절 신설), `docs/ISSUES.md`(I-027 해결 처리).
- 규모: FR 39건 대응 read/write 함수를 9개 도메인에 배치. 픽스처는 최소(프로필 3·크루 2·게시글 3·투표 2·Meetup 1·가입신청/초대 각 1) — 대량 시드는 Task 010 몫이라 경계를 지켰다.
- 비고: 배럴이 도메인 모듈 9개를 조립 재노출해 실데이터 전환 시 `./mock/<domain>` → `./supabase/<domain>` 한 줄씩 교체가 성립한다(NFR-034). 모든 입출력이 POJO이고 `Id`·`ISODateTimeString`이 `string` 별칭이라 직렬화 가능성이 타입 수준에서 보장된다(NFR-037, R-015). 판정 로직(정족수·가결·권한·색 해시)을 인라인하지 않고 계산된 값을 인자로 받는다 — `closePoll`이 `outcome`을 받는 형태.

### DESIGN (02.DESIGN.md)
- 완료 Task: **011 · 앱 셸·전역 레이아웃·인증 경계**
- 산출물: `src/components/shell/`의 7개 신규 파일 — `AppShell.tsx`·`HeaderNav.tsx`·`MobileTabBar.tsx`·`PageHeader.tsx`·`auth-session.ts`·`get-auth-session.ts`·`nav-items.ts`. `src/components/sample/`의 `PreviewFrame.tsx`·`StatePreview.tsx`, `src/app/sample/page.tsx`(최소 골격). 수정으로 `src/app/layout.tsx`, `src/app/`의 page·onboarding·login·signup 4개, `src/lib/strings/ko.ts`, `docs/CONVENTIONS.md`(트리에 `components/shell/`·`components/sample/` 추가), `docs/ISSUES.md`(I-025·I-026·I-027 등재).
- 비고: 인증 경계를 `proxy.ts` 없이 레이아웃에서 처리했다(D-030 ④, D-011). `layout.tsx`가 `getAuthSession()`을 조회해 표현 컴포넌트에 props로 내리는 구성 루트 역할을 하므로 별도 `AppShellContainer`를 두지 않았고, 교차검증에서 이 판단이 타당함을 확인받았다(1회성 서버 읽기지 실시간 구독이 아니라 D-030 ②의 대상이 아니다). 빌드 실패를 겪고 `auth-session.ts`(타입+순수 함수, 클라이언트 안전)와 `get-auth-session.ts`(`next/headers`, 서버 전용)를 분리한 것이 이번 회차의 실질 설계 성과다.

### CREW (03.CREW.md)
- 완료 Task: **009B · 비즈니스 규칙 순수 함수(권한 매트릭스·멤버십 전이·색 배정)**, **008 · 실시간 구독 인터페이스 추상화와 Mock 이벤트 소스**
- 산출물: `src/lib/rules/`의 `permission.ts`·`crew-membership-transition.ts`·`crew-color-hash.ts`, `src/lib/realtime/`의 `types.ts`·`mock.ts`·`broadcast.ts`·`index.ts`. 수정으로 `src/lib/crew-palette.ts`(판정 함수 이관), `src/lib/rules/README.md`, `src/lib/realtime/README.md`, `docs/CONVENTIONS.md`, `src/app/crews/page.tsx`(주석).
- 비고: 3.3절 권한 매트릭스를 `Record<PermissionAction, Record<UserRole, Allowance>>` 리터럴로 옮겨 **매트릭스 누락이 컴파일 에러가 되게** 했다. 2.4절 상태 전이도 같은 방식이다. `deriveUserRoleForPermissionCheck`를 추가해 `CrewMembership.role`+`status` → `UserRole` 투영을 한 곳에 모았다 — 컨테이너마다 따로 구현하면 판정이 화면마다 갈리는 R-015 신호가 된다. Task 008은 `onError`를 선택적 3번째 인자로 분리해 "이벤트 없음"과 "구독 실패"를 컨테이너가 구분하게 했다(D-030 ③).

### BOARD (04.BOARD.md)
- 완료 Task: **009A · 비즈니스 규칙 순수 함수(투표 판정·정족수·타임존)**
- 산출물: `src/lib/rules/`의 `quorum.ts`·`poll-eligibility.ts`·`poll-vote-tally.ts`·`poll-decision.ts`·`poll-timezone.ts` 5개 신규 파일. `src/lib/rules/README.md`에 자기 절 추가(CREW 절 보존).
- 비고: D-003과 D-022가 요구하는 **두 개의 서로 다른 집합**을 각각 함수로 분리한 것이 핵심이다 — 정족수 분모는 `removed`만 제외하고 `left`는 남기며(D-003), 종료 트리거③ 미투표자는 `active`만 센다(D-022). 하나로 합치면 트리거③이 죽는다. 기권도 정족수 분모에는 포함하되 가결 비교에서는 제외하는 비대칭을 두 함수로 갈랐다. 타임존은 외부 라이브러리 없이 epoch 비교 + `Intl.DateTimeFormat`만 쓰고 `now`를 인자로 받아 순수성을 지켰다.

## 교차검증 결과
- **BOARD → CREW(009B)**: 9항목 중 **8 PASS · 1 PARTIAL**(주석의 행 수 표기). 3.3절을 직접 재계수(35행)하고, 2.4절 다이어그램 간선을 전수 대조했으며, 해시 결정성을 node 실행으로 확인하고, `git diff`·grep으로 이관 방향과 "기존 소비자 없음" 주장을 검증했다. 최종 **PASS**.
- **CORE → BOARD(009A)**: 9항목 중 **7 PASS · 1 설계 조율 · 1 PARTIAL**(결정 번호 오귀속). D-003·D-022·D-032 원문을 라인 단위로 인용해 대조했고, FR-044 AC1 예시(10명→4명)를 node로 재현했으며, 타임존 3종(LA DST 전환·서울 자정·Etc/GMT+8 자정) 경계를 실행 검증했다. 최종 **PASS**.
- **BOARD → CREW(008)**: 8항목 중 **7 PASS · 1 PARTIAL**(README 3곳 오기). `npx tsx`로 7개 시나리오를 실행해 구독/해제/멱등/타이머 발화를 확인했고, **타이머 해제 후 누수 없음**을 실측해 R-019 우려를 닫았다. 최종 **PASS**.
- **DESIGN → CORE(007)**: 9항목 중 **8 PASS · 1 PARTIAL**(RLS 403 표현 불가). 프로브 파일로 ESLint zone 4·5 동작을 실제 재현해 확인했다. 최종 **PASS**.
- **CREW → DESIGN(011)**: 10항목 **전부 PASS**(단 새 이슈 2건 동반). Playwright로 실기동해 360px에서 MobileTabBar 링크를 실측(90×50.5px)하고 가로 스크롤 없음을 확인했으며, `git diff`로 2일차 4개 page.tsx가 바이트 단위로 보존됐음을 확인했고, ESLint 존 경계를 프로브로 실측해 **설정 공백 1건을 찾아냈다.** 최종 **PASS**.
- 이번 회차 검증의 공통 특징은 **문서 읽기로 통과시키지 않았다**는 점이다 — node 실행·`npx tsx` 실행·Playwright 실기동·ESLint 프로브 파일 4가지 실측 수단이 모두 동원됐고, 실제로 그 중 프로브가 코드로는 드러나지 않는 설정 공백을 찾아냈다.

## 발견·해결한 이슈
1. [CREW] 권한 매트릭스 행 수 표기가 `permission.ts:4`·`:38`, `rules/README.md:18` 세 곳에서 "34개 **행**"이었으나 34는 **액션** 개수다 → BOARD의 전수 재계수 결과 "3.3절 35행 중 회원가입·로그인 2행 제외 = 33행, 그중 FR-032 1행이 `post:update_own`·`post:delete_own` 두 액션으로 분리 = 34액션"이 사실. 세 곳을 이 산수가 읽히게 통일. 커버리지 자체는 셀 단위 전수 대조로 완전·정확 판정 (재검증 BOARD pass)
2. [CORE] 위와 같은 계열로 `permission.types.ts:24`가 "33개 행 전부와 **1:1** 대응"이라 서술 — 행 수 33은 맞으나 1:1이 틀렸다(33행 : 34액션) → CREW 문구와 같은 사실관계·어휘로 정정. **2일차에도 이 파일의 "전 행 1:1 대응" 과장을 한 번 정정한 이력이 있어 같은 문장의 재발**이라, 이번엔 "왜 33≠34인지"를 주석만으로 이해되게 쓰도록 지시 (팀장 지시)
3. [BOARD] `poll-timezone.ts:29`가 "결과 집계 중"의 근거를 **FR-042 AC4**로 인용했으나 실제로는 **FR-043 AC4**다(FR-042 AC4는 대상자 5명 미만 시 집계 은닉, D-031 — 전혀 다른 규칙) → 정정. **2일차에 지적된 "결정 번호 오귀속" 패턴의 재발**이라 BOARD가 고치기 전 원문 재대조 절차를 거쳤다 (재검증 CORE pass)
4. [BOARD] `quorum.ts:12`가 "D-003·D-022 규칙(강퇴자 분모 제외 등)"이라 나란히 인용 — 강퇴자 분모 제외는 D-003 단독이고 D-022는 오히려 "분모와 정족수 정의는 D-003 그대로 둔다"고 선을 긋는 결정이다 → 각 결정이 무엇을 규정하는지 갈라 쓰도록 정정 (재검증 CORE pass)
5. [BOARD·CORE] `SnapshotVoterStatus`가 `poll-eligibility.ts`에 로컬 정의돼 있어, `lib/types/README.md`의 "판정 함수의 입출력 타입은 `lib/types`에 둔다" 규칙에서 이 타입만 벗어났고 데이터 레이어가 이 조인 결과를 만들 때 `lib/rules` 타입을 import하는 **역방향 의존**이 생길 상황 → **팀장이 승격 판정.** CORE가 `poll.types.ts:66-69`에 승격하고 생산자 `listEligibleVotersWithCurrentStatus`를 `mock/poll.ts`에 추가, 그 뒤 BOARD가 로컬 정의를 지우고 import로 전환(직렬 처리로 충돌 회피). 정의 설명은 `poll.types.ts`에만 두고 소비처에는 소비자 관점 문단만 남겨 중복을 피했다 (재검증 DESIGN pass)
6. [CREW] `realtime/README.md` 3곳이 실제 코드와 불일치 — (a) `emit`이라는 존재하지 않는 함수명(실제 `publishMockEvent`), (b) broadcast 스텁을 "미구현 throw"라 서술(실제로는 `onError` 콜백 — **오히려 더 나은 설계인데 README가 스스로를 깎아내림**), (c) `onError` 3번째 인자 미언급으로 계약 이탈로 오해될 소지 → 세 곳 모두 실제 동작과 분리 근거(D-030 ③)까지 적도록 정정 (재검증 BOARD 지적 반영)
7. [CORE] `contracts.ts`의 `DataErrorCode`에 RLS 403류가 없어 **D-030 ③이 요구하는 도메인 오류 셋 중 둘만 표현 가능**했다(정원 마감·상태 충돌은 되고 403은 불가). DESIGN이 I-027로 등재하며 "Task 026 전에만 결정하면 된다"고 했으나 → **팀장이 이월하지 않고 즉시 해결 판정**: D-030 ③이 v0.1부터 지킬 것으로 못박고 있고, 미루면 그 사이 작성되는 모든 컨테이너·Server Action이 "도달 불가"를 전제하게 돼 전환 시점에 재작성이 필요하다. 지금은 enum 한 줄에 소비자 0이라 비용이 없다. `forbidden` 추가 + docstring에 "RLS는 2차 방어선" 근거 명시, I-027은 해결됨으로 갱신
8. [DESIGN] `AuthSession`(인증됨)에 `profileId`가 없어 컨테이너가 세션 → `lib/data` 호출(전 함수가 `profileId`를 인자로 받는 CON-06 계약)을 연결할 수 없었다 → DESIGN 스스로 검증 중 발견, 팀장이 이번 회차 처리로 판정. 판별 유니온의 `authenticated` 멤버에만 추가해 **fail-closed가 타입 수준에서 강제**된다(다른 상태에서 `session.profileId` 접근은 컴파일 에러)
9. [CREW→CORE] **`eslint.config.mjs`의 존 공백** — zone 4·5는 `src/components/**/*.tsx`만 매칭하고 zone 6은 `src/components/**` 전체를 `ignores`로 제외해, `components/` 아래 **`.ts` 파일**(`auth-session.ts`·`get-auth-session.ts`·`nav-items.ts`)이 어느 존에도 걸리지 않았다. CREW가 프로브에 `@supabase/supabase-js` import를 넣어 에러 0건임을 실측(대조군인 `.tsx` 형제 파일과 `lib/_probe.ts`는 각각 2건 에러) → CORE가 zone 6 `ignores`를 `src/components/**/*.tsx`로 좁히고 **프로브로 전/후를 실증**(수정 후 에러 2건), zone 4·5 회귀 3종도 확인. `CONVENTIONS.md`가 "경계는 ESLint로 강제된다"고 선언하는 이상 강제되지 않는 구간이 있으면 그 선언 자체가 거짓이 되므로 회차 안에서 닫았다
10. [DESIGN] `/sample`의 AppShell 데모가 실제 AppShell을 그대로 마운트해 `id="main-content"`와 스킵 링크가 **두 벌** 생성(CREW가 브라우저에서 실측) — HTML 표준상 ID 중복은 무효고 스킵 링크가 둘이면 키보드 이동 대상이 불확정 → `showSkipLink?: boolean`(기본 `true`) prop으로 데모에서만 미렌더. 실기동으로 `/sample`·`/home` 양쪽 모두 ID 1개·스킵 링크 1개 확인. **접근성 기준을 세우는 사람의 쇼케이스가 그 기준을 깨면 기준이 흔들린다**는 R-020 논리 그대로다
11. [DESIGN·CREW] `strings.nav.crews`("내 크루")가 PRD §5 헤더 메뉴에 대응 항목이 없고 코드 어디서도 쓰이지 않았다 → 팀장이 CREW(19개 라우트 작성자)에게 판정 위임. CREW 결론: PRD에서 "내 크루"가 등장하는 유일한 곳은 SC-06 `/home` 대시보드 **섹션** 설명이라 독립 nav 항목이 아니고, "크루 탐색"으로 고치면 `crew.explore.title`과 같은 뜻의 키가 둘 생겨 `strings/README.md` §4 위반 → **삭제**. DESIGN이 키와 관련 주석 2곳을 정리하고, CREW가 자기 파일 `crews/page.tsx:3-8` 주석을 "삭제된 키와의 대비" 대신 "PRD §5 헤더 항목명과 같은 문구라 헤더 내비와 공유"라는 적극적 이유로 다시 썼다

- 신규 등재: **I-025**(인증 필요 화면 13개의 전면 게이트 방식 미결 — route group 도입 vs 페이지별 리다이렉트. D-011로 `proxy.ts`가 금지된 상태라 전면 적용은 15개 파일 이동이 필요한 구조 변경이다. 실제 콘텐츠가 들어오는 Task 016B 시점 결정), **I-026**(인증 세션 조회의 계층 위치 미확정 — 현재 `components/shell/get-auth-session.ts`. `lib/data`는 CORE 계약, `lib/rules`는 React 비의존만이라 지금 갈 곳이 없다. Task 029A/030에서 이관 검토). **I-027**은 등재 후 같은 회차에 해결 처리됐다(위 이슈 7). "다음 이슈 번호" I-028로 갱신.

## 팀장 전체 테스트 (항상 실행)
- npm run lint: **통과** (exit 0, 에러 0 · 경고 0)
- npx tsc --noEmit: **통과** (exit 0, 에러 0)
- npm run build: **통과** (Next.js 16.2.11 Turbopack, Compiled successfully in 4.9s, 라우트 **21개** = 20개 페이지 + `/_not-found`, 전부 `ƒ Dynamic`. 2일차 대비 `/sample` 1개 증가. 앱 셸의 `getAuthSession()`이 `cookies()`를 읽으면서 기존 정적 12개가 전부 동적으로 바뀐 것은 인증 경계를 레이아웃에 둔 D-030 ④의 당연한 귀결이다)

## 문서 갱신
- docs/ROADMAP/team/*.md 상태 마커: 007(CORE)·011(DESIGN)·009B·008(CREW)·009A(BOARD) — `상태: 완료 (3일차, 2026-07-24)` 추가
- docs/CONVENTIONS.md: 1일차 이월 결정(crew-palette 판정 함수 이관) 처리 반영, 트리에 `components/shell/`·`components/sample/` 추가 및 `app/sample/` 상태 갱신, ESLint 규칙 표의 `src/components/**` 두 행을 `*.tsx` 명시로 정정, "3일차 프로브 검증 기록" 절 신설
- docs/ISSUES.md: I-025·I-026 등재, I-027 등재 후 같은 회차 해결 처리, "다음 이슈 번호" I-028로 갱신
- src/lib/rules/README.md: CREW 절·BOARD 절 신설(같은 파일을 두 명이 각자 절만 덧붙이는 방식으로 충돌 없이 운영)
- src/lib/realtime/README.md: 담당 표기 CORE→CREW 정정(할당 SSOT는 `docs/ROADMAP/team/`), 구현 반영
- eslint.config.mjs: zone 6 `ignores` 범위 축소(이슈 9)
- CLAUDE.md: **회차 작업과 무관한 사용자 지시 반영** — "화면 우선 개발" 절에 shadcn/ui 우선 사용·`frontend-design` 스킬 선호출·디자인 토큰 사용 3개 항목 추가. 다음 회차(DESIGN Task 012·013)부터 적용된다
- docs/team/*.md: 변경 없음(팀원 상태 변동 없음)

## 이월 사항(다음 회차 이후)
- **I-025 / I-026**이 이번 회차의 주된 이월분이다(위 신규 등재 참고)
- `Crew.colorKey`는 여전히 저장된 값이고 `crewColorIndex(crewId)`로 최초 배정 후 저장하는 흐름의 **호출부가 아직 없다** — Task 010(Mock 시드) 또는 크루 개설 Server Action(Task 016B)에서 실제로 호출해야 한다
- Mock 전용 API(`publishMockEvent`·`publishMockError`·`startMockEventTimer`·`resetMockRealtimeState`)가 realtime 배럴에 영구 노출 중이다. 지금은 소비자가 없어 프로덕션 번들에 섞일 대상 자체가 없고 배럴 경유 원칙(D-030 ②)상 불가피하지만, Broadcast 전환 시 `/sample` 데모 코드와 함께 정리해야 한다
- NFR-013(검색 3필드 제한)은 v0.2라 `searchProfilesByHandle`이 아직 `Profile` 전체를 반환한다 — 코드 주석에 이월 표시됨
- "UI 무수정 교체"(NFR-034/R-003)의 **완전 실증은 아직 불가능하다** — 이 계층을 소비하는 `*Container.tsx`도 `lib/data/supabase/*` 구현도 없다. Task 026 착수 시 재확인 대상이며, Task 007의 결함이 아니라 순서상 당연한 미실증이다
- `AuthSession`에 클라이언트 쪽 실시간 인증 상태 변화 구독이 필요해지면(Task 030) `layout.tsx` 구성 루트 방식을 재검토해야 한다 — `auth-session.ts` docstring이 이 가능성을 이미 예견해 뒀다
- 1·2일차 이월분 유지: 명시적 테마 토글(I-020, Task 011에서 다루지 않음 — 앱 셸 범위와 별개), 12색 초과 크루 UI(Task 013/021A), MeetupBar 대비 검증(Task 021A/024), `landing.hero.title`의 title/description 분리와 P1~P5 노출(랜딩 UI 제작 Task), `Profile.status`·`DevicePushToken.platform` 값 집합의 문서 근거 확보(Task 028 전), 링크 리소스 ID 기준 검증(R-016/FR-052 — 이번 회차에 앱 셸 내비가 생겼으나 전부 정적 경로라 리소스 ID 기반 링크는 아직 대상 없음)

## 다음 회차에 열리는 Task
완료 집합 **{001~009A, 009B, 010 제외한 001·002·003·004·005·006·007·008·009A·009B·011}** 기준 선행조건이 충족되는 Task:
- **DESIGN Task 012** (`/sample` 쇼케이스 셸과 4상태 토글) — 의존 002·011 ✓. **011 완료로 열렸다.** 이번 회차에 만든 최소 골격을 카테고리 섹션·앵커 내비·컨테이너 쿼리 프리뷰 프레임으로 확장하는 작업이다
- **BOARD Task 014** (전역 오류·경계 화면) — 의존 011 ✓. **011 완료로 열렸다**
- **CREW Task 010** (Mock 시드 데이터 생성) — 의존 006·009A·009B ✓, 선행 대기 009A ✓. **009A·009B 완료로 열렸다.** 007의 최소 픽스처를 크루 15·멤버 300·게시글 200·투표 40·메시지 2,000·Meetup 60 규모로 확장한다
- **CORE**는 다음 Task 015A가 7주차라 이번 배치에서는 대기다 — 다만 010이 007의 픽스처를 대체하므로 CREW와의 조율이 필요할 수 있다

Task 012·014는 011의 셸 위에 얹히고 010은 007의 계약 위에 얹히므로, 이번 회차에 확정한 인터페이스가 실제로 쓸 만한지 다음 회차에서 판명된다. DESIGN 013(원자 컴포넌트 15종)은 012가 끝나야 열린다.

## git
- 브랜치: day-3 (day-2에서 분기)
- 커밋 3개로 분리했다 — 성격이 다른 변경을 한 커밋에 섞으면 되돌릴 때 통째로 되돌려야 한다:
  1. **"Day 3: 데이터 접근 레이어·앱 셸·규칙 모듈 (Task 007·011·009B·008·009A)"** — 회차 산출물 56개 파일(+3874 / −91). `.gitignore`에 Playwright 검증 부산물(`.playwright-mcp/`·`crews-*.png`) 제외 규칙을 추가해 여기 포함했다 — 교차검증에 Playwright를 쓰면 매번 생기는 도구 부산물이라 커밋 대상이 아니다.
  2. **"UI 개발 규칙 추가: shadcn/ui 우선·frontend-design 선호출 (사용자 지시)"** — `CLAUDE.md` 1개 파일. 회차 작업과 무관한 사용자 지시라 분리했다.
  3. **"SCHEDULE 주차별 배치표를 사람 단위로 재작성 (출처 미확인)"** — `docs/SCHEDULE/SCHEDULE.md` 1개 파일. **이번 회차에 이 파일을 고쳤다고 보고한 팀원이 없다.** 내용 자체는 타당하고(팀 2열 → 사람 4열 + 가동 인원 열, 완료 마커 ✅·미결 차단 표시 🚧 도입, "4명 전원 가동은 47주 중 9주뿐"이라는 관찰 추가) 3일차까지의 실제 진척과도 어긋나지 않지만, 작성자를 확인하지 못해 회차 산출물과 섞지 않고 단독 커밋으로 뒀다 — 되돌릴 일이 생기면 이 커밋만 revert하면 된다. **다음 회차에 이 파일이 또 보고 없이 바뀌면 소환 프롬프트의 읽기·쓰기 범위 제약을 재점검해야 한다.**
- 푸시: **완료** — `git push -u origin day-3` 성공, `origin/day-3` 신규 브랜치 생성·추적 설정됨(사용자 승인 후 실행)
