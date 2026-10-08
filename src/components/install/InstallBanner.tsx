'use client';

import { X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { iconSize, iconStroke } from '@/components/ui/icon';

import { useInstall } from './InstallProvider';
import { isMobileUa } from './storeOs';
import { useClientValue } from './useClientValue';

const DISMISS_KEY = 'bookey.web.installBannerDismissedAt';
const DISMISS_DAYS = 7;

/** 휴대폰 브라우저이고, 7일 안에 닫은 적이 없으면 보인다. 서버·첫 렌더에서는 숨긴다. */
function readEligible(): boolean {
  if (!isMobileUa(navigator.userAgent, navigator.maxTouchPoints)) return false;
  try {
    const dismissedAt = Number(window.localStorage.getItem(DISMISS_KEY) ?? 0);
    if (dismissedAt && Date.now() - dismissedAt < DISMISS_DAYS * 86_400_000) return false;
  } catch {
    // 저장소를 못 쓰면 그냥 보여 준다.
  }
  return true;
}

/**
 * 휴대폰 화면 아래의 얇은 설치 띠 — 문서 끝에 sticky 로 붙어 바닥글에 닿으면 제자리로 돌아간다(가리는 것이 없다).
 * 데스크톱 브라우저에는 두지 않고, 제 주요 버튼이 있는 화면(도서 상세·설치 안내)에서도 뺀다. ×로 닫으면 7일 동안 다시 안 보인다.
 */
export function InstallBanner() {
  const { open } = useInstall();
  const pathname = usePathname();
  const eligible = useClientValue(readEligible, false);
  const [dismissed, setDismissed] = useState(false);

  const hasOwnCta = pathname.startsWith('/books/') || pathname === '/app';
  if (!eligible || dismissed || hasOwnCta) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // 저장 못 해도 이번 방문에서는 닫힌다.
    }
  };

  return (
    <div className="sticky bottom-0 z-20 border-t border-line bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="content flex items-center gap-3 py-2">
        <picture className="shrink-0">
          <source srcSet="/brand/mark-on-dark.png" media="(prefers-color-scheme: dark)" />
          <img src="/brand/mark-on-light.png" alt="" width={36} height={36} className="rounded-sm" />
        </picture>
        <div className="min-w-0 flex-1">
          <p className="t-label truncate text-text">독서 기록은 Bookey 앱에서</p>
          <p className="t-caption truncate text-text-muted">서재 · 타이머 · 독후감 · 클럽</p>
        </div>
        <Button variant="tonal" size="sm" onClick={() => open('generic')}>
          받기
        </Button>
        <button type="button" onClick={dismiss} aria-label="설치 안내 닫기" className="pressable -mr-2 inline-flex h-11 w-11 items-center justify-center text-text-muted">
          <X size={iconSize.inline} aria-hidden {...iconStroke} />
        </button>
      </div>
    </div>
  );
}
