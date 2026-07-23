# 디렉터리 구조·명명 규약

> **Task 001** (`docs/ROADMAP/team/01.CORE.md`) 산출물. 참조: **R-007**, R-003, R-015, NFR-034·036·037, CON-05, D-030.
> 이 문서는 **규칙**을 적는다. 갱신되는 값(번호·개수·진행률·날짜)은 적지 않는다 — `CLAUDE.md`의 재발 방지 규칙(R-006)을 따른다.

## 왜 필요한가

저장소는 `create-next-app` 스캐폴드 그대로였고 `src/app/{layout,page}.tsx`·`globals.css` 밖에는 배치 규칙이 없었다(**R-007**). 먼저 코드를 쓰는 사람이 사실상 컨벤션을 정하게 되고 나중에 되돌리는 비용이 크다. 동시에 이 프로젝트는 두 가지 되돌리기 비싼 경계를 안고 있다.

- **Mock↔실데이터 전환**(R-003): 데이터 접근 로직이 컴포넌트 안에 흩어지면 전환 시점에 UI를 광범위하게 고쳐야 한다.
- **웹→네이티브 전환 가능성**(R-015): 투표 판정·정족수·권한 판정 같은 핵심 규칙이 서버 컴포넌트 본문에 흩어지면 전환 시 재작성 대상이 된다.

아래 구조는 이 두 경계를 **디렉터리 위치와 ESLint 규칙으로 강제**해 "새 파일을 어디에 둘지 고민하는 것 자체가 경계를 지키는 것"이 되도록 한다.

---

## 디렉터리 구조

범례 — **[완료]**: 실제 코드/문서가 이미 채워짐. **[스캐폴드]**: 디렉터리와 `README.md`만 있고
비어 있음(정상 — Task 001은 구조만 잡는다). **[향후]**: 아직 디렉터리도 없고, 명시된 담당 Task가
실제로 만든다. 표시가 없으면 라우팅 파일처럼 팀원이 그때그때 만드는 위치다.

```
src/
  app/                      # 라우팅 전용. 로직을 두지 않는다 — 얇은 껍데기
    sample/                 # [향후] /sample 쇼케이스 (아래 "/sample 4상태 규칙" 참고)
    <route-segment>/        # [향후] 예: crews/, calendar/ — FR 단위로 팀원이 생성
      page.tsx
      layout.tsx
      loading.tsx
      error.tsx
      default.tsx           # 병렬 라우트(@slot)를 쓰는 세그먼트는 Next 16에서 필수

  components/
    ui/                     # [완료·부분] shadcn/ui 원시 컴포넌트 — CREW 담당(`button.tsx`·`card.tsx`
                             #   이미 존재). 이 Task에서 파일 생성 안 함
    <domain>/                # [향후] 도메인별 컴포넌트 (예: crews/, polls/, chat/, calendar/)
      <Name>Container.tsx     # 컨테이너: 데이터 조회·구독 소유 (D-030 ①)
      <Name>.tsx               # 표현: props만 받는 순수 렌더 (D-030 ①)

  lib/
    types/                  # [스캐폴드] 도메인 TypeScript 타입 — Mock·실데이터 공용 (NFR-035, Task 006)
    data/                   # 데이터 접근 레이어 (NFR-034·037, Task 007)
      index.ts                # [향후] 유일한 진입점(배럴) — 여기서 mock/supabase 중 하나를 조립.
                               #   **아직 없다** — 이 파일이 생기기 전까지 소비자는 `mock/`·`supabase/`가
                               #   비어 있어 어차피 아무것도 import할 게 없다. 배럴이 mock/supabase를
                               #   조립 import하는 것은 `eslint.config.mjs` zone 6이 허용한다(zone 2·3만
                               #   상호 참조를 막는다) — 남은 리스크 절 참고
      mock/                    # [스캐폴드] Mock 구현
      supabase/                # [스캐폴드] 실데이터(Supabase) 구현 — Phase 4
    realtime/                # [스캐폴드] 구독 인터페이스 (D-030 ②)
      index.ts                # [향후] subscribeToRoom(id, onEvent): Unsubscribe 등 인터페이스 + 조립
      mock.ts                  # [향후] Mock: 타이머 기반
      broadcast.ts              # [향후] 실데이터: Supabase Realtime Broadcast (D-023)
    rules/                  # [스캐폴드] React 비의존 순수 함수 (NFR-036) — 투표 판정·정족수·권한 판정·
                             #   색 해시 등. `crew-palette.ts`(아래)와의 경계는 "배치 원칙" 참고
    actions/                # [스캐폴드] Server Action
    strings/                # [완료] 사용자 노출 문자열 모듈 — BOARD 담당(`index.ts`·`ko.ts` 이미 존재).
                             #   이 Task에서 파일 생성 안 함
    utils.ts                # [완료] 범용 유틸리티 — **폴더가 아니라 단일 파일.** shadcn CLI
                             #   (`components.json` `aliases.utils: "@/lib/utils"`)가 만드는 `cn()`이
                             #   이미 이 경로에 있다(CREW). 새 범용 유틸은 이 파일에 추가하고, 도메인
                             #   전용 로직은 여기 넣지 않는다(도메인 순수 함수는 `lib/rules/`로)
    crew-palette.ts         # [완료] DESIGN, Task 002(CON-04·D-026·FR-062). 캘린더 12색 팔레트 상수 +
                             #   충돌 회피 워크. 애초 이 트리 초안에 없던 파일이라 1일차 교차검증에서
                             #   추가했다 — `lib/rules/`가 아니라 `lib/` 최상위에 있는 이유와 위치
                             #   타당성은 "배치 원칙"과 `src/lib/rules/README.md` 참고

  hooks/                    # [스캐폴드] 커스텀 React 훅 (useXxx)
```

