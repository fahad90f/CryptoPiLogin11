import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Generate from "@/pages/generate";
import Convert from "@/pages/convert";
import Transfer from "@/pages/transfer";
import Settings from "@/pages/settings";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import { AuthProvider } from "@/context/AuthContext";
import { useAuth } from "@/hooks/use-auth";

// Protected route component
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="h-screen flex items-center justify-center bg-background">Loading...</div>;
  }

  if (!isAuthenticated) {
    window.location.href = "/login";
    return null;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/generate" component={Generate} />
      <Route path="/convert" component={Convert} />
      <Route path="/transfer" component={Transfer} />
      <Route path="/settings" component={Settings} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
