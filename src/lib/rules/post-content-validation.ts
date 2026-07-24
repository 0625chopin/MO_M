/**
 * 게시글 제목·본문 필수 입력 검증 — 순수 함수 (NFR-036, R-015, Task 018B).
 *
 * FR-030 E1 "제목·본문 누락 → 필드별 오류"의 판정. 일반글·모임 제안글 둘 다 공유한다
 * (유형과 무관하게 항상 필요한 필드). 글자 수 상한은 요구사항 문서에 값이 없어
 * `crew-name-validation.ts`(I-038)·`bio-validation.ts`(I-034)와 같은 이유로 임의로
 * 두지 않았다 — 필요해지면 그때 고객 확인 후 I-*로 등재한다.
 */
export type PostContentViolation = "title_required" | "body_required";

/** 앞뒤 공백만 있는 입력은 빈 값으로 취급한다. */
export function validatePostContent(title: string, body: string): PostContentViolation[] {
  const violations: PostContentViolation[] = [];
  if (title.trim().length === 0) violations.push("title_required");
  if (body.trim().length === 0) violations.push("body_required");
  return violations;
}
