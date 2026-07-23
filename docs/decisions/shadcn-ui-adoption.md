# shadcn/ui 도입 결정 (Task 004)

- **일자**: 2026-07-24
- **담당**: CREW(A팀)
- **참조**: D-036, R-020, NFR-017, NFR-020

## 결정

**shadcn/ui를 도입하고 초기 설치를 완료한다.** PRD §8 "도입 예정" 구획의 shadcn 항목(D-036)을 실제 설치로 전환하는 첫 단계다. PRD §8 본문 갱신은 이 문서의 범위 밖이며(파일 담당 경계 밖), 별도로 반영이 필요하다.

## 근거

- **R-020**: v0.1 공수 초과 리스크의 완화책 ②로 "shadcn 도입 시 10~15인일 단축 여지"가 이미 명시돼 있다. 컴포넌트를 밑바닥부터 만들지 않고 접근성 기본기가 갖춰진 프리미티브 위에 스타일만 얹는다.
- **NFR-017(WCAG 2.2 AA) · NFR-020(키보드 전용 조작)**: shadcn/ui는 헤드리스 프리미티브(Base UI 또는 Radix) 위에 스타일을 입히는 방식이라 포커스 트랩·`aria-*`·키보드 인터랙션이 프리미티브 쪽에서 기본 제공된다. 70종 컴포넌트 × 4상태 × 접근성 요구를 팀이 전부 손으로 구현하는 것보다 리스크가 낮다.
- **React Compiler 호환**: 설치된 컴포넌트(Button, Card)는 `forwardRef` 없이 순수 함수 컴포넌트로 작성돼 있고 내부에 수동 `useMemo`/`useCallback`이 없다. CLAUDE.md가 요구하는 "컴파일러가 메모이제이션을 처리하며 수동 처리와 충돌 금지" 원칙과 충돌 없이 그대로 쓸 수 있다.

## 확인한 호환성

| 항목 | 확인 내용 |
| --- | --- |
| Tailwind v4 | shadcn CLI가 v4를 자동 감지했다(`Validating Tailwind CSS. Found v4.`). `tailwind.config.*` 없이 CSS-first(`@theme inline`)로 동작해 이 프로젝트의 기존 방식과 맞는다. |
| React 19 | 설치된 컴포넌트가 `React.ComponentProps` + `data-slot` 속성 방식으로 작성돼 있다(구 `React.forwardRef` 패턴 아님). React 19의 `ref`-as-prop과 맞는 최신 패턴이다. |
| React Compiler | Button·Card 소스에 수동 메모이제이션 없음을 직접 확인했다(아래 "설치 확인" 참고). 앞으로 shadcn 컴포넌트를 추가로 설치할 때도 같은 기준으로 확인이 필요하다 — **수동 `useMemo`/`useCallback`이 보이면 D-029 예외 절차(측정 근거 필요)를 밟지 않는 한 그대로 두지 말 것**. |
| 프리미티브 선택 | 이번 CLI 버전(shadcn 4.14.1) 기준 **Base UI(`@base-ui/react`)가 기본값**이다(2026-07 shadcn 체인지로그: "Base UI is now the default library for new shadcn/ui projects... reflects the library's stability, frequent updates, and high community adoption"). Radix는 여전히 완전히 지원되며 `-b radix`로 선택 가능하다. **이번 설치는 공식 기본값(Base UI)을 그대로 채택했다** — 특정 컴포넌트가 Base UI 전용으로만 나올 가능성이 있어 기본값을 따르는 편이 이후 컴포넌트 추가 시 마찰이 적다. |

## 설치 확인 (내가 한 것)

```bash
npx shadcn@latest init -y -d --no-monorepo   # components.json, lib/utils.ts, button.tsx
npx shadcn@latest add card -y                # card.tsx
npx tsc --noEmit   # 통과
npm run lint        # 통과 (eslint, 경고/오류 0)
npm run build        # 통과 (Turbopack, 정적 생성 성공)
```

