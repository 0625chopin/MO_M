# 10일차 작업 로그 (2026-07-24)

## 회차 요약
- 활성 팀원: **DESIGN·CREW 2명** (CORE·BOARD 대기). 9일차에 Phase 3 화면 3종(020C·017A·023)이 완료되며 예고된 대로, 이번엔 Phase 3 마무리 성격의 2건이 열렸다 — DESIGN의 024(접근성·반응형 QA 패스)와 CREW의 017B(크루 설정·받은 초대함).
- 이번 회차 배치 근거: 완료 집합 {001~014, 015A·B, 016A·B, 017A, 018A·B, 019, 020A·B·C, 021A·B, 022, 023} 기준으로 의존·선행이 모두 풀린 미완료 Task를 골랐다 — **024**(의존 015A~023 전량 ✓)와 **017B**(의존 013·016B ✓). CORE의 다음 Task 025는 024 의존, BOARD의 다음 Task 038·033은 030·031·032 의존이라 둘 다 대기. 배치 내 상호 의존이 없고(024는 015~023 대상, 017B는 신규 화면) 파일 충돌도 없어 **2인 동시 소환**했다.
- 결과: 이슈 **4건**(전부 minor, 접근성 계열) 발견 / 전건 해소. 전체 테스트 3/3 통과.
- **착수 전 스코프 충돌 1건을 CREW가 선제 발견·차단했다** — 아래 "스코프 결정" 참고. 팀장의 최초 소환 지시가 잘못된 근거를 담고 있었고, 이를 ROADMAP.md 원안으로 바로잡았다.

## 스코프 결정 (착수 전 정정)
팀장의 017B 최초 소환 지시에 "오너 이양·해산을 실제 판정으로 구현해 017A의 leave-crew 하드코딩을 교체한다"가 들어 있었으나, **CREW가 착수 전 ROADMAP.md(스코프 단일 소스)와의 충돌을 발견해 확인을 요청**했다:
- ROADMAP.md Task 017 정의: 크루 설정의 본인 탈퇴는 "**오너는 차단** — 이양·해산은 v0.2"
- ROADMAP.md Task 040(Phase 5, v0.2): 오너 이양(FR-025)·크루 해산(FR-013)을 명시적으로 담당
- Phase 5 헤더 + R-020: "근거 없이 앞당기거나 더 미루지 않는다"

팀장의 지시는 9일차 워크로그의 예고 문구("017B에 오너 이양·해산이 붙는다")를 그대로 옮긴 것인데, **그 예고 자체가 스코프 SSOT와 어긋난 오류**였다. "스코프가 어긋나면 ROADMAP이 이긴다" 원칙과 R-020에 따라 **Option 1(ROADMAP 원안)으로 확정** — 오너 이양·해산은 Task 040(v0.2)으로 이월하고, 017B는 크루 정보 수정·공개범위 전환(오너 전용)·캘린더 색 수동 지정(D-016)·본인 탈퇴(오너 차단 유지)·받은 초대함만 다룬다. `leave-crew.ts`의 오너 차단 하드코딩은 손대지 않았다. **운영 교훈**: 워크로그의 "다음 회차 예고"는 참고일 뿐 스코프 SSOT가 아니다 — 소환 지시를 ROADMAP.md와 대조하지 않고 예고를 그대로 옮기면 R-020 위반 지시가 나갈 수 있다.

## 팀원별 완료 내역

### DESIGN (02.DESIGN.md)
- 완료 Task: **024 · 접근성·반응형 QA 패스와 검증 수단 도입 결정**
- 산출물:
  - 신규 — `docs/decisions/accessibility-tooling.md`, `src/components/sample/sections/a11y.tsx`
  - 수정 — `eslint.config.mjs`, `package.json`·`package-lock.json`(eslint-plugin-jsx-a11y 명시), `src/app/globals.css`(`--input` 토큰), `src/components/calendar/HomeCalendarSummary.tsx`, `src/components/chat/MessageList.tsx`, `src/components/meetup/MeetupDetail.tsx`, `src/components/poll/{PollResult,PollTally}.tsx`, `src/components/ui/label.tsx`, `src/components/sample/registry.ts`, `src/lib/strings/ko.ts`
