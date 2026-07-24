import { notFound } from "next/navigation";

import { getPostDetailHref } from "@/components/board/board-links";
import { formatDayLabelKo, todayIsoUtc } from "@/components/calendar/date-grid";
import { MeetupDetail } from "@/components/meetup/MeetupDetail";
import { assertAuthenticatedSession } from "@/components/shell/auth-session";
import { getAuthSession } from "@/components/shell/get-auth-session";
import {
  getCrewById,
  getCrewMembership,
  getMeetupById,
  getPollById,
  getPollTally,
  getProfileById,
  listAttendance,
  listCrewMembers,
} from "@/lib/data";
import { isActiveMembership } from "@/lib/rules/crew-membership-transition";
import { resolveMeetupAttendanceButtonState } from "@/lib/rules/meetup-attendance-button-state";
import { groupMeetupParticipantIds } from "@/lib/rules/meetup-participant-grouping";
import type { Id, MeetupAttendance, Profile } from "@/lib/types";

/**
 * Mock 조회 컨테이너(D-030 ①) — Task 022. `src/app/(app)/meetups/[meetupId]/page.tsx`가 이
 * 컴포넌트를 조립하고, 이 컴포넌트는 `lib/data`(배럴)를 호출해 얻은 데이터를 `MeetupDetail`
 * (표현)의 props로 그대로 넘긴다. 실데이터 전환(Task 031) 시 이 파일의 조회 부분만 바뀌고
 * 표현 컴포넌트는 손대지 않는다.
 *
 * **크루원 게이트(FR-064 AC2)를 이 컨테이너가 직접 한다** — `(app)/crews/[crewId]/layout.tsx`
 * (D-039)는 `/crews/[crewId]/*` 트리에만 적용되고, 이 라우트는 `/meetups/[meetupId]`로
 * 그 트리 밖(리소스 ID 기준, R-016)에 있어 그 레이아웃을 거치지 않는다. 그래서 같은 판정
 * (`getCrewMembership` + `isActiveMembership`)을 여기서 다시 하고, 비소속이면 그 레이아웃과
 * 정확히 같은 방식으로 `cause: { code: "forbidden" }`를 던져 전역 `RouteErrorBoundary`
 * (`kind="forbidden"`)로 떨어뜨린다(`docs/CONVENTIONS.md` D-030 ④ 절, D-039 참고).
 */
export interface MeetupDetailContainerProps {
  meetupId: Id;
}

export async function MeetupDetailContainer({ meetupId }: MeetupDetailContainerProps) {
  const session = await getAuthSession();
  assertAuthenticatedSession(session);

  const meetup = await getMeetupById(meetupId);
  if (!meetup) {
    notFound();
  }

  const crew = await getCrewById(meetup.crewId);
  if (!crew) {
    notFound();
  }

  const membership = await getCrewMembership(meetup.crewId, session.profileId);
  if (!membership || !isActiveMembership(membership.status)) {
    throw new Error("이 크루의 크루원만 볼 수 있다.", {
      cause: { code: "forbidden", message: "not_crew_member" },
    });
  }

  const [members, attendances, poll] = await Promise.all([
    listCrewMembers(meetup.crewId),
    listAttendance(meetup.id),
    getPollById(meetup.pollId),
  ]);

  // FR-068 — 참석/불참/미응답 3구분(`lib/rules`, 판정)에 프로필을 조인한다(표시용 가공).
  const activeMemberIds = members
    .filter((m) => isActiveMembership(m.status))
    .map((m) => m.profileId);
  const groups = groupMeetupParticipantIds(activeMemberIds, attendances);
  const profileIds = [...new Set([...groups.attending, ...groups.absent, ...groups.noResponse])];
  const profiles = await Promise.all(profileIds.map((id) => getProfileById(id)));
  const profileById = new Map<Id, Profile>(
    profiles.filter((p): p is Profile => p !== null).map((p) => [p.id, p]),
  );
  const toParticipantView = (profileId: Id) => {
    const profile = profileById.get(profileId);
    return {
      profileId,
      displayName: profile?.displayName ?? "",
      avatarUrl: profile?.avatarUrl ?? null,
    };
  };

  const todayIso = todayIsoUtc(new Date());
  const viewerAttendance = attendances.find(
    (a: MeetupAttendance) => a.profileId === session.profileId,
  );
  const attendanceState = resolveMeetupAttendanceButtonState({
    meetup,
    todayIso,
    viewerAttendanceStatus: viewerAttendance?.status ?? null,
  });

  const tally = poll ? await getPollTally(poll.id) : null;

  return (
    <MeetupDetail
      meetup={{
        id: meetup.id,
        title: meetup.title,
        description: meetup.description,
        crewName: crew.name,
        crewColorIndex: crew.colorKey,
        date: meetup.date,
        dateLabel: formatDayLabelKo(meetup.date),
        startTime: meetup.startTime,
        place: meetup.place,
        capacity: meetup.capacity,
        attendingCount: meetup.attendingCount,
        isCancelled: meetup.status === "cancelled",
        postHref: poll ? getPostDetailHref(meetup.crewId, poll.postId) : null,
        pollTally: tally,
      }}
      participants={{
        attending: groups.attending.map(toParticipantView),
        absent: groups.absent.map(toParticipantView),
        noResponse: groups.noResponse.map(toParticipantView),
      }}
      attendanceState={attendanceState}
    />
  );
}
