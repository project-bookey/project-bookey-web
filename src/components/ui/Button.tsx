import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';

import { iconStroke } from './icon';

/**
 * 버튼 — 역할마다 색 하나를 평평하게 깐다(테두리·광택·그림자 없음, 앱 2026-10-05 결정).
 * 주요 = accent, 보조 = tonal(회색 톤), 위험 = dangerSoft, 고스트 = 면 없음. 높이 48 / 32 / 26, 글자 14 / 12 / 11.
 * 라벨은 동작으로 쓴다('받기'·'보기'). 아이콘만 두면 aria-label 을 꼭 준다.
 */
export type ButtonVariant = 'primary' | 'tonal' | 'ghost' | 'danger';
export type ButtonSize = 'md' | 'sm' | 'xs';

const SIZE: Record<ButtonSize, string> = {
  md: 'min-h-12 px-4 text-[14px] rounded-button gap-1.5',
  sm: 'min-h-8 px-3 text-[12px] rounded-control gap-1',
  xs: 'min-h-[26px] px-2 text-[11px] rounded-control gap-1',
};

const VARIANT: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-on-accent',
  tonal: 'bg-tonal text-text',
  ghost: 'bg-transparent text-text-muted min-h-11 px-0',
  danger: 'bg-danger-soft text-danger',
};

const ICON_PX: Record<ButtonSize, number> = { md: 16, sm: 14, xs: 12 };

export function buttonClass(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', extra = ''): string {
  return [
    'pressable inline-flex items-center justify-center font-bold whitespace-nowrap select-none leading-none',
    'disabled:opacity-35 disabled:pointer-events-none',
    SIZE[size],
    VARIANT[variant],
    extra,
  ]
    .filter(Boolean)
    .join(' ');
}

type Common = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  /** 재생처럼 채운 모양이 더 잘 읽히는 아이콘. */
  iconFill?: boolean;
  children?: ReactNode;
  className?: string;
};

export function ButtonIcon({ icon: Icon, size = 'md', fill = false }: { icon: LucideIcon; size?: ButtonSize; fill?: boolean }) {
  return <Icon size={ICON_PX[size]} aria-hidden fill={fill ? 'currentColor' : 'none'} {...iconStroke} />;
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconFill,
  children,
  className = '',
  type = 'button',
  ...rest
}: Common & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={buttonClass(variant, size, className)} {...rest}>
      {icon ? <ButtonIcon icon={icon} size={size} fill={iconFill} /> : null}
      {children}
    </button>
  );
}

/** 링크 모양 버튼 — 내부 경로는 next/link, 바깥 주소(스토어·메일)는 <a>. */
export function ButtonLink({
  href,
  variant = 'primary',
  size = 'md',
  icon,
  iconFill,
  children,
  className = '',
  external,
  ...rest
}: Common & { href: string; external?: boolean } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>) {
  const cls = buttonClass(variant, size, className);
  const inner = (
    <>
      {icon ? <ButtonIcon icon={icon} size={size} fill={iconFill} /> : null}
      {children}
    </>
  );
  if (external || /^(https?:|mailto:)/.test(href)) {
    return (
      <a href={href} className={cls} target={href.startsWith('mailto:') ? undefined : '_blank'} rel="noopener noreferrer" {...rest}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...rest}>
      {inner}
    </Link>
  );
}