교차검증 반영 후 재검증(같은 명령 재실행): `tsc --noEmit`·`lint` 통과, `next build`는 "Compiled successfully"(CSS 포함)까지 통과하고 이후 TS 타입체크 단계에서 이 Task 밖의 파일(`src/lib/data/*`, `src/components/_probe/*`) 때문에 실패한다 — 아래 "교차검증 반영" 절 참고.

## globals.css 변경 (팀장이 DESIGN 산출과 병합 판단할 부분)

`npx shadcn init`이 `src/app/globals.css`를 전면 재작성했다(원본 20줄 → 130줄). **가능한 한 손대지 말라는 지침에 따라 손으로 축소하는 대신, shadcn 공식 산출물을 그대로 받아들이고 버그 1건만 고쳤다** — 손으로 토큰 세트를 새로 짜면 이후 다른 팀원이 `shadcn add`로 컴포넌트를 추가할 때마다 공식 기본값과 어긋나는 위험이 이 시점의 축소보다 크다고 판단했다.

**바뀐 것**:

1. `@import "tailwindcss";` 뒤에 `@import "tw-animate-css";`, `@import "shadcn/tailwind.css";` 추가 — shadcn 4.x가 컴포넌트 공통 기반(데이터 상태 커스텀 variant, 아코디언 keyframe, `no-scrollbar` 유틸리티 등)을 프로젝트 CSS에 복붙하지 않고 npm 패키지로 배포하는 방식이다. 색상·토큰과 무관한 구조적 CSS라 팔레트 충돌 없음.
2. `@custom-variant dark (&:is(.dark *));` 추가 — 다크 모드 활성화 방식이 `prefers-color-scheme` 미디어쿼리에서 `.dark` 클래스 기반으로 바뀌었다. **교차검증에서 발견·수정됨(아래 "교차검증 반영" 참고)**: OS 자동 감지 폴백을 다시 추가해 회귀를 없앴다. 명시적 토글(ThemeProvider)이 아직 없는 부분은 **I-020**(`ISSUES.md`)으로 남겨 Task 011로 이월했다.
3. `@theme inline` 블록에 shadcn 표준 색상·반경 토큰 매핑 추가(`--color-primary`, `--color-border`, `--radius-md` 등 — Button·Card가 실제로 쓰는 토큰들 포함).
4. `:root`/`.dark`에 shadcn 기본 뉴트럴(그레이스케일, OKLCH) 팔레트 값 추가 — **브랜드 컬러 아님, shadcn CLI 기본 placeholder다.** DESIGN이 실제 값으로 덮어쓸 것을 전제로 한다.
5. `@layer base`에 `* { @apply border-border outline-ring/50; }` 등 기본 리셋 3줄 추가.
6. **버그 수정(내가 함)**: shadcn init이 생성한 `--font-sans: var(--font-sans);`는 자기 자신을 참조하는 순환 참조라 아무 값도 못 얻는다(→ Geist 폰트가 깨지고 브라우저 기본 sans로 폴백). `--font-sans: var(--font-geist-sans);`로 고쳐 `layout.tsx`의 `next/font` 변수와 다시 연결했다.

이 시점 이후 DESIGN이 같은 파일에 Task 002(캘린더 12색 팔레트, D-026/D-006/FR-062/CON-04) 작업을 이어 붙인 것을 확인했다 — 내 변경과 겹치지 않고 `@theme inline`/`:root`/`.dark` 블록 뒤쪽에 추가되는 형태였다.

### 교차검증 반영 (BOARD 지적, 1일차)

리뷰 짝 BOARD가 지적한 3건을 이 회차 안에서 수정했다:

