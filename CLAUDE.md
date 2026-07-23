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

Next.js 16.2.11(App Router) + React 19.2.4 + TypeScript(strict) + Tailwind CSS v4. 현재 저장소는 `create-next-app` 스캐폴드 그대로다. `src/app/{layout,page}.tsx`, `src/app/globals.css`와 설정 파일들만 있고 `lib/`, `components/`, API 라우트, 데이터 레이어는 아직 없다. 즉 해당 구조에 대한 컨벤션은 아직 정해지지 않은 상태다.

- 경로 별칭: `@/*` → `./src/*`
- React Compiler 활성화됨(`next.config.ts`의 `reactCompiler: true`, `babel-plugin-react-compiler` 사용). 수동 `useMemo`/`useCallback`/`memo`는 피한다. 메모이제이션은 컴파일러가 처리하며 수동 처리와 충돌할 수 있다.
- Tailwind v4는 CSS-first 방식으로 설정되어 `tailwind.config.*` 파일이 없다. 디자인 토큰은 `src/app/globals.css`의 `@theme inline` 블록에 있고, `:root`(라이트)와 `prefers-color-scheme: dark` 블록의 CSS 커스텀 프로퍼티와 연결된다. 테마 값 추가·변경은 JS 설정이 아니라 이 파일에서 한다.
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

`.mcp.json`에 설정된 서버: `supabase`(project ref `damruradpliktkrlkakl` — 백엔드로 의도되어 있으나 아직 클라이언트 코드 없음), `context7`(라이브러리 문서), `shadcn`(컴포넌트 레지스트리), `playwright`(브라우저 자동화), `serena`(시맨틱 코드 도구), `sequential-thinking`, `shrimp-task-manager`(상태는 `shrimp_data/`에 저장).

## 개발 원칙

> 이 절은 **앞으로 지킬 규칙**을 기술한다. 아래에 나오는 소스 경로(`src/app/sample/`, 컴포넌트, 데이터 레이어)는 **아직 하나도 존재하지 않는다** — 저장소는 `create-next-app` 스캐폴드 그대로다(위 "스택과 현재 상태" 참고). 규칙은 그 경로를 **만들 때** 적용된다.
>
> 실재하는 것은 `docs/` 뿐이다 — `docs/requirements/requirements.md`(요구사항 1~5절, FR/NFR 정의), `docs/prioritization-and-risks.md`(6절 우선순위·리스크 R-\*·결정 D-\*), `docs/ISSUES.md`(미결 이슈 I-\*). **기능을 구현하기 전에 요구사항 문서의 해당 FR과 6.3절 결정을 먼저 읽는다.**

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