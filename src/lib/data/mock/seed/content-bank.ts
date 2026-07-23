/**
 * 시드 데이터의 콘텐츠 값(이름·크루명·게시글 본문 등) — Task 010.
 *
 * **`src/lib/strings/` 대상이 아니다.** `lib/strings`는 *UI가 사용자에게 보여주는
 * 고정 문구*(버튼 라벨·안내 문구 등, D-011·NFR-023)를 다루는 모듈이고, 여기 있는
 * 값들은 그 자체가 **데이터**(어떤 사용자가 어떤 크루명으로 무엇을 썼는지)다 —
 * Mock이 아니라 실데이터였어도 DB 행에 들어갈 값이지 코드에 박힌 UI 문구가 아니다.
 * 그래서 문자열 모듈로 옮기지 않는다.
 */

export const SURNAMES = [
  "김", "이", "박", "최", "정", "강", "조", "윤", "장", "임",
  "한", "오", "서", "신", "권", "황", "안", "송", "전", "홍",
] as const;

export const GIVEN_NAMES = [
  "민준", "서연", "지훈", "유나", "하은", "도윤", "수아", "예준", "지민", "윤서",
  "시우", "하윤", "은우", "지우", "서준", "다은", "준서", "채원", "건우", "소율",
  "우진", "나윤", "현우", "아린", "준혁", "다인", "성민", "예은", "태윤", "소연",
  "민재", "유진", "승우", "하린", "재원", "수빈", "도현", "지안", "현서", "강민",
] as const;

/** 핸들 접두어 — 관심사·취미 테마 영단어. 뒤에 3자리 순번을 붙여 유일성을 보장한다. */
export const HANDLE_THEMES = [
  "run", "hike", "bike", "swim", "yoga", "climb", "camp", "book", "coffee",
  "music", "guitar", "piano", "photo", "paint", "cook", "travel", "movie",
  "game", "board", "cat", "dog", "plant", "code", "dance", "box", "golf",
  "tennis", "ski", "surf", "garden",
] as const;

export const BIO_TEMPLATES = [
  "주말엔 주로 밖에서 시간을 보내요.",
  "새로운 사람 만나는 거 좋아합니다.",
  "맛집 탐방이 취미예요.",
  "책 읽고 기록 남기는 걸 좋아해요.",
  "운동은 꾸준히, 무리하지 않게.",
  "사진 찍는 걸 좋아합니다.",
  "여행 다니면서 사람 만나는 게 낙이에요.",
  "조용히 취미 생활하는 편이에요.",
  "반려동물과 산책하는 시간이 제일 좋아요.",
  "새벽형 인간입니다.",
  "커피 없이는 못 살아요.",
  "주말 계획 세우는 게 취미입니다.",
  "음악 듣는 걸 좋아해요.",
  "글쓰기 연습 중입니다.",
  "꾸준함이 무기입니다.",
] as const;

/** 강퇴 사유(FR-027) 예시 문구 — 데이터 값이지 UI 토스트 문구가 아니다. */
export const REMOVED_REASONS = [
  "장기간 무단 불참이 반복됐습니다.",
  "크루 활동 규칙을 지키지 않았습니다.",
  "연락이 닿지 않아 부득이하게 정리했습니다.",
] as const;

/**
 * 신규 크루 13개(기존 fixtures.ts의 crew-1·crew-2에 이어붙인다). `roster`는 그 크루가
 * 가질 활성 멤버 수(오너 포함) — R-017 실증을 위해 일부러 5명 미만(D-031 데모)부터
 * 55명(큰 크루)까지 폭을 크게 뒀다.
 */
export interface NewCrewSpec {
  name: string;
  description: string;
  category: string;
  visibility: "public" | "private";
  roster: number;
}

export const NEW_CREWS: readonly NewCrewSpec[] = [
  { name: "새벽 수영 크루", description: "평일 아침 6시, 수영장에서 만나요.", category: "운동", visibility: "public", roster: 2 },
  { name: "홈카페 취향 공유", description: "직접 내린 커피와 홈카페 도구를 공유합니다.", category: "취미", visibility: "private", roster: 4 },
  { name: "전국 등산 대장정", description: "매달 한 곳씩 전국의 산을 함께 오릅니다.", category: "운동", visibility: "public", roster: 40 },
  { name: "보드게임 번개모임", description: "평일 저녁 번개로 모여 보드게임 합니다.", category: "취미", visibility: "public", roster: 8 },
  { name: "퇴근 후 러닝 크루", description: "평일 저녁 가볍게 5km씩 뛰어요.", category: "운동", visibility: "public", roster: 15 },
  { name: "IT 커리어 스터디", description: "이직·커리어 고민을 함께 나누는 스터디입니다.", category: "스터디", visibility: "private", roster: 55 },
  { name: "동네 캠핑 모임", description: "근교로 당일치기·1박 캠핑을 다닙니다.", category: "취미", visibility: "public", roster: 6 },
  { name: "사진 산책 클럽", description: "카메라 들고 동네를 걸으며 사진 찍어요.", category: "취미", visibility: "public", roster: 22 },
  { name: "주말 자전거 라이딩", description: "주말 아침 한강·근교 자전거 라이딩.", category: "운동", visibility: "public", roster: 30 },
  { name: "독서 토론 모임", description: "매달 책 한 권을 정해 함께 읽고 토론합니다.", category: "문화", visibility: "private", roster: 12 },
  { name: "홈트 챌린지", description: "집에서 하는 홈트레이닝 기록을 함께 나눠요.", category: "운동", visibility: "public", roster: 18 },
  { name: "요가 명상 크루", description: "평일 저녁 요가와 명상으로 하루를 정리합니다.", category: "운동", visibility: "private", roster: 25 },
  { name: "고양이 집사 모임", description: "고양이 집사들의 정보 공유·모임입니다.", category: "반려동물", visibility: "public", roster: 18 },
];

