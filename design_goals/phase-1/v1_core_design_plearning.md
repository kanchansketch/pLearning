# Goal - V1

## pLearning platform provide learners to adaptive learninga nd improved success rate aand engagement and evaluation ourslef.

### Functional Requirements

1. /create_courses for teachers with cources, module, lesson, assignment, document upload.
2. /enroll_courses for students to enroll in courses.
3. /watch_content for students to watch content.
4. /update_progress for students to update their progress.
5. /submit_assignment for students to submit assignments.
6. /evaluate_assignment for teachers to evaluate assignments.
7. /start_assessment for students to start assessment.
8. /submit_assessment for students to submit assessment.
9. /view_courses for students to view their courses.
10. /view_modules for students to view their modules.
11. /view_lessons for students to view their lessons.
12. /view_assignments for teachers to view their assignments.

## Non Functional Requirements

1. p95 100ms for read path, p95 500ms for write path
2. support 100k concurrent users with 10% write and 90% read.
3. failure rate < 0.1%
4. High availability and fault tolerance.
5. Support 99.9% uptime
6. Data durability and consistency.

## Domain Entities

1. Course: CourseId, Title, Description, TeacherId
2. Module: ModuleId, CourseId, Title, Description
3. Lesson: LessonId, ModuleId, Title, Description, Content
4. Assignment: AssignmentId, LessonId, Title, Description, Questions, Submissions
5. Submission: SubmissionId, AssignmentId, StudentId, Content
6. Evaluation: EvaluationId, SubmissionId, Score, Feedback
7. Studentprogress: StudentId, CourseId, ModuleId, LessonId, AssignmentId, SubmissionId, Score
