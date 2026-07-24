# 7일차 작업 로그 (2026-07-24)

## 회차 요약
- 활성 팀원: **CORE·DESIGN·CREW·BOARD 4명 전원**. 6일차에 이어 두 회차 연속 전원 구현이다
- 이번 회차 배치 근거: 완료 집합 {001~014, 015A, 015B, 018A, 021A} 기준으로 의존이 모두 풀린 Phase 3 화면 5건(016A·016B·018B·020A·021B) 중 **1인 1건으로 폭을 제한해 4건**을 골랐다 — 016B(CREW)·020A(CORE)·021B(DESIGN)·018B(BOARD). **016A(크루 탐색)는 제외**했다. CREW에게 016A·016B가 동시에 열려 있었지만 6일차가 016B를 우선으로 지목했고(017A·017B의 선행이자 **I-035를 닫는 Task**), 한 사람에게 두 건을 얹으면 폭 제한이 무너진다
- 배치 내 선후: **016B → 018B를 직렬**로 뒀다. 016B가 크루원 게이트의 라우트 레벨 위치를 확정하는데, 동시 진행하면 018B가 크루원 판정을 자기 컨테이너에 인라인해 **R-015(판정 로직 중복)가 재발**한다 — 6일차 015A→015B와 같은 구조다. 020A·021B는 파일 충돌이 없어 016B와 동시 소환했다
- 결과: 이슈 **9건** 발견 / 전건 해소, 전체 테스트 3/3 통과. **blocker 2건**(둘 다 채팅)·major 2건·minor 5건이며, **blocker 2건은 `tsc`·`lint`·`build`를 전부 통과하는 런타임 전용 결함**이었다
- **I-037(렌더 검증 공백)을 이번 회차에 절차로 닫았다.** 그 절차가 처음 시행되자마자 코드 열람으로는 발견 불가능했던 **I-044**를 잡아냈다

## 팀원별 완료 내역

### CREW (03.CREW.md)
- 완료 Task: **016B · 크루 탐색·개설·크루 홈 — 크루 개설·크루 홈**
- 산출물:
  - 신규 — `src/lib/rules/{crew-name-validation,crew-description-validation,crew-category,join-request-eligibility,join-request-button-state}.ts`, `src/lib/actions/{create-crew,request-join-crew,withdraw-join-request}.ts`, `src/components/crews/{crew-links.ts,CrewColorDot,CrewCreateForm,CrewCreateFormContainer,CrewHome,CrewHomeSkeleton,CrewHomeContainer,CrewIntroPreview,PrivateCrewNotice,JoinRequestButton}`, `src/app/(app)/crews/[crewId]/layout.tsx`, `src/components/sample/sections/crews.tsx`
  - 수정 — `src/lib/data/mock/{crew,join-request}.ts`, `src/lib/types/join-request.types.ts`, `src/lib/strings/ko.ts`, `src/lib/rules/README.md`, `src/app/(app)/crews/new/page.tsx`, `src/app/crews/[crewId]/page.tsx`, `src/components/sample/registry.ts`
  - 문서 — `docs/prioritization-and-risks.md`(**D-039**), `docs/CONVENTIONS.md`(D-030 ④), `docs/ISSUES.md`(I-035 해소, I-038·I-040 등재)
- 비고: **`createCrew`가 게시판·채팅방을 아예 만들지 않던 기존 결함을 발견해 고쳤다** — FR-010 AC2 위반이 Task 007 시점부터 잠복해 있었다. 회차 중 021B를 검증하다 **자기 산출물(`CrewColorDot`)이 D-026 표준을 안 지킨 것을 스스로 발견해 고쳤다**(`certainty-confirmed` 유틸리티 대신 `backgroundColor` 인라인)

