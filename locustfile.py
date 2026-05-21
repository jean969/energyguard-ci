from locust import HttpUser, task, between
import random

class EnergyGuardUser(HttpUser):
    wait_time = between(1, 2)
    host = "http://localhost:8001"

    # ─── Tests GET ───────────────────────────────────────

    @task(3)
    def test_optimize(self):
        with self.client.get("/optimize/", catch_response=True) as response:
            if response.elapsed.total_seconds() * 1000 > 500:
                response.failure(f"Trop lent : {response.elapsed.total_seconds() * 1000:.0f}ms")
            elif response.status_code == 200:
                response.success()

    @task(3)
    def test_maintenance(self):
        with self.client.get("/maintenance/", catch_response=True) as response:
            if response.elapsed.total_seconds() * 1000 > 500:
                response.failure(f"Trop lent : {response.elapsed.total_seconds() * 1000:.0f}ms")
            elif response.status_code == 200:
                response.success()

    @task(3)
    def test_mini_grid(self):
        with self.client.get("/mini-grid/", catch_response=True) as response:
            if response.elapsed.total_seconds() * 1000 > 500:
                response.failure(f"Trop lent : {response.elapsed.total_seconds() * 1000:.0f}ms")
            elif response.status_code == 200:
                response.success()

    @task(3)
    def test_impact(self):
        with self.client.get("/impact/", catch_response=True) as response:
            if response.elapsed.total_seconds() * 1000 > 500:
                response.failure(f"Trop lent : {response.elapsed.total_seconds() * 1000:.0f}ms")
            elif response.status_code == 200:
                response.success()

    @task(1)
    def test_health(self):
        with self.client.get("/health", catch_response=True) as response:
            if response.status_code == 200:
                response.success()

    # ─── Tests POST ──────────────────────────────────────

    @task(2)
    def test_predict(self):
        payload = {
            "zone_id": random.randint(1, 7),
            "temperature": round(random.uniform(25.0, 38.0), 1),
            "ensoleillement": round(random.uniform(10.0, 100.0), 1),
            "heure": random.randint(0, 23),
            "jour_semaine": random.randint(0, 6),
            "est_saison_pluie": random.randint(0, 1)
        }
        with self.client.post(
            "/predict/",
            json=payload,
            catch_response=True
        ) as response:
            if response.elapsed.total_seconds() * 1000 > 500:
                response.failure(f"Trop lent : {response.elapsed.total_seconds() * 1000:.0f}ms")
            elif response.status_code == 200:
                response.success()