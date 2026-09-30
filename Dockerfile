# Stage 1: Build static web assets
FROM node:22-alpine AS build
WORKDIR /app

# Install dependencies with caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code and build
COPY . .
ARG VITE_BASE_PATH=/livy-ui/
ENV VITE_BASE_PATH=${VITE_BASE_PATH}
RUN npm run build

# Stage 2: Production (Lightweight Caddy Web Server ~30MB)
FROM caddy:2-alpine

# Copy built assets
COPY --from=build /app/dist /srv

# Create symlink so both / and /livy-ui/ subpaths resolve properly
RUN ln -s /srv /srv/livy-ui

# Configure Caddy for SPA fallback routing and compression on port 4173
RUN printf ':4173 {\n\
  root * /srv\n\
  encode gzip zstd\n\
  file_server\n\
\n\
  handle_path /livy-ui* {\n\
    root * /srv\n\
    file_server\n\
    try_files {path} {path}/ /index.html\n\
  }\n\
\n\
  handle {\n\
    try_files {path} {path}/ /index.html\n\
  }\n\
}\n' > /etc/caddy/Caddyfile

EXPOSE 4173

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]