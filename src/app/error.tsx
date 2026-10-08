'use client';

import { useEffect } from 'react';

import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/text';

/** 화면을 그리다 실패했을 때 — 원인은 서버 로그에, 방문자에겐 다시 시도. */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="content-narrow pt-10">
      <EmptyState
        title="불러오지 못했어요"
        description="잠시 후 다시 시도해 주세요."
        action={
          <Button variant="tonal" onClick={reset}>
            다시 시도
          </Button>
        }
      />
    </div>
  );
}
