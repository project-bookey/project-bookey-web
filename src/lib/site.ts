/** 사이트 상수 — 메타데이터·사이트맵·바닥글이 함께 쓴다. */
export const SITE_NAME = 'Bookey';
export const SITE_URL = (process.env.SITE_URL ?? 'https://www.bookey.site').replace(/\/$/, '');
export const SITE_DESCRIPTION =
  '독서 기록과 독후감이 모이는 곳, Bookey. 책을 찾아보고 독자들의 리뷰와 독후감을 읽어 보세요.';

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
