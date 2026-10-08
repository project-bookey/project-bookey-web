# www.bookey.site 배포 인계

이 문서는 서버 설정 담당자에게 넘기는 요구사항이다. 웹 코드와 컨테이너 정의(`Dockerfile`·`docker-compose.yml`)는 이 리파지토리에 있고, 백엔드 공개 API 는 `project-bookey-backend` 에 있다. nginx·DNS·인증서·EC2 작업은 이 리파지토리 밖이다.

## 1. 컨테이너 (리파지토리의 docker-compose.yml)

```bash
cd /opt/bookey-web && docker compose up -d --build
```

- Compose 프로젝트 `bookey-web`, 서비스 `web`. 공개 포트 **3200** → 컨테이너 안 **8080**. 상태 확인 `GET /health` → `{"status":"ok","service":"bookey-web"}` (compose healthcheck 포함).
- 유휴 메모리 약 70~100MB. `NODE_OPTIONS=--max-old-space-size=192`, `mem_limit: 256m` 로 묶어 두었다.
- 사용자 `nextjs`(uid 1001), Node 24 alpine, `output: standalone`. 이미지 약 240MB.
- 백엔드·어드민 Compose 와 독립적으로 돈다(같은 도커 망이 아니므로 백엔드는 공개 주소 `https://api.bookey.site` 로 부른다).

## 2. 환경 변수 (`/opt/bookey-web/.env`)

| 키 | 값 | 비고 |
|---|---|---|
| `BOOKEY_API_URL` | `https://api.bookey.site` | 기본값. 백엔드와 같은 도커 망에 넣는다면 `http://backend:8080` |
| `SITE_URL` | `https://www.bookey.site` | canonical·OG·사이트맵 |
| `APP_STORE_URL` | (비움) | 스토어에 올라가면 채우고 `docker compose up -d` — 재빌드 없음 |
| `PLAY_STORE_URL` | (비움) | 위와 같다 |
| `APP_STORE_ID` | (비움) | iOS Safari 스마트 배너용 숫자 ID |
| `SUPPORT_EMAIL` | `support@bookey.site` | 바닥글·FAQ 의 문의 메일 |

모두 `docker-compose.yml` 의 `environment:` 에 기본값과 함께 들어 있어 `.env` 가 없어도 뜬다.

## 3. nginx 요구

- `www.bookey.site` → `http://127.0.0.1:3200` 프록시.
- 전달 헤더 **필수**: `Host`, `X-Real-IP`, `X-Forwarded-For`, `X-Forwarded-Proto` (지금 `bookey-api.conf` 와 같은 줄). 웹 서버가 이 헤더를 백엔드로 그대로 넘기고, 백엔드는 방문자 IP 로 검색 횟수 제한·독후감 조회수 중복 제거를 한다. 헤더가 없으면 방문자 전체가 한 IP 로 묶인다.
- apex `bookey.site` → `https://www.bookey.site$request_uri` 301, 80 → 443 301.
- `/_next/static/` 응답의 `Cache-Control`(immutable)은 그대로 통과시키면 된다. 별도 정적 서빙 불필요. `client_max_body_size` 는 기본값(업로드 없음).

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

주의: 백엔드 `deploy-ec2.yml` 이 매 배포마다 `nginx -t && systemctl reload nginx` 를 돌리므로, 인증서 파일이 없는 상태에서 위 설정을 올리면 백엔드 배포가 깨진다 — 인증서를 먼저 받거나 80 블록만 먼저 올린다. 공개 포트 3200 을 보안 그룹에서 직접 열어 두었다면 nginx 연결 뒤에는 닫아도 된다.

## 4. DNS · TLS

- 가비아: `A bookey.site` 와 `A www.bookey.site` → EC2 Elastic IP (`api.bookey.site` 와 같은 주소).
- `sudo certbot certonly --nginx -d www.bookey.site -d bookey.site --deploy-hook "systemctl reload nginx"`.

## 5. 백엔드 쪽 함께 확인할 것

- `application-prod.yml` 에 `server.forward-headers-strategy: native` 가 들어가 있다 — Tomcat 이 `X-Forwarded-For` 를 풀어 실제 방문자 IP 를 쓴다. 도커망(172.16/12)·127/8 에서 오는 전달 헤더만 믿는다. 이 웹이 `https://api.bookey.site` 로 부르면 요청은 host nginx 를 거쳐 백엔드로 가므로 그대로 동작한다.
- 공개 API 는 `GET /api/v1/public/**`(permitAll) — 토큰 없이 부른다. CORS 에 `https://*.bookey.site` 가 추가됐지만 이 웹은 서버에서만 호출해 CORS 를 타지 않는다.

## 6. 메모리

EC2 1GB 에 JVM·Postgres·Redis 가 이미 올라가 있다. `free -m`·`docker stats` 로 자리를 확인하고, 쓰지 않는 EC2 `admin` 컨테이너가 돌고 있으면 내린다(어드민은 Cloud Run 이 실서비스). 모자라면 스왑 1GB, 또는 이 웹만 Cloud Run(어드민 `deploy-cloud-run.yml` 선례).

## 7. 배포 뒤 확인

```bash
curl -s http://127.0.0.1:3200/health         # {"status":"ok","service":"bookey-web"}
curl -I https://www.bookey.site/              # 200
curl -I https://bookey.site/                  # 301 → https://www.bookey.site/
curl -I http://www.bookey.site/               # 301 → https
curl -s https://www.bookey.site/robots.txt
```

브라우저에서 `/books/<id>`·`/posts/<id>` 를 열어 글이 보이고, DevTools Network 에 `api.bookey.site` 호출이 없는지(서버만 부른다) 확인한다. 검색을 여러 번 해 429 가 방문자별로 걸리는지(전달 헤더 확인) 본다.
