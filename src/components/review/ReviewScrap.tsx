import { Star } from 'lucide-react';
import Link from 'next/link';

import { MemoScrap } from '@/components/ui/Card';
import { Tag } from '@/components/ui/Tag';
import { IconMeta } from '@/components/ui/text';
import type { Review } from '@/lib/types';

/**
 * 리뷰 조각 — 도서 상세에 붙인 짧은 메모. 통째로 눌러 리뷰 상세로 간다. 두 줄까지만 보인다.
 * 작성자가 이 책을 완독했으면 이름 옆에 '완독'. 기울이지 않는다(앱 사용자 결정). 별점은 조각 맨 아래 오른쪽.
 */
export function ReviewScrap({ review }: { review: Review }) {
  return (
    <Link href={`/reviews/${review.id}`} className="pressable block" aria-label={`${review.authorNickname}의 리뷰 상세`}>
      <MemoScrap rotate={0}>
        <div className="flex items-center gap-2">
          <span className="t-label min-w-0 truncate text-text">{review.authorNickname}</span>
          {review.authorFinished ? <Tag label="완독" /> : null}
        </div>
        <p className="clamp-2 mt-2 text-[14px] leading-[23px] text-text-muted">{review.body}</p>
        {review.rating ? (
          <div className="mt-2 flex justify-end">
            <IconMeta icon={Star} filled size={13} color="accent" label={`별점 ${review.rating}점`}>
              <span className="t-mono-numeral">{review.rating}</span>
            </IconMeta>
          </div>
        ) : null}
      </MemoScrap>
    </Link>
  );
}
