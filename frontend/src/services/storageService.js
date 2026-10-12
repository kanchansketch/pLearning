import { courses as defaultCourses, staticUsers } from '../data/staticData';

const USER_KEY = 'plearning_current_user';
const COURSES_KEY = 'plearning_courses';
const ACTIVE_COURSE_KEY = 'plearning_active_course_id';
const ACTIVE_LESSON_KEY = 'plearning_active_lesson_id';

/**
 * Storage Service — Manages persistence to localStorage with fallback to static mock data
 */
export const storageService = {
  // ── User Storage ─────────────────────────────────────────────
  getUser: () => {
    try {
      const data = localStorage.getItem(USER_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (err) {
      console.warn('Failed reading user from localStorage:', err);
    }
    // Default to the first static user (Alex Mercer)
    const defaultUser = staticUsers[0];
    localStorage.setItem(USER_KEY, JSON.stringify(defaultUser));
    return defaultUser;
  },

  setUser: (user) => {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (err) {
      console.error('Failed saving user to localStorage:', err);
    }
  },

  clearUser: () => {
    try {
      localStorage.removeItem(USER_KEY);
    } catch (err) {
      console.error('Failed clearing user from localStorage:', err);
    }
  },

  // ── Courses Storage ──────────────────────────────────────────
  getCourses: () => {
    try {
      const data = localStorage.getItem(COURSES_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (err) {
      console.warn('Failed reading courses from localStorage:', err);
    }
    // Initialize with static courses
    const initial = JSON.parse(JSON.stringify(defaultCourses));
    localStorage.setItem(COURSES_KEY, JSON.stringify(initial));
    return initial;
  },

  saveCourses: (coursesList) => {
    try {
      localStorage.setItem(COURSES_KEY, JSON.stringify(coursesList));
    } catch (err) {
      console.error('Failed saving courses to localStorage:', err);
    }
  },

  getCourseById: (courseId) => {
    const list = storageService.getCourses();
    return list.find((c) => c.id === courseId) || null;
  },

  getActiveCourse: () => {
    const list = storageService.getCourses();
    const activeId = localStorage.getItem(ACTIVE_COURSE_KEY);
    if (activeId) {
      const found = list.find((c) => c.id === activeId);
      if (found) return found;
    }
    return list.find((c) => c.isActive) || list[0];
  },

  setActiveCourseId: (courseId) => {
    localStorage.setItem(ACTIVE_COURSE_KEY, courseId);
  },

  // ── Lesson Completion & Progress Engine ───────────────────────
  toggleLessonComplete: (courseId, lessonId) => {
    const list = storageService.getCourses();
    let updatedLesson = null;
    let targetCourse = null;

    const updatedCourses = list.map((c) => {
      if (c.id !== courseId) return c;

      let completedCount = 0;
      let totalLessonsCount = c.totalLessons || 0;
      let foundLessons = 0;

      const updatedModules = (c.modules || []).map((m) => {
        let moduleAllCompleted = true;

        const updatedLessons = (m.lessons || []).map((l) => {
          foundLessons++;
          let isLessonCompleted = l.isCompleted;

          if (l.id === lessonId) {
            isLessonCompleted = !l.isCompleted;
            updatedLesson = { ...l, isCompleted: isLessonCompleted };
          }

          if (isLessonCompleted) {
            completedCount++;
          } else {
            moduleAllCompleted = false;
          }

          return { ...l, isCompleted: isLessonCompleted };
        });

        return {
          ...m,
          lessons: updatedLessons,
          isCompleted: moduleAllCompleted && updatedLessons.length > 0,
        };
      });

      // If course had existing count from prior modules not in full array, keep base
      const finalCompleted = Math.max(completedCount, c.completedLessons ? (updatedLesson?.isCompleted ? c.completedLessons + 1 : Math.max(0, c.completedLessons - 1)) : completedCount);
      const finalTotal = Math.max(totalLessonsCount, foundLessons);
      const progressPercent = Math.min(100, Math.round((finalCompleted / finalTotal) * 100));

      targetCourse = {
        ...c,
        modules: updatedModules,
        completedLessons: finalCompleted,
        totalLessons: finalTotal,
        progress: progressPercent,
      };

      return targetCourse;
    });

    storageService.saveCourses(updatedCourses);

    return {
      courses: updatedCourses,
      course: targetCourse,
      lesson: updatedLesson,
    };
  },

  // ── Reset to initial static data ──────────────────────────────
  resetToDefaults: () => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(COURSES_KEY);
    localStorage.removeItem(ACTIVE_COURSE_KEY);
    localStorage.removeItem(ACTIVE_LESSON_KEY);
    return {
      user: storageService.getUser(),
      courses: storageService.getCourses(),
    };
  },
};
