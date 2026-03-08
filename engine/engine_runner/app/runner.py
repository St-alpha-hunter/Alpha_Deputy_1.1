import os
import time
import redis

REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
QUEUE_KEY = os.getenv("QUEUE_KEY", "backtest:queue")

r = redis.from_url(REDIS_URL, decode_responses=True)

def main():
    print("[runner] started. waiting jobs...")
    while True:
        # BRPOP 阻塞等待
        item = r.brpop(QUEUE_KEY, timeout=5)
        if not item:
            continue
        _, task_id = item
        print(f"[runner] got task_id={task_id}, mock running...")
        time.sleep(2)
        print(f"[runner] done task_id={task_id}")

if __name__ == "__main__":
    main()
