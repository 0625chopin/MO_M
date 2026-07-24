# 6일차 작업 로그 (2026-07-24)

## 회차 요약
- 활성 팀원: **CORE·DESIGN·BOARD·CREW 4명 전원**. 5일차에 DESIGN 단독이던 병목이 풀려 처음으로 전원이 구현을 진 회차다
- 이번 회차 배치 근거: 완료 집합 {001~014} 기준 Task 013 완료로 Phase 3 화면 Task 8건이 한꺼번에 열렸다. 그중 `docs/SCHEDULE/SCHEDULE.md` 기준 **7주차 시작분 4건만** 골라 1인 1건으로 폭을 제한했다 — 015A(CORE)·021A(DESIGN)·018A(BOARD)·015B(CREW). 016A·016B·018B·020A는 8주차 이후라 이번 배치에서 제외했다
- 배치 내 선후: **015A → 015B를 직렬**로 뒀다. 두 Task가 같은 원 Task 015를 쪼갠 것이라 D-005 핸들 검증 규칙이 양쪽에 걸리는데, 동시 진행하면 각자 정규식을 인라인해 **R-015(판정 로직 인라인 중복)가 재발**한다. 나머지 3건은 파일 충돌이 없어 동시 소환했다
- 결과: 이슈 **13건** 발견 / 전건 해소, 전체 테스트 3/3 통과. **major 2건**(둘 다 인증 경계)과 minor 11건이며 blocker는 0건이다

## 팀원별 완료 내역

### CORE (01.CORE.md)
- 완료 Task: **015A · 인증·계정 화면 — 회원가입·로그인·온보딩**
- 산출물:
  - 신규 — `src/components/auth/{AuthLayout,SignupForm,SignupFormContainer,LoginForm,LoginFormContainer,OnboardingForm,OnboardingFormContainer}.tsx`, `src/lib/actions/{signup,login,complete-onboarding,check-handle-availability}.ts`, `src/lib/rules/{handle-validation,auth-credentials,display-name-validation}.ts`, `src/components/shell/set-mock-session-cookie.ts`, `src/components/sample/sections/auth.tsx`
  - 수정 — `src/app/{signup,login,onboarding}/page.tsx`, `src/components/sample/registry.ts`, `src/lib/strings/ko.ts`(`auth.*`)
- 비고: 세션 쿠키 **쓰기**를 `set-mock-session-cookie.ts` 한 모듈이 소유하게 해 읽기(`get-auth-session.ts`)와 스키마를 짝으로 묶었다. BOARD가 전수 grep으로 `mo_im_mock_session` 직접 접근처가 정확히 이 2곳뿐이고 4필드 스키마가 일치함을 확인했다

### DESIGN (02.DESIGN.md)
- 완료 Task: **021A · 통합 캘린더 — MonthCalendar·MeetupBar**
- 산출물:
  - 신규 — `src/components/calendar/{date-grid.ts,calendar-types.ts,MeetupBar.tsx,MonthCalendar.tsx,MonthCalendarContainer.tsx}`, `src/components/sample/sections/calendar.tsx`
  - 수정 — `src/app/(app)/calendar/page.tsx`, `src/lib/data/mock/crew.ts`(`listCrewsByProfile` 추가), `src/lib/strings/ko.ts`(`calendar.month.*` 12키), `src/components/sample/registry.ts`
  - 추가 작업(회차 중 major 해소로 배정) — `src/app/(app)/layout.tsx` 신설, 보호 라우트 `git mv` 이전, `src/components/shell/auth-session.ts`의 `assertAuthenticatedSession` 신설, `docs/CONVENTIONS.md` D-030 ④ 보강
- 비고: **실제 버그를 하나 잡아 고쳤다** — 상수·타입을 `"use client"` 모듈(`MonthCalendar.tsx`)에 두고 서버 컴포넌트가 import하자 Next.js가 값 export를 클라이언트 레퍼런스로 치환해 서버 산술에서 `NaN`이 됐다(`/calendar`가 "일정 NaN건"을 렌더). `calendar-types.ts`(plain ts) 분리로 해결하고 docstring에 근거를 남겼다. Playwright로 360px `scrollWidth === clientWidth === 360`과 방향키 포커스 이동을 실측했다(5일차 I-032의 브라우저 점유가 이번엔 없었다)

### BOARD (04.BOARD.md)
- 완료 Task: **018A · 게시판 목록·게시글 상세**
- 산출물:
  - 신규 — `src/lib/rules/post-edit-lock.ts`, `src/lib/actions/{update-post,delete-post}.ts`, `src/components/board/` 16개 파일(`resolve-board-viewer.ts`·`board-links.ts`·`format-post-date.ts`·`board-view-models.ts`·`PostTypeBadge`·`PollStatusBadge`·`BoardListItem`·`BoardPagination`·`BoardListSkeleton`·`BoardList`·`BoardListContainer`·`PostDetailSkeleton`·`PostDeletedNotice`·`PostDetail`·`PostActions`·`PostDetailContainer`), `src/components/sample/sections/{board.tsx,BoardErrorStatePreview.tsx}`
  - 수정 — `src/app/(app)/crews/[crewId]/board/{page.tsx,[postId]/page.tsx}`, `src/lib/data/mock/board.ts`(`listPostsByPage`·`PostsPage`), `src/lib/strings/ko.ts`(`board.*`)
- 비고: 교차검증에서는 이슈 0건으로 통과했으나 **회차 종료 직후 실제 렌더에서 결함 2건이 나왔다**(아래 "회차 종료 후 발견" 참고). `/sample`의 `PostDetail`에 forbidden(RLS 403)·삭제된 글·잠금 규칙 3종을 개별 도메인 오류 항목으로 등록해 D-030 ③을 다른 Task보다 세분화한 것은 그대로 유효하다

### CREW (03.CREW.md)
- 완료 Task: **015B · 계정 설정·핸들 검색**
- 산출물:
  - 신규 — `src/lib/rules/{handle-search,bio-validation}.ts`, `src/lib/actions/{search-user-by-handle,update-account-profile,change-account-handle}.ts`, `src/components/profile/{ProfileCard,ProfileEditForm,UserSearchField,UserSearchResult,AccountSettingsContainer}.tsx`, `src/components/sample/sections/account.tsx`
  - 수정 — `src/app/(app)/settings/page.tsx`, `src/lib/types/profile.types.ts`(`Profile.handleChangedAt`), `src/lib/data/mock/{profile,fixtures}.ts`, `seed/generate-profiles.ts`, `src/lib/strings/ko.ts`(`account.*`·`common.handle.*`), `src/components/sample/registry.ts`
- 비고: **팀장의 잘못된 지시를 따르지 않고 요구사항을 직접 확인해 더 맞는 선택을 했다.** 팀장이 정정 지시에서 `searchProfilesByHandle` 사용을 권했으나 그 함수는 `.includes()` **부분 일치**라 D-005의 "정확 일치" 요구와 어긋났다. CREW는 `getProfileByHandle`(정확 일치) + 전용 순수 함수 조합을 택했고, BOARD가 재검증에서 이 판단이 더 적절함을 확인했다

## 교차검증 결과
- **DESIGN → CORE(015A)**: 디자인·접근성·`/sample`·문자열 관점. 디자인 토큰·폼 수동 배선·터치 대상·NFR-023·D-029·키 충돌 전부 pass, **minor 3건**(C-1·C-2·C-3). D-030 ④ 위반 의혹을 **"CORE가 새로 판 패턴이 아니라 DESIGN 자신이 Task 011에서 확정한 계약"**임을 `get-auth-session.ts` docstring까지 소급해 확인하고 기각했다
- **BOARD → CORE(015A)**: 판정 로직·권한·보안·데이터 경계 관점. 7항목 중 5개 pass, **minor 2건**(C-4·C-5). C-5가 이번 회차 최대 발견으로 이어졌다 — 아래 이슈 5 참고
- **CORE → DESIGN(021A)**: 타입·데이터 경계 관점. **minor 1건**(D-1). `contracts.ts`가 함수 레지스트리가 아니라 공유 shape 정의라는 사실로 팀장의 잘못된 전제를 바로잡았고, `crew-color-hash.ts`/`crew-palette.ts` 분리가 021A가 새로 판 게 아니라 Task 009B의 기존 경계임을 문서로 확인했다
- **CORE → BOARD(018A)**: **전 항목 pass, 이슈 0건.** 팀장이 의심한 "커서/번호 페이지네이션 이원화"를 `listPosts`의 소비자가 0곳인 미사용 스캐폴드이고 FR-031 AC2의 총 건수 표시가 커서로는 표현되지 않는다는 근거로 기각했다
- **DESIGN → CREW(015B)**: **major 1건**(항목 7) + **minor 3건**(W-1·W-2·W-3). 015A 검증에서 자신이 세운 "D-030 ④의 실제 시나리오는 아직 없다"는 판정의 **전제가 깨진 순간을 스스로 잡았다**
- **BOARD → CREW(015B)**: **major 1건**(W-4) + 5항목 pass. NFR-012 등급 인용의 오적용을 갈라낸 것이 핵심이다
- **CORE → DESIGN((app) 라우트 그룹)**: ①③④ pass, ② fail(minor), ⑤ 부수 발견. `MOCK_FALLBACK_PROFILE_ID`가 **fail-open**임을 지적해 제거를 이끌었다
- **재검증 라운드**: D-1(3라운드) → pass / C-1~C-5 → pass / W-4 → pass / (app) 라우트 그룹 → pass

