/**
 * 채팅 말풍선의 시각 표시 — 절대 시각(HH:mm, 사용자 로캘 기준 오전/오후 포함, NFR-025)이다.
 * `board/format-post-date.ts`(작성일, 날짜만)와 달리 시:분까지 필요하고, 그 파일과 달리 이
 * 컴포넌트들은 전부 클라이언트 컴포넌트라(D-030 ②, 실시간 구독 트리) 서버·클라이언트
 * 하이드레이션 시각차 문제가 없다 — 그래도 "지금으로부터 N분 전"(`common.time.*`) 대신
 * 절대 시각을 쓰는 이유는 이 값이 `iso` 하나만의 순수 함수로 남아 "현재 시각"이라는 입력을
 * 추가하지 않아도 되기 때문이다(리렌더마다 값이 흔들리지 않는다).
 */
export function formatMessageTime(iso: string): string {
  const date = new Date(iso);
  return new Intl.DateTimeFormat("ko-KR", { hour: "2-digit", minute: "2-digit" }).format(date);
}
