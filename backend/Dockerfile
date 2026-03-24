FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS development
COPY tsconfig.json ./
COPY src ./src
EXPOSE 3000
CMD ["npx", "ts-node-dev", "--respawn", "--transpile-only", "src/infrastructure/web/server.ts"]

FROM base AS builder
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/infrastructure/web/server.js"]
