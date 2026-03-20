import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>WordPress Connection</CardTitle>
          <CardDescription>
            Configure WordPress credentials for publishing articles. Coming in Phase 3.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="wp-url">Site URL</Label>
            <Input id="wp-url" placeholder="https://socalcalibration.com" disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wp-user">Username</Label>
            <Input id="wp-user" placeholder="admin" disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wp-password">Application Password</Label>
            <Input id="wp-password" type="password" placeholder="xxxx xxxx xxxx xxxx" disabled />
          </div>
          <Button disabled>Save (Phase 3)</Button>
        </CardContent>
      </Card>
    </div>
  );
}
