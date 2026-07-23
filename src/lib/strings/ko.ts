/**
 * 한국어(ko) 사용자 노출 문자열 사전 — 이 모듈의 단일 소스.
 *
 * - 여기 있는 값은 전부 **화면에 보이는 한국어 문구**다. 로그·주석·코드 식별자는 대상이 아니다.
 * - 키 구조와 명명 규칙은 `src/lib/strings/README.md` 참고.
 * - 값 안의 `{paramName}` 은 `t()` 헬퍼가 런타임에 치환하는 자리표시자다(`src/lib/strings/index.ts`).
 * - **번역을 추가할 때(v0.1 이후, D-011)**: 이 파일과 같은 키 구조를 가진 `en.ts` 등을 만들고
 *   `index.ts`의 `dictionaries`에 등록한다. 이 파일의 키를 변경하면 다른 로케일 파일도 타입 에러로
 *   즉시 드러난다(`Strings` 타입이 `typeof ko`이기 때문).
 * - **도메인 경계를 넘어 완전히 동일한 뜻·문구로 쓰이는 값**은 `common` 하위에서 한 번만 선언하고,
 *   각 도메인 객체는 이 상수를 참조해 값을 공유한다(README §4 "완전히 동일하게 쓰이면 common에
 *   둔다"). 예: `board.detail.deleted`와 `chat.postCard.deletedPost`는 둘 다 "삭제된 게시글"이라는
 *   같은 엔티티·같은 개념을 가리키므로 `common.post.deleted`를 함께 참조한다.
 */
const common = {
  actions: {
    confirm: "확인",
    cancel: "취소",
    save: "저장",
    edit: "수정",
    delete: "삭제",
    close: "닫기",
    retry: "다시 시도",
    more: "더 보기",
    share: "공유",
    copy: "복사",
    copied: "복사되었습니다",
    goBack: "뒤로 가기",
  },
  status: {
    loading: "불러오는 중…",
    empty: "표시할 내용이 없어요",
    error: "문제가 발생했어요",
  },
  time: {
    justNow: "방금 전",
    minutesAgo: "{n}분 전",
    hoursAgo: "{n}시간 전",
    daysAgo: "{n}일 전",
  },
  /** 여러 도메인이 같은 엔티티를 가리킬 때 공유하는 문구. 새 항목을 추가할 때도 이 규칙을 따른다. */
  post: {
    deleted: "삭제된 게시글입니다",
  },
} as const;

