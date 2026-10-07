# www.bookey.site 배포 인계

이 문서는 서버 설정 담당자에게 넘기는 요구사항이다. 웹 코드는 이 리파지토리, 백엔드 공개 API 는 `project-bookey-backend` 에 있고, 아래 서버 작업은 이 리파지토리 밖이다.

## 1. 컨테이너

```bash
docker build -t bookey-web .
docker run --rm -p 3000:3000 \
  -e BOOKEY_API_URL=http://backend:8080 \
  -e SITE_URL=https://www.bookey.site \
  bookey-web
```

- 포트 **3000**, 헬스 `GET /healthz` → `{"ok":true}` (Dockerfile 에 HEALTHCHECK 포함).
- 유휴 메모리 약 100MB. `NODE_OPTIONS=--max-old-space-size=192`, compose `mem_limit: 256m` 권장.
- 사용자 `nextjs`(uid 1001), Node 24 alpine, `output: standalone`.
- 이미지 발행은 담당자 선택. GHCR 로 올리는 워크플로 조각 예:

```yaml
# 리파지토리가 public 이면 패키지도 public 으로 두면 EC2 에서 로그인 없이 pull 할 수 있다.
jobs:
  image:
    runs-on: ubuntu-24.04-arm        # t4g(arm64) 와 같은 아키텍처. 없으면 docker/setup-qemu-action + --platform linux/arm64
    permissions: { contents: read, packages: write }
    steps:
      - uses: actions/checkout@v5
      - uses: docker/login-action@v3
        with: { registry: ghcr.io, username: ${{ github.actor }}, password: ${{ secrets.GITHUB_TOKEN }} }
      - uses: docker/build-push-action@v6
        with:
          push: true
          tags: |
            ghcr.io/project-bookey/project-bookey-web:latest
            ghcr.io/project-bookey/project-bookey-web:sha-${{ github.sha }}
```

## 2. 환경 변수 (`/opt/bookey/.env` 등)

| 키 | 값 | 비고 |
|---|---|---|
| `BOOKEY_API_URL` | `http://backend:8080` | 백엔드와 같은 compose 망일 때. 다른 호스트면 `https://api.bookey.site` |
| `SITE_URL` | `https://www.bookey.site` | canonical·OG·사이트맵 |
| `APP_STORE_URL` | (비움) | 스토어에 올라가면 채우고 컨테이너 재시작 — 재빌드 없음 |
| `PLAY_STORE_URL` | (비움) | 위와 같다 |
| `APP_STORE_ID` | (비움) | iOS Safari 스마트 배너용 숫자 ID |
| `SUPPORT_EMAIL` | `support@bookey.site` | 바닥글·FAQ 의 문의 메일 |

compose 는 `.env` 로 `${…}` 만 채우므로 서비스 `environment:` 에 키를 명시해야 컨테이너에 들어간다.

compose 서비스 예:

```yaml
  web:
    image: ghcr.io/project-bookey/project-bookey-web:latest
    restart: unless-stopped
    depends_on: [backend]
    ports: ["127.0.0.1:3200:3000"]
    mem_limit: 256m
    environment:
      BOOKEY_API_URL: http://backend:8080
      SITE_URL: https://www.bookey.site
      APP_STORE_URL: ${APP_STORE_URL:-}
      PLAY_STORE_URL: ${PLAY_STORE_URL:-}
      APP_STORE_ID: ${APP_STORE_ID:-}
      SUPPORT_EMAIL: support@bookey.site
      NODE_OPTIONS: --max-old-space-size=192
```

## 3. nginx 요구

- `www.bookey.site` → `http://127.0.0.1:3200` 프록시.
- 전달 헤더 **필수**: `Host`, `X-Real-IP`, `X-Forwarded-For`, `X-Forwarded-Proto` (지금 `bookey-api.conf` 와 같은 줄). 웹 서버가 이 헤더를 백엔드로 그대로 넘기고, 백엔드는 방문자 IP 로 검색 횟수 제한·독후감 조회수 중복 제거를 한다.
- apex `bookey.site` → `https://www.bookey.site$request_uri` 301, 80 → 443 301.
- `/_next/static/` 응답의 `Cache-Control`(immutable)은 그대로 통과시키면 된다. 별도 정적 서빙 불필요.
- `client_max_body_size` 는 기본값이면 된다(업로드 없음).

```nginx
server {
    server_name www.bookey.site;
    location / {
        proxy_pass http://127.0.0.1:3200;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 10s;
        proxy_read_timeout 60s;
    }
    listen 443 ssl; listen [::]:443 ssl;
    ssl_certificate /etc/letsencrypt/live/www.bookey.site/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/www.bookey.site/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}
server {
    listen 443 ssl; listen [::]:443 ssl;
    server_name bookey.site;
    ssl_certificate /etc/letsencrypt/live/www.bookey.site/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/www.bookey.site/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
    return 301 https://www.bookey.site$request_uri;
}
server {
    listen 80; listen [::]:80;
    server_name bookey.site www.bookey.site;
    return 301 https://www.bookey.site$request_uri;
}
```

주의: 백엔드 `deploy-ec2.yml` 이 매 배포마다 `nginx -t && systemctl reload nginx` 를 돌리므로, 인증서 파일이 없는 상태에서 위 설정을 올리면 백엔드 배포가 깨진다 — 인증서를 먼저 받거나 80 블록만 먼저 올린다.

## 4. DNS · TLS

- 가비아: `A bookey.site` 와 `A www.bookey.site` → EC2 Elastic IP (`api.bookey.site` 와 같은 주소).
- `sudo certbot certonly --nginx -d www.bookey.site -d bookey.site --deploy-hook "systemctl reload nginx"`.

## 5. 백엔드 쪽 함께 확인할 것

- `application-prod.yml` 에 `server.forward-headers-strategy: native` 가 들어간다 — Tomcat 이 `X-Forwarded-For` 를 풀어 실제 방문자 IP 를 쓴다. 도커망(172.16/12)·127/8 에서 오는 전달 헤더만 믿는다.
- 공개 API 는 `GET /api/v1/public/**`(permitAll) — 토큰 없이 부른다. CORS 에 `https://*.bookey.site` 가 추가됐지만 이 웹은 서버에서만 호출해 CORS 를 타지 않는다.

## 6. 메모리

EC2 1GB 에 JVM·Postgres·Redis 가 이미 올라가 있다. `free -m`·`docker stats` 로 자리를 확인하고, 쓰지 않는 EC2 `admin` 컨테이너가 돌고 있으면 내린다(어드민은 Cloud Run 이 실서비스). 모자라면 스왑 1GB, 또는 이 웹만 Cloud Run(어드민 `deploy-cloud-run.yml` 선례, `BOOKEY_API_URL=https://api.bookey.site`).

## 7. 배포 뒤 확인

```bash
curl -I https://www.bookey.site/            # 200
curl -I https://bookey.site/                # 301 → https://www.bookey.site/
curl -I http://www.bookey.site/             # 301 → https
curl -s https://www.bookey.site/healthz     # {"ok":true}
curl -s https://www.bookey.site/robots.txt
```

브라우저에서 `/books/<id>`·`/posts/<id>` 를 열어 글이 보이고, DevTools Network 에 `api.bookey.site` 호출이 없는지(서버만 부른다) 확인한다.
