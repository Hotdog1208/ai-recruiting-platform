"""In-memory rate limiting. Use Redis in production for multi-instance."""
import time
from collections import defaultdict
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

# ip -> list of timestamps
_buckets: dict[str, list[float]] = defaultdict(list)
# 100 requests per minute per IP for general API
GENERAL_RPM = 100
# 10 per minute for auth and upload
STRICT_RPM = 10
STRICT_PATHS = ("/auth/", "/resume")  # auth and resume upload


def _get_client_ip(request: Request) -> str:
    return request.client.host if request.client else "unknown"


def _is_strict_path(path: str) -> bool:
    return any(path.startswith(p) or p in path for p in STRICT_PATHS)


def _check_limit(ip: str, path: str) -> bool:
    now = time.time()
    window = 60.0  # 1 minute
    limit = STRICT_RPM if _is_strict_path(path) else GENERAL_RPM
    bucket = _buckets[ip]
    bucket[:] = [t for t in bucket if now - t < window]
    if len(bucket) >= limit:
        return False
    bucket.append(now)
    return True


class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.url.path in ("/health", "/debug/config"):
            return await call_next(request)
        ip = _get_client_ip(request)
        if not _check_limit(ip, request.url.path):
            return JSONResponse(
                status_code=429,
                content={"error": {"code": "rate_limit", "message": "Too many requests. Try again later."}},
            )
        return await call_next(request)