### CORE (01.CORE.md)
- 완료 Task: **020A · 채팅 — MessageList/Bubble/Composer·윈도잉**
- 산출물:
  - 신규 — `src/components/chat/{MessageListContainer,MessageRoomContainer,MessageList,MessageBubble,MessageListSkeleton,Composer}.tsx`, `src/components/chat/{message-view-models,resolve-chat-viewer,format-message-time}.ts`, `src/lib/actions/{send-chat-message,load-earlier-messages}.ts`, `src/lib/rules/chat-message-validation.ts`, `src/components/sample/sections/{chat.tsx,ChatMessageListPreview.tsx}`
  - 수정 — `src/app/(app)/crews/[crewId]/chat/page.tsx`, `src/components/sample/registry.ts`, `src/lib/strings/ko.ts`, `docs/ISSUES.md`(I-039·I-042), `docs/CONVENTIONS.md`
- 비고: **가상화 라이브러리를 도입하지 않았다** — FR-051 AC3 원문이 요구하는 것은 "최신 50건 + 위로 이어 로드"이고, 커서 페이지네이션으로 DOM에 올라가는 메시지 수 자체를 제한하는 것이 원문 그대로라는 판단이며 DESIGN이 원문 대조로 확인했다. 승인 없이 의존성을 추가하지 않은 판단도 지시대로였다

### DESIGN (02.DESIGN.md)
- 완료 Task: **021B · 통합 캘린더와 홈 대시보드 — 크루 필터·DayDetailPanel·홈 대시보드**
- 산출물:
  - 신규 — `src/components/calendar/{CrewFilterPanel,CrewLegend,DayDetailPanel,HomeCalendarSummary,HomeCalendarSummaryContainer,MonthCalendarSkeleton,HomeCalendarSummarySkeleton}.tsx`, `src/components/calendar/{crew-filter-cookie,crew-filter-client}.ts`, `src/lib/rules/crew-filter-selection.ts`, `src/hooks/use-media-query.ts`, `src/components/sample/sections/DayDetailPanelPreview.tsx`
  - 수정 — `src/components/calendar/{MonthCalendar,MonthCalendarContainer}.tsx`, `calendar-types.ts`, `date-grid.ts`, `src/lib/data/mock/meetup.ts`, `src/lib/strings/ko.ts`, `src/lib/rules/README.md`, `src/app/(app)/{home,calendar}/page.tsx`, `src/components/sample/sections/calendar.tsx`, `docs/ISSUES.md`(I-041)
- 비고: 필터 선택 상태를 **URL 쿼리가 아니라 쿠키**로 유지했다 — FR-061 AC5 "다음 방문까지 유지"는 쿼리 없는 재진입에서 초기화되므로 쿼리로는 만족할 수 없다는 판단이며 CORE가 원문 대조로 확인했다. **서버가 쿠키 값을 그대로 믿지 않고 실제 소속 크루와 교집합을 취한다**는 것을 CREW가 코드로 직접 검증했다

### BOARD (04.BOARD.md)
- 완료 Task: **018B · 게시판·글쓰기·게시글 상세 — 글쓰기**
- 산출물:
  - 신규 — `src/components/board/{PostWriteForm,PostWriteContainer}.tsx`, `src/components/board/post-draft-storage.ts`, `src/lib/actions/{create-post,check-duplicate-meetup-date}.ts`, `src/lib/rules/{meetup-proposal-schedule,post-content-validation}.ts`
  - 수정 — `src/app/(app)/crews/[crewId]/board/new/page.tsx`, `src/lib/types/board.types.ts`, `src/lib/data/mock/{board.ts,fixtures.ts,seed/generate-board.ts}`, `src/lib/rules/{post-edit-lock.ts,README.md}`, `src/lib/strings/ko.ts`, `src/components/sample/sections/board.tsx`, `docs/ISSUES.md`(I-043)
- 비고: **FR-034 E1~E3에 명시되지 않은 `validatePollDuration`(D-003 기한 1h~14일)을 스스로 넣었다** — "제안글 등록이 Poll 생성의 유일 경로라 여기서 안 걸면 어디서도 안 걸린다"는 근거이고, CREW가 `grep -rn "createPoll("` 전수 검색으로 호출부가 `create-post.ts:159` 단 한 곳임을 확인해 뒷받침했다

