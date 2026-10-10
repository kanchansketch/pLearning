# Engineering Development Process & Quality Checklist

A detailed breakdown of the development methodology, architecture rules, execution phases, and step-by-step micro-checklists applied during the design and construction of **pLearning V1**.

---

## 1. Core Engineering Rules & Architecture Principles

### 1.1 The Golden Rules of Clean DDD
1. **Zero External Dependencies in Domain**:
   - The `plearning.domain` package imports *only* Python standard libraries (`dataclasses`, `datetime`, `typing`, `enum`, `uuid`, `abc`).
   - *Check*: No SQLAlchemy, no FastAPI, no Pydantic inside `domain/`.
2. **Aggregates Enforce Consistency Boundaries**:
   - Direct mutations to `Module`, `Lesson`, or `Assignment` must pass through the `Course` aggregate root.
   - *Check*: Re-ordering, adding, or deleting children is strictly coordinated by parent methods (e.g., `course.add_module()`, `course.remove_module()`).
3. **Value Objects for Domain Safety**:
   - Primitive strings (`str`) are never used as entity identities inside domain signatures.
   - *Check*: Strongly-typed identifiers (`CourseId`, `ModuleId`, `LessonId`, `AssignmentId`, etc.) are used across all entities and repository contracts.
4. **Separation of Read Models (Out DTOs) & Write Models (Command DTOs)**:
   - Application services never return domain entities directly to the interface layer.
   - *Check*: Entities are transformed into frozen dataclass DTOs (`CourseOut`, `EnrollmentOut`), which the API then serializes.
5. **Domain Exceptions Never Leak HTTP Details**:
   - Domain rules raise subclassed `DomainException`s (`CourseNotFoundError`, `AlreadyEnrolledError`, `NotEnrolledError`).
   - *Check*: HTTP status codes (`400`, `403`, `404`) are mapped exclusively in the interface/router layer.

---

## 2. Phase-by-Phase Checklist & Micro-Steps

```
┌────────────────────────────────────────────────────────────────────────┐
│  Phase 0: Requirements Analysis & Domain Modeling                     │
│  Phase 1: Environment, Dependencies & Tooling Setup                    │
│  Phase 2: Domain Layer & Domain Unit Testing (TDD)                    │
│  Phase 3: Application Layer, DTOs & Use Case Unit Testing             │
│  Phase 4: Infrastructure Layer (SQLAlchemy 2.0 & In-Memory Doubles)   │
│  Phase 5: Interface Layer (FastAPI Routers, Pydantic v2 & DI)          │
│  Phase 6: Integration Testing & Test Coverage Auditing                 │
│  Phase 7: Packaging, Entrypoint Unification & Git Version Control     │
└────────────────────────────────────────────────────────────────────────┘
```

---

### Phase 0: Requirements Discovery & Domain Decomposition

- [x] **Micro-step 0.1: Extract Core Requirements from Design Goals**
  - Mapped all 12 functional requirements from `design_goals/phase-1/v1_core_design_plearning.md`.
  - Identified user roles: **Teacher** (creator/grader) vs **Student** (learner/submitter).
- [x] **Micro-step 0.2: Define Aggregate Boundaries**
  - Grouped `Course -> Module -> Lesson -> Assignment` into one bounded aggregate.
  - Decoupled `Enrollment` (links Student + Course).
  - Decoupled `StudentProgress` (tracks lesson completion percentages).
  - Decoupled `Submission` & `Evaluation` (student work and teacher reviews).
  - Decoupled `Assessment` & `AssessmentAttempt` (quizzes and student attempts).
- [x] **Micro-step 0.3: Map Repository Contracts**
  - Designed clean abstract base interfaces (`CourseRepository`, `EnrollmentRepository`, `ProgressRepository`, `SubmissionRepository`, `EvaluationRepository`, `AssessmentRepository`).

---

### Phase 1: Environment, Tooling & Compatibility

