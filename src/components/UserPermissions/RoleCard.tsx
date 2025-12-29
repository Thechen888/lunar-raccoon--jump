import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";

interface Permission {
  id: string;
  name: string;
  category: string;
  description: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  isSystem: boolean;
  permissions: string[];
}

interface RoleCardProps {
  role: Role;
  allPermissions: Permission[];
  onEdit: (role: Role) => void;
  onDelete: (roleId: string) => void;
  onTogglePermission: (roleId: string, permissionId: string) => void;
}

export const RoleCard = ({ role, allPermissions, onEdit, onDelete, onTogglePermission }: RoleCardProps) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <CardTitle className="text-lg">{role.name}</CardTitle>
              {role.isDefault && <Badge variant="outline" className="text-xs">默认</Badge>}
              {role.isSystem && <Badge variant="secondary" className="text-xs">系统</Badge>}
            </div>
            <CardDescription>{role.description}</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            {!role.isSystem && (
              <>
                <Button variant="outline" size="sm" onClick={() => onEdit(role)}>
                  <Settings className="h-4 w-4 mr-1" />
                  编辑
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(role.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label className="text-sm font-medium">权限</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {allPermissions.map((permission) => {
              const hasPermission = role.permissions.includes(permission.id);
              return (
                <div
                  key={permission.id}
                  className={`p-2 border rounded-lg cursor-pointer transition-colors ${
                    hasPermission ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => !role.isSystem && onTogglePermission(role.id, permission.id)}
                >
                  <div className="flex items-center space-x-2">
                    <div className={`w-4 h-4 rounded-sm border ${hasPermission ? "bg-primary border-primary" : "border-border"}`}>
                      {hasPermission && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{permission.name}</div>
                      <div className="text-xs text-muted-foreground">{permission.description}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};