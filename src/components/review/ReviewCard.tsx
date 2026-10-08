import { Star } from 'lucide-react';

import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import { IconMeta, TextLink } from '@/components/ui/text';
import { formatRelative } from '@/lib/format';
import type { Review } from '@/lib/types';

/**
 * 리뷰 카드 — 리뷰 상세 위에 서는 카드. 본문을 자르지 않고 전문을 편다.
 * 발치 왼쪽엔 '책 보기', 오른쪽엔 별점(앱 사용자 결정 2026-10-05).
 */
export function ReviewCard({ review, bookTitle }: { review: Review; bookTitle?: string }) {
  const where = bookTitle ?? '책';
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Avatar nickname={review.authorNickname} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="t-body-strong min-w-0 truncate leading-5 text-text">{review.authorNickname}</span>
            {review.authorFinished ? <Tag label="완독" /> : null}
          </div>
          <p className="t-meta mt-[2px] truncate text-text-faint">
            {where} · {formatRelative(review.createdAt)}
          </p>
        </div>
      </div>

      <p className="whitespace-pre-wrap break-keep text-[15px] leading-[26px] text-text">{review.body}</p>

      {review.tags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {review.tags.map((tag) => (
            <Tag key={tag} label={tag} />
          ))}
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-4">
        <TextLink href={`/books/${review.bookId}`} label="책 보기" ariaLabel={`${where} 상세`} />
        {review.rating ? (
          <IconMeta icon={Star} filled size={13} color="accent" label={`별점 ${review.rating}점`}>
            <span className="t-mono-numeral">{review.rating}</span>
          </IconMeta>
        ) : null}
      </div>
    </Card>
  );
}
