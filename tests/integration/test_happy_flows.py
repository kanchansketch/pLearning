"""
Automated Happy Flow Integration Tests for both Teacher and Learner.

Covers:
1. Teacher Happy Flow:
   - Register -> Login -> Profile Check -> Dashboard Analytics -> Create Course -> Build Curriculum -> Publish Course
2. Learner Happy Flow:
   - Register -> Login -> Browse Catalog -> View Syllabus -> Enroll -> Learn/Complete Lessons -> Track Progress
3. End-to-End Collaborative Happy Flow:
   - Teacher crafts course & assignment -> Learner enrolls & submits -> Teacher grades -> Learner views feedback
"""

import pytest


@pytest.mark.asyncio
async def test_teacher_happy_flow(client):
    """Full happy path for a teacher managing their studio, courses, and curriculum."""
    # ── 1. Teacher Registration ───────────────────────────────────────
    teacher_email = "prof.adrian@plearning.edu"
    reg_res = await client.post(
        "/auth/register",
        json={
            "name": "Prof. Adrian Sterling",
            "email": teacher_email,
            "password": "SecurePassword123!",
            "role": "teacher",
            "specialization": "Spatial Architectural Atmosphere",
            "bio": "Veteran designer with 12+ years in environmental lighting.",
        },
    )
    assert reg_res.status_code == 201
    teacher_data = reg_res.json()["user"]
    teacher_id = teacher_data["id"]
    assert teacher_data["role"] == "teacher"
    assert teacher_data["name"] == "Prof. Adrian Sterling"

    # ── 2. Teacher Login ──────────────────────────────────────────────
    login_res = await client.post(
        "/auth/login",
        json={
            "email": teacher_email,
            "password": "SecurePassword123!",
            "role": "teacher",
        },
    )
    assert login_res.status_code == 200
    token_data = login_res.json()
    assert token_data["access_token"].startswith("token_")
    assert token_data["user"]["id"] == teacher_id

    # ── 3. Profile Verification & Update ─────────────────────────────
    me_res = await client.get(f"/auth/me?user_id={teacher_id}")
    assert me_res.status_code == 200
    assert me_res.json()["email"] == teacher_email

    update_profile_res = await client.put(
        f"/auth/profile?user_id={teacher_id}",
        json={"bio": "Senior Lighting Director & Studio Mentor."},
    )
    assert update_profile_res.status_code == 200
    assert update_profile_res.json()["bio"] == "Senior Lighting Director & Studio Mentor."

    # ── 4. Teacher Studio Dashboard Analytics ─────────────────────────
    analytics_res = await client.get(f"/teacher/analytics?teacher_id={teacher_id}")
    assert analytics_res.status_code == 200
    analytics = analytics_res.json()
    assert "total_enrollment" in analytics
    assert "avg_completion_rate" in analytics
    assert len(analytics["metrics"]) >= 4

    # ── 5. Create New Course Draft ───────────────────────────────────
    course_res = await client.post(
        f"/teacher/courses?teacher_id={teacher_id}",
        json={
            "title": "Mastering Shadow Dynamics & Negative Space",
            "description": "Exploration of atmospheric darkness, contrast ratios, and luxury aesthetics.",
            "category": "Architecture & Design",
            "status": "Draft",
            "rating": 4.9,
        },
    )
    assert course_res.status_code == 201
    course_obj = course_res.json()
    course_id = course_obj["id"]
    assert course_obj["status"] == "Draft"
    assert course_obj["title"] == "Mastering Shadow Dynamics & Negative Space"

    # ── 6. Build & Auto-Save Curriculum ──────────────────────────────
    curriculum_payload = {
        "title": "Mastering Shadow Dynamics & Negative Space",
        "modules": [
            {
                "id": "mod_shadow_1",
                "title": "Module 1: The Anatomy of Shadows",
                "active": False,
                "lessons": [
                    {
                        "id": "les_shadow_1",
                        "title": "1.1 Umbra vs Penumbra in Luxury Spaces",
                        "content": "Understanding soft shadow falloffs and architectural boundaries.",
                        "content_type": "Rich Text Article",
                        "duration": "25 minutes",
                        "access": "Enrolled Students Only",
                        "active": True,
                    },
                    {
                        "id": "les_shadow_2",
                        "title": "1.2 Practical: Negative Fill with Molton Fabric",
                        "content": "Using black flags to eliminate bounce light.",
                        "content_type": "Video Lecture",
                        "duration": "18 minutes",
                        "access": "Public Preview (Free)",
                        "active": False,
                    },
                ],
            }
        ],
    }
    save_curriculum_res = await client.put(f"/teacher/curriculum/{course_id}", json=curriculum_payload)
    assert save_curriculum_res.status_code == 200
    saved_curriculum = save_curriculum_res.json()
    assert len(saved_curriculum["modules"]) == 1
    assert len(saved_curriculum["modules"][0]["lessons"]) == 2

    # ── 7. Publish Course to Catalog ─────────────────────────────────
    publish_res = await client.patch(
        f"/teacher/courses/{course_id}/status",
        json={"status": "Published"},
    )
    assert publish_res.status_code == 200
    assert publish_res.json()["status"] == "Published"

    # ── 8. Verify Published Course Appears in Teacher's List ─────────
    list_res = await client.get(f"/teacher/courses?teacher_id={teacher_id}")
    assert list_res.status_code == 200
    teacher_courses = list_res.json()
    found = next((c for c in teacher_courses if c["id"] == course_id), None)
    assert found is not None
    assert found["status"] == "Published"


