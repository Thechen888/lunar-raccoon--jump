import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings, Trash2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface DocumentPermission {
  id: string;
  name: string;
  description: string;
}

interface DocumentRole {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  isSystem: boolean;
  permissions: string[];
}

interface DocumentRoleCardProps {
  role: DocumentRole;
  documentPermissions: DocumentPermission[];
  onEdit: (role: DocumentRole) => void;
  onDelete: (roleId: string) => void;
  onTogglePermission: (roleId: string, permissionId: string) => void;
}

export const DocumentRoleCard = ({ role, documentPermissions, onEdit, onDelete, onTogglePermission }: DocumentRoleCardProps) => {
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
          <Label className="text-sm font-medium">文档权限</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {documentPermissions.map((permission) => {
              const hasPermission = role.permissions.includes(permission.id);
              return (
                <div
                  key={permission.id}
                  className={`p-2 border rounded-lg transition-colors ${
                    hasPermission ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id={`doc-perm-${role.id}-${permission.id}`}
                      checked={hasPermission}
                      onCheckedChange={() => onTogglePermission(role.id, permission.id)}
                      disabled={role.isSystem}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor={`doc-perm-${role.id}-${permission.id}`}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {permission.name}
                      </Label>
                      <p className="text-xs text-muted-foreground">{permission.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {role.isSystem && (
            <p className="text-xs text-muted-foreground mt-2">系统角色的权限不可修改</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};