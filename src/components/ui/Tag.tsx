import type { LucideIcon } from 'lucide-react';

import { iconStroke } from './icon';

/** 태그 — 각진 작은 종이 조각. 강조색을 쓰지 않는다(한 화면 강조 하나). */
export function Tag({ label, icon: Icon, className = '' }: { label: string; icon?: LucideIcon; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-[3px] rounded-sm bg-surface-raised px-2 py-[3px] text-[10.5px] font-bold tracking-[0.6px] leading-[14px] text-text-muted ${className}`}
    >
      {Icon ? <Icon size={11} aria-hidden {...iconStroke} /> : null}
      {label}
    </span>
  );
}
