import { Eye } from 'lucide-react';
import Link from 'next/link';

import { Avatar } from '@/components/ui/Avatar';
import { BookCover } from '@/components/ui/BookCover';
import { IconMeta } from '@/components/ui/text';
import { formatRelative } from '@/lib/format';
import type { Post } from '@/lib/types';

import { LikeAction } from './LikeAction';

/** 포스터 사진 높이(px) — 카드 머리를 채우고 그 위에 표제까지 얹는다. */
const POSTER_H = 208;

/**
 * 독후감 카드 — 광장 피드·프로필·도서 상세의 독후감 탭이 같은 카드를 쓴다(앱 PostCard 와 같은 짜임).
 *
 * 머리는 '포스터'다 — 첫 사진이 카드 머리를 통째로 채우고, 아래로 깔린 그라데이션 위에 책 이름과 표제를 얹는다.
 * 사진이 없는 글은 표지를 세운 짧은 머리판으로 갈아 끼운다. 그 아래는 발췌 두 줄과 발치 한 줄(작성자 · 올린 때 … 조회 · 좋아요).
 * 머리·발췌가 상세로 가는 링크이고 발치는 그 형제다 — 버튼 안에 버튼이 들어가지 않게.
 */
export function PostCard({ post }: { post: Post }) {
  const when = formatRelative(post.publishedAt ?? post.createdAt);
  return (
    <article className="overflow-hidden rounded-lg border border-line bg-surface">
      <Link href={`/posts/${post.id}`} className="pressable block" aria-label={`${post.title} — 독후감 상세`}>
        <PosterHead post={post} />
        {post.excerpt.length > 0 ? <p className="clamp-2 px-4 pt-3 text-[15px] leading-[23px] text-text-muted">{post.excerpt}</p> : null}
      </Link>

      <div className="mt-3 flex items-center gap-3 border-t border-line px-4 py-1.5">
        <Link
          href={`/users/${post.authorId}`}
          className="pressable -my-1.5 flex min-h-11 min-w-0 flex-1 items-center gap-2"
          aria-label={`${post.authorNickname} 프로필 열기`}
        >
          <Avatar uri={post.authorAvatarUrl} nickname={post.authorNickname} size={28} />
          <span className="t-label truncate text-text">{post.authorNickname}</span>
          <span className="t-meta shrink-0 text-text-faint">{when}</span>
        </Link>
        <IconMeta icon={Eye} size={22} color="muted" label={`조회 ${post.viewCount}`}>
          <span className="t-mono-numeral">{post.viewCount}</span>
        </IconMeta>
        <LikeAction count={post.likeCount} className="-my-1.5" />
      </div>
    </article>
  );
}

/** 카드 머리 — 사진이 있으면 포스터, 없으면 표지를 세운 짧은 판. */
function PosterHead({ post }: { post: Post }) {
  const photo = post.images[0];
  const extraPhotos = post.images.length - 1;
  const bookLabel = post.bookTitle ?? '책 없음';

  if (!photo) {
    return (
      <div className="flex items-center gap-3 border-b border-line-strong bg-surface-raised p-4">
        {post.bookId != null ? <BookCover uri={post.bookCoverUrl} title={post.bookTitle} width={56} tilt={-3} /> : null}
        <div className="min-w-0 flex-1">
          <p className="t-mono-label truncate text-text-faint">{bookLabel}</p>
          <h3 className="clamp-2 mt-1 text-[23px] font-bold leading-[31px] text-text">{post.title}</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col justify-end bg-surface-deep" style={{ height: POSTER_H }}>
      <img
        src={photo.url}
        alt="독후감 사진"
        width={photo.width ?? undefined}
        height={photo.height ?? undefined}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="scrim-up absolute inset-x-0 bottom-0" style={{ height: POSTER_H * 0.7 }} aria-hidden />
      {extraPhotos > 0 ? (
        <span className="t-mono-label absolute left-2 top-2 rounded-sm bg-scrim-dim px-2 py-[2px] text-on-photo">+{extraPhotos}</span>
      ) : null}
      {post.bookId != null ? (
        <div className="absolute right-3 top-3">
          <BookCover uri={post.bookCoverUrl} title={post.bookTitle} width={46} tilt={4} />
        </div>
      ) : null}
      <div className="relative p-4">
        <p className="t-mono-label truncate text-on-photo-muted">{bookLabel}</p>
        <h3 className="clamp-2 mt-1 text-[23px] font-bold leading-[31px] text-on-photo">{post.title}</h3>
      </div>
    </div>
  );
}