## 교차검증 결과
- **DESIGN → CORE(020A)**: **blocker 2건**. 나머지 전 항목 pass. 특히 `aria-live` 부재를 의심했다가 NFR-021 근거란("토스트·집계 갱신에 국한된다")으로 **기각**하고 "메시지마다 낭독하면 스팸"이라는 판단까지 붙였다
- **CORE → DESIGN(021B)**: **major 2건 + minor 1건**, 나머지 6항목 pass. `useMediaQuery`의 하이드레이션 불일치를 의심했다가 `getServerSnapshot`이 항상 `false`임을 확인해 기각
- **CREW → DESIGN(021B, 지정 리뷰어)**: **fail 1건(minor)** + 5 pass. CORE와 **독립적으로 같은 `CrewFilterPanel` 문제에 도달**했다(CORE는 major로 상향)
- **CREW → BOARD(018B, 지정 리뷰어)**: **7개 각도 전부 pass**, blocker·major 0건. 참고 관찰 2건
- **BOARD → CREW(016B, 지정 리뷰어)**: **7항목 전부 pass**. 팀장이 잘못 물은 질문을 코드로 갈라 정정했다(아래 참고)
- **CORE → BOARD(`Post` 타입 확장, 소유자 확인)**: 4항목 전부 pass. 참고 2건
- **CORE → CREW(`mock.ts` 정정, 소비자 확인)**: pass
- **재검증 라운드**: DESIGN → CORE 020A blocker 2건 + minor 2건 → **전부 pass** / CORE → DESIGN 021B major 2 + minor 1 + Suspense → **전부 pass** / CREW → DESIGN `CrewFilterPanel` → **pass**

## 발견·해결한 이슈

### blocker 2건 — 둘 다 채팅(020A), 둘 다 정적 검사를 통과한다

1. **[DESIGN 발견 · CORE 020A] 발신 메시지가 실시간으로 전달되지 않았다 — 서버/클라이언트 모듈 인스턴스 분리.**
   `send-chat-message.ts`는 `"use server"`라 그 안의 `publishMockEvent`가 **Node.js 프로세스**에서 실행되는데, `subscribeToRoom`은 `MessageRoomContainer`(`"use client"`)의 `useEffect` 안이라 **브라우저에서만** 실행된다. `mock.ts:27`의 `const rooms = new Map()`은 모듈 스코프 싱글턴이고 **Next.js는 서버 번들과 클라이언트 번들을 따로 만들므로 두 Map이 완전히 별개 인스턴스**다. Server Action은 구독자 0명인 서버 쪽 유령 Map에 발행하고 `mock.ts:62-63`의 `if (!room) return;`에서 조용히 사라졌다 — **FR-051 AC1("B의 화면에 1초 이내 표시") 완전 실패**, 발신자 본인도 새로고침 전엔 자기 메시지를 못 봤다.
   - **DESIGN 지적의 요점은 원인이 CORE의 코드가 아니라 문서에 있었다는 것이다** — `mock.ts:56-59`의 "Mock Server Action이 ... 쓴다"는 안내 자체가 이 함정을 앞서 유도했다.
   - → CORE가 발행을 클라이언트로 옮겼다(`Composer`가 `onSent`로 결과를 올리고 `MessageRoomContainer.handleSent`가 브라우저에서 발행 → 자기 구독이 되받아 append). **탭 간·사용자 간 전달은 전송 계층이 없어 구조적으로 불가능**하므로 흉내 내지 않고 한계로 문서화했다(팀장 지시 — 실데이터 전환 때 걷어내야 할 코드를 만들지 않는다). **I-042** 등재.
   - → CREW가 Task 008 소유자로서 `mock.ts` 문구를 정정했고, **배럴 `index.ts`에도 같은 오도 문구가 있는 것을 찾아 함께 고쳤다** — 한 곳만 고치면 다음 사람이 다른 경로로 같은 함정에 빠진다. CORE가 소비자 확인 pass(자기가 실제로 읽었던 두 경로 모두에 경고가 걸리는지 대조).

