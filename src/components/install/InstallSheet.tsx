'use client';

import { X } from 'lucide-react';
import { useEffect, useRef, type MouseEvent } from 'react';

import { ButtonLink } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { iconSize, iconStroke } from '@/components/ui/icon';

import { INSTALL_COPY } from './installCopy';
import { detectStoreOs } from './storeOs';
import type { InstallConfig, InstallReason } from './types';
import { useClientValue } from './useClientValue';

function readStoreOs() {
  return detectStoreOs(navigator.userAgent, navigator.maxTouchPoints);
}

/**
 * 앱 설치 안내 시트 — 화면 아래에서 올라오는 종이 한 장(<dialog>). 바탕을 누르거나 ×·Esc 로 닫는다.
 * 제목·설명은 연 자리의 이유(reason)를 따르고, 스토어 버튼은 기기에 맞는 것 하나만(데스크톱은 둘 다).
 * 링크가 아직 없으면 '곧 출시' 태그로 알린다 — 눌리지 않는 버튼을 세워 두지 않는다.
 */
export function InstallSheet({ reason, config, onClose }: { reason: InstallReason | null; config: InstallConfig; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const os = useClientValue(readStoreOs, 'other');
  const open = reason !== null;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  // 바탕(= dialog 요소 자체)을 눌렀을 때만 닫는다 — 안쪽 종이를 누른 건 그대로.
  const onBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  const copy = INSTALL_COPY[reason ?? 'generic'];
  const ios = config.appStoreUrl;
  const android = config.playStoreUrl;
  const stores: [string, string | null][] =
    os === 'ios' ? [['App Store에서 받기', ios]]
    : os === 'android' ? [['Google Play에서 받기', android]]
    : [['App Store에서 받기', ios], ['Google Play에서 받기', android]];
  const available = stores.filter((entry): entry is [string, string] => Boolean(entry[1]));

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={onBackdropClick}
      aria-labelledby="install-sheet-title"
      className="fixed inset-x-0 bottom-0 top-auto m-0 w-full max-w-[640px] bg-transparent p-0 backdrop:bg-scrim-dim sm:left-1/2 sm:-translate-x-1/2"
    >
      <div className="rounded-t-lg border border-b-0 border-line-strong bg-surface p-5 pb-[max(20px,env(safe-area-inset-bottom))] text-text">
        <div className="flex items-start justify-between gap-3">
          <div className="t-mono-eyebrow pt-3 text-text-faint">Bookey 앱</div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="pressable -mr-2 -mt-2 inline-flex h-11 w-11 items-center justify-center text-text"
          >
            <X size={iconSize.button} aria-hidden {...iconStroke} />
          </button>
        </div>
        <h2 id="install-sheet-title" className="t-title-serif mt-1 break-keep text-text">
          {copy.title}
        </h2>
        <p className="t-body mt-2 break-keep text-text-muted">{copy.body}</p>

        <div className="mt-5 flex flex-col gap-2">
          {available.length > 0 ? (
            available.map(([label, href], index) => (
              <ButtonLink key={label} href={href} external variant={index === 0 && available.length === 1 ? 'primary' : 'tonal'}>
                {label}
              </ButtonLink>
            ))
          ) : (
            <div className="flex flex-col items-start gap-2 rounded-md border border-dashed border-line-strong p-4">
              <Tag label="곧 출시" />
              <p className="t-body text-text-muted">앱은 곧 출시돼요. 조금만 기다려 주세요.</p>
            </div>
          )}
        </div>
      </div>
    </dialog>
  );
}
