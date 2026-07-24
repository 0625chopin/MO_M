# 5일차 작업 로그 (2026-07-24)

## 회차 요약
- 활성 팀원: **DESIGN 단독** (1명). CORE·CREW는 **리뷰어로만** 소환했다 — 둘 다 다음 담당 Task가 013을 기다리고 있어 구현 배치에는 들어가지 않는다. BOARD는 유휴
- 이번 회차 배치 근거: 완료 집합 {001, 002, 003, 004, 005, 006, 007, 008, 009A, 009B, 010, 011, 012, 014} 기준 선행조건이 충족된 미완료 Task는 **DESIGN 013**(의존 004 ✓·012 ✓, 선행 대기 004(CREW) ✓ — 4일차 012 완료로 열림) **단 1건**이다. Phase 3 화면 Task(015A·015B·016A·016B·018A·018B·020A…)는 **전부 013에 의존**해 아직 열리지 않는다. 즉 013은 나머지 3명 전원을 대기시키는 크리티컬 패스 병목이었고, 이번 회차의 목적은 그 병목을 푸는 것이었다
- 결과: 이슈 **6건** 발견 / 전건 해소, 전체 테스트 3/3 통과. 발견 이슈는 전부 minor였고 blocker·major는 0건이다

## 팀원별 완료 내역

### DESIGN (02.DESIGN.md)
- 완료 Task: **013 · 기본 원자 컴포넌트 구현**
- 산출물:
  - 신규 원자 — `src/components/ui/{input,textarea,select,checkbox,radio-group,label,field,dialog,drawer,alert,toast,error-state}.tsx` 12개
  - 신규 쇼케이스 — `src/components/sample/sections/{forms,overlays,ToastTriggerPreview}.tsx` 3개
  - 수정 — `src/app/layout.tsx`(루트에 `<Toaster />` 1회 배치), `src/components/sample/registry.ts`(섹션 2줄 등록), `src/components/sample/sections/primitives.tsx`(Tabs·ErrorState 항목 추가), `src/components/sample/README.md`(`content`/`panels` 선택 기준 명문화), `src/components/README.md`(원자 인벤토리 표 + 접근성 확인 결과)
- 원자 15종 현황: Button·Badge·Avatar·Card·Skeleton·EmptyState는 기존, **Input·Select·Checkbox·Radio·Dialog·BottomSheet·Toast·ErrorState 8종이 신규**다. **Tabs는 파일은 있었으나 `/sample` 미등록 상태였음이 이번에 드러나 등록만 추가**했다 — 쇼케이스가 실제 컴포넌트 목록과 어긋나 있던 사례다
- 비고: 새 UI는 전부 `shadcn` MCP 레지스트리에서 먼저 찾아 설치했고, 레지스트리에 없던 2종만 직접 얹었다 — **Toast**(base-nova용 항목이 없고 있는 건 `next-themes` 의존 `sonner`뿐이라 `@base-ui/react/toast` 위에 구성), **ErrorState**(레지스트리 `alert` 위에 아이콘·재시도 버튼 추가). 포커스 트랩·Esc·복귀 포커스는 **직접 구현하지 않았다** — Base UI 프리미티브 기본 제공이며, 직접 짰다면 그게 "나중에 넣기 어려운 구조"가 됐을 것이다

## 교차검증 결과
- **CORE → DESIGN(013) 1차**: 6개 관점 중 4개 PASS(타입 안전성 `any` 0건·도메인 타입 import 0건 / D-030 표현·컨테이너 분리 / D-029 / NFR-023 문자열 경계), **minor 3건** 지적 → 아래 이슈 3·4·5. `layout.tsx`의 `<Toaster />` 추가가 `RootLayout`을 클라이언트로 끌어내리지 않았음을 `getAuthSession()` 서버 조회와 `export const metadata` 생존으로 리트머스 검증한 것이 이번 검증의 요령이었다
- **CREW → DESIGN(013) 1차**: CON-09 등록 완결성(15종 전수 실제 확인)·접근성 배선·터치 대상·토큰 준수·디자인 언어 5개 PASS, **minor 1건** 지적 → 이슈 1. Toast의 aria-live 계층은 문서가 아니라 `ToastViewport.js` 소스를 직접 읽어 `priority: "high"` → `role="alert"` 중복 렌더 구조를 확인했다
- **CORE → DESIGN 재검증**: 3건 전부 **PASS**. `tsc`·`lint`·`build`를 CORE가 직접 재실행해 결과를 보고했다(DESIGN 보고 전재 금지를 지시했다)
- **CREW → DESIGN 재검증**: CREW-1 **PASS**, CREW-2 **부분 PASS** — 수정된 인용문을 `drawer.md`와 **표 단위로 대조**해 신규 minor 1건을 잡아냈다 → 이슈 2a
- **CREW → DESIGN 2차 재검증**: **PASS**. `DrawerPopup.js`·`FloatingFocusManager.js` 소스까지 열어 DESIGN이 새로 단 "코드 기반 추정"이 실제 코드와 맞는지 확인했다(맞았다)
- **팀장 → DESIGN 최종 점검**: 문서 갱신 중 팀장이 잔재 1건 발견 → 이슈 2b