2. **[DESIGN 발견 · CORE 020A] `/sample` 채팅 섹션이 RSC 함수 prop 직렬화 경계를 위반했다.**
   `chat.tsx:115,135,148`이 서버 컴포넌트에서 `onLoadMore={() => {}}` 함수 리터럴을 클라이언트 컴포넌트에 넘겼다.
   - **결정적인 부분은 이 저장소가 이미 문서화하고 회피해 온 문제라는 것이다** — `calendar.tsx:226`·`primitives.tsx:189`에 "onRetry는 함수(클로저)라 이 파일(서버 컴포넌트)에서 만들 수 없다"는 주석이 있고 `BoardErrorStatePreview.tsx`가 정확히 이를 피하려 만들어진 래퍼다. 전례를 놓쳤다.
   - → `ChatMessageListPreview.tsx`(`"use client"`) 신설로 해소. (재검증 DESIGN — `chat.tsx`에 함수 prop 잔존 0건 전수 확인, pass)

### major 2건 — 둘 다 021B의 `/sample` 커버리지

3. **[CREW·CORE 동시 발견 · DESIGN 021B] `CrewFilterPanel`이 `isPending`을 버려 실재하는 로딩이 화면에 없었다.**
   `const [, startTransition] = useTransition();`로 pending 신호를 구조분해에서 버렸고, `/sample` note는 "순수 UI 토글이라 로딩·오류가 성립하지 않는다"고 적었다. 그런데 `persist()`는 `router.refresh()`를 호출하고 **컴포넌트 자신의 docstring이 "서버 재조회가 진행되는 동안에도 입력이 막히지 않는다"고 명시**해 note와 docstring이 서로 모순됐다.
   - 두 검증자가 **독립적으로 같은 지점에 도달**했다(CREW minor → CORE major 상향).
   - → DESIGN이 **`disabled`가 아니라 `aria-busy`+장식 스피너**를 택했다. 근거: 체크박스를 잠그면 docstring이 명시한 "연달아 토글해도 이전 재조회를 기다리지 않는다"(R-017 응답성) 설계를 스스로 어긴다. `aria-live`는 쓰지 않았다 — 토글마다 강제 낭독하면 스팸이다. (재검증 CREW·CORE 양쪽 pass. CREW가 `persist()`에 이전 refresh를 기다리는 코드가 없음을 코드로 확인해 R-017 논거 성립을 뒷받침했다)

4. **[CORE 발견 · DESIGN 021B] `DayDetailPanel`의 `/sample` 커버리지가 2/4였는데 docstring은 4상태가 "존재한다"고 현재형으로 단언했다.**
   - **DESIGN 자신의 전례와 어긋난 것이 지적의 핵심이다** — 같은 파일 `sections/calendar.tsx:179-211`의 `MonthCalendar` 항목은 정확히 같은 상황(실제 라우트에 Suspense 미연결)인데도 로딩 스켈레톤 patch를 만들어 뒀다. 몇 줄 아래에 같은 기준을 적용하지 않았다.
   - → `status?: "default"|"loading"|"error"` prop 추가로 4/4 달성, docstring을 사실로 정정. **CORE가 pass하면서 주의를 함께 남겼다** — `DayDetailPanel`이 지금 이 저장소에서 "`/sample` 전용" prop을 가진 **유일한 프로덕션 컴포넌트**이고, 오버레이형이 늘 때마다 각자 다른 이름(`status`·`mode`·`_sampleState`)을 즉흥적으로 만들면 프로덕션 인터페이스가 지저분해진다. **이 패턴을 한 번 더 쓸 일이 생기면 그때 `CONVENTIONS.md`에 관례로 정식화한다**(지금 되돌리지 않음).

### minor 5건

5. **[CORE 021B] `parseCrewFilterSelection`이 `lib/rules/`가 아니라 `calendar-types.ts`에 있었다.** CORE 논지: `"use client"` 값 export 함정 회피는 *"`MonthCalendar.tsx`에 두면 안 된다"* 만 정당화하지 *"`calendar-types.ts`여야 한다"* 는 근거가 아니다 — `lib/rules/`도 plain ts라 같은 이유로 안전하다. → DESIGN이 `src/lib/rules/crew-filter-selection.ts`로 이관하되 **`serializeCrewFilterSelection`(쉼표 join, 분기 없음)은 "판정이 아니라 순수 포맷팅"이라 남겼다.** 3일차 `resolveCrewColorCollision` 이관(판정→`lib/rules/`, 정규화는 데이터 모듈 잔류)과 같은 논리이며, 근거를 세 곳(신규 파일·`calendar-types.ts`·`rules/README.md`)에 기록했다.

