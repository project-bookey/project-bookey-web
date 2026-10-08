'use client';

import { Plus, Smartphone, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button, type ButtonSize, type ButtonVariant } from '@/components/ui/Button';

import { useInstall } from './InstallProvider';
import type { InstallReason } from './types';

/** 아이콘은 이름으로 받는다 — 서버 컴포넌트가 클라이언트 부품에 함수(아이콘 컴포넌트)를 넘길 수 없다. */
export type InstallIcon = 'smartphone' | 'plus' | 'none';

const ICONS: Record<Exclude<InstallIcon, 'none'>, LucideIcon> = { smartphone: Smartphone, plus: Plus };

/**
 * 앱 설치 안내를 여는 버튼 — 쓰기 동작(독서 시작·쓰기·담기·팔로우·엽서)이 있던 자리에 그 모양 그대로 선다.
 * 화면의 주요 버튼은 primary 하나, 나머지는 tonal.
 */
export function InstallButton({
  reason,
  variant = 'tonal',
  size = 'md',
  icon = 'smartphone',
  children,
  className,
  ariaLabel,
}: {
  reason: InstallReason;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: InstallIcon;
  children?: ReactNode;
  className?: string;
  ariaLabel?: string;
}) {
  const { open } = useInstall();
  return (
    <Button
      variant={variant}
      size={size}
      icon={icon === 'none' ? undefined : ICONS[icon]}
      className={className}
      aria-label={ariaLabel}
      onClick={() => open(reason)}
    >
      {children}
    </Button>
  );
}

/** 카드 발치·글 옆에 서는 작은 보조 버전(32pt, xs 26pt). */
export function InstallAction(props: Omit<Parameters<typeof InstallButton>[0], 'size' | 'variant'> & { size?: 'sm' | 'xs' }) {
  return <InstallButton variant="tonal" size="sm" {...props} />;
}
