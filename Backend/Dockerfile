
# ==========================================
# Stage 1: Build TypeScript backend
# ==========================================
FROM node:20-bookworm-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY src/ ./src/

RUN npm run build

# ==========================================
# Stage 2: Production runtime
# ==========================================
FROM node:20-bookworm-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Install MongoDB runtime dependency
RUN apt-get update && \
    apt-get install -y --no-install-recommends libcurl4 && \
    rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist

EXPOSE 5000

USER node

CMD ["node", "dist/server.js"]