6. **[CORE 020A] `sections/chat.tsx`의 note가 옛 설계(`useActionState`)를 서술해 실제 구현(`useTransition`)과 어긋났다** → 정정.

7. **[DESIGN 제안 · 020A] `useActionState` ↔ `useTransition`+수동 상태의 갈림에 기준 기록이 없었다.** DESIGN은 갈림 자체를 **정당하다고 pass** 판정하면서(성공 시 리다이렉트하는 `LoginForm`은 이 충돌이 안 생기고, 같은 화면에 남는 Composer는 `react-hooks/set-state-in-effect`에 걸린다) 기준을 남기자고 제안했다 → `docs/CONVENTIONS.md`에 **"Server Action 폼 상태 관리"** 절 신설. 이 팀이 반복해 지적받는 것은 갈림 자체가 아니라 기록이 없는 상태다.

8. **[CREW 자체 발견 · 016B] `CrewColorDot`이 D-026 표준을 안 지켰다.** 021B를 검증하다 자기 파일이 `certainty-confirmed` 유틸리티 대신 `backgroundColor: "var(--crew-color)"`를 인라인하는 것을 발견했다 — 시각 결과는 같지만 "크루색 채움은 이 유틸리티 하나로 통일"에서 벗어난 재구현이다 → `MeetupBar`·`CrewLegend`와 같은 패턴으로 수정.

9. **[CREW·CORE 동시 발견 · 018B] `post-edit-lock.ts`의 `PostEditableField`가 신규 3필드를 열거하지 않았다.** 기능 위험은 없다는 데 두 검증자가 일치했으나(`UpdatePostInput`이 `title`·`body`만 노출) 다음 사람이 "왜 3개가 빠졌지" 헷갈린다 → BOARD가 **유니온 추가가 아니라 주석 쪽을 택했다**. 근거: 넣으면 아무도 호출하지 않는 조합(`isPostFieldEditable(type, "startTime")`)만 늘고, 이 3필드를 다루는 편집 화면 자체가 없어 "잠글 대상"이 아직 없다. "편집 화면이 생기면 그때 추가"라는 조건을 함께 남겼다.

### 팀장 지시 오류 — 팀원이 코드로 정정했다

10. **[BOARD 정정] 팀장이 `JoinRequestStatus."withdrawn"`을 "타입엔 추가했는데 실제 전이는 `rejected`로 합류하는 죽은 값 아니냐"고 물었는데, 서로 다른 두 엔티티를 섞은 질문이었다.**
    BOARD가 코드로 갈랐다 — `JoinRequest.status`의 `"withdrawn"`은 `withdrawJoinRequest`(`join-request.ts:91`)가 **실제로 설정**하고 staff 반려의 `"rejected"`와 분리돼 있어 죽은 값이 아니다. "`rejected`로 합류"는 **`CrewMembership.status`**(다른 타입) 얘기이고 거기엔 애초에 `"withdrawn"`이 없다(2.4절 다이어그램 7개 값 불변). 두 필드는 역할이 달라 공존한다 — 전자는 "왜 끝났는지"의 정밀 기록, 후자는 "재신청 가능한가"만 보는 근사다. 아직 소비 UI가 없는 것은 orphan이 아니라 **Task 017A를 위한 선반영**이며 I-040이 명시한다.

## 이번 회차에 닫은 것 — I-035와 I-037

