# Windows-friendly Makefile (cmd.exe)
# 用法：
#   make up        # 一键启动（分别开3个窗口）
#   make engine    # 单独启动 python engine
#   make backend   # 单独启动 dotnet 后端
#   make frontend  # 单独启动前端
#   make install   # 安装依赖（npm + dotnet）

.PHONY: up dev engine backend frontend install install-frontend install-backend

# ========= 可按需改这里 =========
# ENGINE_DIR := fork-zipline\new_engine_starter\src
# ENGINE_ENV := zipenv
# ENGINE_CMD := uvicorn main:app --reload

BACKEND_DIR := api
BACKEND_CMD := dotnet run

# 你的 package.json 在项目根目录（截图左侧能看到），所以前端不要 cd src
FRONTEND_DIR := src
FRONTEND_CMD := npm run dev
# =================================

install: install-frontend install-backend

install-frontend:
	npm install

install-backend:
	cd /d $(BACKEND_DIR) && dotnet restore

# 一键启动：分别打开三个 cmd 窗口，各跑各的
up dev:
# 	start "alpha-engine"  cmd /k "cd /d $(ENGINE_DIR) && call conda activate $(ENGINE_ENV) && $(ENGINE_CMD)"
	start "alpha-backend" cmd /k "cd /d $(BACKEND_DIR) && $(BACKEND_CMD)"
	start "alpha-frontend" cmd /k "cd /d $(FRONTEND_DIR) && $(FRONTEND_CMD)"

# 单独启动（在当前窗口跑，适合调试）
# engine:
# 	cd /d $(ENGINE_DIR) && call conda activate $(ENGINE_ENV) && $(ENGINE_CMD)

backend:
	cd /d $(BACKEND_DIR) && $(BACKEND_CMD)

frontend:
	cd /d $(FRONTENDkeDIR) && $(FRONTEND_CMD)