'use client';

import { Heart } from 'lucide-react';

import { useInstall } from '@/components/install/InstallProvider';
import { iconStroke } from '@/components/ui/icon';

/**
 * 좋아요 — 하트 + 숫자. 앱과 같은 모양이지만 웹에서는 누르면 설치 안내가 열린다(좋아요는 앱에서).
 * 책 하트는 reason="bookLike".
 */
export function LikeAction({ count, reason = 'like', className = '' }: { count: number; reason?: 'like' | 'bookLike'; className?: string }) {
  const { open } = useInstall();
  return (
    <button
      type="button"
      onClick={() => open(reason)}
      aria-label={`좋아요 ${count} — 앱에서 누를 수 있어요`}
      className={`pressable inline-flex min-h-11 min-w-11 items-center gap-1.5 text-text-muted ${className}`}
    >
      <Heart size={22} aria-hidden {...iconStroke} />
      <span className="t-mono-numeral">{count}</span>
    </button>
  );
}
