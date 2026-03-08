FROM python:3.11-slim
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PIP_NO_CACHE_DIR=1

COPY engine/engine_runner/requirements.txt /app/requirements.txt
RUN pip install -r /app/requirements.txt

COPY engine/engine_runner/app /app/app
CMD ["python", "-u", "app/runner.py"]
