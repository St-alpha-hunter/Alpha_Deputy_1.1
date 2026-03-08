FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# 1. 只拷贝 csproj（加速 restore）
COPY *.csproj ./
RUN dotnet restore

# 2. 拷贝剩余源码（此时 . = api/）
COPY . .

# 3. publish
RUN dotnet publish -c Release -o /app/publish --no-restore


FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "api.dll"]
