# 2일차 작업 로그 (2026-07-24)

## 회차 요약
- 활성 팀원: CORE · CREW (2명). DESIGN·BOARD는 유휴 — 담당 Task가 이번 배치의 선행(006·005)을 기다린다.
- 이번 회차 배치 근거: 완료 집합 {001, 002, 003, 004} 기준 선행조건이 충족된 미완료 Task는 **CORE 006**(의존 001 ✓, 선행 대기 없음)과 **CREW 005**(의존·선행 대기 001 ✓) 2건이다. 둘 다 001에만 의존해 서로 독립이므로 병렬 착수했다.
- 리뷰 짝 대체: CORE·CREW의 프로필상 리뷰 짝은 둘 다 DESIGN·BOARD(B팀)인데 이번 회차 유휴라, 규칙에 따라 활성 팀원끼리 교차검증했다(CORE ↔ CREW).
- 결과: 이슈 **7건** 발견 / 전건 해소, 전체 테스트 3/3 통과.

## 팀원별 완료 내역

### CORE (01.CORE.md)
- 완료 Task: **006 · 도메인 TypeScript 타입 정의**
- 산출물: `src/lib/types/`의 13개 파일 — `common.types.ts`(Id·ISODateTimeString·ISODateString), `profile.types.ts`(Profile·AuthAttempt), `crew.types.ts`, `invitation.types.ts`, `join-request.types.ts`, `board.types.ts`(Board·Post·Comment), `poll.types.ts`, `meetup.types.ts`, `chat.types.ts`, `notification.types.ts`, `moderation.types.ts`, `permission.types.ts`, `index.ts`(배럴). 부수로 `docs/prd/PRD.md`(§7 헤더 정정), `docs/ISSUES.md`(I-024 등재).
- 규모: 엔티티 **22개**, 열거형·유니온 **21개**, 판정 결과 타입 **3벌**(정족수 D-032, 정원 D-019, 권한 3.3절).
- 비고: 판정 **함수**는 두지 않고 입출력 타입만 뒀다(`lib/types/README.md` 지침 — 로직은 Task 009A/009B의 `lib/rules/` 몫). 모든 필드가 순수 데이터 타입(Date 객체·클래스·Mock 전용 필드 없음)이라 Mock↔Supabase 공용이 성립한다(NFR-035). 교차검증에서 권한 액션 누락과 멱등성 충돌을 발견·수정(아래 이슈 3~4).

### CREW (03.CREW.md)
- 완료 Task: **005 · 라우트 구조와 페이지 골격 생성**
- 산출물: `src/app/` 아래 **19개 page.tsx** — `/`, `/home`, `/signup`, `/login`, `/onboarding`, `/crews`, `/crews/new`, `/crews/[crewId]`, `/crews/[crewId]/board`, `/crews/[crewId]/board/new`, `/crews/[crewId]/board/[postId]`, `/crews/[crewId]/chat`, `/crews/[crewId]/members`, `/crews/[crewId]/settings`, `/calendar`, `/meetups/[meetupId]`, `/notifications`, `/settings`, `/invitations`. 부수로 `src/lib/strings/ko.ts`(타이틀 키 15개 추가), `src/lib/strings/README.md`(§4 최상위 도메인 목록 갱신).
- 비고: D-011대로 로케일 세그먼트 없이 평면 구성했고 `proxy.ts`·`middleware.ts`를 만들지 않았다. 19개 페이지 전부 `@/lib/data`·`@/lib/realtime` import 없이 정적 마크업만 두어 D-030 ①을 지켰고, 인증 경계는 페이지에 인라인하지 않고 Task 011(AppShell)로 이관했다(D-030 ④). 교차검증에서 경로 이탈과 문자열 하드코딩을 발견·수정(아래 이슈 1~2).

## 교차검증 결과
- **CORE → CREW(005)**: 1차 6항목 중 4 PASS · 1 PARTIAL FAIL(경로 `/account`) · 1 FAIL(문자열 하드코딩) · 1 확인 불가(링크 미존재). 수정 후 재검증 5항목 중 4 PASS · 1 PARTIAL(콘텐츠 품질). 최종 확인 **PASS** — "이번 회차 교차검증을 닫아도 된다".
- **CREW → CORE(006)**: 1차 7항목 중 6 PASS · 1 부분 fail(PermissionAction 커버리지). 수정 후 재검증 **7항목 전부 PASS**, 새 이슈 없음.
- 검증 방식은 전수 대조였다 — CORE는 19개 page.tsx 전부 재열람 + 빌드 라우트 테이블 실증 + 주석 제거 후 한글 리터럴 재검사, CREW는 요구사항 3.3절 35행 직접 재계수 + PRD §7 표 재계수 + FR-066/067 AC 대조.