## 발견·해결한 이슈

### major 2건 — 둘 다 인증 경계

1. **[DESIGN 발견 · CREW 015B] `/settings`의 인증 가드가 페이지 본문에 있어 D-030 ④에 어긋났다.** DESIGN은 015A 검증에서 "게스트 진입 페이지의 자기 가드는 새 위반이 아니고, D-030 ④가 겨냥한 보호 대상 앱 페이지는 아직 없다"고 판정했는데, `/settings`가 바로 그 첫 사례로 등장하며 **자기 판정의 전제가 깨진 것을 스스로 잡아냈다.**
   - 팀장이 확인한 결과 범위가 더 넓었다 — **이번 회차에 실제 화면이 된 `/calendar`를 포함해 `/home`·`/crews`·`/notifications`·`/invitations`에 가드가 아예 없었다.** "선례를 복사하다 하나를 빠뜨린다"는 우려가 미래형이 아니라 이미 일어난 일이었다.
   - → `(app)` 라우트 그룹 도입을 결정하고 DESIGN이 실행했다. `git mv`로 보호 라우트를 이전하고 가드를 `(app)/layout.tsx` 한 곳으로 모았다. 게스트 진입 4개(`/`·`/login`·`/signup`·`/onboarding`)는 가드 방향이 반대이고 하위 세그먼트가 없는 고정 집합이라 옮기지 않았다. **I-025**(DESIGN이 Task 011에 올려 이 상황을 정확히 예측한 이슈)를 해결됨으로 전이했다. (재검증 CORE — Next.js 16 `layouts-and-pages.md`의 중첩 규칙으로 4단 깊이까지 상속됨을 확인, pass)

2. **[BOARD 발견 · CREW 015B] `searchUserByHandleAction`에 인증 검사가 없어 권한 매트릭스가 코드로 강제되지 않았다.** `search:by_handle`은 `permission.ts:70-77`에 **이미 `guest: "deny"`로 정의된 기존 매트릭스 행**인데 액션이 `getAuthSession`도 `checkPermission`도 호출하지 않았다. Server Action은 페이지를 거치지 않고 직접 POST할 수 있으므로(Next.js 공식 경고이며 **같은 팀의 `login.ts`가 이미 그 문구를 인용하고 있었다**) 미로그인 클라이언트가 회원 핸들·표시이름·아바타를 조회할 수 있었다.
   - **BOARD 지적의 핵심은 근거 인용의 오적용을 갈라낸 것이다.** CREW 주석은 "NFR-012는 v0.2 등급이라 인증 재검사를 넣지 않았다"고 했는데, NFR-012 원문은 "권한 검사는 서버·RLS에서 | UI 숨김만으로는 권한 매트릭스가 API 직접 호출로 전부 무력화된다"이다 — **v0.2로 미뤄도 되는 것은 RLS 구현이지, 비용 0인 순수 함수 `checkPermission` 호출까지가 아니다.** BOARD가 018A에서 Mock 단계에 이미 하고 있던 것이다.
   - → CREW가 `getAuthSession()`+`isAuthenticated()`+`checkPermission` 명시 호출을 추가하고 주석을 정정했다. 권한 없음도 `{ found: false }`로만 응답해 "권한 없음"과 "결과 없음"의 구분이 새지 않게 했다. (재검증 BOARD **pass** — `permission.allowed`가 false면 `getProfileByHandle` **호출 전에** return해 거부된 요청은 프로필 조회 자체를 하지 않음을 코드 경로로 확인)

### minor 11건

