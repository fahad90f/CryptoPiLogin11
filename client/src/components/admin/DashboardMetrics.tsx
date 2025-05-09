import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { apiRequest } from "@/lib/queryClient";
import { RefreshCw, Users, ArrowUpRight, ArrowDownRight, Wallet, Activity, ChevronRight, Download } from "lucide-react";
import { useState } from "react";

// Types for statistics data
type SystemStats = {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  totalTransactions: number;
  transactionsToday: number;
  totalVolume: string;
  volumeToday: string;
  activeWallets: number;
  conversionRate: number;
  userGrowth: {
    date: string;
    count: number;
  }[];
  transactionsByType: {
    type: string;
    count: number;
  }[];
  revenueData: {
    date: string;
    amount: number;
  }[];
};

export function DashboardMetrics() {
  const [timeframe, setTimeframe] = useState("week");
  
  // Fetch system statistics
  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['/api/admin/statistics', timeframe],
    queryFn: async () => {
      return await apiRequest<SystemStats>(`/api/admin/statistics?period=${timeframe}`);
    }
  });

  // Custom Recharts tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-md p-2 shadow-md text-sm">
          <p className="font-medium">{label}</p>
          <p>{`${payload[0].name}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  // Transform data for charts
  const transactionTypeData = stats?.transactionsByType || [
    { type: 'generate', count: 42 },
    { type: 'convert', count: 28 },
    { type: 'transfer', count: 15 }
  ];

  const userGrowthData = stats?.userGrowth || [
    { date: 'Mon', count: 4 },
    { date: 'Tue', count: 7 },
    { date: 'Wed', count: 5 },
    { date: 'Thu', count: 8 },
    { date: 'Fri', count: 12 },
    { date: 'Sat', count: 9 },
    { date: 'Sun', count: 11 }
  ];

  const revenueData = stats?.revenueData || [
    { date: 'Mon', amount: 1200 },
    { date: 'Tue', amount: 1800 },
    { date: 'Wed', amount: 1400 },
    { date: 'Thu', amount: 2200 },
    { date: 'Fri', amount: 1900 },
    { date: 'Sat', amount: 1600 },
    { date: 'Sun', amount: 2100 }
  ];

  // Colors for pie chart
  const COLORS = ['#3B82F6', '#10B981', '#F97316', '#8B5CF6'];

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-24"></div>
                <div className="h-7 bg-muted rounded w-16"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-32"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array(2).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-5 bg-muted rounded w-40"></div>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Tabs value={timeframe} onValueChange={setTimeframe} className="w-[400px]">
          <TabsList>
            <TabsTrigger value="day">Today</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
            <TabsTrigger value="year">This Year</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Users</CardDescription>
            <CardTitle className="text-2xl">
              {stats?.totalUsers.toLocaleString() || "0"}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-between items-center pt-0">
            <div className="flex items-center text-sm">
              <Users className="text-muted-foreground h-4 w-4 mr-1" />
              <span className="text-muted-foreground">
                {stats?.newUsersToday || 0} new today
              </span>
            </div>
            <div className="flex items-center">
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-500">
                5.2%
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Wallets</CardDescription>
            <CardTitle className="text-2xl">
              {stats?.activeWallets.toLocaleString() || "0"}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-between items-center pt-0">
            <div className="flex items-center text-sm">
              <Wallet className="text-muted-foreground h-4 w-4 mr-1" />
              <span className="text-muted-foreground">
                {Math.round((stats?.activeWallets || 0) / (stats?.totalUsers || 1) * 100)}% of users
              </span>
            </div>
            <div className="flex items-center">
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-500">
                3.1%
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Transactions</CardDescription>
            <CardTitle className="text-2xl">
              {stats?.totalTransactions.toLocaleString() || "0"}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-between items-center pt-0">
            <div className="flex items-center text-sm">
              <Activity className="text-muted-foreground h-4 w-4 mr-1" />
              <span className="text-muted-foreground">
                {stats?.transactionsToday || 0} today
              </span>
            </div>
            <div className="flex items-center">
              <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
              <span className="text-sm text-red-500">
                2.5%
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Volume</CardDescription>
            <CardTitle className="text-2xl">
              ${stats?.totalVolume || "0"}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-between items-center pt-0">
            <div className="flex items-center text-sm">
              <Activity className="text-muted-foreground h-4 w-4 mr-1" />
              <span className="text-muted-foreground">
                ${stats?.volumeToday || "0"} today
              </span>
            </div>
            <div className="flex items-center">
              <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-500">
                7.4%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">User Growth</CardTitle>
            <CardDescription>
              New user registrations over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userGrowthData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Users" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Transaction Types</CardTitle>
            <CardDescription>
              Distribution of transaction types
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={transactionTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="type"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {transactionTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Revenue Overview</CardTitle>
            <CardDescription>
              Platform revenue over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    name="Revenue ($)"
                    stroke="#10B981"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="ghost" className="w-full justify-between">
              View all users
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="ghost" className="w-full justify-between">
              Recent sign ups
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Transaction Monitoring</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="ghost" className="w-full justify-between">
              View all transactions
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="ghost" className="w-full justify-between">
              Flagged transactions
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="ghost" className="w-full justify-between">
              Monthly summary
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="ghost" className="w-full justify-between">
              Security audit
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}