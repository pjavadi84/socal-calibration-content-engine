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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface ApiConfig {
  openfda: boolean;
  osha: boolean;
  federal_register: boolean;
}

interface SettingsForm {
  wp_site_url: string;
  wp_username: string;
  wp_app_password: string;
  auto_push_on_approve: boolean;
  authoritative_apis_enabled: boolean;
  authoritative_apis_config: ApiConfig;
  author_name: string;
  author_title: string;
  author_bio: string;
  author_image_url: string;
  author_profile_url: string;
}

const DEFAULT_API_CONFIG: ApiConfig = {
  openfda: true,
  osha: true,
  federal_register: true,
};

export default function SettingsPage() {
  const [form, setForm] = useState<SettingsForm>({
    wp_site_url: '',
    wp_username: '',
    wp_app_password: '',
    auto_push_on_approve: false,
    authoritative_apis_enabled: false,
    authoritative_apis_config: DEFAULT_API_CONFIG,
    author_name: '',
    author_title: '',
    author_bio: '',
    author_image_url: '',
    author_profile_url: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
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
          authoritative_apis_enabled: data.authoritative_apis_enabled ?? false,
          authoritative_apis_config: {
            ...DEFAULT_API_CONFIG,
            ...(data.authoritative_apis_config || {}),
          },
          author_name: data.author_name || '',
          author_title: data.author_title || '',
          author_bio: data.author_bio || '',
          author_image_url: data.author_image_url || '',
          author_profile_url: data.author_profile_url || '',
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
        authoritative_apis_enabled: data.authoritative_apis_enabled ?? false,
        authoritative_apis_config: {
          ...DEFAULT_API_CONFIG,
          ...(data.authoritative_apis_config || {}),
        },
        author_name: data.author_name || '',
        author_title: data.author_title || '',
        author_bio: data.author_bio || '',
        author_image_url: data.author_image_url || '',
        author_profile_url: data.author_profile_url || '',
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

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'author');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Upload failed');
      }

      const data = await res.json();
      setForm({ ...form, author_image_url: data.url });
      toast.success('Image uploaded');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploadingImage(false);
    }
  }

  function updateApiConfig(key: keyof ApiConfig, value: boolean) {
    setForm({
      ...form,
      authoritative_apis_config: {
        ...form.authoritative_apis_config,
        [key]: value,
      },
    });
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

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Author / E-E-A-T</CardTitle>
          <CardDescription>
            Configure author information for Google E-E-A-T signals in JSON-LD and article bylines.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="author-name">Author Name</Label>
            <Input
              id="author-name"
              placeholder="SoCal Calibration Team"
              value={form.author_name}
              onChange={(e) => setForm({ ...form, author_name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="author-title">Title / Role</Label>
            <Input
              id="author-title"
              placeholder="Calibration Specialists"
              value={form.author_title}
              onChange={(e) => setForm({ ...form, author_title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="author-bio">Bio</Label>
            <Textarea
              id="author-bio"
              placeholder="Brief bio for structured data..."
              value={form.author_bio}
              onChange={(e) => setForm({ ...form, author_bio: e.target.value })}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Author Image</Label>
            <div className="flex items-center gap-4">
              {form.author_image_url ? (
                <Image
                  src={form.author_image_url}
                  alt="Author"
                  width={64}
                  height={64}
                  className="size-16 rounded-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex size-16 items-center justify-center rounded-full bg-muted text-xs text-muted-foreground">
                  No image
                </div>
              )}
              <div className="flex flex-col gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploadingImage}
                  onClick={() => document.getElementById('author-image-input')?.click()}
                >
                  {uploadingImage ? (
                    <><Loader2 className="mr-1 size-4 animate-spin" />Uploading...</>
                  ) : (
                    <><Upload className="mr-1 size-4" />Upload Image</>
                  )}
                </Button>
                <input
                  id="author-image-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                {form.author_image_url && (
                  <button
                    type="button"
                    className="text-left text-xs text-muted-foreground hover:text-destructive"
                    onClick={() => setForm({ ...form, author_image_url: '' })}
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="author-profile">Author Profile URL</Label>
            <Input
              id="author-profile"
              placeholder="https://socalcalibration.com/about"
              value={form.author_profile_url}
              onChange={(e) => setForm({ ...form, author_profile_url: e.target.value })}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-1 size-4 animate-spin" />}
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Authoritative Data Sources</CardTitle>
          <CardDescription>
            Enrich articles with real-time government regulatory data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auth-apis-enabled">Enable authoritative APIs</Label>
              <p className="text-sm text-muted-foreground">
                Fetch live data from government APIs during article generation
              </p>
            </div>
            <Switch
              id="auth-apis-enabled"
              checked={form.authoritative_apis_enabled}
              onCheckedChange={(checked) =>
                setForm({ ...form, authoritative_apis_enabled: checked })
              }
            />
          </div>

          {form.authoritative_apis_enabled && (
            <>
              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="api-openfda">openFDA</Label>
                    <p className="text-sm text-muted-foreground">
                      FDA device recalls, 483 observations, MAUDE reports
                    </p>
                  </div>
                  <Switch
                    id="api-openfda"
                    checked={form.authoritative_apis_config.openfda}
                    onCheckedChange={(checked) => updateApiConfig('openfda', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="api-osha">OSHA</Label>
                    <p className="text-sm text-muted-foreground">
                      Enforcement inspections and citations
                    </p>
                  </div>
                  <Switch
                    id="api-osha"
                    checked={form.authoritative_apis_config.osha}
                    onCheckedChange={(checked) => updateApiConfig('osha', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="api-federal-register">Federal Register</Label>
                    <p className="text-sm text-muted-foreground">
                      New and proposed regulatory rules
                    </p>
                  </div>
                  <Switch
                    id="api-federal-register"
                    checked={form.authoritative_apis_config.federal_register}
                    onCheckedChange={(checked) => updateApiConfig('federal_register', checked)}
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-1 size-4 animate-spin" />}
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
