import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { InstallAction } from '@/components/install/InstallButton';
import { LikeAction } from '@/components/post/LikeAction';
import { PostBody } from '@/components/post/PostBody';
import { PostByline } from '@/components/post/PostByline';
import { BookCover } from '@/components/ui/BookCover';
import { MemoScrap } from '@/components/ui/Card';
import { isNotFound } from '@/lib/api';
import { postApi } from '@/lib/endpoints';
import { clip, parseId } from '@/lib/format';
import type { Post } from '@/lib/types';

type Props = { params: Promise<{ id: string }> };

async function loadPost(raw: string): Promise<Post> {
  const id = parseId(raw);
  if (id == null) notFound();
  try {
    return await postApi.get(id);
  } catch (error) {
    if (isNotFound(error)) notFound();
    throw error;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await loadPost((await params).id);
  const description = clip(post.excerpt) ?? `${post.authorNickname}님의 독후감`;
  const image = post.images[0]?.url ?? post.bookCoverUrl;
  return {
    title: post.title,
    description,
    alternates: { canonical: `/posts/${post.id}` },
    // 링크로만 보는 글은 검색에 올리지 않는다.
    robots: post.visibility === 'LINK' ? { index: false, follow: false } : undefined,
    openGraph: {
      type: 'article',
      title: post.title,
      description,
      publishedTime: post.publishedAt ?? post.createdAt,
      authors: [post.authorNickname],
      images: image ? [{ url: image }] : undefined,
    },
  };
}

/**
 * 독후감 상세 — 표제 → 작성자 줄 → 책 메모 → 본문 → 발치(좋아요 · 엽서 보내기) → '이 책을 읽었나요?' 메모.
 * 좋아요·엽서·이 책으로 쓰기는 모두 앱 설치 안내로 이어진다.
 */
export default async function PostPage({ params }: Props) {
  const post = await loadPost((await params).id);
  return (
    <article className="content-narrow flex flex-col gap-5 pt-4 md:pt-8">
      <h1 className="t-display-serif break-keep text-text" style={{ fontSize: 26, lineHeight: '34px' }}>
        {post.title}
      </h1>
      <PostByline post={post} />

      {post.bookId != null ? (
        <Link href={`/books/${post.bookId}`} className="pressable flex items-center gap-3 rounded-md border border-line bg-surface p-3" aria-label={`${post.bookTitle} 책 정보`}>
          <BookCover uri={post.bookCoverUrl} title={post.bookTitle} width={40} tilt={-3} />
          <span className="min-w-0 flex-1">
            <span className="t-mono-eyebrow block text-text-faint">이 글의 책</span>
            <span className="t-body-strong clamp-2 text-text">{post.bookTitle}</span>
          </span>
          <span className="t-label shrink-0 text-text-muted">책 보기 ›</span>
        </Link>
      ) : null}

      {post.clubId != null && post.clubName ? <p className="t-mono-label text-text-muted">클럽 · {post.clubName}</p> : null}

      <PostBody post={post} />

      <div className="flex items-center justify-between gap-3 border-t border-line pt-3">
        <LikeAction count={post.likeCount} className="-my-2" />
        <InstallAction reason="postcard" ariaLabel={`${post.authorNickname}에게 엽서 보내기 — 앱에서`}>
          엽서 보내기
        </InstallAction>
      </div>

      {post.bookId != null ? (
        <MemoScrap rotate={0} className="flex items-center gap-3">
          <BookCover uri={post.bookCoverUrl} title={post.bookTitle} width={40} tilt={-3} />
          <div className="min-w-0 flex-1">
            <p className="t-body-strong text-text">이 책을 읽었나요?</p>
            <p className="t-caption text-text-muted">내 생각도 독후감으로 남겨 보세요</p>
          </div>
          <InstallAction reason="compose" ariaLabel="앱에서 이 책으로 독후감 쓰기">
            이 책으로 쓰기
          </InstallAction>
        </MemoScrap>
      ) : null}
    </article>
  );
}
