import type { AuthSession } from "@/components/shell/auth-session";
import { getAuthSession } from "@/components/shell/get-auth-session";
import { getCrewMembership } from "@/lib/data";
import { deriveUserRoleForPermissionCheck } from "@/lib/rules/crew-membership-transition";
import type { Id, UserRole } from "@/lib/types";

export interface BoardViewer {
  session: AuthSession;
  role: UserRole;
}

/**
 * 게시판 목록·상세 컨테이너가 공유하는 "현재 접속자 → 권한 판정용 역할" 조회.
 * `lib/rules/permission.ts`가 요구하는 `UserRole`을 만들어 주기만 하고, 실제 허용 여부 판정은
 * 호출부가 `checkPermission`으로 한다(NFR-036 — 판정 로직 자체는 여기 두지 않는다).
 *
 * 로그인하지 않았으면(guest) 크루 멤버십을 조회할 이유가 없으므로 곧장 `"guest"`로 반환한다 —
 * `deriveUserRoleForPermissionCheck`는 "로그인 여부"를 모르고 "멤버십 활성 여부"만 판단하므로
 * (그 함수의 docstring 참고) 이 구분은 호출자인 여기서 한다.
 */
export async function resolveBoardViewer(crewId: Id): Promise<BoardViewer> {
  const session = await getAuthSession();
  if (session.status !== "authenticated") {
    return { session, role: "guest" };
  }
  const membership = await getCrewMembership(crewId, session.profileId);
  return { session, role: deriveUserRoleForPermissionCheck(membership) };
}