3. **[CORE 015A] `HANDLE_PATTERN`이 근거 없는 잠정값인데 등재되지 않았다.** docstring이 "고객 확인이 필요하면 ISSUES에 등재한다"고 **스스로 약속했는데 등재가 0건**이었다. DESIGN이 요구사항 전수 grep으로 D-005·3.6절이 **검색 시맨틱만** 확정하고 형식은 어디에도 없음을 확인했다 → **I-033** 등재. **실사용자가 직접 고르는 필드에 임의 정규식이 추적 불가능하게 묻히면 Task 028 스키마 확정 시점에 근거를 알 수 없다**는 것이 지적의 요점이다. (재검증 DESIGN — 내용 pass, **위치 fail** → 아래 4)

4. **[CORE 015A] I-033을 파일 중간에 끼워 넣어 오름차순 관례를 깼다.** `grep -n "^### I-0"` 결과 I-025 → **I-033** → I-026 순이 됐다. 번호와 서식은 맞았으나 **다음 등재자가 "I-032까지 봤으니 끝"이라 판단하면 중간의 I-033을 놓친다** — ISSUES.md가 번호의 단일 소스라 이 오판이 번호 충돌로 이어진다 → 파일 끝으로 이동, grep 출력으로 복원 확인.

5. **[CORE 015A] `check-handle-availability.ts`가 015B에 재사용 가능하다고 적어 R-012 무력화를 유도했다.** 이 함수는 `getProfileByHandle`을 써서 **`searchOptOut`과 무관하게** 존재 여부를 응답한다 — 가입 중복 검사로는 정상이지만 FR-006 검색에 쓰면 옵트아웃 사용자의 핸들이 새어 나간다.
   - **팀장이 소환 프롬프트에서 정확히 그 재사용을 지시했다.** BOARD가 015A 검증 중 이를 잡아내 팀장이 CREW에 긴급 정정을 보냈다. 다행히 CREW는 애초에 그렇게 짜지 않았다 → 세 파일의 015B 명칭을 "FR-006 핸들 검색"으로 통일하고 용도 경계 경고를 박았다.

6. **[CORE 015A] `/sample`의 OnboardingForm에 로딩 패널이 없었다.** 실 컴포넌트는 Signup/Login과 동일한 `useActionState`+`isPending` 스피너를 쓰고 `strings.auth.onboarding.submitPending`도 선언돼 있는데 `/sample`에서 **한 번도 참조되지 않았다.** "폼이라 빈 상태가 없다"는 정당화는 빈 상태에만 유효하다 — **R-006 재발 사례**(5일차 Tabs 미등록과 같은 종류) → 패널 추가.

7. **[CORE 015A] 데모 계정이 `CLAUDE.md` 「테스트계정」과 불일치했다.** Task 015A가 그 문서가 가리키는 "인증 도입" 시점인데 완전히 새 계정 세트를 만들어, 두 문서가 서로 다른 공식 테스트 계정을 주장하게 됐다 → `login.ts` docstring에 관계를 명시. **`CLAUDE.md`는 사용자 소유 파일이라 건드리지 않았다** — 아래 "판정만 하고 고치지 않은 것" 참고.

8. **[CORE 015A] `get-auth-session.ts:16` 주석이 사실과 달라졌다.** "로그인 폼이 아직 없어 정상 경로로는 항상 guest"라고 돼 있었는데 **이번 회차로 세션을 만드는 첫 코드가 생겼다** → 현재 사실로 갱신. 018A가 전제한 "액션을 거치지 않은 방문자는 여전히 guest"도 문장으로 살아 있음을 BOARD가 확인했다.

