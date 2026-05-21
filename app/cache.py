import redis
import json
import os
from dotenv import load_dotenv

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

try:
    client = redis.from_url(REDIS_URL, decode_responses=True)
    client.ping()
    REDIS_AVAILABLE = True
    print("[OK] Redis connecte")
except Exception:
    REDIS_AVAILABLE = False
    print("[WARN] Redis indisponible -- cache desactive")

def get_cache(key: str):
    """Récupère une valeur depuis le cache Redis."""
    if not REDIS_AVAILABLE:
        return None
    try:
        data = client.get(key)
        if data:
            return json.loads(data)
        return None
    except Exception:
        return None

def set_cache(key: str, value: dict, ttl: int = 300):
    """
    Stocke une valeur dans Redis.
    ttl = durée de vie en secondes (défaut 5 minutes)
    """
    if not REDIS_AVAILABLE:
        return
    try:
        client.setex(key, ttl, json.dumps(value, default=str))
    except Exception:
        pass

def delete_cache(key: str):
    """Supprime une clé du cache."""
    if not REDIS_AVAILABLE:
        return
    try:
        client.delete(key)
    except Exception:
        pass