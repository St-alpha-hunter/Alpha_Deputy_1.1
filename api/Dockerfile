# LEGACY / for reference (do not use in v0)
# ---------------- Build 阶段 ----------------
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# 复制 csproj 并还原依赖
COPY *.csproj ./
RUN dotnet restore

# 复制全部代码并发布
COPY . .
RUN dotnet publish -c Release -o /app /p:UseAppHost=false

# ---------------- Runtime 阶段 ----------------
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

# 拷贝编译好的文件
COPY --from=build /app ./

# 设置监听端口
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

# 启动命令（注意 DLL 名与 csproj 名一致）
ENTRYPOINT ["dotnet", "api.dll"]
