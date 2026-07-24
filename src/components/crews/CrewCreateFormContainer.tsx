import { CrewCreateForm } from "@/components/crews/CrewCreateForm";

/**
 * FR-010 크루 개설 컨테이너(D-030 ①, Task 016B). `SignupFormContainer`와 같은 이유로 조회할
 * 데이터가 없어도 3층 구조(page → Container → View)를 지킨다 — 오너 id는 이 화면의 props가
 * 아니라 `createCrewAction`이 자기 세션에서 직접 읽는다(개설 자체가 세션 소유자 본인 명의로만
 * 가능하므로 클라이언트가 넘길 값이 아니다). 나중에 이 화면에 조회가 필요해지면(예: 최근
 * 만든 크루 미리보기) 이 자리에 추가한다 — 데이터가 없다는 이유로 층을 건너뛰면 그 시점에
 * `CrewCreateForm`(표현 컴포넌트)까지 고쳐야 한다.
 */
export function CrewCreateFormContainer() {
  return <CrewCreateForm />;
}