### 배치 원칙

- **`src/app/`은 라우팅과 조립만 한다.** 데이터 조회·구독·판정 로직을 두지 않는다. 페이지는 컨테이너 컴포넌트를 조립하거나, 서버 컴포넌트에서 `lib/data`를 직접 호출해 표현 컴포넌트에 props로 내려준다.
- **`lib/rules/`는 React·Next·데이터 접근 레이어를 import하지 않는다.** 입력을 인자로 받고 출력을 반환하는 순수 함수만 둔다 — React Compiler는 컴포넌트·훅만 메모이즈하므로(`CLAUDE.md`) 이 계층은 애초에 최적화 대상 밖이며, 네이티브 전환 시 그대로 재사용해야 하는 부분이다(R-015, CON-05).
- **`lib/data/mock`과 `lib/data/supabase`는 서로 참조하지 않는다.** 둘 다 같은 타입(`lib/types`)을 구현하고, 소비자는 `lib/data`(배럴)만 import한다 — 구현체를 직접 import하면 전환 시 교체 지점이 흩어진다(NFR-034, R-003).
- **`lib/realtime`도 같은 이유로 배럴을 통해서만 소비한다.** Mock 단계에서는 `mock.ts`(타이머)를, 실데이터에서는 `broadcast.ts`(Supabase Broadcast)를 배럴이 선택해 조립한다(D-030 ②).
- **표현 컴포넌트(`<Name>.tsx`)는 `lib/data`·`lib/realtime`·Supabase 클라이언트를 import하지 않는다.** 데이터는 오직 props로만 받는다 — 컨테이너(`<Name>Container.tsx`)가 조회·구독을 소유한다(D-030 ①). `components/ui/`(shadcn 원시 컴포넌트)는 이 구분에서 컨테이너와 같은 취급(= 데이터 레이어 접근 없음, 별도 강제 없음)을 받는다.
- **Supabase 클라이언트(`@supabase/supabase-js` 등)는 `lib/data/supabase`와 `lib/realtime`(구현체 파일)에서만 import한다.** 그 밖의 모든 위치에서 직접 import하면 전환 경계가 새는 신호다(R-015 신호: "컴포넌트 파일에서 Supabase 클라이언트를 직접 import한다").

### 이 Task에서 만들지 않는 것 (담당 표기만)

| 경로 | 담당 | 비고 |
| --- | --- | --- |
| `src/components/ui/` | CREW | `components.json`(shadcn 레지스트리 설정)과 함께 생성. 이 회차에 `button.tsx`·`card.tsx`로 이미 채워졌다 |
| `src/lib/strings/` | BOARD | 사용자 노출 문자열 모듈(D-011·NFR-023 대응). 이 회차에 `index.ts`·`ko.ts`·`README.md`로 이미 채워졌다 |
| `src/lib/utils.ts` | CREW | shadcn CLI 산출물(`cn()`). 폴더가 아니라 파일이며 이미 존재한다 |

이 세 경로는 위 트리에 위치만 정의했고 실제 파일·디렉터리는 담당자가 만든다 — CORE는 이 Task에서 손대지 않았다.

---

## 명명 규약