- [x] **Micro-step 1.1: Local Virtual Environment Discovery**
  - Located Python 3.10 virtualenv inside `.pLearning`.
- [x] **Micro-step 1.2: Dependency Resolution & Installation**
  - Installed `fastapi`, `uvicorn`, `sqlalchemy`, `aiosqlite`, `pytest`, `pytest-asyncio`, `httpx`, `coverage`.
- [x] **Micro-step 1.3: Python 3.10 Compatibility Fix (Pydantic ForwardRef)**
  - *Identified Issue*: Pydantic 2.14.0 called `ForwardRef(..., is_class=True)` which failed on Python 3.10.0 stdlib typing.
  - *Micro-Resolution*: Pinned `pydantic>=2.6.0,<2.10.0` (installed `2.9.2`) ensuring 100% stable execution on Python 3.10+.
- [x] **Micro-step 1.4: Pytest Configuration Setup**
  - Added `pythonpath = ["src"]` and `asyncio_mode = "auto"` in `pyproject.toml`.

---

### Phase 2: Domain Layer Implementation (TDD Phase 1)

- [x] **Micro-step 2.1: Implement Typed Identifiers (`ids.py`)**
  - Built typed ID wrappers with UUID generation: `CourseId`, `ModuleId`, `LessonId`, `AssignmentId`, `SubmissionId`, `EvaluationId`, `AssessmentId`, `AttemptId`.
- [x] **Micro-step 2.2: Implement Domain Exceptions (`exceptions.py`)**
  - Created base `DomainException` and specialized subclasses:
    - `CourseNotFoundError`, `ModuleNotFoundError`, `LessonNotFoundError`, `AssignmentNotFoundError`.
    - `AlreadyEnrolledError`, `NotEnrolledError`.
    - `SubmissionNotFoundError`, `DuplicateSubmissionError`.
    - `AssessmentNotFoundError`, `AttemptAlreadySubmittedError`.
- [x] **Micro-step 2.3: Implement Course Aggregate (`course.py`, `module.py`, `lesson.py`, `assignment.py`)**
  - Added automatic order sequencing (`order = len(items) + 1`).
  - Added deletion with automatic reordering (`_reorder_modules`, `_reorder_lessons`).
  - Enforced non-empty strings in `__post_init__`.
- [x] **Micro-step 2.4: Implement Supporting Entities**
  - `Enrollment`: Tracks student enrollment timestamp.
  - `StudentProgress`: Auto-calculates `(completed / total) * 100`.
  - `Submission`: Records student content and timestamp.
  - `Evaluation`: Validates score bounds `0 <= score <= 100`.
  - `Assessment` & `AssessmentAttempt`: State machine transitions (`IN_PROGRESS -> SUBMITTED -> GRADED`).
- [x] **Micro-step 2.5: Write Domain Unit Tests (24 Tests)**
  - `test_course.py`: Invariant validation, reordering, retrieval.
  - `test_module.py`: Lesson association and reordering.
  - `test_lesson.py`: Assignment management.
  - `test_assignment.py`: Question validation.
  - `test_student_progress.py`: 0% to 100% calculation and deduplication.
  - `test_submission.py`: Submission and score bounds.
  - `test_assessment.py`: Attempt submission and grading constraints.
  - *Gate Check*: **24/24 domain tests passed.**

---

### Phase 3: Application Layer & In-Memory Test Doubles (TDD Phase 2)

- [x] **Micro-step 3.1: Define Application DTOs**
  - Created command DTOs (`CreateCourseDTO`, `EnrollCourseDTO`, etc.).
  - Created frozen read DTOs (`CourseOut`, `ModuleOut`, `LessonOut`, `AssignmentOut`).
- [x] **Micro-step 3.2: Implement Application Services**
  - `CourseService`: Tree creation, course update, filtered retrieval.
  - `EnrollmentService`: Enforces course existence, prevents duplicate enrollment, bootstraps progress.
  - `ContentService`: Verifies student enrollment before streaming content.
  - `ProgressService`: Computes dynamic completion percentages.
  - `SubmissionService`: Prevents duplicate submissions per student per assignment.
  - `EvaluationService`: Grades existing submissions with feedback.
  - `AssessmentService`: Starts attempts and records final answers.
