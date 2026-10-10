import pytest


@pytest.mark.asyncio
async def test_course_crud_flow(client):
    # 1. Create a course
    payload = {
        "title": "FastAPI & Clean Architecture",
        "description": "Master Domain-Driven Design in Python",
        "teacher_id": "teacher_prof_x",
        "modules": [
            {
                "title": "Module 1: DDD Fundamentals",
                "description": "Entities, Value Objects, Aggregates",
                "lessons": [
                    {
                        "title": "Lesson 1: Introduction",
                        "description": "What is DDD?",
                        "content": "Domain-Driven Design is an approach to software development...",
                        "content_url": "https://learning.cdn/videos/lesson1.mp4",
                        "assignments": [
                            {
                                "title": "Assignment 1",
                                "description": "Identify entities and value objects",
                                "questions": ["What is an aggregate root?"],
                            }
                        ],
                    }
                ],
            }
        ],
    }

    res = await client.post("/create_courses", json=payload)
    assert res.status_code == 201
    course_data = res.json()
    assert course_data["title"] == "FastAPI & Clean Architecture"
    assert len(course_data["modules"]) == 1
    course_id = course_data["id"]
    module_id = course_data["modules"][0]["id"]
    lesson_id = course_data["modules"][0]["lessons"][0]["id"]
    assignment_id = course_data["modules"][0]["lessons"][0]["assignments"][0]["id"]

    # 2. View all courses
    res = await client.get("/view_courses")
    assert res.status_code == 200
    courses = res.json()
    assert any(c["id"] == course_id for c in courses)

    # Filter by teacher
    res = await client.get("/view_courses?teacher_id=teacher_prof_x")
    assert res.status_code == 200
    assert len(res.json()) >= 1

    # 3. View single course
    res = await client.get(f"/view_courses/{course_id}")
    assert res.status_code == 200
    assert res.json()["id"] == course_id

    # 4. View modules
    res = await client.get(f"/view_modules/{course_id}")
    assert res.status_code == 200
    modules = res.json()
    assert len(modules) == 1
    assert modules[0]["id"] == module_id

    # 5. View lessons
    res = await client.get(f"/view_lessons/{course_id}/{module_id}")
    assert res.status_code == 200
    lessons = res.json()
    assert len(lessons) == 1
    assert lessons[0]["id"] == lesson_id

    # 6. View assignments
    res = await client.get(f"/view_assignments/{course_id}/{module_id}/{lesson_id}")
    assert res.status_code == 200
    assignments = res.json()
    assert len(assignments) == 1
    assert assignments[0]["id"] == assignment_id

    # 7. Update course
    update_res = await client.put(
        f"/view_courses/{course_id}",
        json={"title": "Updated FastAPI & DDD", "description": "Updated description"},
    )
    assert update_res.status_code == 200
    assert update_res.json()["title"] == "Updated FastAPI & DDD"


@pytest.mark.asyncio
async def test_view_course_not_found(client):
    res = await client.get("/view_courses/non-existent-course-id")
    assert res.status_code == 404
