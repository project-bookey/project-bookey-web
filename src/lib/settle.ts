/**
 * 실패해도 화면을 죽이지 않는 조회 — 홈처럼 여러 묶음을 한 번에 받는 화면에서 한 묶음이 못 와도 나머지는 그린다.
 * 실패는 서버 로그에만 남긴다.
 */
export async function settle<T>(promise: Promise<T>, label = 'fetch'): Promise<T | null> {
  try {
    return await promise;
  } catch (error) {
    console.error(`[bookey-web] ${label} 실패:`, error instanceof Error ? error.message : error);
    return null;
  }
}
