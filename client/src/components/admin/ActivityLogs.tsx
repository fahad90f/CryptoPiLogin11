import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DatePicker } from "@/components/ui/date-picker";
import { Search, Download, RefreshCw } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type AuthLog = {
  id: number;
  userId: number | null;
  action: string;
  status: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user?: {
    username: string;
  };
};

export function ActivityLogs() {
  const [activeTab, setActiveTab] = useState("auth");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  
  const limit = 15;

  // Fetch authentication logs from API
  const {
    data: authLogs,
    isLoading: isLoadingAuthLogs,
    refetch: refetchAuthLogs
  } = useQuery({
    queryKey: ['/api/admin/logs/auth', page, search, actionFilter, statusFilter, startDate, endDate],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      if (search) {
        queryParams.append('search', search);
      }
      
      if (actionFilter !== "all") {
        queryParams.append('action', actionFilter);
      }
      
      if (statusFilter !== "all") {
        queryParams.append('status', statusFilter);
      }
      
      if (startDate) {
        queryParams.append('startDate', startDate.toISOString());
      }
      
      if (endDate) {
        queryParams.append('endDate', endDate.toISOString());
      }
      
      return await apiRequest<{ logs: AuthLog[], total: number }>(
        `/api/admin/logs/auth?${queryParams.toString()}`
      );
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    if (activeTab === "auth") {
      refetchAuthLogs();
    } else {
      // Refetch transaction logs when implemented
    }
  };

  const handleExport = () => {
    // Export logs to CSV
    if (!authLogs || !authLogs.logs.length) return;
    
    const headers = ["ID", "User", "Action", "Status", "IP Address", "User Agent", "Timestamp"];
    const rows = authLogs.logs.map(log => [
      log.id.toString(),
      log.user?.username || 'Unknown',
      log.action,
      log.status,
      log.ipAddress || 'N/A',
      log.userAgent || 'N/A',
      new Date(log.createdAt).toLocaleString()
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `auth-logs-${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActionBadgeVariant = (action: string) => {
    switch (action) {
      case 'login':
        return 'default';
      case 'logout':
        return 'secondary';
      case 'register':
        return 'success';
      case 'password_reset':
        return 'warning';
      default:
        return 'outline';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    return status === 'success' ? 'success' : 'destructive';
  };

  const resetFilters = () => {
    setSearch("");
    setActionFilter("all");
    setStatusFilter("all");
    setStartDate(undefined);
    setEndDate(undefined);
    setPage(1);
    refetchAuthLogs();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Activity Logs</CardTitle>
            <CardDescription>
              Monitor user activity and system events
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport} disabled={!authLogs || !authLogs.logs.length}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={resetFilters}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="auth">Authentication Logs</TabsTrigger>
            <TabsTrigger value="transactions">Transaction Logs</TabsTrigger>
          </TabsList>
          
          {/* Search and filter controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <form onSubmit={handleSearch} className="flex w-full items-center space-x-2">
              <Input
                placeholder="Search logs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full"
              />
              <Button type="submit" size="icon" variant="secondary">
                <Search className="h-4 w-4" />
              </Button>
            </form>
            
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Action</label>
              <Select
                value={actionFilter}
                onValueChange={setActionFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All actions</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="logout">Logout</SelectItem>
                  <SelectItem value="register">Register</SelectItem>
                  <SelectItem value="password_reset">Password Reset</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Status</label>
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failure">Failure</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col gap-1 lg:col-span-1">
              <label className="text-xs text-muted-foreground">Date Range</label>
              <div className="flex gap-2">
                <DatePicker
                  date={startDate}
                  setDate={setStartDate}
                  placeholder="From"
                />
                <DatePicker
                  date={endDate}
                  setDate={setEndDate}
                  placeholder="To"
                />
              </div>
            </div>
          </div>
          
          <TabsContent value="auth" className="p-0">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingAuthLogs ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        Loading logs...
                      </TableCell>
                    </TableRow>
                  ) : authLogs?.logs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No logs found. Try adjusting your filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    authLogs?.logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>{log.user?.username || `User ID: ${log.userId || 'Unknown'}`}</TableCell>
                        <TableCell>
                          <Badge variant={getActionBadgeVariant(log.action)}>
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(log.status)}>
                            {log.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{log.ipAddress || "—"}</TableCell>
                        <TableCell>
                          {new Date(log.createdAt).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            {authLogs && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {authLogs.logs.length} of {authLogs.total} logs
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => p + 1)}
                    disabled={authLogs.logs.length < limit}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="transactions" className="p-0">
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <p className="text-muted-foreground mb-4">
                Transaction logs coming soon.
              </p>
              <Button variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Check Again
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}