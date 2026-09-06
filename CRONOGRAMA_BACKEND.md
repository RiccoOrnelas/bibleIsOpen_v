# Cronograma — Backend Bible Is Open

Stack: FastAPI + Authlib + DynamoDB + Redis + Cloudflare R2, empacotado em Docker.

## Resumo das fases

| Fase | Nome | Duração estimada |
|---|---|---|
| 0 | Fundação e ambiente | 2–3 dias |
| 1 | Base do FastAPI | 2–3 dias |
| 2 | DynamoDB (devocionais) | 3–4 dias |
| 3 | Autenticação (Authlib) | 3–4 dias |
| 4 | Bíblia + Redis | 2–3 dias |
| 5 | Imagens (R2) | 1–2 dias |
| 6 | Integração frontend | 2–3 dias |
| 7 | Deploy | 2–3 dias |
| 8 | Monitoramento e finalização | 1–2 dias |

---

## Fase 0 — Fundação e ambiente

- [ ] Criar repositório do backend (separado do frontend)
- [ ] Definir estrutura de pastas (`app/`, `routers/`, `models/`, `services/`, `tests/`)
- [ ] Configurar `pyproject.toml` com dependências (fastapi, uvicorn, boto3, redis, authlib, pydantic-settings)
- [ ] Criar `.env` e `.env.example` (chaves, endpoints, URLs)
- [ ] Criar `Dockerfile` (base `python:3.12-slim` + uvicorn)
- [ ] Criar `docker-compose.yml` com Redis + DynamoDB Local
- [ ] Subir o ambiente com `docker compose up` e validar
- [ ] Configurar lint/formatação (ruff) e git hooks

## Fase 1 — Base do FastAPI

- [ ] Criar `main.py` com `FastAPI()` e health check (`GET /health`)
- [ ] Configurar `Settings` via `pydantic-settings` (leitura do `.env`)
- [ ] Organizar routers (`auth`, `devotionals`, `bible`, `upload`)
- [ ] Tratamento global de erros e logs estruturados
- [ ] Habilitar CORS para o domínio do frontend
- [ ] Validar `/docs` (Swagger) funcionando no container

## Fase 2 — DynamoDB (devocionais)

- [ ] Criar tabela `Devotionals` no DynamoDB Local (via script/init)
- [ ] Criar GSI por `publishedDate` (acesso ao "devocional do dia")
- [ ] Escrever camada de repositório com `boto3`
- [ ] Implementar `GET /devotionals` (listagem + filtro por tema)
- [ ] Implementar `GET /devotionals/{id}`
- [ ] Implementar `GET /devotionals/daily`
- [ ] Implementar `POST/PUT/DELETE /devotionals` (protegidos por auth)
- [ ] Escrever testes de integração usando DynamoDB Local

## Fase 3 — Autenticação (Authlib)

- [ ] Configurar Authlib com JWT (RS256, par de chaves)
- [ ] Implementar `POST /auth/register`
- [ ] Implementar `POST /auth/login` (retorna access + refresh token)
- [ ] Implementar `POST /auth/refresh`
- [ ] Implementar `GET /auth/me`
- [ ] Criar dependência/middleware de proteção de rotas (Bearer)
- [ ] Implementar denylist de refresh tokens no Redis (revogação)
- [ ] Testar fluxo completo (register → login → acessar rota protegida)

## Fase 4 — Bíblia + Redis

- [ ] Integrar com a API externa da bíblia (client HTTP, ex. httpx)
- [ ] Implementar `GET /bible/books`
- [ ] Implementar `GET /bible/{version}/{book}/{chapter}`
- [ ] Implementar `GET /bible/random`
- [ ] Aplicar cache-aside no Redis (`bible:{version}:{book}:{chapter}`, TTL 7 dias)
- [ ] Adicionar timeout/retry na chamada externa
- [ ] Testar warm-up do cache e invalidação

## Fase 5 — Imagens (Cloudflare R2)

- [ ] Criar bucket no R2 e gerar chaves de acesso
- [ ] Configurar `boto3` apontando pro endpoint do R2
- [ ] Implementar `POST /devotionals/upload` (presigned URL)
- [ ] Configurar domínio customizado + cache no Cloudflare
- [ ] Testar upload direto do cliente e salvar URL no DynamoDB

## Fase 6 — Integração frontend

- [ ] Adicionar `NEXT_PUBLIC_API_URL` no frontend
- [ ] Trocar `fetch('/api/...')` por URL absoluta do backend
- [ ] Configurar `output: 'export'` e `images.unoptimized` no `next.config.ts`
- [ ] Remover rotas `/api` do frontend (agora vivem no backend)
- [ ] Testar fluxo ponta a ponta (login + devocional do dia + bíblia + upload)
- [ ] Validar CORS e build estático

## Fase 7 — Deploy

- [ ] Escolher plataforma do container (Fly.io / Railway / AWS ECS)
- [ ] Publicar imagem Docker com secrets via variáveis de ambiente
- [ ] Provisionar DynamoDB e Redis de produção
- [ ] Publicar bucket R2 e validar domínio
- [ ] Deploy do frontend no Cloudflare Pages
- [ ] Configurar DNS/CDN/WAF no Cloudflare
- [ ] Rodar smoke test em produção

## Fase 8 — Monitoramento e finalização

- [ ] Configurar logs e alertas básicos
- [ ] Habilitar backup do DynamoDB (on-demand)
- [ ] Revisão de segurança (rate limit, validação, OWASP top 10)
- [ ] Documentar endpoints no `/docs` e README
- [ ] Revisar limites dos free tiers (Cloudflare, DynamoDB, Redis)
