import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, LayoutDashboard, Pencil, User, Link2, Settings, LogOut,
  Layers, Move, Eye, Check, Plus, GripVertical, Folder, Play, File,
  Bookmark, Link, Clock, Shield, Trash2, Funnel, Camera, Inbox
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { apiService } from "../services/apiService";

function TeacherSidebar() {
  const navigate = useNavigate();
  const { user, logout } = useApp();
  const handleSignOut = () => { logout(); navigate("/login"); };

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col justify-between shrink-0 h-screen sticky top-0 z-20">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8 cursor-pointer" onClick={() => navigate("/teacher/dashboard")}>
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground" style={{boxShadow:"0 4px 14px rgba(79,70,229,0.2)"}}>
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="font-heading font-bold text-lg tracking-tight block">pLearning</span>
            <span className="text-xs text-muted-foreground font-mono">STUDIO</span>
          </div>
        </div>
        <div className="bg-muted p-1.5 rounded-xl flex items-center gap-2 mb-6">
          <div className="bg-card text-foreground text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5">
            <Settings className="w-3.5 h-3.5 text-primary" />
            Teacher
          </div>
          <button onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground text-xs font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ml-auto">
            Switch to Learner <Move className="w-3 h-3" />
          </button>
        </div>
        <nav className="space-y-1.5">
          <button onClick={() => navigate("/teacher/dashboard")} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground font-medium transition-colors text-left">
            <LayoutDashboard className="w-5 h-5" /><span>Dashboard</span>
          </button>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-secondary text-secondary-foreground font-medium transition-colors">
            <Pencil className="w-5 h-5" /><span>Curriculum Builder</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground font-medium transition-colors">
            <User className="w-5 h-5" /><span>Students & Analytics</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground font-medium transition-colors">
            <Link2 className="w-5 h-5" /><span>Live Classrooms</span>
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground font-medium transition-colors">
            <Settings className="w-5 h-5" /><span>Studio Settings</span>
          </a>
        </nav>
      </div>
      <div className="p-6 border-t border-border">
        <div className="flex items-center gap-3 mb-4">
          <img src={user?.avatar || "https://randomuser.me/api/portraits/men/32.jpg"} alt="Teacher" className="w-10 h-10 rounded-full object-cover border border-border" />
          <div className="overflow-hidden">
            <h4 className="font-semibold text-sm truncate">{user?.name || "Prof. Marcus Vance"}</h4>
            <span className="text-xs text-muted-foreground truncate block font-mono">{user?.email || "marcus@plearning.edu"}</span>
          </div>
        </div>
        <button onClick={handleSignOut} className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-border text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/5 transition-all text-sm font-medium">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </aside>
  );
}

const MODULES = [
  {
    id: 1, title: "Module 1: Introduction & Setup", active: false,
    lessons: [
      { id: "1.1", title: "1.1 Course Overview & Objectives", type: "Video", active: false },
      { id: "1.2", title: "1.2 Setting up your physical & digital space", type: "Text", active: true },
    ]
  },
  {
    id: 2, title: "Module 2: The Physics of Light", active: false,
    lessons: [
      { id: "2.1", title: "2.1 Color Temperature & Key Light", type: "Video", active: false },
      { id: "2.2", title: "2.2 Creating depth with fill lights", type: "Doc", active: false },
      { id: "2.3", title: "2.3 Practical: Lighting on a budget", type: "Link", active: false },
    ]
  },
  {
    id: 3, title: "Module 3: Advanced Scenarios", active: true,
    lessons: []
  },
];

const TYPE_ICON = { Video: Play, Text: File, Doc: Bookmark, Link: Link };

