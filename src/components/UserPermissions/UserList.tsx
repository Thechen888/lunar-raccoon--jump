import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface User {
  id: string;
  name: string;
  email: string;
  roleId: string;
  lastLogin: string;
  status: "active" | "inactive";
}

interface Role {
  id: string;
  name: string;
  isDefault: boolean;
  isSystem: boolean;
}

interface UserListProps {
  users: User[];
  roles: Role[];
  onToggleStatus: (userId: string) => void;
  onDelete: (userId: string) => void;
}

export const UserList = ({ users, roles, onToggleStatus, onDelete }: UserListProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>用户</TableHead>
          <TableHead>角色</TableHead>
          <TableHead>最后登录</TableHead>
          <TableHead>状态</TableHead>
          <TableHead>操作</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => {
          const role = roles.find((r) => r.id === user.roleId);
          return (
            <TableRow key={user.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={role?.isSystem ? "default" : "secondary"}>{role?.name}</Badge>
                {role?.isDefault && <Badge variant="outline" className="text-xs ml-1">默认</Badge>}
              </TableCell>
              <TableCell>{user.lastLogin}</TableCell>
              <TableCell>
                <Switch checked={user.status === "active"} onCheckedChange={() => onToggleStatus(user.id)} />
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" onClick={() => onDelete(user.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};