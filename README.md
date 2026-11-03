# pLearning — Adaptive Learning Platform (V2)

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC.svg)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-53%20Passed%20(85%25%20Coverage)-brightgreen.svg)]()
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)
[![Architecture](https://img.shields.io/badge/Architecture-Clean%20DDD-orange.svg)]()

A modern, production-ready adaptive learning platform built with **FastAPI**, **SQLAlchemy 2.0 (Async)**, and **React 19 (Vite + Tailwind CSS v4)** following strict **Domain-Driven Design (DDD)** and Clean Architecture principles.

---

## Table of Contents

- [Overview & Architecture](#overview--architecture)
- [Key Features](#key-features)
  - [1. Learner Experience](#1-learner-experience)
  - [2. Teacher Studio & Curriculum Builder](#2-teacher-studio--curriculum-builder)
  - [3. Profile, Theming & Identity](#3-profile-theming--identity)
  - [4. Backend Domain & Architecture](#4-backend-domain--architecture)
- [Demo Credentials](#demo-credentials)
- [Project Directory Structure](#project-directory-structure)
- [Quickstart Guide](#quickstart-guide)
  - [Local Development (Backend + Frontend)](#local-development-backend--frontend)
  - [Docker Compose (One-Command Full-Stack)](#docker-compose-one-command-full-stack)
  - [WSL2 / Linux Automation Scripts](#wsl2--linux-automation-scripts)
- [Interactive API Documentation](#interactive-api-documentation)
- [API Reference Walkthrough](#api-reference-walkthrough)
- [Running Automated Tests](#running-automated-tests)
- [DevOps & Production Deployment](#devops--production-deployment)
- [Architectural Decision Records](#architectural-decision-records)

---

## Overview & Architecture

pLearning was designed from the ground up to demonstrate enterprise software engineering practices:

```
┌────────────────────────────────────────────────────────────────────────┐
│                          PRESENTATION LAYER                            │
│  React 19 SPA (Vite)  •  Tailwind CSS v4  •  Lucide Icons  •  Chart.js  │
│  Pages: /dashboard  •  /classroom  •  /teacher/dashboard  •  /teacher/curriculum │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST & LocalStorage Fallback
┌───────────────────────────────────▼────────────────────────────────────┐
│                       INTERFACE LAYER (FastAPI)                        │
│  9 Router Modules  •  Pydantic v2 Schemas  •  CORS  •  Dependency Injection │
│  /auth  •  /teacher  •  /courses  •  /enrollment  •  /progress  •  /submission │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ DTOs (Data Transfer Objects)
┌───────────────────────────────────▼────────────────────────────────────┐
│                           APPLICATION LAYER                            │
│  Use Case Services: CourseService, TeacherService, AuthService,       │
│  EnrollmentService, ProgressService, SubmissionService, AssessmentService │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Domain Entities & Contracts
┌───────────────────────────────────▼────────────────────────────────────┐
│                         DOMAIN LAYER (Pure DDD)                        │
│  Aggregates (Course), Entities (Module, Lesson, Assignment, Submission)│
│  Typed Value Objects (CourseId, etc.), Domain Invariants & Exceptions │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Repository Interfaces (ABCs)
┌───────────────────────────────────▼────────────────────────────────────┐
│                      INFRASTRUCTURE LAYER (Async)                      │
│  Async SQLAlchemy 2.0  •  aiosqlite / asyncpg  •  Seeder & Migrations   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Key Features

### 1. Learner Experience
- **Interactive Learner Dashboard (`/dashboard`)**:
  - Live streak tracker, weekly study goal charts (Chart.js), enrolled courses, and completion progress bars.
  - Explore & Enroll Modal: Instant course catalog search and one-click enrollment.
- **Dynamic Classroom (`/classroom`)**:
  - **Fluid Video Player & Rich-Text Reader**: Multi-format lesson viewer (MP4/YouTube embeds and formatted study materials).
  - **Sequential Unlock Progression**: Lessons unlock sequentially upon completion; prevents skipping ahead.
  - **Homework Submission Engine**: In-browser text submission for lesson assignments with real-time submission history.
  - **Assessment & Quiz Engine**: Interactive multi-question assessments with automatic grading and status tracking.
- **Accurate Real-Time Progress Calculation**:
  - Automatically updates completed lesson IDs and computes percentage progress across all course modules.

### 2. Teacher Studio & Curriculum Builder
- **Teacher Analytics Dashboard (`/teacher/dashboard`)**:
  - Real-time KPIs: Active Students, Published Courses, Average Completion Rate, and Weekly Studio Hours.
  - Course status toggling: Instant transition between `Published` and `Draft`.
- **Visual Curriculum Builder (`/teacher/curriculum`)**:
  - Hierarchical tree manager: Create, edit, reorder, and remove Modules, Lessons, and Homework Assignments.
  - Lesson content configuration: Video URLs, rich text/markdown explanations, duration, and access tiers (Free Preview vs Enrolled).
  - Syncs directly to the backend via `POST /teacher/curriculum/save`.

### 3. Profile, Theming & Identity
- **Dual-Role Authentication (`/login`)**:
  - Seamless toggle between Learner and Teacher roles.
  - Pre-seeded with production-like demo users and course datasets.
- **Interactive User Profile Modal**:
  - Avatar selection gallery, name/email editing, role switching on the fly, and dark/light UI theme toggling.
  - Persistent profile changes saved to browser storage and backend sync.

### 4. Backend Domain & Architecture
- **Clean Architecture & Strict DDD**:
  - Zero external dependencies in the domain core (`dataclasses`, `typing`, `uuid`, `enum`).
  - Consistency boundaries strictly enforced via the `Course` aggregate root.
  - Strongly typed ID value objects (`CourseId`, `ModuleId`, `LessonId`, etc.).
- **Async Database Architecture**:
  - Fully asynchronous with SQLAlchemy 2.0 and `aiosqlite` (easily switched to PostgreSQL via `asyncpg`).
  - Automatic table creation and automated data seeder on application startup.
- **Fault-Tolerant Offline Sync**:
  - Frontend `apiService.js` detects backend availability; gracefully falls back to localStorage if running standalone.

---

## Demo Credentials

The application comes pre-loaded with comprehensive demo data. You can log in using either role:

| Role | Email | Password | Pre-seeded Features |
|---|---|---|---|
| **Teacher** | `marcus@plearning.edu` | `password123` | Full access to Teacher Studio, course analytics, and Curriculum Builder |
| **Learner** | `alex@plearning.edu` | `password123` | Active enrollment in *Advanced Architectural Lighting*, quiz attempts, and streak |

*(You can also register a new account on the login page or switch roles at any time from the profile menu).*

---

## Project Directory Structure

```
pLearning/
├── frontend/                               # React 19 Frontend Web Application
│   ├── src/
│   │   ├── components/                     # Reusable UI components
│   │   │   ├── ClassroomHeader.jsx         # Top navigation bar & breadcrumbs
│   │   │   ├── Sidebar.jsx                 # Collapsible navigation sidebar
│   │   │   └── UserProfileModal.jsx        # Account settings, avatars & theme modal
│   │   ├── pages/                          # Application views
│   │   │   ├── ClassroomPage.jsx           # Video player, curriculum tree & assignments
│   │   │   ├── CurriculumBuilderPage.jsx   # Visual course editor for teachers
│   │   │   ├── DashboardPage.jsx           # Student learning hub & progress metrics
│   │   │   ├── LoginPage.jsx               # Role-based sign-in & registration
│   │   │   └── TeacherDashboardPage.jsx    # Teacher studio KPIs & course management
│   │   ├── context/                        # Global state management
│   │   │   └── AppContext.jsx              # React context for user, course & active lesson
│   │   ├── services/                       # API integration & persistence
│   │   │   ├── apiService.js               # Full-stack HTTP client with fallback
│   │   │   ├── authService.js              # Authentication helpers & demo tokens
│   │   │   └── storageService.js           # Resilient localStorage cache manager
│   │   ├── data/                           # Fallback static datasets
│   │   └── App.jsx                         # React Router route registry
│   ├── package.json                        # Frontend dependencies & scripts
│   └── vite.config.js                      # Vite config with backend /api proxy
│
├── src/                                    # Python FastAPI Backend (Clean DDD)
│   ├── main.py                             # Internal application entrypoint
│   └── plearning/
│       ├── app.py                          # FastAPI factory, CORS & lifespan seeder
│       ├── domain/                         # Pure Domain Layer (Zero external deps)
│       │   ├── entities/                   # Course, Module, Lesson, Assignment, Submission
│       │   ├── value_objects/              # Strongly typed IDs (CourseId, LessonId, etc.)
│       │   ├── repositories/               # Abstract Repository Interfaces (ABCs)
│       │   └── exceptions.py               # Domain business exceptions
│       ├── application/                    # Application Use Cases & DTOs
│       │   ├── dtos/                       # Immutable Data Transfer Objects
│       │   └── services/                   # CourseService, TeacherService, AuthService, etc.
│       ├── infrastructure/                 # Persistence & External Integrations
│       │   ├── persistence/                # Async SQLAlchemy 2.0 models & repositories
│       │   │   ├── database.py             # Async engine & sessionmaker
│       │   │   ├── models.py               # Database ORM schema mappings
│       │   │   └── seeder.py               # Automated initial data populator
│       │   └── in_memory/                  # High-speed in-memory test repositories
│       └── interface/                      # FastAPI Web Layer
│           ├── api/
│           │   ├── dependencies.py         # Dependency injection container
│           │   └── routers/                # 9 modular REST API routers
│           └── schemas/                    # Pydantic v2 validation models
│
├── tests/                                  # Automated Test Suite (53 Tests)
│   ├── unit/                               # Domain & application service unit tests
│   └── integration/                        # Full HTTP API & database integration tests
│
├── docker-compose.yml                      # Multi-container orchestration (FastAPI + Nginx)
├── Dockerfile                              # Multi-stage production container build
├── nginx/
│   └── default.conf                        # Nginx reverse proxy & static SPA configuration
├── wsl/                                    # Linux / WSL2 deployment & maintenance scripts
│   ├── setup_wsl.sh                        # Automated environment bootstrapper
│   ├── deploy.sh                           # Zero-downtime deployment script
│   └── backup.sh                           # Automated SQLite backup & rotation script
├── main.py                                 # Root entrypoint script
├── requirements.txt                        # Python dependencies
├── pyproject.toml                          # Pytest & coverage configuration
├── DEVELOPMENT_PROCESS.md                  # Comprehensive engineering process log
└── REVISION_GUIDE.md                       # Architectural design notes & Python idioms
```

---

## Quickstart Guide

### Local Development (Backend + Frontend)

#### Step 1: Start the FastAPI Backend

1. **Activate the Python virtual environment:**
   ```powershell
   # Windows PowerShell
   .\.pLearning\Scripts\Activate.ps1
   # (Or: python -m venv .venv && .\.venv\Scripts\Activate.ps1)

   # macOS / Linux
   source .pLearning/bin/activate
   # (Or: python3 -m venv .venv && source .venv/bin/activate)
   ```

2. **Install dependencies (if not already installed):**
   ```bash
   pip install -r requirements.txt
   ```

3. **Start the backend server:**
   ```bash
   python main.py
   # Or using uvicorn directly:
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```
   *The backend will automatically initialize `plearning.db` and seed demo data on first start.*
   *Health endpoint:* `http://localhost:8000/health`

#### Step 2: Start the React Frontend

In a separate terminal:

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start Vite development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   ```
   http://localhost:5173
   ```

---

### Docker Compose (One-Command Full-Stack)

Run both the FastAPI backend and Nginx-powered frontend in containers with a single command:

```bash
# Build and run containers in detached mode
docker-compose up --build -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

- **Web Application**: `http://localhost:3000`
- **FastAPI API**: `http://localhost:8000`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`

To stop the containers:
```bash
docker-compose down
```

---

### WSL2 / Linux Automation Scripts

Production-grade automation shell scripts are included in the [`wsl/`](wsl/) directory:

- **Environment Setup**:
  ```bash
  chmod +x wsl/*.sh
  ./wsl/setup_wsl.sh
  ```
  *Installs Python 3.11, Node.js 20, Docker, and Nginx on Debian/Ubuntu/WSL2.*

- **Production Deployment**:
  ```bash
  ./wsl/deploy.sh
  ```
  *Performs dependency audits, executes the test suite, builds frontend static assets, and restarts services.*

- **Database Backup & Snapshot**:
  ```bash
  ./wsl/backup.sh
  ```
  *Creates timestamped, compressed SQLite database backups with automatic 7-day retention cleanup.*

---

## Interactive API Documentation

FastAPI generates interactive OpenAPI documentation:

- **Swagger UI Client**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc Specification**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

You can test authentication, course creation, progress updates, and submissions directly in the browser!

---

## API Reference Walkthrough

### 1. Authentication & Users (`/auth`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/login` | Authenticate user with email, password & role |
| `POST` | `/auth/register` | Register new student or teacher account |
| `GET` | `/auth/profile/{user_id}` | Retrieve profile information |
| `PUT` | `/auth/profile` | Update profile bio, avatar, and specializations |
| `GET` | `/auth/users` | List all registered users (filter by role) |

### 2. Teacher Studio (`/teacher`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/teacher/analytics` | Fetch studio KPIs (learners, courses, completion %) |
| `GET` | `/teacher/courses` | List courses owned by teacher with stats |
| `POST` | `/teacher/courses` | Create new course draft |
| `PUT` | `/teacher/courses/{id}/status` | Publish or unpublish a course |
| `GET` | `/teacher/curriculum/{id}` | Fetch full hierarchical curriculum tree |
| `POST` | `/teacher/curriculum/save` | Batch save entire curriculum structure |

### 3. Courses & Curriculum
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/create_courses` | Create course with nested modules & lessons |
| `GET` | `/view_courses` | List courses with optional teacher filter |
| `GET` | `/view_courses/{id}` | Retrieve detailed course breakdown |
| `GET` | `/view_modules/{course_id}` | Retrieve modules in a course |
| `GET` | `/view_lessons/{course_id}/{module_id}` | Retrieve lessons in a module |
| `GET` | `/view_assignments/{course_id}/{module_id}/{lesson_id}` | Retrieve lesson assignments |
| `GET` | `/view_all_courses` | Searchable course catalog for exploration |

### 4. Enrollments & Access
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/enroll_courses` | Enroll student into a course |
| `GET` | `/enrolled_courses` | List all enrollments for a student |
| `GET` | `/watch_content/{course_id}/{module_id}/{lesson_id}` | Access lesson content (enrolled only) |

### 5. Progress Tracking
| Method | Endpoint | Description |
|---|---|---|
| `PUT` | `/update_progress` | Mark lesson completed / update progress percentage |
| `GET` | `/progress/{course_id}/{student_id}` | Fetch student course progress record |

### 6. Submissions & Evaluations
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/submit_assignment` | Submit homework text for a lesson assignment |
| `GET` | `/submissions/{assignment_id}` | List submissions for an assignment |
| `POST` | `/evaluate_assignment` | Grade submission and leave teacher feedback |
| `GET` | `/evaluations/{submission_id}` | Retrieve grade & feedback for a submission |

### 7. Assessments & Quizzes
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/start_assessment` | Begin an assessment attempt |
| `POST` | `/submit_assessment` | Submit answers and trigger auto-grading |
| `GET` | `/assessments/{assessment_id}` | Fetch assessment details and questions |

---

## Running Automated Tests

The test suite covers unit domain logic, application use cases, and full HTTP integration endpoints.

```bash
# Run the entire test suite (53 tests)
pytest -v

# Run domain and application unit tests
pytest tests/unit -v

# Run HTTP API integration tests
pytest tests/integration -v

# Run tests with code coverage report
coverage run -m pytest tests/
coverage report --include="src/*"
```

**Verification Results:**
```
============================= 53 passed in 4.16s =============================
Code Coverage: 85% across all application modules
Domain Layer Coverage: 97% - 100%
```

---

## DevOps & Production Deployment

### Docker Multi-Stage Build
The included [`Dockerfile`](Dockerfile) uses a lean `python:3.11-slim` base image with non-root layer caching and built-in health checks.

### Nginx Reverse Proxy
The [`nginx/default.conf`](nginx/default.conf) file coordinates:
- Serving compiled Vite frontend static assets with cache headers.
- Reverse proxying `/api` requests to the FastAPI backend container on port `8000`.
- Handling SPA client-side routing fallback (`try_files $uri $uri/ /index.html`).

---

## Architectural Decision Records

For detailed documentation on design choices, entity boundaries, and implementation patterns, refer to:
- [`DEVELOPMENT_PROCESS.md`](DEVELOPMENT_PROCESS.md) — Step-by-step engineering log from Phase 0 to Phase 10.
- [`REVISION_GUIDE.md`](REVISION_GUIDE.md) — Architectural patterns, language idioms (`__all__`, `__post_init__`, `@dataclass(frozen=True)`), and domain invariant enforcement.

---

## License

This project is licensed under the MIT License.
