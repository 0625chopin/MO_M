# 11일차 작업 로그 (2026-07-24)

## 회차 요약
- 활성 팀원: **CORE 1명** (DESIGN·CREW·BOARD 대기). 리뷰어로 **BOARD**를 교차검증에 소환.
- 이번 회차 배치 근거: 완료 집합 {Task 001~024 전량} 기준으로 선행조건이 모두 풀린 유일한 미완료 Task는 **025**(의존 024 ✓, 10일차 완료). 나머지 3명의 다음 Task는 전부 026~029 의존이라 대기 — DESIGN(031·035), CREW(030, +I-016 차단), BOARD(038·033). **Phase 3 종료 후 Phase 4(Supabase 실데이터)로 넘어가는 CORE 단독 직렬 구간의 시작점**이다.
- 결과: 이슈 **0건** 발견 / 해소 대상 없음. 전체 테스트 3/3 통과.

## 팀원별 완료 내역

### CORE (01.CORE.md)
- 완료 Task: **025 · v0.1 빌드·배포 검증**
- 산출물:
  - 신규 — `docs/decisions/build-deploy-verification.md` (검증 노트: 빌드 3종 실행 결과·turbopack 위치·next/image 기본값·legacy 미사용 grep 근거·재현 절차·Vercel 보류 사유)
  - 수정 — `docs/ROADMAP/team/01.CORE.md` (Task 025에 `상태: 완료 (11일차, 2026-07-24)` + 검증 노트 링크)
  - UI 컴포넌트·도메인 로직: **변경 없음** (규약 위반이 없어 수정 대상 자체가 없었음)
- 비고: Task 025는 검증·문서화 성격 Task. **규약 위반 0건** — `next.config.ts`는 `reactCompiler: true`만 있고 `turbopack`·`experimental`·`images` 키가 아예 없어 "turbopack이 experimental 아래에 있음"(CON-02·R-001) 위반이 성립할 대상 자체가 없다. `images` 미설정이라 Next.js 16 기본값(`minimumCacheTTL`=4h·`imageSizes`에서 16 제거·`qualities`=[75])이 그대로 적용되고 구버전 복원 오버라이드가 없다. `next/legacy/image`·`images.domains` grep 0건 — 애초에 `next/image` 사용 자체가 아직 없다(화면 단계라 정상, Task 025 범위 밖). Vercel 실배포는 NFR-039 수용 기준("CI 없이도 로컬 빌드 성공")을 로컬 빌드로 충족하되 실배포(계정·환경변수·배포훅)는 인프라 구성이 필요해 **R-002(CI 부재)를 사유로 보류**하고 문서에 명시.

## 교차검증 결과
활성이 CORE 1명뿐이라 Task 025 지정 리뷰어 **BOARD**를 소환해 교차검증했다(CORE 프로필 리뷰 짝 = DESIGN·BOARD, Task 025 리뷰어 = BOARD).
- **BOARD → CORE(025)**: 5개 검증 항목(빌드 3종 재현성·next.config.ts 판정 정확성·legacy image 미사용·검증 문서 완결성·규약 범위 이탈 여부) **전부 PASS**. 보고를 믿지 않고 세 빌드 명령을 직접 재실행(전부 exit 0, 20라우트 구성 일치)했고, `next.config.ts` 실물 8줄·grep 결과·`git diff --stat`(01.CORE.md 1줄 추가뿐)까지 실측. R-001 문서 실제 신호("`experimental.turbo` 발견")·NFR-039 원문 인용 문구까지 대조해 판정 근거 정확성 확인. **추가 이슈 0건.**

## 발견·해결한 이슈
없음. 1차 산출이 규약 위반 없이 완결됐고 교차검증에서도 새 결함이 나오지 않았다.

## 팀장 전체 테스트 (항상 실행)
- `npm run lint`: **통과** (exit 0, 출력 없음 — 위반 0)
- `npx tsc --noEmit`: **통과** (exit 0, 출력 없음)
- `npm run build`: **통과** (exit 0). `▲ Next.js 16.2.11 (Turbopack)`, 20개 라우트 전부 `ƒ (Dynamic)` — 인증 경계가 레이아웃/`cookies()` 기반이라 프리렌더 대상이 없는 것이 D-030④ 설계상 정상. TypeScript 10.1s·정적 페이지 생성 15/15 정상 종료

## 문서 갱신
- `docs/ROADMAP/team/01.CORE.md`: Task 025에 `- 상태: 완료 (11일차, 2026-07-24)` + 검증 노트 링크 추가
- `docs/decisions/build-deploy-verification.md`: 신규 — v0.1 빌드·배포 검증 노트
- `docs/team/*.md`: **변경 없음** — 팀원 상태 변화 없음
- `docs/ISSUES.md`: **새 이슈 등재 0건** — 이번 회차 발견 이슈가 없다

## 다음 회차에 열리는 Task

| Task | 담당 | 의존 | 비고 |
| --- | --- | --- | --- |
| **026** Supabase 클라이언트 도입과 환경 구성 | CORE | 025 ✓ | **025 완료로 새로 열렸다.** `@supabase/supabase-js`·`@supabase/ssr` 설치(현재 미설치, D-036), 서버/클라이언트 경계 배치, env 구성. ref는 `damruradpliktkrlkakl` 그대로(D-037). 공수 2.0인일 |

- **026도 CORE 단독**이다. DESIGN·CREW·BOARD는 다음 회차도 대기 유력 — `026 → 027 → 028 → 029A → 029B`가 CORE 단독 직렬 사슬이며, 이 구간이 끝나야(029B 완료) DESIGN 031·CREW 030이 열린다. **여기서부터 Phase 4(실데이터) CORE 단독 장기 직렬 구간**이다. 이 구간은 되돌리기가 비싼 스키마·RLS로 이어지므로 결정은 반드시 리뷰어와 대조한다(01.CORE 프로필 주의사항).
- CREW의 Task 030은 026~029 의존에 더해 **I-016(SMTP 공급자 미선정)** 차단이 걸려 있어, CORE 직렬 구간 동안 CREW가 I-016 해소(Resend·SendGrid·SES 비교)를 병행하는 것이 대체 작업 우선순위다.

## git
- 브랜치: `day-11` (`main`에서 분기)
- 커밋: 아래 참고
- 푸시: 사용자 확인 대기
