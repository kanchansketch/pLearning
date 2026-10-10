import pytest


@pytest.mark.asyncio
async def test_submission_and_evaluation_flow(client):
    # 1. Create course with assignment
    course_res = await client.post(
        "/create_courses",
        json={
            "title": "Software Architecture",
            "description": "Clean Code and DDD",
            "teacher_id": "teacher_bob",
            "modules": [
                {
                    "title": "Module 1",
                    "description": "Intro",
                    "lessons": [
                        {
                            "title": "Lesson 1",
                            "description": "Architecture Styles",
                            "assignments": [
                                {
                                    "title": "Homework 1",
                                    "description": "Design an aggregate",
                                    "questions": ["What is an aggregate boundary?"],
                                }
                            ],
                        }
                    ],
                }
            ],
        },
    )
    assert course_res.status_code == 201
    course_data = course_res.json()
    assignment_id = course_data["modules"][0]["lessons"][0]["assignments"][0]["id"]

    # 2. Submit assignment
    sub_res = await client.post(
        "/submit_assignment",
        json={
            "assignment_id": assignment_id,
            "student_id": "student_david",
            "content": "An aggregate boundary encapsulates entities and value objects...",
        },
    )
    assert sub_res.status_code == 201
    sub_data = sub_res.json()
    submission_id = sub_data["id"]

    # 3. Duplicate submission rejected
    dup_res = await client.post(
        "/submit_assignment",
        json={
            "assignment_id": assignment_id,
            "student_id": "student_david",
            "content": "Second submission...",
        },
    )
    assert dup_res.status_code == 400

    # 4. View submissions for assignment
    view_subs = await client.get(f"/submit_assignment/{assignment_id}")
    assert view_subs.status_code == 200
    subs = view_subs.json()
    assert len(subs) == 1
    assert subs[0]["id"] == submission_id

    # 5. Teacher evaluates assignment
    eval_res = await client.post(
        "/evaluate_assignment",
        json={
            "submission_id": submission_id,
            "score": 98.0,
            "feedback": "Outstanding understanding of aggregate boundaries!",
        },
    )
    assert eval_res.status_code == 201
    eval_data = eval_res.json()
    assert eval_data["score"] == 98.0
    assert eval_data["feedback"] == "Outstanding understanding of aggregate boundaries!"

    # 6. View evaluation
    get_eval = await client.get(f"/evaluate_assignment/{submission_id}")
    assert get_eval.status_code == 200
    assert get_eval.json()["score"] == 98.0