## 발견·해결한 이슈

1. **[DESIGN] `content` vs `panels` 선택 기준이 관행으로만 존재했다.** DESIGN이 Button·Badge·Card·Dialog를 `content`로 둔 근거("비동기 데이터를 갖지 않는 순수 UI 원자")가 `sample/README.md`·`showcase-types.ts`·Task 012 커밋 메시지 어디에도 없었다. 문서화된 것은 타입 레벨 사실(discriminated union이라 정확히 하나만 채운다)뿐이었다. **테스트 러너가 없어(R-002) 타입이 유일한 방어선인데, 이 규칙만은 타입도 문서도 막지 못하고 리뷰어 판단에 의존**하고 있었다 → README "지켜야 할 규칙"에 선택 기준을 명문화. (재검증 CREW **pass** — 3개 섹션 실제 배치와 모순 없음을 항목 단위로 대조)

2. **[DESIGN] Drawer의 복귀 포커스 보장을 문서 근거 없이 단정했다.** `overlays.tsx` 주석이 "Dialog와 같은 모달 계열이라 동일 보장을 받는다"고 썼는데, `drawer.md` 산문에는 포커스 트랩·Esc만 있고 복귀 포커스 문구가 없었다 → DESIGN이 재조사해 근거를 실제로 찾아냈다(`Drawer.Popup`의 `finalFocus` prop). 유추 문장 제거 + 정확한 인용으로 교체. (재검증 CREW **부분 pass** → 이슈 2a로 이어짐)

   - **2a. [DESIGN] 인용문은 정확했으나 출처 표 귀속이 틀렸다.** CREW가 표 단위로 대조한 결과, `finalFocus`는 `### Popup` prop 표(L.5397) 소속이 맞지만 `modal`은 `### Root` prop 표(L.5150) 소속인데 **주석이 둘을 모두 Popup 표 출처로 묶어** 서술했다 — 코드에서도 `Drawer`가 `modal`을 받아 `DrawerPrimitive.Root`로 넘기므로 Root 소속이 맞다. "각각 확인했다"는 주장이 반은 부정확해진 셈이다 → 출처를 표별로 분리 서술하고, `finalFocus` 기본 동작 서술은 문서 Default 컬럼이 `-`이므로 **코드 기반 추정임을 명시**해 확정 인용과 구분. (재검증 CREW **pass** — `DrawerPopup.js` L.128/355가 `finalFocus`를 `FloatingFocusManager`의 `returnFocus`로 그대로 넘기고, `FloatingFocusManager.js` L.124의 구조분해 기본값이 `returnFocus = true`라 추정이 실제로 맞음을 소스로 확인)
   - **2b. [DESIGN·팀장 발견] 같은 유추 문장이 `src/components/README.md`에 그대로 남아 있었다.** 인벤토리 표의 BottomSheet 행이 여전히 "Dialog와 동일한 모달 보장"이었다. **한 파일에서 근거를 정확히 한 뒤 다른 파일에 추정을 남겨 두면, README를 먼저 읽는 사람은 여전히 틀린 근거를 얻는다** — 교차검증 3라운드가 `overlays.tsx`만 보고 README를 보지 않아 놓친 지점이다 → 표 셀을 확정 근거 수준으로 교정.

3. **[DESIGN] `ToastTriggerPreview.tsx`가 규약과 다른 자리에 있었다.** `docs/CONVENTIONS.md` 트리와 `sample/README.md`는 `sample/` 루트를 **모든 섹션이 공유하는 인프라**(StatePreview·PreviewFrame·registry.ts 등)로, 카테고리 전용 콘텐츠는 `sections/`로 규정한다. 이 파일은 `sections/overlays.tsx` 한 곳에서만 쓰는 오버레이 전용 데모였다. ESLint zone은 둘 다 zone 4라 lint로는 안 잡힌다 — **규약이 도구로 강제되지 않는 구간**이다 → `sections/` 아래로 이동. (재검증 CORE **pass** — 옛 경로 참조 0건, CREW도 `/sample` 렌더 영향 없음 확인)

4. **[DESIGN] `ui/label.tsx`에 불필요한 `"use client"`가 붙어 있었다.** 다른 래퍼(input·select 등)는 `@base-ui/react` 프리미티브가 이미 `"use client"`를 갖고 있어 선언이 없는데, `label.tsx`만 네이티브 `<label>`을 감싸면서 자체 선언을 달아 클라이언트 번들 경계를 넓히고 있었다(레지스트리 CLI가 붙인 이례적 케이스) → 제거 후 빌드 통과 확인. (재검증 CORE **pass** — 사용처가 `field.tsx`의 `FieldLabel` → `forms.tsx`(서버 컴포넌트) 경로뿐이라 경계 문제 없음을 전수 grep으로 확인)

