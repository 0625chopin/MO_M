import type { ChatMessage, ChatRoom, Id, Post } from "@/lib/types";

import { CHAT_TEXT_TEMPLATES } from "./content-bank";
import { chance, pick, randomInt, type Rng } from "./prng";
import { addDays, addHours, SEED_NOW } from "./time";

/**
 * 메시지 2,000개(기존 2개 포함) 목표 중 신규분을 만든다. 방(크루) 크기에 비례해
 * 채팅량을 가중치로 나눈다 — 300명 규모 크루가 2명 크루와 같은 발화량일 수는 없다.
 * `post_link` 타입은 **같은 크루 게시글로 제한**(요구사항 5.2절)되므로, 그 크루에
 * 게시글이 하나도 없으면 항상 `text`로 대체한다.
 */
export function generateChatMessages(
  rng: Rng,
  generateId: (prefix: string) => Id,
  chatRooms: readonly ChatRoom[],
  rosterByCrewId: Map<Id, Id[]>,
  postsByCrewId: Map<Id, Post[]>,
  count: number,
  clientKeyStartSeq: number,
): ChatMessage[] {
  const messages: ChatMessage[] = [];

  const weightedRooms: ChatRoom[] = [];
  for (const room of chatRooms) {
    const size = rosterByCrewId.get(room.crewId)?.length ?? 1;
    const weight = Math.max(1, Math.round(size / 2));
    for (let i = 0; i < weight; i++) weightedRooms.push(room);
  }

  for (let i = 0; i < count; i++) {
    const room = pick(rng, weightedRooms);
    const roster = rosterByCrewId.get(room.crewId) ?? [];
    if (roster.length === 0) continue;
    const senderId = pick(rng, roster);
    const crewPosts = postsByCrewId.get(room.crewId) ?? [];
    const usePostLink = crewPosts.length > 0 && chance(rng, 0.1);
    const createdAt = addHours(addDays(SEED_NOW, -randomInt(rng, 0, 120)), -randomInt(rng, 0, 23));

    const seq = clientKeyStartSeq + i;
    messages.push(
      usePostLink
        ? {
            id: generateId("message"),
            roomId: room.id,
            senderId,
            type: "post_link",
            body: null,
            refPostId: pick(rng, crewPosts).id,
            clientKey: `seed-message-${seq}`,
            createdAt,
            deletedAt: null,
          }
        : {
            id: generateId("message"),
            roomId: room.id,
            senderId,
            type: "text",
            body: pick(rng, CHAT_TEXT_TEMPLATES),
            refPostId: null,
            clientKey: `seed-message-${seq}`,
            createdAt,
            deletedAt: null,
          },
    );
  }

  return messages;
}