### I-035 → **D-039**로 확정
`src/app/(app)/crews/[crewId]/layout.tsx`를 신설해 `getCrewMembership`+`isActiveMembership`로 **활성 크루원 여부만** 라우트 레벨에서 한 번 판정하고 `board`·`chat`·`members`·`settings` 전체에 적용했다. 경계가 정확한지 BOARD가 `find` 실측으로 확인했다:
- **게스트 허용 대상은 `(app)` 밖에 그대로 있다** — `src/app/crews/page.tsx`(FR-014)·`src/app/crews/[crewId]/page.tsx`(FR-011, D-007). 6일차 I-036에서 한 번 잘못됐던 자리이고, 이번엔 `(app)/crews/[crewId]/`와 완전히 별개 트리로 분리돼 레이아웃이 적용되지 않는다.
- **`crews/new`도 미적용** — `[crewId]`의 형제 세그먼트다.
- **`resolveBoardViewer` 컨테이너 방어는 제거하지 않았다.** CREW 근거: 그 컨테이너는 role 세분(staff/owner)을 `post:create` 판정에도 재사용하는데 레이아웃은 이진 판정만 하므로 지우면 role 계산을 다른 데서 새로 해야 한다. **저자인 BOARD가 이 판단을 확정**했고, `CONVENTIONS.md` D-030 ④에 구분이 명시돼 다음 사람이 "중복이니 지운다"고 오판할 여지가 낮음도 함께 확인했다.

### I-037 → 절차 확정·시행, **해결됨**
후보 ①(팀장이 개발 서버로 `/sample` 콘솔 확인)을 **build 이후 1회**로 순서를 고정해 채택했다. 6일차의 걸림돌(개발 서버와 `npm run build`의 stale chunk 충돌)은 **순서로 회피**한다 — 팀원에게 `tsc`·`eslint`만 허용하고 build·개발 서버를 모두 금지한 뒤, 팀장이 lint→tsc→build를 전부 끝내고 **그 다음에** 다른 포트로 한 번만 띄운다. 후보 ②(팀원 각자 확인)는 채택하지 않았다 — 넷이 각자 서버를 띄우면 6일차 레이스 컨디션이 포트 단위로 재현된다.

## 팀장 전체 테스트 (항상 실행)
- `npm run lint`: **통과** (exit 0, 에러·경고 0건)
- `npx tsc --noEmit`: **통과** (exit 0)
- `npm run build`: **통과** (exit 0, 21개 라우트, 15/15 정적 페이지 생성, 컴파일 7.7s)
- **`/sample` 실제 렌더 확인 (I-037 신규 절차, build 이후 포트 3311에서 1회)**:
  - `/sample` 콘솔 **오류 0건**. 경고는 Next.js 폰트 프리로드 1종뿐이고 전 페이지 공통이라 우리 코드와 무관하다
  - 상호작용 실측 — `DayDetailPanel` 4상태 트리거 전부 존재·열림·Esc 닫힘, `CrewFilterPanel` "전체 해제" 토글 후에도 오류 0건
  - 신규 라우트 7개 전부 오류 0건 — `/crews`·`/crews/[crewId]`(게스트), `/crews/new`·`/crews/[crewId]/chat`·`/crews/[crewId]/board/new`·`/home`·`/calendar`(로그인)
  - `/calendar` 360px에서 **`scrollWidth === clientWidth === 360`** (가로 스크롤 없음, NFR-026)
  - **020A BLOCKER 1 수정의 실증** — 실제로 메시지를 전송해 목록에 **1회만** append되고 입력창이 비워지는 것을 확인했다(중복·삼킴 없음). 코드 리뷰로는 "동작할 것"까지만 말할 수 있었던 지점이다
  - **D-039 게이트 실증** — 비크루원 세션으로 `/crews/crew-2/board` 접근 시 "접근 권한이 없어요 / 이 크루의 크루원만 볼 수 있어요" 정상 렌더
  - **이 절차가 잡아낸 신규 결함**: 위 게이트가 화면은 맞지만 **HTTP 500으로 응답**한다 → **I-044** 등재
- **운영 결과**: 6일차 운영 발견 1(팀원 build 레이스)을 소환 프롬프트에 처음부터 넣은 것이 유효했다 — 이번 회차에 ENOENT 0건. CORE가 겪은 `.next/dev/types/` 캐시 tear 1건은 동시 작업의 부산물로 생성물 삭제로 해소했고 build·dev 서버는 실행하지 않았다

