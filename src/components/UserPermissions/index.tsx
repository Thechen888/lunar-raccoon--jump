import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock, Plus, RefreshCw, Shield, Users } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { UserList } from "./UserList";
import { SystemRoleCard } from "./SystemRoleCard";
import { DocumentRoleCard } from "./DocumentRoleCard";
import { ModelRoleCard } from "./ModelRoleCard";
import { MCPRoleCard } from "./MCPRoleCard";

// 系统权限
const systemPermissions = [
  { id: "admin:users", name: "用户管理", description: "管理系统用户" },
  { id: "admin:roles", name: "角色管理", description: "管理角色和权限" },
  { id: "admin:settings", name: "系统设置", description: "管理系统全局设置" }
];

// 文档权限
const documentPermissions = [
  { id: "docs:read", name: "查看文档", description: "查看文档集和原文档" },
  { id: "docs:upload", name: "上传文档", description: "上传和更新文档" },
  { id: "docs:manage", name: "管理文档", description: "管理文档集和配置" }
];

// 模型权限
const modelPermissions = [
  { id: "model:read", name: "查看模型", description: "查看模型配置" },
  { id: "model:manage", name: "管理模型", description: "添加、编辑、删除模型" },
  { id: "model:use", name: "使用模型", description: "使用模型进行对话" }
];

// MCP权限
const mcpPermissions = [
  { id: "mcp:manage", name: "管理MCP", description: "添加、编辑、删除MCP服务" },
  { id: "mcp:view", name: "查看MCP", description: "查看MCP服务配置" }
];

interface Role {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  isSystem: boolean;
  permissions: string[];
}

interface User {
  id: string;
  name: string;
  email: string;
  roleId: string;
  lastLogin: string;
  status: "active" | "inactive";
}

interface UserPermissionsProps {
  currentUser: { name: string; permissions: string[] };
}

