'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { InstallSheet } from './InstallSheet';
import type { InstallConfig, InstallReason } from './types';

type InstallContextValue = {
  config: InstallConfig;
  /** 설치 안내 시트를 연다 — 쓰기 동작이 있던 자리마다 그 이유로. */
  open: (reason: InstallReason) => void;
};

const InstallContext = createContext<InstallContextValue | null>(null);

/** 루트 레이아웃이 한 번 감싼다 — 시트는 여기서 한 번만 그려지고, 어디서든 open() 으로 연다. */
export function InstallProvider({ config, children }: { config: InstallConfig; children: ReactNode }) {
  const [reason, setReason] = useState<InstallReason | null>(null);
  const open = useCallback((next: InstallReason) => setReason(next), []);
  const close = useCallback(() => setReason(null), []);
  const value = useMemo(() => ({ config, open }), [config, open]);
  return (
    <InstallContext.Provider value={value}>
      {children}
      <InstallSheet reason={reason} config={config} onClose={close} />
    </InstallContext.Provider>
  );
}

export function useInstall(): InstallContextValue {
  const value = useContext(InstallContext);
  if (!value) throw new Error('InstallProvider 안에서만 쓸 수 있어요.');
  return value;
}
