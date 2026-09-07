import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { X, Zap, Lock, Mail, User as UserIcon, Globe, ArrowRight, ShieldCheck } from "lucide-react";

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  language: z.enum(["English", "Hindi"]),
});

type SignInFormValues = z.infer<typeof signInSchema>;
type SignUpFormValues = z.infer<typeof signUpSchema>;

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "signin" | "signup";
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultTab = "signin" }) => {
  const [tab, setTab] = useState<"signin" | "signup">(defaultTab);
  const [, setLocation] = useLocation();
  const { login, signup, loginAsJudge } = useAuth();

  const signInForm = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const signUpForm = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "", language: "English" },
  });

  if (!isOpen) return null;

  const handleSignInSubmit = (data: SignInFormValues) => {
    login(data.email);
    onClose();
    setLocation("/app");
  };

  const handleSignUpSubmit = (data: SignUpFormValues) => {
    signup(data.name, data.email, data.language);
    onClose();
    setLocation("/app");
  };

  const handleJudgeDemoClick = () => {
    loginAsJudge();
    onClose();
    setLocation("/app");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm animate-enter">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-ink/10 bg-[#f6f3ed] p-6 sm:p-8 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-ink/40 transition hover:bg-ink/5 hover:text-ink"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal/20 bg-teal/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal mb-3">
            <ShieldCheck size={14} /> Disha Security Portal
          </div>
          <h2 className="font-display text-3xl font-bold tracking-tight text-ink">
            {tab === "signin" ? "Welcome Back" : "Join Disha"}
          </h2>
          <p className="mt-1 text-xs font-semibold text-ink/60">
            {tab === "signin"
              ? "Access your saved trips, trusted circle, and personalized safety scores."
              : "Create your account for context-aware discovery and emergency protection."}
          </p>
        </div>

        {/* 1-Tap SIH Judge Demo Access Banner */}
        <div className="mb-6 rounded-2xl border-2 border-dashed border-teal/40 bg-teal/5 p-4 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-teal mb-1">
            <Zap size={14} className="fill-teal text-teal" /> Hackathon Evaluator Access
          </div>
          <p className="text-[11px] text-ink/70 mb-3 font-medium">
            Skip registration to evaluate the Jaipur prototype with full judge permissions.
          </p>
          <button
            type="button"
            onClick={handleJudgeDemoClick}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-teal px-4 py-2.5 text-xs font-extrabold text-white shadow-md transition hover:bg-[#09635d] active:scale-98"
          >
            <span>⚡ SIH Judge Quick Access / Demo Account</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="relative my-4 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-ink/10" />
          </div>
          <span className="relative bg-[#f6f3ed] px-3 text-[10px] font-bold uppercase tracking-widest text-ink/40">
            or sign in with email
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-ink/5 p-1 mb-6">
          <button
            type="button"
            onClick={() => setTab("signin")}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${
              tab === "signin" ? "bg-white text-ink shadow-sm" : "text-ink/60 hover:text-ink"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setTab("signup")}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${
              tab === "signup" ? "bg-white text-ink shadow-sm" : "text-ink/60 hover:text-ink"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Sign In Form */}
        {tab === "signin" && (
          <form onSubmit={signInForm.handleSubmit(handleSignInSubmit)} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-ink/70 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-3 text-ink/40" />
                <input
                  {...signInForm.register("email")}
                  type="email"
                  placeholder="tourist@example.com"
                  className="w-full rounded-xl border border-ink/15 bg-white py-2.5 pl-10 pr-3 text-xs font-medium text-ink placeholder:text-ink/30 focus:border-teal focus:outline-none"
                />
              </div>
              {signInForm.formState.errors.email && (
                <p className="mt-1 text-[10px] font-bold text-ember">
                  {signInForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-ink/70 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-3 text-ink/40" />
                <input
                  {...signInForm.register("password")}
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-ink/15 bg-white py-2.5 pl-10 pr-3 text-xs font-medium text-ink placeholder:text-ink/30 focus:border-teal focus:outline-none"
                />
              </div>
              {signInForm.formState.errors.password && (
                <p className="mt-1 text-[10px] font-bold text-ember">
                  {signInForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-ink py-3 text-xs font-extrabold text-paper transition hover:bg-ink/90 active:scale-98"
            >
              Sign In to Account
            </button>
          </form>
        )}

        {/* Sign Up Form */}
        {tab === "signup" && (
          <form onSubmit={signUpForm.handleSubmit(handleSignUpSubmit)} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-ink/70 mb-1">
                Full Name
              </label>
              <div className="relative">
                <UserIcon size={16} className="absolute left-3.5 top-3 text-ink/40" />
                <input
                  {...signUpForm.register("name")}
                  type="text"
                  placeholder="Aarav Sharma"
                  className="w-full rounded-xl border border-ink/15 bg-white py-2.5 pl-10 pr-3 text-xs font-medium text-ink placeholder:text-ink/30 focus:border-teal focus:outline-none"
                />
              </div>
              {signUpForm.formState.errors.name && (
                <p className="mt-1 text-[10px] font-bold text-ember">
                  {signUpForm.formState.errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-ink/70 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-3 text-ink/40" />
                <input
                  {...signUpForm.register("email")}
                  type="email"
                  placeholder="tourist@example.com"
                  className="w-full rounded-xl border border-ink/15 bg-white py-2.5 pl-10 pr-3 text-xs font-medium text-ink placeholder:text-ink/30 focus:border-teal focus:outline-none"
                />
              </div>
              {signUpForm.formState.errors.email && (
                <p className="mt-1 text-[10px] font-bold text-ember">
                  {signUpForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-ink/70 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-3 text-ink/40" />
                <input
                  {...signUpForm.register("password")}
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-ink/15 bg-white py-2.5 pl-10 pr-3 text-xs font-medium text-ink placeholder:text-ink/30 focus:border-teal focus:outline-none"
                />
              </div>
              {signUpForm.formState.errors.password && (
                <p className="mt-1 text-[10px] font-bold text-ember">
                  {signUpForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-ink/70 mb-1">
                Preferred Interface Language
              </label>
              <div className="relative">
                <Globe size={16} className="absolute left-3.5 top-3 text-ink/40" />
                <select
                  {...signUpForm.register("language")}
                  className="w-full rounded-xl border border-ink/15 bg-white py-2.5 pl-10 pr-3 text-xs font-bold text-ink focus:border-teal focus:outline-none"
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi (हिंदी)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-ink py-3 text-xs font-extrabold text-paper transition hover:bg-ink/90 active:scale-98"
            >
              Create Free Account
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
