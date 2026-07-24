/**
 * 초대 만료일 표시 포맷 — `format-post-date.ts`(`components/board/`)와 같은 이유로 상대 시각이
 * 아니라 고정 절대 날짜를 쓴다(NFR-025). 도메인마다 같은 로직을 각자 두는 것은
 * `formatAccountDate`(`ProfileEditForm.tsx`)의 전례를 따른 것이다 — 우연히 같은 포맷이라도
 * 가리키는 개체(계정 핸들 쿨다운 vs 초대 만료)가 다르면 공유하지 않는다(`strings/README.md` §4와
 * 같은 판단 기준).
 */
export function formatInvitationExpiry(iso: string): string {
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
