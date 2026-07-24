"use server";

import { refresh } from "next/cache";

import { getAuthSession } from "@/components/shell/get-auth-session";
import { deletePost, getCrewMembership, getPostById } from "@/lib/data";
import { type DataResult, err } from "@/lib/data/contracts";
import { deriveUserRoleForPermissionCheck } from "@/lib/rules/crew-membership-transition";
import { checkPermission } from "@/lib/rules/permission";
import type { Id, Post } from "@/lib/types";

export interface DeletePostActionInput {
  crewId: Id;
  postId: Id;
}

/**
 * 게시글 삭제(FR-032 AC1·AC3) Server Action. 작성자 본인(`post:delete_own`) 또는 임원·오너·
 * 관리자의 타인 글 삭제(`post:delete_any`) 둘 중 하나만 통과하면 허용한다 — 두 판정 모두
 * `lib/rules/permission.ts`를 그대로 호출만 하고 이 파일에서 조건을 다시 짜지 않는다(NFR-036).
 *
 * 감사 로그(AC3 "삭제되고 감사 로그에 기록된다")는 Task 038(운영 기반)이 붙일 자리다 — 이
 * 회차의 소프트 삭제(`deletePost`)는 `deletedAt`만 채우고 별도 로그를 남기지 않는다.
 */
export async function deletePostAction(
  input: DeletePostActionInput,
): Promise<DataResult<Post>> {
  const session = await getAuthSession();
  if (session.status !== "authenticated") {
    return err("forbidden", "로그인 후 이용할 수 있다.");
  }

  const post = await getPostById(input.postId);
  if (!post) {
    return err("not_found", `게시글 ${input.postId} 를 찾을 수 없다.`);
  }

  const membership = await getCrewMembership(input.crewId, session.profileId);
  const role = deriveUserRoleForPermissionCheck(membership);
  const isSelf = post.authorId === session.profileId;
  const canDeleteOwn = checkPermission({ role, action: "post:delete_own", context: { isSelf } });
  const canDeleteAny = checkPermission({ role, action: "post:delete_any" });
  if (!canDeleteOwn.allowed && !canDeleteAny.allowed) {
    return err("forbidden", "이 게시글을 삭제할 권한이 없다.");
  }

  const result = await deletePost(input.postId);
  if (result.ok) {
    refresh();
  }
  return result;
}
