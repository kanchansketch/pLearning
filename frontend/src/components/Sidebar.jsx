import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Globe, 
  Activity, 
  LogOut 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useApp();

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col justify-between shrink-0 hidden md:flex">
      {/* Top Logo & Navigation */}
      <div className="p-6 space-y-8">
        {/* Brand Logo */}
        <div 
          onClick={() => navigate('/dashboard')} 
          className="flex items-center gap-2.5 cursor-pointer select-none"
        >
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-heading font-black tracking-wider text-sm shadow-sm">
            pL
          </div>
          <span className="font-heading font-bold text-lg tracking-tight text-foreground">
            pLearning
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 font-medium rounded-xl text-sm transition-colors ${
                isActive
                  ? 'bg-secondary text-secondary-foreground shadow-sm'
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
              `flex items-center gap-3 px-3.5 py-2.5 font-medium rounded-xl text-sm transition-colors ${
                isActive
                  ? 'bg-secondary text-secondary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`
            }
          >
            <BookOpen className="w-4 h-4" />
            <span>My Courses</span>
          </NavLink>

          <a
            href="#discover"
            onClick={(e) => e.preventDefault()}
            className="flex items-center gap-3 px-3.5 py-2.5 text-muted-foreground hover:text-foreground hover:bg-muted font-medium rounded-xl text-sm transition-colors"
          >
            <Globe className="w-4 h-4" />
            <span>Discover</span>
          </a>

          <a
            href="#analytics"
            onClick={(e) => e.preventDefault()}
            className="flex items-center gap-3 px-3.5 py-2.5 text-muted-foreground hover:text-foreground hover:bg-muted font-medium rounded-xl text-sm transition-colors"
          >
            <Activity className="w-4 h-4" />
            <span>Analytics</span>
          </a>
        </nav>
      </div>

      {/* Bottom Profile & Sign Out */}
      <div className="p-6 border-t border-border space-y-4">
        <div className="flex items-center gap-3">
          <img
            src={user?.avatar || 'https://randomuser.me/api/portraits/men/12.jpg'}
            alt={user?.name || 'User'}
            className="w-10 h-10 rounded-full object-cover border border-border"
          />
          <div className="overflow-hidden">
            <h4 className="text-sm font-semibold text-foreground truncate">
              {user?.name || 'User'}
            </h4>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email || 'user@plearning.edu'}
            </p>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 text-destructive hover:bg-destructive/10 font-medium rounded-xl text-sm transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
