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
  /** Task 011(DESIGN) — 앱 셸 브랜드 표기(`<title>`, `HeaderNav` 로고 링크)용. 고유명사라
   *  로케일이 늘어도 값은 바뀌지 않을 가능성이 높지만, NFR-023(문자열 하드코딩 금지)을
   *  일관되게 지키기 위해 컴포넌트에 직접 쓰지 않고 여기 둔다. */
  appName: "mo_im",
  actions: {
    confirm: "확인",
    cancel: "취소",
    save: "저장",
    edit: "수정",
    delete: "삭제",
    close: "닫기",
    retry: "다시 시도",
    /** Task 014 — 전역 오류·경계 화면의 "홈으로" 버튼. `goBack`(브라우저 뒤로 가기)과 달리
     *  항상 알려진 안전한 목적지(`/`)로 이동한다 — 오류 화면에서는 "뒤로"가 다시 같은 오류로
     *  돌아갈 수 있어 안전하지 않다. */
    goHome: "홈으로 가기",
    more: "더 보기",
    share: "공유",
    copy: "복사",
    copied: "복사되었습니다",
    goBack: "뒤로 가기",
    /** Task 011(DESIGN) — AppShell 키보드 접근성 스킵 링크(NFR-020). */
    skipToContent: "본문으로 바로가기",
  },
  /** Task 011(DESIGN) — 스크린 리더 전용 `aria-label` 문구. 화면에 그려지진 않지만 보조기술
   *  사용자에게는 노출되는 문구라 NFR-023 대상으로 취급한다. */
  a11y: {
    primaryNav: "주 내비게이션",
    accountNav: "계정 메뉴",
    /** 디자인 개편 — 미확인 개수 배지의 스크린 리더 문구. 배지 숫자 자체는
     *  `aria-hidden`으로 가리고(시각 장식) 링크 이름에 이 문구를 덧붙인다.
     *  개편 전에는 배지가 `aria-hidden`이기만 해서 "알림 3건"이라는 정보가
     *  보조기술 사용자에게 아예 전달되지 않았다(NFR-021). `{n}`은 배지가
     *  "9+"로 줄여 표시할 때도 **줄이지 않은 실제 개수**를 받는다. */
    unreadCount: "읽지 않음 {n}건",
    /** Task 015A — 비밀번호 필드 표시/숨김 토글 버튼(`SignupForm`·`LoginForm`)의 `aria-label`.
     *  아이콘만 있는 버튼이라 접근성 문자열이 곧 유일한 이름이다. */
    showPassword: "비밀번호 표시",
    hidePassword: "비밀번호 숨기기",
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
  /** 작성자 프로필을 찾을 수 없을 때(탈퇴 익명화 등)의 방어적 폴백 표시 이름. 게시판·채팅·
   *  알림 등 작성자 이름을 보여주는 모든 화면이 공유한다(§4 "같은 개체를 가리키면 common에"). */
  profile: {
    unknownAuthor: "탈퇴한 사용자",
  },
  /**
   * 핸들 **형식** 오류 문구 — `lib/rules/handle-validation.ts`의 `validateHandleFormat`·
   * `HANDLE_PATTERN`이 판정하는 같은 개념을 회원가입(`auth.signup`)과 계정 설정
   * (`account.settings.handle`) 두 화면이 그대로 보여준다(§4 "같은 순수 함수가 판정한 같은
   * 개념"). 6일차 교차검증 W-2(DESIGN)로 승격 — 승격 전에는 두 도메인에 같은 한국어 값이
   * 중복 선언돼 있었다. **`HANDLE_PATTERN`은 I-033으로 아직 잠정값이다** — 나중에 패턴이
   * 바뀌면 이 값 하나만 고치면 두 화면에 함께 반영된다(공유하지 않았다면 흩어진 문구를
   * 손으로 동시에 고쳐야 했다). `taken`(중복)은 형식과 무관한 별개 판정이지만 마찬가지로
   * 두 화면이 완전히 같은 개념·같은 문구를 쓰므로 함께 공유한다. 쿨다운(`cooldown`)은
   * 계정 설정에만 있는 개념이라 공유 대상이 아니다 — `account.settings.handle.errors`에
   * 그대로 둔다.
   */
  handle: {
    invalidFormat: "영문 소문자로 시작하고, 소문자·숫자·밑줄만 3~20자로 써 주세요",
    taken: "이미 사용 중인 핸들이에요",
  },
} as const;

