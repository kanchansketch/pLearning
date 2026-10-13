"""
Integration tests for Auth & Teacher Studio API endpoints.
"""

import pytest


@pytest.mark.asyncio
async def test_auth_flow(client):
    # 1. Register a new teacher
    reg_payload = {
        "name": "Dr. Sarah Connor",
        "email": "sarah@plearning.edu",
        "password": "password123",
        "role": "teacher",
        "specialization": "Robotics & AI",
    }
    res = await client.post("/auth/register", json=reg_payload)
    assert res.status_code == 201
    reg_data = res.json()
    assert reg_data["user"]["name"] == "Dr. Sarah Connor"
    assert reg_data["user"]["email"] == "sarah@plearning.edu"
    assert reg_data["user"]["role"] == "teacher"
    user_id = reg_data["user"]["id"]

    # 2. Login with registered credentials
    login_payload = {
        "email": "sarah@plearning.edu",
        "password": "password123",
        "role": "teacher",
    }
    login_res = await client.post("/auth/login", json=login_payload)
    assert login_res.status_code == 200
    login_data = login_res.json()
    assert login_data["access_token"].startswith("token_")
    assert login_data["user"]["id"] == user_id

    # 3. Update profile
    update_res = await client.put(
        f"/auth/profile?user_id={user_id}",
        json={"bio": "Expert in robotic automation architectures."},
    )
    assert update_res.status_code == 200
    assert update_res.json()["bio"] == "Expert in robotic automation architectures."


@pytest.mark.asyncio
async def test_teacher_studio_and_curriculum_flow(client):
    # 1. Fetch teacher analytics
    res = await client.get("/teacher/analytics?teacher_id=teacher_marcus")
    assert res.status_code == 200
    analytics = res.json()
    assert "total_enrollment" in analytics
    assert "metrics" in analytics
    assert len(analytics["metrics"]) >= 4

    # 2. Create a course in teacher studio
    new_course = {
        "title": "Quantum Computing Principles",
        "description": "Foundations of qubits, superposition, and quantum gates.",
        "category": "Computer Science",
        "status": "Draft",
        "rating": 4.9,
    }
    c_res = await client.post("/teacher/courses?teacher_id=teacher_marcus", json=new_course)
    assert c_res.status_code == 201
    course_data = c_res.json()
    course_id = course_data["id"]
    assert course_data["title"] == "Quantum Computing Principles"
    assert course_data["status"] == "Draft"

    # 3. Toggle status to Published
    status_res = await client.patch(
        f"/teacher/courses/{course_id}/status",
        json={"status": "Published"},
    )
    assert status_res.status_code == 200
    assert status_res.json()["status"] == "Published"

    # 4. Save and fetch Curriculum Tree
    curriculum_payload = {
        "title": "Quantum Computing Principles - Masterclass",
        "modules": [
            {
                "id": "mod_qc_1",
                "title": "Module 1: The Qubit",
                "active": False,
                "lessons": [
                    {
                        "id": "les_qc_1",
                        "title": "1.1 Introduction to Bloch Spheres",
                        "content": "A qubit can exist in a superposition of |0> and |1> states.",
                        "content_type": "Rich Text Article",
                        "duration": "20 minutes",
                        "access": "Enrolled Students Only",
                        "active": True,
                    }
                ],
            }
        ],
    }
    save_res = await client.put(f"/teacher/curriculum/{course_id}", json=curriculum_payload)
    assert save_res.status_code == 200
    saved_tree = save_res.json()
    assert len(saved_tree["modules"]) == 1
    assert saved_tree["modules"][0]["lessons"][0]["title"] == "1.1 Introduction to Bloch Spheres"

    # 5. Fetch Curriculum
    get_tree_res = await client.get(f"/teacher/curriculum/{course_id}")
    assert get_tree_res.status_code == 200
    tree = get_tree_res.json()
    assert len(tree["modules"]) == 1
    assert tree["modules"][0]["lessons"][0]["content_type"] == "Rich Text Article"
