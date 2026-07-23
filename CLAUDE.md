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

> **아래는 이 프로젝트가 지향하는 목표 상태이며, 아직 구현되지 않았다.** 현재 저장소에는 `src/app/[lang]/`, `src/proxy.ts`, `/sample` 쇼케이스, `docs/` 디렉터리가 존재하지 않는다(위 "스택과 현재 상태" 참고). 일차·팀·Task 번호와 컴포넌트 개수는 도달하려는 목표를 기술한 것이지 현재 사실이 아니다. 이 섹션의 경로를 참조하기 전에 실제 파일 존재 여부를 먼저 확인하고, 없으면 만드는 것이 작업 범위에 포함되는지 판단한다.

### 화면 우선 개발 (Mock First Development)

- 화면은 모두 component 단위로 만듭니다.
- 화면의 모든 컴포넌트는 `http://localhost:3000/sample`에 보이도록 배치합니다.
  - **`/sample` 쇼케이스는 34일차에 실렌더되기 시작했습니다** — `src/app/[lang]/sample/page.tsx`에 5개 카테고리 섹션 + 앵커 내비가 있고 **컴포넌트 22종이 실제로 렌더**됩니다(4팀 Task 014, 38일차까지 계속). 35일차에 **4상태 토글(`StateToggleSlot`)과 뷰포트 프리뷰(`ViewportFrame`)**가 추가됐습니다 — 프리뷰는 Tailwind `sm:`/`lg:`가 뷰포트 기준이라 컨테이너 폭만 바꾸면 재배치되지 않으므로 **컨테이너 쿼리(`@container` + `@sm:`/`@lg:`)를 씁니다.** **4팀 소유이므로 임의로 채우지 마세요.** 신규 컴포넌트를 만들면 여기 등록해야 KPI-6 커버율이 유지됩니다.
  - 접근 경로는 `/ko/sample`·`/en/sample`이며, **로케일 없는 `/sample`도 `src/proxy.ts`가 기본 로케일로 리다이렉트합니다**(더 이상 404가 아닙니다). 단 `matcher`가 `_next`·`api`·확장자 경로를 의도적으로 제외하므로, 무효 `lang` 차단은 `[lang]/layout.tsx`의 `notFound()`가 2중 방어합니다.
- 개발은 더미 데이터(Mock Data)로 화면(UI)부터 구현합니다.
- Database 설계 및 연결 전에 화면, 컴포넌트 구조, 사용자 경험(UX)을 먼저 완성합니다.
- Mock 데이터와 실제 Database 데이터는 **동일한 TypeScript 타입**을 사용합니다.
- 화면 개발이 완료되면 Supabase Database를 설계 및 연결합니다.
- Database 연결 후 실제 데이터를 생성하여 CRUD, 인증(Authentication), 권한(RLS)을 포함한 통합 테스트를 진행합니다.
- 실제 데이터로 전환할 때 UI 컴포넌트는 수정하지 않고 **데이터 조회 부분만 교체**할 수 있도록 구현합니다.

### 개발중 이슈 관련사항 (결정 X, 개선사항)

- `docs/ISSUES.md`에 기록합니다. **최신 이슈 번호는 이 파일에 적지 않습니다 — `docs/ISSUES.md`가 단일 소스입니다**(번호를 여기 박아 두면 매 일차 갱신이 필요해 반드시 stale해집니다. 실제로 I-129로 43건 뒤처진 채 방치됐습니다). **제보는 전원, 반영(파일 편집)은 1팀 코어·품질팀**이 합니다(일차 마감 교차 점검에서 나온 항목은 팀장이 직접 등재하기도 합니다).
- **확정된 결정**은 ISSUES가 아니라 `docs/require/06-prioritization-and-risks.md` 6.3절 결정 기록(D-\*)이 단일 소스입니다. 결정과 미결을 같은 곳에 쓰지 마세요.

### 테스트계정 (계정/비밀번호)

인증 도입 후 사용할 계정입니다. 현재는 인증 기능이 없어 사용처가 없습니다.

- chopin0625/qwer1234
- 0625chopin/qwer1234