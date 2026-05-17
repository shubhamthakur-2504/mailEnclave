# ───────────────────────────────────────────────
# Stage 1 — Install ALL deps, generate Prisma client & build TS
# ───────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency manifests first (better layer caching)
COPY package.json package-lock.json ./

# Install ALL dependencies (including devDependencies for tsc)
RUN npm ci

# Copy Prisma schema + config and generate the client into src/generated/prisma
# A dummy DATABASE_URL is needed because prisma.config.js reads it; generate does not connect to the DB
COPY prisma ./prisma
COPY prisma.config.js ./
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npx prisma generate

# Copy the rest of the source and compile TypeScript
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ───────────────────────────────────────────────
# Stage 2 — Production image (slim)
# ───────────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

# Copy dependency manifests and install production-only deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy Prisma schema & config (needed at runtime for migrations)
COPY prisma ./prisma
COPY prisma.config.js ./

# Copy compiled JS output (includes the generated Prisma client)
COPY --from=builder /app/dist ./dist

# Default port (overridable via env)
ENV PORT=4000
EXPOSE 4000

# Run the compiled server
CMD ["node", "dist/server.js"]
