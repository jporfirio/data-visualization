FROM node:23-slim AS base

ENV PNPM_home="/pnpm"
ENV PATH="$PNPM_home:$PATH"
RUN corepack enable

FROM base AS production-env
COPY --from=parent pnpm-lock.yaml /app/
COPY . /app
WORKDIR /app
RUN pnpm install -P
CMD ["pnpm", "start"]
