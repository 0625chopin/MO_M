import type { ISODateTimeString } from "@/lib/types";

/**
 * 핸들 형식 검증 — 순수 함수 (NFR-036, R-015). Task 015A(CORE)가 만들었고 CREW의
 * Task 015B(FR-006 핸들 검색 등 핸들 관련 화면)가 그대로 재사용한다 — 시그니처를 바꾸면
 * 두 화면이 동시에 깨진다. **단, `validateHandleFormat`은 형식 검증 전용이다** — FR-006
 * 핸들 검색 자체(옵트아웃 사용자를 걸러내야 하는 조회)에는 이 파일이 아니라
 * `lib/data`의 `searchProfilesByHandle` 기반 조회를 쓴다. 이 파일과 짝을 이루는
 * 중복 검사 액션(`lib/actions/check-handle-availability.ts`)이 가입/핸들 변경 전용이고
 * FR-006 검색에 재사용하면 안 되는 이유는 그 파일 docstring 참고.
 *
 * **D-005가 정한 것과 정하지 않은 것**: D-005·3.6절은 핸들의 **검색 시맨틱**(로그인 이메일과
 * 분리, 정확 일치만, 전 회원 허용, 옵트아웃 기본 노출)을 확정했을 뿐 핸들 **형식**(길이·허용
 * 문자)은 규정하지 않는다. 이 모듈은 그 빈 칸을 실용적 기본값으로 채운다 — 기존 시드 핸들
 * (`seo_runs`·`yuna_book`·`minjun`, `fixtures.ts`)이 전부 "소문자 시작 + 소문자·숫자·밑줄"
 * 패턴이라 그 관례를 규칙화했다. **잠정값이다** — 요구사항에 형식 규칙이 없다는 사실과
 * 확정이 필요한 시점(Task 028 스키마)을 `docs/ISSUES.md`의 **I-033**에 등재했다.
 *
 * **형식 검증(이 파일)과 중복 검사는 책임이 다르다.** 이 함수는 DB를 조회하지 않는다(zone 1
 * 규칙 — `@/lib/data` import 시 ESLint 에러). 중복 여부는 호출자가 `lib/data`의
 * `getProfileByHandle`(또는 그를 감싼 Server Action)로 별도 확인한다. FR-001 AC2가 요구하는
 * "포커스 이탈 후 400ms 이내 중복 경고"는 ① 이 함수로 형식을 먼저 걸러 통과한 값만 ②
 * 서버 왕복(중복 검사)으로 넘기는 2단계 파이프라인으로 만족한다 — 형식이 애초에 틀린 값은
 * 서버에 물어볼 필요가 없다.
 */

export const HANDLE_MIN_LENGTH = 3;
export const HANDLE_MAX_LENGTH = 20;
/** 소문자 시작 + 소문자·숫자·밑줄. 이메일과 시각적으로 구분되고 URL-safe 하도록 하는 통상적
 *  handle 관례를 따랐다(잠정값, 모듈 docstring 참고). */
export const HANDLE_PATTERN = /^[a-z][a-z0-9_]*$/;

/** FR-004 AC1 — 핸들 변경은 30일에 1회만 허용된다. */
export const HANDLE_CHANGE_COOLDOWN_DAYS = 30;

export type HandleFormatViolation = "too_short" | "too_long" | "invalid_format";

export interface HandleFormatCheckResult {
  valid: boolean;
  /** 위반 항목 전부 — FR-001 E3 "위반 항목을 개별 표시"와 같은 요구를 핸들에도 적용했다.
   *  하나의 값이 여러 위반(예: 너무 짧으면서 대문자 포함)을 동시에 낼 수 있다. */
  violations: HandleFormatViolation[];
}

/**
 * 핸들 형식만 검증한다(중복 여부는 판단하지 않음). 빈 문자열은 `too_short`로 분류된다 —
 * 별도의 "필수 입력" 위반 코드를 두지 않고 최소 길이 위반으로 흡수했다(핸들 0자는 항상
 * 최소 길이 미달이므로 코드가 늘어도 새 정보가 없다).
 */
export function validateHandleFormat(handle: string): HandleFormatCheckResult {
  const violations: HandleFormatViolation[] = [];

  if (handle.length < HANDLE_MIN_LENGTH) {
    violations.push("too_short");
  }
  if (handle.length > HANDLE_MAX_LENGTH) {
    violations.push("too_long");
  }
  // 길이 위반과 형식 위반은 독립적으로 보고한다 — 너무 길면서 대문자를 쓴 값은 두 위반을
  // 동시에 안내받아야 한 번에 고칠 수 있다. 다만 빈 문자열은 패턴 검사 자체가 무의미하므로
  // (이미 too_short가 보고됨) 제외한다.
  if (handle.length > 0 && !HANDLE_PATTERN.test(handle)) {
    violations.push("invalid_format");
  }

  return { valid: violations.length === 0, violations };
}

export interface HandleChangeEligibility {
  allowed: boolean;
  /** allowed===false일 때 다음 변경 가능 시각. allowed===true면 null. */
  nextAllowedAt: ISODateTimeString | null;
}

/**
 * FR-004 AC1 — 마지막 핸들 변경 이후 30일이 지났는지 판정한다. `lastChangedAt`이 null이면
 * (아직 한 번도 변경한 적 없음, 또는 가입 시 최초 설정) 항상 허용한다 — 최초 설정은 "변경"이
 * 아니다. 현재 시각은 인자로 받는다(순수 함수, `Date.now()` 직접 호출 금지 — zone 1 규칙에
 * `next`는 없지만 "입력만으로 결정된다"는 순수성 원칙은 이 레이어 전역에 적용된다).
 */
export function canChangeHandle(
  lastChangedAt: ISODateTimeString | null,
  now: ISODateTimeString,
): HandleChangeEligibility {
  if (lastChangedAt === null) {
    return { allowed: true, nextAllowedAt: null };
  }

  const nextAllowed = new Date(lastChangedAt);
  nextAllowed.setUTCDate(nextAllowed.getUTCDate() + HANDLE_CHANGE_COOLDOWN_DAYS);
  const nextAllowedAt = nextAllowed.toISOString();
  const allowed = Date.parse(now) >= nextAllowed.getTime();

  return { allowed, nextAllowedAt: allowed ? null : nextAllowedAt };
}
