'use client';

import { useEffect, useState } from 'react';

import { useMediaQuery } from '@/components/install/useClientValue';
import { MemoScrap } from '@/components/ui/Card';
import { SectionHeader } from '@/components/ui/text';
import { formatRelative } from '@/lib/format';
import type { Remark } from '@/lib/types';

const ROTATE_MS = 5000;
const KIND_LABEL: Record<Remark['kind'], string> = { FINISHED: '완독', ABANDONED: '하차' };

/**
 * 독자들의 한 줄평 — 이 책을 다 읽었거나 내려놓으며 남긴 한 줄을 최신순으로 한 장씩 돌린다(5초, 누르면 바로 다음 장).
 * 길이가 제각각이라 모든 장을 같은 칸에 겹쳐 두고 보이는 것만 켠다 — 메모 높이가 가장 긴 장으로 고정돼 아래가 들썩이지 않는다.
 * 움직임을 줄이는 설정이면 돌리지 않는다.
 */
export function RemarkTicker({ remarks }: { remarks: Remark[] }) {
  const count = remarks.length;
  const [turn, setTurn] = useState(0);
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');

  useEffect(() => {
    if (count < 2 || reduced) return;
    const timer = setTimeout(() => setTurn((t) => t + 1), ROTATE_MS);
    return () => clearTimeout(timer);
  }, [count, reduced, turn]);

  if (count === 0) return null;
  const index = turn % count;
  const current = remarks[index];

  return (
    <section>
      <SectionHeader
        title="독자들의 한 줄평"
        action={count > 1 ? <span className="t-mono-numeral text-text-faint">{index + 1} / {count}</span> : undefined}
      />
      <button
        type="button"
        onClick={count > 1 ? () => setTurn((t) => t + 1) : undefined}
        disabled={count < 2}
        className="pressable block w-full text-left"
        aria-label={`${current.authorNickname} · ${KIND_LABEL[current.kind]} · ${current.body}${count > 1 ? ' — 누르면 다음 한 줄평으로 넘어가요' : ''}`}
      >
        <MemoScrap rotate={-1}>
          <div className="grid">
            {remarks.map((remark, i) => (
              <div
                key={remark.id}
                aria-hidden={i !== index}
                className={`col-start-1 row-start-1 flex flex-col justify-between gap-2 ${i === index ? 'settle-in' : 'invisible'}`}
              >
                <p className="text-[16px] leading-[26px] text-text">“{remark.body}”</p>
                <p className="flex items-center gap-1 text-text-muted">
                  <span className="t-label truncate">{remark.authorNickname}</span>
                  <span className="t-caption shrink-0 text-text-faint">
                    · {KIND_LABEL[remark.kind]} · {formatRelative(remark.writtenAt)}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </MemoScrap>
      </button>
    </section>
  );
}
