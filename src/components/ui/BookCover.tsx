/**
 * 책 표지 — 2:3 판에 사진, 없으면 세리프 제목을 세운 장정판. 콜라주 기울기는 tilt(도)로.
 * 사진은 출처 호스트가 제각각이라 <img loading="lazy"> 로 그대로 보여 준다.
 * `fluid` 면 칸 폭을 꽉 채운다(그리드 칸) — 비율만 2:3 으로 지킨다.
 */
export function BookCover({
  uri,
  title,
  width = 96,
  tilt = 0,
  className = '',
  priority = false,
  fluid = false,
}: {
  uri?: string | null;
  title?: string | null;
  width?: number;
  tilt?: number;
  className?: string;
  /** 첫 화면에 바로 보이는 표지(상세 히어로)는 지연 로딩하지 않는다. */
  priority?: boolean;
  fluid?: boolean;
}) {
  const height = Math.round(width * 1.5);
  const compact = width < 56;
  const fontSize = compact ? Math.max(8, Math.round(width / 6.5)) : Math.max(11, Math.round(width / 7));
  const lineHeight = compact ? fontSize + 3 : Math.max(15, Math.round(width / 5));
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-sm border border-line bg-book-board ${className}`}
      style={fluid ? { width: '100%', aspectRatio: '2 / 3', transform: tilt ? `rotate(${tilt}deg)` : undefined } : { width, height, transform: tilt ? `rotate(${tilt}deg)` : undefined }}
    >
      {uri ? (
        <img
          src={uri}
          alt={title ? `${title} 표지` : '책 표지'}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          className="h-full w-full object-cover"
        />
      ) : (
        <div
          className="flex h-full w-full flex-col justify-between text-on-book-band"
          style={{ padding: compact ? 4 : 8 }}
          aria-label={title ? `${title} 표지` : '책 표지'}
          role="img"
        >
          {!compact ? <div className="h-[2px] w-6 bg-current opacity-60" /> : null}
          <div className="clamp-3 break-keep font-bold" style={{ fontSize, lineHeight: `${lineHeight}px` }}>
            {title ?? '제목 미상'}
          </div>
          {!compact ? <div className="h-px w-full bg-current opacity-40" /> : null}
        </div>
      )}
    </div>
  );
}
