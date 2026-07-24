/**
 * 게시글 작성일 표시 포맷. 서버 컴포넌트에서 렌더하므로 "지금으로부터 N분 전" 같은 상대
 * 시각(`common.time.*`)은 쓰지 않는다 — 렌더 시각과 사용자가 보는 시각이 달라 재검증 없이는
 * 곧 부정확해지고(예: 정적 캐시), 서버·클라이언트 하이드레이션 시각차로 값이 흔들릴 수 있다.
 * 대신 고정된 절대 날짜를 `Intl.DateTimeFormat`으로 만든다(NFR-025 — 타임존은 사용자 로캘
 * 기준, 이 함수를 호출하는 실행 환경의 로캘을 그대로 따른다).
 */
export function formatPostDate(iso: string): string {
  const date = new Date(iso);
  const formatter = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value.padStart(2, "0") ?? "";
  return `${get("year")}.${get("month")}.${get("day")}`;
}
