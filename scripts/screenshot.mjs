#!/usr/bin/env node
/**
 * 휴대폰 화면 그대로 찍는 스크린샷 — 의존성 없이 Chrome 의 DevTools 프로토콜만 쓴다.
 * (headless Chrome 의 --window-size 는 500px 아래로 줄지 않아 모바일 폭을 못 찍는다.)
 *
 *   node scripts/screenshot.mjs <url> <out.png> [--dark] [--click <css selector>] [--width 390] [--height 1400] [--desktop]
 *
 * 기본은 390px 휴대폰(모바일 UA — 하단 설치 띠까지 보인다). --dark 는 어두운 테마, --click 은 찍기 전에 누를 요소.
 */
import { spawn } from 'node:child_process';
import { existsSync, writeFileSync } from 'node:fs';

const args = process.argv.slice(2);
const url = args[0];
const out = args[1];
if (!url || !out) {
  console.error('사용법: node scripts/screenshot.mjs <url> <out.png> [--dark] [--click <selector>] [--width 390] [--height 1400] [--desktop]');
  process.exit(1);
}
const flag = (name) => args.includes(name);
const value = (name, fallback) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : fallback;
};
const width = Number(value('--width', 390));
const height = Number(value('--height', 1400));
const dark = flag('--dark');
const desktop = flag('--desktop');
const click = value('--click', null);
const port = 9222 + Math.floor(Math.random() * 1000);

const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].find((candidate) => existsSync(candidate));
if (!CHROME) {
  console.error('Chrome 이나 Edge 를 찾지 못했어요.');
  process.exit(1);
}

const chrome = spawn(CHROME, [
  '--headless=new',
  '--disable-gpu',
  '--no-first-run',
  '--no-default-browser-check',
  `--remote-debugging-port=${port}`,
  '--window-size=1200,1400',
  'about:blank',
], { stdio: 'ignore' });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForDevtools() {
  for (let i = 0; i < 50; i++) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (response.ok) return;
    } catch {
      // 아직 안 떴다
    }
    await sleep(200);
  }
  throw new Error('Chrome DevTools 에 연결하지 못했어요.');
}

try {
  await waitForDevtools();
  const target = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' }).then((r) => r.json());
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });
  let nextId = 1;
  const pending = new Map();
  const events = [];
  ws.onmessage = (message) => {
    const data = JSON.parse(message.data);
    if (data.id && pending.has(data.id)) {
      pending.get(data.id)(data);
      pending.delete(data.id);
    } else if (data.method) {
      events.push(data.method);
    }
  };
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = nextId++;
      pending.set(id, (data) => (data.error ? reject(new Error(`${method}: ${data.error.message}`)) : resolve(data.result)));
      ws.send(JSON.stringify({ id, method, params }));
    });

  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: !desktop });
  if (!desktop) {
    await send('Emulation.setUserAgentOverride', {
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    });
    await send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  }
  if (dark) await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'dark' }] });
  await send('Page.navigate', { url });
  for (let i = 0; i < 100 && !events.includes('Page.loadEventFired'); i++) await sleep(100);
  await sleep(600);
  if (click) {
    await send('Runtime.evaluate', { expression: `document.querySelector(${JSON.stringify(click)})?.click()` });
    await sleep(600);
  }
  const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
  writeFileSync(out, Buffer.from(shot.data, 'base64'));
  console.log(`저장 → ${out}`);
  ws.close();
} finally {
  chrome.kill();
}
