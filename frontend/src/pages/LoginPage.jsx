import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Pencil, 
  Info, 
  Mail, 
  Lock, 
  ArrowRight, 
  Zap, 
  Globe, 
  Shield 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { testimonial, staticUsers } from '../data/staticData';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useApp();

  const [role, setRole] = useState('learner');
  const [email, setEmail] = useState('alex.mercer@plearning.edu');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);

  // Switch role and update default credentials
  const handleRoleChange = (newRole) => {
    setRole(newRole);
    if (newRole === 'learner') {
      setEmail('alex.mercer@plearning.edu');
    } else {
      setEmail('marcus.vance@plearning.edu');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    login(email, password, role);
    navigate('/dashboard');
  };

  const handleSocialLogin = () => {
    login(email, password, role);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen w-full bg-background flex flex-col relative font-sans">
      {/* Main Grid Container */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-screen">
        
        {/* Left Column: Authentication Form */}
        <div className="lg:col-span-5 flex flex-col justify-between p-8 sm:p-12 md:p-16 bg-card text-card-foreground">
          {/* Top: Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-heading font-black tracking-wider text-lg shadow-sm">
              pL
            </div>
            <span className="font-heading font-bold text-xl tracking-tight text-foreground">
              pLearning
            </span>
          </div>

          {/* Middle: Form & Gateway */}
          <div className="my-auto py-12 max-w-md w-full mx-auto">
            <div className="space-y-2 mb-8">
              <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground">
                Welcome back
              </h1>
              <p className="text-muted-foreground text-sm">
                Elevate your craft. Access your personalized workspace.
              </p>
            </div>

            {/* Role Selection Tabs */}
            <div className="mb-8">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Select your workspace
              </label>
              <div className="bg-muted p-1 rounded-xl grid grid-cols-2 gap-1 relative">
                <button
                  type="button"
                  onClick={() => handleRoleChange('learner')}
                  className={`py-2.5 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                    role === 'learner'
                      ? 'bg-card text-foreground shadow-sm font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <User className={`w-4 h-4 ${role === 'learner' ? 'text-primary' : ''}`} />
                  Learner
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleChange('teacher')}
                  className={`py-2.5 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                    role === 'teacher'
                      ? 'bg-card text-foreground shadow-sm font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Pencil className={`w-4 h-4 ${role === 'teacher' ? 'text-primary' : ''}`} />
                  Teacher
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-2.5 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-primary shrink-0" />
                {role === 'learner'
                  ? 'Access your courses, track your progress and resume active lessons.'
                  : 'Manage lesson plans, review student progress, and grade assignments.'}
              </p>
            </div>

            {/* Credentials Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2" htmlFor="email">
                  Work Email
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-muted-foreground">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground"
                    placeholder="name@domain.com"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-semibold text-foreground uppercase tracking-wider" htmlFor="password">
                    Password
                  </label>
                  <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-xs text-primary font-medium hover:underline">
                    Forgot?
                  </a>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-muted-foreground">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground"
                    placeholder="••••••••••••"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between py-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary w-4 h-4 accent-primary"
                  />
                  <span className="text-xs text-muted-foreground select-none">
                    Remember me for 30 days
                  </span>
                </label>
              </div>

              {/* Gateway Action Button */}
              <button
                type="submit"
                id="submit-btn"
                className="w-full py-3.5 bg-primary text-primary-foreground hover:bg-primary/95 font-semibold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Enter Workspace</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            {/* Social login separator */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-3 text-muted-foreground font-medium tracking-wider">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleSocialLogin}
                className="flex items-center justify-center gap-2 py-2.5 border border-border rounded-xl text-xs font-medium hover:bg-muted transition-colors text-foreground cursor-pointer"
              >
                <Globe className="w-4 h-4 text-muted-foreground" />
                Google
              </button>
              <button
                type="button"
                onClick={handleSocialLogin}
                className="flex items-center justify-center gap-2 py-2.5 border border-border rounded-xl text-xs font-medium hover:bg-muted transition-colors text-foreground cursor-pointer"
              >
                <Shield className="w-4 h-4 text-muted-foreground" />
                SSO
              </button>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="text-center lg:text-left">
            <p className="text-xs text-muted-foreground">
              Don't have an account?{' '}
              <a href="#request" onClick={(e) => e.preventDefault()} className="text-primary font-semibold hover:underline">
                Request access
              </a>
            </p>
          </div>
        </div>

        {/* Right Column: Visual Panel */}
        <div className="hidden lg:block lg:col-span-7 relative bg-muted overflow-hidden">
          <img
            src="https://uxmagic.blob.core.windows.net/public/agent-images/auth-hero-1791824420522-53trg5ztp7v.png"
            alt="Minimalist library architectural curves and shadows"
            className="absolute inset-0 w-full h-full object-cover filter brightness-95 contrast-105 object-[50%_0%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          
          {/* Overlay Content */}
          <div className="absolute bottom-12 left-12 right-12 text-white">
            <div className="max-w-xl space-y-4">
              <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium tracking-wider uppercase text-white border border-white/15">
                <Zap className="w-3.5 h-3.5 text-tertiary" />
                The Future of Learning
              </div>
              <h2 className="text-3xl font-heading font-bold tracking-tight leading-tight">
                {testimonial.quote}
              </h2>
              <div className="flex items-center gap-3 pt-2">
                <div className="w-10 h-10 rounded-full border border-white/20 bg-white/10 flex items-center justify-center overflow-hidden">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.author}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold">{testimonial.author}</p>
                  <p className="text-xs text-white/70">{testimonial.role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
