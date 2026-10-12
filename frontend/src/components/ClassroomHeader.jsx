import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import UserProfileModal from './UserProfileModal';

export default function ClassroomHeader({ course, activeLesson, progressPercentage, completedCount, totalCount }) {
  const navigate = useNavigate();
  const { user } = useApp();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  return (
    <>
      <header className="h-16 border-b border-border bg-card px-4 md:px-8 flex items-center justify-between shrink-0 z-10 select-none">
        {/* Left: Navigation back & Breadcrumbs */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground py-2 px-3 rounded-lg hover:bg-muted transition-colors border border-border/70 cursor-pointer"
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
              {activeLesson?.title || '1.1 The Anatomy of Space & Proportion'}
            </span>
          </div>
        </div>

        {/* Right: Overall Course Progress & Profile */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-xs font-semibold text-foreground">
              Course progress: {progressPercentage}%
            </span>
            <span className="text-[10px] text-muted-foreground">
              {completedCount} of {totalCount} lessons completed
            </span>
          </div>

          <div className="w-28 bg-muted h-2 rounded-full overflow-hidden hidden md:block">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>

          {/* User Profile Avatar (Clickable to open modal) */}
          <button 
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center gap-2 p-1 rounded-full hover:ring-2 ring-primary/40 transition-all cursor-pointer"
            title="Open Profile Settings"
          >
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces&q=80'}
              alt={user?.name || 'User'}
              className="w-8 h-8 rounded-full object-cover border border-border"
            />
          </button>
        </div>
      </header>

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </>
  );
}
