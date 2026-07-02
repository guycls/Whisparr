# syntax=docker/dockerfile:1

# ==============================================================================
# Stage 1: Frontend Builder
# ==============================================================================
FROM node:20-alpine AS frontend-builder
WORKDIR /src

COPY package.json yarn.lock .yarnrc* ./
RUN yarn install --frozen-lockfile

COPY frontend/ ./frontend/
COPY tsconfig.json ./
COPY Logo/ ./Logo/
RUN yarn run build --env production

# ==============================================================================
# Stage 2: Backend Builder
# ==============================================================================
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS backend-builder
WORKDIR /src

ARG DOTNET_FRAMEWORK=net10.0
ARG DOTNET_RUNTIME=linux-musl-x64
ARG DOTNET_PUBLISH_PROJECT=src/NzbDrone.Console/Whisparr.Console.csproj

COPY src/ ./src/
COPY Logo/ ./Logo/

RUN rm -rf _output _tests _temp /app/bin && mkdir -p /app/bin && \
    dotnet publish "${DOTNET_PUBLISH_PROJECT}" \
    -c Release \
    -f "${DOTNET_FRAMEWORK}" \
    -r "${DOTNET_RUNTIME}" \
    --self-contained true \
    -p:EnableAnalyzers=false \
    -p:RunAnalyzers=false \
    -p:EnforceCodeStyleInBuild=false \
    -p:TreatWarningsAsErrors=false \
    -p:NuGetAudit=false \
    -p:GenerateDocumentationFile=false \
    -o /app/bin && \
    dotnet publish src/NzbDrone.Mono/Whisparr.Mono.csproj \
    -c Release \
    -f "${DOTNET_FRAMEWORK}" \
    -r "${DOTNET_RUNTIME}" \
    --no-self-contained \
    -p:EnableAnalyzers=false \
    -p:RunAnalyzers=false \
    -p:EnforceCodeStyleInBuild=false \
    -p:TreatWarningsAsErrors=false \
    -p:NuGetAudit=false \
    -p:GenerateDocumentationFile=false \
    -o /app/bin

# ==============================================================================
# Stage 3: Runtime (hotio base + s6-overlay, NAS-friendly)
# Base image pin: docker/meta.json (upstream_image + upstream_tag_sha)
# ==============================================================================
FROM ghcr.io/hotio/base:alpinevpn-be6069a
EXPOSE 6969

ARG IMAGE_STATS=eyJhcHAiOiJ3aGlzcGFpciIsImltYWdlIjoid2hpc3BhcnI6bG9jYWwiLCJyZXZpc2lvbiI6ImxvY2FsIiwidmVyc2lvbiI6IjAuMC4wLWxvY2FsIn0=
ENV IMAGE_STATS=${IMAGE_STATS} WEBUI_PORTS="6969/tcp"

RUN apk add --no-cache libintl sqlite-libs icu-libs

ARG VERSION=0.0.0-local
ARG VERSION_BRANCH=develop
ARG PACKAGE_VERSION=${VERSION}

COPY --from=backend-builder /app/bin/ "${APP_DIR}/bin/"
COPY --from=frontend-builder /src/_output/UI "${APP_DIR}/bin/UI"

RUN rm -rf "${APP_DIR}/bin/Whisparr.Update" && \
    if [ -f "${APP_DIR}/bin/ffprobe" ]; then chmod +x "${APP_DIR}/bin/ffprobe"; fi && \
    chmod +x "${APP_DIR}/bin/Whisparr" && \
    echo -e "PackageVersion=${PACKAGE_VERSION}\nPackageAuthor=[local-build](https://github.com/Whisparr/Whisparr)\nUpdateMethod=Docker\nBranch=${VERSION_BRANCH}" > "${APP_DIR}/package_info" && \
    chmod -R u=rwX,go=rX "${APP_DIR}"

COPY docker/root/ /
RUN find /etc/s6-overlay/s6-rc.d -name "run*" -execdir chmod +x {} +
