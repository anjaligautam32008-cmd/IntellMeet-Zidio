import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Video,
  Clock,
  Calendar,
  CheckCircle2,
  ListTodo,
  ArrowRight,
  Sparkles,
  FileText,
  AlertCircle,
  Play
} from 'lucide-react';
import { Button } from '../components/ui/Button.js';
import { Badge } from '../components/ui/Badge.js';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card.js';
import { api } from '../services/api.js';
import { formatDate, formatTime, formatDuration } from '../lib/utils.js';

export function DashboardPage() {
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState<any>(null);
  const [upcomingMeetings, setUpcomingMeetings] = useState<any[]>([]);
  const [recentMeetings, setRecentMeetings] = useState<any[]>([]);
  const [actionItems, setActionItems] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [analyticsRes, meetingsRes, actionsRes, tasksRes] = await Promise.all([
          api.analytics.getDashboard().catch(() => ({ analytics: null })),
          api.meetings.list().catch(() => ({ meetings: [] })),
          api.actionItems.list({ status: 'pending' }).catch(() => ({ actionItems: [] })),
          api.tasks.list().catch(() => ({ tasks: [] }))
        ]);

        setAnalytics(analyticsRes?.analytics || null);

        const allMeetings = meetingsRes?.meetings || [];
        setUpcomingMeetings(allMeetings.filter((m: any) => m.status === 'scheduled' || m.status === 'active').slice(0, 4));
        setRecentMeetings(allMeetings.filter((m: any) => m.status === 'completed').slice(0, 4));
        setActionItems(actionsRes?.actionItems?.slice(0, 5) || []);
        setTasks(tasksRes?.tasks?.slice(0, 5) || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Collaboration Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Monitor ongoing meetings, AI post-session insights, and pending deliverables.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <Link to="/meetings">
            <Button variant="outline" size="sm">
              All Meetings
            </Button>
          </Link>
          <Button
            size="sm"
            onClick={() => {
              // Quick create instant meeting
              api.meetings.create({ title: `Quick Sync – ${new Date().toLocaleDateString()}` })
                .then((res) => navigate(`/lobby/${res.meeting.meetingCode}`))
                .catch(console.error);
            }}
          >
            <Video className="h-4 w-4 mr-1.5" /> Start Instant Meeting
          </Button>
        </div>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Meetings</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">
                {isLoading ? '...' : analytics?.meetings?.total || 0}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {analytics?.meetings?.completed || 0} completed &bull; {analytics?.meetings?.scheduled || 0} scheduled
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-primary flex items-center justify-center">
              <Video className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Metric 2 */}
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Avg Duration</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">
                {isLoading ? '...' : `${analytics?.meetings?.avgDurationMinutes || 0} min`}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Based on recorded meeting logs</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Metric 3 */}
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pending Action Items</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">
                {isLoading ? '...' : analytics?.actionItems?.pending || 0}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {analytics?.actionItems?.completionRate || 0}% completion rate
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Metric 4 */}
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Tasks</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">
                {isLoading ? '...' : (analytics?.tasks?.todo || 0) + (analytics?.tasks?.inProgress || 0)}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {analytics?.tasks?.done || 0} completed on Kanban board
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <ListTodo className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Upcoming Meetings & Pending Action Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Meetings */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming / Active Meetings */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>Upcoming & Live Meetings</CardTitle>
                <CardDescription>Scheduled team discussions and active WebRTC rooms.</CardDescription>
              </div>
              <Link to="/meetings" className="text-xs text-primary hover:underline font-medium">
                View all
              </Link>
            </CardHeader>
            <CardContent>
              {upcomingMeetings.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No upcoming meetings scheduled. Click "Start Instant Meeting" to create one.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {upcomingMeetings.map((meeting) => (
                    <div key={meeting._id} className="py-3.5 flex items-center justify-between first:pt-0 last:pb-0">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-sm text-foreground">{meeting.title}</span>
                          {meeting.status === 'active' ? (
                            <Badge variant="success" className="animate-pulse">Live Now</Badge>
                          ) : (
                            <Badge variant="secondary">Scheduled</Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                          <span className="flex items-center">
                            <Calendar className="h-3.5 w-3.5 mr-1" />
                            {formatDate(meeting.scheduledAt)} at {formatTime(meeting.scheduledAt)}
                          </span>
                          <span className="font-mono bg-secondary px-1.5 py-0.5 rounded text-[11px]">
                            {meeting.meetingCode}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Link to={`/lobby/${meeting.meetingCode}`}>
                          <Button size="sm" variant={meeting.status === 'active' ? 'default' : 'outline'}>
                            <Play className="h-3.5 w-3.5 mr-1" />
                            {meeting.status === 'active' ? 'Join Call' : 'Enter Lobby'}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Meetings with AI Summaries */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>Recent Meetings & AI Insights</CardTitle>
                <CardDescription>Review executive summaries and extracted decisions.</CardDescription>
              </div>
              <Link to="/meetings" className="text-xs text-primary hover:underline font-medium">
                View history
              </Link>
            </CardHeader>
            <CardContent>
              {recentMeetings.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No completed meetings recorded yet.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {recentMeetings.map((meeting) => (
                    <div key={meeting._id} className="py-3.5 flex items-center justify-between first:pt-0 last:pb-0">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-sm text-foreground">{meeting.title}</span>
                          <Badge variant="success">Completed</Badge>
                        </div>
                        <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                          <span>{formatDate(meeting.scheduledAt)}</span>
                          <span>&bull;</span>
                          <span>Duration: {formatDuration(meeting.duration)}</span>
                        </div>
                      </div>

                      <Link to={`/meeting/${meeting._id}/summary`}>
                        <Button variant="outline" size="sm" className="space-x-1">
                          <Sparkles className="h-3.5 w-3.5 text-primary" />
                          <span>View Summary</span>
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Pending Action Items & Quick Tasks */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>Pending Action Items</CardTitle>
                <CardDescription>Extracted by AI from meeting discussions.</CardDescription>
              </div>
              <Link to="/action-items" className="text-xs text-primary hover:underline font-medium">
                All
              </Link>
            </CardHeader>
            <CardContent>
              {actionItems.length === 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  No pending action items. Completed meetings will generate items automatically.
                </div>
              ) : (
                <div className="space-y-3">
                  {actionItems.map((item) => (
                    <div
                      key={item._id}
                      className="p-3 rounded-lg border border-border bg-card/60 space-y-1.5"
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-xs font-semibold text-foreground leading-snug line-clamp-2">
                          {item.task}
                        </span>
                        <Badge
                          variant={
                            item.priority === 'urgent'
                              ? 'destructive'
                              : item.priority === 'high'
                              ? 'warning'
                              : 'secondary'
                          }
                          className="ml-2 capitalize shrink-0 text-[10px]"
                        >
                          {item.priority}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/50">
                        <span>{item.assignee?.name || item.assigneeName || 'Unassigned'}</span>
                        {item.dueDate && <span>Due: {formatDate(item.dueDate)}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Kanban Preview */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>Kanban Overview</CardTitle>
                <CardDescription>Current sprint tasks</CardDescription>
              </div>
              <Link to="/tasks" className="text-xs text-primary hover:underline font-medium">
                Open Board
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {tasks.slice(0, 4).map((task) => (
                  <div key={task._id} className="p-2.5 rounded-md bg-secondary/50 flex items-center justify-between text-xs">
                    <span className="truncate max-w-[180px] font-medium">{task.title}</span>
                    <Badge variant={task.status === 'done' ? 'success' : task.status === 'in_progress' ? 'warning' : 'outline'} className="capitalize text-[10px]">
                      {task.status.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