## 발견·해결한 이슈
1. [CREW] `/account` 경로가 `requirements.md` 5.1.1절 SC-19의 계획 경로 `/settings`와 어긋났고 이를 정당화하는 결정 기록이 없었다(미문서화 임의 변경) → SSOT를 따라 `/settings`로 되돌림. `/crews/[crewId]/settings`(SC-15)와 세그먼트 깊이가 달라 충돌 없음을 빌드 라우트 테이블로 실증 (재검증 CORE pass)
2. [CREW] 15개 페이지가 `<p>SC-09 · crewId={crewId}</p>` 형태의 리터럴을 JSX에 하드코딩해 브라우저에 렌더 — NFR-023 위반이자 내부 식별자 노출 → `ko.ts`에 타이틀 키 15개 추가 후 `t()` 경유 실제 한국어 타이틀로 교체, 동적 파라미터를 화면에서 제거. **CORE 집계에 잡히지 않았던 4개 페이지(board·board/new·login·notifications)의 잔여 리터럴을 CREW가 스스로 발견해 함께 제거** (재검증 CORE pass — 주석 제거 후 한글 리터럴 0건 실증)
3. [CORE] `permission.types.ts`의 `PermissionAction`이 3.3절 권한 매트릭스 행을 다 덮지 못해 `PermissionCheckContext.crewVisibility`가 **쓸 액션이 없는 죽은 필드**였다 → 전 35행 전수 재대조 결과 CREW가 지목한 FR-014·FR-011 외에 **FR-021·FR-022도 누락**임이 드러나 액션 4개(`crew:browse`·`crew:read`·`invitation:respond`·`crew:request_join`) 추가. 상단 주석의 "전 행 1:1 대응"이라는 과장을 "33행 대응, 회원가입·로그인 2행은 크루 스코프 role 판정 대상이 아니라 의도적 제외(D-030 ④)"로 정정 (재검증 CREW pass — 35행 직접 재계수)
4. [CORE] `meetup.types.ts`의 `AttendanceJoinResult.reason: "already_responded"`가 근거 없이 추가됐고, **FR-067 E2가 "이미 불참 상태 → 무시(멱등)"로 조용한 성공을 요구**하는 것과 충돌 → `{success:true; changed:boolean}`으로 재구성(`changed:false`가 멱등 응답). `success:false, reason:"full"`(D-019 정원 조건부 UPDATE 실패)은 유지. 분기마다 FR·D 번호를 주석에 부착 (재검증 CREW pass)
5. [문서] PRD §7 도입부가 "엔티티 20종"이라 서술하는데 **자기 표는 22행**이었다 — D-020(AuthAttempt 추가)·D-035(필드 복구) 반영 후 헤더가 갱신되지 않은 사실 오류. `requirements.md` 5.2절은 이미 "22종"으로 자기 표와 일치 → 정정 대상은 PRD이며 `docs/prd/PRD.md:524`를 22종으로 수정, 표·필드는 미변경 (재검증 CREW pass)
6. [CREW] `landing.hero.title` 값이 "랜딩" — 규약 위반은 아니나(strings 모듈 경유) **페이지 유형을 가리키는 내부 개발 용어가 사용자 헤더로 노출**됨. PRD §6은 이 화면에 "제품 한 줄 소개"를 요구 → `requirements.md` 1.1절 "제품 한 줄 정의" 원문으로 교체(CORE가 한 글자 단위 일치 확인) (재검증 CORE pass)
7. [CREW] 위 교체 시 주석이 이 문구를 "D-001로 확정된 문구"라 서술했으나, **D-001의 실제 제목은 "'모임'을 Crew·Meetup 두 엔티티로 분리한다"**이고 `requirements.md:35`의 D-001 언급은 1.2절(P1~P5) 확인을 가리킨다 — 코드에 남는 결정 오귀속 → 출처를 1.1절 원문으로 정확히 적고 D-001은 배경 결정으로만 서술하도록 주석 정정 (팀장 지시, 값·키 미변경)

- 이월 등재: **I-024** — `Notification.payload`가 `Record<string, unknown>`이라 `NotificationType`별 payload 형태를 타입이 구분해주지 못해 소비 컴포넌트마다 unsafe cast가 필요하다. discriminated union(`NotificationPayloadMap`) 제안. 소비처인 Task 023(14~16주차)이 멀어 이번 회차 범위에서 제외했다. ISSUES "다음 이슈 번호"를 I-025로 갱신.

