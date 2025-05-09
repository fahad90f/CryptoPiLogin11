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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { MoreHorizontal, Search, UserCog, Ban, RefreshCw, Trash2, Edit, LockKeyhole } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

type User = {
  id: number;
  username: string;
  email: string | null;
  displayName: string | null;
  role: string;
  isActive: boolean;
  isSuspended: boolean;
  lastLoginAt: string | null;
  lastLogoutAt: string | null;
  createdAt: string;
};

export function UserManagement() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [suspensionReason, setSuspensionReason] = useState("");
  const [suspensionDuration, setSuspensionDuration] = useState("7");
  
  const limit = 10;

  // Fetch users from API
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['/api/admin/users', page, search],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      if (search) {
        queryParams.append('search', search);
      }
      
      return await apiRequest<{ users: User[], total: number }>(`/api/admin/users?${queryParams.toString()}`);
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    refetch();
  };

  const handleEditUser = async (formData: FormData) => {
    if (!selectedUser) return;
    
    try {
      const userData = {
        username: formData.get('username') as string,
        email: formData.get('email') as string,
        displayName: formData.get('displayName') as string,
        role: formData.get('role') as string,
      };
      
      await apiRequest(`/api/admin/users/${selectedUser.id}`, {
        method: 'PATCH',
        body: JSON.stringify(userData),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      toast({
        title: "User Updated",
        description: `User ${userData.username} has been updated successfully.`
      });
      
      setIsEditModalOpen(false);
      refetch();
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "There was an error updating the user. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser || !newPassword) return;
    
    try {
      await apiRequest(`/api/admin/users/${selectedUser.id}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ newPassword }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      toast({
        title: "Password Reset",
        description: `Password for ${selectedUser.username} has been reset successfully.`
      });
      
      setIsPasswordModalOpen(false);
      setNewPassword("");
    } catch (error) {
      toast({
        title: "Reset Failed",
        description: "There was an error resetting the password. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSuspendUser = async () => {
    if (!selectedUser) return;
    
    try {
      await apiRequest(`/api/admin/users/${selectedUser.id}/suspend`, {
        method: 'POST',
        body: JSON.stringify({
          reason: suspensionReason,
          duration: parseInt(suspensionDuration)
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      toast({
        title: "User Suspended",
        description: `User ${selectedUser.username} has been suspended.`
      });
      
      setIsSuspendModalOpen(false);
      setSuspensionReason("");
      setSuspensionDuration("7");
      refetch();
    } catch (error) {
      toast({
        title: "Suspension Failed",
        description: "There was an error suspending the user. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUnsuspendUser = async (user: User) => {
    try {
      await apiRequest(`/api/admin/users/${user.id}/unsuspend`, {
        method: 'POST'
      });
      
      toast({
        title: "User Unsuspended",
        description: `User ${user.username} has been unsuspended.`
      });
      
      refetch();
    } catch (error) {
      toast({
        title: "Action Failed",
        description: "There was an error unsuspending the user. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      await apiRequest(`/api/admin/users/${selectedUser.id}`, {
        method: 'DELETE'
      });
      
      toast({
        title: "User Deleted",
        description: `User ${selectedUser.username} has been deleted permanently.`
      });
      
      setIsDeleteModalOpen(false);
      refetch();
    } catch (error) {
      toast({
        title: "Deletion Failed",
        description: "There was an error deleting the user. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              Manage user accounts, permissions and status
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
              <Input
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-[200px]"
              />
              <Button type="submit" size="icon" variant="secondary">
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead className="w-[70px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    Loading users...
                  </TableCell>
                </TableRow>
              ) : data?.users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No users found. Try adjusting your search.
                  </TableCell>
                </TableRow>
              ) : (
                data?.users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>{user.email || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === "admin" ? "destructive" : "secondary"}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.isSuspended ? (
                        <Badge variant="destructive">Suspended</Badge>
                      ) : user.isActive ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : "Never"}
                    </TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user);
                              setIsEditModalOpen(true);
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user);
                              setIsPasswordModalOpen(true);
                            }}
                          >
                            <LockKeyhole className="mr-2 h-4 w-4" />
                            Reset Password
                          </DropdownMenuItem>
                          {user.isSuspended ? (
                            <DropdownMenuItem
                              onClick={() => handleUnsuspendUser(user)}
                            >
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Unsuspend
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedUser(user);
                                setIsSuspendModalOpen(true);
                              }}
                            >
                              <Ban className="mr-2 h-4 w-4" />
                              Suspend
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user);
                              setIsDeleteModalOpen(true);
                            }}
                            className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {data && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {data.users.length} of {data.total} users
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
                disabled={data.users.length < limit}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      
      {/* Edit User Modal */}
      {selectedUser && (
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user information and permissions for {selectedUser.username}
              </DialogDescription>
            </DialogHeader>
            <form action={handleEditUser}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="username" className="text-sm font-medium">Username</label>
                  <Input
                    id="username"
                    name="username"
                    defaultValue={selectedUser.username}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="email" className="text-sm font-medium">Email</label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={selectedUser.email || ""}
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="displayName" className="text-sm font-medium">Display Name</label>
                  <Input
                    id="displayName"
                    name="displayName"
                    defaultValue={selectedUser.displayName || ""}
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="role" className="text-sm font-medium">Role</label>
                  <Select name="role" defaultValue={selectedUser.role}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Reset Password Modal */}
      {selectedUser && (
        <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reset Password</DialogTitle>
              <DialogDescription>
                Set a new password for {selectedUser.username}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="newPassword" className="text-sm font-medium">New Password</label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsPasswordModalOpen(false);
                setNewPassword("");
              }}>
                Cancel
              </Button>
              <Button onClick={handleResetPassword} disabled={!newPassword}>
                Reset Password
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Suspend User Modal */}
      {selectedUser && (
        <Dialog open={isSuspendModalOpen} onOpenChange={setIsSuspendModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Suspend User</DialogTitle>
              <DialogDescription>
                Suspend access for {selectedUser.username}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="suspensionReason" className="text-sm font-medium">Reason for Suspension</label>
                <Input
                  id="suspensionReason"
                  value={suspensionReason}
                  onChange={(e) => setSuspensionReason(e.target.value)}
                  placeholder="Violation of terms of service"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="suspensionDuration" className="text-sm font-medium">Duration (days)</label>
                <Select value={suspensionDuration} onValueChange={setSuspensionDuration}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 day</SelectItem>
                    <SelectItem value="3">3 days</SelectItem>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="0">Indefinite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsSuspendModalOpen(false);
                setSuspensionReason("");
                setSuspensionDuration("7");
              }}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleSuspendUser}>
                Suspend User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Delete User Confirmation */}
      {selectedUser && (
        <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action will permanently delete the user account for <strong>{selectedUser.username}</strong> along with all associated data. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete User
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </Card>
  );
}