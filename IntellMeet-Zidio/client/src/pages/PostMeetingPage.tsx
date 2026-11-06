import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Sparkles,
  FileText,
  CheckCircle2,
  ListTodo,
  Calendar,
  Clock,
  Users,
  Download,
  ArrowRight,
  RefreshCw,
  Plus,
  Video
} from 'lucide-react';
import { Button } from '../components/ui/Button.js';
import { Badge } from '../components/ui/Badge.js';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card.js';
import { api } from '../services/api.js';
import { formatDate, formatDuration } from '../lib/utils.js';

export function PostMeetingPage() {
  const { id } = useParams<{ id: string }>();

  const [activeTab, setActiveTab] = useState<'summary' | 'actions' | 'transcript' | 'recording'>('summary');
  const [meeting, setMeeting] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [transcript, setTranscript] = useState<any>(null);
  const [actionItems, setActionItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessingAi, setIsProcessingAi] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);

  const loadData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const meetingRes = await api.meetings.getById(id);
      setMeeting(meetingRes.meeting);

      const [sumRes, transRes, actsRes] = await Promise.all([
        api.ai.getSummary(id).catch(() => null),
        api.ai.getTranscript(id).catch(() => null),
        api.actionItems.list({ meetingId: id }).catch(() => ({ actionItems: [] }))
      ]);

      setSummary(sumRes?.summary || null);
      setTranscript(transRes?.transcript || null);
      setActionItems(actsRes?.actionItems || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleGenerateAi = async () => {
    if (!id) return;
    setIsProcessingAi(true);
    setAiMessage(null);
    try {
      // Run AI pipeline
      await api.ai.transcribe(id);
      await api.ai.summarize(id);
      await api.ai.extractActionItems(id);
      setAiMessage('AI Summary and Action Items generated successfully.');
      await loadData();
    } catch (err: any) {
      setAiMessage(err.message || 'AI processing encountered an error.');
    } finally {
      setIsProcessingAi(false);
    }
  };

  const handleConvertToTask = async (actionItemId: string) => {
    try {
      await api.actionItems.convertToTask(actionItemId);
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

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

  if (loading) {
    return (
      <div className="py-20 text-center text-sm text-muted-foreground animate-pulse">
        Loading meeting intelligence data...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header Card */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                {meeting?.title || 'Meeting Summary'}
              </h1>
              <Badge variant="success">Completed</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
              <span className="flex items-center">
                <Calendar className="h-3.5 w-3.5 mr-1" />
                {formatDate(meeting?.scheduledAt)}
              </span>
              <span className="flex items-center">
                <Clock className="h-3.5 w-3.5 mr-1" />
                Duration: {formatDuration(meeting?.duration)}
              </span>
              <span className="flex items-center">
                <Users className="h-3.5 w-3.5 mr-1" />
                {meeting?.participants?.length || 1} Participants
              </span>
              <span className="font-mono bg-secondary px-2 py-0.5 rounded text-[11px]">
                {meeting?.meetingCode}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              isLoading={isProcessingAi}
              onClick={handleGenerateAi}
              className="space-x-1"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Regenerate AI Analysis</span>
            </Button>
            <Link to="/meetings">
              <Button size="sm">Back to Meetings</Button>
            </Link>
          </div>
        </div>

        {aiMessage && (
          <div className="mt-4 p-3 rounded-md bg-primary/10 border border-primary/20 text-primary text-xs flex items-center justify-between">
            <span>{aiMessage}</span>
          </div>
        )}

        {summary?.isDemoMode && (
          <div className="mt-4 p-2.5 rounded-md bg-muted border border-border text-[11px] text-muted-foreground flex items-center justify-between">
            <span>Demo Mode Notice: Summary and action items generated via deterministic enterprise fallback engine.</span>
            <Badge variant="outline" className="text-[10px]">Deterministic Mode</Badge>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-border flex items-center space-x-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('summary')}
          className={`pb-3 border-b-2 transition-colors cursor-pointer flex items-center space-x-2 ${
            activeTab === 'summary'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>Executive Summary</span>
        </button>

        <button
          onClick={() => setActiveTab('actions')}
          className={`pb-3 border-b-2 transition-colors cursor-pointer flex items-center space-x-2 ${
            activeTab === 'actions'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <CheckCircle2 className="h-4 w-4" />
          <span>Action Items ({actionItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('transcript')}
          className={`pb-3 border-b-2 transition-colors cursor-pointer flex items-center space-x-2 ${
            activeTab === 'transcript'
              ? 'border-primary text-primary font-semibold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileText className="h-4 w-4" />
          <span>Transcript</span>
        </button>
      </div>

      {/* Tab 1: Executive Summary */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          {!summary ? (
            <Card className="text-center py-12">
              <Sparkles className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <h3 className="text-base font-semibold">No AI Summary Generated Yet</h3>
              <p className="text-xs text-muted-foreground mt-1 mb-4">
                Click below to process meeting dialogue and create a structured overview.
              </p>
              <Button size="sm" onClick={handleGenerateAi} isLoading={isProcessingAi}>
                Generate AI Summary
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Summary Body (2 Cols) */}
              <div className="md:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Executive Overview</CardTitle>
                    <CardDescription>Synthesized from participant dialogue</CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
                    {summary.summary}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Key Discussion Points</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-foreground/90">
                      {summary.keyPoints?.map((pt: string, i: number) => (
                        <li key={i} className="flex items-start space-x-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0"></span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Decisions Agreed Upon</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-foreground/90">
                      {summary.decisions?.map((dec: string, i: number) => (
                        <li key={i} className="flex items-start space-x-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                          <span>{dec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Side Metadata Card */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Topics Covered</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1.5">
                      {summary.topicsCovered?.map((tag: string, i: number) => (
                        <Badge key={i} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="mt-6 pt-4 border-t border-border space-y-2 text-xs text-muted-foreground">
                      <div className="flex items-center justify-between">
                        <span>Sentiment:</span>
                        <span className="capitalize font-semibold text-foreground">{summary.sentiment}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Model:</span>
                        <span className="font-mono text-[11px] text-foreground">{summary.modelUsed}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Action Items */}
      {activeTab === 'actions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Review and convert extracted action items into active Kanban tickets.
            </p>
            <Button size="sm" variant="outline" onClick={handleGenerateAi} isLoading={isProcessingAi}>
              Re-extract from Transcript
            </Button>
          </div>

          {actionItems.length === 0 ? (
            <Card className="text-center py-12">
              <CheckCircle2 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <h3 className="text-base font-semibold">No Action Items Extracted</h3>
              <p className="text-xs text-muted-foreground mt-1 mb-4">
                No items were identified in this session.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {actionItems.map((item) => (
                <div
                  key={item._id}
                  className="rounded-lg border border-border bg-card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs"
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
                          item.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'
                        }`}
                      >
                        {item.task}
                      </p>
                      {item.description && (
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground pt-0.5">
                        <span>Assignee: <strong className="text-foreground">{item.assignee?.name || item.assigneeName || 'Unassigned'}</strong></span>
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
                        Converted to Task
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleConvertToTask(item._id)}
                        className="text-xs space-x-1"
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
        </div>
      )}

      {/* Tab 3: Transcript */}
      {activeTab === 'transcript' && (
        <Card>
          <CardHeader>
            <CardTitle>Session Audio Transcript</CardTitle>
            <CardDescription>
              Timestamped speaker transcript generated via OpenAI Whisper architecture.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!transcript ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No transcript recorded. Click "Regenerate AI Analysis" above.
              </div>
            ) : (
              <div className="space-y-4 divide-y divide-border">
                {transcript.entries?.map((entry: any, i: number) => (
                  <div key={i} className="pt-3 first:pt-0 space-y-1 text-xs">
                    <div className="flex items-center space-x-2 font-mono text-muted-foreground">
                      <span className="font-semibold text-primary">{entry.speakerName}</span>
                      <span>[{entry.timestamp}]</span>
                      {entry.confidence && (
                        <span className="text-[10px] bg-secondary px-1.5 py-0.2 rounded">
                          {Math.round(entry.confidence * 100)}% confidence
                        </span>
                      )}
                    </div>
                    <p className="text-foreground text-sm leading-relaxed">{entry.text}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
