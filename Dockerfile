# ----------------------------------------------------
# Stage 1: Build Stage
# ----------------------------------------------------
FROM node:22-alpine AS builder

WORKDIR /app

# Install OpenSSL & libc6-compat for Prisma engine on Alpine
RUN apk add --no-cache openssl libc6-compat

# Copy package manifests and Prisma schema first for layer caching
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies including devDependencies for build
RUN npm install

# Generate Prisma Client
RUN npx prisma generate

# Copy the rest of the application source
COPY . .

# Build the NestJS project
RUN npm run build

# ----------------------------------------------------
# Stage 2: Production Runner
# ----------------------------------------------------
FROM node:22-alpine AS runner

WORKDIR /app

# Install runtime dependencies for Prisma and healthcheck
RUN apk add --no-cache openssl libc6-compat curl

ENV NODE_ENV=production

# Copy package manifests
COPY package*.json ./

# Copy built artifacts and Prisma files from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Ensure upload directory exists
RUN mkdir -p /app/uploads

EXPOSE 3000

# Push database schema and start the production application
CMD ["sh", "-c", "npx prisma db push --skip-generate && node dist/main.js"]
