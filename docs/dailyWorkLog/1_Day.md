# 1일차 작업 로그 (2026-07-24)

## 회차 요약
- 활성 팀원: CORE · DESIGN · CREW · BOARD (4명 전원)
- 이번 회차 배치 근거: 완료 집합이 공집합이므로 `의존: 없음` · `선행 대기: 없음`인 1주차 시작 Task 4건(001·002·003·004)이 동시에 열렸다. 배치 내 선후 관계 없음 → 4명 병렬 착수.
- 결과: 이슈 5건 발견 / 전건 해소, 전체 테스트 3/3 통과.

## 팀원별 완료 내역

### CORE (01.CORE.md)
- 완료 Task: **001 · 디렉터리 구조·명명 규약·린트 규칙 확정**
- 산출물: `docs/CONVENTIONS.md`(디렉터리 트리·명명 규약·D-030 전환 경계·`/sample` 4상태 규칙), `eslint.config.mjs`(D-030/NFR-034·036 경계를 강제하는 6개 import-zone 규칙), `src/lib/{types,data/{mock,supabase},rules,realtime,actions}`·`src/hooks`·`src/components` README 스캐폴드
- 비고: eslint zone6가 배럴 `lib/data/index.ts`의 조립 import를 차단하던 버그를 교차검증에서 발견·수정(아래 이슈 4).

### DESIGN (02.DESIGN.md)
- 완료 Task: **002 · 디자인 토큰과 캘린더 12색 팔레트 정의**
- 산출물: `src/app/globals.css`(대비 3:1 검증된 크루 12색 팔레트 `--crew-1`..`--crew-12`), `src/lib/crew-palette.ts`(인덱스→색 매핑 + D-026 충돌 회피 순수 함수 `resolveCrewColorCollision`), `docs/design/calendar-palette.md`(2형 색각 ΔE 실측 근거·재현 스크립트)
- 비고: 초기 교차검증에서 fail 없음. 팔레트는 D-026 근거로 라이트·다크 단일값.

### CREW (03.CREW.md)
- 완료 Task: **004 · 컴포넌트 기반 도입(shadcn/ui) 결정과 초기 설치**
- 산출물: `components.json`, `src/lib/utils.ts`(`cn`), `src/components/ui/{button,card}.tsx`, `docs/decisions/shadcn-ui-adoption.md`. Base UI 프리미티브 채택, Tailwind v4/React 19/React Compiler 호환 확인.
- 비고: shadcn init이 유발한 다크모드 회귀를 교차검증에서 발견·수정(아래 이슈 5).

### BOARD (04.BOARD.md)
- 완료 Task: **003 · 사용자 노출 문자열 모듈과 추출 규약**
- 산출물: `src/lib/strings/{ko.ts,index.ts,README.md}`. 셀렉터 함수 기반 타입 안전 `t()`, `as const` 문자열 사전, 추출 규약·하드코딩 금지·FR-052(링크는 postId 기준) 경계 문서화.
- 비고: 문구 중복·상태 배지 불일치를 교차검증에서 발견·수정(아래 이슈 1~2).

## 교차검증 결과
- DESIGN → CORE(001): 초기 2건 지적(zone6 배럴 차단 버그·CONVENTIONS 트리 고지 누락) → 수정 후 재검증 **PASS**(프로브 5종 실측).
- CORE → DESIGN(002): 지정 4개 확인 포인트 전부 **PASS**. CLAUDE.md 다크 서술 불일치·crew-palette 위치는 후속 조치로 회부.
- BOARD → CREW(004): 대부분 PASS, 다크모드 회귀 1건 지적 → 수정 후 재검증 **PASS**(31개 토큰 전수 대조).
- CREW → BOARD(003): 문구 중복·배지 불일치 1건 FAIL → 수정 후 재검증 **PASS**(타입 레벨 실증).

