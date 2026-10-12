import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Bell, 
  Search,
  Filter, 
  Play, 
  BookOpen, 
  ArrowRight, 
  Camera, 
  Zap, 
  Star,
  Clock,
  CheckCircle2,
  PlusCircle,
  RotateCcw,
  Sparkles,
  Award,
  Layers,
  GraduationCap
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useApp } from '../context/AppContext';
import { streakData, badges } from '../data/staticData';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'explore' ? 'explore' : 'enrolled';

  const { 
    user, 
    courses, 
    activeCourse, 
    setActiveCourseId, 
    enrollCourse, 
    searchQuery, 
    setSearchQuery, 
    resetAllProgress 
  } = useApp();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [hasNotification, setHasNotification] = useState(true);
  const [enrollToast, setEnrollToast] = useState(null);

  // Categories list
  const categories = ['All', 'Architecture', 'Cinematography', 'Writing', 'Engineering'];

  // Helper to get accurate counts for any course
  const getCourseStats = (course) => {
    const total = (course.modules || []).reduce((sum, m) => sum + (m.lessons?.length || 0), 0);
    const completed = (course.modules || []).reduce((sum, m) => sum + (m.lessons?.filter(l => l.isCompleted)?.length || 0), 0);
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, progress };
  };

  // Check if current user is enrolled in a course
  const isEnrolledInCourse = (course) => {
    return Boolean(course.isEnrolled || user?.enrolledCourseIds?.includes(course.id));
  };

  // Filtered & searched courses
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      // Category match
      const matchCategory = selectedCategory === 'All' || c.category.toLowerCase() === selectedCategory.toLowerCase();

      // Search match
      const q = searchQuery.trim().toLowerCase();
      const matchSearch = !q || 
        c.title.toLowerCase().includes(q) || 
        c.description.toLowerCase().includes(q) || 
        c.teacherName.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q);

      // Tab match
      const matchTab = activeTab === 'explore' 
        ? true 
        : isEnrolledInCourse(c);

      return matchCategory && matchSearch && matchTab;
    });
  }, [courses, selectedCategory, searchQuery, activeTab, user?.enrolledCourseIds]);

  // Handle enrollment
  const handleEnroll = (e, course) => {
    e.stopPropagation();
    enrollCourse(course.id);
    setEnrollToast(`🎉 Successfully enrolled in "${course.title}"!`);
    setTimeout(() => setEnrollToast(null), 4000);
  };

  // Handle opening classroom
  const handleOpenCourse = (courseId) => {
    setActiveCourseId(courseId);
    navigate('/classroom');
  };

  // Active course stats
  const activeStats = activeCourse ? getCourseStats(activeCourse) : { total: 0, completed: 0, progress: 0 };

  // Weekly hours progress
  const weeklyTarget = user?.weeklyTargetHours || 5;
  const weeklyDone = user?.weeklyCompletedHours || 3.5;
  const weeklyPercent = Math.min(100, Math.round((weeklyDone / weeklyTarget) * 100));

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
              <p className="text-sm text-muted-foreground mt-0.5">
                You are on a {user?.streak || 14}-day learning streak. Keep up the momentum!
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={resetAllProgress}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border hover:bg-card text-muted-foreground hover:text-foreground text-xs font-medium transition-colors cursor-pointer"
                title="Reset progress to default initial state"
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
            </div>
          </div>

          {/* Toast Notification Banner */}
          {enrollToast && (
            <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 px-5 py-3 rounded-xl flex items-center justify-between text-xs font-semibold animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{enrollToast}</span>
              </div>
              <button 
                onClick={() => setEnrollToast(null)}
                className="hover:text-emerald-400 font-bold px-2 py-0.5 rounded cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Continue Learning Hero Card (Current Active Course) */}
          {activeCourse && (
            <div className="relative rounded-3xl overflow-hidden bg-card border border-border p-6 lg:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm group">
              <div className="space-y-4 max-w-xl z-10">
                <div className="flex items-center gap-2">
                  <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    In Progress
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {activeCourse.category} · Instructor {activeCourse.teacherName}
                  </span>
                </div>

                <h2 className="text-xl lg:text-2xl font-heading font-bold text-foreground leading-tight">
                  {activeCourse.title}
                </h2>

                <p className="text-xs lg:text-sm text-muted-foreground line-clamp-2">
                  {activeCourse.description}
                </p>

                {/* Accurate Dynamic Progress Bar */}
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Course Completion</span>
                    <span className="font-semibold text-foreground">
                      {activeStats.progress}% ({activeStats.completed} of {activeStats.total} lessons)
                    </span>
                  </div>
                  <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-primary h-full rounded-full transition-all duration-500" 
                      style={{ width: `${activeStats.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    onClick={() => handleOpenCourse(activeCourse.id)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs tracking-wide shadow-md hover:bg-primary/95 transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Resume in Classroom</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Course Hero Image */}
              <div className="relative w-full md:w-72 h-44 rounded-2xl overflow-hidden shrink-0 shadow-md border border-border/50">
                <img 
                  src={activeCourse.image || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80'} 
                  alt={activeCourse.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-3 left-3 text-white text-xs font-semibold">
                  {activeStats.completed}/{activeStats.total} Lessons Done
                </div>
              </div>
            </div>
          )}

          {/* ── Search & Course Discovery Section ── */}
          <div className="space-y-5">
            
            {/* Top Toolbar: Search Bar + Tab Toggles */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              {/* Tab Selector: My Courses vs Explore Catalog */}
              <div className="flex items-center gap-2 p-1 bg-muted rounded-xl w-fit">
                <button
                  onClick={() => setActiveTab('enrolled')}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'enrolled'
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  My Enrolled Courses ({courses.filter(isEnrolledInCourse).length})
                </button>
                <button
                  onClick={() => setActiveTab('explore')}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'explore'
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <span>Explore Catalog ({courses.length})</span>
                </button>
              </div>

              {/* Search Input */}
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search courses, instructors, topics..."
                  className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1 mr-1 shrink-0">
                <Filter className="w-3.5 h-3.5" />
                <span>Filter:</span>
              </span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                      : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Course Grid Cards */}
            {filteredCourses.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl p-12 text-center space-y-3">
                <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto stroke-1" />
                <h3 className="font-heading font-bold text-base text-foreground">
                  No courses found
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  {searchQuery 
                    ? `No courses matched your search "${searchQuery}". Try different keywords.`
                    : 'No courses match this filter category.'}
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                    setActiveTab('explore');
                  }}
                  className="px-4 py-2 bg-secondary text-secondary-foreground text-xs font-semibold rounded-xl hover:bg-muted transition-colors cursor-pointer"
                >
                  Clear Filters & Show All
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {filteredCourses.map((course) => {
                  const stats = getCourseStats(course);
                  const enrolled = isEnrolledInCourse(course);

                  return (
                    <div
                      key={course.id}
                      onClick={() => enrolled && handleOpenCourse(course.id)}
                      className={`bg-card border border-border rounded-2xl overflow-hidden flex flex-col justify-between group transition-all duration-300 hover:shadow-lg hover:border-primary/40 ${enrolled ? 'cursor-pointer' : ''}`}
                    >
                      {/* Course Image & Badges */}
                      <div className="h-44 relative overflow-hidden bg-muted">
                        <img
                          src={course.image || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80'}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-lg border border-white/10">
                          {course.category}
                        </span>

                        <div className="absolute top-3 right-3 flex items-center gap-1.5">
                          {enrolled ? (
                            <span className="bg-emerald-500/90 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Enrolled</span>
                            </span>
                          ) : (
                            <span className="bg-primary/90 backdrop-blur-md text-primary-foreground text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-sm">
                              Available
                            </span>
                          )}
                        </div>

                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                          <span className="flex items-center gap-1 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded font-medium">
                            <Clock className="w-3 h-3 text-primary" />
                            <span>{course.duration || '5 hours'}</span>
                          </span>
                          <span className="flex items-center gap-1 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded font-medium">
                            <Star className="w-3 h-3 text-amber-400 fill-current" />
                            <span>{course.rating || '4.9'}</span>
                          </span>
                        </div>
                      </div>

                      {/* Course Content Details */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <h4 className="font-heading font-bold text-base text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                            {course.title}
                          </h4>
                          <p className="text-xs text-muted-foreground flex items-center gap-2">
                            <span>Instructor:</span>
                            <span className="font-medium text-foreground/90">{course.teacherName}</span>
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {course.description}
                          </p>
                        </div>

                        {/* Progress or Lessons Count */}
                        <div className="space-y-3 pt-3 border-t border-border">
                          {enrolled ? (
                            <div className="space-y-1.5">
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Curriculum Progress</span>
                                <span className="font-bold text-foreground">
                                  {stats.progress}% ({stats.completed}/{stats.total} lessons)
                                </span>
                              </div>
                              <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                                  style={{ width: `${stats.progress}%` }}
                                ></div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span className="flex items-center gap-1.5">
                                <Layers className="w-3.5 h-3.5 text-primary" />
                                <span>{stats.total} Total Lessons</span>
                              </span>
                              <span>{course.difficulty || 'All Levels'}</span>
                            </div>
                          )}

                          {/* Action Buttons: Resume vs Enroll Now */}
                          <div className="pt-1">
                            {enrolled ? (
                              <button
                                onClick={() => handleOpenCourse(course.id)}
                                className="w-full py-2.5 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                              >
                                <Play className="w-3.5 h-3.5 fill-current text-primary" />
                                <span>Continue Learning</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                onClick={(e) => handleEnroll(e, course)}
                                className="w-full py-2.5 bg-primary hover:bg-primary/95 text-primary-foreground font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                              >
                                <PlusCircle className="w-3.5 h-3.5" />
                                <span>Enroll in Course</span>
                              </button>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </main>

        {/* Right Column: Sticky Learning Analytics Panel */}
        <aside className="w-80 bg-card border-l border-border p-6 space-y-8 hidden xl:block shrink-0 overflow-y-auto">
          
          {/* Circular Weekly Target Indicator */}
          <div className="bg-muted/40 rounded-2xl p-5 border border-border/50 text-center space-y-4">
            <h4 className="text-sm font-semibold text-foreground">
              Weekly Target Progress
            </h4>

            <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-border"
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-primary transition-all duration-1000 ease-out"
                  strokeDasharray={`${weeklyPercent}, 100`}
                  strokeWidth="3"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-xl font-heading font-bold text-foreground">
                  {weeklyPercent}%
                </span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  Goal Met
                </span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              <strong className="text-foreground">{weeklyDone} hrs</strong> completed of your {weeklyTarget} hrs weekly target.
            </p>
          </div>

          {/* Learning Streak Calendar Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-foreground">
                Learning Streak
              </h4>
              <span className="text-xs font-bold text-primary flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 fill-current" />
                {user?.streak || 14} Days
              </span>
            </div>

            <div className="bg-muted/40 rounded-2xl p-4 border border-border/50 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                <span>{streakData.month} {streakData.year}</span>
                <span className="text-[11px] text-primary">Active</span>
              </div>

              <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] text-muted-foreground font-semibold">
                <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
              </div>

              <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
                {Array.from({ length: streakData.startDayOffset }, (_, i) => (
                  <div key={`empty-${i}`} className="w-7 h-7"></div>
                ))}
                {Array.from({ length: streakData.totalDays }, (_, i) => i + 1).map((day) => {
                  const isActive = streakData.activeDays.includes(day);
                  return (
                    <div
                      key={day}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-semibold transition-colors ${
                        isActive
                          ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                          : 'text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Badges / Achievements */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground">
              Recent Badges
            </h4>
            <div className="space-y-2">
              {badges.map((b) => (
                <div key={b.id} className="p-3 bg-muted/40 rounded-xl border border-border/50 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-semibold text-foreground">{b.title}</h5>
                    <p className="text-[10px] text-muted-foreground">{b.description}</p>
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
