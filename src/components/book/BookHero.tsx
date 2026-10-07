import { Star } from 'lucide-react';

import { LikeAction } from '@/components/post/LikeAction';
import { BookCover } from '@/components/ui/BookCover';
import { StickyNote } from '@/components/ui/Card';
import { iconStroke } from '@/components/ui/icon';
import { groupNumber } from '@/lib/format';
import type { BookDetail } from '@/lib/types';

/**
 * 도서 상세 히어로 — 기울어진 표지 스택(뒤장 한 장) 옆에 세리프 표제·저자 줄, 그 아래 좋아요 하트와 평점 스티키 메모.
 * 책의 평점·좋아요는 여기 한 곳에만 둔다(앱 2026-10-05 결정). 평점 메모는 기울이지 않는다.
 */
export function BookHero({ detail }: { detail: BookDetail }) {
  const { book } = detail;
  const rating = detail.overallRating?.average != null ? detail.overallRating : null;
  const caption = [book.author ?? '저자 미상', book.publisher, book.totalPages ? `${book.totalPages}쪽` : null].filter(Boolean).join(' · ');
  return (
    <section className="flex items-start gap-5 px-4 pt-4">
      <div className="relative shrink-0 pl-2 pt-2">
        {/* 뒤장 — 본 표지보다 5도 더 기울고 살짝 어긋난 겹침. */}
        <div className="absolute left-4 top-0 rounded-sm bg-book-page opacity-80" style={{ width: 112, height: 168, transform: 'rotate(2deg)' }} aria-hidden />
        <BookCover uri={book.coverUrl} title={book.title} width={112} tilt={-3} priority className="relative" />
      </div>
      <div className="min-w-0 flex-1 pt-2">
        <h1 className="t-display-serif break-keep text-text" style={{ fontSize: 26, lineHeight: '34px' }}>
          {book.title}
        </h1>
        <p className="t-caption mt-2 break-keep text-text-muted">{caption}</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <LikeAction count={detail.likeCount} reason="bookLike" className="-my-2" />
          {rating ? (
            <StickyNote rotate={0} className="inline-flex items-center gap-1 px-2 py-1">
              <Star size={12} aria-hidden fill="currentColor" {...iconStroke} />
              <span className="t-mono-numeral" aria-label={`리뷰 평균 별점 ${rating.average!.toFixed(1)}점, ${rating.count}명`}>
                {rating.average!.toFixed(1)} · {groupNumber(rating.count)}명
              </span>
            </StickyNote>
          ) : null}
        </div>
      </div>
    </section>
  );
}
