"""
Database Seeder – Populates initial development & demo data.
"""

from __future__ import annotations

import hashlib
import json
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from plearning.infrastructure.persistence.models import (
    AssignmentModel,
    CourseModel,
    EnrollmentModel,
    LessonModel,
    ModuleModel,
    ProgressModel,
    UserModel,
)


def _hash_pw(pw: str) -> str:
    return hashlib.sha256(pw.encode("utf-8")).hexdigest()


async def seed_data(session: AsyncSession) -> None:
    # ── 1. Seed Users ─────────────────────────────────────────────
    existing_users = await session.execute(select(UserModel.id))
    user_ids = {r[0] for r in existing_users.fetchall()}

    if "teacher_marcus" not in user_ids:
        session.add(
            UserModel(
                id="teacher_marcus",
                name="Prof. Marcus Vance",
                email="marcus@plearning.edu",
                password_hash=_hash_pw("password123"),
                role="teacher",
                avatar="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
                bio="Architectural lighting designer with 15+ years of experience in spatial atmosphere and enterprise environments.",
                specialization="Spatial & Architectural Lighting",
            )
        )

    if "student_alex" not in user_ids:
        session.add(
            UserModel(
                id="student_alex",
                name="Alex Rivera",
                email="alex@plearning.edu",
                password_hash=_hash_pw("password123"),
                role="student",
                avatar="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
                bio="Graduate student exploring computational interaction design and spatial atmosphere.",
                specialization="Interaction Design",
            )
        )

    await session.commit()

    # ── 2. Seed Courses ───────────────────────────────────────────
    existing_courses = await session.execute(select(CourseModel.id))
    course_ids = {r[0] for r in existing_courses.fetchall()}

    if not course_ids or "course_lighting" not in course_ids:
        c1 = CourseModel(
            id="course_lighting",
            title="Advanced Architectural Lighting & Moods",
            description="Master spatial depth, color temperature, and cinematic three-point lighting setups for luxury interiors and commercial spaces.",
            teacher_id="teacher_marcus",
            status="Published",
            category="Architecture & Design",
            rating=4.9,
            thumbnail_url="https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=600&auto=format&fit=crop&q=80",
        )

        # Module 1
        m1 = ModuleModel(
            id="mod_1",
            course_id="course_lighting",
            title="Module 1: Introduction & Setup",
            order=1,
        )
        l1_1 = LessonModel(
            id="les_1_1",
            module_id="mod_1",
            title="1.1 Course Overview & Objectives",
            description="Overview of spatial lighting curriculum and target outcomes",
            content_type="Video",
            content_url="https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            duration_minutes=15,
            access_level="Public Preview (Free)",
            order=1,
        )
        l1_2 = LessonModel(
            id="les_1_2",
            module_id="mod_1",
            title="1.2 Setting up your physical & digital space",
            description="Studio acoustics, camera rigs, and light placement geometry",
            content="""In this lesson, we will cover the core components needed to construct a professional lighting studio. Lighting is the single most important factor in premium video production, defining the mood, depth, and character of your architectural subjects.

We will focus on:
1. Understanding the Three-Point Lighting system (Key, Fill, and Backlights).
2. Choosing between hard and soft light sources based on the room size.
3. Aligning color temperature (Kelvins) across multiple sources to avoid color contamination.""",
            content_type="Rich Text Article",
            content_url="",
            duration_minutes=25,
            access_level="Enrolled Students Only",
            order=2,
        )
        m1.lessons.extend([l1_1, l1_2])

        # Module 2
        m2 = ModuleModel(
            id="mod_2",
            course_id="course_lighting",
            title="Module 2: The Physics of Light",
            order=2,
        )
        l2_1 = LessonModel(
            id="les_2_1",
            module_id="mod_2",
            title="2.1 Color Temperature & Key Light",
            description="Mastering 3200K tungsten to 5600K daylight balances",
            content_type="Video",
            duration_minutes=20,
            order=1,
        )
        l2_2 = LessonModel(
            id="les_2_2",
            module_id="mod_2",
            title="2.2 Creating depth with fill lights",
            description="Negative fill and diffusion panel techniques",
            content_type="Resource Document",
            duration_minutes=25,
            order=2,
        )
        l2_3 = LessonModel(
            id="les_2_3",
            module_id="mod_2",
            title="2.3 Practical: Lighting on a budget",
            description="Affordable LED panels and DIY modifiers",
            content_type="External Link",
            duration_minutes=15,
            order=3,
        )
        m2.lessons.extend([l2_1, l2_2, l2_3])

        # Module 3
        m3 = ModuleModel(
            id="mod_3",
            course_id="course_lighting",
            title="Module 3: Advanced Scenarios",
            order=3,
        )
        l3_1 = LessonModel(
            id="les_3_1",
            module_id="mod_3",
            title="3.1 Multi-Zone Enterprise Spatial Calibration",
            description="High-contrast moody architectural environments",
            content_type="Rich Text Article",
            duration_minutes=35,
            order=1,
        )
        m3.lessons.append(l3_1)

        c1.modules.extend([m1, m2, m3])
        session.add(c1)

        # Course 2
        c2 = CourseModel(
            id="course_ux_enterprise",
            title="UX/UI Design Systems for Enterprise",
            description="Architect scalable component libraries, design tokens, and governance frameworks across multi-platform enterprise products.",
            teacher_id="teacher_marcus",
            status="Published",
            category="Product Design",
            rating=4.8,
            thumbnail_url="https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&auto=format&fit=crop&q=80",
        )
        m2_1 = ModuleModel(id="mod_ux_1", course_id="course_ux_enterprise", title="Foundations of Tokens", order=1)
        m2_1.lessons.append(
            LessonModel(id="les_ux_1", module_id="mod_ux_1", title="Token Taxonomy & Semantic Layering", duration_minutes=30, order=1)
        )
        c2.modules.append(m2_1)
        session.add(c2)

        # Course 3
        c3 = CourseModel(
            id="course_ixd",
            title="Introduction to Interaction Design",
            description="Explore micro-interactions, state transitions, physics-based motion, and ergonomic usability principles.",
            teacher_id="teacher_marcus",
            status="Draft",
            category="Interaction Design",
            rating=4.7,
            thumbnail_url="https://images.unsplash.com/photo-1542744094-24638eff58bb?w=600&auto=format&fit=crop&q=80",
        )
        session.add(c3)

        # Sample enrollment
        session.add(
            EnrollmentModel(
                id="enr_demo_1",
                course_id="course_lighting",
                student_id="student_alex",
            )
        )
        session.add(
            ProgressModel(
                student_id="student_alex",
                course_id="course_lighting",
                completed_lesson_ids_json=json.dumps(["les_1_1"]),
                current_lesson_id="les_1_2",
                progress_percentage=65.0,
            )
        )
        await session.commit()
