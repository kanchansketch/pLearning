import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Globe, 
  LogOut, 
  ChevronRight,
  User
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import UserProfileModal from './UserProfileModal';

export default function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useApp();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleSignOut = (e) => {
    if (e) e.stopPropagation();
    logout();
    navigate('/login');
  };

  return (
    <>
      <aside className="w-60 h-screen sticky top-0 bg-card border-r border-border flex flex-col justify-between shrink-0 hidden md:flex select-none z-20">
        
        {/* Top: Logo & Navigation Links (Compact padding) */}
        <div className="p-4 space-y-5">
          {/* Brand Logo */}
          <div 
            onClick={() => navigate('/dashboard')} 
            className="flex items-center gap-2.5 cursor-pointer select-none group px-1"
          >
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-heading font-black tracking-wider text-sm shadow-sm group-hover:scale-105 transition-transform">
              pL
            </div>
            <span className="font-heading font-bold text-lg tracking-tight text-foreground">
              pLearning
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <NavLink
              to="/dashboard"
              end
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 font-medium rounded-xl text-xs transition-colors ${
                  isActive
                    ? 'bg-secondary text-secondary-foreground shadow-sm font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`
              }
            >
              <LayoutDashboard className="w-4 h-4 text-primary" />
              <span>Dashboard</span>
            </NavLink>

            <NavLink
              to="/classroom"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 font-medium rounded-xl text-xs transition-colors ${
                  isActive
                    ? 'bg-secondary text-secondary-foreground shadow-sm font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`
              }
            >
              <BookOpen className="w-4 h-4 text-primary" />
              <span>Classroom</span>
            </NavLink>

            <button
              onClick={() => navigate('/dashboard?tab=explore')}
              className="w-full flex items-center gap-3 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted font-medium rounded-xl text-xs transition-colors text-left cursor-pointer"
            >
              <Globe className="w-4 h-4 text-primary" />
              <span>Explore Catalog</span>
            </button>
          </nav>
        </div>

        {/* Bottom: Compact Clickable Profile Tile & Direct Logout (Fits without scrolling!) */}
        <div className="p-3 border-t border-border bg-card/60">
          <div 
            onClick={() => setIsProfileModalOpen(true)}
            className="flex items-center justify-between p-2 rounded-xl hover:bg-muted/80 transition-all cursor-pointer group border border-transparent hover:border-border/80"
            title="Click to view profile & settings"
          >
            {/* Avatar & Info */}
            <div className="flex items-center gap-2.5 overflow-hidden min-w-0 pr-1">
              <div className="relative shrink-0">
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces&q=80'}
                  alt={user?.name || 'User'}
                  className="w-8 h-8 rounded-full object-cover border border-border group-hover:ring-2 ring-primary/40 transition-all"
                />
                <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full border border-card"></span>
              </div>

              <div className="overflow-hidden min-w-0">
                <h4 className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                  {user?.name || 'Alex Mercer'}
                </h4>
                <p className="text-[10px] text-muted-foreground truncate capitalize">
                  {user?.role || 'Learner'}
                </p>
              </div>
            </div>

            {/* Quick Logout Button */}
            <button
              onClick={handleSignOut}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0 cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </aside>

      {/* Interactive User Profile Modal */}
      <UserProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />
    </>
  );
}
