# 8일차 작업 로그 (2026-07-24)

## 회차 요약
- 활성 팀원: **CORE·DESIGN·CREW·BOARD 4명 전원**. 6·7일차에 이어 세 회차 연속 전원 구현이다
- 이번 회차 배치 근거: 완료 집합 {001~014, 015A, 015B, 016B, 018A, 018B, 020A, 021A, 021B} 기준으로 의존이 모두 풀린 미완료 Task 7건(016A·017A·017B·019·020B·020C·022) 중 **1인 1건 폭 제한으로 4건**을 골랐다 — 016A(CREW)·020B(CORE)·022(DESIGN)·019(BOARD). 배치 내 파일 충돌·선후 의존이 없어 **4명 동시 소환**했다. CREW에 3건(016A·017A·017B), CORE에 2건(020B·020C)이 몰려 있었으나 폭 제한을 지켜 각 1건만 배정했다
- 특이사항 — **세션 한도로 1차 소환이 전원 중단됐다**: 4명 전원이 1차 산출 도중 세션 한도(리셋 13:40 KST)에 걸려 `failed`로 멈췄다. 팀장이 디스크에 남은 산출물을 실측해 완성도를 판정한 뒤(세 명은 마무리 단계, BOARD만 절반), 리셋 직후 **디스크 산출물 기준 이어받기 프롬프트로 4명을 재소환**해 완주시켰다. 이전 에이전트의 컨텍스트는 소실됐으므로 각 재소환 프롬프트에 "이미 만든 파일 목록 + 남은 일"을 명시했다
- 결과: 이슈 **2건** 발견 / 전건 해소, 전체 테스트 3/3 통과 + `/sample` 실제 렌더 실측 통과. **blocker 1건**(채팅)·minor 1건(투표)이며, blocker는 `tsc`·`lint`·`build`를 전부 통과하는 런타임 전용 결함이었다(I-037 절차가 다시 유효했다)
- 운영 실험 성공: **`docs/ISSUES.md` 팀원 직접 편집 금지 → 팀장 일괄 등재** 방식을 처음 시행했다. 7일차의 동시 편집 번호 충돌(2회)이 이번 회차엔 0건이었다(등재 요청도 0건이라 자연히 충돌이 없었다)

## 팀원별 완료 내역

### CREW (03.CREW.md)
- 완료 Task: **016A · 크루 탐색** (+ I-044 조사·결정)
- 산출물:
  - 신규 — `src/components/crews/{CrewCard,CrewGrid,CrewGridSkeleton,CrewSearchBar,CrewExploreContainer}.tsx`, `crew-explore-view-models.ts`, `fetch-crew-cards.ts`, `src/lib/rules/crew-search-query.ts`, `src/lib/actions/load-more-crews.ts`, `src/components/sample/sections/CrewExploreErrorStatePreview.tsx`
  - 수정 — `src/app/crews/page.tsx`, `src/lib/data/mock/crew.ts`(`listCrews` → `Promise<CursorPage<Crew>>` 커서 페이지네이션 + category/viewer 필터), `src/lib/strings/ko.ts`, `src/components/sample/sections/crews.tsx`
  - 결정 — `docs/prioritization-and-risks.md`(**D-040**, I-044 후속)
- 비고: 카테고리 필터는 016B 산출 `crew-category.ts`를 단일 소스로 재사용, "가입됨" 배지는 기존 `isActiveMembership`·`listCrewsByProfile` 재사용(새 판정 0건). 무한 스크롤은 `IntersectionObserver`+`startTransition`(수동 메모 없음). **I-044를 D-040으로 종결**(아래 별도 절)

### CORE (01.CORE.md)
- 완료 Task: **020B · 낙관적 렌더·재전송·ConnectionBanner**
- 산출물:
  - 신규 — `src/components/chat/ConnectionBanner.tsx`, `src/lib/rules/chat-connection-state.ts`, `src/lib/actions/resync-chat-messages.ts`, `src/components/sample/sections/ConnectionBannerPreview.tsx`, (blocker 수정) `src/components/sample/sections/MessageBubblePreview.tsx`
  - 수정 — `src/components/chat/{Composer,MessageBubble,MessageList,MessageRoomContainer,message-view-models.ts}`, `src/lib/actions/send-chat-message.ts`, `src/lib/data/mock/chat.ts`, `src/components/sample/sections/{chat.tsx,ChatMessageListPreview.tsx}`, `src/components/sample/registry.ts`, `src/lib/strings/ko.ts`