## 문서 갱신
- `docs/ROADMAP/team/01.CORE.md`: Task 020A에 `- 상태: 완료 (7일차, 2026-07-24)` 추가
- `docs/ROADMAP/team/02.DESIGN.md`: Task 021B에 동일 마커 추가
- `docs/ROADMAP/team/03.CREW.md`: Task 016B에 동일 마커 추가
- `docs/ROADMAP/team/04.BOARD.md`: Task 018B에 동일 마커 추가
- `docs/prioritization-and-risks.md`: **D-039**(크루원 게이트를 `(app)/crews/[crewId]/layout.tsx`에 둔다) 등재
- `docs/CONVENTIONS.md`: D-030 ④ 절에 크루원 게이트와 컨테이너 방어의 역할 구분 명시, **"Server Action 폼 상태 관리"** 절 신설
- `docs/ISSUES.md`: **I-038**(크루명·소개 상한·금칙어) · **I-040**(멤버십 다이어그램에 자진 철회 전이 없음) · **I-041**(홈 요약 표시 개수·필터 범위) · **I-042**(`mock.ts` 안내가 서버/클라이언트 분리 함정 유도 — 등재 후 해소) · **I-043**(제안글 기준 타임존) · **I-044**(권한 거부가 HTTP 500 — 팀장, 렌더 확인 중 발견) 등재, **I-035**·**I-037** 해결됨 전이
  - **번호 관리 정리**: 네 명이 동시 등재해 「다음 이슈 번호」 줄이 실제와 두 번 어긋났고, 파일 물리 순서도 I-039 → I-038 → I-040으로 꼬였다. 팀장이 번호순으로 재배열하고, 포인터 줄에 **"동시 등재 회차에는 이 줄만 믿지 말고 `grep`으로 실제 최댓값을 확인하라"** 는 지침을 넣었다. 6일차 이슈 4(오름차순 관례 위반)의 재발이며 원인이 "부주의"가 아니라 **동시 편집**임이 이번에 드러났다
- `docs/team/*.md`: **변경 없음** — 팀원 상태 변화 없음

## 판정만 하고 고치지 않은 것
- **`DayDetailPanel`의 `/sample` 전용 `status` prop**: 이번 건에 한해 타당(오버레이는 정적 목업으로 헤더·포커스 트랩을 검증할 수 없다). 다만 저장소에서 유일한 사례이므로 **두 번째 사례가 생기는 시점에 `CONVENTIONS.md`로 정식화**한다 — 후보는 Task 020B의 ConnectionBanner류
- **`MonthCalendarSkeleton`이 크루 필터 칸을 항상 그린다**: 실제 컴포넌트는 소속 크루 0개면 `CrewFilterPanel`을 렌더하지 않아, 그 사용자에 한해 로딩→완료 시 왼쪽 칸이 사라진다. 흔한 경로가 아니라 CORE가 비차단 처리
- **무제한 본문 + 무디바운스 `localStorage` 쓰기**: `post-content-validation.ts`에 body 상한이 없어(요구사항 근거 없음, 의도적) 매 keystroke 쓰기 비용이 본문 크기에 비례한다. CREW가 "통상 게시글 길이에서는 문제없다"고 보되 **개발 서버 프로파일링이 금지돼 실측하지 못해** 확정 pass로 단정하지 않았다. 향후 body 상한이 생기면 자연 해소
- **`fixtures.ts`의 `post-3` ↔ `meetup-1` 값 불일치**: 실제 복사 파이프라인(`createMeetupFromPoll`)의 호출부가 아직 없어(Task 034 몫) 손으로 각각 채운 값이다. BOARD가 **값을 맞추지 않고 주석만 붙였다** — 지금 숫자만 맞추면 "파이프라인을 거쳤다"는 잘못된 인상을 준다는 판단
- **`withdraw-join-request.ts`에 `checkPermission` 호출이 없는 것**: BOARD가 의심했다가 기각했다. 매트릭스에 자기 신청 철회 행 자체가 없고 `getPendingJoinRequestForRequester(crewId, session.profileId)`로 조회를 본인 소유로 스코핑해 남의 신청 id를 넘길 경로가 없다. `getAuthSession()`+fail-closed는 있어 6일차 `searchUserByHandleAction`(인증 자체가 없던 건)과 다르다
- **`PrivateCrewNotice`가 default만 등록된 것**: 컴포넌트가 `crewName` prop 하나뿐인 순수 정적 렌더라 타당. 형제 `CrewIntroPreview`와 등록 밀도가 다르지만 둘 다 같은 컨테이너의 로딩·오류를 "CrewHome" 항목이 대표하므로 무방

