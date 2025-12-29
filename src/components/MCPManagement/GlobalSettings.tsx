import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface GlobalSettingsProps {
  autoReconnect: boolean;
  loadBalancing: boolean;
  logging: boolean;
  onAutoReconnectChange: (value: boolean) => void;
  onLoadBalancingChange: (value: boolean) => void;
  onLoggingChange: (value: boolean) => void;
}

export const GlobalSettings = ({
  autoReconnect,
  loadBalancing,
  logging,
  onAutoReconnectChange,
  onLoadBalancingChange,
  onLoggingChange
}: GlobalSettingsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>全局设置</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>自动重连</Label>
              <p className="text-sm text-muted-foreground">服务器断线时自动重新连接</p>
            </div>
            <Switch checked={autoReconnect} onCheckedChange={onAutoReconnectChange} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>负载均衡</Label>
              <p className="text-sm text-muted-foreground">在多个服务器间自动分配负载</p>
            </div>
            <Switch checked={loadBalancing} onCheckedChange={onLoadBalancingChange} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>日志记录</Label>
              <p className="text-sm text-muted-foreground">记录所有服务器请求和响应</p>
            </div>
            <Switch checked={logging} onCheckedChange={onLoggingChange} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};