## 팀장 전체 테스트 (항상 실행)
- npm run lint: **통과** (에러·경고 0)
- npx tsc --noEmit: **통과** (exit 0, 에러 0)
- npm run build: **통과** (Next.js 16.2.11 Turbopack, Compiled successfully, 라우트 20개 = 19개 페이지 + `/_not-found`, 정적 12 · 동적 8. `/settings` 생성·`/account` 부재 확인)

## 문서 갱신
- docs/ROADMAP/team/*.md 상태 마커: 006(CORE)·005(CREW) — `상태: 완료 (2일차, 2026-07-24)` 추가
- docs/prd/PRD.md: §7 도입부 "엔티티 20종" → "22종" 정정(이슈 5)
- docs/ISSUES.md: I-024 등재, "다음 이슈 번호" I-025로 갱신
- src/lib/strings/README.md: §4 최상위 도메인 목록에 신규 6개(`landing`·`home`·`crew`·`calendar`·`account`·`invitation`) 반영
- docs/team/*.md: 변경 없음(팀원 상태 변동 없음)

## 이월 사항(다음 회차 이후)
- `landing.hero.title`(약 70자)을 `title`(짧은 슬로건) / `description`(한 줄 정의)으로 분리 → 실제 랜딩 UI 제작 Task. 지금은 라우트·문자열 배선을 증명하는 스캐폴드 단계라 팀장이 이월 확정
- PRD §6이 요구하는 랜딩 **P1~P5 핵심 가치 노출**은 헤더 한 문장으로 채워지지 않는다 — `landing` 도메인에 하위 키 추가 필요
- 동적 라우트 페이지에서 `params`를 함수 시그니처에서 뺐다(미사용 상태에서 `no-unused-vars` 회피). Next.js는 폴더 구조로 라우트 타입을 판정하므로 규약 위반이 아님을 빌드로 실증했고, 각 페이지 docblock에 재도입 시점(Task 016B/017A/017B)을 명시했다
- 링크 리소스 ID 기준(R-016/FR-052) 검증은 **이번 회차에 대상이 없었다** — 페이지 간 실제 링크가 0건(내비게이션이 Task 011/016B로 이관됨). 링크가 실제로 생기는 회차에 재검증 필요
- `Profile.status`·`DevicePushToken.platform` 값 집합은 문서 근거 없이 추론했다(주석에 근거·리스크 표시됨). 스키마 확정(Task 028) 전 고객 확인 권장 — CREW 검증 결과 위험도는 낮음
- 1일차 이월분 유지: `crew-palette.ts` 판정 함수의 `lib/rules/` 이관(Task 006/007 전후), 명시적 테마 토글(I-020, Task 011), 12색 초과 크루 UI(Task 013/021A), MeetupBar 대비 검증(Task 021A/024)

## 다음 회차에 열리는 Task
완료 집합 **{001, 002, 003, 004, 005, 006}** 기준 선행조건이 충족되는 Task — **4명 전원 활성**이 된다:
- **CORE Task 007** (데이터 접근 레이어 경계와 Mock 구현) — 의존 001·006 ✓, 선행 대기 없음
- **DESIGN Task 011** (앱 셸·전역 레이아웃·인증 경계) — 의존 001·003·005 ✓. **005 완료로 열렸다**
- **CREW Task 009B** (비즈니스 규칙 순수 함수 — 권한 매트릭스·멤버십 전이·색 배정) — 의존 002·006 ✓
- **CREW Task 008** (실시간 구독 인터페이스 추상화와 Mock 이벤트 소스) — 의존 001·006 ✓
- **BOARD Task 009A** (비즈니스 규칙 순수 함수 — 투표 판정·정족수·타임존) — 의존 002·006 ✓

CREW가 2건(009B·008)을 지므로 주차 순서(009B 3~4주차 → 008 4주차)대로 009B를 먼저 붙인다. Task 007과 009A·009B는 이번 회차 타입(`src/lib/types/`)을 직접 소비하므로, 006에서 확정한 판정 결과 타입 시그니처가 실제로 쓸 만한지 여기서 판명된다. DESIGN 012·BOARD 014는 011이 끝나야 열린다.

## git
- 브랜치: day-2 (day-1에서 분기)
- 커밋: "Day 2: 도메인 타입과 라우트 골격 (Task 006·005)" — 39개 파일 변경(+973 / −66). day-2 브랜치의 단일 커밋이라 `git log day-2 -1`로 해시를 확인한다(이 파일이 커밋에 포함돼 해시를 여기 박으면 자기 참조로 어긋난다)
- 커밋 제외: `.claude/settings.json`·`.claude/skills/**` — 이번 회차 팀 작업이 아니라 세션 도구 설정(agent teams 플래그·serena 플러그인·tmux 모드)이라 스테이징하지 않았다. 1일차와 동일한 처리다
- 푸시: 사용자 승인 대기
