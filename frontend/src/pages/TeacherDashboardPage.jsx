import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Pencil, User, Link2, Settings, LogOut,
  Layers, Search, Plus, Star, Activity, CheckCircle2, Users, ArrowUpRight, Move
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { apiService } from "../services/apiService";

const COURSES = [
  { id: "course_lighting", title: "Advanced Architectural Lighting & Moods", lessons: 14, modules: 3, students: 684, todayNew: 48, completion: 84, rating: 4.9, status: "Published" },
  { id: "course_ux_enterprise", title: "UX/UI Design Systems for Enterprise", lessons: 24, modules: 5, students: 512, todayNew: 12, completion: 72, rating: 4.8, status: "Published" },
  { id: "course_ixd", title: "Introduction to Interaction Design", lessons: 8, modules: 2, students: 286, todayNew: 0, completion: 65, rating: 4.7, status: "Draft" },
];

const METRICS = [
  { label: "Total Enrollment", value: "1,482", delta: "+12.4% this month", icon: Users, color: "bg-primary/10 text-primary", positive: true },
  { label: "Avg. Completion Rate", value: "78.4%", delta: "+3.1% vs last term", icon: CheckCircle2, color: "bg-tertiary/10 text-tertiary", positive: true },
  { label: "Active Learners Now", value: "342", delta: "Live learning session stream", icon: Activity, color: "bg-accent text-accent-foreground", positive: null },
  { label: "Student Satisfaction", value: "4.9 / 5.0", delta: "Based on 412 reviews", icon: Star, color: "bg-amber-100 text-amber-600", positive: null },
];

