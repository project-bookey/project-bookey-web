import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { iconSize, iconStroke } from './icon';

/** 아이브로우 — 늘 뮤트 톤(악센트는 CTA 몫). */
export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`t-mono-eyebrow text-text-muted ${className}`}>{children}</div>;
}

/** 섹션 머리 — 세리프 제목과 오른쪽 동작 하나. */
export function SectionHeader({ title, action, className = '' }: { title: string; action?: ReactNode; className?: string }) {
  return (
    <div className={`mb-3 flex items-baseline justify-between gap-3 ${className}`}>
      <h2 className="text-[18px] font-bold leading-6 text-text">{title}</h2>
      {action}
    </div>
  );
}

/** 화면 이동 글자 링크 — 끝에 ' ›'(앱 linkLabel 규칙). 제자리 동작은 kind="action" 으로 글리프 없이. */
export function TextLink({
  href,
  label,
  kind = 'nav',
  className = '',
  ariaLabel,
}: {
  href: string;
  label: string;
  kind?: 'nav' | 'action';
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={`pressable inline-flex min-h-11 items-center text-[13px] font-bold leading-4 text-text ${className}`}
    >
      {kind === 'nav' ? `${label} ›` : label}
    </Link>
  );
}

/**
 * 메타 줄의 아이콘 + 값 — 조회 눈·좋아요 하트·사람·별처럼 단어 대신 아이콘으로. 누를 수 없는 정보다.
 * 스크린 리더는 label 로 읽는다.
 */
export function IconMeta({
  icon: Icon,
  children,
  label,
  color,
  filled = false,
  size = iconSize.meta,
  className = '',
}: {
  icon: LucideIcon;
  children?: ReactNode;
  label: string;
  /** 아이콘·값 색 — 기본은 흐린 메타색. */
  color?: 'faint' | 'muted' | 'accent';
  filled?: boolean;
  size?: number;
  className?: string;
}) {
  const tone = color === 'accent' ? 'text-accent' : color === 'muted' ? 'text-text-muted' : 'text-text-faint';
  return (
    <span className={`inline-flex min-w-0 items-center gap-[3px] ${tone} ${className}`} aria-label={label} role="img">
      <Icon size={size} aria-hidden fill={filled ? 'currentColor' : 'none'} {...iconStroke} />
      {children != null && children !== '' ? <span className="t-mono-label truncate">{children}</span> : null}
    </span>
  );
}

/** 빈 상태 — 다음 행동을 안내한다. 장식 막대는 회색이라 아래 버튼이 유일한 강조가 된다. */
export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-9 text-center">
      <div className="mb-4 h-[2px] w-7 bg-line-strong" />
      <p className="text-[18px] font-bold leading-6 text-text">{title}</p>
      {description ? <p className="mt-2 text-[15px] leading-[21px] text-text-muted">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

/** 홈 섹션 틀 — 가는 괘선 하나로 앞 섹션과 나눈다. */
export function HomeSection({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <section className={`pt-1 ${className}`}>
      <div className="mx-4 mb-5 h-px bg-line-strong" />
      {children}
    </section>
  );
}
