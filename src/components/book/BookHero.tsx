import { Star } from 'lucide-react';

import { InstallButton } from '@/components/install/InstallButton';
import { LikeAction } from '@/components/post/LikeAction';
import { ButtonLink } from '@/components/ui/Button';
import { BookCover } from '@/components/ui/BookCover';
import { StickyNote } from '@/components/ui/Card';
import { iconStroke } from '@/components/ui/icon';
import { groupNumber } from '@/lib/format';
import type { BookDetail } from '@/lib/types';

function captionOf(detail: BookDetail): string {
  const { book } = detail;
  return [book.author ?? '저자 미상', book.publisher, book.totalPages ? `${book.totalPages}쪽` : null].filter(Boolean).join(' · ');
}

function RatingNote({ detail }: { detail: BookDetail }) {
  const rating = detail.overallRating?.average != null ? detail.overallRating : null;
  if (!rating) return null;
  return (
    <StickyNote rotate={0} className="inline-flex items-center gap-1 px-2 py-1">
      <Star size={12} aria-hidden fill="currentColor" {...iconStroke} />
      <span className="t-mono-numeral" aria-label={`리뷰 평균 별점 ${rating.average!.toFixed(1)}점, ${rating.count}명`}>
        {rating.average!.toFixed(1)} · {groupNumber(rating.count)}명
      </span>
    </StickyNote>
  );
}

/**
 * 도서 상세 히어로(휴대폰) — 기울어진 표지 스택(뒤장 한 장) 옆에 세리프 표제·저자 줄, 그 아래 좋아요 하트와 평점 스티키 메모.
 * 책의 평점·좋아요는 여기 한 곳에만 둔다(앱 2026-10-05 결정). 평점 메모는 기울이지 않는다.
 */
export function BookHero({ detail }: { detail: BookDetail }) {
  const { book } = detail;
  return (
    <section className="flex items-start gap-5 px-4 pt-4">
      <div className="relative shrink-0 pl-2 pt-2">
        <div className="absolute left-4 top-0 rounded-sm bg-book-page opacity-80" style={{ width: 112, height: 168, transform: 'rotate(2deg)' }} aria-hidden />
        <BookCover uri={book.coverUrl} title={book.title} width={112} tilt={-3} priority className="relative" />
      </div>
      <div className="min-w-0 flex-1 pt-2">
        <h1 className="t-display-serif break-keep text-text" style={{ fontSize: 26, lineHeight: '34px' }}>
          {book.title}
        </h1>
        <p className="t-caption mt-2 break-keep text-text-muted">{captionOf(detail)}</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <LikeAction count={detail.likeCount} reason="bookLike" className="-my-2" />
          <RatingNote detail={detail} />
        </div>
      </div>
    </section>
  );
}

/**
 * 도서 상세 왼쪽 판(넓은 화면) — 큰 표지 아래 표제·저자 줄·좋아요·평점, 그리고 이 화면의 주요 버튼 '앱에서 읽기 시작'과 구매 링크.
 * 스크롤해도 따라오게 sticky.
 */
export function BookSidePanel({ detail }: { detail: BookDetail }) {
  const { book } = detail;
  const purchase = detail.addonLink ?? detail.purchaseLink;
  return (
    <aside className="sticky top-24 flex flex-col gap-5">
      <div className="relative w-[220px] pl-3 pt-3">
        <div className="absolute left-6 top-0 h-[318px] w-[212px] rounded-sm bg-book-page opacity-80" style={{ transform: 'rotate(2deg)' }} aria-hidden />
        <BookCover uri={book.coverUrl} title={book.title} width={212} tilt={-3} priority className="relative" />
      </div>
      <div>
        <h1 className="break-keep text-[26px] font-bold leading-[34px] text-text">{book.title}</h1>
        <p className="t-caption mt-2 break-keep text-text-muted">{captionOf(detail)}</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <LikeAction count={detail.likeCount} reason="bookLike" className="-my-2" />
          <RatingNote detail={detail} />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <InstallButton reason="read" variant="primary">
          앱에서 읽기 시작
        </InstallButton>
        {purchase ? (
          <ButtonLink href={purchase} external variant="tonal">
            YES24에서 구매하기
          </ButtonLink>
        ) : null}
      </div>
    </aside>
  );
}
