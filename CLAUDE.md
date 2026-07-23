# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## 명령어

```bash
npm run dev      # 개발 서버(Turbopack), http://localhost:3000
npm run build    # 프로덕션 빌드
npm start        # 빌드 결과물 서빙
npm run lint     # ESLint(flat config). `next lint`가 아니라 순수 `eslint` 실행
```

테스트 러너·포매터·CI는 아직 설정되어 있지 않다. 타입 검사는 빌드 과정에서 이루어지며, 단독으로 확인하려면 `npx tsc --noEmit`을 쓴다.

## 스택과 현재 상태

Next.js 16.2.11(App Router) + React 19.2.4 + TypeScript(strict) + Tailwind CSS v4. 공통 기반 계층이 놓인 상태다 — `src/lib/`가 `types`·`data/{mock,supabase}`·`rules`·`realtime`·`actions`·`strings`로 계층화됐고, `src/components/ui/`(shadcn/ui)·`src/hooks/`가 있다. **디렉터리 구조·명명 규약의 단일 소스는 `docs/CONVENTIONS.md`이며, 그 경계는 `eslint.config.mjs`의 import zone 규칙으로 강제된다.** 다만 화면(`src/app/*` 라우트)·데이터 접근 구현(Mock/Supabase)·`/sample` 쇼케이스는 아직 대부분 미구현이다. 실제 API 라우트와 실데이터 연결은 Mock First가 끝난 뒤 단계다.

- 컴포넌트 기반은 **shadcn/ui**를 도입했다(`components.json`, Base UI 프리미티브). 도입 근거·주의는 `docs/decisions/shadcn-ui-adoption.md` 참고.

- 경로 별칭: `@/*` → `./src/*`
- React Compiler 활성화됨(`next.config.ts`의 `reactCompiler: true`, `babel-plugin-react-compiler` 사용). 수동 `useMemo`/`useCallback`/`memo`는 피한다. 메모이제이션은 컴파일러가 처리하며 수동 처리와 충돌할 수 있다.
  - **예외 절차가 있다 (D-029)**: React 공식 문서는 `useMemo`/`useCallback`을 "**탈출구로 계속 사용할 수 있다**"고 명시하고, Next.js는 `"use no memo"` 디렉티브를 제공한다. **측정 근거(무엇이 몇 ms 느렸는지)를 주석이나 커밋 메시지에 남기면 예외를 허용한다.** 근거 없는 예외는 허용하지 않는다.
  - 컴파일러는 **컴포넌트와 훅만** 메모이즈한다. 투표 판정·정족수·권한 판정·색 해시 같은 **React 비의존 순수 함수는 최적화 대상이 아니다.** 성능 목표(INP p75 ≤200ms)는 메모이제이션이 아니라 **렌더링 전략**(긴 목록 윈도잉, 안정적인 `key`, `startTransition`, 사전 인덱싱)으로 달성한다.
- Tailwind v4는 CSS-first 방식으로 설정되어 `tailwind.config.*` 파일이 없다. 디자인 토큰은 `src/app/globals.css`의 `@theme inline` 블록에 있고, `:root`(라이트)의 CSS 커스텀 프로퍼티와 연결된다. 테마 값 추가·변경은 JS 설정이 아니라 이 파일에서 한다.
  - **다크모드는 `.dark` 클래스 variant가 기본 기제다**(shadcn 표준: `@custom-variant dark (&:is(.dark *))`). 사용자가 명시 선택을 하기 전 기본 상태에서 OS 다크를 따라가도록 `@media (prefers-color-scheme: dark)` 폴백이 `.dark`와 **동일한 뉴트럴 토큰 값**을 미러링한다 — 두 곳의 값은 함께 고쳐 동기화한다. 명시적 테마 토글(ThemeProvider)은 아직 없다(앱 셸 Task 011로 이월, `docs/ISSUES.md` 참고).
  - 캘린더 크루 12색 팔레트(`--crew-1`..`--crew-12`)는 **라이트·다크 단일값**이라 `.dark`·폴백에서 재정의하지 않는다(D-026 근거). 대비·CVD 검토 근거는 `docs/design/calendar-palette.md`, 접근 모듈은 `src/lib/crew-palette.ts`.
- 폰트는 `layout.tsx`에서 `next/font/google`(Geist / Geist Mono)로 로드하고, `--font-geist-sans` / `--font-geist-mono` CSS 변수로 노출되어 `@theme` 블록에서 소비된다.

## 기존 습관과 달라진 Next.js 16 사항

위에서 import한 `AGENTS.md`는 Next.js 코드를 작성하기 전에 `node_modules/next/dist/docs/`의 버전 대응 문서를 읽도록 요구한다. 이 버전에서 자주 걸리는 지점들 — 상세는 `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md` 참고:

