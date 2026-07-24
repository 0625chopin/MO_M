# v0.1 빌드·배포 검증 (Task 025)

- **일자**: 2026-07-24
- **담당**: CORE(A팀)
- **참조**: NFR-039, CON-02, R-001, R-002
- **범위**: 검증·문서화만 한다. UI 컴포넌트·도메인 로직은 수정하지 않는다.

## 결론

**세 빌드 명령(`npm run build`·`npx tsc --noEmit`·`npm run lint`) 모두 exit code 0으로 통과했다.** `next.config.ts`·`src/` 전역에서 CON-02·R-001이 우려하는 위반(Turbopack 설정이 `experimental` 아래에 있음, `next/legacy/image`·`images.domains` 사용)은 **없었다** — 수정 없이 "위반 없음"으로 확인만 남긴다. Vercel 실배포는 이번 회차에서 수행하지 않았다(사유는 아래 "Vercel 실배포 보류 사유" 절).

## 1. `npm run build` (Turbopack)

```bash
$ npm run build
> mo_im@0.1.0 build
> next build

▲ Next.js 16.2.11 (Turbopack)
- Environments: .env.local

  Creating an optimized production build ...
✓ Compiled successfully in 9.5s
  Running TypeScript ...
  Finished TypeScript in 10.3s ...
  Collecting page data using 24 workers ...
  Generating static pages using 24 workers (0/15) ...
✓ Generating static pages using 24 workers (15/15) in 4.0s
  Finalizing page optimization ...

Route (app)
┌ ƒ /
├ ƒ /_not-found
├ ƒ /calendar
├ ƒ /crews
├ ƒ /crews/[crewId]
├ ƒ /crews/[crewId]/board
├ ƒ /crews/[crewId]/board/[postId]
├ ƒ /crews/[crewId]/board/new
├ ƒ /crews/[crewId]/chat
├ ƒ /crews/[crewId]/members
├ ƒ /crews/[crewId]/settings
├ ƒ /crews/new
├ ƒ /home
├ ƒ /invitations
├ ƒ /login
├ ƒ /meetups/[meetupId]
├ ƒ /notifications
├ ƒ /onboarding
├ ƒ /sample
├ ƒ /settings
└ ƒ /signup

ƒ  (Dynamic)  server-rendered on demand
```

- **exit code**: `0`
- **라우트 수**: 20개 (`/`·`/_not-found` 포함)
- **정적 페이지 수**: 0개 — 전 라우트가 `ƒ (Dynamic)`이다. Next.js 16은 `next build` 출력에서 `size`·`First Load JS` 지표를 제거했다(버전 문서 확인, 아래 3절 참고). 전 라우트가 동적인 것은 v0.1 설계상 정상이다: 인증 경계를 레이아웃에서 처리하는 구조(D-030 ④, `cookies()` 기반 세션 확인)라 정적 프리렌더 대상이 없다.
- Turbopack이 `next build`의 기본 번들러로 동작함을 배너(`▲ Next.js 16.2.11 (Turbopack)`)로 확인했다 — CON-02가 요구하는 버전 대응이 실제로 적용된 상태다.

## 2. `npx tsc --noEmit`

```bash
$ npx tsc --noEmit
(출력 없음)
```

- **exit code**: `0`. 오류 0건.

## 3. `npm run lint`

```bash
$ npm run lint
> mo_im@0.1.0 lint
> eslint
(출력 없음)
```

- **exit code**: `0`. ESLint flat config(`eslint.config.mjs`) 기준 위반 0건 — `eslint-plugin-jsx-a11y` recommended 규칙셋(Task 024 도입분)을 포함해 전부 통과했다.
- `package.json`의 `lint` 스크립트는 `next lint`가 아니라 순수 `eslint`임을 재확인했다(CLAUDE.md 기술과 일치).

## 4. `next.config.ts` — Turbopack 설정 위치 (CON-02, R-001)

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
};

