import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

export interface User {
  name: string;
  email: string;
  role: string;
  preferredLanguage: string;
  isJudge: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, name?: string, language?: string) => void;
  signup: (name: string, email: string, language: string) => void;
  loginAsJudge: () => void;
  logout: () => void;
}

const STORAGE_KEY = "disha_user_session";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      /* ignore storage error */
    }
  }, [user]);

  const login = (email: string, name?: string, language: string = "English") => {
    const newUser: User = {
      name: name || email.split("@")[0] || "Traveler",
      email,
      role: "Standard User",
      preferredLanguage: language,
      isJudge: false,
    };
    setUser(newUser);
    toast.success(`Welcome back, ${newUser.name}!`);
  };

  const signup = (name: string, email: string, language: string) => {
    const newUser: User = {
      name,
      email,
      role: "Verified Tourist",
      preferredLanguage: language,
      isJudge: false,
    };
    setUser(newUser);
    toast.success(`Account created successfully! Welcome to Disha, ${name}.`);
  };

  const loginAsJudge = () => {
    const judgeUser: User = {
      name: "SIH Judge / Evaluator",
      email: "evaluator@sih2026.gov.in",
      role: "SIH Evaluator",
      preferredLanguage: "English",
      isJudge: true,
    };
    setUser(judgeUser);
    toast.success("⚡ Logged in as SIH Evaluator (Demo Mode Activated)", {
      description: "Jaipur context loaded with full access to SOS, Itinerary Engine & Safety Network.",
    });
  };

  const logout = () => {
    setUser(null);
    toast.info("Logged out of Disha session.");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        signup,
        loginAsJudge,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
