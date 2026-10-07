import type { PlazaItem, Post } from '@/lib/types';

/** 스포트라이트 한 장 — 독후감이거나 완독 자랑이다. */
export type Spot = { kind: 'post'; post: Post } | { kind: 'finish'; item: PlazaItem };

/** 신원 — 완독 자랑에는 id 가 없어 사람·책·시각 조합으로 가른다. */
export function spotKey(spot: Spot): string {
  return spot.kind === 'post' ? `p${spot.post.id}` : `f${spot.item.authorId}-${spot.item.bookId}-${spot.item.occurredAt}`;
}

/** 독후감은 핫한 순(좋아요 내림차순, 동률이면 최신순), 완독 자랑은 서버가 준 최신순 — 한 장씩 번갈아 세운다. */
export function interleaveSpots(posts: Post[], finishes: PlazaItem[]): Spot[] {
  const hot = [...posts].sort((a, b) => {
    const diff = b.likeCount - a.likeCount;
    if (diff !== 0) return diff;
    return (b.publishedAt ?? b.createdAt).localeCompare(a.publishedAt ?? a.createdAt);
  });
  const spots: Spot[] = [];
  for (let i = 0; i < Math.max(hot.length, finishes.length); i++) {
    if (i < hot.length) spots.push({ kind: 'post', post: hot[i] });
    if (i < finishes.length) spots.push({ kind: 'finish', item: finishes[i] });
  }
  return spots;
}

export function spotHref(spot: Spot): string {
  return spot.kind === 'post' ? `/posts/${spot.post.id}` : `/books/${spot.item.bookId}`;
}

export function spotLabel(spot: Spot): string {
  return spot.kind === 'post'
    ? `${spot.post.authorNickname}의 독후감 ${spot.post.title} · 독후감 상세로`
    : `${spot.item.authorNickname}의 완독 ${spot.item.bookTitle} · 도서 상세로`;
}
