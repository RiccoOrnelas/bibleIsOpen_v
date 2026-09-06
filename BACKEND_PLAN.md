# Bible Is Open — Plano do Backend

## 1. Visão geral

Stack escolhida: **FastAPI + Authlib + DynamoDB + Redis**, com imagens em **Cloudflare R2** e
frontend em **Cloudflare Pages**.

```
[ Next.js (estático) ]  →  Cloudflare Pages (CDN grátis)
          │  HTTPS
          ▼
[ FastAPI ]  →  AWS (Lambda/ECS) / Fly.io / Railway   ← NÃO roda no Cloudflare
          │
          ├─ DynamoDB (devocionais, usuários)
          ├─ Redis     (cache da bíblia)
          └─ Cloudflare R2 (imagens, via API S3-compatível)
```

### ⚠️ Ponto de decisão: Python vs Cloudflare

- **Cloudflare Workers/Pages Functions** rodam **JavaScript/WASM**, não Python.
  O "Python Workers" é beta (Pyodide) e **não suporta FastAPI, Authlib, boto3 nem redis-py**.
- Portanto, o backend Python **não pode** ser hospedado no Cloudflare. Ele fica na AWS
  (ou Fly.io/Railway/Render), e o Cloudflare entra na frente como **DNS + CDN + WAF**.
- O que vai pro Cloudflare de graça: o **frontend** (Pages) e as **imagens** (R2).
- R2 é **S3-compatível**, então o FastAPI usa `boto3` normalmente, só mudando o endpoint.

Se você fizer questão de tudo no Cloudflare, aí a stack teria que virar **Workers (JS/TS) +
R2 + D1/KV** — o que abandona Python, Authlib e DynamoDB. Não é o seu caso.

---

## 2. Modelo de dados (DynamoDB)

### Tabela `Devotionals`

| Campo | Tipo | Notas |
|---|---|---|
| `PK` | String | `DEVOTIONAL#<uuid>` |
| `SK` | String | `METADATA` |
| `id` | String | uuid |
| `title` | String | |
| `body` | String | texto (Markdown) |
| `img` | String | URL do R2/Cloudflare |
| `author` | String | |
| `theme` | String | |
| `biblical_text` | String | versículo de apoio |
| `publishedDate` | String | `YYYY-MM-DD` (para o "devocional do dia") |
| `createdAt` / `updatedAt` | String | ISO-8601 |

### Índice secundário (GSI) — acesso por data

Para o "Devocional do Dia" sem scan:

- **GSI1**: `publishedDate` como partition key, `createdAt` como sort key.

### Tabela `Users` (se quiser perfil/registro além do token)

| Campo | Tipo | Notas |
|---|---|---|
| `PK` | String | `USER#<email>` |
| `SK` | String | `PROFILE` |
| `passwordHash` | String | só se usar password login |
| `createdAt` | String | |

> Authlib cuida dos tokens (JWT). O DynamoDB guarda só dados de perfil, não sessões.
> Para refresh/revogação, use um registro de sessão ou assinatura com `jti` + Redis denylist.

---

## 3. Endpoints REST (FastAPI)

### Auth (Authlib — JWT)

| Método | Rota | Descrição |
|---|---|---|
| POST | `/auth/register` | cria usuário |
| POST | `/auth/login` | retorna `access_token` + `refresh_token` |
| POST | `/auth/refresh` | troca refresh por novo access |
| GET | `/auth/me` | perfil do usuário logado (Bearer) |

### Devocionais

| Método | Rota | Descrição |
|---|---|---|
| GET | `/devotionals` | lista (paginação, filtro por `theme`) |
| GET | `/devotionals/daily` | devocional do dia (`publishedDate`) |
| GET | `/devotionals/{id}` | detalhe |
| POST | `/devotionals` | criar (admin/autenticado) |
| PUT | `/devotionals/{id}` | atualizar |
| DELETE | `/devotionals/{id}` | remover |
| POST | `/devotionals/upload` | gera **presigned URL** do R2 |

