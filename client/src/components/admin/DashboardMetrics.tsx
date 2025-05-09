import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { RefreshCw, Users, DollarSign, ArrowUpDown, Wallet } from "lucide-react";
import { formatCompactNumber, getRandomColor } from "@/lib/utils";

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
  // Fetch statistics
  const { data, isLoading, isError } = useQuery({
    queryKey: ['/api/admin/statistics'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/statistics');
      return response.json();
    }
  });

  // Format transaction type label
  const formatTransactionType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border p-2 rounded-md shadow-md">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {
                entry.name.includes("Amount") || entry.name.includes("Revenue")
                  ? `$${entry.value.toLocaleString()}`
                  : entry.value.toLocaleString()
              }
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array(8).fill(0).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="h-20 bg-muted rounded-t-lg"></CardHeader>
            <CardContent className="h-24 bg-muted rounded-b-lg"></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center">
        <div className="mx-auto h-12 w-12 text-destructive">
          <RefreshCw className="h-12 w-12" />
        </div>
        <p className="mt-4 text-lg font-medium">Failed to load dashboard metrics</p>
        <p className="text-muted-foreground">There was an error loading the metrics. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* User metrics */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{data.newUsersToday} new today
            </p>
          </CardContent>
        </Card>
        
        {/* Wallet metrics */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Wallets</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.activeWallets.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {((data.activeWallets / data.totalUsers) * 100).toFixed(1)}% of users
            </p>
          </CardContent>
        </Card>
        
        {/* Transaction metrics */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalTransactions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{data.transactionsToday} transactions today
            </p>
          </CardContent>
        </Card>
        
        {/* Volume metrics */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.totalVolume}</div>
            <p className="text-xs text-muted-foreground">
              +${data.volumeToday} volume today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* User Growth Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>New user registrations over time</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data.userGrowth}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284c7" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="New Users"
                  stroke="#0284c7"
                  fillOpacity={1}
                  fill="url(#colorUsers)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Transactions by Type Chart */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Transactions by Type</CardTitle>
            <CardDescription>Distribution of transaction types</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.transactionsByType}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="type"
                  label={({ type }) => formatTransactionType(type)}
                >
                  {data.transactionsByType.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={getRandomColor(index)} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(value) => formatTransactionType(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Daily revenue in USD</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.revenueData}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" />
                <YAxis formatter={(value: number) => `$${formatCompactNumber(value)}`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="amount"
                  name="Revenue"
                  fill="#16a34a"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}