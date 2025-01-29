FROM node:20

RUN npm install -g pnpm

ENV SKIP_ENV_VALIDATION=true
ENV NEXT_TELEMETRY_DISABLED=1
ENV OPERATION_TIMEOUT "100000"
ENV REDIS_CACHE_ENDPOINT "redis"
ENV REDIS_CACHE_PORT "6379"

ENV STORE_URL "http://localhost:3000"


WORKDIR /var/app
COPY package.json /var/app/package.json
# COPY bun.lockb /var/app/bun.lockb
COPY .npmrc /var/app/.npmrc
RUN pnpm install
COPY ./ /var/app
RUN touch .env
RUN pnpm run build

EXPOSE 3000
ENV NODE_ENV "production"
CMD [ "pnpm", "start" ]