import Link from 'next/link';

import { ButtonLink } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { getInstallConfig } from '@/lib/install';

import { InstallButton } from './InstallButton';

/**
 * 앱 설치 안내 카드(서버 부품) — 홈 사이드바·바닥 띠에 선다. 스토어 링크가 있으면 그 버튼, 없으면 '곧 출시'와 설치 안내 페이지 링크.
 * band 는 전폭 띠(가로로 길게), card 는 사이드바 상자.
 */
export function AppInstallCard({ variant = 'card' }: { variant?: 'card' | 'band' }) {
  const { appStoreUrl, playStoreUrl } = getInstallConfig();
  const stores = [
    ['App Store에서 받기', appStoreUrl],
    ['Google Play에서 받기', playStoreUrl],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]));
  const band = variant === 'band';

  return (
    <section
      className={`rounded-lg border border-line bg-surface ${band ? 'flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between md:p-8' : 'flex flex-col gap-4 p-5'}`}
      aria-label="앱 설치 안내"
    >
      <div className={`flex gap-4 ${band ? 'items-center' : 'items-start'}`}>
        <picture className="shrink-0">
          <source srcSet="/brand/mark-on-dark.png" media="(prefers-color-scheme: dark)" />
          <img src="/brand/mark-on-light.png" alt="" width={band ? 56 : 44} height={band ? 56 : 44} className="rounded-sm" />
        </picture>
        <div className="min-w-0">
          <p className={`${band ? 't-title-serif' : 'text-[17px] font-bold leading-6'} break-keep text-text`}>독서 기록은 Bookey 앱에서</p>
          <p className="t-body mt-1 break-keep text-text-muted">서재에 담고, 타이머로 재고, 독후감을 써요. 클럽에서 함께 읽어요.</p>
        </div>
      </div>
      <div className={`flex flex-col gap-2 ${band ? 'md:w-64 md:shrink-0' : ''}`}>
        {stores.length > 0 ? (
          stores.map(([label, href], index) => (
            <ButtonLink key={label} href={href} external variant={index === 0 ? 'primary' : 'tonal'}>
              {label}
            </ButtonLink>
          ))
        ) : (
          <>
            <div className="flex items-center gap-2">
              <Tag label="곧 출시" />
              <span className="t-caption text-text-muted">앱은 곧 출시돼요</span>
            </div>
            <InstallButton reason="generic">앱 설치 안내 보기</InstallButton>
          </>
        )}
        <Link href="/app" className="pressable t-label inline-flex min-h-10 items-center text-text-muted">
          앱에서 할 수 있는 일 ›
        </Link>
      </div>
    </section>
  );
}
