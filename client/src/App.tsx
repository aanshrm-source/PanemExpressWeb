import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient, apiRequest } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/layout/navbar";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import BookTicket from "@/pages/book-ticket";
import MyBookings from "@/pages/my-bookings";
import Confirmation from "@/pages/confirmation";
import NotFound from "@/pages/not-found";

function Router() {
  const [user, setUser] = useState<{ username: string; email: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, setLocation] = useLocation();

  useEffect(() => {
    async function checkAuth() {
      try {
        const result = await apiRequest("GET", "/api/auth/me", {});
        setUser(result.user);
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    checkAuth();
  }, []);

  const handleLogin = (userData: { username: string; email: string }) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout", {});
      setUser(null);
      setLocation("/");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} onLogout={handleLogout} />
      <Switch>
        <Route path="/" component={() => <Home user={user} />} />
        <Route path="/login" component={() => <Login onLogin={handleLogin} />} />
        <Route path="/register" component={() => <Register onLogin={handleLogin} />} />
        <Route path="/book" component={() => user ? <BookTicket /> : <Login onLogin={handleLogin} />} />
        <Route path="/bookings" component={() => user ? <MyBookings /> : <Login onLogin={handleLogin} />} />
        <Route path="/confirmation/:pnr" component={Confirmation} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
