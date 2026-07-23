/**
 * `src/lib/data/` 의 유일한 외부 진입점(배럴).
 *
 * 소비자(서버 컴포넌트·Server Action·컨테이너 컴포넌트)는 항상 이 배럴을 통해서만
 * 데이터 접근 레이어를 쓴다 — `@/lib/data/mock/*`·`@/lib/data/supabase/*` 딥 임포트는
 * `eslint.config.mjs` zone 4·5·6이 막는다. 이 파일이 mock/supabase 구현을 조립
 * import하는 것은 zone 6 `ignores`가 `src/lib/data/**` 전체를 제외해 허용한다
 * (docs/CONVENTIONS.md "남은 리스크" 절 참고 — 1일차 교차검증에서 이 배럴 자체가
 * 막혀 있던 문제를 프로브로 확인·수정했다).
 *
 * 지금은 전부 Mock 구현이다(Task 007, 3~4주차). Supabase 클라이언트 도입(Task 026,
 * 20주차)과 스키마 마이그레이션(Task 028) 이후에는 아래 줄을 **도메인 모듈 단위로**
 * `./mock/<domain>`에서 `./supabase/<domain>`으로 바꾸면 된다 — 9개 모듈이 서로
 * 독립적이라 빅뱅 전환 없이 한 엔티티씩 실데이터로 옮길 수 있다. 이 배럴 밖(소비자
 * 쪽) 코드는 어떤 줄도 바뀌지 않는다는 것이 D-030 "조회부만 교체" 원칙이 실제로
 * 성립하는 근거다 — 이 성립 여부는 이 파일을 만든 사람(Task 026 담당자, 현재 CORE
 * 본인 예정)이 그때 다시 검증한다.
 */
export * from "./mock/board";
export * from "./mock/chat";
export * from "./mock/crew";
export * from "./mock/invitation";
export * from "./mock/join-request";
export * from "./mock/meetup";
export * from "./mock/notification";
export * from "./mock/poll";
export * from "./mock/profile";

export * from "./contracts";