@pytest.mark.asyncio
async def test_learner_happy_flow(client):
    """Full happy path for a learner browsing, enrolling, learning, and tracking progress."""
    # ── 1. Learner Registration ───────────────────────────────────────
    learner_email = "elena.rostova@plearning.edu"
    reg_res = await client.post(
        "/auth/register",
        json={
            "name": "Elena Rostova",
            "email": learner_email,
            "password": "LearnerPassword2026!",
            "role": "student",
            "specialization": "Interior Architectural Photography",
        },
    )
    assert reg_res.status_code == 201
    learner_id = reg_res.json()["user"]["id"]

    # ── 2. Learner Login ──────────────────────────────────────────────
    login_res = await client.post(
        "/auth/login",
        json={
            "email": learner_email,
            "password": "LearnerPassword2026!",
            "role": "student",
        },
    )
    assert login_res.status_code == 200
    assert login_res.json()["user"]["id"] == learner_id

    # ── 3. Browse Course Catalog ─────────────────────────────────────
    catalog_res = await client.get("/view_all_courses")
    assert catalog_res.status_code == 200
    catalog = catalog_res.json()
    assert len(catalog) >= 1
    target_course = catalog[0]
    course_id = target_course["id"]

    # ── 4. View Course Syllabus / Details ────────────────────────────
    syllabus_res = await client.get(f"/view_course_curriculum/{course_id}")
    assert syllabus_res.status_code == 200
    syllabus = syllabus_res.json()
    assert syllabus["id"] == course_id
    assert len(syllabus["modules"]) >= 1
    first_lesson_id = syllabus["modules"][0]["lessons"][0]["id"]

    # ── 5. Enroll in Course ──────────────────────────────────────────
    enroll_res = await client.post(
        "/enroll_courses",
        json={"student_id": learner_id, "course_id": course_id},
    )
    assert enroll_res.status_code == 201
    enrollment = enroll_res.json()
    assert enrollment["student_id"] == learner_id
    assert enrollment["course_id"] == course_id

    # ── 6. Check Active Enrollments ──────────────────────────────────
    my_enrollments_res = await client.get(f"/enroll_courses/{learner_id}")
    assert my_enrollments_res.status_code == 200
    my_courses = my_enrollments_res.json()
    assert any(e["course_id"] == course_id for e in my_courses)

    # ── 7. Learn & Complete Lesson (Progress Tracking) ───────────────
    progress_update_res = await client.put(
        "/update_progress",
        json={
            "student_id": learner_id,
            "course_id": course_id,
            "lesson_id": first_lesson_id,
        },
    )
    assert progress_update_res.status_code == 200
    progress_info = progress_update_res.json()
    assert progress_info["progress_percentage"] > 0
    assert first_lesson_id in progress_info["completed_lesson_ids"]

    # ── 8. Retrieve Progress Status ──────────────────────────────────
    progress_check = await client.get(f"/update_progress/{learner_id}/{course_id}")
    assert progress_check.status_code == 200
    assert progress_check.json()["progress_percentage"] == progress_info["progress_percentage"]


