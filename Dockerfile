# Stage 1: Build static web assets
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Production (Lightweight Caddy Web Server ~30MB)
FROM caddy:2-alpine
COPY --from=build /app/dist /srv

# Configure Caddy for SPA fallback routing on port 4173
RUN printf ':4173 {\n  root * /srv\n  file_server\n  try_files {path} {path}/ /index.html\n}\n' > /etc/caddy/Caddyfile

EXPOSE 4173

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]