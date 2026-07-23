/**
 * 여러 엔티티가 공유하는 원시 타입 별칭.
 * Mock 데이터와 Supabase 조회 결과가 같은 타입을 만족해야 하므로(NFR-035),
 * 두 구현 모두 이 별칭을 그대로 쓴다.
 */

/** UUID 등 엔티티 식별자. Supabase 스키마 확정(Task 028) 전까지는 string으로만 제약한다. */
export type Id = string;

/** ISO 8601 타임스탬프. 저장은 UTC, 표시는 사용자 타임존 기준(NFR-025). */
export type ISODateTimeString = string;

/** 시각 없이 날짜만 쓰는 필드(예: Meetup.date)의 ISO 8601 date. */
export type ISODateString = string;
