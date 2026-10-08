#!/usr/bin/env node
/**
 * 백엔드 OpenAPI 문서에서 TypeScript 타입을 생성한다.
 *
 * 백엔드는 별도 리파지토리(project-bookey-backend)에 있으므로, 두 쪽을 잇는 계약은 이 생성물 하나다.
 * 서버 응답 스키마가 바뀌면 이 스크립트를 다시 돌린다.
 *
 *   npm run types                                        # 로컬 백엔드(8080)
 *   BOOKEY_API_URL=https://api.bookey.site npm run types # 운영 API
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const apiUrl = process.env.BOOKEY_API_URL ?? 'http://localhost:8080';
const source = `${apiUrl}/openapi.json`;
const target = resolve(root, 'src/api/generated.ts');
const tmp = resolve(root, 'src/api/.openapi.json');

console.log(`OpenAPI → ${source}`);

const response = await fetch(source).catch((error) => {
  console.error(`서버에 연결하지 못했어요: ${error.message}`);
  console.error('백엔드 리파지토리에서 ./mvnw spring-boot:run 을 먼저 띄우거나 BOOKEY_API_URL 을 지정해 주세요.');
  process.exit(1);
});

if (!response.ok) {
  console.error(`OpenAPI 문서를 가져오지 못했어요 (HTTP ${response.status})`);
  process.exit(1);
}

mkdirSync(dirname(target), { recursive: true });
writeFileSync(tmp, await response.text());

try {
  const output = execFileSync('npx', ['--yes', 'openapi-typescript@7', tmp, '--root-types'], {
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
    // Windows 에서는 npx 가 npx.cmd 배치 파일이라 셸을 거쳐야 실행된다.
    shell: process.platform === 'win32',
  });
  writeFileSync(
    target,
    `/* 자동 생성 파일 — 직접 고치지 마세요. npm run types 로 다시 만듭니다. */\n${output}`,
  );
  console.log(`생성 완료 → ${target}`);
} finally {
  rmSync(tmp, { force: true });
}
