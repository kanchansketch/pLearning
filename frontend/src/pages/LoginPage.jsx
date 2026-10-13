import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Pencil, Info, Mail, Lock, ArrowRight, Zap, Globe, Shield } from "lucide-react";
import { useApp } from "../context/AppContext";
import { apiService } from "../services/apiService";
import { testimonial } from "../data/staticData";

const TEACHER_HERO = "https://uxmagic.blob.core.windows.net/public/agent-images/teacher-auth-hero-1791857120668-ykwylpc3g8.png";
const LEARNER_HERO = "https://uxmagic.blob.core.windows.net/public/agent-images/auth-hero-1791824420522-53trg5ztp7v.png";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useApp();
  const [role, setRole] = useState("teacher");
  const [email, setEmail] = useState("marcus.vance@plearning.edu");
  const [password, setPassword] = useState("password123");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roleConfig = {
    teacher: {
      title: "Welcome back, Educator",
      subtitle: "Access your curriculum studio, student analytics, and course management tools.",
      emailLabel: "Teacher Work Email",
      defaultEmail: "marcus.vance@plearning.edu",
      badgeText: "You are logging in to the Teacher Studio. Redirecting to Course Management.",
      btnText: "Enter Teacher Studio",
      heroSrc: TEACHER_HERO,
      heroAlt: "Premium minimalist design studio classroom",
      heroTag: "TEACHER STUDIO PLATFORM",
      heroQuote: '"We built pLearning to give educators the same grade-A tools that world-class designers use every day."',
      heroName: "Dr. Clara Oswald",
      heroRole: "Head of Curriculum Design, NeoAcademy",
      heroAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    learner: {
      title: "Welcome back, Learner",
      subtitle: "Access your courses, track your progress, and resume active lessons.",
      emailLabel: "Learner Email Address",
      defaultEmail: "alex.mercer@plearning.edu",
      badgeText: "You are logging in to the Learner Space. Redirecting to Learner Dashboard.",
      btnText: "Enter Learner Space",
      heroSrc: LEARNER_HERO,
      heroAlt: "Minimalist library architectural curves and shadows",
      heroTag: "THE FUTURE OF LEARNING",
      heroQuote: testimonial ? testimonial.quote : '"Learning is the ultimate superpower."',
      heroName: testimonial ? testimonial.author : "Alex Mercer",
      heroRole: testimonial ? testimonial.role : "Lead Learner, pLearning",
      heroAvatar: testimonial ? testimonial.avatar : "https://randomuser.me/api/portraits/men/12.jpg",
    },
  };

  const active = roleConfig[role];

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setEmail(roleConfig[newRole].defaultEmail);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiService.login(email, password, role);
    } catch (err) {
      console.warn("Backend auth failed, proceeding with local credentials:", err);
    } finally {
      setIsSubmitting(false);
      login(email, password, role);
      navigate(role === "teacher" ? "/teacher/dashboard" : "/dashboard");
    }
  };

  const handleSocialLogin = () => {
    login(email, password, role);
    navigate(role === "teacher" ? "/teacher/dashboard" : "/dashboard");
  };

  return (
    <div className="min-h-screen w-full bg-background flex flex-col relative font-sans">
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-screen">
        {/* Left Column */}
        <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-10 md:p-14 bg-card text-card-foreground">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-heading font-black tracking-wider text-lg" style={{boxShadow:"0 4px 14px 0 rgba(79,70,229,0.2)"}}>
                pL
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-bold text-xl tracking-tight text-foreground leading-none">pLearning</span>
                <span className="text-[10px] text-primary font-semibold tracking-widest uppercase mt-0.5">Workspace Gateway</span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              v2.4 Live
            </span>
          </div>

          {/* Form */}
          <div className="my-auto py-8 max-w-md w-full mx-auto space-y-6">
            <div className="space-y-1.5">
              <h1 className="text-3xl font-heading font-bold tracking-tight text-foreground">{active.title}</h1>
              <p className="text-muted-foreground text-sm">{active.subtitle}</p>
            </div>

            {/* Role Tabs */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">Select your workspace</label>
              <div className="bg-muted p-1.5 rounded-xl grid grid-cols-2 gap-1">
                <button type="button" onClick={() => handleRoleChange("teacher")}
                  className={"py-2.5 text-sm rounded-lg transition-all duration-200 flex items-center justify-center gap-2 " + (role === "teacher" ? "bg-card text-foreground shadow-sm font-semibold" : "font-medium text-muted-foreground hover:text-foreground")}>
                  <Pencil className={"w-4 h-4 " + (role === "teacher" ? "text-primary" : "")} />
                  Teacher Studio
                </button>
                <button type="button" onClick={() => handleRoleChange("learner")}
                  className={"py-2.5 text-sm rounded-lg transition-all duration-200 flex items-center justify-center gap-2 " + (role === "learner" ? "bg-card text-foreground shadow-sm font-semibold" : "font-medium text-muted-foreground hover:text-foreground")}>
                  <User className={"w-4 h-4 " + (role === "learner" ? "text-primary" : "")} />
                  Learner Space
                </button>
              </div>
            </div>

            {/* Quick Demo */}
            <div className="bg-muted/50 p-4 rounded-xl border border-border/50 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Quick Demo Access</span>
                <span className="text-[10px] bg-primary/10 text-primary font-medium px-2 py-0.5 rounded-full">One-click Fill</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => handleRoleChange("teacher")}
                  className="flex flex-col items-start p-2.5 bg-card hover:bg-muted border border-border/60 hover:border-primary/40 rounded-lg text-left transition-all">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span className="text-xs font-bold text-foreground">Teacher Demo</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground truncate w-full">marcus.vance@plearning.edu</span>
                </button>
                <button type="button" onClick={() => handleRoleChange("learner")}
                  className="flex flex-col items-start p-2.5 bg-card hover:bg-muted border border-border/60 hover:border-primary/40 rounded-lg text-left transition-all">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-xs font-bold text-foreground">Learner Demo</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground truncate w-full">alex.mercer@plearning.edu</span>
                </button>
              </div>
            </div>

            {/* Form Fields */}
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2" htmlFor="email">{active.emailLabel}</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-muted-foreground"><Mail className="w-4 h-4" /></span>
                  <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground"
                    placeholder="name@domain.com" required />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-semibold text-foreground uppercase tracking-wider" htmlFor="password">Password</label>
                  <a href="#reset" onClick={(e) => e.preventDefault()} className="text-xs text-primary font-medium hover:underline">Reset password</a>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-muted-foreground"><Lock className="w-4 h-4" /></span>
                  <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground"
                    placeholder="••••••••••••" required />
                </div>
              </div>

              {/* Role Badge */}
              <div className="flex items-center gap-2 p-3 rounded-xl bg-accent text-accent-foreground text-xs font-medium border border-accent/20">
                <Info className="w-4 h-4 shrink-0" />
                <span>{active.badgeText}</span>
              </div>

              {/* Submit */}
              <button type="submit" className="w-full py-3.5 bg-primary text-primary-foreground hover:bg-primary/95 font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 group cursor-pointer" style={{boxShadow:"0 4px 14px 0 rgba(79,70,229,0.25)"}}>
                <span>{active.btnText}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            {/* SSO Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-3 text-muted-foreground font-medium tracking-wider">Or secure single sign-on</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={handleSocialLogin} className="flex items-center justify-center gap-2 py-2.5 border border-border rounded-xl text-xs font-medium hover:bg-muted transition-colors text-foreground cursor-pointer">
                <Globe className="w-4 h-4 text-muted-foreground" /> Google Workspace
              </button>
              <button type="button" onClick={handleSocialLogin} className="flex items-center justify-center gap-2 py-2.5 border border-border rounded-xl text-xs font-medium hover:bg-muted transition-colors text-foreground cursor-pointer">
                <Shield className="w-4 h-4 text-muted-foreground" /> Enterprise SSO
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center lg:text-left pt-4 border-t border-border/40">
            <p className="text-xs text-muted-foreground">
              Need a teacher or institutional account?{" "}
              <a href="#apply" onClick={(e) => e.preventDefault()} className="text-primary font-semibold hover:underline">Apply for pilot program</a>
            </p>
          </div>
        </div>

        {/* Right Column: Hero Visual */}
        <div className="hidden lg:block lg:col-span-7 relative bg-muted overflow-hidden">
          <img src={active.heroSrc} alt={active.heroAlt} className="absolute inset-0 w-full h-full object-cover filter brightness-95 contrast-105 object-[50%_0%] transition-all duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-12 left-12 right-12 text-white">
            <div className="max-w-xl space-y-4">
              <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium tracking-wider uppercase text-white border border-white/15">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                {active.heroTag}
              </div>
              <h2 className="text-3xl font-heading font-bold tracking-tight leading-tight">{active.heroQuote}</h2>
              <div className="flex items-center gap-3 pt-2">
                <div className="w-10 h-10 rounded-full border border-white/20 bg-white/10 flex items-center justify-center overflow-hidden">
                  <img src={active.heroAvatar} alt={active.heroName} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{active.heroName}</p>
                  <p className="text-xs text-white/70">{active.heroRole}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
