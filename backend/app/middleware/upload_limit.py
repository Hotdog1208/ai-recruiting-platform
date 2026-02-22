from starlette.middleware.base import BaseHTTPMiddleware
  # type: ignore  # pyre-ignore\nfrom starlette.requests import Request
  # type: ignore  # pyre-ignore\nfrom starlette.responses import JSONResponse
  # type: ignore  # pyre-ignore\n
MAX_REQ_BODY_SIZE = 15 * 1024 * 1024  # 15 MB

class LimitUploadSizeMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        content_length_str = request.headers.get("content-length")
        if content_length_str:
            try:
                content_length = int(content_length_str)
                if content_length > MAX_REQ_BODY_SIZE:
                    return JSONResponse(
                        status_code=413,
                        content={"error": {"code": "payload_too_large", "message": "Request body too large. Max 15MB allowed."}},
                    )
            except ValueError:
                pass
        
        return await call_next(request)
