import { useState, useEffect } from 'react';
import { Users, Plus, Shield, Mail, Calendar, UserPlus } from 'lucide-react';
import { Button } from '../components/ui/Button.js';
import { Badge } from '../components/ui/Badge.js';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card.js';
import { Modal } from '../components/ui/Modal.js';
import { Input, Label, Textarea } from '../components/ui/Input.js';
import { api } from '../services/api.js';
import { formatDate } from '../lib/utils.js';

export function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<any>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [memberRole, setMemberRole] = useState<'admin' | 'member'>('member');

  const loadData = async () => {
    try {
      setLoading(true);
      const [wsRes, usersRes] = await Promise.all([
        api.workspaces.list(),
        api.users.getAll().catch(() => ({ users: [] }))
      ]);
      setWorkspaces(wsRes.workspaces || []);
      setAllUsers(usersRes.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await api.workspaces.create({
        name: name.trim(),
        description: description.trim()
      });
      setIsCreateModalOpen(false);
      setName('');
      setDescription('');
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId || !selectedWorkspace) return;

    try {
      await api.workspaces.addMember(selectedWorkspace._id, {
        userId: selectedUserId,
        role: memberRole
      });
      setIsInviteModalOpen(false);
      setSelectedUserId('');
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Team Workspaces</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage organization workspaces, project memberships, and team permissions.
          </p>
        </div>

        <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-1.5" /> New Workspace
        </Button>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-muted-foreground animate-pulse">
          Loading workspace data...
        </div>
      ) : workspaces.length === 0 ? (
        <Card className="text-center py-12">
          <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <h3 className="text-base font-semibold">No Workspaces Found</h3>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            Create an enterprise workspace to group projects and collaborate with colleagues.
          </p>
          <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
            Create Workspace
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {workspaces.map((ws) => (
            <Card key={ws._id}>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
                <div>
                  <CardTitle>{ws.name}</CardTitle>
                  {ws.description && (
                    <CardDescription className="mt-1">{ws.description}</CardDescription>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedWorkspace(ws);
                    setIsInviteModalOpen(true);
                  }}
                  className="space-x-1"
                >
                  <UserPlus className="h-3.5 w-3.5 mr-1" />
                  <span>Add Member</span>
                </Button>
              </CardHeader>

              <CardContent>
                <div className="pt-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    Team Members ({ws.members?.length || 0})
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {ws.members?.map((m: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg border border-border bg-card/60 flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2.5 truncate">
                          {m.user?.avatar ? (
                            <img
                              src={m.user.avatar}
                              alt={m.user.name}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary font-semibold text-xs flex items-center justify-center">
                              {m.user?.name?.charAt(0) || 'U'}
                            </div>
                          )}
                          <div className="truncate">
                            <p className="text-xs font-semibold text-foreground truncate">
                              {m.user?.name || 'Member'}
                            </p>
                            <p className="text-[10px] text-muted-foreground truncate">
                              {m.user?.department || m.user?.email || 'Engineering'}
                            </p>
                          </div>
                        </div>

                        <Badge
                          variant={m.role === 'admin' ? 'default' : 'secondary'}
                          className="capitalize text-[10px]"
                        >
                          {m.role}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Workspace Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Team Workspace"
        description="Establish an isolated collaboration space for a pod or department."
      >
        <form onSubmit={handleCreateWorkspace} className="space-y-4">
          <div>
            <Label htmlFor="wsName">Workspace Name</Label>
            <Input
              id="wsName"
              placeholder="e.g. Infrastructure & Reliability"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="wsDesc">Description</Label>
            <Textarea
              id="wsDesc"
              placeholder="Primary charter, focus areas, and pod responsibilities..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Workspace</Button>
          </div>
        </form>
      </Modal>

      {/* Add Member Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title={`Add Member to ${selectedWorkspace?.name}`}
        description="Select a registered enterprise user to grant workspace access."
      >
        <form onSubmit={handleAddMember} className="space-y-4">
          <div>
            <Label htmlFor="selUser">Select User</Label>
            <select
              id="selUser"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              required
              className="w-full mt-1 h-9 rounded-md border border-input bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Choose team colleague...</option>
              {allUsers.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} — {u.email} ({u.department})
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="selRole">Workspace Role</Label>
            <select
              id="selRole"
              value={memberRole}
              onChange={(e) => setMemberRole(e.target.value as any)}
              className="w-full mt-1 h-9 rounded-md border border-input bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Member</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
