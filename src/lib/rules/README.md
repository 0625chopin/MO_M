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

## 권한·멤버십·색 해시 (CREW, Task 009B, 3일차)

- **`permission.ts`** — `checkPermission(input: PermissionCheckInput): PermissionCheckResult`.
  3.3절 권한 매트릭스는 총 35행이며, 회원가입(FR-001)·로그인(FR-002) 2행은 크루 스코프가
  아니라 `PermissionAction`에서 이미 제외돼 33행이 대상이다. 그중 FR-032("자기 게시글
  수정·삭제") 1행이 "타인 게시글 삭제"와의 대칭을 위해 `post:update_own`·`post:delete_own`
  두 액션으로 갈려 `PermissionAction`·`PERMISSION_MATRIX`는 33행이 아니라 **34개 액션**이다
  (1:1 대응이 아님 — 3일차 교차검증에서 BOARD가 지적). 이 34개 액션 전부를
  `Record<PermissionAction, Record<UserRole, "allow"|"conditional"|"deny">>` 리터럴로 옮기고,
  "○"(조건부 허용) 셀만 각주 1~5(`isSelf`·`hasOwnerSuccessorOrDisband`·`crewVisibility`·
  `targetRole`·`isProposalAuthor`, 전부 `permission.types.ts`의 `PermissionCheckContext` 그대로)로
  판정한다. `permission.types.ts`의 `PermissionAction`·`PermissionCheckContext`·
  `PermissionCheckInput`·`PermissionCheckResult`를 그대로 입출력에 쓰며 확장하지 않았다.
- **`crew-membership-transition.ts`** — 요구사항 2.4절 "Crew 멤버십 상태" 다이어그램을
  `Record<CrewMembershipStatus, Partial<Record<CrewMembershipEvent, CrewMembershipStatus>>>`로
  옮긴 `transitionCrewMembershipStatus`/`createCrewMembershipStatus`(초대·가입신청의 `[*]` 시작
  상태)/`isTerminalMembershipStatus`. 부가로 `deriveUserRoleForPermissionCheck`를 둬서
  `CrewMembership.role`+`status` → 3.1절 `UserRole` 투영을 한 곳에 모았다 — 각 컨테이너가
  이 변환을 따로 구현하면 판정이 화면마다 갈리는 R-015 신호가 된다.
- **`crew-color-hash.ts`** — D-006 `hash(crew.id) mod 12`(`hashCrewId`·`crewColorIndex`)와
  D-026 같은 날짜 셀 충돌 회피(`resolveCrewColorCollision`, 아래 "crew-palette.ts와의 경계"
  참고), 둘을 합친 편의 함수 `assignCrewColorForDateCell`.

### `src/lib/crew-palette.ts`와의 경계 — 1일차 이월 결정 처리 (3일차)

1일차 교차검증에서 "`resolveCrewColorCollision`·`normalizePaletteIndex`를 `lib/rules/`로
옮기는 작업은 CREW의 `hash(crewId)` 함수가 합류하는 시점에 함께 처리한다"고 이월했다
(`docs/CONVENTIONS.md` 남은 리스크 절). 이번 회차(Task 009B)가 그 시점이라 실제로 판단·실행했다.
저장소 전체에 두 함수의 기존 소비자가 없어(`grep` 확인) 이동 비용은 0이었다:

- **이관함 — `resolveCrewColorCollision`** → `lib/rules/crew-color-hash.ts`. D-026의 충돌 회피
  "판정"(후보 인덱스 + 점유 인덱스 집합 → 실제 인덱스 결정) 그 자체이고, 새로 만든
  `crewColorIndex`(`hash(crewId) mod 12`)와 항상 한 파이프라인으로 호출되므로 판정 로직을
  한 파일에 모아 R-015를 줄였다.
- **현행 유지 — `normalizePaletteIndex`** → `lib/crew-palette.ts`에 남는다. `CREW_PALETTE_SIZE`
  (팔레트 **데이터**의 크기)에 대한 나머지 연산일 뿐이고, 데이터 조회 함수 `getCrewColor`가
  계속 이를 쓴다. 옮기면 데이터 모듈(`crew-palette.ts`)이 판정 모듈(`lib/rules/`)에 의존해야
  해서 방향이 거꾸로 된다 — 대신 `crew-color-hash.ts`가 `crew-palette.ts`에서
  `CREW_PALETTE_SIZE`·`normalizePaletteIndex`를 가져와 쓴다(판정이 데이터에 의존하는 자연스러운
  방향).

`docs/CONVENTIONS.md`의 남은 리스크 절도 이 결정에 맞춰 갱신했다. 판단 근거의 전문은
`crew-color-hash.ts`의 모듈 docstring에 있다.

자세한 배치 원칙은 [`docs/CONVENTIONS.md`](../../../docs/CONVENTIONS.md) 참고.

## 투표·정족수·타임존 (BOARD, Task 009A, 3일차)

- **`quorum.ts`** — `computeQuorum`(D-032 `ceil(대상자 수/3)`), `countVotedForQuorum`(D-003 기권
  포함 참여자 수). `poll.types.ts`의 `QuorumCheckInput`/`QuorumCheckResult`를 그대로 구현한다.
- **`poll-eligibility.ts`** — `SnapshotVoterStatus`(3일차 교차검증 후 `@/lib/types/poll.types.ts`가
  정의하고 데이터 레이어의 `listEligibleVotersWithCurrentStatus`가 생산하며 이 모듈이 소비하는
  조인 계약 — 스냅샷×현재 멤버십 상태를 조인한 결과다. 원래 이 파일의 로컬 정의였으나 승격됨,
  필드는 그대로), `countQuorumEligibleVoters`(D-003 강퇴자 분모 제외), `countRemainingVoters`/
  `shouldAutoCloseByAllVoted`(D-022 종료 트리거③).
- **`poll-vote-tally.ts`** — `computeVoteTally`(무효화 표 제외 집계), `invalidateVotesForRemovedMember`
  (D-003 강퇴 시 표 무효화).
- **`poll-decision.ts`** — `decidePollOutcome`(D-003 정족수/동수/가결 3갈래 판정 트리).
  `poll.types.ts`의 `PollDecisionInput`/`PollDecisionResult`를 그대로 구현한다.
- **`poll-timezone.ts`** — `isPollExpired`·`getPollRemainingMs`·`toZonedDateString`·
  `validatePollDuration`·`isPollClosingBeforeMeetupDate`(NFR-025, D-003 기한 범위·Meetup
  예정일 순서). epoch 비교와 `Intl.DateTimeFormat`만 쓰고 외부 라이브러리는 도입하지 않았다.

배럴(`index.ts`)은 만들지 않았다 — CREW가 같은 디렉터리에서 권한·멤버십·색 해시 파일을 동시
작업 중이라 충돌을 피하기 위해서다. 배럴 도입 여부는 팀장이 직렬로 판단한다.