- 비고: **7일차 I-042(서버/클라이언트 모듈 인스턴스 분리) 결론을 유지** — 발행은 클라이언트(`MessageRoomContainer`)에서만, 탭 간 전달은 흉내 내지 않음. `clientKey` 멱등으로 낙관적 append 이중화 방지. **`/sample` 전용 prop 관례는 정식화하지 않기로 판단** — `ConnectionBanner.status`는 `MessageRoomContainer`가 세 값을 실제로 순환시키는 **진짜 프로덕션 prop**이라 DayDetailPanel의 `/sample` 전용 해치와 성격이 다르다(DESIGN이 코드로 세 값 순환을 확인)

### DESIGN (02.DESIGN.md)
- 완료 Task: **022 · Meetup 상세와 참석**
- 산출물:
  - 신규 — `src/components/meetup/{MeetupDetail,MeetupDetailContainer,MeetupDetailSkeleton,MeetupAttendanceActions}.tsx`, `meetup-links.ts`, `meetup-view-models.ts`, `src/lib/rules/{meetup-attendance-button-state,meetup-attendance-eligibility,meetup-participant-grouping}.ts`, `src/lib/actions/respond-meetup-attendance.ts`, `src/components/sample/sections/meetup.tsx`
  - 수정 — `src/app/(app)/meetups/[meetupId]/page.tsx`, `src/lib/data/mock/meetup.ts`, `src/lib/strings/ko.ts`, `src/lib/rules/README.md`, `src/components/calendar/DayDetailPanel.tsx`(리소스 ID 기준 링크), `src/components/sample/registry.ts`
- 비고: 정원 마감·참석 가능 판정을 `lib/rules/`에 순수 함수로 분리(컨테이너 인라인 0건, R-015). 참석자 3구분(FR-068)의 "미응답 = 활성 크루원" 판정을 `meetup-participant-grouping.ts`에 배치하고 `rules/README.md`에 근거 기록. **FR-068 AC2 탈퇴자 익명화는 시드 시점(`generate-profiles.ts`) 처리라 컴포넌트가 별도 익명화를 하지 않는다**는 설계를 CORE가 확인. `DayDetailPanel → Meetup 상세`는 `getMeetupDetailHref(meetup.id)` 리소스 ID 기준(R-016/FR-052)

### BOARD (04.BOARD.md)
- 완료 Task: **019 · 투표 UI** (이번 배치 최대 공수 10.0인일, Task 023의 선행)
- 산출물:
  - 신규 — `src/components/poll/{PollBallot,PollCountdown,PollTally,PollResult,PollEarlyCloseControl,PollPanel,PollPanelContainer,PollPanelSkeleton}.tsx`, `format-poll-countdown.ts`, `poll-view-models.ts`, `src/lib/actions/{cast-vote,close-poll,poll-auto-close}.ts`, `src/lib/rules/poll-tally-visibility.ts`, `src/components/sample/sections/{poll.tsx,PollAutoCloseSimulatorPreview.tsx}`
  - 수정 — `src/lib/rules/{poll-timezone.ts,poll-decision.ts}`(minor 수정 시 `isPollTie` 추가), `src/components/sample/registry.ts`, `src/app/(app)/crews/[crewId]/board/[postId]/page.tsx`(투표 UI를 본문 아래 Suspense로)
- 비고: **컴포넌트 6종 = PollBallot·PollCountdown·PollTally·PollResult·PollEarlyCloseControl·PollPanel**(컨테이너·스켈레톤은 카운트 밖, MeetupDetailContainer 선례). **판정 재구현 0건** — `poll-decision`·`quorum`·`poll-vote-tally`·`poll-eligibility`·`poll-timezone`(009A)을 호출만 한다. 종료 3트리거는 발화만 Mock이고 판정은 프로덕션 함수 호출(주석으로 경계 명시). 카운트다운 타임존은 `MEETUP_PROPOSAL_TIME_ZONE`("Asia/Seoul") 재사용(I-043 미결을 새로 결정하지 않고 우회)