export const ko = {
  common,

  nav: {
    home: "홈",
    calendar: "캘린더",
    board: "게시판",
    chat: "채팅",
    notifications: "알림",
    profile: "내 정보",
  },

  /**
   * SC-01 랜딩 페이지(requirements.md 5.1.1절). 값은 requirements.md 1.1절 "제품 한 줄 정의"
   * 원문 그대로다. PRD §6 "랜딩 페이지"의 "주요 기능" 항목("제품 한 줄 소개 및 핵심 가치(P1~P5)
   * 노출")이 요구하는 한 줄 소개에 해당한다. D-001("모임"을 Crew·Meetup 두 엔티티로 분리하는
   * 결정, prioritization-and-risks.md)은 이 한 줄 정의가 서술하는 크루/모임 구도의 배경 결정일
   * 뿐 이 문구 자체를 승인한 결정은 아니다 — requirements.md:35의 D-001 인용은 1.2절(P1~P5
   * 문제 정의)이 고객 검토로 확인됐다는 뜻이지 1.1절 문장을 가리키지 않는다.
   */
  landing: {
    hero: {
      title:
        "동호회·소모임(크루)을 만들고, 크루 안에서 게시글로 모임 일정을 제안하고, 찬반 투표로 확정한 뒤, 확정된 일정을 캘린더에서 한눈에 보는 웹 서비스",
    },
  },

  /** SC-06 홈 대시보드 페이지. `nav.home`(헤더 내비 라벨)과 의미가 달라 별도 키를 둔다. */
  home: {
    dashboard: {
      title: "홈 대시보드",
    },
  },

  /** SC-07~09, SC-14~15 크루 관련 페이지. */
  crew: {
    explore: {
      title: "크루 검색·탐색",
    },
    create: {
      title: "크루 개설",
    },
    home: {
      title: "크루 홈",
    },
    members: {
      title: "멤버 관리",
    },
    settings: {
      title: "크루 설정",
    },
  },

  /**
   * SC-16 통합 캘린더 페이지. `month.*`는 Task 021A(`MonthCalendar`·`MeetupBar`, FR-060~063)
   * 몫이다 — 크루 필터·`DayDetailPanel`(Task 021B)의 문구는 그 회차에 이 아래 추가한다.
   */
  calendar: {
    month: {
      title: "통합 캘린더",
      /** 요일 헤더 7개(일~토). 배열이지만 화면에 보이는 고정 어휘라 대상이다(§2). */
      weekdayShort: ["일", "월", "화", "수", "목", "금", "토"] as const,
      prevMonth: "이전 달",
      nextMonth: "다음 달",
      /** 헤더 제목. `{year}`·`{month}` 파라미터. */
      monthLabel: "{year}년 {month}월",
      /** 날짜 셀 `aria-label`(NFR-020) — 방향키로 셀에 포커스가 오면 이 문구가 읽힌다.
       *  `{date}`는 `Intl.DateTimeFormat`이 만든 "8월 14일 금요일" 같은 문구를 그대로 받는다. */
      dayAriaLabel: "{date} 일정 {count}건",
      /** `MeetupBar` 하나의 접근성 라벨(FR-061 AC3 — 크루명 + Meetup 제목). 날짜 셀 안에서는
       *  셀의 `aria-describedby`가 이 문구를 모아 전달하고, 바 자신은 `aria-hidden`으로 중복
       *  안내를 막는다(`MeetupBar.tsx` 참고). `/sample`의 단독 데모에서는 바 자신이 이 라벨을 쓴다. */
      barAriaLabel: "{crewName} — {title}",
      /** 하루 최대 노출 바 수(3개) 초과분 요약(FR-061 AC2 "+2"). */
      overflowLabel: "+{n}",
      overflowAriaLabel: "그 외 {n}건 더보기",
      /** FR-061 E1 — 이번 달 Meetup이 0건일 때 격자 위에 붙는 안내. */
      empty: "이번 달에는 등록된 모임이 없어요",
      /** FR-061 E3 — 네트워크 실패류의 일반 오류. */
      errorTitle: "일정을 불러오지 못했어요",
      errorDescription: "네트워크 상태를 확인한 뒤 다시 시도해 주세요.",
      /** D-030 ③ 도메인 오류 — 비공개 크루 캘린더 접근 등 RLS 403류(D-007·D-017). */
      forbiddenTitle: "크루 일정을 볼 권한이 없어요",
      forbiddenDescription: "비공개 크루의 캘린더는 크루원만 볼 수 있어요.",
    },
  },

  /**
   * SC-19 계정 설정 페이지(FR-004·006, Task 015B). `nav.profile`("내 정보"는 헤더 계정 메뉴
   * 라벨)과는 의미가 달라 별도 키를 둔다. `title`은 Task 011(앱 셸)이 이미 만든 라우트 스텁이
   * 참조하던 값이라 그대로 유지했다 — 이 회차는 그 아래에 실제 화면 문구를 채운다.
   *
   * `handle.errors.invalidFormat`·`handle.errors.taken`은 `common.handle.invalidFormat`·
   * `common.handle.taken`을 그대로 참조한다 — `auth.signup.errors`의 동명 문구와 같은 순수
   * 함수(`validateHandleFormat`)가 판정하는 같은 개념이라 6일차 교차검증 W-2(DESIGN)로
   * `common`에 승격했다(`common` 모듈의 `handle` 키 docstring 참고). `cooldown`은 계정 설정
   * 전용 개념이라 공유하지 않는다.
   */
  account: {
    settings: {
      title: "계정 설정",
      description: "표시 이름·핸들·소개와 검색 노출 여부를 관리해요.",
      fields: {
        displayName: "표시 이름",
        bio: "한 줄 소개",
        bioPlaceholder: "나를 소개하는 한 줄을 남겨 보세요",
        searchOptOut: "핸들 검색 결과에 노출하지 않기",
        searchOptOutDescription:
          "켜면 다른 사람이 핸들로 나를 찾을 수 없어요. 이미 받은 초대는 그대로 유지돼요.",
      },
      submit: "저장",
      submitPending: "저장하는 중…",
      saved: "저장했어요",
      errors: {
        displayNameRequired: "표시 이름을 입력해 주세요",
        displayNameTooLong: "표시 이름은 30자 이하로 입력해 주세요",
        bioTooLong: "한 줄 소개는 150자 이하로 입력해 주세요",
        /** FR-002 E3과 같은 개념(세션 만료)이라 `auth.onboarding.errors.sessionExpired`와
         *  문구가 같다 — 다만 그쪽은 온보딩 전용 도메인이라 별도로 뒀다(§4). */
        sessionExpired: "로그인이 만료됐어요. 다시 로그인해 주세요.",
        loadFailed: "프로필 정보를 불러오지 못했어요",
        /** OnboardingFormContainer 문서화된 엣지 케이스(세션은 있는데 프로필 레코드가 없는
         *  Mock 경쟁 조건)와 같은 상황을 계정 설정 화면에서도 대비한다. */
        notFound: "프로필 정보를 찾을 수 없어요",
      },
      /** FR-004 AC1 — 핸들은 표시 이름·소개와 저장 트랜잭션을 분리했다(별도 폼·별도 액션,
       *  `lib/actions/change-account-handle.ts` docstring 참고) — 30일 쿨다운이라는 별도의
       *  실패 모드를 갖기 때문이다. */
      handle: {
        heading: "핸들",
        description: "다른 사람이 나를 검색할 때 쓰는 공개 아이디예요. 30일에 한 번만 바꿀 수 있어요.",
        label: "핸들",
        submit: "핸들 변경",
        submitPending: "변경하는 중…",
        saved: "핸들을 변경했어요",
        /** {date}는 YYYY.MM.DD 형식의 절대 날짜다(NFR-025, `formatPostDate`와 같은 이유로
         *  상대 시각을 쓰지 않는다). */
        lockedNotice: "다음 변경은 {date} 이후에 가능해요",
        errors: {
          invalidFormat: common.handle.invalidFormat,
          taken: common.handle.taken,
          /** 계정 설정 전용 개념(30일 쿨다운)이라 공유하지 않는다. */
          cooldown: "핸들은 30일에 한 번만 바꿀 수 있어요",
        },
      },
    },
    /**
     * FR-006 핸들 검색(D-005) — `UserSearchField`·`UserSearchResult`가 쓴다. 계정 설정
     * 화면에서 먼저 채우지만, Task 017A(멤버 초대 다이얼로그)가 같은 컴포넌트를 재사용할 때도
     * 이 문구를 그대로 쓸 수 있다(초대 버튼 등 맥락별 추가 문구는 그때 별도 도메인에 둔다).
     */
    search: {
      heading: "사용자 검색",
      description: "핸들을 정확히 입력하면 사용자를 찾을 수 있어요. 일부만 입력하면 검색되지 않아요(D-005).",
      fields: {
        handle: "핸들",
        placeholder: "찾을 사용자의 핸들 입력",
      },
      submit: "검색",
      submitPending: "검색하는 중…",
      /** R-012 — "핸들이 없음"과 "옵트아웃"을 이 문구 하나로 통일한다(`lib/rules/handle-search.ts`
       *  `projectHandleSearchResult`가 두 경우를 같은 값으로 만든 뒤 이 문구가 그 값을 그린다). */
      notFound: "해당 핸들의 사용자가 없습니다",
      /** NFR-016(v0.2, 분당 20회) 상태를 미리 보여주는 `/sample` 전용 정적 데모 문구 —
       *  실제 카운팅은 아직 없다(`search-user-by-handle.ts` docstring 참고). */
      rateLimited: "너무 많이 검색했어요. 잠시 후 다시 시도해 주세요.",
      resultAriaLabel: "검색 결과",
    },
  },

  /** SC-20 받은 초대함 페이지. */
  invitation: {
    inbox: {
      title: "받은 초대함",
    },
  },

  board: {
    list: {
      title: "게시판",
      empty: "아직 등록된 글이 없어요",
      writeButton: "글쓰기",
      typeFilterAll: "전체",
      totalCount: "총 {count}건",
      loadError: "게시글 목록을 불러오지 못했어요",
      pagination: {
        prev: "이전",
        next: "다음",
        pageStatus: "{page} / {totalPages} 페이지",
      },
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
      title: "게시글 상세",
      edited: "(수정됨)",
      deleted: common.post.deleted,
      deletedDescription: "작성자가 삭제했거나 더 이상 볼 수 없는 게시글이에요",
      lockedNotice: "투표가 시작되어 더 이상 수정할 수 없어요",
      shareToChat: "채팅에 공유",
      backToList: "게시판으로",
      deleteConfirmTitle: "게시글을 삭제할까요?",
      deleteConfirmDescription: "삭제하면 되돌릴 수 없어요.",
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
    detail: {
      title: "Meetup 상세",
    },
    attendance: {
      attend: "참석",
      absent: "불참",
      full: "마감되었습니다",
      recruiting: "모집 중",
    },
    cancelled: "취소된 모임입니다",
  },

  chat: {
    room: {
      title: "채팅방",
    },
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

  /**
   * Task 015A(FR-001·002·004) 회원가입·로그인·온보딩 화면. 셋 다 `displayName` 필드를
   * 다루므로 오류 문구 일부(필수 입력·글자 수 초과)는 신중히 각 도메인에 중복 선언했다 —
   * 화면마다 나중에 다른 어투로 다듬을 수 있어야 하고(§4 "같은 개체라도 도메인 맥락이
   * 다르면 공유하지 않는다"), 실제로 `handleTaken`처럼 신청 시점이 다른 문구는 이미
   * 갈라져 있다.
   */
  auth: {
    login: {
      title: "로그인",
      description: "다시 만나서 반가워요. 이메일과 비밀번호로 로그인하세요.",
      fields: {
        email: "이메일",
        password: "비밀번호",
      },
      submit: "로그인",
      submitPending: "로그인하는 중…",
      /** FR-002 E2·AC4(D-020). Mock 단계는 실제 15분 카운트다운 대신 고정 안내만 보여준다 —
       *  D-020 "v0.1(Mock)에서는 잠금 화면 상태만 만든다". */
      lockedNotice: "5회 연속 실패로 잠시 로그인이 제한돼요. 15분 뒤 다시 시도해 주세요.",
      /** FR-002 E1 — 이메일·비밀번호 중 어느 쪽이 틀렸는지 구분하지 않는 단일 메시지. */
      genericError: "이메일 또는 비밀번호를 확인해 주세요",
      noAccount: "아직 계정이 없으신가요?",
      goToSignup: "회원가입",
      /** Mock 단계 데모 계정 안내(Supabase Auth 도입 전, CON-06). 실 인증 연동 후 제거 대상. */
      demoHint: "체험용 계정: seo_runs@example.com / runrun25",
    },
    signup: {
      title: "회원가입",
      description: "크루를 만들고 모임을 확정하려면 먼저 계정이 필요해요.",
      fields: {
        email: "이메일",
        password: "비밀번호",
        passwordDescription: "8자 이상으로 입력해 주세요.",
        handle: "핸들",
        handleDescription:
          "다른 사람이 나를 검색할 때 쓰는 공개 아이디예요. 영문 소문자로 시작하고 소문자·숫자·밑줄만 3~20자로 써 주세요.",
        displayName: "표시 이름",
        terms: "이용약관과 개인정보 처리방침에 동의합니다",
      },
      handleStatus: {
        checking: "확인하는 중…",
        available: "사용할 수 있는 핸들이에요",
      },
      submit: "가입하기",
      submitPending: "가입하는 중…",
      alreadyHaveAccount: "이미 계정이 있으신가요?",
      goToLogin: "로그인",
      errors: {
        emailInvalid: "올바른 이메일 형식이 아니에요",
        /** FR-001 E1. D-005는 검색 API의 계정 존재 노출만 막았을 뿐, 가입 폼의 중복 안내는
         *  사용성을 위해 그대로 유지한다(requirements.md FR-001 E1 각주). */
        emailTaken: "이미 가입된 이메일입니다",
        passwordTooShort: "비밀번호는 8자 이상이어야 해요",
        /** `common.handle.invalidFormat`과 같은 개념(핸들 형식, `validateHandleFormat`)이라
         *  6일차 W-2로 공유 승격했다 — `common` 모듈 docstring 참고. */
        handleInvalidFormat: common.handle.invalidFormat,
        /** FR-001 E2 — 핸들 실시간 중복 검사 결과. `common.handle.taken`과 공유(W-2). */
        handleTaken: common.handle.taken,
        displayNameRequired: "표시 이름을 입력해 주세요",
        displayNameTooLong: "표시 이름은 30자 이하로 입력해 주세요",
        termsRequired: "계속하려면 약관에 동의해야 해요",
      },
    },
    onboarding: {
      title: "온보딩",
      welcome: "{displayName}님, 환영해요!",
      description: "마지막으로 프로필을 확인하고 시작해요.",
      fields: {
        handle: "내 핸들",
        handleLocked: "가입할 때 정한 핸들이에요. 변경은 계정 설정에서 할 수 있어요.",
        displayName: "표시 이름",
        searchOptOut: "핸들 검색 결과에 노출하지 않기",
        searchOptOutDescription:
          "켜면 다른 사람이 핸들로 나를 찾을 수 없어요. 이미 받은 초대는 그대로 유지돼요.",
      },
      submit: "시작하기",
      submitPending: "저장하는 중…",
      errors: {
        displayNameRequired: "표시 이름을 입력해 주세요",
        displayNameTooLong: "표시 이름은 30자 이하로 입력해 주세요",
        /** 세션 만료 등 — FR-002 E3. */
        sessionExpired: "로그인이 만료됐어요. 다시 로그인해 주세요.",
      },
    },
  },

  /**
   * Task 014 — 전역 오류·경계 화면(`error.tsx`·`not-found.tsx`·`RouteErrorBoundary`). 키는
   * `src/lib/data/contracts.ts`의 `DataErrorCode`(`not_found`·`conflict`·`validation_failed`·
   * `forbidden`) + 그 계약 밖의 `network`(세션 조회 실패, `auth-session.ts`)·`capacityFull`
   * (정원 마감, `meetup.types.ts`의 `AttendanceJoinResult.reason: "full"`)을 합친 어휘와
   * 1:1 대응한다 — 새 오류 분류 체계를 만들지 않고 기존 도메인 오류 타입을 그대로 옮겼다.
   */
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
    validationFailed: {
      title: "입력한 내용을 확인해 주세요",
      description: "형식에 맞지 않는 값이 있어요",
    },
    capacityFull: {
      title: "정원이 찼어요",
      description: "이미 인원이 다 찼어요",
    },
    /** 프로덕션에서는 원본 오류 메시지 대신 이 코드만 노출한다(NFR-014) — 서버 내부 정보를
     *  사용자에게 드러내지 않으면서도 문의 시 로그와 대조할 수 있게 한다. */
    digest: "오류 코드: {digest}",
  },
} as const;
