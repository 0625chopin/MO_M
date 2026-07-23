import { ko } from "./ko";

/**
 * 문자열 모듈 공개 API. 사용법은 `README.md` §5 참고.
 *
 *   import { strings, t } from "@/lib/strings";
 *
 *   strings.board.list.title              // 파라미터 없는 문구 — 중첩 객체 직접 접근
 *   t((s) => s.vote.summary.quorum, { quorum: 4 })   // 파라미터가 있는 문구
 *
 * `t()`가 점(.) 구분 문자열 경로("vote.summary.quorum") 대신 셀렉터 함수를 받는 이유:
 * 문자열 경로는 오타가 나도 컴파일 타임에 잡히지 않고, 키 이름을 바꿔도 자동으로 갱신되지 않는다.
 * 셀렉터 함수는 `Strings` 타입을 그대로 타고 흐르므로 오타·리네임 누락이 타입 에러로 즉시 드러난다.
 */

/** v0.1은 한국어 단독이다(D-011). 새 로케일은 이 유니온에 추가한다. */
export type Locale = "ko";

/** 모든 로케일 딕셔너리가 구조적으로 따라야 하는 타입. `ko`가 단일 소스다. */
export type Strings = typeof ko;

const DEFAULT_LOCALE: Locale = "ko";

/**
 * 로케일 → 딕셔너리 레지스트리.
 * 번역을 추가할 때: `import { en } from "./en"` 후 이 객체에 `en: en`을 등록한다.
 * `en`이 `Strings`(= `typeof ko`) 타입을 만족하지 않으면(키 누락·오타) 여기서 타입 에러가 난다 —
 * 번역 누락을 컴파일 타임에 잡아내는 안전장치다.
 */
const dictionaries: Record<Locale, Strings> = {
  ko,
};

/**
 * 로케일에 해당하는 문자열 딕셔너리를 반환한다.
 * v0.1은 로케일 선택 UI·요청 헤더 분기가 없으므로(D-011, NFR-024 범위 밖) 인자를 생략하면
 * 기본 로케일을 반환한다. 로케일 선택 기능이 생기면 이 함수의 인자만 채우면 되고
 * 호출부(컴포넌트) 코드는 바꾸지 않는다.
 */
export function getStrings(locale: Locale = DEFAULT_LOCALE): Strings {
  return dictionaries[locale];
}

/** 현재(기본) 로케일의 문자열 딕셔너리. 파라미터가 없는 문구는 이 객체를 직접 접근한다. */
export const strings: Strings = getStrings();

/**
 * `{paramName}` 자리표시자를 값으로 치환한다. `t()` 내부에서 쓰이며 직접 호출할 일은 드물다.
 * 매칭되지 않는 자리표시자는 그대로 남겨 둔다(치환 누락을 화면에서 바로 알아챌 수 있게).
 */
function interpolate(
  template: string,
  params: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (matched, key: string) =>
    key in params ? String(params[key]) : matched,
  );
}

/** 파라미터 없는 문구를 셀렉터로 조회한다. */
export function t(selector: (s: Strings) => string): string;
/** `{paramName}` 자리표시자가 있는 문구를 셀렉터로 조회하고 값으로 치환한다. */
export function t(
  selector: (s: Strings) => string,
  params: Record<string, string | number>,
): string;
export function t(
  selector: (s: Strings) => string,
  params?: Record<string, string | number>,
): string {
  const template = selector(strings);
  return params ? interpolate(template, params) : template;
}
