import pytest


@pytest.mark.asyncio
async def test_watch_content_and_update_progress(client):
    # 1. Create a course with 1 module and 2 lessons
    course_res = await client.post(
        "/create_courses",
        json={
            "title": "Data Structures",
            "description": "Arrays, Trees, Graphs",
            "teacher_id": "teacher_turing",
            "modules": [
                {
                    "title": "Module 1: Linear Structures",
                    "description": "Arrays & Linked Lists",
                    "lessons": [
                        {
                            "title": "Lesson 1: Dynamic Arrays",
                            "description": "Array resizing",
                            "content": "Vectors and ArrayLists...",
                            "content_url": "https://cdn.example/arrays.mp4",
                            "assignments": [],
                        },
                        {
                            "title": "Lesson 2: Linked Lists",
                            "description": "Singly & Doubly linked",
                            "content": "Node pointers...",
                            "content_url": "https://cdn.example/lists.mp4",
                            "assignments": [],
                        },
                    ],
                }
            ],
        },
    )
    assert course_res.status_code == 201
    course_data = course_res.json()
    course_id = course_data["id"]
    module_id = course_data["modules"][0]["id"]
    lesson1_id = course_data["modules"][0]["lessons"][0]["id"]
    lesson2_id = course_data["modules"][0]["lessons"][1]["id"]

    student_id = "student_charlie"

    # 2. Try watching content before enrollment -> 403 Forbidden
    unauth_watch = await client.get(
        f"/watch_content/{course_id}/{module_id}/{lesson1_id}?student_id={student_id}"
    )
    assert unauth_watch.status_code == 403

    # 3. Enroll student
    enroll_res = await client.post(
        "/enroll_courses",
        json={"student_id": student_id, "course_id": course_id},
    )
    assert enroll_res.status_code == 201

    # 4. Now watch content -> 200 OK
    watch_res = await client.get(
        f"/watch_content/{course_id}/{module_id}/{lesson1_id}?student_id={student_id}"
    )
    assert watch_res.status_code == 200
    assert watch_res.json()["title"] == "Lesson 1: Dynamic Arrays"

    # 5. Check initial progress -> 0%
    prog_res = await client.get(f"/update_progress/{student_id}/{course_id}")
    assert prog_res.status_code == 200
    assert prog_res.json()["progress_percentage"] == 0.0

    # 6. Complete Lesson 1 -> 50%
    update_res = await client.put(
        "/update_progress",
        json={
            "student_id": student_id,
            "course_id": course_id,
            "lesson_id": lesson1_id,
        },
    )
    assert update_res.status_code == 200
    assert update_res.json()["progress_percentage"] == 50.0

    # 7. Complete Lesson 2 -> 100%
    update_res2 = await client.put(
        "/update_progress",
        json={
            "student_id": student_id,
            "course_id": course_id,
            "lesson_id": lesson2_id,
        },
    )
    assert update_res2.status_code == 200
    assert update_res2.json()["progress_percentage"] == 100.0