@pytest.mark.asyncio
async def test_end_to_end_collaborative_happy_flow(client):
    """End-to-end flow: Teacher authors course & homework -> Student completes & submits -> Teacher evaluates."""
    # ── 1. Teacher creates course with assignment ─────────────────────
    course_payload = {
        "title": "Computational Lighting & Adaptive Sensors",
        "description": "Integrating DMX fixtures with IoT sensors for responsive environments.",
        "teacher_id": "teacher_alexander",
        "modules": [
            {
                "title": "Module 1: DMX Protocols",
                "description": "Understanding universe addressing and refresh rates.",
                "lessons": [
                    {
                        "title": "Lesson 1: Packet Sniffing",
                        "description": "Analyze DMX512 frames using logic analyzers.",
                        "content": "DMX512 transmits packets at 250 kbaud using differential signaling.",
                        "content_url": "https://cdn.plearning.edu/videos/dmx1.mp4",
                        "assignments": [
                            {
                                "title": "Lab 1: Design DMX Packet Parser",
                                "description": "Construct an aggregate parser for 512 channels.",
                                "questions": ["What is the break duration in micro-seconds?"],
                            }
                        ],
                    }
                ],
            }
        ],
    }
    course_res = await client.post("/create_courses", json=course_payload)
    assert course_res.status_code == 201
    course_data = course_res.json()
    course_id = course_data["id"]
    lesson_id = course_data["modules"][0]["lessons"][0]["id"]
    assignment_id = course_data["modules"][0]["lessons"][0]["assignments"][0]["id"]

    # ── 2. Student enrolls in the newly created course ────────────────
    student_id = "student_clara"
    enroll_res = await client.post(
        "/enroll_courses",
        json={"student_id": student_id, "course_id": course_id},
    )
    assert enroll_res.status_code == 201

    # ── 3. Student completes lesson & advances progress ───────────────
    prog_res = await client.put(
        "/update_progress",
        json={"student_id": student_id, "course_id": course_id, "lesson_id": lesson_id},
    )
    assert prog_res.status_code == 200
    assert prog_res.json()["progress_percentage"] == 100.0

    # ── 4. Student submits homework solution ──────────────────────────
    solution_text = "The break duration must be at least 88 microseconds (or 22 bit times at 250 kbaud)."
    sub_res = await client.post(
        "/submit_assignment",
        json={
            "assignment_id": assignment_id,
            "student_id": student_id,
            "content": solution_text,
        },
    )
    assert sub_res.status_code == 201
    submission_id = sub_res.json()["id"]

    # ── 5. Teacher views submissions for this assignment ──────────────
    teacher_view_subs = await client.get(f"/submit_assignment/{assignment_id}")
    assert teacher_view_subs.status_code == 200
    subs = teacher_view_subs.json()
    assert len(subs) == 1
    assert subs[0]["id"] == submission_id
    assert subs[0]["content"] == solution_text

    # ── 6. Teacher evaluates & grades student submission ──────────────
    eval_res = await client.post(
        "/evaluate_assignment",
        json={
            "submission_id": submission_id,
            "score": 100.0,
            "feedback": "Perfect technical timing analysis and packet structure design!",
        },
    )
    assert eval_res.status_code == 201
    eval_data = eval_res.json()
    assert eval_data["score"] == 100.0

    # ── 7. Student retrieves grade & feedback ─────────────────────────
    student_check = await client.get(f"/evaluate_assignment/{submission_id}")
    assert student_check.status_code == 200
    assert student_check.json()["score"] == 100.0
    assert student_check.json()["feedback"] == "Perfect technical timing analysis and packet structure design!"
