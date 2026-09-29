import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

export type UserRole = "Guest" | "Staff" | "Manager" | "SIH Evaluator";

export interface User {
  name: string;
  email: string;
  role: UserRole;
  roomNumber?: string;
  preferredLanguage: string;
  isJudge: boolean;
}

interface AuthContextType {
  user: User | null;
  activeRole: UserRole;
  isAuthenticated: boolean;
  login: (email: string, name?: string, role?: UserRole, roomNumber?: string, language?: string) => void;
  signup: (name: string, email: string, role: UserRole, language: string) => void;
  loginAsJudge: () => void;
  setActiveRole: (role: UserRole) => void;
  logout: () => void;
}

const STORAGE_KEY = "disha_hospitality_session";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {
        name: "SIH Evaluator",
        email: "evaluator@disha.hospitality",
        role: "SIH Evaluator",
        roomNumber: "Suite 402",
        preferredLanguage: "English",
        isJudge: true,
      };
    } catch {
      return null;
    }
  });

  const [activeRole, setActiveRoleState] = useState<UserRole>(() => {
    return user?.role || "Guest";
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

  const setActiveRole = (role: UserRole) => {
    setActiveRoleState(role);
    if (user) {
      setUser({ ...user, role });
    }
    toast.info(`Switched interface to ${role} Mode`, {
      description: role === "Guest" ? "Viewing Guest Stay Experience" : role === "Staff" ? "Viewing Hotel Staff Operations Queue" : "Viewing Hotel Management & Intelligence Center",
    });
  };

  const login = (email: string, name?: string, role: UserRole = "Guest", roomNumber: string = "Suite 304", language: string = "English") => {
    const newUser: User = {
      name: name || email.split("@")[0] || "Valued Guest",
      email,
      role,
      roomNumber,
      preferredLanguage: language,
      isJudge: false,
    };
    setUser(newUser);
    setActiveRoleState(role);
    toast.success(`Welcome to DISHA Hospitality, ${newUser.name}!`);
  };

  const signup = (name: string, email: string, role: UserRole = "Guest", language: string = "English") => {
    const newUser: User = {
      name,
      email,
      role,
      roomNumber: "Suite 304",
      preferredLanguage: language,
      isJudge: false,
    };
    setUser(newUser);
    setActiveRoleState(role);
    toast.success(`Account created successfully! Welcome to DISHA, ${name}.`);
  };

  const loginAsJudge = () => {
    const judgeUser: User = {
      name: "SIH Evaluator",
      email: "evaluator@disha.hospitality",
      role: "SIH Evaluator",
      roomNumber: "Royal Suite 401",
      preferredLanguage: "English",
      isJudge: true,
    };
    setUser(judgeUser);
    setActiveRoleState("Guest");
    toast.success("⚡ Logged in as SIH Evaluator (Demo Mode)", {
      description: "Full access to Guest Experience, Hotel Command Center & Environmental Safety.",
    });
  };

  const logout = () => {
    setUser(null);
    toast.info("Logged out of DISHA session.");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        activeRole,
        isAuthenticated: !!user,
        login,
        signup,
        loginAsJudge,
        setActiveRole,
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

