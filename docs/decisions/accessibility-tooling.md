# 접근성 자동화 검증 도구 도입 결정 (Task 024)

- **일자**: 2026-07-24
- **담당**: DESIGN(B팀)
- **참조**: R-002, R-020, NFR-017·018·020·021·026·027, CON-09

## 결정

**정적 분석은 지금 켠다 — `eslint-plugin-jsx-a11y`의 `recommended` 규칙셋(34개) 전체를 `eslint.config.mjs`에 배선한다. 런타임 검증(axe-core류)은 지금 도입하지 않는다.**

## 근거

**R-002**(테스트 러너·CI가 없어 회귀를 잡을 수단이 없다)가 이 결정의 축이다. 두 도구는 R-002에 대한 요구사항이 서로 다르다.

- **`eslint-plugin-jsx-a11y`는 이미 설치돼 있었다.** `eslint-config-next/core-web-vitals`가 전이 의존성으로 이 패키지를 이미 받아 왔고, `jsx-a11y/alt-text`·`aria-props`·`aria-proptypes`·`aria-unsupported-elements`·`role-has-required-aria-props`·`role-supports-aria-props` 6개 규칙만 부분 배선한 채였다(아무도 결정하지 않은 상태로 켜져 있었다). 이번 결정은 **새 패키지 설치가 아니라 이미 있던 것을 온전히 켜는 것**이다 — `flatConfigs.recommended`가 34개 규칙을 제공하며, 나머지 28개(`click-events-have-key-events`·`no-noninteractive-tabindex`·`label-has-associated-control`·`tabindex-no-positive` 등)가 이번에 추가로 켜졌다.
- **정적 분석은 테스트 러너가 필요 없다.** `npm run lint`(이미 있는 명령)에 얹히므로 R-002가 막고 있는 "실행 인프라 부재" 문제와 무관하게 지금 켤 수 있다. 반면 axe-core는 **렌더링된 DOM**을 검사하는 런타임 도구라 최소한 jsdom 기반 유닛 테스트 러너(Vitest 등)나 Playwright 같은 브라우저 자동화가 있어야 실행할 수 있다 — 이 프로젝트엔 둘 다 없다(R-002 원문). axe-core를 지금 넣으려면 "접근성 도구 도입"이 아니라 "테스트 러너 도입"이라는 훨씬 큰 결정을 먼저(또는 함께) 내려야 하고, 그건 이 Task(024)의 범위와 담당(DESIGN 단독)을 넘는다.
- **비용 대비 효과가 이미 실측됐다.** 규칙셋을 켜고 전체 코드베이스에 `npm run lint`를 돌린 결과 실제 위반은 **`src/components/ui/label.tsx` 1건**뿐이었다(원시 `<label>` 래퍼라 `htmlFor` 연결이 각 호출부의 `...props`로 들어와 정적 분석기가 볼 수 없는 구조적 오탐 — 사유를 남기고 그 줄에만 `eslint-disable-next-line`을 달았다). 이는 이 프로젝트가 Task 002~023 동안 접근성을 이미 상당히 잘 지켜 왔다는 방증이고, 동시에 **"지금부터 회귀를 잡는" 안전망의 설치 비용이 사실상 0에 가깝다는 뜻**이다 — R-002가 우려하는 "컴포넌트가 늘수록 수동 확인 비용이 선형으로 증가한다"를 이 레이어에서만큼은 지금 멈출 수 있다.
- **`/sample`과는 역할이 다르다.** `/sample`(R-002 대응, CON-09)은 "이 상태가 실제로 이렇게 보이는가"를 사람이 눈으로 확인하는 회귀 지점이고, `eslint-plugin-jsx-a11y`는 "이 마크업 패턴 자체가 구조적으로 접근성을 깰 수 있는가"를 코드 작성 시점에 즉시 잡는다 — 겹치지 않고 보완한다. 특히 `click-events-have-key-events`·`no-static-element-interactions`류는 이번 QA에서 `MonthCalendar`(캘린더 셀 roving tabindex, NFR-020)처럼 키보드 대응을 수동으로 짜 넣어야 하는 위젯에서 앞으로 그 대응이 빠지는 것을 다음 사람이 코드를 짜는 즉시 경고해 준다 — QA 패스가 끝난 뒤에도 계속 작동한다는 점이 `/sample` 육안 확인과 다르다.

## 도입하지 않는 것과 재검토 조건

- **axe-core(또는 jest-axe, `@axe-core/playwright`)**: 테스트 러너 도입(R-002 해소)이 먼저 결정돼야 한다. 그 결정이 내려지면 **`/sample`이 이미 모든 컴포넌트 × 4상태를 한 페이지에 모아 둔 상태라 첫 회귀 테스트 후보로 적합하다** — 페이지 하나를 축으로 axe를 돌리면 사실상 컴포넌트 전수 검사가 된다. 이 문서는 그 결정을 대신 내리지 않는다(범위 밖).
- **파일명 케이스 등 `docs/CONVENTIONS.md`가 이미 "문서+리뷰로만 강제"라고 명시한 항목**: 이번 결정과 무관하게 그대로 둔다.

## 확인한 것 (내가 한 것)

```bash
npx tsc --noEmit                 # 통과 (변경 전/후 동일)
npm run lint                     # recommended 34개 규칙 적용 후 위반 1건 발견 → 수정 → 0건
npm run build                    # Turbopack 정적 생성까지 통과, 20개 라우트 전부 정상 컴파일
```

`package.json`에 `eslint-plugin-jsx-a11y`를 `devDependencies`에 직접 명시했다(기존엔 `eslint-config-next`의 전이 의존성으로만 존재했다) — `eslint.config.mjs`가 이제 이 패키지를 직접 `import`하므로, 전이 의존성 버전이 바뀌어 이 import가 조용히 깨지는 것을 막는다.