export const UserPermissions = ({ currentUser }: UserPermissionsProps) => {
  const [roles, setRoles] = useState<Role[]>([
    {
      id: "role-admin",
      name: "管理员",
      description: "拥有所有权限的系统管理员",
      isDefault: false,
      isSystem: true,
      permissions: [
        ...systemPermissions.map((p) => p.id),
        ...documentPermissions.map((p) => p.id),
        ...modelPermissions.map((p) => p.id),
        ...mcpPermissions.map((p) => p.id) // 管理员拥有所有MCP权限
      ]
    },
    {
      id: "role-user",
      name: "普通用户",
      description: "默认用户角色，可以查看和使用资源",
      isDefault: true,
      isSystem: true,
      permissions: ["docs:read", "docs:upload", "model:read", "model:use", "mcp:view"] // 普通用户只有查看MCP权限
    },
    {
      id: "role-viewer",
      name: "查看者",
      description: "只读权限，无法发起对话或修改内容",
      isDefault: false,
      isSystem: true,
      permissions: ["docs:read", "model:read", "mcp:view"] // 查看者只有查看MCP权限
    }
  ]);

  const [users, setUsers] = useState<User[]>([
    { id: "1", name: "张三", email: "zhangsan@example.com", roleId: "role-admin", lastLogin: "2024-01-16 10:30", status: "active" },
    { id: "2", name: "李四", email: "lisi@example.com", roleId: "role-user", lastLogin: "2024-01-15 14:20", status: "active" },
    { id: "3", name: "王五", email: "wangwu@example.com", roleId: "role-viewer", lastLogin: "2024-01-14 09:15", status: "active" }
  ]);

  const [activeTab, setActiveTab] = useState("users");
  const [roleTab, setRoleTab] = useState("system");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isAddRoleDialogOpen, setIsAddRoleDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [editFormData, setEditFormData] = useState<{ name: string; description: string }>({
    name: "",
    description: ""
  });
  const [syncLoading, setSyncLoading] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRoleId, setNewUserRoleId] = useState("");
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");

  const filteredUsers = users.filter(
    (user) => user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSyncFromAPI = () => {
    setSyncLoading(true);
    setTimeout(() => {
      setSyncLoading(false);
      toast.success("用户数据已从外部API同步");
    }, 2000);
  };

  const handleAddUser = () => {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: newUserName || "新用户",
      email: newUserEmail || "",
      roleId: newUserRoleId || roles.find((r) => r.isDefault)?.id || "",
      lastLogin: "从未登录",
      status: "active"
    };
    setUsers([...users, newUser]);
    setIsAddUserDialogOpen(false);
    setNewUserName("");
    setNewUserEmail("");
    setNewUserRoleId("");
    toast.success("用户已添加");
  };

  const handleAddRole = () => {
    const newRole: Role = {
      id: `role-${Date.now()}`,
      name: newRoleName || "新角色",
      description: newRoleDescription || "",
      isDefault: false,
      isSystem: false,
      permissions: []
    };
    setRoles([...roles, newRole]);
    setIsAddRoleDialogOpen(false);
    setNewRoleName("");
    setNewRoleDescription("");
    toast.success("角色已添加");
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter((u) => u.id !== userId));
    toast.success("用户已删除");
  };

  const handleDeleteRole = (roleId: string) => {
    const role = roles.find((r) => r.id === roleId);
    if (role?.isSystem) {
      toast.error("系统角色无法删除");
      return;
    }
    setRoles(roles.filter((r) => r.id !== roleId));
    toast.success("角色已删除");
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers(users.map((u) => (u.id === userId ? { ...u, status: u.status === "active" ? "inactive" : "active" } : u)));
  };

  const handleTogglePermission = (roleId: string, permissionId: string) => {
    setRoles(
      roles.map((role) =>
        role.id === roleId
          ? {
              ...role,
              permissions: role.permissions.includes(permissionId)
                ? role.permissions.filter((p) => p !== permissionId)
                : [...role.permissions, permissionId]
            }
          : role
      )
    );
  };

  const handleEditRole = (role: Role) => {
    if (role.isSystem) {
      toast.error("系统角色无法编辑");
      return;
    }
    setEditingRole(role);
    setEditFormData({
      name: role.name,
      description: role.description
    });
  };

  const handleSaveEditRole = () => {
    if (editingRole) {
      setRoles(roles.map((role) =>
        role.id === editingRole.id ? { ...role, name: editFormData.name, description: editFormData.description } : role
      ));
      setEditingRole(null);
      setEditFormData({ name: "", description: "" });
      toast.success("角色已更新");
    }
  };

  const getDefaultRole = () => roles.find((r) => r.isDefault);

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="users">用户管理</TabsTrigger>
          <TabsTrigger value="roles">角色管理</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>用户管理</span>
                  </CardTitle>
                  <CardDescription>从外部API同步用户并分配角色</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Button onClick={handleSyncFromAPI} disabled={syncLoading} variant="outline" className="focus-visible:ring-2 focus-visible:ring-ring">
                    <RefreshCw className={`h-4 w-4 mr-2 ${syncLoading ? "animate-spin" : ""}`} />
                    从API同步
                  </Button>
                  <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="focus-visible:ring-2 focus-visible:ring-ring">
                        <Plus className="h-4 w-4 mr-2" />
                        添加用户
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>添加新用户</DialogTitle>
                        <DialogDescription>添加用户并分配角色</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>姓名</Label>
                          <Input 
                            placeholder="输入用户姓名" 
                            value={newUserName}
                            onChange={(e) => setNewUserName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>邮箱</Label>
                          <Input 
                            placeholder="user@example.com" 
                            value={newUserEmail}
                            onChange={(e) => setNewUserEmail(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>角色</Label>
                          <Select value={newUserRoleId} onValueChange={setNewUserRoleId}>
                            <SelectTrigger>
                              <SelectValue placeholder="选择角色" />
                            </SelectTrigger>
                            <SelectContent>
                              {roles.map((role) => (
                                <SelectItem key={role.id} value={role.id}>
                                  {role.name} {role.isDefault && "(默认)"}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddUserDialogOpen(false)} className="focus-visible:ring-2 focus-visible:ring-ring">
                          取消
                        </Button>
                        <Button onClick={handleAddUser} className="focus-visible:ring-2 focus-visible:ring-ring">添加</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Input placeholder="搜索用户..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="max-w-sm" />
              </div>
              <UserList users={filteredUsers} roles={roles} onToggleStatus={handleToggleUserStatus} onDelete={handleDeleteUser} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>角色管理</span>
                  </CardTitle>
                  <CardDescription>管理系统、文档、模型、MCP权限</CardDescription>
                </div>
                <Dialog open={isAddRoleDialogOpen} onOpenChange={setIsAddRoleDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="focus-visible:ring-2 focus-visible:ring-ring">
                      <Plus className="h-4 w-4 mr-2" />
                      添加角色
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>添加新角色</DialogTitle>
                      <DialogDescription>创建新角色并配置权限</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>角色名称</Label>
                        <Input 
                          placeholder="输入角色名称" 
                          value={newRoleName}
                          onChange={(e) => setNewRoleName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>描述</Label>
                        <Textarea 
                          placeholder="描述这个角色的用途"
                          value={newRoleDescription}
                          onChange={(e) => setNewRoleDescription(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddRoleDialogOpen(false)} className="focus-visible:ring-2 focus-visible:ring-ring">
                        取消
                      </Button>
                      <Button onClick={handleAddRole} className="focus-visible:ring-2 focus-visible:ring-ring">添加</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={roleTab} onValueChange={setRoleTab}>
                <TabsList>
                  <TabsTrigger value="system">系统</TabsTrigger>
                  <TabsTrigger value="document">文档</TabsTrigger>
                  <TabsTrigger value="model">模型</TabsTrigger>
                  <TabsTrigger value="mcp">MCP</TabsTrigger>
                </TabsList>

                <TabsContent value="system" className="space-y-4">
                  <div className="space-y-4">
                    {roles.map((role) => (
                      <SystemRoleCard
                        key={role.id}
                        role={role}
                        systemPermissions={systemPermissions}
                        onEdit={handleEditRole}
                        onDelete={handleDeleteRole}
                        onTogglePermission={handleTogglePermission}
                      />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="document" className="space-y-4">
                  <div className="space-y-4">
                    {roles.map((role) => (
                      <DocumentRoleCard
                        key={role.id}
                        role={role}
                        documentPermissions={documentPermissions}
                        onEdit={handleEditRole}
                        onDelete={handleDeleteRole}
                        onTogglePermission={handleTogglePermission}
                      />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="model" className="space-y-4">
                  <div className="space-y-4">
                    {roles.map((role) => (
                      <ModelRoleCard
                        key={role.id}
                        role={role}
                        modelPermissions={modelPermissions}
                        onEdit={handleEditRole}
                        onDelete={handleDeleteRole}
                        onTogglePermission={handleTogglePermission}
                      />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="mcp" className="space-y-4">
                  <div className="space-y-4">
                    {roles.map((role) => (
                      <MCPRoleCard
                        key={role.id}
                        role={role}
                        mcpPermissions={mcpPermissions}
                        onEdit={handleEditRole}
                        onDelete={handleDeleteRole}
                        onTogglePermission={handleTogglePermission}
                      />
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 编辑角色对话框 */}
      {editingRole && (
        <Dialog open={true} onOpenChange={() => setEditingRole(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>编辑角色</DialogTitle>
              <DialogDescription>编辑角色的名称和描述</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>角色名称</Label>
                <Input
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  placeholder="输入角色名称"
                />
              </div>
              <div className="space-y-2">
                <Label>描述</Label>
                <Textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  placeholder="描述这个角色的用途"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingRole(null)} className="focus-visible:ring-2 focus-visible:ring-ring">
                取消
              </Button>
              <Button onClick={handleSaveEditRole} className="focus-visible:ring-2 focus-visible:ring-ring">保存</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};