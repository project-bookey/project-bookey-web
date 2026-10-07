# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Bookey 의 **조회 전용 공개 웹** — `https://www.bookey.site`. Next.js 16(App Router) + TypeScript(strict) + Tailwind v4. 로그인이 없고, 비회원이 책·독후감·리뷰·공개 프로필을 둘러본다. 등록·수정·삭제, 클럽·모임, 채팅·엽서, 서재·지갑·설정은 전부 앱 전용이며 **그 동작이 있던 자리마다 앱 설치 안내가 선다**(2026-10-07 사용자 결정).

세 리파지토리 중 하나: 모바일 앱 [project-bookey-app](https://github.com/project-bookey/project-bookey-app)(Expo — 디자인·문구 규칙의 원본), 백엔드 [project-bookey-backend](https://github.com/project-bookey/project-bookey-backend)(Spring Boot, `api.bookey.site`), 어드민 [project-bookey-admin](https://github.com/project-bookey/project-bookey-admin)(같은 Next.js 구성). 서버 설정(nginx·DNS·인증서·compose)은 이 리파지토리 밖이다 — `docs/deploy-handoff.md` 가 담당자에게 넘기는 요구사항이다.

코드 주석·화면 문구·커밋 메시지는 한국어로 쓴다.

## Git 규칙

- 커밋 메시지·PR 본문에 AI 흔적을 절대 남기지 않는다. `Co-Authored-By: Claude ...` 트레일러, "Generated with Claude Code" 문구 등 어떤 형태의 어트리뷰션도 넣지 말 것.
- 커밋은 의미 있는 변경끼리 묶고, 첫 줄에서 신규인지 수정인지 알 수 있게 쓴다(`신규: ...` / `수정: ...`).
- 작업은 main 에서 직접 하지 않고 작업별 브랜치에서 하고, 검증(`typecheck`·`lint`·`build`)에 이상이 없으면 main 에 머지한 뒤 브랜치를 지운다.

## Commands

```bash
npm run dev         # http://localhost:3000 — .env.local 의 BOOKEY_API_URL 을 본다(없으면 운영 API)
npm run typecheck   # tsc --noEmit
npm run lint        # eslint (react-hooks 규칙 포함 — 효과 안 setState 금지, 렌더 중 변수 재할당 금지)
npm run build       # next build — CI 가 셋 다 돌린다(.github/workflows/ci.yml)
npm run types       # 백엔드 OpenAPI → src/api/generated.ts (BOOKEY_API_URL=https://api.bookey.site npm run types)
```

테스트 스위트는 없다. 검증은 typecheck·lint·build 와, 서버를 띄워 페이지를 눌러 보는 것.

```bash
# 운영 빌드를 그대로 띄워 본다(standalone 은 next start 로는 안 뜬다)
cp -r public .next/standalone/public && cp -r .next/static .next/standalone/.next/static
PORT=3456 HOSTNAME=127.0.0.1 node .next/standalone/server.js
# 휴대폰 폭 스크린샷 — Chrome DevTools 프로토콜만 쓴다(headless --window-size 는 500px 아래로 안 줄어든다)
node scripts/screenshot.mjs http://127.0.0.1:3456/plaza shot.png [--dark] [--click "button[aria-label^='좋아요']"] [--desktop --width 1200]
```

## API contract — the one rule that matters

백엔드와의 유일한 연결은 서버가 발행하는 OpenAPI 문서다.

1. `scripts/generate-api-types.mjs` → `src/api/generated.ts`(커밋한다, 손으로 고치지 않는다)
2. `src/lib/types.ts` — `components['schemas'][…]` 를 앱 친화적 이름으로 다시 내보내는 얇은 별칭 층(`Post`, `BookDetail`, `Review`, `Page<T>` …)
3. `src/lib/endpoints.ts` — 도메인별 호출(`bookApi`·`postApi`·`plazaApi`·`reviewApi`·`profileApi`·`bannerApi`·`faqApi`·`legalApi`). 새 호출은 여기에.
4. `src/lib/api.ts` — `publicGet<T>(path, { query, revalidate, visitor })` 하나. **서버 전용**(`import 'server-only'`).

**서버 필드를 손으로 적지 않는다.** 타입이 없으면 `types.ts` 에 별칭을 더하고, 스키마가 없으면 다시 생성한다.

- 부르는 경로는 `GET /api/v1/public/**` 와 로그인 없이 열린 `/banners`·`/faqs` 뿐이다. 토큰은 없다. 로그인이 필요한 경로를 부르지 않는다 — 401 이 아니라 설계 위반이다.
- **브라우저는 API 를 직접 부르지 않는다.** 모든 데이터는 서버 컴포넌트가 가져온다(CORS 무관, API 주소 비노출). '더 보기'·검색·탭은 주소(`?page=`·`?q=`·`?tab=`)로 서버가 다시 그린다.
- 캐시: 목록·배너 60초, 상세·프로필 300초, 약관·FAQ 1시간(`endpoints.ts` 의 `FEED`·`DETAIL`·`STATIC`). **독후감 단건과 검색은 `visitor: true`** — 브라우저가 보낸 `X-Forwarded-For`·`User-Agent` 를 백엔드로 그대로 넘기고 캐시하지 않는다. 백엔드가 그 IP 로 조회수 중복 제거(1시간)·검색 횟수 제한(분당 30)을 한다.
- 404 는 페이지에서 `isNotFound(error)` → `notFound()`. 홈처럼 여러 묶음을 받는 화면은 `settle()`(`src/lib/settle.ts`)로 한 묶음이 실패해도 나머지를 그린다.
- 루트 `loading.tsx` 를 두지 않는다 — 셸이 먼저 흘러나가면 `notFound()` 가 404 가 아니라 200 으로 나간다.

## Architecture

- **넓은 화면 레이아웃** (2026-10-07 사용자 결정 — 잡지형·서점형·앱 홈 그대로 넓힌 안을 비교해 **잡지형** 채택): 본문 폭은 `.content`(1120px) 또는 읽는 글의 `.content-narrow`(720px). 홈은 표제 + 검색 머리띠 아래 본문(오늘의 글 → 요즘 많이 읽는 책 → 추천)과 오른쪽 사이드바(앱 설치 카드 · 배너 · 인기 순위)의 두 단(`HomeMagazine`, 데이터는 `HomeData.ts`); 휴대폰에서는 사이드바가 아래로 내려간다. 헤더는 넓은 화면에서 워드마크 120 · 홈·광장·책 찾기 · 검색 칸 · '앱 설치', 바닥글은 세 단. 광장·프로필은 카드 그리드(`PostList columns`), 도서 상세는 왼쪽 판(`BookSidePanel`, sticky) + 본문의 두 단이고 휴대폰은 한 단(`BookHero` + 하단 고정 버튼). 선반(`BookShelf`)은 휴대폰에서 가로 스크롤, 넓은 화면에서 4~6열 그리드(`BookCover fluid`). 그리드 안 카드는 `items-start` 로 높이를 맞추지 않는다. 휴대폰 폭 스크린샷으로 둘 다 확인한다.
- **페이지** (`src/app/`): `/` 홈(잡지형) · `/plaza`(독후감 피드 HOT·NEW) · `/books/[id]`(+`/reviews`·`/posts` 전체 목록) · `/posts/[id]` · `/reviews/[id]` · `/users/[id]`(닉네임·사진·숫자·공개 독후감만 — 서재·통계는 앱에서) · `/search` · `/faq`(FAQ 만, 문의는 메일) · `/legal/[key]`(백엔드 약관 원문) · `/app`(설치 안내 랜딩) · `robots.ts` · `sitemap.ts`(최근 독후감 200편과 그 책) · `opengraph-image.tsx`(사이트 공통 미리보기; 글마다는 표지·사진) · `healthz/route.ts`.
- **독후감 URL 은 id 기준**(`/posts/123`) — `PostView.authorHandle` 이 선택 필드라 `@handle/slug` 는 쓰지 않는다. `visibility === 'LINK'` 인 글은 `robots: noindex`.
- **독후감 본문** (`src/lib/post/`): 앱의 `postQuotes.ts`·`postPhotos.ts` 를 그대로 옮긴 순수 TS. 줄머리 `>` 묶음은 문장 조각(`MemoScrap ruled`, 글자 그대로), `![사진](image:ID)` 한 줄은 사진 자리, 나머지만 `react-markdown` + `remark-gfm`. 본문에 자리 없는 사진은 본문 앞에. 옛 `〖오려둔 문장 N〗` 표시는 `post.quotes` 로 치환(`postBodyOf`).
- **앱 설치 안내** (`src/components/install/`): `InstallProvider`(루트에서 한 번, 시트도 여기서 그린다) → `useInstall().open(reason)`. 쓰기 동작이 있던 자리엔 `InstallButton`(큰 버튼) / `InstallAction`(32pt 보조), 하트는 `LikeAction`(`src/components/post/`, 누르면 `like`·`bookLike` 로 연다). 이유별 문구는 `installCopy.ts`. 스토어 링크·App Store ID·문의 메일은 **런타임 환경 변수**(`src/lib/install.ts` → `getInstallConfig()`) — `NEXT_PUBLIC_*` 로 빌드에 박지 않는다. 비어 있으면 '곧 출시'. `InstallBanner` 는 휴대폰 브라우저에서만 문서 끝 sticky 띠(7일 닫힘 기억), 도서 상세·`/app` 처럼 제 주요 버튼이 있는 화면에선 뺀다. 브라우저에서만 아는 값(UA·저장소·미디어 쿼리)은 `useClientValue`/`useMediaQuery`(useSyncExternalStore)로 읽는다 — 효과 안 setState 는 lint 가 막는다.
- **셸** (`src/components/site/`): 고정 헤더(워드마크 · 홈·광장·검색 · 작은 '앱 설치' 보조 버튼) · 바닥글(약관·개인정보·환불·FAQ·문의·앱 설치). 헤더의 설치 버튼은 보조(tonal)다 — 페이지의 주요(초록) 버튼은 그 페이지의 핵심 전환 하나뿐(도서 상세 하단 '앱에서 읽기 시작').
- **Path alias**: `@/*` → `src/*`.

## Design system

앱의 **콜라주 책상** 미감을 그대로 쓴다(앱 `src/theme/palette.ts`·`tokens.ts` 가 원본). 토큰은 `src/app/globals.css` 하나 — `:root`(라이트)와 `@media (prefers-color-scheme: dark)` 두 벌을 `@theme inline` 으로 Tailwind 이름(`bg-bg`·`text-text-muted`·`border-line`·`bg-accent` …)에 잇는다. 색은 늘 토큰으로, 글자 크기는 `.t-*` 클래스(`t-title-serif`·`t-body`·`t-label`·`t-caption`·`t-mono-label`·`t-mono-numeral`·`t-meta` …)로. 새 색·새 글자 크기를 임의로 만들지 않는다.

- **서체**: 고운바탕 하나(400·700, `next/font/google` `Gowun_Batang`, `--font-gowun`). 어드민처럼 TTF 를 통째로 싣지 않는다.
- **형태**: 오려 낸 종이처럼 각진 네모 — 태그·표지·사진 `rounded-sm`(2) · 카드·입력 `rounded-md`(4) · 시트 `rounded-lg`(6). 누르는 것만 살짝 둥글다(`rounded-button` 4 · `rounded-control` 3). 원은 아바타뿐. **그림자 없음** — 종이는 헤어라인(`border-line`)으로만 구분한다.
- **버튼**(`src/components/ui/Button.tsx`): 역할 색을 평평하게 — primary=`accent`, tonal=회색 톤, danger=`danger-soft`, ghost=면 없음. 48/32/26pt, 글자 14/12/11. 라벨은 동작('받기'·'보기'·'찾기'), 아이콘만이면 `aria-label`. 캡슐·테두리·광택 금지. 눌림은 `.pressable`(opacity .72) 하나.
- **강조는 화면에 하나**: 초록(`accent`)은 주요 버튼·진행·링크 몫. 예외로 두는 초록: 헤더 탭의 활성 밑줄, 도서 상세 탭 밑줄, 리뷰 별점 별, 홈 '오늘의 글' 하트는 회색(표시 전용).
- **아이콘**: `lucide-react` + `iconStroke`(획 2, 각진 끝). 크롬에 이모지 금지. 뜻마다 아이콘 하나 — 조회 `Eye`, 좋아요 `Heart`, 별점 `Star`, 검색 `Search`, 설치 `Smartphone`, 담기 `Plus`.
- **이미지**: 표지·사진·아바타는 출처 호스트가 제각각이라 `<img loading="lazy">` 로 그대로(`next.config` `images.unoptimized`, lint 의 `no-img-element` 끔). 크기를 알면 `width`·`height` 를 줘 레이아웃이 튀지 않게.
- **폭**: `.content`(최대 640px, 좌우 16px). 가로 선반은 `.shelf`(스크롤바 없음) — 지그재그는 한 화면에 한 선반만.

## UX 철칙 — 앱과 같은 다섯 법칙

1. **Hick** — 한 화면의 주요 행동은 하나. 탭·메뉴를 늘리기 전에 합치거나 뺄 것부터.
2. **Fitts** — 누르는 것은 44×44 이상(작은 버튼은 여백으로). 주요 버튼은 아래쪽.
3. **Jakob** — 웹 표준대로: 상단 헤더, 링크, 뒤로 가기, GET 폼 검색, `<details>` 접기. 자바스크립트 없이도 페이지와 링크가 동작해야 한다.
4. **Proximity** — 묶음 안 간격(4~8)은 묶음 사이(12~16)보다, 섹션 사이(24)는 그보다 작게 두지 않는다.
5. **Von Restorff** — 눈에 띄는 것은 화면에 하나.

## UX 라이팅 — 앱과 같은 원칙

해요체 하나. 실패 문구는 "~하지 못했어요" 뒤에 할 일. 개발 용어(세션·토큰·캐시·서버) 금지. 변수 뒤에 조사를 붙이지 않는다. 버튼은 동작, 상태는 상태 말. 서비스 이름은 **Bookey**, 외부 이름은 공식 표기(App Store · Google Play · YES24). 링크 라벨은 이동이면 끝에 ' ›'(`TextLink`), 제자리 동작은 글리프 없음. 용어는 앱과 같다 — 독후감 · 리뷰 · 한 줄평 · 완독 · 하차 · 광장 · 클럽(참가)/모임(참여) · 서재 · 엽서 · 책갈피. '○○님' 은 붙여 쓴다.

## 배포

`Dockerfile`(node:24-alpine, `output: standalone`, 포트 3000, `GET /healthz`) 과 `.github/workflows/ci.yml`(검증만)은 이 리파지토리에 있다. 이미지 발행·서버 반영·nginx·DNS·인증서는 담당자 몫 — `docs/deploy-handoff.md`. 환경 변수는 `.env.example`.
