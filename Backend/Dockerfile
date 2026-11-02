# ==========================================
# Stage 1: Build the TypeScript backend
# ==========================================
FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Copy dependency specifications
COPY package*.json ./

# Install all dependencies (including devDependencies needed for build)
RUN npm install

# Copy source code and TypeScript config
COPY tsconfig.json ./
COPY src/ ./src/

# Compile TypeScript into dist/
RUN npm run build

# ==========================================
# Stage 2: Production runtime environment
# ==========================================
FROM node:20-bookworm-slim AS runner

WORKDIR /app

# Set production environment defaults
ENV NODE_ENV=production
ENV PORT=5000

# Install production dependencies only
COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force

# Copy compiled JavaScript output from builder stage
COPY --from=builder /app/dist ./dist

# Expose the API server port
EXPOSE 5000

# Use non-root node user for container security
USER node

# Start the application
CMD ["node", "dist/server.js"]

