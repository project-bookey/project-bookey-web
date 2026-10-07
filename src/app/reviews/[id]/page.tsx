import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ReviewCard } from '@/components/review/ReviewCard';
import { BookCover } from '@/components/ui/BookCover';
import { isNotFound } from '@/lib/api';
import { bookApi, reviewApi } from '@/lib/endpoints';
import { clip, parseId } from '@/lib/format';
import { settle } from '@/lib/settle';
import type { Review } from '@/lib/types';

type Props = { params: Promise<{ id: string }> };

async function loadReview(raw: string): Promise<Review> {
  const id = parseId(raw);
  if (id == null) notFound();
  try {
    return await reviewApi.get(id);
  } catch (error) {
    if (isNotFound(error)) notFound();
    throw error;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const review = await loadReview((await params).id);
  const detail = await settle(bookApi.detail(review.bookId), 'book');
  const title = detail ? `${detail.book.title} 리뷰` : '리뷰';
  return {
    title,
    description: clip(review.body) ?? `${review.authorNickname}님의 리뷰`,
    alternates: { canonical: `/reviews/${review.id}` },
    openGraph: { type: 'article', title, description: clip(review.body), images: detail?.book.coverUrl ? [{ url: detail.book.coverUrl }] : undefined },
  };
}

/** 리뷰 상세 — 리뷰 카드와 그 책으로 가는 메모. 고치기·삭제는 글쓴이 몫이라 웹엔 없다. */
export default async function ReviewPage({ params }: Props) {
  const review = await loadReview((await params).id);
  const detail = await settle(bookApi.detail(review.bookId), 'book');
  return (
    <div className="content flex flex-col gap-5 pt-4">
      <ReviewCard review={review} bookTitle={detail?.book.title} />
      {detail ? (
        <Link href={`/books/${detail.book.id}`} className="pressable flex items-center gap-3 rounded-md border border-line bg-surface p-3" aria-label={`${detail.book.title} 책 정보`}>
          <BookCover uri={detail.book.coverUrl} title={detail.book.title} width={40} tilt={-3} />
          <span className="min-w-0 flex-1">
            <span className="t-body-strong clamp-2 text-text">{detail.book.title}</span>
            {detail.book.author ? <span className="t-caption block truncate text-text-muted">{detail.book.author}</span> : null}
          </span>
          <span className="t-label shrink-0 text-text-muted">책 보기 ›</span>
        </Link>
      ) : null}
    </div>
  );
}