1. **다크 모드 회귀 수정**: `.dark` 클래스 방식 전환으로 ThemeProvider 없이는 OS가 다크여도 항상 라이트로만 렌더되던 문제(create-next-app 스캐폴드에서 되던 자동 다크가 깨짐)를, `.dark` 블록 앞에 `@media (prefers-color-scheme: dark) { :root { ... } }` 폴백을 추가해 복구했다. 값은 `.dark` 블록과 완전히 동일한 뉴트럴 토큰 세트(`--background`~`--sidebar-ring`)이며, **`--crew-*`는 D-026(라이트·다크 단일값)에 따라 재정의하지 않았다.** `.dark`가 소스 순서상 이 블록보다 뒤에 있어, 향후 명시적 토글이 `.dark` 클래스를 붙이면 OS 설정과 무관하게 그쪽이 우선한다(동일 명시성에서 나중 규칙이 이긴다). 빌드 산출물(`.next/static/chunks/*.css`)에서 미디어쿼리 블록의 실제 값이 `.dark` 블록과 일치하고 `--color-crew-*`가 그 안에 없음을 확인했다.
2. **결정 문서/ISSUES 분리**: 아래 "남은 리스크" 절을 결정 이행 로그가 아니라 `docs/ISSUES.md`(I-020~I-023)로 옮겼다. 이 문서엔 참조만 남긴다.
3. **트레일링 개행 추가**: `src/app/globals.css` 파일 끝에 개행이 없던 것을 고쳤다.

수정 후 `npx tsc --noEmit` / `npm run lint` / `npm run build` 재실행 결과는 아래 "설치 확인" 절 갱신 참고. **`npm run build`의 TypeScript 타입체크 단계는 이 시점에 별도로 실패한다** — 원인은 `src/lib/data/*`·`src/components/_probe/*`(CORE로 추정되는 진행 중 작업, 이 Task의 파일 담당 경계 밖)의 미완성 probe 파일이며, `globals.css`/CSS 컴파일 자체는 "Compiled successfully" 단계에서 통과했다. 이 문서의 산출물과는 무관한 실패임을 확인했다.

## 설치/수정 파일 목록

- `components.json` (신규)
- `src/lib/utils.ts` (신규) — `cn()` 헬퍼 (`clsx` + `tailwind-merge`)
- `src/components/ui/button.tsx` (신규)
- `src/components/ui/card.tsx` (신규)
- `package.json` / `package-lock.json` — 의존성 추가: `@base-ui/react`, `class-variance-authority`, `clsx`, `lucide-react`, `shadcn`, `tailwind-merge`, `tw-animate-css`
- `src/app/globals.css` — 위 "globals.css 변경"·"교차검증 반영" 절 참고 (shadcn init 산출 + 폰트 토큰 버그 수정 + 다크모드 OS 감지 폴백 + 트레일링 개행)

## 남은 리스크

**미결 이슈의 단일 소스는 `docs/ISSUES.md`다(CLAUDE.md 규약). 이 절엔 참조만 둔다.**

- **I-020** · 다크 모드 명시적 토글(ThemeProvider) 부재 — Task 011로 이월. (자동 OS 감지 자체는 이번 회차에 복구 완료, 위 "교차검증 반영" 참고)
- **I-021** · shadcn 프리미티브 선택(Base UI)이 재검토 대상일 수 있음.
- **I-022** · `shadcn add`로 컴포넌트 추가 시 React Compiler 수동 메모 여부 매번 확인 필요.
- **I-023** · PRD §8이 shadcn을 아직 "도입 예정"으로 표기 — 갱신 미반영(파일 담당 경계 밖).

## 리뷰 짝(BOARD)이 확인할 핵심 포인트

- globals.css의 다크모드 OS 감지 폴백 값이 `.dark` 블록과 정확히 동기화돼 있는지, `--crew-*`가 폴백 블록에 없는지(D-026) 재확인.
- I-020~I-023이 `ISSUES.md` 기록 형식(상태·영역·제보·내용·영향·후속)을 지켰는지.
- Base UI 선택(공식 기본값)에 이견 없는지.
