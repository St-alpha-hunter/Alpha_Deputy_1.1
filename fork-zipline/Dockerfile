# LEGACY / for reference (do not use in v0)
FROM python:3.11-slim

ENV PYTHONPATH=/app/new_engine_starter/src

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl build-essential && \
    rm -rf /var/lib/apt/lists/*

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app/new_engine_starter/src

COPY new_engine_starter/src/requirements.txt ./requirements.txt
COPY new_engine_starter/src ./ 

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]