- 요청 API가 비동기다. `params`, `searchParams`, `cookies()`, `headers()`, `draftMode()`는 await 해야 한다. `icon`/`opengraph-image` 생성기의 `params`, `sitemap`의 `id`에도 적용된다.
- `middleware.ts`가 `proxy.ts`로 대체되었다.
- Turbopack이 `dev`와 `build` 모두의 기본 번들러다. Turbopack 설정은 `experimental` 아래가 아니라 `next.config.ts` 최상위(`turbopack`)에 둔다.
- 캐싱 API가 바뀌었다. `revalidateTag` 동작 변경, `updateTag`·`refresh` 추가, Cache Components용 `cacheLife`/`cacheTag`.
- `next/image` 기본값 변경(`minimumCacheTTL`, `imageSizes`, `qualities`, 쿼리 스트링이 붙은 로컬 이미지). `images.domains`와 `next/legacy/image`는 deprecated.
- 병렬 라우트에 `default.js`가 필수가 되었다.

## 사용 가능한 MCP 서버

`.mcp.json`에 설정된 서버: `supabase`(**아래 참고**), `context7`(라이브러리 문서), `shadcn`(컴포넌트 레지스트리), `playwright`(브라우저 자동화), `serena`(시맨틱 코드 도구), `sequential-thinking`, `shrimp-task-manager`(상태는 `shrimp_data/`에 저장).

> **Supabase 프로젝트 (D-018 · D-037)**
>
> `supabase` MCP가 가리키는 ref `damruradpliktkrlkakl`은 **mo_im 전용 프로젝트 `MO-IM`이다.** 원래 타 앱(축구 매니저 시뮬레이션)이 점유하던 것을 **초기화해 재사용**했으므로 `.mcp.json`·`.env.local`·PRD §8의 **ref 값은 교체하지 않는다** — 이전 지침의 "ref 교체 필요" 경고와 R-018은 이 결정으로 종결됐다. 경위·초기화 범위·검증 결과는 `docs/prioritization-and-risks.md`의 **D-037**에 있다.
>
> 그래도 **`apply_migration`은 대상 프로젝트를 되묻지 않는다.** 첫 마이그레이션 전에는 `list_tables`가 0개인지 확인하고, 낯선 테이블(`player`·`fixture` 등)이 보이면 멈춘다.

## 개발 원칙

> 이 절은 **앞으로 지킬 규칙**을 기술한다. 공통 기반 계층(`src/lib/*` 경계·`src/components/ui`·디자인 토큰·문자열 모듈)은 이미 놓였지만, 아래에 나오는 화면 경로(`src/app/sample/`, 도메인 화면 컴포넌트)와 데이터 접근 **구현**은 아직 대부분 없다(위 "스택과 현재 상태" 참고). 규칙은 그 경로를 **만들 때** 적용된다.
>
> 참조 문서 — `docs/requirements/requirements.md`(요구사항 1~5절, FR/NFR 정의), `docs/prioritization-and-risks.md`(6절 우선순위·리스크 R-\*·결정 D-\*), `docs/ISSUES.md`(미결 이슈 I-\*), `docs/CONVENTIONS.md`(디렉터리·명명 규약 단일 소스). **기능을 구현하기 전에 요구사항 문서의 해당 FR과 6.3절 결정, 그리고 `docs/CONVENTIONS.md`를 먼저 읽는다.**

### 화면 우선 개발 (Mock First Development)

- 화면은 모두 component 단위로 만듭니다.
- 화면의 모든 컴포넌트는 `http://localhost:3000/sample`에 보이도록 배치합니다.
  - 쇼케이스는 `src/app/sample/page.tsx`에 만듭니다. 카테고리 섹션 + 앵커 내비 구조로 두고, **컴포넌트를 새로 만들 때마다 여기 등록**합니다. 등록을 미루면 쇼케이스가 곧 실제 컴포넌트 목록과 어긋나 존재 의의를 잃습니다.
  - 각 컴포넌트는 **기본·로딩·빈 상태·오류** 4가지 상태를 토글로 볼 수 있게 배치합니다. Mock First 개발에서 빈 상태와 오류 상태를 나중에 붙이면 레이아웃이 무너지는 것을 이때 발견하지 못합니다.
  - 뷰포트별 확인을 프리뷰 프레임 안에서 하려면 **컨테이너 쿼리(`@container` + `@sm:`/`@lg:`)** 를 씁니다. Tailwind의 `sm:`/`lg:`는 **뷰포트 기준**이라 프레임 폭만 줄여서는 재배치되지 않습니다.
  - 접근 경로는 **`/sample`** 입니다. **v0.1에는 로케일 경로 세그먼트가 없습니다 — D-011** 참고.
- 개발은 더미 데이터(Mock Data)로 화면(UI)부터 구현합니다.
- Database 설계 및 연결 전에 화면, 컴포넌트 구조, 사용자 경험(UX)을 먼저 완성합니다.
- Mock 데이터와 실제 Database 데이터는 **동일한 TypeScript 타입**을 사용합니다.
- 화면 개발이 완료되면 Supabase Database를 설계 및 연결합니다.
- Database 연결 후 실제 데이터를 생성하여 CRUD, 인증(Authentication), 권한(RLS)을 포함한 통합 테스트를 진행합니다.
- 실제 데이터로 전환할 때 UI 컴포넌트는 수정하지 않고 **데이터 조회 부분만 교체**할 수 있도록 구현합니다.

#### 전환 경계 네 가지 (D-030 — v0.1부터 지킵니다)

위 "UI 무수정 교체" 원칙은 **읽기(서버 컴포넌트)와 쓰기(Server Action)에서는 성립하지만 실시간 경계에서는 성립하지 않습니다.** Realtime 구독은 클라이언트 컴포넌트 + 구독 생명주기 + 로컬 상태 병합을 요구하므로, Mock 단계에서 순수 표현 컴포넌트로만 만들면 전환 시 `'use client'` 전환과 상태 소유권 이동이 필요해집니다 — 정확히 이 원칙이 금지한 "UI 수정"입니다. 그래서 아래 넷을 처음부터 지킵니다.

1. **표현/컨테이너를 분리합니다.** Mock 단계에도 컨테이너를 만듭니다. 표현 컴포넌트는 데이터를 props로만 받습니다.
2. **구독을 인터페이스로 감쌉니다.** `subscribeToRoom(id, onEvent): Unsubscribe` 형태로 두어 Mock에서는 타이머를, 실데이터에서는 Supabase Realtime Broadcast를 꽂습니다.
3. **`/sample` 4상태의 "오류"에 도메인 오류를 포함합니다.** 네트워크 실패뿐 아니라 RLS 403·정원 마감·동시 수정 충돌을 상태로 만듭니다.
4. **인증 경계는 레이아웃에서 처리합니다.** `proxy.ts`는 D-011로 v0.1 범위 밖입니다.

쓰기 후 갱신은 **Server Action + `refresh()`** 패턴을 Mock 단계부터 씁니다. Next.js 16의 `updateTag`·`refresh()` 가 정확히 이 전환 시나리오를 위한 API라 나중에 조회부만 바꾸면 됩니다.

#### 다국어 (D-011 — 이전 지침에서 바뀐 부분)

**v0.1은 한국어 단독이며 경로에 로케일 세그먼트를 두지 않습니다.** `/crews`, `/calendar`, `/sample` 형태로 만듭니다. `src/app/[lang]/`·`src/proxy.ts`의 로케일 리다이렉트·`[lang]/layout.tsx`의 `notFound()` 2중 방어는 **이번 범위 밖(NFR-024, 등급 W)** 이므로 만들지 마세요. 근거와 검토한 대안은 `docs/prioritization-and-risks.md` 6.3절 D-011에 있습니다.

다만 다국어를 나중에 넣으면 모든 경로가 바뀌어 외부 링크·북마크와 채팅에 공유된 게시글 링크가 깨집니다(**R-016**). 그래서 지금부터 두 가지를 지킵니다:

- **사용자 노출 문자열을 컴포넌트에 하드코딩하지 않습니다.** 문자열 모듈로 분리해 두면 번역은 나중에 값만 채우면 됩니다(NFR-023, 등급 M).
- **게시글 링크는 경로 문자열이 아니라 리소스 ID 기준으로 저장합니다.** 경로 규칙이 바뀌어도 해석할 수 있어야 합니다(FR-052).

### 개발중 이슈 관련사항 (결정 X, 개선사항)

- `docs/ISSUES.md`에 기록합니다. **최신 이슈 번호는 이 파일에 적지 않습니다 — `docs/ISSUES.md`가 단일 소스입니다.** 번호를 여기 박아 두면 등재할 때마다 두 곳을 고쳐야 하므로 반드시 어긋납니다.
- **확정된 결정**은 ISSUES가 아니라 `docs/prioritization-and-risks.md` 6.3절 결정 기록(D-\*)이 단일 소스입니다. 결정과 미결을 같은 곳에 쓰지 마세요. 같은 파일 6.2절이 **리스크 등록부(R-\*)**이며, 최신 결정·리스크 번호도 이 파일에만 적습니다.
- 같은 이유로 **갱신되는 값(번호·개수·진행률·날짜)은 이 파일에 적지 않습니다.** 이 파일에는 바뀌지 않는 규칙만 둡니다.

### 테스트계정 (계정/비밀번호)

인증 도입 후 사용할 계정입니다. 현재는 인증 기능이 없어 사용처가 없습니다.

- chopin0625/qwer1234
- 0625chopin/qwer1234