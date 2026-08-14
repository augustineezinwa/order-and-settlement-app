# syntax=docker/dockerfile:1

FROM node:22-alpine AS backend-deps
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json ./
RUN npm ci
COPY shared /app/shared
COPY backend/tsconfig.json backend/drizzle.config.ts ./
COPY backend/src ./src
COPY backend/drizzle ./drizzle

FROM node:22-alpine AS frontend-build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY next.config.ts tsconfig.json postcss.config.mjs components.json ./
COPY public ./public
COPY src ./src
COPY shared ./shared
ENV BACKEND_URL=http://127.0.0.1:8787
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NODE_PATH=/app/backend/node_modules

COPY --from=backend-deps /app/backend ./backend
COPY --from=backend-deps /app/shared ./shared
COPY --from=frontend-build /app/.next/standalone ./
COPY --from=frontend-build /app/.next/static ./.next/static
COPY --from=frontend-build /app/public ./public
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh && apk add --no-cache curl

EXPOSE 3000
CMD ["./docker-entrypoint.sh"]
