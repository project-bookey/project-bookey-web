'use client';

import { useSyncExternalStore } from 'react';

const noop = () => () => {};

/**
 * 브라우저에서만 아는 값(User-Agent·저장소)을 서버 렌더와 어긋나지 않게 읽는다 —
 * 서버와 첫 렌더에서는 fallback, 수화가 끝나면 브라우저 값. 효과 안에서 setState 를 부르지 않아도 된다.
 */
export function useClientValue<T>(read: () => T, fallback: T): T {
  return useSyncExternalStore(noop, read, () => fallback);
}

/** 미디어 쿼리 — 바뀌면 다시 그린다. 서버에서는 false. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
