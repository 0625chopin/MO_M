import type { ISODateString, ISODateTimeString } from "@/lib/types/common.types";

/**
 * 시드 데이터의 기준 "현재 시각". `Date.now()`를 직접 쓰면 실행할 때마다 값이
 * 달라져 결정적 생성이 깨지므로, 고정 타임스탬프를 앵커로 쓴다(팀장 지시).
 * 이 값 기준 과거 활동(가입·게시글·채팅)과 가까운 미래 일정(진행 중 투표·예정
 * Meetup)을 함께 만든다.
 */
export const SEED_NOW: ISODateTimeString = "2026-07-24T00:00:00.000Z";

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

export function addDays(iso: ISODateTimeString, days: number): ISODateTimeString {
  return new Date(new Date(iso).getTime() + days * DAY_MS).toISOString();
}

export function addHours(iso: ISODateTimeString, hours: number): ISODateTimeString {
  return new Date(new Date(iso).getTime() + hours * HOUR_MS).toISOString();
}

/** ISODateTimeString → ISODateString(YYYY-MM-DD). UTC 자정 기준 시드 데이터라 substring으로 충분하다. */
export function toDateOnly(iso: ISODateTimeString): ISODateString {
  return iso.slice(0, 10);
}
