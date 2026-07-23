/**
 * 결정론적 PRNG(mulberry32 변형) — Task 010 시드 생성 전용.
 *
 * `Math.random()`은 실행마다 다른 값을 내 스크린샷 비교·회귀 검증을 불가능하게
 * 만들므로 쓰지 않는다(팀장 지시). 같은 시드 정수를 넣으면 항상 같은 실수 시퀀스가
 * 나온다 — 이 파일과 이 파일을 소비하는 모든 `seed/*.ts`가 유일한 무작위성 출처다.
 */

export type Rng = () => number;

/** [0, 1) 실수를 결정론적으로 낸다. `seed`가 같으면 시퀀스도 항상 같다. */
export function createRng(seed: number): Rng {
  let state = seed >>> 0;
  return function mulberry32() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** [minInclusive, maxInclusive] 정수. */
export function randomInt(rng: Rng, minInclusive: number, maxInclusive: number): number {
  return minInclusive + Math.floor(rng() * (maxInclusive - minInclusive + 1));
}

export function pick<T>(rng: Rng, items: readonly T[]): T {
  return items[randomInt(rng, 0, items.length - 1)];
}

/** 원본을 바꾸지 않고 최대 `n`개를 중복 없이 뽑는다(뽑을 원소가 모자라면 전부 반환). */
export function pickN<T>(rng: Rng, items: readonly T[], n: number): T[] {
  const pool = [...items];
  const result: T[] = [];
  const count = Math.min(n, pool.length);
  for (let i = 0; i < count; i++) {
    const idx = randomInt(rng, 0, pool.length - 1);
    result.push(pool[idx]);
    pool.splice(idx, 1);
  }
  return result;
}

export function shuffle<T>(rng: Rng, items: readonly T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomInt(rng, 0, i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function chance(rng: Rng, probability: number): boolean {
  return rng() < probability;
}