## 다음 회차에 열리는 Task

| Task | 담당 | 의존 | 비고 |
| --- | --- | --- | --- |
| **016A** 크루 탐색 | CREW | 013 ✓ | 이번 회차에 폭 제한으로 미룬 유일한 Task. `/crews`가 `(app)` 밖이므로 게스트 세션을 전제한다. `crew-category.ts`(016B 산출)를 탐색 필터의 단일 소스로 공유한다 |
| **017A** 멤버 관리 | CREW | 013 ✓ · 016B ✓ | **016B 완료로 새로 열렸다.** I-040이 명시한 대로 `JoinRequestStatus."withdrawn"` 소비 UI가 여기 몫이다 |
| **017B** 크루 설정·받은 초대함 | CREW | 013 ✓ · 016B ✓ | **016B 완료로 새로 열렸다** |
| **019** 투표 UI | BOARD | 009A ✓ · 013 ✓ · 018A ✓ · 018B ✓ | **018B 완료로 새로 열렸다.** 공수 10.0인일로 이번 배치 최대 |
| **020B** 낙관적 렌더·재전송·ConnectionBanner | CORE | 008 ✓ · 013 ✓ · 020A ✓ | **020A 완료로 새로 열렸다.** `/sample` 전용 prop 관례 정식화 후보(위 참고) |
| **020C** PostLinkCard·라우팅 이동·복원 | CORE | 013 ✓ · 018A ✓ · 020A ✓ | **020A 완료로 새로 열렸다.** R-016(리소스 ID 기준 링크)이 처음 실제로 걸리는 Task |
| **022** Meetup 상세와 참석 | DESIGN | 013 ✓ · 021A ✓ | 이미 열려 있었으나 폭 제한으로 대기 중이었다 |

**CREW에게 3건(016A·017A·017B), CORE에게 2건(020B·020C)이 몰린다.** 1인 1건 폭 제한을 유지하면 다음 회차는 016A 또는 017A(CREW)·019(BOARD)·020B(CORE)·022(DESIGN)가 유력하다. **019가 공수 10.0인일로 가장 크고 023(알림)의 선행**이라 우선순위가 높다.

### 다음 회차 운영에 반영할 것
- **I-037 절차를 그대로 유지한다.** 이번 회차에 실제로 결함 1건(I-044)을 잡았고, 정적 검사 3종이 전부 통과한 상태에서 잡았다. 절차 비용은 개발 서버 1회 기동뿐이다
- **`docs/ISSUES.md` 동시 편집이 구조적 문제다.** 이번 회차에 번호 충돌 2회·물리 순서 꼬임 1회가 났고, 원인은 부주의가 아니라 네 명이 같은 파일의 같은 줄(포인터)을 동시에 고치는 것이다. 포인터 줄에 경고를 넣어 완화했지만 근본 해소는 아니다 — **회차 말미에 팀장이 일괄 등재하는 방식**을 다음 회차에 시험해 볼 만하다

## git
- 브랜치: `day-7` (`main`에서 분기)
- 커밋 `de1502b` — `Day 7: Phase 3 화면 4종과 크루원 게이트·렌더 검증 절차 (Task 016B·018B·020A·021B)` (88개 파일, +5,564줄 / -172줄)
- 푸시: `origin/day-7` 성공 (2026-07-24). PR 생성 링크: https://github.com/0625chopin/MO_M/pull/new/day-7
