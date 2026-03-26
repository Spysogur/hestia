# ── Build stage ─────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy solution + project files first (better layer caching)
COPY Hestia.sln ./
COPY src/Hestia.Domain/Hestia.Domain.csproj src/Hestia.Domain/
COPY src/Hestia.Application/Hestia.Application.csproj src/Hestia.Application/
COPY src/Hestia.Infrastructure/Hestia.Infrastructure.csproj src/Hestia.Infrastructure/
COPY src/Hestia.API/Hestia.API.csproj src/Hestia.API/
COPY src/Hestia.Tests/Hestia.Tests.csproj src/Hestia.Tests/

RUN dotnet restore

# Copy everything and publish
COPY . .
RUN dotnet publish src/Hestia.API/Hestia.API.csproj -c Release -o /app/publish --no-restore

# ── Runtime stage ──────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:5000
ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 5000

ENTRYPOINT ["dotnet", "Hestia.API.dll"]
