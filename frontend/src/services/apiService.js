/**
 * pLearning – API Service
 * 
 * Communicates with the FastAPI backend via /api (proxied by Vite) or http://localhost:8000.
 * Falls back gracefully to storageService / static data if the backend is unreachable.
 */

import { storageService } from './storageService';
import { courses as defaultCourses } from '../data/staticData';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let errorDetail = `Request failed: ${response.status} ${response.statusText}`;
    try {
      const errJson = await response.json();
      if (errJson.detail) {
        errorDetail = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail);
      }
    } catch {
      // ignore json parse errors
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const apiService = {
  // ── Health Check ─────────────────────────────────────────────
  async checkHealth() {
    try {
      const res = await request('/health');
      return res.status === 'ok';
    } catch {
      return false;
    }
  },

  // ── Courses ──────────────────────────────────────────────────
  async getCourses() {
    try {
      const serverCourses = await request('/view_all_courses');
      if (Array.isArray(serverCourses) && serverCourses.length > 0) {
        return serverCourses;
      }
      // If server has no courses yet, seed it and return
      await this.seedInitialCourse();
      const updated = await request('/view_all_courses');
      return updated.length > 0 ? updated : storageService.getCourses();
    } catch (err) {
      console.warn('[apiService] Backend unreachable, using local storage:', err.message);
      return storageService.getCourses();
    }
  },

  async getCourseById(courseId) {
    try {
      return await request(`/view_course_curriculum/${courseId}`);
    } catch (err) {
      console.warn(`[apiService] Failed fetching course ${courseId} from backend:`, err.message);
      const localCourses = storageService.getCourses();
      return localCourses.find((c) => c.id === courseId) || null;
    }
  },

  async createCourse(coursePayload) {
    try {
      return await request('/create_courses', {
        method: 'POST',
        body: JSON.stringify(coursePayload),
      });
    } catch (err) {
      console.warn('[apiService] Failed creating course on server:', err.message);
      const courses = storageService.getCourses();
      courses.push(coursePayload);
      storageService.saveCourses(courses);
      return coursePayload;
    }
  },

  // ── Enrollment ───────────────────────────────────────────────
  async enrollStudent(studentId, courseId) {
    try {
      return await request('/enroll_courses', {
        method: 'POST',
        body: JSON.stringify({ student_id: studentId, course_id: courseId }),
      });
    } catch (err) {
      console.warn('[apiService] Failed enrolling on server:', err.message);
      return { student_id: studentId, course_id: courseId, enrolled_at: new Date().toISOString() };
    }
  },

  async getStudentEnrollments(studentId) {
    try {
      return await request(`/enroll_courses/${studentId}`);
    } catch (err) {
      console.warn(`[apiService] Failed fetching enrollments for ${studentId}:`, err.message);
      return [];
    }
  },

  // ── Progress ─────────────────────────────────────────────────
  async updateProgress(studentId, courseId, lessonId) {
    try {
      return await request('/update_progress', {
        method: 'PUT',
        body: JSON.stringify({
          student_id: studentId,
          course_id: courseId,
          completed_lesson_id: lessonId,
        }),
      });
    } catch (err) {
      console.warn('[apiService] Backend progress sync skipped (using local state):', err.message);
      return null;
    }
  },

  async getProgress(studentId, courseId) {
    try {
      return await request(`/update_progress/${studentId}/${courseId}`);
    } catch (err) {
      console.warn('[apiService] Failed fetching progress on server:', err.message);
      const course = storageService.getCourses().find((c) => c.id === courseId);
      return course ? { percentage: course.progress || 0 } : null;
    }
  },

  // ── Submissions & Evaluations ────────────────────────────────
  async submitAssignment(assignmentId, studentId, content) {
    try {
      return await request('/submit_assignment', {
        method: 'POST',
        body: JSON.stringify({
          assignment_id: assignmentId,
          student_id: studentId,
          content: content,
        }),
      });
    } catch (err) {
      console.warn('[apiService] Failed submitting assignment on server:', err.message);
      return storageService.submitAssignment(assignmentId, studentId, content);
    }
  },

  async evaluateAssignment(submissionId, teacherId, score, feedback) {
    try {
      return await request('/evaluate_assignment', {
        method: 'POST',
        body: JSON.stringify({
          submission_id: submissionId,
          teacher_id: teacherId,
          score: score,
          feedback: feedback,
        }),
      });
    } catch (err) {
      console.warn('[apiService] Failed evaluating assignment on server:', err.message);
      return storageService.evaluateAssignment(submissionId, score, feedback);
    }
  },

  // ── Assessments / Quizzes ────────────────────────────────────
  async startAssessment(assessmentId, studentId) {
    try {
      return await request('/start_assessment', {
        method: 'POST',
        body: JSON.stringify({
          assessment_id: assessmentId,
          student_id: studentId,
        }),
      });
    } catch (err) {
      console.warn('[apiService] Failed starting assessment on server:', err.message);
      return { id: `attempt-${Date.now()}`, assessment_id: assessmentId, student_id: studentId, status: 'IN_PROGRESS' };
    }
  },

  async submitAssessment(attemptId, answers) {
    try {
      return await request('/submit_assessment', {
        method: 'POST',
        body: JSON.stringify({
          attempt_id: attemptId,
          answers: answers,
        }),
      });
    } catch (err) {
      console.warn('[apiService] Failed submitting assessment on server:', err.message);
      return { id: attemptId, status: 'GRADED', answers };
    }
  },

  // ── Database Seeding ─────────────────────────────────────────
  async seedInitialCourse() {
    try {
      const template = defaultCourses[0];
      const payload = {
        title: template.title,
        description: template.description,
        teacher_id: template.teacherId,
        modules: template.modules.map((m) => ({
          title: m.title,
          description: m.description,
          lessons: (m.lessons || []).map((l) => ({
            title: l.title,
            content_type: l.contentType || 'VIDEO',
            content_url: l.contentUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            duration_minutes: l.durationMinutes || 15,
            assignments: (l.assignments || []).map((a) => ({
              title: a.title,
              description: a.description,
              max_score: a.maxScore || 100,
            })),
          })),
        })),
      };

      return await request('/create_courses', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.warn('[apiService] Seeding initial course skipped or failed:', err.message);
      return null;
    }
  },
};
