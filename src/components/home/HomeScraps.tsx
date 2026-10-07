'use client';

import { Heart } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { Avatar } from '@/components/ui/Avatar';
import { BookCover } from '@/components/ui/BookCover';
import { MemoScrap } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import { iconStroke } from '@/components/ui/icon';
import { TextLink } from '@/components/ui/text';
import { formatRelative } from '@/lib/format';
import type { PlazaItem, Post } from '@/lib/types';

const ROTATE_MS = 6000;
const COVER_W = 72;
const ROW_H = Math.round(COVER_W * 1.5);

type Spot = { kind: 'post'; post: Post } | { kind: 'finish'; item: PlazaItem };

function spotKey(spot: Spot): string {
  return spot.kind === 'post' ? `p${spot.post.id}` : `f${spot.item.authorId}-${spot.item.bookId}-${spot.item.occurredAt}`;
}

/** 독후감과 완독 자랑을 한 장씩 번갈아 세운다 — 한쪽이 모자라면 남은 쪽이 이어서 선다. */
function interleave(posts: Post[], finishes: PlazaItem[]): Spot[] {
  const spots: Spot[] = [];
  for (let i = 0; i < Math.max(posts.length, finishes.length); i++) {
    if (i < posts.length) spots.push({ kind: 'post', post: posts[i] });
    if (i < finishes.length) spots.push({ kind: 'finish', item: finishes[i] });
  }
  return spots;
}

/**
 * 홈 '오늘의 글' — 광장의 핫한 독후감과 최근 완독 자랑을 번갈아 한 장씩 스포트라이트로 세우고 6초마다 돌린다.
 * 조각 머리에는 작성자(아바타·닉네임·책)를, 오른쪽엔 종류 태그와 좋아요(독후감) 또는 다 읽은 때(완독).
 * 행 높이는 표지와 같게 못 박아 돌아도 아래가 밀리지 않는다. 누를 자리는 행 하나(독후감 → 상세, 완독 → 책).
 */
export function HomeScraps({ posts, finishes }: { posts: Post[]; finishes: PlazaItem[] }) {
  const spotlight = useMemo(() => {
    const hot = [...posts].sort((a, b) => {
      const diff = b.likeCount - a.likeCount;
      if (diff !== 0) return diff;
      return (b.publishedAt ?? b.createdAt).localeCompare(a.publishedAt ?? a.createdAt);
    });
    return interleave(hot, finishes);
  }, [posts, finishes]);
  const count = spotlight.length;
  const [turn, setTurn] = useState(0);

  useEffect(() => {
    if (count < 2) return;
    const timer = setInterval(() => setTurn((t) => t + 1), ROTATE_MS);
    return () => clearInterval(timer);
  }, [count]);

  const spot = spotlight[count > 0 ? turn % count : 0];
  if (!spot) return null;

  const href = spot.kind === 'post' ? `/posts/${spot.post.id}` : `/books/${spot.item.bookId}`;
  const label =
    spot.kind === 'post'
      ? `${spot.post.authorNickname}의 독후감 ${spot.post.title} · 독후감 상세로`
      : `${spot.item.authorNickname}의 완독 ${spot.item.bookTitle} · 도서 상세로`;
  const cover =
    spot.kind === 'post'
      ? { uri: spot.post.bookCoverUrl, title: spot.post.bookTitle ?? spot.post.title }
      : { uri: spot.item.bookCoverUrl, title: spot.item.bookTitle };

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between px-4">
        <h2 className="text-[18px] font-bold leading-[26px] text-text">오늘의 글</h2>
        <TextLink href="/plaza" label="광장" ariaLabel="광장으로" />
      </div>
      <Link href={href} aria-label={label} className="pressable block px-4">
        <div key={spotKey(spot)} className="settle-in flex gap-3" style={{ height: ROW_H }}>
          <MemoScrap rotate={0} className="flex min-w-0 flex-1 flex-col overflow-hidden">
            {spot.kind === 'post' ? <PostSpot post={spot.post} /> : <FinishSpot item={spot.item} />}
          </MemoScrap>
          <div className="flex items-center" aria-hidden>
            <BookCover uri={cover.uri} title={cover.title} width={COVER_W} tilt={2} />
          </div>
        </div>
      </Link>
    </section>
  );
}

function ScrapAuthor({ nickname, avatarUrl, where, kind, right }: { nickname: string; avatarUrl?: string | null; where: string; kind: '독후감' | '완독'; right: React.ReactNode }) {
  return (
    <div className="mb-2 flex items-center gap-[10px]" style={{ height: 44 }}>
      <Avatar uri={avatarUrl} nickname={nickname} size={40} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2" style={{ height: 20 }}>
          <span className="t-body-strong min-w-0 flex-1 truncate leading-5 text-text">{nickname}</span>
          <Tag label={kind} />
        </div>
        <div className="mt-[10px] flex items-center gap-2" style={{ height: 14 }}>
          <span className="t-meta min-w-0 flex-1 truncate text-text-faint">{where}</span>
          {right}
        </div>
      </div>
    </div>
  );
}

function PostSpot({ post }: { post: Post }) {
  return (
    <>
      <ScrapAuthor
        nickname={post.authorNickname}
        avatarUrl={post.authorAvatarUrl}
        where={post.bookTitle ?? '책 없음'}
        kind="독후감"
        right={
          <span className="t-meta inline-flex items-center gap-1 text-text-muted" aria-label={`좋아요 ${post.likeCount}`}>
            <Heart size={12} aria-hidden {...iconStroke} />
            {post.likeCount}
          </span>
        }
      />
      <p className="truncate text-[15px] font-bold leading-[28px] text-text">{post.title}</p>
    </>
  );
}

function FinishSpot({ item }: { item: PlazaItem }) {
  return (
    <>
      <ScrapAuthor
        nickname={item.authorNickname}
        avatarUrl={item.authorAvatarUrl}
        where={item.bookTitle}
        kind="완독"
        right={<span className="t-meta text-text-muted">{formatRelative(item.occurredAt)}</span>}
      />
      {item.remark ? (
        <p className="truncate text-[15px] leading-[28px] text-text">“{item.remark}”</p>
      ) : (
        <p className="truncate text-[15px] leading-[28px] text-text-muted">마지막 장까지 다 읽었어요</p>
      )}
    </>
  );
}
