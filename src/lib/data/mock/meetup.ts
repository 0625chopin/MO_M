import type {
  AttendanceJoinResult,
  AttendanceStatus,
  Id,
  Meetup,
  MeetupAttendance,
} from "@/lib/types";

import { generateId, store } from "./fixtures";

/** Meetup·MeetupAttendance 데이터 접근 (FR-060~061·063~064·066~068). */

export async function getMeetupById(id: Id): Promise<Meetup | null> {
  return store.meetups.find((m) => m.id === id) ?? null;
}

export interface ListMeetupsQuery {
  crewIds: Id[];
  /** 캘린더 월간 뷰(FR-061)의 조회 구간 — 양끝 포함, ISO date 문자열 비교. */
  from: string;
  to: string;
}

/** 캘린더 월간 뷰 + 크루 필터(FR-061). 취소된 Meetup은 제외한다. */
export async function listMeetupsByCrews(opts: ListMeetupsQuery): Promise<Meetup[]> {
  const crewIdSet = new Set(opts.crewIds);
  return store.meetups.filter(
    (m) =>
      m.status === "confirmed" &&
      crewIdSet.has(m.crewId) &&
      m.date >= opts.from &&
      m.date <= opts.to,
  );
}

export interface CreateMeetupFromPollInput {
  crewId: Id;
  pollId: Id;
  title: string;
  description?: string | null;
  date: string;
  startTime?: string | null;
  place?: string | null;
  capacity?: number | null;
}

/**
 * 가결 Meetup 자동 등록(FR-060). 투표 가결 여부(D-034)는 호출자(Server Action)가
 * `lib/rules`의 판정 결과로 이미 확인했다는 전제 — 이 함수는 무조건 confirmed로 만든다.
 */
export async function createMeetupFromPoll(input: CreateMeetupFromPollInput): Promise<Meetup> {
  const meetup: Meetup = {
    id: generateId("meetup"),
    crewId: input.crewId,
    pollId: input.pollId,
    title: input.title,
    description: input.description ?? null,
    date: input.date,
    startTime: input.startTime ?? null,
    place: input.place ?? null,
    capacity: input.capacity ?? null,
    attendingCount: 0,
    status: "confirmed",
    createdAt: new Date().toISOString(),
  };
  store.meetups.push(meetup);
  return meetup;
}

export interface RespondAttendanceInput {
  meetupId: Id;
  profileId: Id;
  status: AttendanceStatus;
}

/**
 * 참석/불참 응답(FR-066) + 취소 시 자리 반환(FR-067). `unique(meetupId, profileId)`가
 * upsert 멱등성의 전제(D-019) — 여기서는 배열 검색으로 같은 전제를 흉내낸다.
 *
 * `capacity`가 null이면 정원 제한이 없어 조건부 판정을 거치지 않고 바로 반영한다.
 * capacity가 있으면 "attending으로 바뀌는 순간"에만 `attendingCount < capacity`를
 * 검사한다 — 실데이터에서는 이 검사와 증가가 단일 조건부 UPDATE로 원자적이어야
 * 하지만(D-019), Mock은 단일 스레드 이벤트 루프라 순차 실행 자체가 동등한 보장을 준다.
 */
export async function respondAttendance(
  input: RespondAttendanceInput,
): Promise<AttendanceJoinResult> {
  const meetup = store.meetups.find((m) => m.id === input.meetupId);
  if (!meetup) {
    // 호출자가 존재를 이미 보장해야 하는 진짜 프로그래밍 오류 — DataResult가 아니라 예외.
    throw new Error(`meetup ${input.meetupId} 를 찾을 수 없다.`);
  }

  const existing = store.meetupAttendances.find(
    (a) => a.meetupId === input.meetupId && a.profileId === input.profileId,
  );

  if (existing?.status === input.status) {
    return { success: true, changed: false };
  }

  const becomingAttending = input.status === "attending";
  const wasAttending = existing?.status === "attending";

  if (becomingAttending && !wasAttending) {
    if (meetup.capacity !== null && meetup.attendingCount >= meetup.capacity) {
      return { success: false, reason: "full" };
    }
    meetup.attendingCount += 1;
  } else if (!becomingAttending && wasAttending) {
    meetup.attendingCount = Math.max(0, meetup.attendingCount - 1);
  }

  const respondedAt = new Date().toISOString();
  if (existing) {
    existing.status = input.status;
    existing.respondedAt = respondedAt;
  } else {
    store.meetupAttendances.push({
      meetupId: input.meetupId,
      profileId: input.profileId,
      status: input.status,
      respondedAt,
    });
  }
  return { success: true, changed: true };
}

/** 참석자 목록 조회(FR-068). */
export async function listAttendance(meetupId: Id): Promise<MeetupAttendance[]> {
  return store.meetupAttendances.filter((a) => a.meetupId === meetupId);
}
