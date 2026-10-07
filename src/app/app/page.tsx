import type { Metadata } from 'next';

import { ButtonLink } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { getInstallConfig } from '@/lib/install';

export const metadata: Metadata = {
  title: '앱 설치',
  description: 'Bookey 앱에서 책을 서재에 담고, 독서 시간을 재고, 독후감을 쓰고, 클럽에서 함께 읽어요.',
  alternates: { canonical: '/app' },
};

/** 앱 설치 안내 페이지 — 자바스크립트 없이도 닿는 자리. 스토어 링크가 없으면 '곧 출시'. */
export default function AppPage() {
  const { appStoreUrl, playStoreUrl } = getInstallConfig();
  const stores = [
    ['App Store에서 받기', appStoreUrl],
    ['Google Play에서 받기', playStoreUrl],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]));

  return (
    <div className="content flex flex-col gap-6 pt-8">
      <picture>
        <source srcSet="/brand/mark-on-dark.png" media="(prefers-color-scheme: dark)" />
        <img src="/brand/mark-on-light.png" alt="" width={72} height={72} className="rounded-md" />
      </picture>
      <div>
        <h1 className="t-display-serif break-keep text-text">독서 기록은 Bookey 앱에서</h1>
        <p className="t-body mt-3 break-keep text-text-muted">웹에서는 책과 독후감을 둘러볼 수 있어요. 나머지는 앱에서 만나요.</p>
      </div>
      <ul className="flex flex-col gap-3">
        {[
          ['서재', '읽고 싶은 책을 담아 두고 진도를 기록해요.'],
          ['타이머', '읽는 시간을 재고 다 읽으면 완독 카드가 남아요.'],
          ['독후감·리뷰', '사진과 책 속 문장을 곁들여 쓰고, 하트와 엽서로 마음을 주고받아요.'],
          ['클럽', '함께 읽을 사람들과 모임을 잡고 모임 노트를 써요.'],
        ].map(([name, body]) => (
          <li key={name} className="flex gap-3 rounded-md border border-line bg-surface p-3">
            <span className="t-label w-16 shrink-0 text-text">{name}</span>
            <span className="t-body break-keep text-text-muted">{body}</span>
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-2">
        {stores.length > 0 ? (
          stores.map(([label, href], index) => (
            <ButtonLink key={label} href={href} external variant={index === 0 ? 'primary' : 'tonal'}>
              {label}
            </ButtonLink>
          ))
        ) : (
          <div className="flex flex-col items-start gap-2 rounded-md border border-dashed border-line-strong p-4">
            <Tag label="곧 출시" />
            <p className="t-body text-text-muted">앱은 곧 출시돼요. 조금만 기다려 주세요.</p>
          </div>
        )}
        <ButtonLink href="/" variant="ghost">
          홈으로
        </ButtonLink>
      </div>
    </div>
  );
}
