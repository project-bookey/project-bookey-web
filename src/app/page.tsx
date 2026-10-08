import type { Metadata } from 'next';

import { loadHomeData } from '@/components/home/HomeData';
import { HomeMagazine } from '@/components/home/HomeMagazine';
import { SITE_DESCRIPTION } from '@/lib/site';

export const metadata: Metadata = {
  description: SITE_DESCRIPTION,
  alternates: { canonical: '/' },
};

/** 홈 — 잡지형(2026-10-07 사용자 결정, 서점형·앱 홈 그대로 넓힌 안과 비교해 고름). */
export default async function HomePage() {
  const data = await loadHomeData();
  return <HomeMagazine data={data} />;
}
