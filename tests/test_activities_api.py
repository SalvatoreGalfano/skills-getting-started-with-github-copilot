from fastapi.testclient import TestClient
from src.app import app, activities

client = TestClient(app)


def setup_function():
    # reset activities participants to known state before each test
    activities["Basketball"]["participants"] = ["james@mergington.edu"]
    activities["Tennis Club"]["participants"] = ["alex@mergington.edu"]


def test_get_activities():
    resp = client.get("/activities")
    assert resp.status_code == 200
    data = resp.json()
    assert "Basketball" in data


def test_signup_and_unregister_flow():
    # signup a new participant
    resp = client.post("/activities/Basketball/signup?email=testuser@mergington.edu")
    assert resp.status_code == 200
    assert "Signed up testuser@mergington.edu for Basketball" in resp.json().get("message", "")

    # confirm participant is present
    resp = client.get("/activities")
    assert resp.status_code == 200
    participants = resp.json()["Basketball"]["participants"]
    assert "testuser@mergington.edu" in participants

    # unregister the participant
    resp = client.delete("/activities/Basketball/unregister?email=testuser@mergington.edu")
    assert resp.status_code == 200
    assert "Unregistered testuser@mergington.edu from Basketball" in resp.json().get("message", "")

    # confirm removal
    resp = client.get("/activities")
    participants = resp.json()["Basketball"]["participants"]
    assert "testuser@mergington.edu" not in participants


def test_signup_duplicate():
    # try signing up existing participant
    resp = client.post("/activities/Basketball/signup?email=james@mergington.edu")
    assert resp.status_code == 400


def test_unregister_nonexistent():
    # attempt to unregister someone not in list
    resp = client.delete("/activities/Basketball/unregister?email=nonexistent@mergington.edu")
    assert resp.status_code == 400
