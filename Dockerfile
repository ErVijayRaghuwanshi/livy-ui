# Stage 0: Fetch source from Git
FROM alpine/git AS git-fetch
WORKDIR /src
ARG GIT_REPO=https://github.com/ErVijayRaghuwanshi/livy-ui.git
ARG GIT_BRANCH=main
RUN git clone --branch ${GIT_BRANCH} --single-branch --depth 1 ${GIT_REPO} .

# Stage 1: Build
FROM node:22-alpine AS build
WORKDIR /app
COPY --from=git-fetch /src/package.json ./
RUN npm install
COPY --from=git-fetch /src .
RUN npm run build

# Stage 2: Production
FROM node:22-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY package.json vite.config.js ./
EXPOSE 4173
CMD ["npx", "vite", "preview", "--host", "0.0.0.0", "--port", "4173"]

