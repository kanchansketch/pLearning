import React, { useState, useEffect, useRef } from 'react';
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
  Sparkles,
  ArrowRight,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  UploadCloud,
  CheckCircle
} from 'lucide-react';
import ClassroomHeader from '../components/ClassroomHeader';
import { useApp } from '../context/AppContext';

export default function ClassroomPage() {
  const { activeCourse, toggleLessonComplete } = useApp();
  const videoRef = useRef(null);

  // Flatten all lessons across modules for sequential navigation
  const allLessons = [];
  if (activeCourse?.modules) {
    activeCourse.modules.forEach((mod) => {
      (mod.lessons || []).forEach((les) => {
        allLessons.push({ ...les, module: mod });
      });
    });
  }

  // Accurate dynamic count of lessons
  const totalCount = allLessons.length;
  const completedCount = allLessons.filter((l) => l.isCompleted).length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Initial lesson selection (first active or first unlocked)
  const [selectedLessonId, setSelectedLessonId] = useState(() => {
    const firstUnlockedIncomplete = allLessons.find((l) => !l.isCompleted && !l.isLocked);
    return firstUnlockedIncomplete?.id || allLessons[0]?.id || 'l-arch-001';
  });

  // Track lesson loading state for skeleton micro-animation
  const [isLoadingLesson, setIsLoadingLesson] = useState(false);
  const [lockedNotice, setLockedNotice] = useState(null);

  // Video player controls
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  // Tabs and interactivity
  const [activeTab, setActiveTab] = useState('overview');
  const [commentText, setCommentText] = useState('');
  const [assignmentAnswer, setAssignmentAnswer] = useState('');
  const [assignmentSubmitted, setAssignmentSubmitted] = useState(false);

  const [comments, setComments] = useState([
    {
      id: 1,
      name: 'Elena Rostova',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=faces&q=80',
      time: '2 hours ago',
      content: 'The section on directional bounce off raw concrete was brilliant! How do you calibrate the beam cone in narrow atrium setups?'
    },
    {
      id: 2,
      name: 'Liam Chen',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces&q=80',
      time: '1 day ago',
      content: 'Highly recommend downloading the sample lighting schedule attached. It helped me map out our gallery installation in Blender.'
    }
  ]);

  // Current selected lesson object
  const currentLessonIndex = allLessons.findIndex((l) => l.id === selectedLessonId);
  const currentLesson = allLessons[currentLessonIndex] || allLessons[0] || {
    id: 'l-arch-001',
    title: '1.1 The Anatomy of Space & Proportion',
    duration: '14 min',
    isCompleted: false,
    isLocked: false,
    description: 'Fundamental principles of architectural space and volume.',
    content: 'Space is an active physical medium governed by human proportion.',
    keyTakeaways: ['Golden ratio volumetric divisions', 'Compression and release pathways'],
  };

  const currentModule = currentLesson?.module || activeCourse?.modules?.[0];
  const isCurrentCompleted = Boolean(currentLesson?.isCompleted);
  const nextLesson = allLessons[currentLessonIndex + 1];

  // Handle lesson selection with loading simulation
  const handleSelectLesson = (lesson) => {
    if (lesson.isLocked) {
      setLockedNotice(`🔒 "${lesson.title}" is locked. Complete the previous lesson to unlock it!`);
      setTimeout(() => setLockedNotice(null), 4000);
      return;
    }

    if (lesson.id === selectedLessonId) return;

    setLockedNotice(null);
    setIsLoadingLesson(true);
    setSelectedLessonId(lesson.id);
    setIsPlaying(false);
    setAssignmentSubmitted(false);
    setAssignmentAnswer('');

    setTimeout(() => {
      setIsLoadingLesson(false);
    }, 280);
  };

  // Video element sync
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration || 0);
    const handleEnded = () => {
      setIsPlaying(false);
      if (!isCurrentCompleted && activeCourse?.id) {
        toggleLessonComplete(activeCourse.id, currentLesson.id);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
    };
  }, [currentLesson?.id, isCurrentCompleted, activeCourse?.id]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (e) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const changeSpeed = (speed) => {
    const video = videoRef.current;
    if (video) video.playbackRate = speed;
    setPlaybackSpeed(speed);
    setShowSpeedMenu(false);
  };

  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Toggle lesson complete and advance
  const handleToggleComplete = () => {
    if (activeCourse?.id && currentLesson?.id) {
      toggleLessonComplete(activeCourse.id, currentLesson.id);
    }
  };

  const handleNextLesson = () => {
    if (nextLesson && !nextLesson.isLocked) {
      handleSelectLesson(nextLesson);
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
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces&q=80',
        time: 'Just now',
        content: commentText.trim(),
      },
    ]);
    setCommentText('');
  };

  const handleSubmitAssignment = (e) => {
    e.preventDefault();
    if (!assignmentAnswer.trim()) return;
    setAssignmentSubmitted(true);
    if (!isCurrentCompleted) {
      handleToggleComplete();
    }
  };

  return (
    <div className="min-h-screen w-full bg-background flex flex-col font-sans">
      {/* Top Header */}
      <ClassroomHeader
        course={activeCourse}
        activeLesson={currentLesson}
        progressPercentage={progressPercentage}
        completedCount={completedCount}
        totalCount={totalCount}
      />

      {/* Locked Notice Alert Banner */}
      {lockedNotice && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 text-amber-500 px-6 py-2.5 flex items-center justify-between text-xs font-semibold animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{lockedNotice}</span>
          </div>
          <button 
            onClick={() => setLockedNotice(null)}
            className="hover:text-amber-400 font-bold px-2 py-0.5 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Split Screen Workspace */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Panel: Interactive Curriculum Tree */}
        <aside className="w-80 bg-card border-r border-border flex flex-col shrink-0 hidden lg:flex select-none">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Course Syllabus
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {completedCount} of {totalCount} completed
              </p>
            </div>
            <span className="text-xs bg-secondary text-secondary-foreground font-bold px-2.5 py-1 rounded-md">
              {progressPercentage}%
            </span>
          </div>

          {/* Scrollable Tree List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {(activeCourse?.modules || []).map((mod) => {
              const modLessons = mod.lessons || [];
              const modCompleted = modLessons.length > 0 && modLessons.every((l) => l.isCompleted);
              const modActive = modLessons.some((l) => l.id === selectedLessonId);

              return (
                <div key={mod.id} className="space-y-1">
                  <div className="flex items-center justify-between p-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <span className={modActive ? 'text-primary font-bold' : ''}>
                      {mod.title}
                    </span>
                    {modCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : modActive ? (
                      <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold">
                        Active
                      </span>
                    ) : null}
                  </div>

                  <div className="space-y-1">
                    {modLessons.map((lesson) => {
                      const isSelected = lesson.id === selectedLessonId;
                      const isLocked = Boolean(lesson.isLocked);

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => handleSelectLesson(lesson)}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-all text-left group ${
                            isSelected
                              ? 'bg-secondary text-secondary-foreground font-semibold shadow-sm ring-1 ring-border'
                              : isLocked
                              ? 'opacity-45 text-muted-foreground hover:bg-muted/30 cursor-not-allowed'
                              : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground cursor-pointer'
                          }`}
                        >
                          <span className="flex items-center gap-2.5 min-w-0 pr-2">
                            {isLocked ? (
                              <Lock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                            ) : lesson.isCompleted ? (
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            ) : (
                              <Play className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-primary fill-current' : 'text-muted-foreground'}`} />
                            )}
                            <span className="truncate">{lesson.title}</span>
                          </span>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {lesson.assignments && lesson.assignments.length > 0 && (
                              <span className="text-[9px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded">
                                Task
                              </span>
                            )}
                            <span className="text-[10px] text-muted-foreground">
                              {lesson.duration}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Right Panel: Media-Rich Content Viewer */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          
          {/* Shimmer / Skeleton Loader when changing modules */}
          {isLoadingLesson ? (
            <div className="space-y-6 animate-pulse">
              {/* Video Skeleton */}
              <div className="aspect-video max-h-[500px] w-full bg-card rounded-2xl border border-border flex flex-col items-center justify-center p-8 space-y-4 shadow-xl">
                <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                <p className="text-xs font-semibold text-muted-foreground tracking-wide">
                  Buffering lesson stream...
                </p>
              </div>

              {/* Title & Actions Skeleton */}
              <div className="space-y-3 pb-6 border-b border-border">
                <div className="h-4 w-48 bg-muted rounded-md"></div>
                <div className="h-8 w-3/4 bg-muted rounded-md"></div>
                <div className="h-4 w-full bg-muted rounded-md"></div>
              </div>
            </div>
          ) : (
            <>
              {/* Real Video Player Container */}
              <div className="bg-black rounded-2xl overflow-hidden aspect-video relative group shadow-2xl max-h-[500px] w-full mx-auto border border-border/40">
                <video
                  ref={videoRef}
                  src={currentLesson.contentUrl}
                  poster={currentLesson.poster}
                  className="w-full h-full object-cover"
                  playsInline
                  onClick={togglePlay}
                />

                {/* Video Player Overlays */}
                <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40 flex flex-col justify-between p-4 md:p-6 transition-opacity duration-300 ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
                  
                  {/* Top Bar */}
                  <div className="flex justify-between items-center text-white text-xs">
                    <span className="font-semibold bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10">
                      {currentLesson.title}
                    </span>
                    <span className="bg-black/60 px-2.5 py-1 rounded-md backdrop-blur-md border border-white/10 font-mono text-[11px] text-primary">
                      1080p HD
                    </span>
                  </div>

                  {/* Center Play / Pause Floating Button */}
                  <button
                    onClick={togglePlay}
                    className="w-16 h-16 rounded-full bg-white/20 hover:bg-white/35 backdrop-blur-md text-white flex items-center justify-center mx-auto transition-transform hover:scale-110 cursor-pointer shadow-2xl border border-white/30"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? (
                      <Pause className="w-7 h-7 fill-current" />
                    ) : (
                      <Play className="w-7 h-7 fill-current pl-1" />
                    )}
                  </button>

                  {/* Bottom Controls */}
                  <div className="space-y-3">
                    {/* Interactive Timeline Scrubber */}
                    <div 
                      onClick={handleSeek}
                      className="relative w-full h-1.5 hover:h-2.5 bg-white/30 transition-all rounded-full cursor-pointer"
                    >
                      <div 
                        className="absolute left-0 top-0 bottom-0 bg-primary rounded-full transition-all"
                        style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                      ></div>
                    </div>

                    <div className="flex justify-between items-center text-white text-xs">
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={togglePlay} 
                          className="hover:text-primary transition-colors cursor-pointer"
                        >
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                        </button>
                        
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={toggleMute}
                            className="hover:text-primary transition-colors cursor-pointer"
                          >
                            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                          </button>
                          <div className="w-16 h-1 bg-white/30 rounded-full">
                            <div className="bg-white h-full rounded-full" style={{ width: isMuted ? '0%' : '80%' }}></div>
                          </div>
                        </div>

                        <span className="font-mono text-[11px] text-white/90">
                          {formatTime(currentTime)} / {formatTime(duration) || currentLesson.duration}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 relative">
                        {/* Speed Selector */}
                        <div className="relative">
                          <button 
                            onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                            className="text-[11px] font-semibold bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded cursor-pointer"
                          >
                            {playbackSpeed}x
                          </button>
                          {showSpeedMenu && (
                            <div className="absolute bottom-8 right-0 bg-card border border-border rounded-lg shadow-xl p-1 flex flex-col gap-1 z-20 text-foreground text-xs">
                              {[0.75, 1, 1.25, 1.5, 2].map((s) => (
                                <button
                                  key={s}
                                  onClick={() => changeSpeed(s)}
                                  className={`px-3 py-1 rounded text-left hover:bg-muted ${playbackSpeed === s ? 'text-primary font-bold' : ''}`}
                                >
                                  {s}x
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        <button 
                          onClick={() => {
                            if (videoRef.current?.requestFullscreen) {
                              videoRef.current.requestFullscreen();
                            }
                          }}
                          className="hover:text-primary transition-colors p-1" 
                          title="Fullscreen"
                        >
                          <Maximize2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Lesson Title & Completion Controls */}
              <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 pb-6 border-b border-border">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                      {currentModule?.title} · {currentLesson.title}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-border"></span>
                    <span className="text-xs text-muted-foreground">
                      {currentLesson.duration} duration
                    </span>
                  </div>
                  <h1 className="text-2xl font-heading font-bold text-foreground">
                    {currentLesson.title}
                  </h1>
                  <p className="text-sm text-muted-foreground max-w-3xl">
                    {currentLesson.description}
                  </p>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    id="complete-btn"
                    onClick={handleToggleComplete}
                    className={`px-6 py-3 font-semibold rounded-xl text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-md cursor-pointer ${
                      isCurrentCompleted
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-primary text-primary-foreground hover:bg-primary/95'
                    }`}
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>{isCurrentCompleted ? 'Completed' : 'Mark as Complete'}</span>
                  </button>

                  {/* Next Lesson Auto-Advance */}
                  {isCurrentCompleted && nextLesson && (
                    <button
                      onClick={handleNextLesson}
                      className="px-5 py-3 font-semibold rounded-xl text-sm bg-secondary text-secondary-foreground hover:bg-secondary/80 flex items-center gap-2 shadow-sm cursor-pointer border border-border"
                      title={`Proceed to ${nextLesson.title}`}
                    >
                      <span>Next Lesson</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Tabs Segment (Overview, Assignment, Resources, Discussion) */}
              <div className="space-y-6">
                <div className="border-b border-border flex gap-6 overflow-x-auto">
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`pb-3 text-sm font-semibold transition-colors cursor-pointer shrink-0 ${
                      activeTab === 'overview'
                        ? 'border-b-2 border-primary text-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Lesson Overview
                  </button>

                  {currentLesson.assignments && currentLesson.assignments.length > 0 && (
                    <button
                      onClick={() => setActiveTab('assignment')}
                      className={`pb-3 text-sm font-semibold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                        activeTab === 'assignment'
                          ? 'border-b-2 border-primary text-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <span>Assignment</span>
                      <span className="w-2 h-2 rounded-full bg-primary"></span>
                    </button>
                  )}

                  <button
                    onClick={() => setActiveTab('resources')}
                    className={`pb-3 text-sm font-medium transition-colors cursor-pointer shrink-0 ${
                      activeTab === 'resources'
                        ? 'border-b-2 border-primary text-foreground font-semibold'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Resources (2)
                  </button>

                  <button
                    onClick={() => setActiveTab('discussion')}
                    className={`pb-3 text-sm font-medium transition-colors cursor-pointer shrink-0 ${
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
                  <div className="space-y-5 text-sm text-muted-foreground max-w-3xl leading-relaxed">
                    <p>{currentLesson.content}</p>

                    <h4 className="font-heading font-bold text-foreground text-sm pt-2">
                      Key Takeaways:
                    </h4>
                    <ul className="list-disc pl-5 space-y-2 text-foreground/90">
                      {(currentLesson.keyTakeaways || []).map((point, idx) => (
                        <li key={idx}>{point}</li>
                      ))}
                    </ul>

                    {/* Sequential Progress Banner */}
                    <div className="p-4 rounded-xl bg-card border border-border flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold text-foreground">
                          Sequential Mastery Engine
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {isCurrentCompleted
                            ? 'Great job! The next lesson in the curriculum is now unlocked.'
                            : 'Mark this lesson as completed to unlock the next chapter.'}
                        </p>
                      </div>
                      {isCurrentCompleted && nextLesson && (
                        <button
                          onClick={handleNextLesson}
                          className="px-3.5 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-lg flex items-center gap-1.5 hover:bg-primary/90 cursor-pointer"
                        >
                          <span>Continue</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Tab 2: Assignment */}
                {activeTab === 'assignment' && currentLesson.assignments?.[0] && (
                  <div className="space-y-6 max-w-2xl">
                    <div className="p-5 rounded-xl border border-border bg-card space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-primary">
                          Practical Task
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Max Score: 100 pts
                        </span>
                      </div>
                      <h3 className="font-heading font-bold text-base text-foreground">
                        {currentLesson.assignments[0].title}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {currentLesson.assignments[0].description}
                      </p>

                      <div className="space-y-2 pt-2 border-t border-border">
                        <p className="text-xs font-semibold text-foreground">Questions to address:</p>
                        <ul className="list-disc pl-5 space-y-1 text-xs text-muted-foreground">
                          {currentLesson.assignments[0].questions?.map((q, idx) => (
                            <li key={idx}>{q}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {assignmentSubmitted ? (
                      <div className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 space-y-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5" />
                          <h4 className="font-bold text-sm">Assignment Submitted Successfully!</h4>
                        </div>
                        <p className="text-xs text-emerald-600/90">
                          Your response has been sent for evaluation. Score & instructor feedback will appear in your dashboard.
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmitAssignment} className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-foreground mb-1.5">
                            Your Solution & Design Rationale
                          </label>
                          <textarea
                            rows={5}
                            value={assignmentAnswer}
                            onChange={(e) => setAssignmentAnswer(e.target.value)}
                            placeholder="Type your detailed architectural analysis or paste your studio link..."
                            className="w-full px-4 py-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                            required
                          />
                        </div>

                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl text-sm hover:bg-primary/95 flex items-center gap-2 shadow-md cursor-pointer"
                        >
                          <UploadCloud className="w-4 h-4" />
                          <span>Submit Assignment</span>
                        </button>
                      </form>
                    )}
                  </div>
                )}

                {/* Tab 3: Resources */}
                {activeTab === 'resources' && (
                  <div className="space-y-3 max-w-2xl">
                    <div className="p-4 rounded-xl border border-border bg-card flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-secondary text-secondary-foreground flex items-center justify-center">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">Spatial Lighting Reference Sheet.pdf</p>
                          <p className="text-xs text-muted-foreground">PDF Guide • 3.2 MB</p>
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
                          <p className="text-sm font-semibold text-foreground">Monolithic Concrete Studio Assets.zip</p>
                          <p className="text-xs text-muted-foreground">CAD & 3D Materials • 54.1 MB</p>
                        </div>
                      </div>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors cursor-pointer">
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Tab 4: Discussion */}
                {activeTab === 'discussion' && (
                  <div className="space-y-6 max-w-3xl">
                    <form onSubmit={handleAddComment} className="flex gap-3">
                      <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Ask instructor Marcus or peers a question..."
                        className="flex-1 px-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl text-sm hover:bg-primary/95 flex items-center gap-2 cursor-pointer shadow-sm"
                      >
                        <Send className="w-4 h-4" />
                        <span>Post</span>
                      </button>
                    </form>

                    <div className="space-y-3">
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
            </>
          )}

        </main>

      </div>
    </div>
  );
}
