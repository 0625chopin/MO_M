import { CREW_FILTER_COOKIE_NAME, serializeCrewFilterSelection } from "@/components/calendar/calendar-types";

/** FR-061 AC5 "선택은 다음 방문까지 유지된다" — 1년이면 사실상 "명시적으로 지우기 전까지". */
const CREW_FILTER_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

/**
 * 크루 필터 쿠키를 브라우저에서 직접 쓴다 — `CrewFilterPanel.tsx`의 이벤트 핸들러(토글 클릭)
 * 전용이다. 이 대입을 컴포넌트 함수 본문 안에 바로 두면 `eslint-plugin-react-hooks`의
 * `react-hooks/immutability` 규칙(React Compiler 연동)이 "컴포넌트 바깥에서 정의된 값
 * (`document`)을 수정한다"고 오탐 신고한다 — 실제로는 렌더 중이 아니라 클릭 이벤트 핸들러
 * 안에서만 실행되는 안전한 브라우저 부수효과인데, 규칙은 컴포넌트/훅 함수 본문만 정적으로
 * 훑어서 이걸 구분하지 못한다. 이 대입을 컴포넌트도 훅도 아닌 평범한 top-level 함수로
 * 옮기면 그 규칙의 분석 대상 밖으로 나가 오탐이 사라진다 — `"use no memo"`(D-029, 메모이제이션
 * 예외)와는 다른 문제라 그 디렉티브를 쓰지 않고 이 구조로 해결했다.
 */
export function writeCrewFilterCookie(selectedCrewIds: readonly string[]): void {
  document.cookie = `${CREW_FILTER_COOKIE_NAME}=${serializeCrewFilterSelection(selectedCrewIds)}; path=/; max-age=${CREW_FILTER_COOKIE_MAX_AGE_SECONDS}; samesite=lax`;
}