- [x] **Micro-step 3.3: Build In-Memory Repositories**
  - Implemented `InMemoryCourseRepository`, `InMemoryEnrollmentRepository`, etc.
  - Applied `copy.deepcopy` to prevent test mutation leakage.
- [x] **Micro-step 3.4: Write Application Unit Tests (16 Tests)**
  - Verified business use cases end-to-end without database dependencies.
  - *Gate Check*: **16/16 application unit tests passed.**

---

### Phase 4: Infrastructure Layer (SQLAlchemy 2.0 Async Persistence)

- [x] **Micro-step 4.1: Database Engine & Session Factory**
  - Configured async engine with `aiosqlite`: `sqlite+aiosqlite:///./plearning.db`.
  - Created `async_sessionmaker` with `expire_on_commit=False`.
- [x] **Micro-step 4.2: Relational ORM Mapping (`models.py`)**
  - Defined relational tables: `courses`, `modules`, `lessons`, `assignments`, `enrollments`, `student_progress`, `submissions`, `evaluations`, `assessments`, `assessment_attempts`.
  - Configured cascading relationships (`cascade="all, delete-orphan"`).
  - Stored complex lists (e.g. questions, answers) as serialized JSON strings.
- [x] **Micro-step 4.3: SQLAlchemy Repositories**
  - Implemented async query methods using SQLAlchemy 2.0 `select()` and `session.merge()`.

---

### Phase 5: Interface Layer (FastAPI Routers, Schemas & DI)

- [x] **Micro-step 5.1: Pydantic v2 Request & Response Schemas**
  - Configured input constraints: `min_length=1`, `ge=0, le=100`.
  - Configured `model_config = {"from_attributes": True}` on all response schemas to enable seamless conversion from dataclass DTOs.
- [x] **Micro-step 5.2: Dependency Injection Container (`dependencies.py`)**
  - Wires `AsyncSession -> Repository -> ApplicationService` using FastAPI's `Depends()`.
- [x] **Micro-step 5.3: Build 7 REST Routers**
  - `course_router.py` (`POST /create_courses`, `GET /view_*`, `PUT /view_*`)
  - `enrollment_router.py` (`POST /enroll_courses`, `GET /enroll_courses/{id}`)
  - `content_router.py` (`GET /watch_content/...`)
  - `progress_router.py` (`PUT /update_progress`, `GET /update_progress/...`)
  - `submission_router.py` (`POST /submit_assignment`, `GET /submit_assignment/...`)
  - `evaluation_router.py` (`POST /evaluate_assignment`, `GET /evaluate_assignment/...`)
  - `assessment_router.py` (`POST /start_assessment`, `POST /submit_assessment`)
- [x] **Micro-step 5.4: Domain-to-HTTP Exception Mapping**
  - Mapped `CourseNotFoundError` -> `HTTP 404`
  - Mapped `NotEnrolledError` -> `HTTP 403`
  - Mapped `AlreadyEnrolledError` / `DuplicateSubmissionError` -> `HTTP 400`
- [x] **Micro-step 5.5: Lifespan Database Bootstrapping**
  - Implemented `@asynccontextmanager async def lifespan(app)` to run `init_db()` upon startup.

---

### Phase 6: Integration Testing & Test Coverage Auditing

- [x] **Micro-step 6.1: Async Test Harness Setup (`conftest.py`)**
  - Created isolated SQLite test database engine (`test_plearning.db`).
  - Implemented `app.dependency_overrides[get_session]`.
  - Configured `httpx.ASGITransport(app=app)` for fast, in-process HTTP tests.