- 비고: Phase 3 화면 21개 라우트를 dev 서버 + Playwright로 직접 열어 실측(스냅샷·DOM 평가·키보드 이벤트). 점검 결과 — **NFR-020**(포커스 트랩·Esc·복귀 포커스) 통과, **NFR-027**(터치 대상) 24px 미달 3건을 `py-1`로 확대, **NFR-018**(대비) 라이트 `--input`이 1.43:1로 3:1 미달이라 `oklch(0.64 0.009 258)`로 3.37:1 조정(`.dark`·`@media` 폴백은 미러 동기 유지), **NFR-026**(360/768/1280 재배치) 게스트 15+크루원 6 라우트 전수 overflow 0px, **NFR-021**(live region) `PollTally`·`MessageList`에 명시 요구 사항 추가. **검증 수단 결정** — jsx-a11y 정적 분석은 지금 켜고(recommended 34규칙 확장, 이미 전이 의존성으로 설치돼 있어 실측 비용 0), axe-core 런타임 검증은 테스트 러너 부재(R-002)로 보류하고 근거를 `docs/decisions/accessibility-tooling.md`에 기록. **이월**: Button 44px 미적용(NFR-027 문언상 권장·Task 013 기존 결정), axe-core(러너 도입 선행)

### CREW (03.CREW.md)
- 완료 Task: **017B · 크루 설정·받은 초대함**
- 산출물:
  - 신규 — `src/lib/rules/invitation-response-eligibility.ts`, `src/lib/actions/{update-crew-info,update-crew-visibility,respond-to-invitation}.ts`, `src/components/crews/{CrewInfoForm,CrewVisibilityForm,CrewSettingsContainer,CrewSettingsSkeleton}.tsx`, `src/components/invitations/{InvitationInboxContainer,InvitationList,InvitationListSkeleton,invitation-view-models,format-invitation-expiry}.tsx`, `src/components/sample/sections/invitations.tsx`
  - 수정 — `src/lib/data/mock/crew.ts`(`UpdateCrewInfoInput`에 `colorKey` 추가·accept/declineCrewInvitationMembership 신설), `src/lib/data/mock/invitation.ts`(`getInvitationById`), `src/lib/crew-palette.ts`(`nameKo` 12색), `src/lib/strings/ko.ts`, `src/app/(app)/crews/[crewId]/settings/page.tsx`, `src/app/(app)/invitations/page.tsx`, `src/components/sample/sections/crews.tsx`, `src/components/sample/registry.ts`
- 비고: 권한 판정은 009B의 `checkPermission`(`crew:update_info`·`crew:update_visibility`·`invitation:respond`)·`transitionCrewMembershipStatus`(`accept_invitation`·`decline_invitation`)를 **호출만** — 새 판정 신설 0건(R-015). 새 순수 함수 `invitation-response-eligibility.ts`는 권한이 아니라 017A의 `invite-eligibility.ts`와 동성격의 건별 도메인 조건(만료·크루 해산) 판정. 캘린더 색 수동 지정(D-016)은 `CREW_PALETTE` 12색 라디오 그룹으로 자유 입력을 원천 차단. 받은 초대함은 만료일(14일) 표시·수락 시 즉시 `active` 전환 + `getCrewHomeHref(crewId)` 리소스 ID 이동(R-016/FR-062)·거절 후 재초대 가능. **이월**: FR-021 E3(초대 철회 — 기능·데이터 미존재), 오너 이양·해산(Task 040/v0.2)

## 교차검증 결과
활성 2인이 A팀 1(CREW)·B팀 1(DESIGN) 대칭 구성이라 리뷰 짝이 정확히 서로를 검증했다(024→CREW, 017B→DESIGN).
- **CREW → DESIGN(024)**: 코어 5항목(회귀·live region 정확성·`--input` 토큰·eslint jsx-a11y·/sample 구조) **전부 PASS**. OKLCH→상대휘도 직접 계산으로 대비 3.36:1 재검증, 다크/라이트 미러 동기 확인. minor 2건(아래 이슈 A·B).
- **DESIGN → CREW(017B)**: 코어 5항목(접근성·/sample 4상태·D-030 전환 경계·규약·스코프) **전부 PASS**. profile-1 로그인 후 실제 라우트 실측. minor 2건(아래 이슈 C·D).
- **재검증 라운드**: 네 minor 수정 후 DESIGN이 B·C·D를 라이브 브라우저로 재검증 pass. a11y.tsx 문구가 수정 과정에서 두 번(원래 stale → 반대 방향 재-stale) 어긋났으나 팀장이 실제 파일을 열어 잡아내 최종 교정 확인.

## 발견·해결한 이슈
minor 4건 — 전부 접근성 계열, 비차단.