export const ko = {
  common,

  nav: {
    home: "홈",
    crews: "내 크루",
    calendar: "캘린더",
    board: "게시판",
    chat: "채팅",
    notifications: "알림",
    profile: "내 정보",
  },

  board: {
    list: {
      title: "게시판",
      empty: "아직 등록된 글이 없어요",
      writeButton: "글쓰기",
      typeFilterAll: "전체",
    },
    postType: {
      free: "자유글",
      proposal: "모임 제안",
    },
    // 목록의 투표 상태 배지는 별도 문구 세트를 두지 않고 `vote.status`를 그대로 재사용한다.
    // 예전엔 board.voteStatusBadge로 따로 뒀는데, closed_invalid 하나를 두고 "무효"/"정족수 미달"로
    // 다른 값을 쓰고 있었고 cancelled·tallying 대응 키도 없어 실제로는 vote.status의 부분 복제였다
    // (하나의 상태값에 두 벌의 문구가 존재 → §4 "상태 배지류는 상태 머신의 상태값과 키를 맞춘다"
    // 위반). 목록은 vote.status 중 open/closedPassed/closedRejected/closedInvalid 4개만 쓰고
    // cancelled/tallying은 목록 배지에 노출하지 않는다 — 이건 별도 값이 필요해서가 아니라 목록
    // AC(요구사항 §4.D AC3 "진행 중/가결/부결/무효")가 그 4개만 요구하기 때문이다.
    write: {
      title: "글쓰기",
      typeToggleLabel: "글 유형",
      fields: {
        title: "제목",
        description: "설명",
        scheduledDate: "모임 예정일",
        voteDeadline: "투표 마감 시각",
        startTime: "시작 시각",
        location: "장소",
        capacity: "정원",
      },
      draftRestoredNotice: "작성 중이던 내용을 불러왔어요",
      draftSaved: "임시 저장됨",
      submit: "등록",
      validation: {
        scheduledDateInPast: "모임 예정일은 오늘 이후여야 해요",
        voteDeadlineAfterSchedule: "투표 마감은 모임 예정일 이전이어야 해요",
        voteDeadlineInPast: "투표 마감은 현재 시각 이후여야 해요",
        duplicateDateWarning:
          "같은 날짜에 이미 가결된 모임이 있어요. 그래도 등록할까요?",
      },
    },
    detail: {
      edited: "(수정됨)",
      deleted: common.post.deleted,
      lockedNotice: "투표가 시작되어 더 이상 수정할 수 없어요",
      shareToChat: "채팅에 공유",
    },
  },

  /**
   * 상태 키는 camelCase로 통일했다(§4 명명 규칙). 실제 판정 순수 함수(Task 009A, 3~4주차 예정)의
   * 리턴값은 상태 다이어그램(requirements.md §2.4)상 `open`/`closed_passed`/`closed_rejected`/
   * `closed_invalid`처럼 snake_case일 가능성이 높다 — 그 확정 값이 나오기 전까지는 호출부가
   * snake_case → 여기 camelCase 키로 매핑해야 한다. **009A가 상태 리터럴을 확정하면 이 매핑이
   * 실제로 1:1인지, 아니면 별도 매핑 테이블이 필요한지 정합화가 필요하다.**
   */
  vote: {
    choice: {
      approve: "찬성",
      reject: "반대",
      abstain: "기권",
    },
    status: {
      open: "투표 진행 중",
      closedPassed: "가결",
      closedRejected: "부결",
      closedInvalid: "정족수 미달",
      cancelled: "취소됨",
      tallying: "결과 집계 중",
    },
    summary: {
      participants: "참여 {voted}명 / 대상 {total}명",
      quorum: "정족수 {quorum}명",
      quorumMet: "정족수 충족",
      quorumNotMet: "정족수 미달",
      timeLeft: "마감까지 {time} 남음",
      closedAt: "{time}에 종료됨",
    },
    errors: {
      votingClosed: "투표가 종료되었습니다",
      alreadyVoted: "이미 투표했습니다",
    },
    resultReason: {
      passed: "정족수 충족 · 찬성 우세로 가결되었습니다",
      rejectedTie: "찬반 동수로 부결되었습니다",
      rejectedMajority: "반대 우세로 부결되었습니다",
      invalidQuorum: "정족수 미달로 무효 처리되었습니다",
    },
  },

  meetup: {
    attendance: {
      attend: "참석",
      absent: "불참",
      full: "마감되었습니다",
      recruiting: "모집 중",
    },
    cancelled: "취소된 모임입니다",
  },

  chat: {
    postCard: {
      deletedPost: common.post.deleted,
      otherCrewPost: "다른 크루의 게시글이에요",
    },
    message: {
      deleted: "삭제된 메시지입니다",
      send: "전송",
      inputPlaceholder: "메시지를 입력하세요",
    },
  },

  notification: {
    center: {
      title: "알림",
      empty: "새 알림이 없어요",
      markAllRead: "모두 읽음으로 표시",
    },
    toast: {
      voteClosed: "투표가 종료되었어요",
    },
  },

  auth: {
    login: {
      title: "로그인",
      lockedNotice: "5회 연속 실패로 잠시 로그인이 제한돼요",
      genericError: "아이디 또는 비밀번호를 확인해 주세요",
    },
  },

  error: {
    notFound: {
      title: "페이지를 찾을 수 없어요",
      description: "주소가 바뀌었거나 삭제된 페이지예요",
    },
    forbidden: {
      title: "접근 권한이 없어요",
      description: "이 크루의 크루원만 볼 수 있어요",
    },
    network: {
      title: "연결에 문제가 있어요",
      description: "네트워크 상태를 확인하고 다시 시도해 주세요",
    },
    conflict: {
      title: "다른 사용자가 먼저 처리했어요",
      description: "최신 상태로 새로고침해 주세요",
    },
  },
} as const;
