import pytest


@pytest.mark.asyncio
async def test_enrollment_api_flow(client):
    # Create a course first
    course_res = await client.post(
        "/create_courses",
        json={
            "title": "Machine Learning Fundamentals",
            "description": "Intro to ML",
            "teacher_id": "prof_ng",
            "modules": [],
        },
    )
    assert course_res.status_code == 201
    course_id = course_res.json()["id"]

    # Enroll student
    enroll_res = await client.post(
        "/enroll_courses",
        json={
            "student_id": "student_alice",
            "course_id": course_id,
        },
    )
    assert enroll_res.status_code == 201
    enrollment = enroll_res.json()
    assert enrollment["student_id"] == "student_alice"
    assert enrollment["course_id"] == course_id

    # Duplicate enroll should return 400
    dup_res = await client.post(
        "/enroll_courses",
        json={
            "student_id": "student_alice",
            "course_id": course_id,
        },
    )
    assert dup_res.status_code == 400

    # View student enrollments
    view_res = await client.get("/enroll_courses/student_alice")
    assert view_res.status_code == 200
    enrollments = view_res.json()
    assert any(e["course_id"] == course_id for e in enrollments)


@pytest.mark.asyncio
async def test_enroll_nonexistent_course(client):
    res = await client.post(
        "/enroll_courses",
        json={
            "student_id": "student_bob",
            "course_id": "invalid_course_id",
        },
    )
    assert res.status_code == 400
