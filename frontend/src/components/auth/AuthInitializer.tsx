
"use client";

import { useEffect, useState, createContext, useContext, type ReactNode } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { DEMO_MODE, MOCK_USER } from '@/lib/mock-data';


interface AuthContextType {
  user: User | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export function AuthInitializer({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (DEMO_MODE) {
      // Em modo demo, verificar se tem "sessão" ativa via localStorage
      const isDemoLoggedIn = typeof window !== "undefined" && localStorage.getItem("demo_logged_in") === "true";
      if (isDemoLoggedIn) {
        setUser(MOCK_USER as unknown as User);
      } else {
        setUser(null);
      }
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Listen for demo login/logout events
  useEffect(() => {
    if (!DEMO_MODE) return;
    
    const handleDemoAuth = () => {
      const isDemoLoggedIn = localStorage.getItem("demo_logged_in") === "true";
      if (isDemoLoggedIn) {
        setUser(MOCK_USER as unknown as User);
      } else {
        setUser(null);
      }
    };

    window.addEventListener("demo-auth-change", handleDemoAuth);
    return () => window.removeEventListener("demo-auth-change", handleDemoAuth);
  }, []);

  useEffect(() => {
    if (loading) return;

    const isAuthPage = pathname === '/login';
    const isDashboardPage = pathname.startsWith('/dashboard');

    if (!user && isDashboardPage) {
      router.replace('/login');
    } else if (user && isAuthPage) {
      router.replace('/dashboard');
    } else if (!user && pathname === '/') {
      router.replace('/login');
    } else if (user && pathname === '/') {
      router.replace('/dashboard');
    }
  }, [user, loading, pathname, router]);

  if (loading && (pathname.startsWith('/dashboard') || pathname === '/')) {
     return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }


  return (
    <AuthContext.Provider value={{ user, loading }}>
      <TooltipProvider>
        {children}
        <Toaster />
      </TooltipProvider>
    </AuthContext.Provider>
  );
}

