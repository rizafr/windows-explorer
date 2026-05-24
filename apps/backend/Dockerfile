FROM oven/bun:1.2-alpine AS deps

WORKDIR /app

COPY package.json bun.lock ./
COPY apps/backend/package.json apps/backend/package.json
COPY apps/frontend/package.json apps/frontend/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN bun install --frozen-lockfile

FROM oven/bun:1.2-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY package.json bun.lock ./
COPY apps/backend ./apps/backend
COPY packages/shared ./packages/shared

EXPOSE 3001

CMD ["bun", "run", "--cwd", "apps/backend", "start"]
