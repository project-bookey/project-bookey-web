/**
 * 선 아이콘 공통 획 — 끝(cap)과 모서리(join)를 각지게(앱 iconStroke 와 같다). lucide-react 에 그대로 펼친다.
 * 크기: 메타 줄 12, 작은 버튼 안 16, 상자 없는 아이콘 버튼 24.
 */
export const iconStroke = { strokeWidth: 2, strokeLinecap: 'square', strokeLinejoin: 'miter' } as const;

export const iconSize = { meta: 12, inline: 16, button: 24 } as const;