| 대상 | 규칙 | 예 |
| --- | --- | --- |
| 라우트 세그먼트 폴더 | kebab-case | `app/crew-settings/` |
| Next.js 특수 파일 | 프레임워크 고정 이름 그대로 | `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `default.tsx`, `not-found.tsx` |
| 컴포넌트 파일 | PascalCase, export하는 컴포넌트명과 일치 | `PollCard.tsx`, `PollCardContainer.tsx` |
| 컨테이너 컴포넌트 | `<Name>Container.tsx` 접미사 고정 | `ChatRoomContainer.tsx` |
| 훅 | camelCase, `use` 접두 | `useSubscribeToRoom.ts` |
| 그 외 TS 모듈(함수·상수·타입) | kebab-case | `quorum.ts`, `crew-color-hash.ts` |
| 도메인 타입 파일 | `<entity>.types.ts` | `poll.types.ts`, `crew.types.ts` |
| Server Action 파일 | kebab-case, 동사로 시작 | `create-poll.ts` |
| 테스트 파일(도입 시) | 소스와 동일 위치에 `*.test.ts(x)` 콜로케이션 | `quorum.test.ts` — 러너 미도입(R-002) 상태라 규약만 예약 |

경로 별칭 `@/*` → `./src/*`는 그대로 유지한다. 같은 디렉터리·형제 파일은 상대 경로(`./`)를, 그 밖은 `@/*` 별칭을 쓴다.

---

## D-030 전환 경계 네 가지와 이 규약의 대응

`CLAUDE.md` "전환 경계 네 가지 (D-030)"를 디렉터리·규칙 수준에서 아래처럼 강제·유도한다.

1. **표현/컨테이너 분리** → `components/<domain>/<Name>.tsx`(표현) / `<Name>Container.tsx`(컨테이너) 명명 규약 + ESLint가 표현 컴포넌트의 `lib/data` import를 차단.
2. **구독을 인터페이스로 감싼다** → `lib/realtime/index.ts` 배럴 하나만 소비자에게 노출. ESLint가 `lib/data`·Supabase 클라이언트의 산발적 직접 import를 차단해 배럴 경유를 유도.
3. **`/sample` 4상태에 도메인 오류 포함** → 아래 "`/sample` 4상태 규칙" 참고.
4. **인증 경계는 레이아웃에서 처리** → `src/app/layout.tsx`(루트) 또는 인증이 필요한 세그먼트의 `layout.tsx`에서 처리한다. `proxy.ts`는 D-011로 v0.1 범위 밖이므로 만들지 않는다.

## `/sample` 4상태 규칙

- 접근 경로는 **`/sample`**(로케일 세그먼트 없음, D-011).
- 쇼케이스는 `src/app/sample/page.tsx`. 카테고리 섹션 + 앵커 내비 구조.
- **컴포넌트를 새로 만들 때마다 여기 등록한다.** 등록을 미루면 쇼케이스가 실제 컴포넌트 목록과 어긋난다(R-006 신호).
- 각 컴포넌트는 **기본·로딩·빈·오류** 4상태를 토글로 노출한다. "오류"에는 네트워크 실패뿐 아니라 **도메인 오류**(RLS 403, 정원 마감, 동시 수정 충돌)를 포함한다(D-030 ③).
- 뷰포트 확인은 프리뷰 프레임 안에서 **컨테이너 쿼리**(`@container` + `@sm:`/`@lg:`)로 한다. Tailwind의 `sm:`/`lg:`는 뷰포트 기준이라 프레임 폭만 줄여서는 재배치되지 않는다.

---

## ESLint로 강제하는 것 (`eslint.config.mjs`)

ESLint 규칙만으로 아키텍처를 완전히 강제할 수는 없다(파일명 케이스 검사는 별도 플러그인이 필요하며 이 Task의 파일 담당 경계상 `package.json`을 건드릴 수 없어 보류 — 아래 "남은 리스크" 참고). 대신 **import 방향**은 규칙으로 강제했다.

| 위치(`files`) | 차단 대상 | 근거 |
| --- | --- | --- |
| `src/lib/rules/**` | `react`·`react-dom`·`next/*`, `@/app/*`, `@/components/*`, `@/lib/data/*`, `@/lib/realtime/*`, Supabase 클라이언트 | NFR-036, R-015, CON-05 — 순수 함수는 프레임워크·데이터 레이어에 의존하지 않는다 |
| `src/lib/data/mock/**` | `@/lib/data/supabase/*`, Supabase 클라이언트 | NFR-034 — Mock 구현은 실데이터 구현을 참조하지 않는다 |
| `src/lib/data/supabase/**` | `@/lib/data/mock/*` | NFR-034 — 실데이터 구현은 Mock 구현을 참조하지 않는다 (Supabase 클라이언트는 여기서 허용) |
| `src/components/**`(표현, `ui/`·`*Container.tsx` 제외) | `@/lib/data/*`, `@/lib/realtime/*`(딥 임포트), Supabase 클라이언트 | D-030 ① — 표현 컴포넌트는 데이터를 props로만 받는다 |
| `src/components/ui/**`, `src/components/**/*Container.tsx` | Supabase 클라이언트, `@/lib/data/mock/*`·`@/lib/data/supabase/*`·`@/lib/realtime/mock`·`@/lib/realtime/broadcast`(딥 임포트) | D-030 ② — 컨테이너도 배럴(`@/lib/data`, `@/lib/realtime`)만 통해 접근한다 |
| 그 외 `src/**`(예: `app/`, `lib/actions`, `lib/utils.ts`, `hooks`) | Supabase 클라이언트, 위와 같은 딥 임포트 | R-015 신호("컴포넌트 파일에서 Supabase 클라이언트를 직접 import") 예방을 전역으로 적용 |

`src/lib/data/supabase/**`와 `src/lib/realtime/**`(구현체 파일)만 Supabase 클라이언트 import가 허용된다.

---

## 남은 리스크·다음 회차로 넘길 사항

- **파일명 케이스(kebab-case/PascalCase) 자동 검사는 아직 없다.** `eslint-plugin-unicorn`의 `filename-case`나 유사 플러그인이 필요한데 `package.json` 변경은 CREW 담당이라 이 Task에서는 추가하지 않았다. 명명 규약은 현재 **문서 + 코드 리뷰**로만 지켜진다. 새 devDependency가 필요하면 CREW와 조율해 별도 Task로 추가할 것을 제안한다.
- **`lib/realtime`의 구현체 파일명(`mock.ts`/`broadcast.ts`)은 이 Task에서 확정한 제안이다.** `src/lib/realtime/`(README.md만)까지는 이번 Task에서 스캐폴드했지만 실제 `index.ts`·`mock.ts`·`broadcast.ts`는 CORE의 Task 020A~020C(채팅, 9~13주차)에서 채운다. 이름이 달라지면 이 문서와 `eslint.config.mjs`의 딥 임포트 차단 패턴(`@/lib/realtime/mock`, `@/lib/realtime/broadcast`)을 함께 갱신해야 한다.
- **`lib/data`의 20개 엔티티를 `mock/`·`supabase/` 아래 파일 단위로 어떻게 나눌지(엔티티별 1파일 vs 도메인 묶음)는 Task 007이 정한다.** 이 문서는 두 최상위 디렉터리의 존재와 상호 비참조 규칙까지만 확정했다.
- **`src/lib/data/index.ts`(배럴)는 아직 존재하지 않는다.** 위 디렉터리 트리에 구체 파일명으로 적혀 있지만 실제로는 Task 007에서 만든다 — `lib/realtime/`의 `index.ts`·`mock.ts`·`broadcast.ts` 3파일과 같은 성격의 "아직 없음" 항목인데 최초 버전에서는 realtime 쪽만 고지하고 이쪽은 빠뜨렸었다(1일차 교차검증에서 DESIGN이 지적, 트리에 `[향후]` 표시로 정정). 이 배럴이 실제로 생기면 `mock/`·`supabase/`를 조립 import하는 코드가 되므로, **`eslint.config.mjs` zone 6의 `ignores`가 `src/lib/data/**` 전체(= 배럴 포함)를 제외하고 있다는 것을 Task 007 담당자가 알아야 한다** — 배럴이 `@/lib/data/mock/*`·`@/lib/data/supabase/*`를 import해도 zone 6에는 걸리지 않는다(zone 2·3은 여전히 mock↔supabase 상호 참조를 막는다). 1일차 교차검증에서 이 격리가 배럴 자체를 막고 있던 버그를 프로브로 확인·수정했다(아래 "ESLint 프로브 검증 기록" 참고).
- ESLint의 `no-restricted-imports`는 **정적 import 경로 문자열만** 검사한다. 동적 `import()`나 `require()` 우회, 혹은 배럴(`@/lib/data`) 내부에서의 재노출 실수는 걸러내지 못한다 — 리뷰에서 함께 확인해야 한다.
- **`src/lib/crew-palette.ts`(DESIGN, 이 회차에 이미 존재)가 이 규약과 위치가 어긋난다.** 팔레트 상수와 충돌 회피 워크는 `lib/rules/`가 아니라 `lib/` 최상위에 있다. 순수 함수라 ESLint 위반은 아니지만(“React 비의존”만 강제하지 “lib/rules 안에 있어야 함”까지는 강제하지 않는다), 명명 규약상 애매한 지점이었다. **1일차 교차검증에서 팀장이 이월 결정**: `resolveCrewColorCollision`·`normalizePaletteIndex`를 `lib/rules/`로 옮기는 작업은 CREW의 `hash(crewId)` 함수가 합류하는 Task 006/007 전후에 함께 처리한다 — 지금은 손대지 않는다. 판단 근거는 [`src/lib/rules/README.md`](../src/lib/rules/README.md)에 남아 있다.

### ESLint 프로브 검증 기록 (1일차 교차검증)

DESIGN이 지적한 "zone 6의 `ignores`가 `src/lib/data/mock/**`·`src/lib/data/supabase/**`만 제외하고 `src/lib/data/` 최상위(배럴)는 빼먹어, 배럴이 mock/supabase를 조립 import하는 순간 `noMockImpl`·`noSupabaseDataImpl`에 막힌다"는 지적을 실제 프로브 파일로 재현·수정 확인했다.

- **수정 전 재현**: `src/lib/data/index.ts`에 `@/lib/data/mock/thing`·`@/lib/data/supabase/thing`을 조립 import하는 코드를 만들면 두 줄 모두 `no-restricted-imports` 에러가 났다(배럴 자체가 원천 차단).
- **수정**: zone 6 `ignores`의 `"src/lib/data/mock/**"`·`"src/lib/data/supabase/**"` 두 줄을 `"src/lib/data/**"` 하나로 합쳐 `src/lib/realtime/**`(폴더 전체 제외)와 대칭을 맞췄다. mock↔supabase 상호 격리는 zone 2·3이 그대로 담당하므로 영향 없다.
- **수정 후 프로브 결과**(파일을 만들었다 지웠다 — 저장소에는 남기지 않음):
  - `lib/data/index.ts`가 `@/lib/data/mock/*`·`@/lib/data/supabase/*`를 조립 import → **에러 없음**(배럴 통과 확인).
  - `lib/data/mock/probe.ts`가 `@/lib/data/supabase/*`를 import → **여전히 에러**(mock↔supabase 격리 유지 확인).
  - `lib/data/supabase/probe.ts`가 `@/lib/data/mock/*`를 import → **여전히 에러**(격리 유지 확인).
  - `components/_probe/Probe.tsx`(표현, `*Container.tsx` 아님)가 `@/lib/data`를 import → **여전히 에러**(D-030 ① 유지 확인).
  - `components/_probe/ProbeContainer.tsx`가 `@/lib/data`(배럴)는 통과, `@/lib/data/mock/*`(딥 임포트)는 **여전히 에러**(D-030 ② "배럴만 허용" 유지 확인).
- **부수 수정**: 위 재현 과정에서 `noMockImpl`·`noSupabaseDataImpl`의 에러 메시지가 서로 바뀌어 있던 것도 함께 발견해 고쳤다(예: mock 디렉터리에서 supabase를 import했을 때 표시되는 문구가 "실데이터 구현은 Mock 구현을 참조하지 않는다"로 되어 있어 방향이 반대였다). 차단 대상(`group`)은 원래도 맞았으므로 기능적 오탐/누락은 없었고, 에러 메시지 문구만 방향에 맞게 정정했다.

## 리뷰 짝(DESIGN)이 볼 핵심 포인트

1. `eslint.config.mjs`의 6개 `files`/`ignores` 블록이 **서로 겹치지 않는지**(겹치면 flat config에서 나중 블록이 앞 블록의 같은 규칙을 통째로 덮어써 조용히 무력화된다) — 특히 `src/components/**` 관련 두 블록의 `ignores`.
2. 표현 컴포넌트 차단 대상에 `@/lib/data/*`뿐 아니라 `@/lib/realtime/*` 딥 임포트도 들어있는지 — D-030 ②가 ①만큼 새기 쉬운 지점이다.
3. `docs/CONVENTIONS.md`의 디렉터리 트리와 실제로 만든 빈 디렉터리(README.md 포함)가 **1:1로 일치하는지**.
4. ~~`src/lib/data/index.ts` 배럴이 zone 6에 막히는 문제~~ — **1일차 교차검증에서 DESIGN이 지적, 프로브로 재현·수정 확인 완료**("ESLint 프로브 검증 기록" 참고). 재검토 시 `src/lib/realtime/**`와 `src/lib/data/**`의 zone 6 `ignores`가 계속 대칭인지만 확인하면 된다.
4. **`src/lib/crew-palette.ts`의 위치가 이 규약과 맞는지** — `lib/rules/README.md`에 남긴 판단(팔레트 데이터는 `lib/` 최상위, 해시→인덱스 판정 함수는 `lib/rules/`)에 DESIGN이 동의하는지 확인한다.
