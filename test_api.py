import pytest
from fastapi.testclient import TestClient
from src.main import app
from src.services.application_service import service

client = TestClient(app)

@pytest.fixture(autouse=True)
def isolated_db(tmp_path):
    original = service.db_path
    service.db_path = str(tmp_path / "test.db")
    service.init_db()
    yield
    service.db_path = original

def register(email="student@example.com", password="strong-password-123"):
    response = client.post("/api/auth/register", json={"email": email, "password": password})
    assert response.status_code == 201, response.text
    return response.json()["access_token"]

def auth(token): return {"Authorization": f"Bearer {token}"}

def test_health():
    response = client.get("/health")
    assert response.status_code == 200 and response.json()["status"] == "ok"

def test_auth_required_and_register_login():
    assert client.get("/api/applications").status_code == 401
    token = register()
    login = client.post("/api/auth/login", json={"email":"student@example.com", "password":"strong-password-123"})
    assert login.status_code == 200
    assert client.get("/api/auth/me", headers=auth(token)).json()["email"] == "student@example.com"

def test_create_list_stats_and_persistence():
    token = register(); headers = auth(token)
    payload = {"company":"Acme", "role":"Junior Python Developer", "location":"Pune", "status":"Applied", "applied_date":"2026-10-28", "notes":"Follow up next week"}
    created = client.post("/api/applications", json=payload, headers=headers)
    assert created.status_code == 201 and created.json()["company"] == "Acme"
    assert client.get("/api/applications", headers=headers).json()[0]["role"] == "Junior Python Developer"
    assert client.get("/api/stats", headers=headers).json()["total"] == 1
    # A new service instance reads the same SQLite file, proving data is persistent.
    from src.services.application_service import ApplicationService
    another = ApplicationService(service.db_path)
    assert len(another.list(1)) == 1

def test_user_data_isolation_and_update_delete():
    token1 = register("one@example.com"); token2 = register("two@example.com")
    payload = {"company":"Acme", "role":"Developer", "location":"Remote", "status":"Wishlist", "notes":""}
    created = client.post("/api/applications", json=payload, headers=auth(token1)).json()
    payload["status"] = "Interview"
    updated = client.put(f"/api/applications/{created['id']}", json=payload, headers=auth(token1))
    assert updated.status_code == 200 and updated.json()["status"] == "Interview"
    assert client.get(f"/api/applications/{created['id']}", headers=auth(token2)).status_code == 404
    assert client.delete(f"/api/applications/{created['id']}", headers=auth(token1)).status_code == 204

def test_validation_and_csv_export():
    token = register(); headers = auth(token)
    assert client.post("/api/applications", json={"company":"", "role":"Developer"}, headers=headers).status_code == 422
    payload = {"company":"Acme", "role":"Developer", "status":"Applied"}
    client.post("/api/applications", json=payload, headers=headers)
    csv_response = client.get("/api/applications/export.csv", headers=headers)
    assert csv_response.status_code == 200 and "Acme" in csv_response.text

def test_duplicate_email_and_bad_login():
    register()
    assert client.post("/api/auth/register", json={"email":"student@example.com", "password":"another-password"}).status_code == 409
    assert client.post("/api/auth/login", json={"email":"student@example.com", "password":"wrong-password"}).status_code == 401
