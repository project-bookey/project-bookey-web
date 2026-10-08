# project-bookey-web

Bookey 조회 전용 공개 웹 — `https://www.bookey.site`. 로그인 없이 책·독후감·리뷰·공개 프로필을 둘러보고, 쓰기 동작이 있던 자리마다 앱 설치 안내가 선다. Next.js · React · TypeScript.

관련 리파지토리
- **[project-bookey-app](https://github.com/project-bookey/project-bookey-app)** — 모바일 앱(Expo). 디자인 토큰·문구 규칙의 원본.
- **[project-bookey-backend](https://github.com/project-bookey/project-bookey-backend)** — 백엔드 API. 이 웹은 `GET /api/v1/public/**` 와 배너·FAQ 만 부른다.
- **[project-bookey-admin](https://github.com/project-bookey/project-bookey-admin)** — 관리자 백오피스(같은 Next.js 구성).

## 구성

```
project-bookey-web/
├─ src/app/            페이지 (App Router) — 홈 · /plaza · /books/[id] · /posts/[id] · /reviews/[id] · /users/[id] · /search · /faq · /legal/[key] · /app · /health
├─ src/components/     ui(토큰 부품) · site(헤더·바닥글) · install(앱 설치 안내) · post · book · home · review
├─ src/lib/            api.ts(서버 전용 호출) · endpoints.ts · types.ts · format.ts · post/(본문 규칙)
├─ src/api/generated.ts  백엔드 OpenAPI 에서 생성한 타입 (커밋한다, 손으로 고치지 않는다)
├─ scripts/            OpenAPI → TS 타입 생성기 · 휴대폰 폭 스크린샷 도구
├─ Dockerfile · docker-compose.yml   EC2 배포(아래)
└─ docs/deploy-handoff.md  배포 담당자 인계 문서
```

## 시작하기

```bash
npm ci
cp .env.example .env.local        # BOOKEY_API_URL 을 로컬 백엔드(http://localhost:8080) 또는 운영 API 로
npm run dev                       # http://localhost:3200
```

데이터는 전부 서버 컴포넌트가 가져온다 — 브라우저는 이 사이트 외 어떤 API 도 부르지 않는다(CORS 무관, API 주소 비노출).

## 백엔드와의 계약

두 쪽을 잇는 것은 **서버가 발행하는 OpenAPI 문서** 하나다.

```bash
npm run types                                        # 로컬 백엔드(8080) 기준
BOOKEY_API_URL=https://api.bookey.site npm run types # 운영 API 기준
```

`src/api/generated.ts` → `src/lib/types.ts`(별칭) → `src/lib/endpoints.ts` → `src/lib/api.ts` 순으로만 흐른다. 서버 필드를 손으로 적는 곳은 없다.

## 환경 변수

| 키 | 설명 |
|---|---|
| `BOOKEY_API_URL` | 백엔드 주소(서버 전용). 기본 `https://api.bookey.site` |
| `SITE_URL` | 이 사이트의 공개 주소 — canonical·OG·사이트맵. 기본 `https://www.bookey.site` |
| `APP_STORE_URL` · `PLAY_STORE_URL` | 스토어 링크. 비어 있으면 '곧 출시' 안내. 런타임 값이라 넣고 컨테이너만 다시 띄우면 된다 |
| `APP_STORE_ID` | App Store 숫자 ID — 있으면 iOS Safari 스마트 배너 |
| `SUPPORT_EMAIL` | 문의 메일 |

## 검사·빌드

```bash
npm run typecheck
npm run lint
npm run build
docker compose up -d --build      # http://localhost:3200 · 상태 확인 /health
```

## 배포

`main` 푸시 시 GitHub Actions(`CI`)가 typecheck · lint · build 를 검증한다. `Deploy web to EC2`도 검증 후 기존 Bookey EC2에 자동 배포한다. Compose 프로젝트 `bookey-web`은 백엔드·어드민 Compose와 독립적으로 돈다. 공개 포트 `3200`(컨테이너 안 `8080`), 상태 확인 `/health`. 서버 환경 변수는 `/opt/bookey-web/.env`에서 릴리스에 복사하며, 성공한 릴리스는 `/opt/bookey-web/current`로 연결한다.

GitHub OIDC 역할 `bookey-web-github-deploy`는 배포 실행 중인 runner IP에만 임시 SSH 접근을 허용하고 종료 시 제거한다. 역할 정책은 `infra/`에 있다. GitHub `production` 환경은 `main` 브랜치만 허용한다.

Repository Secrets (배포 워크플로):

| 이름 | 값 |
| --- | --- |
| `EC2_HOST` | EC2 IP 또는 DNS |
| `EC2_USER` | `ec2-user` |
| `EC2_SSH_KEY` | EC2 접속용 private key |
| `EC2_SSH_KNOWN_HOSTS` | 검증된 서버 SSH host key 의 known_hosts 항목 |

서버에는 Docker 와 Compose 가 필요하고, 배포 사용자가 `/opt/bookey-web` 에 쓸 수 있어야 한다. 웹 접속을 위해 보안 그룹에서 TCP 3200 을 허용하거나(임시), host nginx 가 `www.bookey.site` 를 `127.0.0.1:3200` 으로 프록시한다 — nginx·DNS·인증서 요구사항은 `docs/deploy-handoff.md`.
