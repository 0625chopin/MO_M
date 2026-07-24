import type { ISODateString, ISODateTimeString } from "@/lib/types/common.types";
import type { PollStatus } from "@/lib/types/poll.types";

/**
 * 타임존 규칙 (NFR-025 · D-003).
 *
 * 저장은 UTC, 표시는 사용자 타임존 — 이 파일의 함수들은 그 경계를 **epoch 비교**와
 * **`Intl.DateTimeFormat`의 `timeZone` 옵션**으로 지킨다. 문자열 그대로 자르거나
 * 비교하는 방식(예: ISO 문자열의 날짜 부분만 substring 비교)은 UTC와 로컬 타임존이
 * 자정을 넘나드는 경계에서 하루가 어긋난다 — 정확히 NFR-025가 "타임존 3종(UTC, KST,
 * UTC-8) 교차 검증"으로 잡으려는 결함이다. 외부 날짜/타임존 라이브러리는 새로
 * 도입하지 않았다 — 네이티브 `Date`·`Intl`만으로 충분하다(타임존 처리에 외부
 * 라이브러리가 필요하다고 판단되면 임의 설치하지 않고 먼저 보고한다).
 *
 * `now`를 인자로 받고 내부에서 `Date.now()`를 호출하지 않는다 — 순수 함수로 유지해
 * 테스트 가능하게 하기 위해서다(NFR-036).
 */

function toEpochMs(iso: ISODateTimeString): number {
  return new Date(iso).getTime();
}

/** FR-043 종료 트리거① — 마감 시각(UTC epoch) 도래 여부. */
export function isPollExpired(closesAt: ISODateTimeString, nowIso: ISODateTimeString): boolean {
  return toEpochMs(nowIso) >= toEpochMs(closesAt);
}

/**
 * FR-042 AC1 "남은 시간"의 원시값(ms)을 계산한다. 이미 지난 마감은 음수 대신 0으로
 * 클램프한다 — 이 값을 소비하는 화면이 "종료됨"과 "결과 집계 중"(FR-043 AC4, D-024)을
 * 구분하는 것은 표시 계층의 몫이라 이 함수는 그 구분을 하지 않는다.
 */
export function getPollRemainingMs(closesAt: ISODateTimeString, nowIso: ISODateTimeString): number {
  return Math.max(0, toEpochMs(closesAt) - toEpochMs(nowIso));
}

/**
 * UTC 타임스탬프를 특정 IANA 타임존의 캘린더 날짜(YYYY-MM-DD)로 변환한다.
 *
 * `en-CA` 로케일은 `Intl.DateTimeFormat`에서 `YYYY-MM-DD` 순서를 반환하는 것으로
 * 알려진 관용적 트릭이며, 그 결과가 `ISODateString`과 그대로 호환된다. FR-060
 * 캘린더 등록 날짜나 마감-예정일 순서 비교처럼 "어느 하루에 속하는가"가 중요한
 * 곳에서 쓴다(NFR-025).
 */
export function toZonedDateString(iso: ISODateTimeString, timeZone: string): ISODateString {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

const MIN_POLL_DURATION_MS = 60 * 60 * 1000; // 1시간
const MAX_POLL_DURATION_MS = 14 * 24 * 60 * 60 * 1000; // 14일

export type PollDurationValidationResult =
  | { valid: true }
  | { valid: false; reason: "too_short" | "too_long" };

/**
 * D-003 — 투표 기한은 "제안자가 생성 시 지정, 기본 72시간, 허용 범위 1시간~14일"이다.
 * 기본값(72시간) 자체는 입력 폼(Task 018B)의 몫이라 여기서 강제하지 않고, **범위
 * 검증만** 순수 함수로 둔다 — 판정 로직 재사용 원칙(NFR-036, R-015)에 따라 UI·서버
 * 양쪽에서 같은 함수를 호출한다.
 */
export function validatePollDuration(
  opensAt: ISODateTimeString,
  closesAt: ISODateTimeString,
): PollDurationValidationResult {
  const durationMs = toEpochMs(closesAt) - toEpochMs(opensAt);
  if (durationMs < MIN_POLL_DURATION_MS) return { valid: false, reason: "too_short" };
  if (durationMs > MAX_POLL_DURATION_MS) return { valid: false, reason: "too_long" };
  return { valid: true };
}

/**
 * D-003 — 투표 마감은 Meetup 예정일 이전이어야 한다("Meetup 예정일 이전이어야 한다").
 * FR-034 E2("투표 마감이 예정일 이후 → 거부")는 3.4절(D-003)을 인용한 같은 규칙의
 * 다른 표현이다 — 두 문서가 갈리는 지점이 아니라 같은 결정의 반복이라고 판단했다.
 *
 * `meetupDate`는 시각이 없는 캘린더 날짜(`ISODateString`)이므로, `closesAt`(UTC
 * 시각)을 주어진 타임존에서의 캘린더 날짜로 변환한 뒤 **문자열 사전순 비교**한다 —
 * ISO 8601 날짜 형식(`YYYY-MM-DD`)은 사전순 비교가 곧 시간순 비교와 같다.
 */
export function isPollClosingBeforeMeetupDate(
  closesAt: ISODateTimeString,
  meetupDate: ISODateString,
  timeZone: string,
): boolean {
  return toZonedDateString(closesAt, timeZone) < meetupDate;
}

/**
 * FR-043 AC4 · D-024 — "결과 집계 중" 표시 판정. 마감 시각(`closesAt`)은 지났지만 자동 종료
 * 작업(pg_cron, Task 034)이 아직 `status`를 `open`에서 종료 상태로 바꾸지 못한 window다.
 *
 * D-024 부수 결정: 이 read-time fallback은 **표시만** 복구한다 — Meetup 생성(FR-060)·알림
 * 적재(FR-045)는 이 함수를 호출한다고 해서 함께 일어나지 않는다(그 자체가 별도 판정·쓰기이며
 * Task 034 몫). 그래서 이 함수는 boolean 하나만 반환하고 아무 것도 갱신하지 않는다 — 순수
 * 판정, NFR-036.
 */
export function isPollAwaitingClosure(
  status: PollStatus,
  closesAt: ISODateTimeString,
  nowIso: ISODateTimeString,
): boolean {
  return status === "open" && isPollExpired(closesAt, nowIso);
}
