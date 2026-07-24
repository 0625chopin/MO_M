"use server";

import { refresh } from "next/cache";

import { getAuthSession } from "@/components/shell/get-auth-session";
import { getCrewMembership, getPostById, updatePost } from "@/lib/data";
import { type DataResult, err } from "@/lib/data/contracts";
import { deriveUserRoleForPermissionCheck } from "@/lib/rules/crew-membership-transition";
import { checkPermission } from "@/lib/rules/permission";
import type { Id, Post } from "@/lib/types";

export interface UpdatePostActionInput {
  crewId: Id;
  postId: Id;
  title: string;
  body: string;
}

/**
 * 게시글 수정(FR-032 AC1) Server Action. 제목·본문만 받는다 — `meetupDate`는 애초에 이 입력에
 * 없으므로 `lib/rules/post-edit-lock.ts`의 잠금 규칙이 데이터 계층 진입 이전에 이미 지켜진다
 * (편집 화면이 그 규칙을 보고 `meetupDate` 입력 자체를 만들지 않는다 — `PostActions.tsx` 참고).
 *
 * Server Function은 UI를 거치지 않고 직접 POST될 수 있으므로(Next.js 공식 문서 경고) 권한은
 * 여기서 **다시** 판정한다 — 화면의 버튼 노출 여부와 무관하게 이 판정이 최종이다(NFR-036,
 * `lib/rules/permission.ts`의 `post:update_own`을 그대로 호출만 한다).
 */
export async function updatePostAction(
  input: UpdatePostActionInput,
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
  const permission = checkPermission({
    role,
    action: "post:update_own",
    context: { isSelf: post.authorId === session.profileId },
  });
  if (!permission.allowed) {
    return err("forbidden", "이 게시글을 수정할 권한이 없다.");
  }

  const result = await updatePost(input.postId, { title: input.title, body: input.body });
  if (result.ok) {
    refresh();
  }
  return result;
}