## 교차검증 결과
리뷰 짝 팀 교차 1:1 로테이션으로 각자 상대 팀 산출물 1건씩 검증했다.
- **CORE → DESIGN(022)**: **6항목 전부 pass**, 이슈 0건. FR-068 3구분·시드 시점 익명화·리소스 ID 링크·서버/클라이언트 경계 전부 확인
- **BOARD → CREW(016A + D-040)**: **7항목 전부 pass**, 이슈 0건. Next 문서 3개(`forbidden.md`×2·`authInterrupts.md`)를 직접 대조해 D-040 인용 정확성 확인, `listCrews` 시그니처 변경 파급을 `grep -rn`으로 전수 확인(호출부 1곳뿐, 조용히 깨진 곳 0건)
- **CREW → BOARD(019)**: 7/8 pass + **minor 1건**(아래 이슈 2). Mock/프로덕션 경계·크루원 게이트 미재판정·타임존 재사용 전부 pass
- **DESIGN → CORE(020B)**: 5/6 pass + **blocker 1건**(아래 이슈 1). I-042 결론 유지·clientKey 멱등·`/sample` 전용 prop 판단 타당성 전부 pass
- **재검증 라운드**: DESIGN → CORE 020B blocker → **pass**(함수 리터럴 잔존 0건, FR-051 E1 재전송 데모 유지) / CREW → BOARD 019 minor → **pass**(동수 판정식 저장소 내 1곳으로 통일)

## 발견·해결한 이슈

### blocker 1건 — 채팅(020B), 정적 검사를 통과한다

1. **[DESIGN 발견 · CORE 020B] `/sample` 채팅 "말풍선 변형"이 서버 컴포넌트에서 함수 리터럴 prop을 전달했다 — 7일차 blocker 2 계열 재발.**
   `sections/chat.tsx:232`(서버 컴포넌트, `"use client"` 없음)이 `<MessageBubble ... onRetry={() => {}} />`를 렌더하는데, `MessageBubble`(역시 `"use client"` 없음)이 `onRetry`가 있으면 `<button onClick={onRetry}>`를 그린다. 즉 서버 컴포넌트 렌더 트리 안에서 host 엘리먼트가 함수 prop을 받아 RSC 직렬화 경계를 위반한다. **`tsc`·`eslint`가 못 잡는 런타임 결함**이다.
   - **7일차 blocker 2와 대상만 다르다** — 그때는 `MessageList`·`ConnectionBanner`(둘 다 클라이언트 컴포넌트)였고, 이번엔 **"함수 prop이 없어 무해했던" `MessageBubble`에 `onRetry`가 새로 생기며** 재발했다. `chat.tsx` docstring이 래퍼 목록에 `MessageList`·`ConnectionBanner`만 적고 `MessageBubble`은 빠뜨렸던 그 누락을 코드가 그대로 반영했다.
   - → CORE가 `MessageBubblePreview.tsx`(`"use client"`) 신설로 해소 — 직렬화 가능한 `items` 배열만 받아 클라이언트 경계 안에서 failed 항목에만 no-op `onRetry`를 붙인다. `chat.tsx`에서 `MessageBubble` 직접 import를 제거해 래퍼 없이 렌더할 길 자체를 없앴고, docstring에 재발 방지 문단("함수 prop이 없던 컴포넌트에 새로 생기면 놓치기 쉽다")을 추가했다. (재검증 DESIGN — 함수 리터럴 잔존 0건, FR-051 E1 재전송 버튼 데모 유지 확인, pass)
   - **I-037 절차가 다시 유효했다** — 팀장이 build 이후 `/sample`을 실제로 띄워 콘솔 오류 0건을 확인해 이 수정이 런타임에서도 통과함을 실증했다.

### minor 1건 — 투표(019)

