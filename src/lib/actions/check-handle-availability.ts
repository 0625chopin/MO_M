"use server";

import { getProfileByHandle } from "@/lib/data";
import { validateHandleFormat, type HandleFormatCheckResult } from "@/lib/rules/handle-validation";

/**
 * FR-001 AC2 — 핸들 실시간 중복 검사. `SignupForm`이 핸들 입력란 blur마다 이 함수를 직접
 * 호출한다(폼 제출이 아니라 일반 함수 호출로 쓰는 Server Action — Next.js는 `'use server'`
 * 함수를 폼 action 밖에서도 클라이언트 컴포넌트가 그냥 호출할 수 있게 한다).
 *
 * **가입/핸들 변경 시 "유일성 중복 검사" 전용이다 — FR-006 핸들 검색에는 쓰지 않는다.**
 * `getProfileByHandle`은 `searchOptOut`과 무관하게 존재 여부를 그대로 반환한다(유일성은
 * 옵트아웃과 무관해야 하므로 여기서는 맞는 동작이다). 하지만 FR-006 핸들 검색은 옵트아웃
 * 사용자를 "존재하지 않는 핸들"과 구분 불가능하게 응답해야 한다(3.6절, D-005, R-012) — 이
 * 함수를 검색에 재사용하면 옵트아웃 사용자의 핸들 존재 여부가 새어 나간다. FR-006 검색은
 * `lib/data`의 `searchProfilesByHandle` 기반 별도 조회를 쓴다.
 *
 * `excludeProfileId`를 주면 "본인의 현재 핸들"은 중복으로 치지 않는다(핸들 변경 화면에서
 * 저장 버튼을 누르지 않고 다시 blur만 해도 자기 핸들이 "이미 사용 중"으로 뜨는 오탐을
 * 막는다 — FR-004 AC1의 30일 쿨다운 판정은 `lib/rules/handle-validation.ts`의
 * `canChangeHandle`이 별도로 맡는다). 회원가입 경로(이 화면)는 항상 `excludeProfileId`를
 * 생략한다 — 아직 프로필이 없다.
 *
 * 형식이 틀리면 서버 조회 자체를 하지 않는다 — `available: null`로 "판단 보류"를 표현한다
 * (`false`를 쓰면 "중복"과 "형식 오류"가 같은 신호가 되어 `SignupForm`이 둘을 구분해
 * 다른 문구를 보여줄 수 없다).
 */
export interface HandleAvailability {
  format: HandleFormatCheckResult;
  available: boolean | null;
}

export async function checkHandleAvailabilityAction(
  handle: string,
  excludeProfileId?: string,
): Promise<HandleAvailability> {
  const format = validateHandleFormat(handle);
  if (!format.valid) {
    return { format, available: null };
  }

  const existing = await getProfileByHandle(handle);
  const available = existing === null || existing.id === excludeProfileId;
  return { format, available };
}