5. **[DESIGN] `ui/toast.tsx`에 런타임 검증 없는 타입 단언이 있었다.** `(toastObject.type as ToastVariant | undefined)`는 Base UI 실제 타입이 `type?: string`이라 "이 모듈의 `show()`를 거쳐서만 `add()`가 호출된다"는 암묵 불변식에 기대고 있었다 → `TOAST_VARIANTS` 상수 배열 기반 `isToastVariant()` 타입 가드로 교체, 알 수 없는 값은 `default`로 낙하, 불변식은 가드 함수 주석에 명시. (재검증 CORE **pass** — 가드 내부의 `as`는 `Array.includes()` 인자 타입을 통과시키기 위한 정석 패턴이고 반환값은 실제 런타임 `===` 비교 결과라 "형식만 갖춘 캐스팅"이 아님을 확인)

### 판정만 하고 고치지 않은 것
- **라이트·다크 실제 렌더 실측**: Playwright MCP 브라우저가 다른 세션에 점유돼(`Browser is already in use`) 수행하지 못했다. 새 색 토큰을 추가하지 않아 **토큰 단위 대비**는 기존 측정이 유효하지만, 이번에 새로 생긴 **합성 표면**(폼 오류 상태·Dialog/Drawer 오버레이·Toast)은 토큰 측정으로 보장되지 않는다 → **I-032로 등재**하고 Task 024(접근성·반응형 QA 패스) 필수 항목으로 이월. 브라우저 점유는 회차마다 재발할 조건이라 배정 방식(실측 담당 직렬화)까지 함께 적어 뒀다
- **`ui/field.tsx`는 자동 배선이 아니다**: `@base-ui/react/field`(FieldRoot의 자동 aria 연결)가 아니라 shadcn의 **순수 레이아웃 헬퍼**다. `htmlFor`/`id`/`aria-describedby`를 이번 폼 데모에서 수동으로 맞췄고, 다음에 도메인 폼(글쓰기·크루 개설 등)을 만들 화면 담당자도 **같은 수동 배선**을 해야 한다. `src/components/README.md`에 기록됨

## 팀장 전체 테스트 (항상 실행)
- `npm run lint`: **통과** (exit 0, 에러·경고 0건)
- `npx tsc --noEmit`: **통과** (exit 0)
- `npm run build`: **통과** (exit 0, TypeScript 통과, 15/15 정적 페이지 생성, `/sample` 포함 21개 라우트 정상)
- 위 3종은 최종 수정(이슈 2b) 반영 후 다시 실행해 통과를 확인한 결과다

## 문서 갱신
- `docs/ROADMAP/team/02.DESIGN.md`: Task 013에 `- 상태: 완료 (5일차, 2026-07-24)` 추가
- `docs/ISSUES.md`: **I-032**(원자 컴포넌트 라이트·다크 실측 미수행 + 브라우저 점유 재발 조건) 등재
- `docs/team/*.md`: **변경 없음** — 팀원 상태 변화 없음
- `src/components/README.md`·`src/components/sample/README.md`: DESIGN이 원자 인벤토리·접근성 확인 결과·`content`/`panels` 선택 기준을 기록

## 다음 회차에 열리는 Task
Task 013 완료로 **Phase 3 화면 Task가 한꺼번에 열린다** — 이번 회차 병목이 풀렸다.

| Task | 담당 | 의존 | 비고 |
| --- | --- | --- | --- |
| **015A** 인증·계정(회원가입·로그인·온보딩) | CORE | 013 ✓ | |
| **015B** 인증·계정(계정 설정·핸들 검색) | CREW | 013 ✓ | |
| **016A** 크루 탐색 / **016B** 크루 개설·크루 홈 | CREW | 013 ✓ | 016B는 017A·017B의 선행 |
| **018A** 게시판 목록·게시글 상세 / **018B** 글쓰기 | BOARD | 013 ✓ | |
| **021A** 통합 캘린더(MonthCalendar·MeetupBar) | DESIGN | 009B ✓ · 013 ✓ | |
| **020A** 채팅(MessageList·Composer·윈도잉) | CORE | 008 ✓ · 013 ✓ | |

4명 전원이 동시에 착수 가능하며, 다음 회차 배치는 **1인 1~2건**으로 산정해야 폭이 지나치게 넓어지지 않는다. `docs/SCHEDULE/SCHEDULE.md`의 주차 순서를 배치 기준으로 삼는다.

## git
- 브랜치: `day-5` (`day-4`에서 분기)
- 커밋: `Day 5: 기본 원자 컴포넌트 15종과 /sample 4상태 전수 등록 (Task 013)` — 23개 파일, +1,855줄
- 푸시: 사용자 승인 대기
