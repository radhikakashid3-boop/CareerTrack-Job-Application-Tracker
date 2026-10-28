from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from src.api.routes import router
from src.services.application_service import service
from src.utils.settings import CORS_ORIGINS
import base64, hashlib, hmac, json, time

app = FastAPI(title="CareerTrack API", version="2.0.0", description="A secure job-application tracker with per-user data, analytics, CSV export, and WebSocket notifications.")
app.add_middleware(CORSMiddleware, allow_origins=[o.strip() for o in CORS_ORIGINS], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.include_router(router, prefix="/api")

@app.get("/health", tags=["health"])
def health(): return {"status":"ok", "service":"CareerTrack API", "database":"sqlite"}

@app.websocket("/ws/notifications")
async def notifications(websocket: WebSocket):
    token = websocket.query_params.get("token", "")
    try:
        header, payload, signature = token.split(".")
        from src.utils.settings import SECRET_KEY
        expected = base64.urlsafe_b64encode(hmac.new(SECRET_KEY.encode(), f"{header}.{payload}".encode(), hashlib.sha256).digest()).decode().rstrip("=")
        if not hmac.compare_digest(signature, expected): raise ValueError("bad signature")
        data = json.loads(base64.urlsafe_b64decode(payload + "=" * (-len(payload) % 4)))
        found_user = service.get_user_by_email(data["email"])
        if int(data["exp"]) < int(time.time()) or not found_user or found_user["id"] != int(data["sub"]): raise ValueError("expired")
    except Exception:
        await websocket.close(code=1008, reason="Invalid token"); return
    await websocket.accept()
    try:
        await websocket.send_json({"type":"connected", "message":"CareerTrack live notifications connected"})
        while True:
            # A lightweight heartbeat keeps the connection alive. Client actions refresh via REST.
            message = await websocket.receive_text()
            if message == "ping": await websocket.send_json({"type":"pong"})
    except WebSocketDisconnect:
        pass
