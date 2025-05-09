import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layouts/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserManagement } from "@/components/admin/UserManagement";
import { SystemSettings } from "@/components/admin/SystemSettings";
import { ApiKeyManagement } from "@/components/admin/ApiKeyManagement";
import { ActivityLogs } from "@/components/admin/ActivityLogs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Navigate } from "wouter";
import { Button } from "@/components/ui/button";
import { Gauge, Shield, Users, Key, Activity, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DashboardMetrics } from "@/components/admin/DashboardMetrics";

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  
  useEffect(() => {
    // Check if user is admin
    if (user && user.role !== "admin") {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin panel",
        variant: "destructive"
      });
    }
  }, [user, toast]);

  // Redirect non-admin users
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" />;
  }
  
  if (user && user.role !== "admin") {
    return <Navigate to="/dashboard" />;
  }

  return (
    <MainLayout title="Admin Dashboard" subtitle="Manage your CryptoPilot platform">
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl font-bold">Admin Control Panel</CardTitle>
          <CardDescription>
            Manage users, monitor system activity, and configure platform settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-6 gap-4 mb-8">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <Gauge className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Users</span>
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">Activity</span>
              </TabsTrigger>
              <TabsTrigger value="api-keys" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                <span className="hidden sm:inline">API Keys</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard" className="p-0">
              <DashboardMetrics />
            </TabsContent>
            
            <TabsContent value="users" className="p-0">
              <UserManagement />
            </TabsContent>
            
            <TabsContent value="activity" className="p-0">
              <ActivityLogs />
            </TabsContent>
            
            <TabsContent value="api-keys" className="p-0">
              <ApiKeyManagement />
            </TabsContent>
            
            <TabsContent value="settings" className="p-0">
              <SystemSettings />
            </TabsContent>
            
            <TabsContent value="analytics" className="p-0">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Analytics</CardTitle>
                  <CardDescription>Review key performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center min-h-[300px]">
                    <p className="text-muted-foreground text-sm">
                      Analytics dashboard integration in progress
                    </p>
                    <Button variant="outline" className="mt-4">
                      Refresh Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </MainLayout>
  );
}