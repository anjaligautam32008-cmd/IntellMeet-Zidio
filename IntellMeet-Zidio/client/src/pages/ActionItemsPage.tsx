import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ListTodo, Calendar, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button.js';
import { Badge } from '../components/ui/Badge.js';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card.js';
import { api } from '../services/api.js';
import { formatDate } from '../lib/utils.js';

export function ActionItemsPage() {
  const [actionItems, setActionItems] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.actionItems.list({
        status: statusFilter === 'all' ? undefined : statusFilter
      });
      setActionItems(res.actionItems || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleToggleStatus = async (item: any) => {
    const nextStatus = item.status === 'completed' ? 'pending' : 'completed';
    try {
      await api.actionItems.update(item._id, { status: nextStatus });
      setActionItems((prev) =>
        prev.map((a) => (a._id === item._id ? { ...a, status: nextStatus } : a))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleConvertToTask = async (actionItemId: string) => {
    try {
      await api.actionItems.convertToTask(actionItemId);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Action Items Registry</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Decisions, tasks, and follow-ups extracted directly from meeting audio transcripts.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {['all', 'pending', 'completed'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors cursor-pointer ${
                statusFilter === s
                  ? 'bg-primary text-primary-foreground font-semibold'
                  : 'bg-secondary text-secondary-foreground hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 text-center text-xs text-muted-foreground animate-pulse">
              Loading action items...
            </div>
          ) : actionItems.length === 0 ? (
            <div className="py-16 text-center text-xs text-muted-foreground">
              No action items found in this category.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {actionItems.map((item) => (
                <div
                  key={item._id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start space-x-3 flex-1">
                    <button
                      onClick={() => handleToggleStatus(item)}
                      className={`h-5 w-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 cursor-pointer transition-colors ${
                        item.status === 'completed'
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-300 dark:border-slate-600 hover:border-primary'
                      }`}
                    >
                      {item.status === 'completed' && <CheckCircle2 className="h-4 w-4" />}
                    </button>

                    <div className="space-y-1">
                      <p
                        className={`text-sm font-semibold ${
                          item.status === 'completed'
                            ? 'line-through text-muted-foreground'
                            : 'text-foreground'
                        }`}
                      >
                        {item.task}
                      </p>
                      {item.description && (
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground pt-0.5">
                        <span>
                          Source: <strong className="text-foreground">{item.meetingId?.title || 'Team Meeting'}</strong>
                        </span>
                        <span>
                          Assignee: <strong className="text-foreground">{item.assignee?.name || item.assigneeName || 'Unassigned'}</strong>
                        </span>
                        {item.dueDate && <span>Due: <strong>{formatDate(item.dueDate)}</strong></span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                    <Badge
                      variant={
                        item.priority === 'urgent'
                          ? 'destructive'
                          : item.priority === 'high'
                          ? 'warning'
                          : 'secondary'
                      }
                      className="capitalize"
                    >
                      {item.priority}
                    </Badge>

                    {item.convertedToTaskId ? (
                      <Badge variant="outline" className="text-xs">
                        In Kanban
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleConvertToTask(item._id)}
                        className="text-xs"
                      >
                        <ListTodo className="h-3.5 w-3.5 mr-1" />
                        <span>Send to Kanban</span>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