export default function CurriculumBuilderPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get("courseId") || "course_lighting";

  const [courseTitle, setCourseTitle] = useState("Advanced Architectural Lighting & Moods");
  const [modules, setModules] = useState(MODULES);
  const [activeLesson, setActiveLesson] = useState("1.2");
  const [lessonTitle, setLessonTitle] = useState("Setting up your physical & digital space");
  const [contentTab, setContentTab] = useState("Rich Text Article");
  const [bodyText, setBodyText] = useState(`In this lesson, we will cover the core components needed to construct a professional lighting studio. Lighting is the single most important factor in premium video production, defining the mood, depth, and character of your architectural subjects.

We will focus on:
1. Understanding the Three-Point Lighting system (Key, Fill, and Backlights).
2. Choosing between hard and soft light sources based on the room size.
3. Aligning color temperature (Kelvins) across multiple sources to avoid color contamination.`);
  const [duration, setDuration] = useState("25 minutes");
  const [access, setAccess] = useState("Enrolled Students Only");
  const [filterQ, setFilterQ] = useState("");
  const [saveStatus, setSaveStatus] = useState("Draft Auto-Saved");

  const tabs = ["Rich Text Article", "Video Lecture", "Resource Document", "External Link"];
  const accessOptions = ["Enrolled Students Only", "Public Preview (Free)", "Premium Tier Only"];

  useEffect(() => {
    let isMounted = true;
    async function fetchCurriculum() {
      try {
        const data = await apiService.getCurriculum(courseId);
        if (isMounted && data) {
          if (data.title) setCourseTitle(data.title);
          if (Array.isArray(data.modules) && data.modules.length > 0) {
            setModules(data.modules);
            const firstLes = data.modules[0]?.lessons?.[0];
            if (firstLes) {
              setActiveLesson(firstLes.id);
              setLessonTitle(firstLes.title);
              setContentTab(firstLes.content_type || "Rich Text Article");
              setBodyText(firstLes.content || "");
              setDuration(firstLes.duration || "25 minutes");
              setAccess(firstLes.access || "Enrolled Students Only");
            }
          }
        }
      } catch (err) {
        console.warn("Using offline mock curriculum:", err);
      }
    }
    fetchCurriculum();
    return () => { isMounted = false; };
  }, [courseId]);

  const handleLessonSelect = (lesson) => {
    setActiveLesson(lesson.id);
    setLessonTitle(lesson.title);
    setContentTab(lesson.content_type || lesson.type || "Rich Text Article");
    setBodyText(lesson.content || bodyText);
    setDuration(lesson.duration || "25 minutes");
    setAccess(lesson.access || "Enrolled Students Only");
  };

  const handleSave = async (publish = false) => {
    setSaveStatus("Saving...");
    try {
      const updatedModules = modules.map((m) => ({
        ...m,
        lessons: m.lessons.map((l) =>
          l.id === activeLesson
            ? {
                ...l,
                title: lessonTitle,
                content: bodyText,
                content_type: contentTab,
                duration,
                access,
              }
            : l
        ),
      }));
      setModules(updatedModules);
      await apiService.saveCurriculum(courseId, {
        title: courseTitle,
        modules: updatedModules,
      });
      if (publish) {
        await apiService.updateCourseStatus(courseId, "Published");
      }
      setSaveStatus(publish ? "Published Live" : "Draft Auto-Saved");
    } catch (err) {
      console.warn("Save skipped:", err);
      setSaveStatus("Saved Locally");
    }
  };

  const totalLessons = modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);

  return (
    <div className="min-h-screen w-full bg-background flex text-foreground font-sans">
      <TeacherSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/teacher/dashboard")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-medium transition-colors cursor-pointer">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </button>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-md">Course Builder</span>
              <h2 className="font-heading font-bold text-sm text-foreground">{courseTitle}</h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-foreground font-mono bg-muted px-2.5 py-1 rounded-lg">{saveStatus}</span>
            <button onClick={() => navigate("/classroom")} className="flex items-center gap-1.5 px-4 py-2 border border-border rounded-xl text-sm font-medium hover:bg-muted transition-colors cursor-pointer">
              <Eye className="w-4 h-4" /> Preview Lesson
            </button>
            <button onClick={() => handleSave(true)} className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/95 text-primary-foreground rounded-xl text-sm font-medium shadow-sm transition-colors cursor-pointer">
              <Check className="w-4 h-4" /> Publish Changes
            </button>
          </div>
        </header>

        {/* Split Panel */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Curriculum Tree */}
          <aside className="w-80 bg-card border-r border-border flex flex-col justify-between shrink-0">
            <div className="flex flex-col flex-1 overflow-y-auto">
              <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
                <div>
                  <h3 className="font-heading font-bold text-xs text-muted-foreground uppercase tracking-wider">Course Curriculum</h3>
                  <span className="text-xs text-foreground font-medium">{totalLessons} Lessons · {modules.length} Modules</span>
                </div>
                <button onClick={() => {
                  const title = prompt("Enter module name:");
                  if (title && title.trim()) {
                    setModules(prev => [...prev, { id: `mod_${Date.now()}`, title: title.trim(), active: false, lessons: [] }]);
                  }
                }} className="text-primary hover:text-primary-foreground hover:bg-primary p-1.5 rounded-lg border border-primary/10 transition-all cursor-pointer">
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 border-b border-border">
                <div className="relative">
                  <Funnel className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-3 h-3" />
                  <input type="text" placeholder="Filter lessons..." value={filterQ} onChange={(e) => setFilterQ(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-muted/50 rounded-lg text-xs border border-border/60 focus:outline-none focus:ring-1 focus:ring-primary/20" />
                </div>
              </div>

              <div className="p-4 space-y-4">
                {modules.map((mod) => (
                  <div key={mod.id} className={"space-y-1.5 " + (mod.active ? "border border-dashed border-primary/40 bg-primary/5 p-2 rounded-xl scale-[1.02] shadow-md" : "")}>
                    <div className={"flex items-center justify-between p-2 rounded-lg " + (mod.active ? "" : "hover:bg-muted/50 transition-colors group cursor-grab")}>
                      <div className="flex items-center gap-2 overflow-hidden">
                        <GripVertical className={"w-4 h-4 shrink-0 " + (mod.active ? "text-primary" : "text-muted-foreground/40 group-hover:text-muted-foreground transition-colors")} />
                        <Folder className={"w-4 h-4 shrink-0 text-primary"} />
                        <span className="font-semibold text-xs text-foreground truncate">{mod.title}</span>
                      </div>
                      {mod.active ? (
                        <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-wider">Active Drag</span>
                      ) : (
                        <Settings className="w-3 h-3 text-muted-foreground" />
                      )}
                    </div>

                    {mod.lessons.length > 0 && (
                      <div className="pl-6 space-y-1 border-l border-border/60 ml-3.5">
                        {mod.lessons.filter((l) => !filterQ || l.title.toLowerCase().includes(filterQ.toLowerCase())).map((lesson) => {
                          const Icon = TYPE_ICON[lesson.content_type] || TYPE_ICON[lesson.type] || File;
                          const isActive = lesson.id === activeLesson;
                          return (
                            <div key={lesson.id} onClick={() => handleLessonSelect(lesson)}
                              className={"flex items-center justify-between p-2 rounded-xl transition-colors group cursor-pointer " + (isActive ? "bg-primary/5 border border-primary/20 shadow-sm relative" : "hover:bg-muted/60")}>
                              {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r" />}
                              <div className="flex items-center gap-2 overflow-hidden">
                                <GripVertical className={"w-3 h-3 shrink-0 " + (isActive ? "text-primary/40" : "text-muted-foreground/30 group-hover:text-muted-foreground")} />
                                <Icon className={"w-3 h-3 shrink-0 " + (isActive ? "text-primary" : "text-muted-foreground")} />
                                <span className={"text-xs truncate " + (isActive ? "text-foreground font-semibold" : "text-foreground")}>{lesson.title}</span>
                              </div>
                              <span className={"text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 " + (isActive ? "bg-primary/10 text-primary" : "bg-muted text-foreground")}>{lesson.content_type || lesson.type || "Text"}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {mod.active && mod.lessons.length === 0 && (
                      <div className="pl-6 space-y-1 border-l border-primary/20 ml-3.5">
                        <div className="p-2 bg-card rounded-lg border border-border/80 text-xs text-muted-foreground">
                          Drop lessons here to add to Module 3...
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-border bg-muted/20 space-y-2">
              <button className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl border border-border bg-card hover:bg-muted text-sm font-medium transition-colors cursor-pointer">
                <Plus className="w-4 h-4" /> Add New Module
              </button>
              <button onClick={() => {
                const title = prompt("Enter lesson title:");
                if (title && title.trim()) {
                  const newLesson = {
                    id: `les_${Date.now()}`,
                    title: title.trim(),
                    content: "",
                    content_type: "Rich Text Article",
                    duration: "20 minutes",
                    access: "Enrolled Students Only",
                  };
                  setModules(prev => {
                    const copy = [...prev];
                    if (copy.length === 0) copy.push({ id: `mod_${Date.now()}`, title: "Module 1", lessons: [] });
                    copy[0].lessons.push(newLesson);
                    return copy;
                  });
                  handleLessonSelect(newLesson);
                }
              }} className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/95 text-sm font-medium transition-colors cursor-pointer">
                <Plus className="w-4 h-4" /> Add New Lesson
              </button>
            </div>
          </aside>

          {/* Right: Content Editor */}
          <main className="flex-1 overflow-y-auto bg-background p-8 flex flex-col">
            <div className="flex items-center justify-between pb-6 border-b border-border mb-6">
              <div>
                <span className="text-xs text-muted-foreground font-mono">MODULE • LESSON ACTIVE</span>
                <h1 className="font-heading font-bold text-2xl tracking-tight text-foreground mt-1">Lesson Content Editor</h1>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleSave(false)} className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer" title="Save Draft">
                  <Settings className="w-5 h-5" />
                </button>
                <button onClick={() => {
                  if (window.confirm("Delete this lesson?")) {
                    setModules(prev => prev.map(m => ({
                      ...m,
                      lessons: m.lessons.filter(l => l.id !== activeLesson)
                    })));
                  }
                }} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors cursor-pointer" title="Delete Lesson">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-6 max-w-4xl">
              {/* Lesson Title */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Lesson Title</label>
                <input type="text" value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-input bg-card text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-base" />
              </div>

              {/* Content Format Tabs */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Content Format</label>
                <div className="flex border-b border-border">
                  {tabs.map((tab) => {
                    const Icon = tab === "Rich Text Article" ? File : tab === "Video Lecture" ? Play : tab === "Resource Document" ? Bookmark : Link;
                    return (
                      <button key={tab} onClick={() => setContentTab(tab)}
                        className={"px-5 py-2.5 text-sm font-medium flex items-center gap-2 border-b-2 transition-all " + (contentTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground hover:border-border")}>
                        <Icon className="w-4 h-4" /> {tab}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Editor */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Article Body</label>
                <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
                  <div className="bg-muted/40 border-b border-border px-4 py-2 flex flex-wrap items-center gap-1">
                    {["B","I","U"].map((f) => (
                      <button key={f} className="p-1.5 rounded hover:bg-muted text-foreground transition-colors text-xs font-bold w-7 h-7">{f}</button>
                    ))}
                    <div className="w-px h-5 bg-border mx-1" />
                    {[{ icon: "≡", title: "Bullet List" },{ icon: "1.", title: "Numbered List" }].map((b) => (
                      <button key={b.title} title={b.title} className="p-1.5 rounded hover:bg-muted text-foreground transition-colors text-xs font-bold w-7 h-7">{b.icon}</button>
                    ))}
                    <div className="w-px h-5 bg-border mx-1" />
                    <button title="Link" className="p-1.5 rounded hover:bg-muted text-foreground transition-colors"><Link className="w-3.5 h-3.5" /></button>
                    <button title="Image" className="p-1.5 rounded hover:bg-muted text-foreground transition-colors"><Camera className="w-3.5 h-3.5" /></button>
                  </div>
                  <textarea rows={8} value={bodyText} onChange={(e) => setBodyText(e.target.value)}
                    className="w-full px-5 py-4 bg-transparent text-foreground text-sm focus:outline-none resize-none leading-relaxed"
                    placeholder="Write your lesson content here..." />
                </div>
              </div>

              {/* Upload Zone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Lecture Video (Optional)</label>
                  <div className="border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-6 bg-card flex flex-col items-center justify-center text-center cursor-pointer transition-all">
                    <Camera className="w-8 h-8 text-muted-foreground mb-2" />
                    <span className="text-sm font-semibold text-foreground">Drag & drop video file</span>
                    <span className="text-xs text-muted-foreground mt-1">MP4, MOV, WebM up to 2GB</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Resource Attachment</label>
                  <div className="border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-6 bg-card flex flex-col items-center justify-center text-center cursor-pointer transition-all">
                    <Inbox className="w-8 h-8 text-muted-foreground mb-2" />
                    <span className="text-sm font-semibold text-foreground">Attach lesson files</span>
                    <span className="text-xs text-muted-foreground mt-1">PDF, ZIP, or project assets up to 50MB</span>
                  </div>
                </div>
              </div>

              {/* Meta Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Estimated Completion Time</label>
                  <div className="relative">
                    <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <input type="text" value={duration} onChange={(e) => setDuration(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Access Level</label>
                  <div className="relative">
                    <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <select value={access} onChange={(e) => setAccess(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none">
                      {accessOptions.map((o) => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