interface PostTemplate {
  title: string;
  body: string;
}

export const GENERAL_POST_TEMPLATES: readonly PostTemplate[] = [
  { title: "이번 주 공지", body: "이번 주 활동 관련 공지입니다. 확인 부탁드려요." },
  { title: "새로 오신 분들 환영합니다", body: "크루에 새로 들어오신 분들, 편하게 인사 남겨주세요!" },
  { title: "지난 모임 후기", body: "지난 모임 사진과 후기 공유합니다. 다들 고생하셨어요." },
  { title: "규칙 안내드립니다", body: "크루 운영 규칙을 다시 한번 안내드립니다. 서로 배려해주세요." },
  { title: "준비물 관련 질문있어요", body: "다음 모임 준비물이 뭔지 아시는 분 계신가요?" },
  { title: "사진 공유합니다", body: "지난번에 찍은 사진들 공유드려요." },
  { title: "다들 잘 지내시나요", body: "요즘 다들 어떻게 지내시는지 근황 나눠요." },
  { title: "장비 추천 부탁드려요", body: "입문자인데 장비 추천 좀 부탁드립니다." },
  { title: "정기모임 시간 조정 관련", body: "정기모임 시간을 조정하면 어떨지 의견 구합니다." },
  { title: "감사 인사드려요", body: "지난 모임 준비해주신 분들 감사합니다!" },
  { title: "코스 공유합니다", body: "이번에 다녀온 코스 정보 공유드려요." },
  { title: "다음 모임 장소 후보", body: "다음 모임 장소 후보 몇 곳 추려봤어요." },
  { title: "가입 인사드립니다", body: "안녕하세요, 이번에 가입하게 됐습니다. 잘 부탁드려요!" },
  { title: "운영진 모집합니다", body: "크루 운영을 도와주실 분을 찾고 있어요." },
  { title: "날씨가 좋네요", body: "요즘 날씨가 딱 활동하기 좋은 것 같아요." },
];

export const MEETUP_PROPOSAL_TEMPLATES: readonly PostTemplate[] = [
  { title: "이번 주 모임 어때요?", body: "이번 주에 다 같이 모이는 거 어떨까요? 시간 되시는 분들 투표 부탁드려요." },
  { title: "다음 정기모임 제안", body: "다음 정기모임 일정을 제안합니다. 참석 가능하신 분은 투표해주세요." },
  { title: "번개모임 제안합니다", body: "갑자기 시간이 맞아서 번개로 모이면 어떨까 제안합니다." },
  { title: "월간 모임 일정 제안", body: "이번 달 모임 날짜를 정해보려고 합니다. 다들 투표 부탁드려요." },
  { title: "장소 변경해서 모임 제안", body: "이번엔 장소를 바꿔서 모여보면 어떨까요? 투표로 정해요." },
  { title: "신규 코스로 모임 제안", body: "새로운 코스로 한 번 모여보는 거 제안합니다." },
];

export const CHAT_TEXT_TEMPLATES = [
  "다들 준비물 챙기셨나요?",
  "이번 주 모임 기대되네요!",
  "오늘 날씨 정말 좋아요 ㅎㅎ",
  "저 이번엔 참석 어려울 것 같아요 ㅠㅠ",
  "사진 잘 나왔네요!",
  "다음 모임은 언제쯤일까요?",
  "고생하셨습니다~",
  "저도 참여하고 싶어요!",
  "장소 공유 감사합니다.",
  "재밌었어요 다음에 또 해요!",
  "혹시 시간 좀 늦어도 될까요?",
  "저는 조금 일찍 도착할 것 같아요.",
  "다들 좋은 하루 보내세요!",
  "이번 코스 난이도 어떤가요?",
  "궁금한 점 있으면 편하게 물어보세요.",
] as const;
