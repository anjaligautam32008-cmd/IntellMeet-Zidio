import { useState, useEffect } from 'react';
import {
  Plus,
  MoreVertical,
  CheckCircle2,
  Clock,
  Calendar,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Trash2
} from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { Button } from '../components/ui/Button.js';
import { Badge } from '../components/ui/Badge.js';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card.js';
import { Modal } from '../components/ui/Modal.js';
import { Input, Label, Textarea } from '../components/ui/Input.js';
import { api } from '../services/api.js';
import { formatDate } from '../lib/utils.js';
import { useAuthStore } from '../store/authStore.js';

const COLUMNS = [
  { id: 'todo', label: 'To Do', color: 'border-slate-300 dark:border-slate-700' },
  { id: 'in_progress', label: 'In Progress', color: 'border-blue-500' },
  { id: 'done', label: 'Done', color: 'border-emerald-500' }
];

export function KanbanPage() {
  const { user } = useAuthStore();
  const [tasks, setTasks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New task form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [status, setStatus] = useState<'todo' | 'in_progress' | 'done'>('todo');
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState('');

  // Socket for real-time task sync
  useEffect(() => {
    const socket: Socket = io('/', { transports: ['websocket', 'polling'] });
    socket.emit('join-workspace', 'default');

    socket.on('task-updated', (updatedTask: any) => {
      setTasks((prev) => {
        const index = prev.findIndex((t) => t._id === updatedTask._id);
        if (index >= 0) {
          const next = [...prev];
          next[index] = updatedTask;
          return next;
        }
        return [updatedTask, ...prev];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const [tasksRes, usersRes] = await Promise.all([
        api.tasks.list(),
        api.users.getAll().catch(() => ({ users: [] }))
      ]);
      setTasks(tasksRes.tasks || []);
      setUsers(usersRes.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      // Find workspace or pass default
      const wsRes = await api.workspaces.list();
      const workspaceId = wsRes.workspaces[0]?._id;

      await api.tasks.create({
        title: title.trim(),
        description: description.trim(),
        workspaceId,
        assignee: assignee || null,
        priority,
        status,
        dueDate: dueDate ? new Date(dueDate) : null
      });

      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      setPriority('medium');
      setAssignee('');
      setDueDate('');
      loadTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMoveTask = async (taskId: string, newStatus: 'todo' | 'in_progress' | 'done') => {
    try {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
      );
      await api.tasks.update(taskId, { status: newStatus });
    } catch (err) {
      console.error(err);
      loadTasks();
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      await api.tasks.delete(taskId);
    } catch (err) {
      console.error(err);
      loadTasks();
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Task Kanban Board</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Coordinate meeting follow-ups, sprint deliverables, and architectural tasks in real time.
          </p>
        </div>

        <Button size="sm" onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-1.5" /> Add Task
        </Button>
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {COLUMNS.map((column) => {
          const colTasks = tasks.filter((t) => t.status === column.id);

          return (
            <div
              key={column.id}
              className="flex flex-col rounded-xl border border-border bg-card/60 p-4 shadow-xs"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-border">
                <div className="flex items-center space-x-2">
                  <span className={`h-2.5 w-2.5 rounded-full border-2 ${column.color}`}></span>
                  <h3 className="text-sm font-semibold text-foreground">{column.label}</h3>
                  <span className="bg-secondary text-secondary-foreground text-xs px-2 py-0.5 rounded-full font-medium">
                    {colTasks.length}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setStatus(column.id as any);
                    setIsModalOpen(true);
                  }}
                  className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Task Cards Stack */}
              <div className="flex-1 space-y-3 min-h-[300px]">
                {loading ? (
                  <div className="py-8 text-center text-xs text-muted-foreground animate-pulse">
                    Loading tasks...
                  </div>
                ) : colTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 border border-dashed border-border rounded-lg text-xs text-muted-foreground text-center p-4">
                    <span>No tasks in {column.label}</span>
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <div
                      key={task._id}
                      className="rounded-lg border border-border bg-card p-3.5 shadow-xs hover:border-primary/50 transition-colors space-y-2.5 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold text-foreground leading-snug">
                          {task.title}
                        </span>
                        <Badge
                          variant={
                            task.priority === 'urgent'
                              ? 'destructive'
                              : task.priority === 'high'
                              ? 'warning'
                              : 'secondary'
                          }
                          className="capitalize text-[10px] shrink-0"
                        >
                          {task.priority}
                        </Badge>
                      </div>

                      {task.description && (
                        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                          {task.description}
                        </p>
                      )}

                      {/* Footer & Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-border/60 text-[11px] text-muted-foreground">
                        <div className="flex items-center space-x-1.5 truncate">
                          {task.assignee?.avatar ? (
                            <img
                              src={task.assignee.avatar}
                              alt={task.assignee.name}
                              className="h-4 w-4 rounded-full object-cover"
                            />
                          ) : (
                            <span className="font-semibold">{task.assignee?.name || 'Unassigned'}</span>
                          )}
                        </div>

                        {/* Move status buttons */}
                        <div className="flex items-center space-x-1">
                          {column.id !== 'todo' && (
                            <button
                              onClick={() =>
                                handleMoveTask(
                                  task._id,
                                  column.id === 'done' ? 'in_progress' : 'todo'
                                )
                              }
                              title="Move left"
                              className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer"
                            >
                              <ArrowLeft className="h-3 w-3" />
                            </button>
                          )}

                          {column.id !== 'done' && (
                            <button
                              onClick={() =>
                                handleMoveTask(
                                  task._id,
                                  column.id === 'todo' ? 'in_progress' : 'done'
                                )
                              }
                              title="Move right"
                              className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer"
                            >
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteTask(task._id)}
                            title="Delete task"
                            className="rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Task Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Kanban Task"
        description="Add a task deliverable to the team sprint board."
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <Label htmlFor="taskTitle">Task Title</Label>
            <Input
              id="taskTitle"
              placeholder="e.g. Audit WebRTC ICE candidate gathering on low-bandwidth networks"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="taskDesc">Description</Label>
            <Textarea
              id="taskDesc"
              placeholder="Context, requirements, technical acceptance criteria..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="taskPriority">Priority</Label>
              <select
                id="taskPriority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full mt-1 h-9 rounded-md border border-input bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <Label htmlFor="taskStatus">Column Status</Label>
              <select
                id="taskStatus"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full mt-1 h-9 rounded-md border border-input bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="taskAssignee">Assignee</Label>
              <select
                id="taskAssignee"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                className="w-full mt-1 h-9 rounded-md border border-input bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="taskDue">Due Date</Label>
              <Input
                id="taskDue"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1 text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Task</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
