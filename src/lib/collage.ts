/**
 * 콜라주 책상 모션 토큰 — 앱(src/theme/tokens.ts)과 같은 값.
 * 표지 기울기는 인덱스 순환, 가로 선반은 지그재그 세로 오프셋.
 */
export const tilt = [-4, -2, 3, -3, 5, -2, 6, 2] as const;

/** tilt 를 인덱스로 순환 조회한다(음수 인덱스도 안전). */
export function tiltFor(i: number): number {
  return tilt[((i % tilt.length) + tilt.length) % tilt.length];
}

/** 가로 행(선반) 지그재그 세로 오프셋(px) — 인덱스 순환. */
export const rowOffsetY = [0, 10, 4, 14, 6, 12] as const;

export function rowOffsetFor(i: number): number {
  return rowOffsetY[((i % rowOffsetY.length) + rowOffsetY.length) % rowOffsetY.length];
}
