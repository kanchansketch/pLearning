import pytest
from plearning.domain.entities.assessment import Assessment
from plearning.domain.value_objects.ids import ModuleId
from plearning.infrastructure.persistence.repositories.sqlalchemy_assessment_repo import (
    SQLAlchemyAssessmentRepository,
)
from tests.integration.conftest import async_test_session_factory


@pytest.mark.asyncio
async def test_assessment_flow(client):
    # Setup assessment in DB
    assessment = Assessment.create(
        module_id=ModuleId.generate(),
        title="Python Basics Assessment",
        description="Test basic Python concepts",
        questions=["What is a list comprehension?", "What is a generator?"],
        time_limit_minutes=30,
    )

    async with async_test_session_factory() as session:
        repo = SQLAlchemyAssessmentRepository(session)
        await repo.save_assessment(assessment)

    # 1. Start assessment attempt
    start_res = await client.post(
        "/start_assessment",
        json={
            "assessment_id": assessment.id.value,
            "student_id": "student_eve",
        },
    )
    assert start_res.status_code == 201
    attempt = start_res.json()
    assert attempt["status"] == "in_progress"
    attempt_id = attempt["id"]

    # 2. Submit answers
    submit_res = await client.post(
        "/submit_assessment",
        json={
            "attempt_id": attempt_id,
            "answers": [
                "A syntax to create lists concisely",
                "A function yielding values using yield",
            ],
        },
    )
    assert submit_res.status_code == 200
    sub_attempt = submit_res.json()
    assert sub_attempt["status"] == "submitted"
    assert len(sub_attempt["answers"]) == 2

    # 3. Submitting again returns 400
    sub_again = await client.post(
        "/submit_assessment",
        json={
            "attempt_id": attempt_id,
            "answers": ["New answers"],
        },
    )
    assert sub_again.status_code == 400


@pytest.mark.asyncio
async def test_start_missing_assessment(client):
    res = await client.post(
        "/start_assessment",
        json={
            "assessment_id": "missing_assessment",
            "student_id": "student_eve",
        },
    )
    assert res.status_code == 400