2. **[CREW 발견 · BOARD 019] `PollResult.tsx:81`의 표시용 동수 판정이 `poll-decision.ts:25`의 동수 식과 중복(R-015).**
   `tally.forCount === tally.againstCount ? rejectedTie : rejectedMajority`의 비교가 `decidePollOutcome` 내부의 동수 판정과 같은 식이다. 최종 판정(passed/rejected/invalid)은 이미 `outcome` 값을 그대로 쓰므로 **기능 결함은 아니고** "부결" 확정 후 안내 문구를 tie/majority로 고르는 것뿐이지만, "같은 판정 조건이 두 곳에 있어 하나가 바뀌면 나머지가 조용히 갈리는" R-015 패턴 그 자체다.
   - → BOARD가 **추출**을 택했다(권장안). `poll-decision.ts`에 `isPollTie(tally): boolean` 순수 함수를 추가하고 `decidePollOutcome` 인라인 비교와 `PollResult`의 로컬 비교를 둘 다 이 함수 호출로 교체 — 동수 판정식이 저장소에서 **1곳(`isPollTie` 본문)**에만 존재하게 됐다. `PollOutcome`을 3종으로 좁게 유지하는 D-003 결정과 무관하게 비교식 자체는 rules 층에 뽑을 수 있었다는 판단. (재검증 CREW — 순수 추출로 동작 동일, grep으로 1곳 확인, pass)

## 이번 회차에 종결한 것 — I-044 → D-040
CREW가 I-044(라우트 레벨 권한 거부가 HTTP 500) 후속으로 `node_modules/next/dist/docs/`의 세 문서를 직접 읽어 후보 ②(`forbidden()`/`unauthorized()`)를 검증했다. **셋 다 experimental/canary 태그**라 안정 API가 아니고, `forbidden()`은 root layout에서 호출 불가라는 제약도 확인했다. **D-040으로 후보 ①(현행 유지, HTTP 500 수용) 채택** — 이유: ①실험적 API 리스크 ②부분 도입 시 같은 종류 오류가 두 렌더 경로(Next 내장 vs `error.tsx`)로 갈려 오히려 더 나쁨 ③v0.1 Mock 단계라 크롤러·RLS 403 실제 영향 없음. 이 결정이 018A(BOARD)가 세우고 D-039(CREW)가 확장한 throw+`error.tsx` 관례 전체에 적용됨을 명시했고, 실제 diff가 그 파일들을 건드리지 않음을 BOARD가 확인했다. **HTTP 상태 자체는 고치지 않았으므로 I-044는 "결정됨(보류)"으로 남고**, Task 029A/031 착수 전 `forbidden()` stable 승격 여부를 재확인한다.

## 팀장 전체 테스트 (항상 실행)
- `npm run lint`: **통과** (exit 0, 에러·경고 0건 — `poll-auto-close.ts` import/order 경고 2건은 BOARD가 `--fix`로 정리)
- `npx tsc --noEmit`: **통과** (exit 0)
- `npm run build`: **통과** (exit 0, 21개 라우트, 15/15 정적 페이지, 컴파일 9.0s)
- **`/sample` 실제 렌더 확인 (I-037 절차, build 이후 포트 3311에서 1회)**:
  - `/sample` 콘솔 **오류 0건** (경고는 Next.js 폰트 프리로드 1종뿐, 전 페이지 공통·우리 코드 무관). **020B blocker 수정의 실증** — 채팅·투표 컴포넌트가 모두 한 페이지에 렌더되는데 오류 0건이라 런타임 전용이던 blocker가 실제로 해소됨을 확인했다
  - `/crews`(게스트 탐색) 오류 0건 — `(app)` 밖이라 비로그인 세션에서 정상 렌더(D-007)
  - `/meetups/meetup-1` 오류 0건 — 정원 카운트(참석 1/정원 10)·투표 결과·리소스 ID 기준 원 제안글 링크(`/crews/crew-1/board/post-3`)·**참석자 3구분**(참석 1 서지훈 / 불참 0 "아직 없어요" / 미응답 2 김유나·강태윤)·지난 모임 도메인 상태 안내까지 전부 렌더(FR-068 실증)
- **운영 결과**: 팀원에게 build·개발 서버를 금지하고 팀장이 build 후 단일 포트로 띄우는 순서를 유지 — 이번 회차 ENOENT·레이스 0건

