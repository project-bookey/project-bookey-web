/** 작성자 아바타 지름(px) — 앱 어디서나 같은 크기(40). */
export const AVATAR_SIZE = 40;

/** 사진 없는 사람의 기본 그림 — 원(머리)과 위가 둥근 판(어깨)으로 그린 실루엣. 어깨는 아래로 잘린다. */
export function PersonGlyph({ size, color = 'currentColor' }: { size: number; color?: string }) {
  const head = size * 0.27;
  const bodyW = size * 0.52;
  const bodyH = size * 0.4;
  const headTop = size * 0.22;
  const bodyTop = headTop + head + size * 0.05;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      <circle cx={size / 2} cy={headTop + head / 2} r={head / 2} fill={color} />
      <rect x={(size - bodyW) / 2} y={bodyTop} width={bodyW} height={bodyH + size} rx={bodyW / 2} ry={bodyW / 2} fill={color} />
    </svg>
  );
}

/** 작성자 아바타 — 사진이 없으면 빈 원이 아니라 종이 판 위에 실루엣을 세운다. */
export function Avatar({ uri, nickname, size = AVATAR_SIZE }: { uri?: string | null; nickname: string; size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-surface-raised text-text-faint"
      style={{ width: size, height: size }}
    >
      {uri ? (
        <img src={uri} alt={`${nickname} 프로필 사진`} width={size} height={size} loading="lazy" decoding="async" className="h-full w-full object-cover" />
      ) : (
        <PersonGlyph size={size} />
      )}
    </span>
  );
}
