# Bookey Web

Bookey의 별도 웹 프로젝트입니다. Next.js, React, TypeScript를 사용합니다.

```sh
npm ci
npm run dev
```

개발 주소: http://localhost:3200

## 자동 배포

`main` 푸시 시 GitHub Actions가 lint, build, typecheck를 통과한 후 기존 Bookey EC2에 배포합니다.
Docker Compose 프로젝트 `bookey-web`은 기존 관리자/백엔드 Compose와 독립적으로 실행됩니다.
배포 경로는 `/opt/bookey-web`, 공개 포트는 `3200`, 상태 확인 경로는 `/health`입니다.

Repository Secrets:

| 이름 | 값 |
| --- | --- |
| `EC2_HOST` | EC2 IP 또는 DNS |
| `EC2_USER` | `ec2-user` |
| `EC2_SSH_KEY` | EC2 접속용 private key |
| `EC2_SSH_KNOWN_HOSTS` | 검증된 서버 SSH host key의 known_hosts 항목 |

서버에는 Docker와 Compose가 필요합니다. 배포 사용자가 `/opt/bookey-web`에 쓸 수 있어야 합니다.
GitHub Actions는 OIDC로 `bookey-web-github-deploy` IAM role을 사용해 실행 중인 runner IP에만 임시 SSH 접근을 허용하고, 배포 후 제거합니다.
Role의 신뢰 정책과 권한 정책은 `infra/github-trust.json`, `infra/github-policy.json`에 있습니다.
웹 접속을 위해 보안 그룹에서 TCP 3200을 허용해야 합니다.
SSH host key는 신뢰할 수 있는 서버 접근 경로로 확인한 후 등록합니다.
GitHub Actions 화면에서 `Deploy web to EC2`를 수동 실행할 수도 있습니다.

기본 화면과 `/health`만 제공하는 초기 프로젝트이며, 실제 웹 기능은 이후 추가합니다.
