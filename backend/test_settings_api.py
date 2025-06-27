import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

SETTINGS_URL = "/settings/default"

def test_settings_lifecycle():
    # 1. Ensure settings do not exist (should 404 or create default)
    response = client.get(SETTINGS_URL)
    assert response.status_code in (200, 404)
    
    # 2. Create/update settings with time_blocks and last_synced
    data = {
        "time_blocks": [
            {"name": "Night Shift", "start": "22:00", "end": "02:00"},
            {"name": "Morning", "start": "06:00", "end": "12:00"}
        ],
        "last_synced": "2024-06-01T12:00:00Z"
    }
    response = client.post(SETTINGS_URL, json=data)
    assert response.status_code == 200
    result = response.json()
    assert result["time_blocks"] == data["time_blocks"]
    assert result["last_synced"] == data["last_synced"]

    # 3. Set last_synced to null (simulate sync/erasure)
    response = client.post(SETTINGS_URL, json={"last_synced": None})
    assert response.status_code == 200
    result = response.json()
    assert result["last_synced"] is None

    # 4. Delete all time_blocks
    response = client.post(SETTINGS_URL, json={"time_blocks": []})
    assert response.status_code == 200
    result = response.json()
    assert result["time_blocks"] == []

    # 5. Delete all routine_tasks
    response = client.post(SETTINGS_URL, json={"routine_tasks": []})
    assert response.status_code == 200
    result = response.json()
    assert result["routine_tasks"] == []

    # 2. Create/update settings with routine_tasks and last_synced
    routine_data = {
        "routine_tasks": [
            {"priority": 1, "name": "Sleep", "start": "23:00", "end": "07:00", "duration": 480},
            {"priority": 2, "name": "Breakfast", "start": "07:30", "end": "08:00", "duration": 30}
        ],
        "last_synced": "2023-01-01T00:00:00Z"
    }

    response = client.post(SETTINGS_URL, json=routine_data)
    assert response.status_code == 200, response.text
    result = response.json()
    assert result["routine_tasks"] == routine_data["routine_tasks"]

    # 3. Set last_synced to null (simulate sync/erasure)
    response = client.post(SETTINGS_URL, json={"last_synced": None})
    assert response.status_code == 200
    result = response.json()
    assert result["last_synced"] is None

    # 4. Delete all routine_tasks
    response = client.post(SETTINGS_URL, json={"routine_tasks": []})
    assert response.status_code == 200, response.text
    result = response.json()
    assert result["routine_tasks"] == [] 