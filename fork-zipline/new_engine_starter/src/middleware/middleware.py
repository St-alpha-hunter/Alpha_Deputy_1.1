from fastapi.middleware.cors import CORSMiddleware

def setup_middleware(app):
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173/"],  # 或指定前端地址
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )