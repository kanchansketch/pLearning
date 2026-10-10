# pLearning V1 — Technical Revision & Architecture Reference

A concise, to-the-point cheat sheet explaining **what** was implemented, **why** it was designed that way, and **every key library, pattern, and Python idiom** used throughout the project.

---

## 1. Architectural Philosophy (DDD + Clean Architecture)

### Why 4-Layer Onion Architecture?
```
Interface (FastAPI)  ──>  Application (Services & DTOs)  ──>  Domain (Entities & Interfaces)
                                                                     ▲
Infrastructure (SQLAlchemy / Repos) ─────────────────────────────────┘
```
- **Rule of Dependency Inversion**: Outer layers depend on inner layers; inner layers never know about outer layers.
- **Why**: The domain logic (`Course`, `StudentProgress`) can run with **zero external libraries**, easily testable in memory without databases or HTTP servers.

### Domain-Driven Design (DDD) Concepts
| Concept | Applied Where | What It Is & Why It's Done |
|---|---|---|
| **Aggregate Root** | [`Course`](src/plearning/domain/entities/course.py) | Top-level entity controlling a cluster of child entities (`Module`, `Lesson`, `Assignment`). Changes to children must pass through root invariants (e.g. sequence re-ordering). |
| **Child Entities** | [`Module`](src/plearning/domain/entities/module.py), [`Lesson`](src/plearning/domain/entities/lesson.py), [`Assignment`](src/plearning/domain/entities/assignment.py) | Objects with unique identity (`id`) whose lifecycle belongs inside an aggregate. |
| **Value Objects / Typed IDs** | [`ids.py`](src/plearning/domain/value_objects/ids.py) | `CourseId`, `ModuleId`, `LessonId`, etc. Wrapping raw strings into distinct types prevents accidental bugs like passing a `ModuleId` where a `CourseId` is expected. |
| **Repository Pattern** | [`domain/repositories/`](src/plearning/domain/repositories) | Abstract Python classes (ABCs) specifying persistence contracts. Decouples domain from SQL/NoSQL storage. |
| **Domain Services** | [`EnrollmentService`](src/plearning/application/services/enrollment_service.py) | Business operations involving multiple aggregates (e.g. validating course exists + checking enrollment status + initializing progress). |
| **Domain Exceptions** | [`exceptions.py`](src/plearning/domain/exceptions.py) | Business errors subclassing `DomainException`. Never raise HTTP exceptions inside domain or application layers. |

---

## 2. Python Language Features, Idioms & Dunder Methods

### `from __future__ import annotations`
- **What**: Postpones evaluation of type annotations at module definition time.
- **Why**:
  1. Prevents circular import errors when typing self-referencing classes (e.g., `Course.modules: List["Module"]`).
  2. Reduces runtime startup cost by treating type hints as strings.

### `__all__`
- **What**: A list of public strings exported when a module is imported via `from module import *`.
- **Applied In**: [`main.py`](main.py) (`__all__ = ["app"]`).
- **Why**: Explicitly controls module API surface and prevents accidental pollution of namespace.

### `@dataclass` vs `@dataclass(frozen=True)`
- **Mutable `@dataclass`**: Used in Domain Entities (`Course`, `StudentProgress`) where state transitions occur (e.g., `mark_lesson_complete()`, `update()`).
- **`@dataclass(frozen=True)`**: Used in Application DTOs (`CreateCourseDTO`, `CourseOut`).
  - **Why**: Makes DTOs strictly read-only and hashable. Prevents use cases from mutating inputs accidentally.

### `__post_init__(self)`
- **What**: Hook executed immediately after `__init__` in `@dataclass`.
- **Why**: Enforces domain invariants at instantiation time (e.g., asserting `title` is not empty, asserting evaluation score is between 0 and 100).

### `copy.deepcopy` in In-Memory Repositories
- **What**: Returns an independent copy of an entity before storing or returning it.
- **Why**: In memory tests, without `deepcopy`, modifying an entity in application code alters the "stored" instance by reference, creating test pollution and leaking state between test runs.

### `sys.path.insert(0, src_dir)`
- **Applied In**: Root [`main.py`](main.py).
- **Why**: Allows running `python main.py` or `uvicorn main:app` directly from the project root without needing to install the package in editable mode (`pip install -e .`).

---

## 3. Libraries & Framework Components

### 1. FastAPI
- **`APIRouter`**: Modular routing split per bounded context (`course_router`, `enrollment_router`, etc.).
- **`Depends()`**: Used for dependency injection. Routers ask for `CourseService = Depends(get_course_service)`, and FastAPI resolves the chain down to `AsyncSession`.
- **`@asynccontextmanager` + `lifespan`**:
  ```python
  @asynccontextmanager
  async def lifespan(app: FastAPI):
      await init_db()  # Run table creation on startup
      yield
  ```
  - **Why**: Replaces deprecated `@app.on_event("startup")` with the modern ASGI lifespan protocol.

### 2. Pydantic v2
- **`Field(..., min_length=1)`**: Validates payloads before reaching application service handlers.
- **`model_config = {"from_attributes": True}`**:
  - **What**: Replaces Pydantic v1's `orm_mode = True`.
  - **Why**: Allows Pydantic models to construct themselves directly from dataclasses or ORM model attributes (not just dicts).
- **`Model.model_validate(obj)`**:
  - **What**: Converts a dataclass DTO (like `CourseOut`) directly into a Pydantic response schema (`CourseResponse`).

### 3. SQLAlchemy 2.0 (Async)
- **`AsyncSession` & `create_async_engine`**: Non-blocking database transactions.
- **`aiosqlite`**: Async SQLite driver for zero-configuration local development and rapid integration testing.
- **`select(Model).where(...)`**: Modern 2.0 select syntax replacing legacy 1.x `session.query()`.
- **`session.merge(model)`**: Upsert mechanism used to persist aggregates and child lists without duplicate primary key collisions.

### 4. Pytest & Pytest-Asyncio
- **`asyncio_mode = "auto"`** in `pyproject.toml`: Automatically treats `async def test_*` as asynchronous fixtures/tests without requiring `@pytest.mark.asyncio` on every single test.
- **`pythonpath = ["src"]`** in `pyproject.toml`: Informs pytest where to resolve package imports (`import plearning...`) without manual environment variable hacks.

### 5. HTTPX (TestClient Alternative)
- **`ASGITransport(app=app)` + `AsyncClient`**:
  - **What**: Async HTTP test client communicating directly over memory via ASGI without opening OS network ports.
  - **Why**: High-speed, realistic API testing matching production request/response flows.

---

## 4. Endpoints & Functional Requirements Matrix

| Goal # | Design Doc Requirement | Endpoint & HTTP Method | Responsible Layer |
|---|---|---|---|
| **1** | Teacher can create course, modules, lessons, assignments | `POST /create_courses` | `CourseService.create_course` |
| **2** | Teacher / Student can view courses | `GET /view_courses` | `CourseService.get_all_courses` |
| **3** | View single course details | `GET /view_courses/{id}` | `CourseService.get_course` |
| **4** | View modules in a course | `GET /view_modules/{course_id}` | `CourseService.get_modules` |
| **5** | View lessons in a module | `GET /view_lessons/{course_id}/{module_id}` | `CourseService.get_lessons` |
| **6** | View assignments in a lesson | `GET /view_assignments/{course_id}/{module_id}/{lesson_id}` | `CourseService.get_assignments` |
| **7** | Student enrolls in a course | `POST /enroll_courses` | `EnrollmentService.enroll` |
| **8** | Student watches lesson content | `GET /watch_content/{cid}/{mid}/{lid}` | `ContentService.watch_content` (requires enrollment) |
| **9** | Track / update student lesson progress | `PUT /update_progress` & `GET /update_progress/{sid}/{cid}` | `ProgressService.update_progress` |
| **10**| Student submits assignment | `POST /submit_assignment` & `GET /submit_assignment/{aid}` | `SubmissionService.submit_assignment` |
| **11**| Teacher evaluates submission | `POST /evaluate_assignment` & `GET /evaluate_assignment/{sid}` | `EvaluationService.evaluate` |
| **12**| Student starts and submits assessment | `POST /start_assessment` & `POST /submit_assessment` | `AssessmentService.start_assessment` |

---

## 5. Test Suite Breakdown

```
tests/
├── unit/
│   ├── domain/                  # 24 tests — Pure logic, 0 IO, instant execution
│   │   ├── test_course.py
│   │   ├── test_module.py
│   │   ├── test_lesson.py
│   │   ├── test_assignment.py
│   │   ├── test_submission.py
│   │   ├── test_student_progress.py
│   │   └── test_assessment.py
│   └── application/             # 16 tests — Use cases using InMemory repos
│       ├── test_course_service.py
│       ├── test_enrollment_service.py
│       ├── test_content_and_progress_service.py
│       ├── test_submission_service.py
│       └── test_assessment_service.py
└── integration/                 # 8 tests — Full HTTP + DB integration
    ├── test_course_api.py
    ├── test_enrollment_api.py
    ├── test_content_and_progress_api.py
    ├── test_submission_and_evaluation_api.py
    └── test_assessment_api.py
```
- **Total Tests**: **48 passing**
- **Test Execution Time**: ~3.6s
- **Code Coverage**: **92%**

---

## 6. Quick Commands

```powershell
# Run the FastAPI server
python main.py

# Access Swagger interactive UI
# Open browser at: http://localhost:8000/docs

# Run all unit and integration tests
.pLearning\Scripts\python.exe -m pytest -v

# Run test coverage report
.pLearning\Scripts\python.exe -m coverage run -m pytest tests/
.pLearning\Scripts\python.exe -m coverage report --include="src/*"
```
