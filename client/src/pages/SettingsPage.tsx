import { useState } from 'react';
import { User, Shield, Cpu, Activity, Save } from 'lucide-react';
import { Button } from '../components/ui/Button.js';
import { Input, Label } from '../components/ui/Input.js';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card.js';
import { Badge } from '../components/ui/Badge.js';
import { useAuthStore } from '../store/authStore.js';
import { api } from '../services/api.js';

export function SettingsPage() {
  const { user } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await api.users.updateProfile({ name, department, avatar });
      localStorage.setItem('intellmeet_user', JSON.stringify(res.user));
      setMessage('Profile updated successfully.');
    } catch (err: any) {
      setMessage(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="pb-2 border-b border-border">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Account & System Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your personal profile and inspect enterprise runtime configurations.
        </p>
      </div>

      {message && (
        <div className="p-3 text-xs rounded-md bg-primary/10 border border-primary/20 text-primary font-medium">
          {message}
        </div>
      )}

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
          <CardDescription>Your public identity across meetings and Kanban task assignments.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="profName">Full Name</Label>
                <Input
                  id="profName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="profDept">Department</Label>
                <Input
                  id="profDept"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="profAvatar">Avatar Image URL (Optional)</Label>
              <Input
                id="profAvatar"
                placeholder="https://..."
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" isLoading={saving} className="space-x-1.5">
                <Save className="h-4 w-4" />
                <span>Save Profile</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* System Infrastructure Details */}
      <Card>
        <CardHeader>
          <CardTitle>Enterprise Infrastructure & Services</CardTitle>
          <CardDescription>Live health and configuration verification.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 rounded-lg border border-border bg-secondary/30 flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <p className="font-semibold text-foreground">Database Layer</p>
              <p className="text-muted-foreground">MongoDB & Mongoose (Indexed collections)</p>
            </div>
            <Badge variant="success">Online</Badge>
          </div>

          <div className="p-3 rounded-lg border border-border bg-secondary/30 flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <p className="font-semibold text-foreground">WebRTC Signaling Engine</p>
              <p className="text-muted-foreground">Socket.io mesh relay with STUN/TURN ICE support</p>
            </div>
            <Badge variant="success">Active</Badge>
          </div>

          <div className="p-3 rounded-lg border border-border bg-secondary/30 flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <p className="font-semibold text-foreground">AI Intelligence Service</p>
              <p className="text-muted-foreground">OpenAI Whisper + GPT (Demo fallback active)</p>
            </div>
            <Badge variant="default">Ready</Badge>
          </div>

          <div className="p-3 rounded-lg border border-border bg-secondary/30 flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <p className="font-semibold text-foreground">Prometheus Observability</p>
              <p className="text-muted-foreground">Metrics scraping available at /metrics</p>
            </div>
            <a
              href="http://localhost:5000/metrics"
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline font-medium"
            >
              View Metrics
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
