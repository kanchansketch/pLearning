import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, CheckCircle2 } from 'lucide-react';

export default function ClassroomHeader({ course, activeLesson, progressPercentage, completedCount, totalCount }) {
  const navigate = useNavigate();

  return (
    <header className="h-16 border-b border-border bg-card px-4 md:px-8 flex items-center justify-between shrink-0 z-10">
      {/* Left: Navigation back & Breadcrumbs */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground py-2 px-3 rounded-lg hover:bg-muted transition-colors border border-border/70"
          title="Back to Dashboard"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Dashboard</span>
        </button>

        <div className="h-4 w-px bg-border hidden sm:block"></div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-foreground truncate max-w-[150px] md:max-w-xs">
            {course?.title || 'Architectural Spatial Mastery'}
          </span>
          <span className="text-muted-foreground">/</span>
          <span className="text-muted-foreground truncate max-w-[120px] md:max-w-sm hidden sm:inline">
            {activeLesson?.title || '4.2 Advanced Architectural Lighting & Moods'}
          </span>
        </div>
      </div>

      {/* Right: Overall Course Progress */}
      <div className="flex items-center gap-4">
        <div className="hidden md:flex flex-col items-end">
          <span className="text-xs font-semibold text-foreground">
            Course progress: {progressPercentage}%
          </span>
          <span className="text-[10px] text-muted-foreground">
            {completedCount} of {totalCount} lessons completed
          </span>
        </div>

        <div className="w-32 bg-muted h-2 rounded-full overflow-hidden hidden md:block">
          <div
            className="bg-tertiary h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>

        <button 
          className="p-2 rounded-xl hover:bg-muted text-foreground transition-colors"
          title="Course Settings"
        >
          <Settings className="w-5 h-5 text-muted-foreground hover:text-foreground" />
        </button>
      </div>
    </header>
  );
}
