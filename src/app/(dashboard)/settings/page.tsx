'use client';

import { useEffect, useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface SettingsForm {
  wp_site_url: string;
  wp_username: string;
  wp_app_password: string;
  auto_push_on_approve: boolean;
}

export default function SettingsPage() {
  const [form, setForm] = useState<SettingsForm>({
    wp_site_url: '',
    wp_username: '',
    wp_app_password: '',
    auto_push_on_approve: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connected' | 'failed'>('idle');
  const [connectionDetail, setConnectionDetail] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/settings');
        if (!res.ok) throw new Error('Failed to load');
        const data = await res.json();
        setForm({
          wp_site_url: data.wp_site_url || '',
          wp_username: data.wp_username || '',
          wp_app_password: data.wp_app_password || '',
          auto_push_on_approve: data.auto_push_on_approve ?? false,
        });
      } catch {
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Save failed');
      const data = await res.json();
      setForm({
        wp_site_url: data.wp_site_url || '',
        wp_username: data.wp_username || '',
        wp_app_password: data.wp_app_password || '',
        auto_push_on_approve: data.auto_push_on_approve ?? false,
      });
      toast.success('Settings saved');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  async function handleTestConnection() {
    setTesting(true);
    setConnectionStatus('idle');
    try {
      const res = await fetch('/api/settings/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wp_site_url: form.wp_site_url,
          wp_username: form.wp_username,
          wp_app_password: form.wp_app_password,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setConnectionStatus('connected');
        setConnectionDetail(data.siteName || '');
        toast.success(`Connected to ${data.siteName}`);
      } else {
        setConnectionStatus('failed');
        setConnectionDetail(data.error || 'Unknown error');
        toast.error(`Connection failed: ${data.error}`);
      }
    } catch {
      setConnectionStatus('failed');
      setConnectionDetail('Network error');
      toast.error('Connection test failed');
    } finally {
      setTesting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <Card className="max-w-xl">
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <Card className="max-w-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>WordPress Connection</CardTitle>
              <CardDescription>
                Configure WordPress credentials for publishing articles.
              </CardDescription>
            </div>
            {connectionStatus === 'connected' && (
              <Badge className="bg-green-100 text-green-800" variant="secondary">
                Connected
              </Badge>
            )}
            {connectionStatus === 'failed' && (
              <Badge className="bg-red-100 text-red-800" variant="secondary">
                Failed
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="wp-url">Site URL</Label>
            <Input
              id="wp-url"
              placeholder="https://socalcalibration.com"
              value={form.wp_site_url}
              onChange={(e) => setForm({ ...form, wp_site_url: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wp-user">Username</Label>
            <Input
              id="wp-user"
              placeholder="admin"
              value={form.wp_username}
              onChange={(e) => setForm({ ...form, wp_username: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wp-password">Application Password</Label>
            <Input
              id="wp-password"
              type="password"
              placeholder="xxxx xxxx xxxx xxxx"
              value={form.wp_app_password}
              onChange={(e) => setForm({ ...form, wp_app_password: e.target.value })}
            />
          </div>

          {connectionStatus === 'failed' && connectionDetail && (
            <p className="text-sm text-destructive">{connectionDetail}</p>
          )}

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-1 size-4 animate-spin" />}
              {saving ? 'Saving...' : 'Save'}
            </Button>
            <Button variant="outline" onClick={handleTestConnection} disabled={testing}>
              {testing && <Loader2 className="mr-1 size-4 animate-spin" />}
              {testing ? 'Testing...' : 'Test Connection'}
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-push">Auto-push on approval</Label>
              <p className="text-sm text-muted-foreground">
                Automatically push articles to WordPress when approved
              </p>
            </div>
            <Switch
              id="auto-push"
              checked={form.auto_push_on_approve}
              onCheckedChange={(checked) =>
                setForm({ ...form, auto_push_on_approve: checked })
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
