import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Filter, 
  Play, 
  List, 
  ArrowRight, 
  Camera, 
  Zap, 
  ChevronLeft, 
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useApp } from '../context/AppContext';
import { streakData, badges } from '../data/staticData';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, courses, activeCourse, setActiveCourseId, resetAllProgress } = useApp();
  const [filterCategory, setFilterCategory] = useState('All');
  const [hasNotification, setHasNotification] = useState(true);

  // Enrolled courses (courses other than currently active course)
  const enrolledCourses = courses.filter((c) => c.id !== activeCourse?.id);

  // Filtered courses
  const displayedEnrolledCourses = filterCategory === 'All' 
    ? enrolledCourses 
    : enrolledCourses.filter(c => c.category.toLowerCase() === filterCategory.toLowerCase());

  // Month days generator for streak calendar
  const calendarDays = Array.from({ length: streakData.totalDays }, (_, i) => i + 1);

  // Calculate target progress percentage
  const weeklyTarget = user?.weeklyTargetHours || 4;
  const weeklyDone = user?.weeklyCompletedHours || 3;
  const weeklyPercent = Math.min(100, Math.round((weeklyDone / weeklyTarget) * 100));

  const handleResumeCourse = (courseId) => {
    if (courseId) {
      setActiveCourseId(courseId);
    }
    navigate('/classroom');
  };

  return (
    <div className="min-h-screen w-full bg-background flex flex-col font-sans">
      <div className="flex-1 flex min-h-screen overflow-hidden">
        
        {/* Left Column: Navigation Sidebar */}
        <Sidebar />

        {/* Middle Column: Main Dashboard Content (Scrollable) */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-8">
          
          {/* Header Area */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-heading font-bold tracking-tight text-foreground">
                Welcome back, {user?.name?.split(' ')[0] || 'Learner'}
              </h1>
              <p className="text-sm text-muted-foreground">
                You are on a {user?.streak || 12}-day learning streak. Keep it going!
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={resetAllProgress}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border hover:bg-card text-muted-foreground hover:text-foreground text-xs font-medium transition-colors cursor-pointer"
                title="Reset progress to defaults"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo</span>
              </button>

              <button 
                onClick={() => setHasNotification(!hasNotification)}
                className="p-2.5 rounded-xl border border-border hover:bg-card text-foreground transition-colors relative cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                {hasNotification && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-primary rounded-full ring-2 ring-background"></span>
                )}
              </button>
              
              <button 
                onClick={() => setFilterCategory(filterCategory === 'All' ? 'Writing' : 'All')}
                className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors cursor-pointer text-foreground"
              >
                <Filter className="w-4 h-4 text-muted-foreground" />
                {filterCategory === 'All' ? 'Filter Courses' : `Filter: ${filterCategory}`}
              </button>
            </div>
          </div>

          {/* Continue Learning Hero Card */}
          {activeCourse && (
            <div className="bg-card rounded-2xl border border-border/80 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 transition-all hover:border-primary/40">
              {/* Hero Image */}
              <div className="md:col-span-5 relative h-52 md:h-auto min-h-[220px]">
                <img
                  src="https://uxmagic.blob.core.windows.net/public/agent-images/active-lesson-hero-1791824470647-qrgh3gaeuig.png"
                  alt={activeCourse.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent"></div>
                <span className="absolute top-4 left-4 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                  Active Course
                </span>
              </div>

              {/* Hero Details */}
              <div className="md:col-span-7 p-6 lg:p-8 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-primary uppercase tracking-wider">
                    Module 4: Spatial Moods
                  </p>
                  <h2 className="text-xl lg:text-2xl font-heading font-bold text-foreground leading-tight">
                    {activeCourse.title}
                  </h2>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {activeCourse.description}
                  </p>
                </div>

                {/* Progress Bar & Actions */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground font-medium">
                      Course progress: {activeCourse.progress}%
                    </span>
                    <span className="text-foreground font-semibold">
                      {activeCourse.completedLessons} / {activeCourse.totalLessons} lessons
                    </span>
                  </div>
                  <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-tertiary h-full rounded-full transition-all duration-500"
                      style={{ width: `${activeCourse.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => handleResumeCourse(activeCourse.id)}
                      className="flex-1 sm:flex-none px-5 py-3 bg-primary text-primary-foreground hover:bg-primary/95 font-semibold rounded-xl text-sm text-center transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Resume Lesson</span>
                    </button>
                    <button
                      onClick={() => handleResumeCourse(activeCourse.id)}
                      className="p-3 rounded-xl border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      title="View Syllabus"
                    >
                      <List className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enrolled Courses Grid Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-heading font-bold tracking-tight text-foreground">
                Enrolled Courses
              </h3>
              <a
                href="#all-courses"
                onClick={(e) => {
                  e.preventDefault();
                  handleResumeCourse(activeCourse?.id);
                }}
                className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {displayedEnrolledCourses.map((course) => (
                <div
                  key={course.id}
                  onClick={() => handleResumeCourse(course.id)}
                  className="bg-card rounded-2xl border border-border/80 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all hover:border-primary/30 cursor-pointer group"
                >
                  {course.image ? (
                    <div className="h-40 relative overflow-hidden">
                      <img
                        src="https://uxmagic.blob.core.windows.net/public/agent-images/course-writer-1791824480581-lkdzge2kv2.png"
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-3 left-3 bg-card/90 backdrop-blur-sm text-foreground text-xs font-semibold px-2.5 py-1 rounded-lg">
                        {course.category}
                      </span>
                    </div>
                  ) : (
                    <div className="h-40 relative bg-slate-900 flex items-center justify-center text-center p-6 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 to-slate-900 opacity-90"></div>
                      <div className="relative space-y-2 text-white">
                        <Camera className="w-8 h-8 text-primary mx-auto" />
                        <p className="text-xs tracking-widest uppercase font-semibold text-primary/90">
                          {course.category}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <h4 className="font-heading font-bold text-base text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                        {course.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Instructor: {course.teacherName}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {course.description}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-border/50">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>{course.progress}% ({course.completedLessons} / {course.totalLessons} lessons)</span>
                      </div>
                      <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-tertiary h-full rounded-full transition-all duration-500"
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>

        {/* Right Column: Sticky Learning Progress & Analytics Panel */}
        <aside className="w-80 bg-card border-l border-border p-6 space-y-8 hidden xl:block shrink-0 overflow-y-auto">
          
          {/* Circular Progress Indicator */}
          <div className="bg-muted/40 rounded-2xl p-5 border border-border/50 text-center space-y-4">
            <h4 className="text-sm font-semibold text-foreground">
              Weekly Target Progress
            </h4>

            {/* SVG Radial Ring */}
            <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-border"
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                ></path>
                <path
                  className="text-tertiary"
                  strokeDasharray={`${weeklyPercent}, 100`}
                  strokeWidth="3"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                ></path>
              </svg>
              <div className="absolute text-center">
                <span className="text-2xl font-bold text-foreground">{weeklyPercent}%</span>
                <p className="text-[10px] text-muted-foreground uppercase font-semibold">
                  Complete
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              {weeklyDone} of {weeklyTarget} hours completed this week. You are on track!
            </p>
          </div>

          {/* Streak Calendar */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-semibold text-foreground">Learning Streak</h4>
              <span className="text-xs text-tertiary font-bold flex items-center gap-1">
                <Zap className="w-4 h-4 fill-current" />
                {user?.streak || 12} Days Active
              </span>
            </div>

            {/* Monthly Grid representation */}
            <div className="bg-muted/30 rounded-2xl p-4 border border-border/50 space-y-3">
              <div className="flex justify-between items-center text-xs text-muted-foreground font-medium">
                <span>{streakData.month} {streakData.year}</span>
                <div className="flex gap-1.5">
                  <button className="p-1 hover:bg-card rounded-md transition-colors" title="Previous Month">
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button className="p-1 hover:bg-card rounded-md transition-colors" title="Next Month">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold text-muted-foreground">
                <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {/* Blank day for start of month offset */}
                <div className="aspect-square"></div>
                {/* Days */}
                {calendarDays.slice(0, 20).map((day) => {
                  const isActive = streakData.activeDays.includes(day);
                  return (
                    <div
                      key={day}
                      className={`aspect-square rounded-lg flex items-center justify-center text-xs font-semibold ${
                        isActive
                          ? 'bg-tertiary text-white shadow-sm'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Achievements */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Recent Badges</h4>
            <div className="space-y-2.5">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-center gap-3 p-3 bg-accent text-accent-foreground rounded-xl border border-accent/30 shadow-sm"
                >
                  <span className="w-8 h-8 rounded-lg bg-tertiary flex items-center justify-center text-white shrink-0">
                    <Zap className="w-4 h-4 fill-current" />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-foreground">{badge.title}</p>
                    <p className="text-[10px] text-muted-foreground">{badge.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </aside>

      </div>
    </div>
  );
}
