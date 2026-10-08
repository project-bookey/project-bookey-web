import Link from 'next/link';
import type { ReactNode } from 'react';

import { BookCover } from '@/components/ui/BookCover';
import { rowOffsetFor, tiltFor } from '@/lib/collage';

export type ShelfBook = {
  key: string;
  bookId: number;
  title: string;
  author?: string | null;
  coverUrl?: string | null;
  /** 인기 선반의 순위(1부터). */
  rank?: number;
};

const COVER_W = 96;
const MAX_OFFSET = 14;

/**
 * 표지 선반 — 홈 '요즘 많이 읽는 책'·'추천', 검색 빈 화면이 쓴다.
 * 휴대폰은 가로로 미는 선반, 넓은 화면은 한 줄에 4~6권 그리드(`grid`). staggered 면 표지를 지그재그로 흩는다 — 한 화면에 한 선반만.
 */
export function BookShelf({
  title,
  label,
  books,
  staggered = false,
  grid = true,
  action,
  emptyNote = '아직 준비 중이에요',
  className = '',
}: {
  title: string;
  label?: string;
  books: ShelfBook[];
  staggered?: boolean;
  /** 넓은 화면에서 그리드로 펼칠지 — 좁은 칸(사이드바) 안이면 끈다. */
  grid?: boolean;
  action?: ReactNode;
  emptyNote?: string;
  className?: string;
}) {
  const hasRank = books.some((book) => book.rank != null);
  const bleedTop = hasRank ? 16 : staggered ? 5 : 0;
  const listClass = grid
    ? 'shelf gap-3 px-4 md:grid md:grid-cols-4 md:gap-x-5 md:gap-y-6 md:overflow-visible lg:grid-cols-6'
    : 'shelf gap-3 px-4';
  return (
    <section className={`flex flex-col gap-2 md:gap-3 ${className}`}>
      <div className="flex items-baseline justify-between gap-3 px-4">
        <div className="flex min-w-0 items-baseline gap-2">
          <h2 className="text-[18px] font-bold leading-[26px] text-text md:text-[20px]">{title}</h2>
          {label ? <span className="t-mono-eyebrow text-text-muted">{label}</span> : null}
        </div>
        {action}
      </div>
      {books.length === 0 ? (
        <div className="flex flex-col gap-2 px-4">
          <div className="flex gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-sm border border-dashed border-line-strong" style={{ width: COVER_W, height: COVER_W * 1.5 }} />
            ))}
          </div>
          <p className="t-mono-label text-text-faint">{emptyNote}</p>
        </div>
      ) : (
        <ul className={listClass} style={{ paddingTop: bleedTop, paddingBottom: staggered ? MAX_OFFSET + 4 : 4 }}>
          {books.map((book, index) => {
            const offsetY = staggered ? rowOffsetFor(index) : 0;
            return (
              <li
                key={book.key}
                className="w-24 md:w-auto"
                style={{ transform: offsetY ? `translateY(${offsetY}px)` : undefined }}
              >
                <Link href={`/books/${book.bookId}`} className="pressable block" aria-label={book.author ? `${book.title}, ${book.author}` : book.title}>
                  <div className="relative">
                    <div className="md:hidden">
                      <BookCover uri={book.coverUrl} title={book.title} width={COVER_W} tilt={staggered ? tiltFor(index) : 0} />
                    </div>
                    <div className="hidden md:block">
                      <BookCover uri={book.coverUrl} title={book.title} width={160} fluid tilt={staggered ? tiltFor(index) / 2 : 0} />
                    </div>
                    {book.rank != null ? (
                      <span className="t-mono-numeral absolute -left-1 -top-2 flex h-[26px] w-[26px] items-center justify-center rounded-sm bg-ink text-on-ink">
                        {book.rank}
                      </span>
                    ) : null}
                  </div>
                  <p className="t-caption mt-2 truncate font-bold text-text md:text-[13px]" aria-hidden>
                    {book.title}
                  </p>
                  {book.author ? (
                    <p className="t-caption truncate text-text-faint" aria-hidden>
                      {book.author}
                    </p>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
