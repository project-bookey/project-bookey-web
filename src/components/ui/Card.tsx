import type { HTMLAttributes, ReactNode } from 'react';

/** 종이 카드 — 헤어라인 테두리 하나로만 구분한다(그림자 없음). */
export function Card({ children, className = '', ...rest }: { children: ReactNode } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`overflow-hidden rounded-lg border border-line bg-surface p-4 ${className}`} {...rest}>
      {children}
    </div>
  );
}

/**
 * 오려 붙인 메모 조각 — 점선 테두리에 살짝 기울어진 종잇조각.
 * `ruled` 는 활자 판면용: 기울이지 않고 괘선 한 겹만 두른 평평한 메모(독후감 안 문장 조각).
 */
export function MemoScrap({
  children,
  rotate = 1.5,
  variant = 'scrap',
  className = '',
  ...rest
}: { children: ReactNode; rotate?: number; variant?: 'scrap' | 'ruled' } & HTMLAttributes<HTMLDivElement>) {
  const ruled = variant === 'ruled';
  return (
    <div
      className={`rounded-sm border border-line-strong ${ruled ? 'border-solid bg-transparent p-4' : 'border-dashed bg-surface-deep p-3'} ${className}`}
      style={ruled || rotate === 0 ? undefined : { transform: `rotate(${rotate}deg)` }}
      {...rest}
    >
      {children}
    </div>
  );
}

/** 스티키 노트 — 책상에 비스듬히 붙인 민트 메모지. 안쪽 글자는 on-note. */
export function StickyNote({
  children,
  rotate = -2,
  className = '',
  ...rest
}: { children: ReactNode; rotate?: number } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-sm bg-note p-3 text-on-note ${className}`}
      style={rotate === 0 ? undefined : { transform: `rotate(${rotate}deg)` }}
      {...rest}
    >
      {children}
    </div>
  );
}
