import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  LogOut, 
  Zap, 
  BookOpen, 
  Clock, 
  UserCheck, 
  ShieldCheck, 
  Sparkles, 
  RotateCcw,
  Mail,
  GraduationCap
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function UserProfileModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { user, courses, logout, switchWorkspaceRole, resetAllProgress } = useApp();

  if (!isOpen) return null;

  const handleSignOut = () => {
    logout();
    onClose();
    navigate('/login');
  };

  const handleRoleToggle = (newRole) => {
    switchWorkspaceRole(newRole);
  };

  const enrolledCount = user?.enrolledCourseIds?.length || courses.filter((c) => c.isEnrolled).length || 2;
  const isTeacher = user?.role === 'teacher';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Modal Dialog Card */}
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-foreground"
      >
        {/* Modal Header */}
        <div className="relative p-6 bg-gradient-to-br from-primary/15 via-transparent to-transparent border-b border-border">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces&q=80'}
                alt={user?.name || 'User'}
                className="w-16 h-16 rounded-full object-cover border-2 border-primary shadow-md"
              />
              <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-card ring-1 ring-emerald-400" title="Active"></span>
            </div>

            <div className="overflow-hidden space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-bold text-lg text-foreground truncate">
                  {user?.name || 'Alex Mercer'}
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  isTeacher 
                    ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' 
                    : 'bg-primary/20 text-primary border border-primary/30'
                }`}>
                  {user?.role || 'Learner'}
                </span>
              </div>

              <p className="text-xs text-muted-foreground flex items-center gap-1.5 truncate">
                <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <span>{user?.email || 'alex.mercer@plearning.edu'}</span>
              </p>

              <p className="text-[11px] text-muted-foreground/90 font-medium">
                {user?.title || 'Senior Architectural Apprentice'}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body: Stats & Activity */}
        <div className="p-6 space-y-5">
          
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-3 gap-2.5 text-center">
            <div className="p-3 rounded-xl bg-muted/50 border border-border/60 space-y-1">
              <div className="flex items-center justify-center text-primary">
                <Zap className="w-4 h-4 fill-current" />
              </div>
              <p className="font-heading font-bold text-base text-foreground">
                {user?.streak || 14}d
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Streak
              </p>
            </div>

            <div className="p-3 rounded-xl bg-muted/50 border border-border/60 space-y-1">
              <div className="flex items-center justify-center text-tertiary">
                <BookOpen className="w-4 h-4" />
              </div>
              <p className="font-heading font-bold text-base text-foreground">
                {enrolledCount}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Courses
              </p>
            </div>

            <div className="p-3 rounded-xl bg-muted/50 border border-border/60 space-y-1">
              <div className="flex items-center justify-center text-primary">
                <Clock className="w-4 h-4" />
              </div>
              <p className="font-heading font-bold text-base text-foreground">
                {user?.weeklyCompletedHours || 3.5}h
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                This Week
              </p>
            </div>
          </div>

          {/* Interactive Role Switcher */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                <span>Workspace Role Mode</span>
              </span>
              <span className="text-[10px] text-muted-foreground">Click to switch</span>
            </div>

            <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-xl border border-border/60">
              <button
                onClick={() => handleRoleToggle('learner')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  !isTeacher
                    ? 'bg-card text-foreground shadow-sm ring-1 ring-border'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Student / Learner</span>
              </button>

              <button
                onClick={() => handleRoleToggle('teacher')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isTeacher
                    ? 'bg-card text-foreground shadow-sm ring-1 ring-border'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Instructor / Teacher</span>
              </button>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="pt-2 border-t border-border flex items-center justify-between">
            <button
              onClick={() => {
                resetAllProgress();
                onClose();
              }}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Demo State</span>
            </button>

            <span className="text-[10px] text-muted-foreground font-mono">
              pLearning v1.2
            </span>
          </div>

        </div>

        {/* Modal Footer: Sign Out Button */}
        <div className="p-4 bg-muted/30 border-t border-border flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleSignOut}
            className="px-5 py-2.5 bg-destructive/10 hover:bg-destructive text-destructive hover:text-destructive-foreground font-semibold rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

      </div>
    </div>
  );
}
