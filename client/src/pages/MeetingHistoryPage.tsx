import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Video,
  Search,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  Plus
} from 'lucide-react';
import { Button } from '../components/ui/Button.js';
import { Input } from '../components/ui/Input.js';
import { Badge } from '../components/ui/Badge.js';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card.js';
import { api } from '../services/api.js';
import { formatDate, formatTime, formatDuration } from '../lib/utils.js';

export function MeetingHistoryPage() {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const res = await api.meetings.list({
        search: search || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter
      });
      setMeetings(res.meetings || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMeetings();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Meeting Repository</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Search, filter, and review real-time recordings, transcripts, and AI summaries.
          </p>
        </div>

        <Link to="/dashboard">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1.5" /> Start / Schedule Meeting
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs"
          />
        </form>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['all', 'completed', 'scheduled', 'active'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors cursor-pointer shrink-0 ${
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

      {/* Meetings List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 text-center text-xs text-muted-foreground animate-pulse">
              Loading meeting history...
            </div>
          ) : meetings.length === 0 ? (
            <div className="py-16 text-center text-xs text-muted-foreground">
              No meetings found matching your filter criteria.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {meetings.map((m) => (
                <div key={m._id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/40 transition-colors">
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2.5">
                      <span className="font-semibold text-sm text-foreground">{m.title}</span>
                      <Badge
                        variant={
                          m.status === 'completed'
                            ? 'success'
                            : m.status === 'active'
                            ? 'warning'
                            : 'secondary'
                        }
                        className="capitalize text-[10px]"
                      >
                        {m.status}
                      </Badge>
                      {m.hasSummary && (
                        <span className="flex items-center text-[10px] text-primary font-semibold">
                          <Sparkles className="h-3 w-3 mr-0.5" /> AI Summary
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        {formatDate(m.scheduledAt)} at {formatTime(m.scheduledAt)}
                      </span>
                      {m.duration > 0 && (
                        <span className="flex items-center">
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          {formatDuration(m.duration)}
                        </span>
                      )}
                      <span>Host: <strong className="text-foreground">{m.host?.name || 'Enterprise User'}</strong></span>
                      <span className="font-mono bg-secondary px-1.5 py-0.5 rounded text-[10px]">
                        {m.meetingCode}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    {m.status === 'completed' ? (
                      <Link to={`/meeting/${m._id}/summary`}>
                        <Button variant="outline" size="sm" className="space-x-1">
                          <Sparkles className="h-3.5 w-3.5 text-primary" />
                          <span>View Summary</span>
                        </Button>
                      </Link>
                    ) : (
                      <Link to={`/lobby/${m.meetingCode}`}>
                        <Button size="sm">
                          <Video className="h-3.5 w-3.5 mr-1.5" />
                          <span>{m.status === 'active' ? 'Join Call' : 'Enter Lobby'}</span>
                        </Button>
                      </Link>
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
