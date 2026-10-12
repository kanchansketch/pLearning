import { courses as defaultCourses, staticUsers } from '../data/staticData';

const USER_KEY = 'plearning_current_user';
const COURSES_KEY = 'plearning_courses_v2';
const ACTIVE_COURSE_KEY = 'plearning_active_course_id';
const ACTIVE_LESSON_KEY = 'plearning_active_lesson_id';

/**
 * Helper: Recalculates exact lesson counts, progress percentages, and sequential lock/unlock status
 */
function recalculateCourseState(course) {
  if (!course || !Array.isArray(course.modules)) return course;

  // Flatten all lessons in order
  const allLessons = [];
  course.modules.forEach((mod) => {
    (mod.lessons || []).forEach((les) => {
      allLessons.push(les);
    });
  });

  const totalLessons = allLessons.length;
  let completedLessons = 0;

  // Compute sequential unlock:
  // - First lesson is always unlocked
  // - Lesson i is unlocked if it is already completed OR previous lesson (i-1) is completed
  allLessons.forEach((lesson, index) => {
    const isDone = Boolean(lesson.isCompleted);
    if (isDone) completedLessons++;

    if (index === 0) {
      lesson.isLocked = false;
    } else {
      const prevLesson = allLessons[index - 1];
      const prevIsCompleted = Boolean(prevLesson.isCompleted);
      // Unlocked if previous is completed or this one is already done
      lesson.isLocked = !(prevIsCompleted || isDone);
    }
  });

  // Update module completed states
  const updatedModules = course.modules.map((mod) => {
    const modLessons = mod.lessons || [];
    const allModDone = modLessons.length > 0 && modLessons.every((l) => l.isCompleted);
    return {
      ...mod,
      isCompleted: allModDone,
    };
  });

  const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return {
    ...course,
    modules: updatedModules,
    totalLessons,
    completedLessons,
    progress,
  };
}

/**
 * Storage Service — Manages persistence to localStorage with accurate progression & enrollment
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
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Always ensure counts and locks are freshly recalculated
          return parsed.map(recalculateCourseState);
        }
      }
    } catch (err) {
      console.warn('Failed reading courses from localStorage:', err);
    }

    // Initialize with fresh default courses
    const initial = defaultCourses.map((c) => recalculateCourseState(JSON.parse(JSON.stringify(c))));
    storageService.saveCourses(initial);
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

  // ── Enrollment Engine ─────────────────────────────────────────
  enrollCourse: (courseId) => {
    const list = storageService.getCourses();
    const user = storageService.getUser();

    const enrolledIds = new Set(user.enrolledCourseIds || []);
    enrolledIds.add(courseId);
    user.enrolledCourseIds = Array.from(enrolledIds);
    storageService.setUser(user);

    const updatedCourses = list.map((c) => {
      if (c.id === courseId) {
        return {
          ...c,
          isEnrolled: true,
          enrolledCount: (c.enrolledCount || 0) + 1,
        };
      }
      return c;
    });

    storageService.saveCourses(updatedCourses);

    return {
      user,
      courses: updatedCourses,
      enrolledCourse: updatedCourses.find((c) => c.id === courseId),
    };
  },

  isCourseEnrolled: (courseId) => {
    const user = storageService.getUser();
    return Boolean(user?.enrolledCourseIds?.includes(courseId));
  },

  // ── Lesson Completion & Unlock Engine ─────────────────────────
  toggleLessonComplete: (courseId, lessonId) => {
    const list = storageService.getCourses();
    let updatedLesson = null;
    let targetCourse = null;

    const updatedCourses = list.map((c) => {
      if (c.id !== courseId) return c;

      // Deep copy modules & lessons
      const newModules = (c.modules || []).map((mod) => ({
        ...mod,
        lessons: (mod.lessons || []).map((l) => {
          if (l.id === lessonId) {
            const nextCompleted = !l.isCompleted;
            updatedLesson = { ...l, isCompleted: nextCompleted };
            return updatedLesson;
          }
          return { ...l };
        }),
      }));

      const freshlyRecalculated = recalculateCourseState({
        ...c,
        modules: newModules,
      });

      targetCourse = freshlyRecalculated;
      return freshlyRecalculated;
    });

    storageService.saveCourses(updatedCourses);

    return {
      courses: updatedCourses,
      course: targetCourse,
      lesson: updatedLesson,
    };
  },

  // ── Reset to Defaults ─────────────────────────────────────────
  resetToDefaults: () => {
    localStorage.removeItem(COURSES_KEY);
    localStorage.removeItem(ACTIVE_COURSE_KEY);
    localStorage.removeItem(ACTIVE_LESSON_KEY);

    const freshUser = JSON.parse(JSON.stringify(staticUsers[0]));
    storageService.setUser(freshUser);

    const freshCourses = defaultCourses.map((c) => recalculateCourseState(JSON.parse(JSON.stringify(c))));
    storageService.saveCourses(freshCourses);

    return {
      user: freshUser,
      courses: freshCourses,
    };
  },
};
