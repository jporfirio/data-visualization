FROM node:23-slim AS base

ENV PNPM_home="/pnpm"
ENV PATH="$PNPM_home:$PATH"
RUN corepack enable

FROM base AS development-dependencies-env
COPY . /app
WORKDIR /app
RUN pnpm install

FROM base AS production-dependencies-env
COPY --from=parent pnpm-lock.yaml /app/
COPY ./package.json /app/
WORKDIR /app
RUN pnpm install -P

FROM base AS build-env
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
RUN pnpm run build

FROM base
COPY --from=parent pnpm-lock.yaml /app/
COPY ./package.json /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
WORKDIR /app
CMD ["pnpm", "run", "start"]