export default nextConfig;
```

- **확인 결과**: `turbopack` 키 자체가 **아직 없다**. 따라서 "`experimental` 아래에 있는가"라는 R-001의 우려는 애초에 성립하지 않는다 — 잘못된 위치에 있는 설정을 옮길 필요가 없다(수정 없음).
- `experimental` 키도 없다 — `grep -n "experimental" next.config.ts`가 빈 결과를 반환했다.
- 버전 문서(`node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md` 168~202행)로 위치 규약을 재확인했다: Next.js 16은 `experimental.turbopack`을 최상위 `turbopack`으로 승격했다. 이 프로젝트가 향후 Turbopack 세부 옵션(`resolveAlias` 등)을 추가할 때는 최상위 `turbopack` 키에 넣어야 한다 — 이 문서에 재검토 조건으로 남긴다.

## 5. `next/image` 기본값과 legacy API 미사용 (버전 문서 확인 + grep 실증)

### 5-1. 기본값 변경 사항 (문서 확인)

버전 문서(722~817행)가 명시하는 Next.js 16 breaking change:

| 항목 | 15 이전 기본값 | 16 기본값 |
| --- | --- | --- |
| `images.minimumCacheTTL` | 60초 | 14400초(4시간) |
| `images.imageSizes` | `16` 포함 | `16` 제거 |
| `images.qualities` | 전체 허용 | `[75]`만 |

- **확인 결과**: `next.config.ts`에 `images` 키 자체가 없다 — 즉 위 세 값 모두 **Next.js 16 기본값이 그대로 적용된다.** 오버라이드가 없으므로 "구버전 기본값을 명시적으로 되살리는" 위반은 존재할 수 없다.
- 다만 실제로 `next/image`를 사용하는 컴포넌트가 아직 없다(아래 5-3 참고) — 이 값들은 현재 코드에 영향을 주지 않고, 화면 구현이 진행되어 이미지가 들어갈 때 실효성이 생긴다. 다음 회차에서 이미지 컴포넌트를 도입할 때 이 표를 참고하도록 재검토 조건으로 남긴다.

### 5-2. `images.domains`·`next/legacy/image` 미사용 (grep 실증)

```bash
$ grep -rn "next/legacy/image" src/
(결과 없음)

$ grep -rn "domains" src/ next.config.ts
(결과 없음)
```

- **확인 결과**: `next/legacy/image`·`images.domains` 사용 **0건**. 위반 없음.

### 5-3. `next/image` 사용 현황

```bash
$ grep -rln "next/image" src/
(결과 없음)
```

- `src/` 전역에 `next/image` import 자체가 아직 없다. 화면(도메인 UI)이 대부분 미구현 상태(CLAUDE.md "스택과 현재 상태" 참고)라 이미지 최적화 대상이 없기 때문으로, Task 025 범위에서 조치할 사항은 아니다.

## 6. Vercel 실배포 보류 사유 (NFR-039, R-002)

- **NFR-039**는 "배포 대상은 Vercel이며, 빌드는 `npm run build`로 재현 가능해야 한다"를 요구하고, 수용 기준은 "**CI 없이도 로컬 빌드 성공**"이다. 이번 회차에서 로컬 `npm run build`가 exit code 0으로 통과했으므로 **이 수용 기준은 충족된다.**
- **R-002**(테스트 러너·포매터·CI 부재)가 이 결정의 축이다: 이 저장소에는 CI 파이프라인도, Vercel 프로젝트 연결(환경 변수·도메인·배포 훅)도 아직 구성되어 있지 않다. Vercel 계정·프로젝트 생성은 이 팀원의 로컬 작업 범위를 벗어나는 인프라 결정이라 이번 회차에서 대신 만들지 않았다.
- 결과적으로 **로컬 `npm run build` 통과가 현재 유일하게 재현 가능한 검증 수단**이며, NFR-039가 요구하는 "재현 가능한 빌드"의 실체가 바로 이것이다 — Vercel 실배포가 없어도 이 요구사항은 로컬 빌드로 충족된다. 실제 Vercel 프로젝트 연결·프리뷰 배포는 별도 인프라 작업(계정·환경 변수 구성)으로 다음 회차 이후로 넘긴다.

## 7. 재현 절차

```bash
# 1) 프로덕션 빌드 (Turbopack, exit code 0 기대)
npm run build

# 2) 타입 검사 단독 실행 (출력 없음 = 통과)
npx tsc --noEmit

# 3) ESLint flat config (출력 없음 = 통과)
npm run lint

# 4) Turbopack 설정 위치 확인 — "turbopack" 키가 experimental 밖(최상위)에 있거나 아예 없어야 한다
grep -n "experimental\|turbopack" next.config.ts

# 5) images 기본값 오버라이드·legacy API 미사용 확인
grep -n "images" next.config.ts
grep -rn "next/legacy/image" src/
grep -rn "domains" src/ next.config.ts
```

- 환경: Node.js v24.18.0 · npm 11.16.0 · `next@16.2.11` · `react@19.2.4`.
- 위 4단계 모두 이번 회차와 동일한 결과(변경 없음)가 나오면 재현 성공이다.

## 확인한 것 (내가 한 것)

```bash
npm run build       # exit 0, 20 라우트 전부 ƒ(Dynamic), 정적 페이지 0개
npx tsc --noEmit     # exit 0, 오류 없음
npm run lint         # exit 0, 위반 없음
grep -n "experimental\|turbopack" next.config.ts   # 결과 없음(둘 다 미설정 — 위반 아님)
grep -rn "next/legacy/image" src/                  # 결과 없음
grep -rn "domains" src/ next.config.ts             # 결과 없음
grep -rln "next/image" src/                        # 결과 없음(아직 미사용)
```

**수정한 파일은 없다.** 검증 결과 CON-02·R-001·NFR-039 관련 규약 위반이 발견되지 않았으므로 최소 범위 수정 대상이 없다.
