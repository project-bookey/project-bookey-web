import 'server-only';

import type { InstallConfig } from '@/components/install/types';

function nonEmpty(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/**
 * 앱 설치 안내에 쓰는 값 — 런타임 환경 변수에서 읽는다(빌드에 박지 않는다).
 * 스토어 링크가 생기면 .env 에 값만 넣고 컨테이너를 다시 띄우면 된다.
 */
export function getInstallConfig(): InstallConfig {
  return {
    appStoreUrl: nonEmpty(process.env.APP_STORE_URL),
    playStoreUrl: nonEmpty(process.env.PLAY_STORE_URL),
    appStoreId: nonEmpty(process.env.APP_STORE_ID),
    supportEmail: nonEmpty(process.env.SUPPORT_EMAIL) ?? 'support@bookey.site',
  };
}
