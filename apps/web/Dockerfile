FROM node:20-alpine AS build
WORKDIR /repo

COPY package.json package-lock.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages/ui/package.json packages/ui/package.json
RUN npm ci

COPY turbo.json ./
COPY apps/web apps/web
COPY packages/ui packages/ui

ARG VITE_API_BASE_URL=/api
ARG VITE_QA_AGENT_API_BASE_URL=/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_QA_AGENT_API_BASE_URL=$VITE_QA_AGENT_API_BASE_URL

RUN npx turbo build --filter=web

FROM nginx:1.27-alpine

COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/apps/web/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
