# 9일차 작업 로그 (2026-07-24)

## 회차 요약
- 활성 팀원: **CORE·CREW·BOARD 3명** (DESIGN 대기). 8일차의 4인 전원 구현 뒤, 이번엔 3인 구성이다 — DESIGN의 다음 근접 Task 024(접근성·반응형 QA)가 `015A~023 전량` 의존인데 023이 이번 회차 대상이라 아직 닫혀 있었다
- 이번 회차 배치 근거: 완료 집합 {001~014, 015A·B, 016A·B, 018A·B, 019, 020A·B, 021A·B, 022} 기준으로 의존·선행이 모두 풀린 미완료 Task 4건(017A·017B·020C·023) 중 **1인 1건 폭 제한으로 3건**을 골랐다 — 020C(CORE)·017A(CREW)·023(BOARD). CREW에 2건(017A·017B)이 몰렸으나 폭 제한을 지켜 017A만 배정했다. 배치 내 파일 충돌·선후 의존이 없어 **3인 동시 소환**했다
- 결과: 이슈 **4건** 발견 / 전건 해소(minor 3 + blocker 1), 전체 테스트 3/3 통과 + `/sample`·채팅·멤버·알림 실제 렌더 실측 통과
- **blocker 1건은 채팅 페이지 하이드레이션 불일치(React #418)**였고, 정적 검사(lint·tsc·build)를 전부 통과하는 런타임 전용 결함이었다(I-037 절차가 다시 유효). **원인은 020B가 심은 잠복 결함**으로, 020C가 실제 채팅 라우트 렌더 트리를 처음 건드리며 발현했다 — 8일차 렌더 검증이 `/sample`만 봤고 실제 `/crews/[crewId]/chat`을 안 봤기에 그때 못 잡혔다
- **운영 교훈(팀장 검증 절차)**: 재렌더 검증 중 팀장이 포트 3311을 점유한 **스테일 pre-fix 서버**를 눈치채지 못해, 수정이 반영됐는데도 한동안 "여전히 재현됨"으로 오판했다. 이후 `ss -ltnp`로 포트 소유 PID와 `EADDRINUSE` 로그를 확인해 원인을 특정했다 → 다음 회차부터 **서버 재기동 시 바인딩 성공(`✓ Ready`)과 포트 소유 PID를 매번 확인**한다

## 팀원별 완료 내역

### CORE (01.CORE.md)
- 완료 Task: **020C · 채팅 PostLinkCard·라우팅 이동·복원** (+ 채팅 #418 blocker 수정)
- 산출물:
  - 신규 — `src/components/chat/{post-link-card-view-models,resolve-post-link-card,chat-scroll-storage}.ts`, `src/components/chat/PostLinkCard.tsx`
  - 수정 — `src/components/chat/{MessageBubble,MessageList,message-view-models,MessageListContainer,MessageRoomContainer}.tsx`, `src/lib/actions/{load-earlier-messages,resync-chat-messages,send-chat-message}.ts`, `src/lib/data/mock/{board.ts,fixtures.ts}`, `src/lib/strings/ko.ts`, `src/components/sample/sections/{ChatMessageListPreview,chat}.tsx`
- 비고: PostLinkCard 4분기(일반글/제안글/삭제됨/권한없음)를 `getPostDetailHref(crewId, postId)` **리소스 ID 기준 링크**로 조립(R-016 첫 실적용, 경로 하드코딩 0). 삭제됨·다른 크루는 `Link`로 안 감싸 이동 차단(AC3). 제안글 카드는 `PollCountdown`·`getPollRemainingMs`(009A·019 산출) 재사용 — `remainingMs`는 서버에서 한 번 계산해 고정값으로 내려 시간 재계산 없음. `toMessageViewModel`을 async로 바꿔 조인 로직을 공유, 호출부 4곳 `crewId` 인자 갱신. 스크롤·읽음 복원은 `sessionStorage` 앵커(마지막으로 맨 위에 보이던 메시지 id)로 `MessageList`가 관리. **이월**: "채팅에 공유" 송신 경로(Composer)·send-time 크로스크루 검증·서버측 읽음 배지(FR-055)는 범위 밖

### CREW (03.CREW.md)
- 완료 Task: **017A · 멤버 관리**
- 산출물:
  - 신규 — `src/lib/rules/invite-eligibility.ts`, `src/lib/actions/{invite-crew-member,decide-join-request,set-crew-member-role,leave-crew}.ts`, `src/components/crews/{CrewMembersContainer,MemberList,InviteMemberDialog,JoinRequestPanel,CrewMembersSkeleton}.tsx`, `src/components/crews/crew-member-view-models.ts`
  - 수정 — `src/lib/data/mock/crew.ts`(approve/rejectCrewMembership 신규), `src/app/(app)/crews/[crewId]/members/page.tsx`, `src/lib/strings/ko.ts`, `src/components/sample/sections/crews.tsx`
- 비고: 권한 판정은 `checkPermission`(009B `PERMISSION_MATRIX`의 기존 행 `crew:invite_member`·`crew:approve_join_request`·`crew:appoint_staff`·`crew:leave`)과 `transitionCrewMembershipStatus`를 **호출만** — 새 판정 신설 0건(R-015). `evaluateInviteEligibility`(self_invite/already_member/already_invited)만 순수 함수로 분리. 역할 정렬(오너>임원>일반)은 컨테이너가 처리, 표현은 재정렬 안 함. **I-040(withdrawn 소비 UI) 해소** — "처리 내역" 탭이 approved/rejected/withdrawn 3종을 서로 다른 배지로 구분. `UserSearchField`(015B가 연 확장점)에 초대 버튼 주입. **이월**: 오너 단일성 런타임 invariant, FR-024 E3(임원 상한, D-* 승격 필요), FR-020 E3(차단, Block 모델 v0.2), `leave-crew`의 오너 이양·해산 판정(017B 이후)

### BOARD (04.BOARD.md)
- 완료 Task: **023 · 알림 토스트와 알림 센터**
- 산출물:
  - 신규 — `src/components/notifications/{notification-channel,notification-routing,notification-view-models,format-notification-time}.ts`, `src/components/notifications/{NotificationItem,NotificationList,NotificationListSkeleton,NotificationBell}.tsx`, `src/components/notifications/{use-notification-feed,NotificationBellContainer,NotificationBellServerContainer,NotificationCenterContainer,NotificationCenterListContainer,ToastHostContainer}.tsx`, `src/components/ui/popover.tsx`(shadcn), `src/lib/actions/{mark-notification-read,mark-all-notifications-read,simulate-notification-event}.ts`, `src/components/sample/sections/{notifications,NotificationSimulatorPreviewContainer}.tsx`
  - 수정 — `src/lib/strings/ko.ts`, `src/lib/data/mock/notification.ts`(소유권 검증·countUnread·markAll 신설), `src/lib/data/mock/seed/{generate-notifications,index}.ts`, `fixtures.ts`, `src/components/ui/toast.tsx`, `src/app/layout.tsx`(ToastHost 배치), `src/components/shell/{AppShell,HeaderNav}.tsx`(슬롯 주입), `src/app/(app)/notifications/page.tsx`, `src/components/sample/registry.ts`
- 비고: 구독은 `subscribeToNotifications(profileId, onEvent, onError)`로 008 인터페이스(`subscribeToRoom`)를 `notification:{profileId}` room으로 다중화(D-030 ②). 알림 유형→화면 라우팅은 `NOTIFICATION_ROUTE_RESOLVERS: Record<NotificationType, …>`가 `NotificationType` 10종과 1:1로 리소스 ID 기준 헬퍼 계산(R-016, 컴포넌트 인라인 0). ToastHost는 `app/layout.tsx`에서 세션 인증 후 배치(D-030 ④). `markNotificationRead`는 데이터 계층에서 소유권 검증(RLS 대비). **이월**: FR-072(알림 끔)·FR-070 E1/E3, 탭 간 구독 비동기화(I-042 계열, Task 033 이후), MobileTabBar 팝오버, 알림 자동생성 파이프라인(Task 034), `markNotificationReadAction`의 DataResult 미검사(감사 추적 필요 시)

## 교차검증 결과
활성 3인이 A팀 2(CORE·CREW)·B팀 1(BOARD) 구성이라, 리뷰 짝 규칙(A↔B 교차)상 A팀 산출 2건은 유일한 활성 B팀 담당 BOARD가, BOARD 산출은 CORE가 검증했다.
- **BOARD → CORE(020C)**: **이슈 0**. PostLinkCard 4분기·리소스 ID 링크·삭제/다른크루 이동 차단·`toMessageViewModel` async 호출부 4곳 갱신·RSC 직렬화(PostLinkCard 함수 prop 없음) 전부 pass
- **BOARD → CREW(017A)**: **minor 1건**(아래 이슈 1). 권한 재사용·역할 정렬·승인/반려·임원 임명·withdrawn 처리·도메인 오류 4상태 전부 pass
- **CORE → BOARD(023)**: **이슈 0** + **minor 2건**(아래 이슈 2·3). 4상태·D-030·리소스 ID 라우팅·순수 매핑 테이블·RSC 직렬화·AppShell/HeaderNav 슬롯 하위호환·markNotificationRead 소유권 검증 전부 pass
- **재검증 라운드**: 세 minor 수정 후 리뷰어 확인 pass. blocker(#418)는 팀장이 재빌드·재렌더로 실증 확인

## 발견·해결한 이슈

### blocker 1건 — 채팅 하이드레이션(#418), 정적 검사를 통과한다

1. **[팀장 발견 · CORE 020C 계열] `/crews/[crewId]/chat`에서 React #418(하이드레이션 불일치) — 서버는 `ConnectionBanner`를 "연결 끊김"으로 렌더, 클라이언트는 렌더 안 함.**
   원인은 020B가 만든 `MessageRoomContainer`의 연결 상태 초기화(`useState(() => navigator.onLine ...)`)였다. Node 24는 `navigator` 전역은 있으나 `navigator.onLine`은 `undefined` → 서버는 `!undefined === true`로 "disconnected", 클라이언트는 `navigator.onLine === true`로 "connected" → `ConnectionBanner`(disconnected에서 `role="alert"` `<Alert>`, connected에서 `null`)의 **DOM 구조 자체가 갈렸다**. `/sample`은 `ConnectionBannerPreview`가 리터럴 status만 넘겨 이 경로를 안 타 8일차엔 안 잡혔고, 실제 채팅 라우트를 처음 렌더 검증한 이번에 발현했다.
   - → CORE가 2단 수정: ① 연결 상태를 `useSyncExternalStore`(`getServerSnapshot`=항상 `connected`, 기존 `use-media-query.ts` 관례) + "렌더 중 상태 조정" 패턴으로 SSR·최초 하이드레이션을 `connected`로 통일. ② 이중 방어로 **마운트 게이트**(`{mounted && <ConnectionBanner/>}`, `mounted`도 `useSyncExternalStore`로 `getServerSnapshot`=false) 추가 — 배너는 SSR·최초 클라 렌더 둘 다 무조건 `null`이고 마운트 후에만 실제 상태를 반영한다. `ConnectionBanner`는 "끊겼다 복구될 때만 잠깐 나타나는" UX라 최초 렌더에 없어도 기능 손실이 아니다.
   - **I-037 절차가 다시 유효했다** — build 후 실제 서버로 SSR HTML(`role="alert"`·"실시간 연결에 문제" grep)과 브라우저 콘솔(#418)을 각각 확인해 1→0 해소를 실증. 단, 팀장이 스테일 서버(포트 3311 점유)를 한동안 못 봐 오판했다가 `ss -ltnp`·`EADDRINUSE` 로그로 바로잡았다(위 운영 교훈).

### minor 3건 — 전부 `/sample` 4상태 배치 규약 관련(비차단)

2. **[BOARD 발견 · CREW 017A] `sections/crews.tsx`의 InviteMemberDialog 항목에 empty·error 패널이 없고 생략 근거가 note에 없다.** → CREW가 note 한 줄 추가(제출 오류는 `useActionState` 내부 상태라 정적 주입 불가, 검색-없음은 `UserSearchField`가 `account.tsx`에 이미 등록 — `CrewCreateForm` 전례와 동일). 억지 4상태 대신 근거만 문서화(재검증 pass).
3. **[CORE 발견 · BOARD 023] NotificationItem "빈 상태" 패널이 실제로는 "href 없는 항목"을 보여 라벨 의미가 갈렸다.** → BOARD가 개별 항목엔 "빈 상태" 개념이 없다는 이유로 그 슬롯을 제거하고, href-null 항목은 "오류(D-030 ③ 방어적 도메인 오류)" 슬롯으로 옮김. note에 "여기 빈 상태 없음, 아래 List의 알림 0건과 다름" 명시(재검증 pass).
4. **[CORE 발견 · BOARD 023] NotificationList "오류" 패널이 실제 오류가 아니라 "모두 읽음" 상태를 억지로 채운 것.** `NotificationListProps`엔 오류 개념이 없다(조회 실패는 `NotificationBell.loadError` 소관). → BOARD가 해당 없는 "오류" 패널을 삭제하고 note에 근거(오류는 NotificationBell.loadError에서 검증)를 남김(재검증 pass).

## 팀장 전체 테스트 (항상 실행)
- `npm run lint`: **통과** (exit 0, 에러·경고 0 — `popover.tsx` import/order 경고 1건은 `--fix`로 정리)
- `npx tsc --noEmit`: **통과** (exit 0)
- `npm run build`: **통과** (exit 0, 21개 라우트, 15/15 정적 페이지). `.next` 삭제 후 클린 재빌드로 최종 확정
- **실제 렌더 확인 (I-037 절차, 클린 빌드 서버 단일 포트 3311)**:
  - `/crews/crew-1/chat` — **#418 해소, 콘솔 오류 0건**(폰트 프리로드 경고만). SSR HTML `role="alert"` 0·"실시간 연결에 문제" 0으로 배너 미렌더 확인, 브라우저 하이드레이션 오류 0. PostLinkCard 4분기·투표 카운트다운(7일 17시간 남음, 서버=클라 동일) 정상 렌더
  - `/sample`·`/crews/crew-1/members`·`/notifications` — 콘솔 오류 0건. 멤버 관리·알림 센터 신규 화면 정상 렌더

## 문서 갱신
- `docs/ROADMAP/team/01.CORE.md`: Task 020C에 `- 상태: 완료 (9일차, 2026-07-24)` 추가
- `docs/ROADMAP/team/03.CREW.md`: Task 017A에 동일 마커 추가
- `docs/ROADMAP/team/04.BOARD.md`: Task 023에 동일 마커 추가
- `docs/team/*.md`: **변경 없음** — 팀원 상태 변화 없음
- `docs/ISSUES.md`: **새 이슈 등재 0건**(팀원 등재 요청 없음). I-040은 017A로 소비 UI가 붙어 사실상 종결됐으나, 별도 등재 요청이 없어 이번 회차엔 상태 전이를 남기지 않았다 — 다음 회차 확인 대상

## 다음 회차에 열리는 Task

| Task | 담당 | 의존 | 비고 |
| --- | --- | --- | --- |
| **024** 접근성·반응형 QA 패스 | DESIGN | 015A~023 ✓ | **023 완료로 새로 열렸다.** Phase 3 전량(15+3건) 완료가 선행이었고 이번 회차로 충족. 공수 6.0인일 |
| **017B** 크루 설정·받은 초대함 | CREW | 013 ✓ · 016B ✓ | 기존 개방분. 오너 이양·해산이 여기서 실제 판정으로 붙어 017A의 `leave-crew` 하드코딩을 교체 |

- **024는 DESIGN 단독**이고, 017B는 CREW. **CORE·BOARD는 다음 회차 대기 가능성**이 높다 — CORE의 다음 근접 Task 025는 024 의존, BOARD의 다음 Task 023은 방금 끝냈고 그 뒤(038·033 등)는 실데이터/Phase 4·5라 한참 뒤다. 따라서 다음 회차는 **DESIGN(024)·CREW(017B) 2인 구성**이 유력하다
- 024가 완료되면 CORE의 025(빌드·배포 검증)가 열리고, 그 뒤 `026→027→028→029A→029B`의 CORE 단독 직렬 사슬(Supabase 실데이터 전환)이 시작된다

### 다음 회차 운영에 반영할 것
- **서버 재기동 시 바인딩 성공·포트 소유 PID를 매번 확인한다.** 이번에 스테일 서버가 포트를 물고 있어 수정 반영을 오판했다. `npm start` 후 로그의 `✓ Ready`와 `ss -ltnp | grep :PORT`의 PID 일치를 확인하고, 검증 종료 시 서버를 반드시 종료한다.
- **실제 도메인 라우트를 렌더 검증에 포함한다.** `/sample`만으로는 `ConnectionBannerPreview`처럼 리터럴 prop을 쓰는 컴포넌트의 런타임 경로(환경 의존 초기값)를 못 잡는다. 이번 #418은 실제 `/crews/[crewId]/chat`을 띄워야 드러났다.
- **환경 의존 초기값(`navigator`·`window`·`Date`)은 `useSyncExternalStore`의 `getServerSnapshot` 고정 또는 마운트 게이트로 SSR·최초 하이드레이션을 통일한다** — 이번 수정이 남긴 재사용 가능한 패턴.

## git
- 브랜치: `day-9` (`day-8`에서 분기)
- 커밋: (아래 완료 처리에서 기록)
- 푸시: 사용자 승인 후 진행
