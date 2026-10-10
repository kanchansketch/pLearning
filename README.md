# pLearning — Adaptive Learning Platform (V1)

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![Tests](https://img.shields.io/badge/Tests-48%20Passed%20(92%25%20Coverage)-brightgreen.svg)]()
[![Architecture](https://img.shields.io/badge/Architecture-Clean%20DDD-orange.svg)]()

A clean, production-grade learning management platform implementing **Domain-Driven Design (DDD)** and built with **FastAPI**, **SQLAlchemy 2.0 (Async)**, and **Pydantic v2**.

---

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Running the Application](#running-the-application)
- [Interactive API Documentation](#interactive-api-documentation)
- [API Usage Walkthrough (Step-by-Step)](#api-usage-walkthrough-step-by-step)
  - [1. Create a Course (Teacher)](#1-create-a-course-teacher)
  - [2. View Courses & Curriculum](#2-view-courses--curriculum)
  - [3. Enroll in a Course (Student)](#3-enroll-in-a-course-student)
  - [4. Watch Lesson Content](#4-watch-lesson-content)
  - [5. Update Lesson Progress](#5-update-lesson-progress)
  - [6. Submit an Assignment (Student)](#6-submit-an-assignment-student)
  - [7. Evaluate Assignment (Teacher)](#7-evaluate-assignment-teacher)
  - [8. Take an Assessment / Quiz](#8-take-an-assessment--quiz)
- [Running Tests & Coverage](#running-tests--coverage)
- [Project Structure](#project-structure)

---

## Features

- **Domain-Driven Design (DDD)**: Aggregate roots (`Course`), Child entities (`Module`, `Lesson`, `Assignment`), typed Value Objects (`CourseId`, etc.), and pure domain models.
- **Async Database Architecture**: Asynchronous SQLite (`aiosqlite`) for local development, easily switchable to PostgreSQL via `asyncpg`.
- **FastAPI Endpoints**: 12 core functional requirements mapped to RESTful endpoints with automatic OpenAPI schema validation.
- **Comprehensive Test Suite**: 48 automated tests (Unit & Integration) with **92% code coverage**.

---

## Prerequisites

- **Python 3.10+** (Tested on Python 3.10 and 3.11)
- **Pip** (Python package manager)
- Windows PowerShell / Command Prompt or macOS/Linux Bash

---

## Installation & Setup

### 1. Clone or Open Project Directory

```bash
git clone https://github.com/kanchansketch/pLearning.git
cd pLearning
```

### 2. Activate Virtual Environment

**Create and activate a virtual environment:**

```bash
# Windows
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# macOS / Linux
python3 -m venv .venv
source .venv/bin/activate
```
*(If script execution is restricted: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`)*

**Or create a fresh virtual environment:**
```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1   # Windows
# source .venv/bin/activate     # macOS/Linux
```

### 3. Install Dependencies

```powershell
pip install -r requirements.txt
```

---

## Running the Application

### Option A: Direct Python Execution (Recommended)

Run the entrypoint script directly from the project root:

```powershell
python main.py
```

### Option B: Using Uvicorn CLI

```powershell
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Once started, the server will listen at:
```
http://localhost:8000
```

To verify the server is running, visit `http://localhost:8000/health`:
```json
{
  "status": "ok"
}
```

---

## Interactive API Documentation

Once the server is running, FastAPI automatically generates interactive documentation:

- **Swagger UI (Interactive API Client)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc (Specification Viewer)**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

You can execute queries, inspect schemas, and test every endpoint directly inside Swagger UI!

---

## API Usage Walkthrough (Step-by-Step)

Here is a full student & teacher lifecycle demonstration using `curl` or HTTP requests:

### 1. Create a Course (Teacher)

Create a course with nested modules, lessons, and assignments:

**Request:**
```http
POST /create_courses
Content-Type: application/json
```
```json
{
  "title": "Mastering Domain-Driven Design in Python",
  "description": "Learn Aggregates, Entities, and Clean Architecture",
  "teacher_id": "teacher_alex",
  "modules": [
    {
      "title": "Module 1: DDD Fundamentals",
      "description": "Core concepts and aggregate root patterns",
      "lessons": [
        {
          "title": "Lesson 1: What is an Aggregate?",
          "description": "Deep dive into boundaries and entities",
          "content": "An Aggregate is a cluster of associated objects...",
          "content_url": "https://cdn.example.com/videos/lesson1.mp4",
          "assignments": [
            {
              "title": "Homework 1",
              "description": "Define aggregate boundaries for an e-commerce cart",
              "questions": [
                "What is the aggregate root in the Cart context?",
                "How do you enforce consistency across boundaries?"
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

**Response (HTTP 201 Created):**
```json
{
  "id": "c-9f82ab14-...",
  "title": "Mastering Domain-Driven Design in Python",
  "description": "Learn Aggregates, Entities, and Clean Architecture",
  "teacher_id": "teacher_alex",
  "modules": [
    {
      "id": "m-48d1ec90-...",
      "course_id": "c-9f82ab14-...",
      "title": "Module 1: DDD Fundamentals",
      "order": 1,
      "lessons": [
        {
          "id": "l-12345678-...",
          "module_id": "m-48d1ec90-...",
          "title": "Lesson 1: What is an Aggregate?",
          "assignments": [
            {
              "id": "a-98765432-...",
              "lesson_id": "l-12345678-...",
              "title": "Homework 1"
            }
          ]
        }
      ]
    }
  ],
  "created_at": "2026-10-11T...",
  "updated_at": "2026-10-11T..."
}
```

---

### 2. View Courses & Curriculum

- **List all courses:**
  ```http
  GET /view_courses
  ```
- **Filter courses by teacher:**
  ```http
  GET /view_courses?teacher_id=teacher_alex
  ```
- **View course details:**
  ```http
  GET /view_courses/{course_id}
  ```
- **View course modules:**
  ```http
  GET /view_modules/{course_id}
  ```
- **View module lessons:**
  ```http
  GET /view_lessons/{course_id}/{module_id}
  ```
- **View lesson assignments:**
  ```http
  GET /view_assignments/{course_id}/{module_id}/{lesson_id}
  ```

---

### 3. Enroll in a Course (Student)

Enroll student `"student_sarah"` into the course:

**Request:**
```http
POST /enroll_courses
Content-Type: application/json
```
```json
{
  "student_id": "student_sarah",
  "course_id": "c-9f82ab14-..."
}
```

**Response (HTTP 201 Created):**
```json
{
  "id": "e-b715cd21-...",
  "course_id": "c-9f82ab14-...",
  "student_id": "student_sarah",
  "enrolled_at": "2026-10-11T..."
}
```

*Note: Enrolling again with the same student and course will return `400 Bad Request` with `Student already enrolled`.*

---

### 4. Watch Lesson Content

Access to lesson content requires the student to be enrolled in the course:

**Request:**
```http
GET /watch_content/{course_id}/{module_id}/{lesson_id}?student_id=student_sarah
```

**Response (HTTP 200 OK):**
```json
{
  "id": "l-12345678-...",
  "module_id": "m-48d1ec90-...",
  "title": "Lesson 1: What is an Aggregate?",
  "description": "Deep dive into boundaries and entities",
  "content": "An Aggregate is a cluster of associated objects...",
  "content_url": "https://cdn.example.com/videos/lesson1.mp4",
  "order": 1,
  "assignments": [...]
}
```
*(If an unenrolled student attempts access, `403 Forbidden` is returned).*

---

### 5. Update Lesson Progress

Mark a lesson complete to update course progress:

**Request:**
```http
PUT /update_progress
Content-Type: application/json
```
```json
{
  "student_id": "student_sarah",
  "course_id": "c-9f82ab14-...",
  "lesson_id": "l-12345678-..."
}
```

**Response (HTTP 200 OK):**
```json
{
  "student_id": "student_sarah",
  "course_id": "c-9f82ab14-...",
  "completed_lesson_ids": ["l-12345678-..."],
  "current_lesson_id": null,
  "progress_percentage": 100.0,
  "last_accessed_at": "2026-10-11T..."
}
```

---

### 6. Submit an Assignment (Student)

**Request:**
```http
POST /submit_assignment
Content-Type: application/json
```
```json
{
  "assignment_id": "a-98765432-...",
  "student_id": "student_sarah",
  "content": "In an e-commerce cart, Cart is the root aggregate containing CartItems..."
}
```

**Response (HTTP 201 Created):**
```json
{
  "id": "s-3420194a-...",
  "assignment_id": "a-98765432-...",
  "student_id": "student_sarah",
  "content": "In an e-commerce cart, Cart is the root aggregate containing CartItems...",
  "submitted_at": "2026-10-11T..."
}
```

---

### 7. Evaluate Assignment (Teacher)

Teacher reviews the student's submission and provides grade and feedback:

**Request:**
```http
POST /evaluate_assignment
Content-Type: application/json
```
```json
{
  "submission_id": "s-3420194a-...",
  "score": 95.0,
  "feedback": "Clear explanation of consistency boundaries and invariant enforcement."
}
```

**Response (HTTP 201 Created):**
```json
{
  "id": "ev-8812c3b4-...",
  "submission_id": "s-3420194a-...",
  "score": 95.0,
  "feedback": "Clear explanation of consistency boundaries and invariant enforcement.",
  "evaluated_at": "2026-10-11T..."
}
```

---

### 8. Take an Assessment / Quiz

#### Step 8a: Start Assessment
```http
POST /start_assessment
Content-Type: application/json
```
```json
{
  "assessment_id": "asmt-11223344-...",
  "student_id": "student_sarah"
}
```
**Response:**
```json
{
  "id": "att-99887766-...",
  "assessment_id": "asmt-11223344-...",
  "student_id": "student_sarah",
  "status": "in_progress",
  "answers": [],
  "score": null,
  "started_at": "2026-10-11T...",
  "submitted_at": null
}
```

#### Step 8b: Submit Assessment Answers
```http
POST /submit_assessment
Content-Type: application/json
```
```json
{
  "attempt_id": "att-99887766-...",
  "answers": [
    "An aggregate root controls all internal state transitions",
    "Transactions should only commit one aggregate per unit of work"
  ]
}
```
**Response:**
```json
{
  "id": "att-99887766-...",
  "status": "submitted",
  "answers": [
    "An aggregate root controls all internal state transitions",
    "Transactions should only commit one aggregate per unit of work"
  ],
  "submitted_at": "2026-10-11T..."
}
```

---

## Running Tests & Coverage

The repository is fully equipped with both unit and integration tests.

### Run all tests:
```bash
pytest -v
```

### Run only domain & application unit tests:
```bash
pytest tests/unit -v
```

### Run API integration tests:
```bash
pytest tests/integration -v
```

### Run with coverage report:
```bash
coverage run -m pytest tests/
coverage report --include="src/*"
```

**Test Summary:**
```
============================= 48 passed in 3.68s ==============================
Total Coverage: 92%
```

---

## Project Structure

```
pLearning/
├── src/
│   ├── main.py                        # Internal entrypoint
│   └── plearning/
│       ├── app.py                     # FastAPI application factory
│       ├── domain/                    # Pure Domain Layer (0 dependencies)
│       │   ├── entities/              # Course, Module, Lesson, Assignment, etc.
│       │   ├── value_objects/         # Typed IDs (CourseId, etc.)
│       │   ├── repositories/          # Abstract Repository Interfaces (ABCs)
│       │   └── exceptions.py          # Domain-specific business exceptions
│       ├── application/               # Application Use Cases & DTOs
│       │   ├── dtos/                  # Immutable Data Transfer Objects
│       │   └── services/              # CourseService, EnrollmentService, etc.
│       ├── infrastructure/            # Implementations & Persistence
│       │   ├── persistence/           # Async SQLAlchemy models & repos
│       │   │   ├── database.py        # Engine & sessionmaker
│       │   │   └── models.py          # Relational tables
│       │   └── in_memory/             # Fast test repositories
│       └── interface/                 # FastAPI HTTP Layer
│           ├── api/
│           │   ├── dependencies.py    # DI container (Depends)
│           │   └── routers/           # Individual feature routers
│           └── schemas/               # Pydantic v2 Request/Response schemas
├── tests/
│   ├── unit/                          # Domain & Application tests
│   └── integration/                   # Full HTTP API & DB tests
├── design_goals/                      # Phase-1 design specifications
├── main.py                            # Project root entrypoint
├── pyproject.toml                     # Pytest and build configuration
├── requirements.txt                   # Production & development dependencies
└── REVISION_GUIDE.md                  # Complete architectural decision log
```
