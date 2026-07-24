/**
 * 한 줄 소개(bio) 형식 검증 — 순수 함수 (NFR-036, R-015, Task 015B). FR-004가 다루는 필드 중
 * 유일하게 `display-name-validation.ts`·`handle-validation.ts` 어디에도 자리가 없어 별도
 * 모듈로 뺐다. 요구사항 문서는 이 필드의 글자 수 상한을 명시하지 않는다 — 아래 상수는
 * `displayName`(30자)보다 넉넉하게 잡은 실용적 잠정값이다. **잠정값이며 고객 확인이 필요하다
 * — `docs/ISSUES.md`의 I-034에 등재했다**(`handle-validation.ts`의 `HANDLE_PATTERN`·I-033과
 * 같은 성격의 문제).
 */

export const BIO_MAX_LENGTH = 150;

export type BioViolation = "too_long";

export interface BioCheckResult {
  valid: boolean;
  violations: BioViolation[];
}

/** 소개는 선택 입력이라 최소 길이 제약이 없다 — 빈 문자열도 유효하다. */
export function validateBio(bio: string): BioCheckResult {
  const trimmed = bio.trim();
  const violations: BioViolation[] = [];
  if (trimmed.length > BIO_MAX_LENGTH) {
    violations.push("too_long");
  }
  return { valid: violations.length === 0, violations };
}