function TeacherSidebar() {
  const navigate = useNavigate();
  const { user, logout } = useApp();

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col justify-between shrink-0 h-screen sticky top-0 z-20">
      <div className="p-6">
        {/* Brand */}
        <div className="flex items-center gap-3 mb-8 cursor-pointer" onClick={() => navigate("/teacher/dashboard")}>
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground" style={{boxShadow:"0 4px 14px rgba(79,70,229,0.2)"}}>
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="font-heading font-bold text-lg tracking-tight block">pLearning</span>
            <span className="text-xs text-muted-foreground font-mono">STUDIO</span>
          </div>
        </div>

        {/* Role Switcher */}
        <div className="bg-muted p-1.5 rounded-xl flex items-center gap-2 mb-6">
          <div className="bg-card text-foreground text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5">
            <Settings className="w-3.5 h-3.5 text-primary" />
            Teacher
          </div>
          <button onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground text-xs font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ml-auto">
            Switch to Learner
            <Move className="w-3 h-3" />
          </button>
        </div>

        {/* Nav */}
        <nav className="space-y-1.5">
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-secondary text-secondary-foreground font-medium transition-colors">
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </a>
          <button onClick={() => navigate("/teacher/curriculum")} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground font-medium transition-colors text-left">
            <Pencil className="w-5 h-5" />
            <span>Curriculum Builder</span>
          </button>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground font-medium transition-colors">
            <User className="w-5 h-5" />
            <span>Students & Analytics</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground font-medium transition-colors">
            <Link2 className="w-5 h-5" />
            <span>Live Classrooms</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground font-medium transition-colors">
            <Settings className="w-5 h-5" />
            <span>Studio Settings</span>
          </a>
        </nav>
      </div>

      {/* Profile + Sign Out */}
      <div className="p-6 border-t border-border">
        <div className="flex items-center gap-3 mb-4">
          <img src={user?.avatar || "https://randomuser.me/api/portraits/men/32.jpg"} alt="Teacher Avatar" className="w-10 h-10 rounded-full object-cover border border-border" />
          <div className="overflow-hidden">
            <h4 className="font-semibold text-sm truncate">{user?.name || "Prof. Marcus Vance"}</h4>
            <span className="text-xs text-muted-foreground truncate block font-mono">{user?.email || "marcus@plearning.edu"}</span>
          </div>
        </div>
        <button onClick={handleSignOut} className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-border text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/5 transition-all text-sm font-medium">
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

export default function TeacherDashboardPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");
  const [searchQ, setSearchQ] = useState("");
  const [courses, setCourses] = useState(COURSES);
  const [metrics, setMetrics] = useState(METRICS);
  const enrollCtxRef = useRef(null);
  const completionCtxRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [courseList, analytics] = await Promise.all([
          apiService.getTeacherCourses(),
          apiService.getTeacherAnalytics(),
        ]);
        if (isMounted) {
          if (Array.isArray(courseList) && courseList.length > 0) {
            setCourses(courseList);
          }
          if (analytics && analytics.metrics) {
            setMetrics(analytics.metrics.map((m, idx) => ({
              ...m,
              icon: METRICS[idx]?.icon || Users,
              color: METRICS[idx]?.color || "bg-primary/10 text-primary",
            })));
          }
        }
      } catch (err) {
        console.warn("Using offline fallback teacher data:", err);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  const handleToggleStatus = async (courseId, currentStatus) => {
    const nextStatus = currentStatus === "Published" ? "Draft" : "Published";
    setCourses(prev => prev.map(c => c.id === courseId ? { ...c, status: nextStatus } : c));
    try {
      await apiService.updateCourseStatus(courseId, nextStatus);
    } catch (err) {
      console.warn("Failed updating course status:", err);
    }
  };

  const handleCreateCourse = async () => {
    const title = prompt("Enter new course title:");
    if (!title || !title.trim()) return;
    try {
      const created = await apiService.createTeacherCourse({
        title: title.trim(),
        description: "Curriculum draft",
        category: "Architecture & Design",
        status: "Draft",
      });
      setCourses(prev => [created, ...prev]);
      navigate(`/teacher/curriculum?courseId=${created.id}`);
    } catch (err) {
      console.warn("Error creating course:", err);
    }
  };

  const filteredCourses = courses.filter((c) => {
    const q = searchQ.toLowerCase();
    const matchSearch = !q || c.title.toLowerCase().includes(q);
    const matchFilter = filter === "All" || c.status === filter;
    return matchSearch && matchFilter;
  });

  useEffect(() => {
    let Chart;
    const loadChart = async () => {
      try {
        const mod = await import("chart.js/auto");
        Chart = mod.default;

        if (enrollCtxRef.current) {
          new Chart(enrollCtxRef.current, {
            type: "line",
            data: {
              labels: ["Jan","Feb","Mar","Apr","May","Jun"],
              datasets: [{
                label: "Enrollments",
                data: [420, 580, 810, 950, 1220, 1482],
                borderColor: "#4F46E5",
                backgroundColor: "rgba(79,70,229,0.05)",
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: "#4F46E5"
              }]
            },
            options: {
              responsive: true, maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                y: { grid: { color: "rgba(0,0,0,0.04)" }, ticks: { color: "#6B7280", font: { size: 11 } } },
                x: { grid: { display: false }, ticks: { color: "#6B7280", font: { size: 11 } } }
              }
            }
          });
        }

        if (completionCtxRef.current) {
          new Chart(completionCtxRef.current, {
            type: "bar",
            data: {
              labels: ["Adv Lighting","UX Systems","Intro Interaction","Motion Principles","Color Theory"],
              datasets: [{
                label: "Completion %",
                data: [84, 72, 65, 91, 78],
                backgroundColor: ["#10B981","#4F46E5","#4F46E5","#10B981","#4F46E5"],
                borderRadius: 6, borderWidth: 0, barThickness: 24
              }]
            },
            options: {
              responsive: true, maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                y: { max: 100, grid: { color: "rgba(0,0,0,0.04)" }, ticks: { color: "#6B7280", font: { size: 11 } } },
                x: { grid: { display: false }, ticks: { color: "#6B7280", font: { size: 10 } } }
              }
            }
          });
        }
      } catch (e) {
        console.warn("Chart.js not loaded", e);
      }
    };
    loadChart();
  }, []);

  return (
    <div className="min-h-screen w-full bg-background flex text-foreground font-sans">
      <TeacherSidebar />

      <main className="flex-1 overflow-y-auto bg-background p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-heading font-bold text-3xl tracking-tight text-foreground">Course Management Hub</h1>
            <p className="text-muted-foreground text-sm mt-1">Design, monitor, and scale your educational impact with live engagement metrics.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input type="text" placeholder="Search courses, students..." value={searchQ} onChange={(e) => setSearchQ(e.target.value)}
                className="pl-10 pr-4 py-2.5 w-64 rounded-xl border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            </div>
            <button onClick={handleCreateCourse} className="flex items-center gap-2 bg-primary hover:bg-primary/95 text-primary-foreground px-5 py-2.5 rounded-xl font-medium shadow-sm transition-all text-sm cursor-pointer">
              <Plus className="w-4 h-4" /> Create New Course
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((m) => {
            const Icon = m.icon || Users;
            return (
              <div key={m.label} className="bg-card p-6 rounded-2xl border border-border/60 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{m.label}</span>
                  <div className={"w-8 h-8 rounded-lg flex items-center justify-center " + m.color}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <h3 className="font-heading font-bold text-2xl tracking-tight">{m.value}</h3>
                  <p className={"text-xs font-medium flex items-center gap-1 mt-1 " + (m.positive ? "text-tertiary" : "text-muted-foreground")}>
                    {m.positive && <ArrowUpRight className="w-3 h-3" />}
                    {m.delta}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-card p-6 rounded-2xl border border-border/60 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-heading font-bold text-base text-foreground">Enrollment Trends</h3>
                <p className="text-xs text-muted-foreground">Monthly growth analysis of student onboarding</p>
              </div>
              <select className="bg-muted text-xs font-medium px-3 py-1.5 rounded-lg border-none focus:outline-none">
                <option>Last 6 Months</option>
                <option>Last Year</option>
              </select>
            </div>
            <div className="h-64 overflow-hidden">
              <canvas ref={enrollCtxRef} />
            </div>
          </div>
          <div className="bg-card p-6 rounded-2xl border border-border/60 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-heading font-bold text-base text-foreground">Completion Rates</h3>
                <p className="text-xs text-muted-foreground">Comparing student progress across active courses</p>
              </div>
              <span className="text-xs font-semibold bg-tertiary/10 text-tertiary px-2.5 py-1 rounded-full">Goal: &gt;75%</span>
            </div>
            <div className="h-64 overflow-hidden">
              <canvas ref={completionCtxRef} />
            </div>
          </div>
        </div>

        {/* Course Table */}
        <div className="bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-heading font-bold text-base text-foreground">My Active Courses</h3>
              <p className="text-xs text-muted-foreground">Manage curricula, edit content, and view metrics per course.</p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              {["All","Published","Draft"].map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={"px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors " + (filter === f ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground")}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/40 border-b border-border/60 text-xs font-semibold text-muted-foreground uppercase">
                  <th className="py-4 px-6">Course Details</th>
                  <th className="py-4 px-6">Students</th>
                  <th className="py-4 px-6">Completion</th>
                  <th className="py-4 px-6">Rating</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-sm">
                {filteredCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-muted/10 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 overflow-hidden relative">
                          <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-secondary/30" />
                          <Layers className="w-4 h-4 relative z-10" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground leading-snug">{course.title}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">{course.lessons} Lessons · {course.modules} Modules</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{course.students.toLocaleString()}</span>
                        {course.todayNew > 0 ? (
                          <span className="text-xs text-tertiary font-medium bg-tertiary/10 px-1.5 py-0.5 rounded">+{course.todayNew} today</span>
                        ) : (
                          <span className="text-xs text-muted-foreground font-medium">0 today</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="w-full max-w-[120px]">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-medium">{course.completion}%</span>
                        </div>
                        <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                          <div className={"h-full rounded-full " + (course.completion >= 75 ? "bg-tertiary" : "bg-primary")} style={{width: course.completion + "%"}} />
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1 text-amber-500 font-semibold">
                        <Star className="w-4 h-4 fill-amber-500" />
                        <span>{course.rating}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleToggleStatus(course.id, course.status)}
                        title="Click to toggle status (Published / Draft)"
                        className={"inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all hover:opacity-80 " + (course.status === "Published" ? "bg-tertiary/10 text-tertiary" : "bg-muted text-foreground")}>
                        <span className={"w-1.5 h-1.5 rounded-full " + (course.status === "Published" ? "bg-tertiary" : "bg-muted-foreground")} />
                        {course.status}
                      </button>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button onClick={() => navigate(`/teacher/curriculum?courseId=${course.id}`)}
                        className="text-primary hover:text-primary-foreground hover:bg-primary px-3 py-1.5 rounded-lg border border-primary/20 hover:border-primary text-xs font-medium transition-all cursor-pointer">
                        Edit Curriculum
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
