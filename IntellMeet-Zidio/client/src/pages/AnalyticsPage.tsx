import { useState, useEffect } from 'react';
import {
  BarChart3,
  Video,
  Clock,
  CheckCircle2,
  Users,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card.js';
import { Badge } from '../components/ui/Badge.js';
import { api } from '../services/api.js';

export function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.analytics.getDashboard()
      .then((res) => setAnalytics(res.analytics))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-muted-foreground animate-pulse">
        Aggregating database analytics...
      </div>
    );
  }

  const weeklyMax = Math.max(...(analytics?.weeklyActivity?.map((w: any) => w.meetings) || [1]), 1);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="pb-2 border-b border-border">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Productivity & Meeting Analytics</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Real-time metrics computed directly from database records without synthetic projections.
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Total Meetings</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">
                {analytics?.meetings?.total || 0}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {analytics?.meetings?.completed || 0} completed
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-primary flex items-center justify-center">
              <Video className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Avg Meeting Length</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">
                {analytics?.meetings?.avgDurationMinutes || 0} min
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Across all completed calls</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Action Resolution</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">
                {analytics?.actionItems?.completionRate || 0}%
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {analytics?.actionItems?.completed || 0} of {analytics?.actionItems?.total || 0} resolved
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Active Team Members</p>
              <h3 className="text-2xl font-bold mt-1 text-foreground">
                {analytics?.totalUsers || 0}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">Registered workspace users</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weekly Activity Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Weekly Meeting Frequency</CardTitle>
            <CardDescription>Distribution of meetings over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-end justify-between gap-2 pt-4 px-2">
              {analytics?.weeklyActivity?.map((item: any) => {
                const heightPercent = Math.max((item.meetings / weeklyMax) * 100, 8);
                return (
                  <div key={item.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full max-w-[36px] bg-primary rounded-t-md transition-all duration-500 flex items-center justify-center text-[10px] text-white font-semibold"
                    >
                      {item.meetings > 0 ? item.meetings : ''}
                    </div>
                    <span className="text-[11px] font-medium text-muted-foreground">{item.day}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Task Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Kanban Task Distribution</CardTitle>
            <CardDescription>Status breakdown across all sprint boards</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs font-medium mb-1.5">
                <span>To Do</span>
                <span className="text-muted-foreground">{analytics?.tasks?.todo || 0} tasks</span>
              </div>
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-400 rounded-full"
                  style={{
                    width: `${analytics?.tasks?.total ? (analytics.tasks.todo / analytics.tasks.total) * 100 : 0}%`
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1.5">
                <span>In Progress</span>
                <span className="text-blue-500 font-semibold">{analytics?.tasks?.inProgress || 0} tasks</span>
              </div>
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{
                    width: `${analytics?.tasks?.total ? (analytics.tasks.inProgress / analytics.tasks.total) * 100 : 0}%`
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1.5">
                <span>Completed</span>
                <span className="text-emerald-500 font-semibold">{analytics?.tasks?.done || 0} tasks</span>
              </div>
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{
                    width: `${analytics?.tasks?.total ? (analytics.tasks.done / analytics.tasks.total) * 100 : 0}%`
                  }}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
              <span>Total Board Workload:</span>
              <strong className="text-foreground">{analytics?.tasks?.total || 0} items</strong>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
