# Production image. Data (database, uploads, private files) lives in the /data volume.
FROM node:22-bookworm-slim AS build
# Build tools for the SQLite driver (compiled from source when no prebuilt binary matches)
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npx next build && npm prune --omit=dev

FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production DATA_DIR=/data PORT=3000
COPY --from=build /app /app
# Hosts such as Railway mount the data volume owned by root, so the app runs as root inside the container.
RUN mkdir -p /data
EXPOSE 3000
CMD ["sh", "-c", "node scripts/bootstrap-admin.mjs && exec npx next start -p ${PORT:-3000}"]