## 발견·해결한 이슈
1. [BOARD] `ko.ts`의 "삭제된 게시글입니다" 완전 중복(board/chat) → `common.post.deleted` 신설·공유 (재검증 CREW pass)
2. [BOARD] `board.voteStatusBadge`↔`vote.status` 상태값 불일치·키 누락 → voteStatusBadge 제거하고 vote.status 재사용, 009A 정합화 필요 주석화 (재검증 CREW pass)
3. [BOARD] README §4→§6 상호참조 오류 → index.ts interpolate() 주석으로 정정 (재검증 CREW pass)
4. [CORE] eslint zone6 ignores가 `src/lib/data/**`를 통째로 배제 안 해 배럴 index.ts의 조립 import가 원천 차단됨 → `src/lib/data/**`로 통합(realtime과 대칭), mock↔supabase 격리 유지 (재검증 DESIGN pass, 프로브 5종)
5. [CREW] shadcn init이 `prefers-color-scheme` 자동 다크를 `.dark` 클래스로 바꿔 OS 다크모드 회귀 → `@media (prefers-color-scheme: dark)` 폴백 추가로 자동감지 복구, 명시적 토글은 Task 011 이월 (재검증 BOARD pass)

- 경미 관찰(비-blocking, 이월): README 사례 인용 위치 표현, `noMockImpl` 메시지가 zone5 컨텍스트와 살짝 어긋남, 결정 문서 리스크 절의 스냅샷 성격 — 기능 영향 없어 다음 편집 시 정리.

## 팀장 전체 테스트 (항상 실행)
- npm run lint: **통과** (0 errors, 0 warnings)
- npx tsc --noEmit: **통과** (에러 0)
- npm run build: **통과** (Next.js 16.2.11 Turbopack, Compiled successfully, 정적 페이지 4/4 생성)

## 문서 갱신
- docs/ROADMAP/team/*.md 상태 마커: 001(CORE)·002(DESIGN)·003(BOARD)·004(CREW) — `상태: 완료 (1일차, 2026-07-24)` 추가
- docs/ISSUES.md: CREW가 I-020~I-023 등재(명시적 테마 토글 Task 011 이월·Base UI 재검토·shadcn 추가 시 React Compiler 재확인·PRD §8 갱신), "다음 이슈 번호" I-024로 갱신
- CLAUDE.md: 팀장이 3곳 최신화(스택 현재 상태=스캐폴드→기반 계층 반영, 다크모드=`.dark` variant+`prefers-color-scheme` 폴백, 개발 원칙 서두=기반 계층 존재 반영, 참조 문서에 CONVENTIONS.md 추가)
- docs/team/*.md: 변경 없음(팀원 상태 변동 없음)

## 이월 사항(다음 회차 이후)
- `crew-palette.ts`의 판정 함수(`resolveCrewColorCollision`/`normalizePaletteIndex`)를 `lib/rules/`로 이관 → Task 006/007 전후(팀장 이월 결정)
- 명시적 테마 토글(ThemeProvider) → Task 011 앱 셸 (I-020)
- 12색 초과 크루의 한 날짜 셀 UI 처리(라벨 구분) → Task 013/021A
- MeetupBar 텍스트 4.5:1 대비 별도 검증 → Task 021A / Task 024

## 다음 회차에 열리는 Task
완료 집합 {001, 002, 003, 004} 기준 선행조건이 충족되는 Task:
- **CORE Task 006** (도메인 TypeScript 타입 정의) — 의존 001 ✓, 선행 대기 없음
- **CREW Task 005** (라우트 구조와 페이지 골격 생성) — 의존/선행 대기 001 ✓

두 Task는 서로 독립(둘 다 001에만 의존)이라 2일차 병렬 착수 가능. DESIGN Task 011·BOARD 009A·CREW 009B·CORE 007·008 등은 Task 006(또는 005)이 끝나야 열린다.

## git
- 브랜치: day-1
- 커밋: (아래 커밋 단계에서 기록)
- 푸시: 사용자 승인 대기