9. **[DESIGN 021A] `MeetupBar`의 툴팁이 구분자를 하드코딩해 `aria-label`과 표기가 갈렸다.** `title`은 가운뎃점(·), `aria-label`은 문자열 모듈 경유 em-dash(—) — **보는 사용자와 듣는 사용자가 서로 다른 표기를 받았다** → 같은 문자열을 공유하도록 통일.
   - **9a. 통일하자 이번엔 이중 낭독 문제가 드러났다.** CORE가 처음엔 추측(WebAIM 등)으로 답했다가 팀장이 근거를 요구하자 **W3C `accname-1.2`**(이름 계산에서 `aria-label`이 이름을 가져가면 `title`은 **설명**으로 넘어가 둘 다 노출된다)와 **NVDA 이슈 [#7841](https://github.com/nvaccess/nvda/issues/7841)·[#11764](https://github.com/nvaccess/nvda/issues/11764)**(NVDA+Chrome/Firefox가 실제로 둘 다 읽고, JAWS는 무시 — **AT마다 갈린다는 것 자체가 예측 불가능한 잉여 정보**)를 가져와 fail(minor)로 재판정했다 → `hideOwnLabel`일 때만 `title`, 아닐 때만 `aria-label`을 채우는 **상호 배타 구조**로 확정. 프로덕션 경로는 `aria-hidden="true"`라 안전함을, 그리고 `aria-hidden`의 유일한 문서화된 예외("포커스 가능한 요소나 그 조상에 쓰지 말 것")에 이 마크업이 걸리지 않음을 `tabIndex`·`role`·`onClick` 부재로 확인했다.

10. **[CREW 015B] `/sample`의 429 패널이 미구현임을 화면에서 알 수 없었다.** 소스 주석은 명확했으나 **실사용자가 보는 `note`와 `description`이 레이트 리밋을 언급하지 않아** QA가 구현된 기능으로 오인할 수 있었다 → note에 명시.

11. **[CREW 015B] 핸들 오류 문구가 `auth.*`와 `account.*`에 중복 선언됐다.** DESIGN 판정: "우연히 같은 한국어"가 아니라 **같은 순수 함수(`validateHandleFormat`)가 판정한 같은 개념**이다. **미루면 안 되는 이유가 구체적이었다** — `HANDLE_PATTERN`이 I-033으로 아직 잠정값이라 나중에 바뀌면 흩어진 문구를 동시에 고쳐야 하는데, **하나만 고치고 잊는 실수를 이 팀은 이번 회차에만 두 번**(이슈 9, 이슈 6) 저질렀다 → `common.handle.*`로 승격.

12. **[CREW 015B] 핸들 검색 결과의 두 분기가 접근성에서 비대칭이었다.** "없음"만 `role="status"`를 갖고 **"찾음" Card는 라이브 리전이 전혀 없어** 결과가 스크린리더에 조용히 지나갔다 → 결과 슬롯을 **처음부터 상시 마운트된** `aria-live="polite"` 컨테이너로 감싸고 안쪽 중첩을 제거. (컨테이너가 조건부 마운트되면 일부 AT가 새 리전의 첫 콘텐츠를 놓친다)

13. **[CREW 015B] W-4 수정의 부작용으로 `/sample`에서 "찾음" 상태를 볼 수 없게 됐다.** 권한 검사를 넣자 게스트 렌더인 `/sample`에서 검색이 항상 "없음"이 됐고, CREW는 "로그인해서 `/settings`에서 보라"고 안내했다. DESIGN 판정: **다른 페이지로 나가야 확인되는 상태는 쇼케이스 등록이 아니다** → `UserSearchResult`가 props만 받는 순수 표현이므로 정적 `{found:true}` 인스턴스를 같은 패널에 추가. note도 "권한 검사 증명"과 "시각 상태 시연"이 별개 목적임을 갈라 적었다.

### (app) 라우트 그룹 도입 과정에서 추가로 나온 3건

14. **[DESIGN] `CONVENTIONS.md` 문장과 실제 코드가 어긋났다.** DESIGN이 쓴 "`page.tsx`에 인증 체크를 다시 쓰지 않는다"가 `settings/page.tsx`의 실제 코드(타입 내로잉용 재조회)와 충돌했다. CORE가 실측으로 더 큰 문제를 짚었다 — **같은 회차에 세션 처리가 두 갈래로 갈렸다**(`settings`의 throw 내로잉 vs BOARD `resolveBoardViewer`의 `role:"guest"` 낙하) **그런데 어느 쪽이 표준인지 문서가 없었다** → `assertAuthenticatedSession` 헬퍼 신설 + CONVENTIONS에 "`(app)` 안팎은 경쟁 관계가 아니라 서로 다른 문제를 푼다"로 구분 명시.

15. **[DESIGN 021A · CORE 발견] `MOCK_FALLBACK_PROFILE_ID`가 fail-open이었다.** DESIGN은 "도달 불가능한 죽은 코드"로 기록만 했으나 CORE가 **"무해하다"는 결론에 동의하지 않았다** — 이 폴백은 "guest면 거부"가 아니라 **"guest면 `profile-1`(실존 사용자)로 대체"**다. BOARD의 `resolveBoardViewer`가 fail-closed인 데 반해 캘린더는 fail-open이라, 레이아웃이 나중에 약해지거나 컨테이너가 `(app)` 밖에서 불리면 **조용히 남의 데이터를 보여준다** → fail-closed 전환. CORE의 판정 문구가 이 회차를 요약한다: **"보안 성격의 fail-open을 '지금은 안전하다'는 이유로 남겨 두는 것 자체가, 이 프로젝트가 여러 번 지적해 온 '불변식이 문서에만 있고 코드가 강제하지 않는' 패턴이다."**

16. **[팀장 지시 오류 · DESIGN 발견] `/crews`·`/crews/[crewId]`가 `(app)`에 들어가 게스트 접근이 막혔다.** 팀장이 "`/crews` 하위 전부"라고 지시했는데, `requirements.md:236-237` 권한 매트릭스는 **크루 검색·목록 열람(FR-014)과 크루 상세 공개 정보 열람(FR-011)을 비로그인(`○³`)에 허용**하고, FR-014 원문도 행위자를 "회원 **및 비로그인 방문자**(D-007)"로 명시한다. FR-012가 v0.2→v0.1로 상향된 근거 자체가 "D-007로 비로그인 화면 상태가 갈리기 때문"이다 → 두 파일만 `(app)` 밖으로 되돌리고 나머지 5개 하위는 유지. **I-036** 등재 후 해결됨 전이.

## 이번 회차에 확정한 사실 — Next.js 16 문서에 없는 것

DESIGN이 이슈 16 처리 중 **라우트 그룹 안팎에 같은 이름 폴더를 분할해도 되는지** 확인하려 했으나 문서에서 답을 찾지 못했다:
- `route-groups.md:31`의 **Conflicting paths**는 **동일 URL로 resolve되는 두 페이지**만 금지한다 — 우리 케이스는 URL이 전부 달라 해당하지 않는다.
- `project-structure.md`의 **"Opting specific segments into a layout"**은 같은 목적을 지원하지만 예시가 **서로 다른 이름의 형제 폴더**(`account`/`cart`/`checkout`)를 가르는 그림이다.

DESIGN은 지시대로 "모호하면 실행하지 말고 보고"를 따랐고, 팀장이 **A안(시도 후 빌드로 확정)**을 택했다. `npm run build` 결과 **exit 0, 21개 라우트 정상** — **같은 이름 폴더의 그룹 안팎 분할은 Next.js 16에서 동작한다.** 이 사실을 I-036과 `CONVENTIONS.md` 양쪽에 기록해 다음 사람이 같은 왕복을 반복하지 않게 했다.

## 회차 종료 후 발견 — 교차검증이 놓친 것

회차를 닫고 커밋한 직후 **사용자가 개발 서버 콘솔에서 Base UI 런타임 오류 2건을 발견했다.** 018A 산출물이며, 교차검증(CORE→BOARD)이 이슈 0건으로 통과시킨 코드다.

- **증상**: `BoardList`(2곳)·`PostDeletedNotice`(1곳)가 `<Button render={<Link />}>`로 `<a>`를 렌더하는데 Base UI `Button`의 `nativeButton`이 기본 `true`라 네이티브 `<button>`을 기대했다. 링크에 button 시맨틱이 덧씌워져 `role`·`aria` 속성이 어긋난다.
- **해소**: 세 곳 모두 이동 동작이라 링크가 맞는 자리이므로 `nativeButton={false}`를 지정했다. 반대로 `<button>`으로 바꾸는 것은 오답이다 — 링크를 버튼으로 만들면 새 탭 열기·주소 복사가 깨진다. 나머지 `render` 사용처는 전부 `render={<Button />}`(네이티브 `<button>`)이라 해당 없음을 전수 확인했다. 커밋 `11a3b9e`.
- **왜 놓쳤는가 — 이게 기록의 요점이다**: 이 결함은 **`tsc`·`lint`·`build` 세 명령을 전부 통과한다.** `nativeButton`은 선택적 prop이라 생략해도 타입이 맞고, lint 규칙에도 걸리지 않으며, 빌드는 성공한다. 경고는 `useButton.mjs`가 `useEffect`에서 **실제 DOM 태그를 검사해** 내는 것이라 렌더해야만 드러난다.
  6일차 검증은 파일 열람 + 그 세 명령으로 이뤄졌고, **실제 브라우저 렌더를 확인한 것은 021A 하나뿐**이었다(DESIGN이 Playwright로 360px·키보드 내비 실측). 즉 **테스트 러너가 없는 동안 유일한 회귀 확인 지점인 `/sample`을 실제로 열어 보는 절차가 회차 흐름에 없다.** 5일차 I-032가 "실측을 못 했다"는 기록이었다면 이번은 **실측하지 않아 실제로 결함이 남았다**는 사례다 → **I-037** 등재.
- **부수 발견 — 검증 절차 자체의 걸림돌**: 팀장이 검증용 `npm run build`를 반복 실행하자 사용자가 띄워 둔 개발 서버(포트 3009)가 파일 감시를 잃고 **옛 청크를 계속 서빙**했다. 수정을 반영한 뒤에도 브라우저에서 같은 경고가 나 `role="button"` 부재로 stale임을 판별해야 했다. 개발 서버와 `npm run build`를 같은 디렉터리에서 번갈아 돌리는 것 자체가 문제이며 I-037 후속에 함께 적었다.

## 판정만 하고 고치지 않은 것
- ~~**`CLAUDE.md`의 「테스트계정」 절**~~ → **회차 종료 후 사용자 승인으로 정리했다.** 두 벌의 용도를 갈라 적었다 — 1번(`chopin0625`/`0625chopin`)은 Task 026 실 인증용, 2번은 지금 `/login`에서 쓰는 Mock 데모용이며 **값은 `login.ts`의 `MOCK_DEMO_ACCOUNTS`가 단일 소스**다. `CLAUDE.md`에 값을 복사하지 않고 가리키기만 한다 — 두 곳에 적으면 반드시 어긋난다는 이 파일 자체의 규칙("갱신되는 값은 이 파일에 적지 않습니다")을 따랐다. `login.ts` docstring도 "불일치는 `CLAUDE.md`가 정리한다"에서 "`MOCK_DEMO_ACCOUNTS`가 단일 소스"로 고쳤다
- **세 액션의 문체 비일관성(BOARD 비차단 기록)**: `search-user-by-handle.ts`만 `checkPermission`을 명시 호출하고 `update-account-profile.ts`·`change-account-handle.ts`는 `isAuthenticated()`만 쓴다. **CREW가 댄 근거("매트릭스 행이 없어서")는 부정확하다** — `profile:update_own`도 엄연히 매트릭스 행이다. 두 액션이 안전한 진짜 이유는 **항상 `session.profileId`만 대상으로 하는 자기 스코프라 `isSelf`가 구조적으로 항상 참**이기 때문이다. 결론은 같지만 근거가 다르다. 매트릭스 행 하나가 조건부로 바뀌면 명시 호출을 안 하는 쪽만 조용히 뒤처진다
- **NFR-016 레이트 리밋**: v0.2 등급으로 정당하게 미뤘다. `/sample` 429 패널은 정적 미리보기이며 그 사실이 이제 화면 문구에 명시돼 있다
- **`MonthCalendarContainer`의 게스트 폴백 제거로 생긴 후속**: 없음. fail-closed 전환 완료
- **아바타 업로드**: 파일 스토리지 백엔드가 없어 `avatarUrl` 읽기 전용 표시만 구현

## 팀장 전체 테스트 (항상 실행)
- `npm run lint`: **통과** (exit 0, 에러·경고 0건)
- `npx tsc --noEmit`: **통과** (exit 0)
- `npm run build`: **통과** (exit 0, 21개 라우트 정상, 15/15 정적 페이지 생성)
- 위 3종은 최종 수정(이슈 16의 라우트 이동) 반영 후 다시 실행해 통과를 확인한 결과다. 회차 중 라우트 그룹 검증용으로 `npm run build`를 추가 2회 실행했다
- **운영 발견 1**: 팀원이 각자 `npm run build`·`rm -rf .next`를 돌리면 레이스 컨디션으로 ENOENT가 난다(CORE가 1회 겪음). 회차 중반부터 **팀원에게는 `tsc`·`eslint`만 허용하고 build는 팀장이 일괄 실행**하도록 지시를 바꿨다. 다음 회차부터 소환 프롬프트에 처음부터 넣는다
- **운영 발견 2**: **이 세 명령을 전부 통과하고도 남는 결함이 있다** — 회차 종료 후 실제 렌더에서 Base UI 경고 2건이 나왔다(위 "회차 종료 후 발견", I-037). 3종 통과가 "이상 없음"을 뜻하지 않는다는 것이 이번 회차의 실측 결과다
- **회차 종료 후 재검증**: 위 수정(커밋 `11a3b9e`) 반영 후 3종을 다시 실행해 전부 통과를 확인했다

## 문서 갱신
- `docs/ROADMAP/team/01.CORE.md`: Task 015A에 `- 상태: 완료 (6일차, 2026-07-24)` 추가
- `docs/ROADMAP/team/02.DESIGN.md`: Task 021A에 동일 마커 추가
- `docs/ROADMAP/team/03.CREW.md`: Task 015B에 동일 마커 추가
- `docs/ROADMAP/team/04.BOARD.md`: Task 018A에 동일 마커 추가
- `docs/ISSUES.md`: **I-033**(핸들 형식 규칙 미정의) · **I-034**(`BIO_MAX_LENGTH` 잠정값) · **I-035**(`(app)/crews/[crewId]/*`가 인증만 검사하고 크루원 여부는 미검사) · **I-037**(교차검증이 정적 검사에 치우쳐 렌더 시점 결함을 놓친다 — 회차 종료 후 등재) 신규 등재, **I-036**(크루 탐색 게스트 차단) 등재 후 해결됨 전이, **I-025**(인증 화면 전면 게이트 방식 미정) 해결됨 전이
- `CLAUDE.md`: 「테스트계정」 절을 용도별 두 벌로 정리(회차 종료 후 사용자 승인). Mock 데모 계정 값은 복사하지 않고 `login.ts`를 가리키게 했다
- `docs/CONVENTIONS.md`: D-030 ④ 절 보강 — 게스트 진입 페이지 자기 가드 / 인증 앱 라우트 하위 트리 보호 구분, `assertAuthenticatedSession` 사용 규칙, fail-open 금지, "`(app)`은 인증 게이트이지 크루원 게이트가 아니다", `/crews` 예외의 근거, 같은 이름 폴더 그룹 분할 허용 사실. 디렉터리 트리에 `(app)/` 추가
- `docs/team/*.md`: **변경 없음** — 팀원 상태 변화 없음

## 다음 회차에 열리는 Task

| Task | 담당 | 의존 | 비고 |
| --- | --- | --- | --- |
| **016A** 크루 탐색 | CREW | 013 ✓ | **I-036 해소 구조 위에서 작업한다** — `/crews`가 `(app)` 밖이므로 게스트 세션을 전제해야 한다 |
| **016B** 크루 개설·크루 홈 | CREW | 013 ✓ | 017A·017B의 선행. **I-035(크루원 게이트 위치)를 여기서 확정**한다. `private` 크루 분기(D-017)도 이 Task 몫 |
| **018B** 글쓰기 | BOARD | 013 ✓ | 018A의 `PostActions` 인라인 편집 폼과 UX를 통일할지 판단 필요 |
| **020A** 채팅(MessageList·Composer·윈도잉) | CORE | 008 ✓ · 013 ✓ | D-030 ②(구독 인터페이스)가 처음 실제로 적용되는 Task |
| **021B** 크루 필터·DayDetailPanel·홈 대시보드 | DESIGN | 013 ✓ · 021A ✓ | `calendar-types.ts` 분리 패턴을 `DayDetailPanel`에도 적용해야 한다(같은 `"use client"` 함정 재발 가능) |

4명 전원이 1~2건씩 착수 가능하다. **016B가 I-035를 닫는 Task**라 다음 회차 배치에서 우선순위가 높다 — 크루 하위 라우트가 지금 인증만 검사하고 크루원 여부는 컨테이너 레벨에서만 막고 있다.

### 다음 회차 운영에 반영할 것 (I-037)

**교차검증에 `/sample` 실제 렌더 확인을 넣을지 결정한다.** 이번 회차가 근거다 — 018A는 이슈 0건으로 통과했는데 회차 종료 직후 렌더 결함 2건이 나왔고, 그 결함은 `tsc`·`lint`·`build`를 전부 통과했다. 후보 두 가지:
- ① 팀장이 전체 테스트 3종에 더해 개발 서버를 띄우고 `/sample` 콘솔 오류 0건을 확인한다(Playwright MCP `browser_console_messages`)
- ② 각 팀원이 자기 산출 컴포넌트가 등록된 `/sample` 섹션만 열어 확인하고 보고에 포함한다

**함께 풀어야 할 걸림돌**: 개발 서버와 `npm run build`를 같은 디렉터리에서 번갈아 돌리면 개발 서버가 파일 감시를 잃고 옛 청크를 서빙한다(이번 회차에 실제로 겪었다). 확인 절차를 넣기 전에 이 충돌부터 정리해야 한다 — 팀장 build 전에 개발 서버를 멈추든, 확인을 build 이후 한 번만 하든.

## git
- 브랜치: `day-6` (`day-5`에서 분기)
- 커밋: 회차 완료 시점 기록
- 푸시: 사용자 승인 후 진행
