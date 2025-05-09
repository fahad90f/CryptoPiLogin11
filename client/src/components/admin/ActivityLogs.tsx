import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, X, Search, Filter, Download, ChevronLeft, ChevronRight } from "lucide-react";

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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    action: "",
    status: "",
  });
  
  // Fetch auth logs
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['/api/admin/auth-logs', page, pageSize, search, filters],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
      });
      
      if (search) {
        queryParams.append('search', search);
      }
      
      if (filters.action && filters.action !== 'all') {
        queryParams.append('action', filters.action);
      }
      
      if (filters.status && filters.status !== 'all') {
        queryParams.append('status', filters.status);
      }
      
      const response = await apiRequest('GET', `/api/admin/auth-logs?${queryParams.toString()}`);
      return response.json();
    }
  });
  
  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page on new search
  };
  
  // Handle filter changes
  const handleFilterChange = (type: 'action' | 'status', value: string) => {
    setFilters(prev => ({ ...prev, [type]: value }));
    setPage(1); // Reset to first page on new filter
  };
  
  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && (!data || newPage <= Math.ceil(data.total / pageSize))) {
      setPage(newPage);
    }
  };
  
  // Handle page size change
  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    setPage(1); // Reset to first page on page size change
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "MMM d, yyyy h:mm a");
  };
  
  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
        return <Badge variant="success">Success</Badge>;
      case 'failure':
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'warning':
        return <Badge variant="warning">Warning</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Export logs to CSV
  const exportLogsToCSV = () => {
    if (!data || !data.logs) return;
    
    // Define CSV header
    const headers = ['ID', 'User', 'Action', 'Status', 'IP Address', 'User Agent', 'Date'];
    
    // Convert logs to CSV rows
    const rows = data.logs.map((log: AuthLog) => [
      log.id,
      log.user ? log.user.username : 'N/A',
      log.action,
      log.status,
      log.ipAddress || 'N/A',
      log.userAgent || 'N/A',
      log.createdAt
    ]);
    
    // Combine header and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create Blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `auth-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:items-center md:space-y-0">
          <div>
            <CardTitle>Authentication Activity Logs</CardTitle>
            <CardDescription>Track user authentication and security events</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="flex items-center gap-1"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button 
              variant="outline"
              size="sm"
              onClick={exportLogsToCSV}
              className="flex items-center gap-1"
              disabled={!data || !data.logs.length}
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:items-center md:space-y-0 mb-4">
          <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search user or IP..."
                value={search}
                onChange={handleSearchChange}
                className="pl-8"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select
                value={filters.action}
                onValueChange={(value) => handleFilterChange('action', value)}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="logout">Logout</SelectItem>
                  <SelectItem value="register">Register</SelectItem>
                  <SelectItem value="password_reset">Password Reset</SelectItem>
                  <SelectItem value="api_access">API Access</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.status}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failure">Failure</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Select
              value={pageSize.toString()}
              onValueChange={handlePageSizeChange}
            >
              <SelectTrigger className="w-[80px]">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">per page</span>
          </div>
        </div>

        {isLoading ? (
          <div className="py-8 text-center">
            <RefreshCw className="animate-spin h-8 w-8 mx-auto text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">Loading authentication logs...</p>
          </div>
        ) : isError ? (
          <div className="py-8 text-center">
            <X className="h-8 w-8 mx-auto text-destructive" />
            <p className="mt-2 text-muted-foreground">Failed to load authentication logs. Please try again.</p>
          </div>
        ) : data && data.logs.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableCaption>A list of recent authentication and security events.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead className="hidden md:table-cell">User Agent</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.logs.map((log: AuthLog) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs">{log.id}</TableCell>
                    <TableCell>{log.user ? log.user.username : '—'}</TableCell>
                    <TableCell className="capitalize">{log.action.replace(/_/g, ' ')}</TableCell>
                    <TableCell>{getStatusBadge(log.status)}</TableCell>
                    <TableCell className="font-mono text-xs">{log.ipAddress || '—'}</TableCell>
                    <TableCell className="hidden md:table-cell truncate max-w-[200px]" title={log.userAgent || ''}>
                      {log.userAgent || '—'}
                    </TableCell>
                    <TableCell>{formatDate(log.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">No authentication logs found.</p>
          </div>
        )}
      </CardContent>
      
      {data && data.logs.length > 0 && (
        <CardFooter className="flex items-center justify-between px-6">
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{(page - 1) * pageSize + 1}</span> to{" "}
            <span className="font-medium">
              {Math.min(page * pageSize, data.total)}
            </span>{" "}
            of <span className="font-medium">{data.total}</span> results
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={page * pageSize >= data.total}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}