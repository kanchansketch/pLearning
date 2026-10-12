/**
 * pLearning — Static Data Configuration
 *
 * All static data entities mapped from the pLearning domain model:
 * Course, Module, Lesson, Assignment, Submission, Evaluation, StudentProgress
 */

// ── User Profiles (Mock static database) ──────────────────────
export const staticUsers = [
  {
    id: "student_alex",
    name: "Alex Mercer",
    email: "alex.mercer@plearning.edu",
    password: "password123",
    avatar: "https://randomuser.me/api/portraits/men/12.jpg",
    role: "learner",
    streak: 12,
    weeklyTargetHours: 4,
    weeklyCompletedHours: 3,
    title: "Senior Architectural Apprentice",
  },
  {
    id: "teacher_marcus",
    name: "Marcus Vance",
    email: "marcus.vance@plearning.edu",
    password: "password123",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    role: "teacher",
    streak: 45,
    weeklyTargetHours: 8,
    weeklyCompletedHours: 6,
    title: "Director of Learning, StudioLabs",
  },
];

export const currentUser = staticUsers[0];

// ── Courses ───────────────────────────────────────────────────
export const courses = [
  {
    id: "c-arch-spatial-001",
    title: "Architectural Spatial Mastery",
    description:
      "Master the delicate interplay between shadows, natural light beams, and concrete textures to craft premium atmospheres.",
    teacherId: "teacher_marcus",
    teacherName: "Marcus Vance",
    category: "Architecture",
    image:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
    isActive: true,
    progress: 68,
    completedLessons: 12,
    totalLessons: 18,
    modules: [
      {
        id: "m-intro-001",
        courseId: "c-arch-spatial-001",
        title: "Introduction to Spatial Design",
        description: "Core spatial design principles and philosophy",
        order: 1,
        isCompleted: true,
        lessons: [
          {
            id: "l-intro-001",
            moduleId: "m-intro-001",
            title: "Course Overview",
            description: "An overview of spatial design principles",
            content:
              "Welcome to Architectural Spatial Mastery. In this course, you will learn the fundamentals of spatial design...",
            contentUrl: "https://cdn.example.com/videos/intro-overview.mp4",
            order: 1,
            duration: "12 min",
            type: "video",
            isCompleted: true,
            assignments: [],
          },
          {
            id: "l-intro-002",
            moduleId: "m-intro-001",
            title: "Defining Spatial Philosophy",
            description: "How spatial philosophy shapes architectural design",
            content:
              "Spatial philosophy explores the relationship between form, light, and human experience...",
            contentUrl:
              "https://cdn.example.com/videos/spatial-philosophy.mp4",
            order: 2,
            duration: "15 min",
            type: "document",
            isCompleted: true,
            assignments: [],
          },
        ],
      },
      {
        id: "m-light-003",
        courseId: "c-arch-spatial-001",
        title: "Lighting Foundations",
        description: "Understand different types of light and shadows",
        order: 3,
        isCompleted: true,
        lessons: [
          {
            id: "l-light-001",
            moduleId: "m-light-003",
            title: "Hard vs Soft Light",
            description:
              "Exploring the differences between hard and soft light sources",
            content:
              "Hard light creates sharp, defined shadows while soft light produces gentle, diffused illumination...",
            contentUrl: "https://cdn.example.com/videos/hard-soft-light.mp4",
            order: 1,
            duration: "14 min",
            type: "video",
            isCompleted: true,
            assignments: [],
          },
          {
            id: "l-light-002",
            moduleId: "m-light-003",
            title: "Shadows as Geometry",
            description: "Using shadows as architectural design elements",
            content:
              "Shadows are not merely the absence of light — they are geometric tools...",
            contentUrl:
              "https://cdn.example.com/videos/shadows-geometry.mp4",
            order: 2,
            duration: "16 min",
            type: "video",
            isCompleted: true,
            assignments: [],
          },
        ],
      },
      {
        id: "m-moods-004",
        courseId: "c-arch-spatial-001",
        title: "Spatial Moods",
        description:
          "Advanced techniques for crafting mood through light and space",
        order: 4,
        isCompleted: false,
        isActive: true,
        lessons: [
          {
            id: "l-moods-001",
            moduleId: "m-moods-004",
            title: "Natural Light Beams",
            description:
              "Harnessing natural light beams for dramatic interior effect",
            content:
              "Natural light beams create dynamic visual patterns that shift throughout the day...",
            contentUrl:
              "https://cdn.example.com/videos/natural-light.mp4",
            order: 1,
            duration: "20 min",
            type: "video",
            isCompleted: true,
            assignments: [],
          },
          {
            id: "l-moods-002",
            moduleId: "m-moods-004",
            title: "Advanced Lighting & Moods",
            description:
              "In this lesson, we break down the practical application of directional light cones and soft bounce angles to define interior volume, using raw concrete backdrops.",
            content:
              "This session covers the architectural lighting style seen in premium gallery design. By arranging high-contrast lighting sources, we create depth and focus on the natural textures of building elements.",
            contentUrl:
              "https://cdn.example.com/videos/advanced-lighting.mp4",
            contentImage:
              "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80",
            order: 2,
            duration: "18 min",
            type: "video",
            isCompleted: false,
            isActive: true,
            keyTakeaways: [
              "Understanding bounce ratios off matte vs polished surfaces.",
              "Setting up artificial light arrays to simulate natural sunbeams.",
              "Controlling shadow density to emphasize architectural volume.",
            ],
            assignments: [
              {
                id: "a-moods-001",
                lessonId: "l-moods-002",
                title: "Lighting Mood Board Assignment",
                description:
                  "Create a mood board using directional lighting techniques from the lesson",
                questions: [
                  "How does the angle of directional light affect the mood of a concrete interior?",
                  "Describe three scenarios where soft bounce light would be preferred over direct lighting.",
                ],
              },
            ],
          },
          {
            id: "l-moods-003",
            moduleId: "m-moods-004",
            title: "Shadows & Textures",
            description:
              "Combining shadow play with material textures for depth",
            content:
              "The interplay between shadows and material textures creates visual depth...",
            contentUrl:
              "https://cdn.example.com/videos/shadows-textures.mp4",
            order: 3,
            duration: "22 min",
            type: "video",
            isCompleted: false,
            isLocked: true,
            assignments: [],
          },
        ],
      },
    ],
  },
  {
    id: "c-writing-002",
    title: "Creative Non-Fiction: Finding Your Voice",
    description:
      "Learn editorial prose techniques, narrative hooks, and how to tell true stories with maximum narrative impact.",
    teacherId: "teacher_joan",
    teacherName: "Joan Didion & Malcolm Gladwell",
    category: "Writing",
    image:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80",
    isActive: false,
    progress: 40,
    completedLessons: 4,
    totalLessons: 10,
    modules: [],
  },
  {
    id: "c-cinema-003",
    title: "Cinematography Foundations: Light & Lenses",
    description:
      "An in-depth study of focal lengths, camera movement, and painting with light to build dramatic cinematic narratives.",
    teacherId: "teacher_roger",
    teacherName: "Roger Deakins, ASC",
    category: "Cinematography",
    image: null, // Uses gradient placeholder
    isActive: false,
    progress: 90,
    completedLessons: 18,
    totalLessons: 20,
    modules: [],
  },
];