- [x] **Micro-step 6.2: Integration Test Suites (8 Tests)**
  - `test_course_api.py`: Full curriculum hierarchy creation, reading, and updating.
  - `test_enrollment_api.py`: Enrollment creation, duplicate rejection, and student retrieval.
  - `test_content_and_progress_api.py`: Unenrolled 403 check, watch content, and progress progression.
  - `test_submission_and_evaluation_api.py`: Homework submission, duplicate check, and grading.
  - `test_assessment_api.py`: Quiz attempt start, answering, and state checks.
- [x] **Micro-step 6.3: Coverage Verification**
  - Total tests: **48 passed in 3.68s**.
  - Total coverage: **92%** across all source files.

---

### Phase 7: Packaging, Entrypoint Unification & Git Remote Connection

- [x] **Micro-step 7.1: Entrypoint Modularization**
  - Created `src/plearning/app.py` for FastAPI app factory.
  - Unified root `main.py` and `src/main.py` to prevent circular imports.
  - Supported both `python main.py` and `uvicorn main:app --reload`.
- [x] **Micro-step 7.2: Documentation Generation**
  - Built comprehensive [`README.md`](README.md) with quick start and step-by-step API curl examples.
  - Built architectural [`REVISION_GUIDE.md`](REVISION_GUIDE.md) detailing language idioms (`__all__`, `__post_init__`, `@dataclass(frozen=True)`).
  - Updated all doc links to repository-relative paths (`src/plearning/...`).
- [x] **Micro-step 7.3: Git Version Control Setup & Remote Push**
  - Initialized Git, set default branch to `main`.
  - Created comprehensive [`.gitignore`](.gitignore) for Python/FastAPI/SQLite.
  - Connected remote repository: `https://github.com/kanchansketch/pLearning.git`.
  - Rebased and pushed all commits cleanly to `origin/main`.

---

## 3. Micro-Verification Matrix

| Layer | Requirement | Test Suite | Status |
|---|---|---|---|
| **Domain** | Aggregate invariants & re-ordering | `tests/unit/domain/test_course.py` | Verified (6/6) |
| **Domain** | Module & Lesson containment | `tests/unit/domain/test_module.py`, `test_lesson.py` | Verified (6/6) |
| **Domain** | Assignment validation | `tests/unit/domain/test_assignment.py` | Verified (3/3) |
| **Domain** | Progress percentage calculation | `tests/unit/domain/test_student_progress.py` | Verified (3/3) |
| **Domain** | Submission & score range check | `tests/unit/domain/test_submission.py` | Verified (3/3) |
| **Domain** | Assessment state machine transitions | `tests/unit/domain/test_assessment.py` | Verified (2/2) |
| **Application** | Course CRUD & tree traversal | `tests/unit/application/test_course_service.py` | Verified (4/4) |
| **Application** | Enrollment idempotency & progress init | `tests/unit/application/test_enrollment_service.py` | Verified (3/3) |
| **Application** | Content protection & progress tracking | `tests/unit/application/test_content_and_progress_service.py` | Verified (3/3) |
| **Application** | Homework submission & evaluation flow | `tests/unit/application/test_submission_service.py` | Verified (4/4) |
| **Application** | Assessment attempt submission | `tests/unit/application/test_assessment_service.py` | Verified (3/3) |
| **Interface / HTTP** | Full Course API endpoints | `tests/integration/test_course_api.py` | Verified (2/2) |
| **Interface / HTTP** | Enrollment API endpoints | `tests/integration/test_enrollment_api.py` | Verified (2/2) |
| **Interface / HTTP** | Content & Progress endpoints | `tests/integration/test_content_and_progress_api.py` | Verified (1/1) |
| **Interface / HTTP** | Submission & Grading endpoints | `tests/integration/test_submission_and_evaluation_api.py` | Verified (1/1) |
| **Interface / HTTP** | Assessment Quiz endpoints | `tests/integration/test_assessment_api.py` | Verified (2/2) |
| **Integration** | Total Automated Verification | `pytest -v` | **48/48 Passed (100%)** |