1. **[CREW 발견 · DESIGN 024] `/sample#a11y`의 "이월" 표가 stale.** settings·invitations를 "미구현 스텁"으로 서술했으나 같은 10일차에 017B로 실제 구현됨 → 다음 QA가 두 화면을 계속 건너뛸 위험. → DESIGN이 "10일차 구현·QA 완료"로 갱신. (이 수정 과정에서 이슈 C·D를 "미해결"로 다시 잘못 적는 반대 방향 stale이 발생 → 팀장이 파일 직접 확인해 재교정 지시 → "해소됨" 이력 카드로 최종 정정, DESIGN 재확인 pass)
2. **[CREW 발견 · CREW 017B] `CrewInfoForm` 색 스와치 터치 영역이 24px 하한에 딱 걸침.** 024가 다른 3건을 28px로 늘린 기준과 불일치. → CREW가 `FieldLabel`에 `px-2 py-1` 추가, 히트영역 40×50px로 확대(닷 시각 크기 24px 유지). DESIGN 재검증 pass(라디오 키보드 내비·포커스 링·그리드 레이아웃 무손상 실측).
3. **[DESIGN 발견 · CREW 017B] `/sample` invitations 오류 패널이 도메인 오류 3종 중 `expired` 1종만 노출.** → CREW가 `LabeledDemo` 패턴으로 3종(already_responded·crew_unavailable·expired) 병렬 표시로 확장(D-030 ③). DESIGN 재검증 pass.
4. **[DESIGN 발견 · CREW 017B] 색 라디오 `aria-label`이 "N번 색상"뿐이라 스크린 리더 사용자가 실제 색을 모름.** → CREW가 `crew-palette.ts`에 `nameKo` 12색을 추가하고 `colorOptionLabel`을 "{n}번 {name}"으로 변경 → "1번 올리브색"~"12번 빨간색"으로 읽힘. 색 이름을 ko.ts가 아닌 crew-palette.ts에 둔 이유(팔레트 데이터 성격·다국어 확장 시 별도 번역 필요)를 주석으로 남김. DESIGN 재검증 pass(globals.css 주석 색상명과 1:1 대응 확인).

## 팀장 전체 테스트 (항상 실행)
- `npm run lint`: **통과** (exit 0, 에러·경고 0 — jsx-a11y recommended 34규칙 포함)
- `npx tsc --noEmit`: **통과** (exit 0)
- `npm run build`: **통과** (exit 0, 21개 라우트, 15/15 정적 페이지). `.next` 삭제 후 클린 재빌드. 신규 라우트 `/crews/[crewId]/settings`·`/invitations` 정상 생성
- **실제 렌더 확인(9일차 교훈)**: DESIGN이 024 QA·017B 재검증에서 dev 서버 기동 후 profile-1(crew-1 오너)로 로그인해 `/crews/crew-1/settings`·`/invitations`·`/sample#a11y`를 Playwright로 직접 열어 스냅샷·DOM·키보드 이벤트로 실측 완료 — `/sample`만이 아닌 실제 도메인 라우트를 렌더 검증에 포함했다

## 문서 갱신
- `docs/ROADMAP/team/02.DESIGN.md`: Task 024에 `- 상태: 완료 (10일차, 2026-07-24)` 추가
- `docs/ROADMAP/team/03.CREW.md`: Task 017B에 상태 마커 추가(오너 이양·해산 Task 040 이월·leave-crew 하드코딩 유지 명시)
- `docs/decisions/accessibility-tooling.md`: 신규 — 검증 수단 도입 결정(jsx-a11y 정적 분석 도입, axe-core 보류) 기록
- `docs/team/*.md`: **변경 없음** — 팀원 상태 변화 없음
- `docs/ISSUES.md`: **새 이슈 등재 0건** — 이번 4건은 회차 내 발견·해소돼 등재 대상 아님

## 다음 회차에 열리는 Task

| Task | 담당 | 의존 | 비고 |
| --- | --- | --- | --- |
| **025** v0.1 빌드·배포 검증 | CORE | 024 ✓ | **024 완료로 새로 열렸다.** 공수 2.3인일. 이후 `026→027→028→029A→029B`의 CORE 단독 직렬 사슬(Supabase 실데이터 전환)의 시작점 |

- **025는 CORE 단독**이다. DESIGN·CREW·BOARD는 다음 회차 대기 유력 — DESIGN의 다음 Task(031·035)는 029·027·028 의존, CREW의 다음 Task 030은 029 의존 + I-016 차단, BOARD의 다음 Task(038·033)는 030·031·032 의존. **Phase 3(화면) 전량이 이번 회차로 종료**되고, 다음부터 Phase 4(Supabase 실데이터)로 국면이 바뀐다 — 여기서부터 CORE 단독 직렬 구간이 길게 이어진다.

## git
- 브랜치: `day-10` (`main`에서 분기)
- 커밋: 아래 참고
- 푸시: 사용자 확인 대기