### Bíblia (com cache Redis)

| Método | Rota | Descrição |
|---|---|---|
| GET | `/bible/books` | lista de livros |
| GET | `/bible/{version}/{book}/{chapter}` | capítulo |
| GET | `/bible/random` | versículo aleatório |

---

## 4. Autenticação — Authlib

Usar **Authlib** com **JWT bearer** (padrão OAuth2/RFC 9068). Esboço:

```python
from authlib.jose import jwt
from authlib.jose.errors import JoseError

# assinar
token = jwt.encode({"alg": "RS256", "kid": "..."}, payload, private_key).decode()

# verificar
claims = jwt.decode(token, public_key)
claims.validate_exp()
```

- `access_token` curto (15 min), `refresh_token` longo (7–30 dias).
- Para revogação de refresh token: guardar `jti` no **Redis** com TTL e checar no `/auth/refresh`.

---

## 5. Cache da Bíblia — Redis (cache-aside)

O texto bíblico é imutável por versão → cache agressivo.

```python
import redis
import json

r = redis.Redis.from_url(os.environ["REDIS_URL"], decode_responses=True)

def get_chapter(version: str, book: str, chapter: int):
    key = f"bible:{version}:{book}:{chapter}"
    cached = r.get(key)
    if cached:
        return json.loads(cached)

    data = biblia_api.fetch(version, book, chapter)   # chamada externa
    r.setex(key, 60 * 60 * 24 * 7, json.dumps(data))  # TTL 7 dias
    return data
```

- A primeira requisição de um capítulo "esquenta" o cache (seu "CDN" interno).
- Capítulos populares ficam em memória; raramente batem na API externa de novo.

---

## 6. Imagens — Cloudflare R2 + presigned upload

O DynamoDB guarda só a **URL** (campo `img`). O binário vai pro R2.

### Por que R2 (e não S3)?

- **Egress grátis** (S3 cobra saída de dados) → CDN de imagens sem custo.
- **S3-compatível** → `boto3` funciona apontando pro endpoint do R2.

### Fluxo de upload

```
1. Cliente  → POST /devotionals/upload   → FastAPI gera presigned URL (PUT) no R2
2. Cliente  → PUT direto no R2 (com a URL assinada, sem passar pelo servidor)
3. Cliente  → POST /devotionals          → salva { ..., img: "https://cdn.../devotionals/<id>.jpg" }
```

Esboço (FastAPI + boto3 apontando pro R2):

```python
import boto3
from botocore.config import Config

s3 = boto3.client(
    "s3",
    endpoint_url=os.environ["R2_ENDPOINT"],       # https://<account>.r2.cloudflarestorage.com
    aws_access_key_id=os.environ["R2_ACCESS_KEY"],
    aws_secret_access_key=os.environ["R2_SECRET_KEY"],
    config=Config(signature_version="s3v4", region_name="auto"),
)

url = s3.generate_presigned_url(
    "put_object",
    Params={"Bucket": "bible-is-open", "Key": f"devotionals/{image_id}.jpg",
            "ContentType": "image/jpeg"},
    ExpiresIn=600,  # 10 min
)
```

No DynamoDB, o `img` recebe a URL pública: `https://cdn.seudominio.com/devotionals/<id>.jpg`
(domínio customizado + cache configurado no Cloudflare em cima do R2).

---

## 7. Próximos passos

1. Subir o FastAPI na AWS (ou Fly.io) com DNS/CND via Cloudflare.
2. Criar as tabelas DynamoDB + GSI e o bucket R2.
3. Configurar Authlib (JWT) e o cache Redis.
4. Ajustar o frontend: trocar `fetch('/api/...')` por `NEXT_PUBLIC_API_URL`.
5. Build estático do Next (`output: 'export'`) e deploy no Cloudflare Pages.
