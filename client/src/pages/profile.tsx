import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getPercentageClass } from "@/lib/utils";

const profileFormSchema = z.object({
  displayName: z.string().optional(),
  email: z.string().email().optional(),
  phoneNumber: z.string().optional(),
});

const passwordFormSchema = z.object({
  currentPassword: z.string().min(8, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters long"),
  confirmPassword: z.string().min(8, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function Profile() {
  const { toast } = useToast();
  
  // Fetch profile data
  const { data: profileData, isLoading: isProfileLoading } = useQuery({
    queryKey: ['/api/profile'],
  });
  
  // Fetch performance data
  const { data: performanceData, isLoading: isPerformanceLoading } = useQuery({
    queryKey: ['/api/profile/performance'],
  });

  // Profile form setup
  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: "",
      email: "",
      phoneNumber: "",
    },
  });

  // Update form with profile data when available
  useEffect(() => {
    if (profileData?.user) {
      profileForm.reset({
        displayName: profileData.user.displayName || "",
        email: profileData.user.email || "",
        phoneNumber: profileData.user.phoneNumber || "",
      });
    }
  }, [profileData, profileForm]);

  // Handle profile form submission
  const onProfileSubmit = async (values: z.infer<typeof profileFormSchema>) => {
    try {
      const response = await apiRequest('/api/profile', {
        method: 'PATCH',
        body: JSON.stringify(values),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to update profile",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Password form setup
  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Handle password form submission
  const onPasswordSubmit = async (values: z.infer<typeof passwordFormSchema>) => {
    try {
      const response = await apiRequest('/api/profile/password', {
        method: 'PUT',
        body: JSON.stringify({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      passwordForm.reset();
      
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });
    } catch (error) {
      toast({
        title: "Failed to update password",
        description: "There was an error updating your password. Please check your current password and try again.",
        variant: "destructive",
      });
    }
  };

  // Format transaction data for the RecentTransactions component
  const formatTransactions = () => {
    if (!profileData?.recentTransactions) return [];
    
    return profileData.recentTransactions.map((tx: any) => ({
      id: tx.id.toString(),
      type: tx.type,
      name: tx.type === 'convert' 
        ? `${tx.fromSymbol} → ${tx.toSymbol}`
        : tx.type === 'transfer'
          ? `Transfer ${tx.toSymbol}`
          : `Generate ${tx.toSymbol}`,
      time: new Date(tx.createdAt).toLocaleString(),
      amount: tx.amount.toString(),
      status: tx.status,
      blockchain: tx.blockchain,
    }));
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column - Performance */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Performance</CardTitle>
                <CardDescription>Your USD performance at a glance</CardDescription>
              </CardHeader>
              <CardContent>
                {isPerformanceLoading ? (
                  <div className="h-48 flex items-center justify-center">
                    <p>Loading performance data...</p>
                  </div>
                ) : performanceData ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Current Value</p>
                        <p className="text-2xl font-bold">${performanceData.currentValue.toLocaleString()}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">All Time</p>
                        <p className={`text-2xl font-bold ${getPercentageClass(
                          parseFloat(performanceData.growthPercentage)
                        )}`}>
                          {performanceData.growthPercentage}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Past Month</p>
                        <p className={`text-2xl font-bold ${getPercentageClass(
                          parseFloat(performanceData.monthlyChange)
                        )}`}>
                          {performanceData.monthlyChange}
                        </p>
                      </div>
                    </div>
                    <PerformanceChart 
                      data={performanceData.data} 
                      title="Portfolio Value (USD)" 
                      height={250} 
                    />
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center">
                    <p>No performance data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your recent transactions</CardDescription>
              </CardHeader>
              <CardContent>
                {isProfileLoading ? (
                  <div className="h-48 flex items-center justify-center">
                    <p>Loading transactions...</p>
                  </div>
                ) : profileData?.recentTransactions?.length > 0 ? (
                  <RecentTransactions 
                    transactions={formatTransactions()} 
                    onViewAll={() => {}} 
                  />
                ) : (
                  <div className="h-48 flex items-center justify-center">
                    <p>No recent transactions</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Right Column - Personal Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="/avatar-placeholder.png" alt="Profile" />
                    <AvatarFallback>
                      {profileData?.user?.displayName?.charAt(0) || 
                       profileData?.user?.username?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>{profileData?.user?.displayName || profileData?.user?.username}</CardTitle>
                    <CardDescription>{profileData?.user?.email || "No email provided"}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Username</span>
                    <span className="text-sm font-medium">{profileData?.user?.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Account Type</span>
                    <span className="text-sm font-medium capitalize">{profileData?.user?.role || "User"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Joined</span>
                    <span className="text-sm font-medium">
                      {profileData?.user?.createdAt
                        ? new Date(profileData.user.createdAt).toLocaleDateString()
                        : "Unknown"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Wallets</span>
                    <span className="text-sm font-medium">{profileData?.wallets?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Tokens</span>
                    <span className="text-sm font-medium">{profileData?.tokens?.length || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Tabs defaultValue="personal">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="personal">Personal Info</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>
              
              <TabsContent value="personal">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your personal details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...profileForm}>
                      <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                        <FormField
                          control={profileForm.control}
                          name="displayName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Display Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Your name" {...field} />
                              </FormControl>
                              <FormDescription>
                                This is the name that will be displayed to other users.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={profileForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input placeholder="your.email@example.com" {...field} />
                              </FormControl>
                              <FormDescription>
                                Your email address for notifications.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={profileForm.control}
                          name="phoneNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input placeholder="+1 (555) 123-4567" {...field} />
                              </FormControl>
                              <FormDescription>
                                Your phone number for optional SMS alerts.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button type="submit" className="w-full">
                          Update Profile
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>Update your account password</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...passwordForm}>
                      <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                        <FormField
                          control={passwordForm.control}
                          name="currentPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={passwordForm.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>New Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                              </FormControl>
                              <FormDescription>
                                Password must be at least 8 characters long.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={passwordForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm New Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button type="submit" className="w-full">
                          Change Password
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}