## 문서 갱신
- `docs/ROADMAP/team/03.CREW.md`: Task 016A에 `- 상태: 완료 (8일차, 2026-07-24)` 추가
- `docs/ROADMAP/team/01.CORE.md`: Task 020B에 동일 마커 추가
- `docs/ROADMAP/team/02.DESIGN.md`: Task 022에 동일 마커 추가
- `docs/ROADMAP/team/04.BOARD.md`: Task 019에 동일 마커 추가
- `docs/prioritization-and-risks.md`: **D-040**(라우트 레벨 권한 거부는 `error.tsx`+HTTP 500 유지, `forbidden()`/`authInterrupts` 보류) 등재, "다음 결정 번호" → D-041 갱신 (CREW가 회차 중 직접)
- `docs/ISSUES.md`: **I-044를 "결정됨(보류)"로 전이**하고 D-040 참조 추가 (팀장). **이번 회차 새 이슈 등재 0건** — 팀원 직접 편집 금지·팀장 일괄 등재 실험 결과 등재 요청 자체가 없었다
- `docs/team/*.md`: **변경 없음** — 팀원 상태 변화 없음

## 다음 회차에 열리는 Task

| Task | 담당 | 의존 | 비고 |
| --- | --- | --- | --- |
| **023** 알림 토스트·알림 센터 | BOARD | 013 ✓ · 019 ✓ | **019 완료로 새로 열렸다.** 공수 8.5인일 |
| **017A** 멤버 관리 | CREW | 013 ✓ · 016B ✓ | 기존 개방분. I-040이 명시한 `JoinRequestStatus."withdrawn"` 소비 UI가 여기 몫 |
| **017B** 크루 설정·받은 초대함 | CREW | 013 ✓ · 016B ✓ | 기존 개방분 |
| **020C** PostLinkCard·라우팅 이동·복원 | CORE | 013 ✓ · 018A ✓ · 020A ✓ | 기존 개방분. R-016(리소스 ID 기준 링크)이 처음 실제로 걸리는 Task |

- **CREW에 2건(017A·017B), CORE·BOARD 각 1건.** 1인 1건 폭 제한을 유지하면 다음 회차는 017A(CREW)·020C(CORE)·023(BOARD)가 유력하다.
- **DESIGN은 다음 회차 대기 가능성이 높다** — 남은 근접 Task 024(접근성·반응형 QA)가 `015A~023 전량` 의존인데 023이 아직 미완이다. 023이 완료되는 회차의 다음 회차에 024가 열린다. 그 사이 DESIGN에 배정할 v0.1 화면 Task가 없으므로, 다음 회차는 3인(CREW·CORE·BOARD) 구성이 될 수 있다.

### 다음 회차 운영에 반영할 것
- **`docs/ISSUES.md` 팀장 일괄 등재 방식을 유지한다.** 이번 회차에 동시 편집 충돌 0건이었다(7일차 2회 대비). 등재 요청이 있는 회차에서도 이 방식이 유효한지는 다음에 확인한다.
- **세션 한도 중단에 대비한 이어받기 절차가 검증됐다.** 팀원 컨텍스트가 소실돼도 팀장이 디스크 산출물을 실측해 완성도를 판정하고 "만든 파일 + 남은 일" 프롬프트로 재소환하면 완주한다. 재소환 프롬프트는 반드시 디스크 실측 결과(파일 목록)를 담아야 한다.
- **I-037 렌더 검증은 계속 유효하다.** 이번에도 정적 검사 3종을 전부 통과한 blocker 수정을 런타임에서 실증했다.

## git
- 브랜치: `day-8` (`day-7`에서 분기)
- 커밋 `3ffcbc8` — `Day 8: Phase 3 화면 4종 — 투표 UI·Meetup 상세·크루 탐색·채팅 낙관적 렌더 (Task 019·022·016A·020B)` (70개 파일, +4,208줄 / -253줄)
- 푸시: `origin/day-8` 성공 (2026-07-24). PR 생성 링크: https://github.com/0625chopin/MO_M/pull/new/day-8
