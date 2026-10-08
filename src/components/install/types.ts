/** 앱 설치 안내에 쓰는 값 — 서버(src/lib/install.ts)가 환경 변수에서 읽어 클라이언트 부품에 내려준다. */
export type InstallConfig = {
  appStoreUrl: string | null;
  playStoreUrl: string | null;
  appStoreId: string | null;
  supportEmail: string;
};

/** 어떤 동작 자리에서 안내를 열었는지 — 시트 문구가 이걸로 갈린다(installCopy). */
export type InstallReason =
  | 'generic'
  | 'compose'
  | 'like'
  | 'bookLike'
  | 'read'
  | 'library'
  | 'review'
  | 'follow'
  | 'postcard'
  | 'club';