// ── Learning Streak Data ──────────────────────────────────────
export const streakData = {
  month: "October",
  year: 2024,
  activeDays: [1, 2, 3, 4, 7, 8, 9, 10, 11, 12],
  totalDays: 31,
  startDayOffset: 1, // Month starts on Tuesday (0=Mon)
};

// ── Badges / Achievements ─────────────────────────────────────
export const badges = [
  {
    id: "badge-consistent",
    title: "Consistent Architect",
    description: "Active 10 consecutive days",
    icon: "zap",
  },
];

// ── Testimonial ───────────────────────────────────────────────
export const testimonial = {
  quote:
    '"An absolute masterclass in distraction-free educational design."',
  author: "Marcus Vance",
  role: "Director of Learning, StudioLabs",
  avatar: "https://randomuser.me/api/portraits/men/32.jpg",
};

// ── Navigation Items ──────────────────────────────────────────
export const sidebarNavItems = [
  { id: "dashboard", label: "Dashboard", icon: "LayoutDashboard", path: "/dashboard" },
  { id: "courses", label: "My Courses", icon: "BookOpen", path: "/classroom" },
  { id: "discover", label: "Discover", icon: "Globe", path: "#" },
  { id: "analytics", label: "Analytics", icon: "Activity", path: "#" },
];

// Helper: Get active course
export const getActiveCourse = () => courses.find((c) => c.isActive);

// Helper: Get active lesson from active course
export const getActiveLesson = () => {
  const course = getActiveCourse();
  if (!course) return null;
  for (const mod of course.modules) {
    for (const lesson of mod.lessons) {
      if (lesson.isActive) return { ...lesson, module: mod, course };
    }
  }
  return null;
};

// Helper: Get enrolled (non-active) courses
export const getEnrolledCourses = () => courses.filter((c) => !c.isActive);
