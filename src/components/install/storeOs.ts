export type StoreOs = 'ios' | 'android' | 'other';

/** 브라우저의 User-Agent 로 어느 스토어를 보여 줄지 가른다. iPadOS 는 데스크톱 UA 를 쓰므로 터치 지점으로 알아본다. */
export function detectStoreOs(userAgent: string, maxTouchPoints = 0): StoreOs {
  if (/iPhone|iPad|iPod/i.test(userAgent)) return 'ios';
  if (/Macintosh/i.test(userAgent) && maxTouchPoints > 1) return 'ios';
  if (/Android/i.test(userAgent)) return 'android';
  return 'other';
}

/** 휴대폰·태블릿 브라우저인지 — 하단 설치 띠는 여기서만 보인다. */
export function isMobileUa(userAgent: string, maxTouchPoints = 0): boolean {
  return detectStoreOs(userAgent, maxTouchPoints) !== 'other';
}
