import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Check, 
  CheckCircle2, 
  Lock, 
  FileText, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Sliders, 
  Download, 
  Send,
  Sparkles
} from 'lucide-react';
import ClassroomHeader from '../components/ClassroomHeader';
import { useApp } from '../context/AppContext';

export default function ClassroomPage() {
  const { activeCourse, toggleLessonComplete } = useApp();

  // Find initial active lesson
  const findInitialLesson = () => {
    if (!activeCourse?.modules) return null;
    for (const mod of activeCourse.modules) {
      for (const lesson of mod.lessons || []) {
        if (lesson.isActive || lesson.id === 'l-moods-002') return lesson;
      }
    }
    return activeCourse?.modules?.[0]?.lessons?.[0] || null;
  };

  const [selectedLessonId, setSelectedLessonId] = useState(() => {
    return findInitialLesson()?.id || 'l-moods-002';
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([
    {
      id: 1,
      name: 'Elena Rostova',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      time: '2 hours ago',
      content: 'The section on bounced light off raw concrete was an eye-opener. How do you adjust the bounce angle in low ambient setups?'
    },
    {
      id: 2,
      name: 'Liam Chen',
      avatar: 'https://randomuser.me/api/portraits/men/33.jpg',
      time: '1 day ago',
      content: 'Highly recommend downloading the HDR map resource attached! It helped replicate the exact overcast lighting in Blender.'
    }
  ]);

  // Current selected lesson object
  let currentLesson = null;
  let currentModule = null;

  if (activeCourse?.modules) {
    for (const mod of activeCourse.modules) {
      for (const les of mod.lessons || []) {
        if (les.id === selectedLessonId) {
          currentLesson = les;
          currentModule = mod;
          break;
        }
      }
      if (currentLesson) break;
    }
  }

  // Fallback if not found
  if (!currentLesson) {
    currentLesson = {
      id: 'l-moods-002',
      title: '4.2 Advanced Architectural Lighting & Moods',
      duration: '18 min',
      isCompleted: false,
      description: 'In this lesson, we break down the practical application of directional light cones and soft bounce angles to define interior volume, using raw concrete backdrops.',
      keyTakeaways: [
        'Understanding bounce ratios off matte vs polished surfaces.',
        'Setting up artificial light arrays to simulate natural sunbeams.',
        'Controlling shadow density to emphasize architectural volume.',
      ],
    };
  }

  const isCurrentCompleted = Boolean(currentLesson.isCompleted);

  // Toggle lesson complete and persist to localStorage
  const handleToggleComplete = () => {
    if (activeCourse?.id && currentLesson?.id) {
      toggleLessonComplete(activeCourse.id, currentLesson.id);
    }
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setComments([
      ...comments,
      {
        id: Date.now(),
        name: 'Alex Mercer',
        avatar: 'https://randomuser.me/api/portraits/men/12.jpg',
        time: 'Just now',
        content: commentText.trim(),
      },
    ]);
    setCommentText('');
  };

  return (
    <div className="min-h-screen w-full bg-background flex flex-col font-sans">
      {/* Top Header */}
      <ClassroomHeader
        course={activeCourse}
        activeLesson={currentLesson}
        progressPercentage={activeCourse?.progress || 68}
        completedCount={activeCourse?.completedLessons || 12}
        totalCount={activeCourse?.totalLessons || 18}
      />

      {/* Split Screen Workspace */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Panel: Interactive Curriculum Tree */}
        <aside className="w-80 bg-card border-r border-border flex flex-col shrink-0 hidden lg:flex">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Course Syllabus
            </h3>
            <span className="text-xs bg-secondary text-secondary-foreground font-bold px-2 py-0.5 rounded-md">
              {activeCourse?.totalLessons || 18} Lessons
            </span>
          </div>

          {/* Scrollable tree list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {(activeCourse?.modules || []).map((mod) => (
              <div key={mod.id} className="space-y-1">
                <div className="flex items-center justify-between p-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <span className={mod.isActive ? 'text-foreground' : ''}>{mod.title}</span>
                  {mod.isCompleted && (
                    <CheckCircle2 className="w-4 h-4 text-tertiary" />
                  )}
                  {mod.isActive && (
                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold">
                      Active
                    </span>
                  )}
                </div>

                <div className="space-y-0.5">
                  {(mod.lessons || []).map((lesson) => {
                    const isSelected = lesson.id === selectedLessonId;
                    return (
                      <button
                        key={lesson.id}
                        disabled={lesson.isLocked}
                        onClick={() => !lesson.isLocked && setSelectedLessonId(lesson.id)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-colors text-left ${
                          isSelected
                            ? 'bg-secondary text-secondary-foreground font-semibold shadow-sm'
                            : lesson.isLocked
                            ? 'opacity-50 cursor-not-allowed text-muted-foreground'
                            : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground cursor-pointer'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {lesson.isLocked ? (
                            <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                          ) : lesson.type === 'document' || lesson.type === 'doc' ? (
                            <FileText className="w-3.5 h-3.5 text-tertiary" />
                          ) : (
                            <Play className={`w-3.5 h-3.5 ${isSelected ? 'text-primary fill-current' : 'text-tertiary'}`} />
                          )}
                          <span className="truncate max-w-[170px]">{lesson.title}</span>
                        </span>

                        {lesson.isCompleted ? (
                          <Check className="w-3.5 h-3.5 text-tertiary stroke-[3]" />
                        ) : isSelected ? (
                          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Right Panel: Media-Rich Content Viewer */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          
          {/* Video Player Container */}
          <div className="bg-black rounded-2xl overflow-hidden aspect-video relative group shadow-xl max-h-[500px] w-full mx-auto">
            <img
              src="https://uxmagic.blob.core.windows.net/public/agent-images/video-frame-1791824538148-q1rk5b4esa.png"
              alt={currentLesson.title}
              className={`w-full h-full object-cover transition-opacity duration-300 ${isPlaying ? 'opacity-95' : 'opacity-85'}`}
            />

            {/* Video Player Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30 flex flex-col justify-between p-4 md:p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              
              {/* Top Bar */}
              <div className="flex justify-between items-center text-white text-xs">
                <span className="font-medium bg-black/40 backdrop-blur-md px-3 py-1 rounded-lg">
                  {currentLesson.title}
                </span>
                <span className="bg-white/10 px-2.5 py-1 rounded-md backdrop-blur-md border border-white/10 font-mono text-[11px]">
                  1080p HD
                </span>
              </div>

              {/* Center Play Button */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white flex items-center justify-center mx-auto transition-transform hover:scale-110 cursor-pointer shadow-lg border border-white/20"
              >
                {isPlaying ? (
                  <Pause className="w-7 h-7 fill-current" />
                ) : (
                  <Play className="w-7 h-7 fill-current pl-1" />
                )}
              </button>

              {/* Bottom Controls */}
              <div className="space-y-3">
                {/* Timeline Track */}
                <div className="relative w-full h-1.5 bg-white/30 hover:h-2 transition-all rounded-full cursor-pointer">
                  <div className="absolute left-0 top-0 bottom-0 bg-primary rounded-full" style={{ width: '45%' }}></div>
                  <div className="absolute left-[45%] top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-md"></div>
                </div>

                <div className="flex justify-between items-center text-white text-xs">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="hover:text-primary transition-colors cursor-pointer"
                    >
                      {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                    </button>
                    
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setIsMuted(!isMuted)}
                        className="hover:text-primary transition-colors cursor-pointer"
                      >
                        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </button>
                      <div className="w-16 h-1 bg-white/30 rounded-full">
                        <div className="bg-white h-full rounded-full" style={{ width: isMuted ? '0%' : '80%' }}></div>
                      </div>
                    </div>

                    <span className="font-mono text-[11px]">08:42 / {currentLesson.duration || '18:15'}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button className="hover:text-primary transition-colors p-1" title="Playback Quality">
                      <Sliders className="w-4 h-4" />
                    </button>
                    <button className="hover:text-primary transition-colors p-1" title="Fullscreen">
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Lesson Info & Primary Action */}
          <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 pb-6 border-b border-border">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                  {currentModule?.title || 'Module 4'} · {currentLesson.title}
                </span>
                <span className="w-1 h-1 rounded-full bg-border"></span>
                <span className="text-xs text-muted-foreground">
                  {currentLesson.duration || '18 min'} duration
                </span>
              </div>
              <h1 className="text-2xl font-heading font-bold text-foreground">
                {currentLesson.title}
              </h1>
              <p className="text-sm text-muted-foreground max-w-3xl">
                {currentLesson.description ||
                  'In this lesson, we break down the practical application of directional light cones and soft bounce angles to define interior volume, using raw concrete backdrops.'}
              </p>
            </div>

            {/* Interactive Complete Button (Saves to localStorage) */}
            <button
              id="complete-btn"
              onClick={handleToggleComplete}
              className={`shrink-0 px-6 py-3.5 font-semibold rounded-xl text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-md cursor-pointer ${
                isCurrentCompleted
                  ? 'bg-tertiary text-white hover:bg-emerald-600'
                  : 'bg-primary text-primary-foreground hover:bg-primary/95'
              }`}
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{isCurrentCompleted ? 'Completed' : 'Mark as Complete'}</span>
            </button>
          </div>

          {/* Tabs Segment (Overview, Resources, Discussion) */}
          <div className="space-y-6">
            <div className="border-b border-border flex gap-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-3 text-sm font-semibold transition-colors cursor-pointer ${
                  activeTab === 'overview'
                    ? 'border-b-2 border-primary text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Lesson Overview
              </button>
              <button
                onClick={() => setActiveTab('resources')}
                className={`pb-3 text-sm font-medium transition-colors cursor-pointer ${
                  activeTab === 'resources'
                    ? 'border-b-2 border-primary text-foreground font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Resources & Files (2)
              </button>
              <button
                onClick={() => setActiveTab('discussion')}
                className={`pb-3 text-sm font-medium transition-colors cursor-pointer ${
                  activeTab === 'discussion'
                    ? 'border-b-2 border-primary text-foreground font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Discussion ({comments.length})
              </button>
            </div>

            {/* Tab 1: Lesson Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-4 text-sm text-muted-foreground max-w-3xl leading-relaxed animate-fade-in">
                <p>
                  {currentLesson.content ||
                    'This session covers the architectural lighting style seen in premium gallery design. By arranging high-contrast lighting sources, we create depth and focus on the natural textures of building elements.'}
                </p>
                <h4 className="font-heading font-bold text-foreground text-sm pt-2">
                  Key Takeaways:
                </h4>
                <ul className="list-disc pl-5 space-y-1.5">
                  {(currentLesson.keyTakeaways || [
                    'Understanding bounce ratios off matte vs polished surfaces.',
                    'Setting up artificial light arrays to simulate natural sunbeams.',
                    'Controlling shadow density to emphasize architectural volume.',
                  ]).map((point, idx) => (
                    <li key={idx}>{point}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tab 2: Resources & Files */}
            {activeTab === 'resources' && (
              <div className="space-y-3 max-w-2xl animate-fade-in">
                <div className="p-4 rounded-xl border border-border bg-card flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary text-secondary-foreground flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Lighting Ratio Reference Sheet.pdf</p>
                      <p className="text-xs text-muted-foreground">PDF Document • 2.4 MB</p>
                    </div>
                  </div>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors cursor-pointer">
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl border border-border bg-card flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary text-secondary-foreground flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Brutalist Studio Scene Assets.zip</p>
                      <p className="text-xs text-muted-foreground">3D Models & HDR Map • 48.6 MB</p>
                    </div>
                  </div>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors cursor-pointer">
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            )}

            {/* Tab 3: Discussion */}
            {activeTab === 'discussion' && (
              <div className="space-y-6 max-w-3xl animate-fade-in">
                {/* Add Comment Input */}
                <form onSubmit={handleAddComment} className="flex gap-3">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Ask a question or share insights..."
                    className="flex-1 px-4 py-2.5 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl text-sm hover:bg-primary/95 flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                    <span>Post</span>
                  </button>
                </form>

                {/* Comment list */}
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="p-4 rounded-xl bg-card border border-border space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <img src={comment.avatar} alt={comment.name} className="w-7 h-7 rounded-full object-cover" />
                          <span className="text-xs font-semibold text-foreground">{comment.name}</span>
                        </div>
                        <span className="text-[11px] text-muted-foreground">{comment.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground pl-9 leading-relaxed">{comment.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </main>

      </div>
    </div>
  );
}
