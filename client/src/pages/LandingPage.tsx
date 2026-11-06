import { Link } from 'react-router-dom';
import {
  Video,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Kanban,
  FileText,
  Clock,
  Zap,
  Lock
} from 'lucide-react';
import { Button } from '../components/ui/Button.js';
import { useAuthStore } from '../store/authStore.js';

export function LandingPage() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
      {/* Navigation */}
      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
              <Video className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">IntellMeet</span>
          </div>

          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link to="/register">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-28 max-w-5xl mx-auto px-4 text-center">
        <div className="inline-flex items-center space-x-2 rounded-full bg-primary/10 border border-primary/20 px-3.5 py-1 text-xs font-medium text-primary mb-6">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Enterprise Real-Time WebRTC & AI Intelligence</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-tight">
          Where Enterprise Teams Meet, Decide, and Deliver.
        </h1>

        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Ultra-low latency WebRTC video conferencing seamlessly paired with automated OpenAI transcription, executive summaries, and action item conversion.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/login" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto text-base h-12 px-8">
              <span>Launch Demo Workspace</span>
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
          <Link to="/meetings" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-base h-12 px-8">
              View Architecture & Demos
            </Button>
          </Link>
        </div>

        {/* Feature Badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
          <span className="flex items-center"><CheckCircle2 className="h-4 w-4 text-emerald-500 mr-1.5" /> Peer-to-Peer WebRTC Mesh</span>
          <span className="flex items-center"><CheckCircle2 className="h-4 w-4 text-emerald-500 mr-1.5" /> OpenAI Whisper & Summary Engine</span>
          <span className="flex items-center"><CheckCircle2 className="h-4 w-4 text-emerald-500 mr-1.5" /> Synchronized Kanban Board</span>
          <span className="flex items-center"><CheckCircle2 className="h-4 w-4 text-emerald-500 mr-1.5" /> MongoDB & JWT Architecture</span>
        </div>
      </section>

      {/* Core Pillars Grid */}
      <section className="py-16 bg-muted/40 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Engineered for Technical Teams</h2>
            <p className="text-muted-foreground text-sm mt-2">
              Every feature exists to eliminate meeting waste and turn discussions directly into accountable deliverables.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-xs flex flex-col">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-primary flex items-center justify-center mb-4">
                <Video className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold mb-2">Real-Time WebRTC Conferencing</h3>
              <p className="text-xs text-muted-foreground leading-relaxed flex-1">
                Peer-to-peer audio and video streaming powered by Socket.io signaling. Includes screen sharing, device selection, in-meeting chat, and local WebM recording.
              </p>
              <div className="mt-4 pt-4 border-t border-border flex items-center text-xs text-primary font-medium">
                <Zap className="h-3.5 w-3.5 mr-1" /> Low-latency ICE negotiation
              </div>
            </div>

            {/* Card 2 */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-xs flex flex-col">
              <div className="h-10 w-10 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-4">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold mb-2">Automated AI Post-Meeting Intelligence</h3>
              <p className="text-xs text-muted-foreground leading-relaxed flex-1">
                Transcribe spoken dialogue into timestamped speaker logs, generate executive takeaways, and isolate decisions with deterministic demo fallback.
              </p>
              <div className="mt-4 pt-4 border-t border-border flex items-center text-xs text-indigo-500 font-medium">
                <FileText className="h-3.5 w-3.5 mr-1" /> Structured JSON Output
              </div>
            </div>

            {/* Card 3 */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-xs flex flex-col">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
                <Kanban className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold mb-2">Action Items & Kanban Workspace</h3>
              <p className="text-xs text-muted-foreground leading-relaxed flex-1">
                Extracted action items can be edited, prioritized, assigned, and converted in 1 click into active Kanban cards with real-time team synchronization.
              </p>
              <div className="mt-4 pt-4 border-t border-border flex items-center text-xs text-emerald-500 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Zero-loss task pipeline
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Production-Grade Architecture Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-border bg-card p-8 md:p-12 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center space-x-1.5 text-xs font-semibold text-primary uppercase tracking-wider mb-2">
                <ShieldCheck className="h-4 w-4" /> Production Architecture
              </div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Full MERN Stack + Real-Time Engine</h2>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Architected with strict separation of concerns, TypeScript end-to-end, RESTful endpoints, Prometheus telemetry, and Dockerized deployment.
              </p>

              <div className="mt-6 space-y-3">
                <div className="flex items-start space-x-3 text-xs">
                  <div className="h-5 w-5 rounded bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">React 19 & Tailwind CSS v4:</span> Modern component-driven UI with TanStack Query and Zustand.
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-xs">
                  <div className="h-5 w-5 rounded bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">Express.js & MongoDB Mongoose:</span> Scalable models for Users, Meetings, Transcripts, Summaries, and Tasks.
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-xs">
                  <div className="h-5 w-5 rounded bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">Prometheus /metrics & Health:</span> Cloud-native monitoring readiness for Kubernetes and Grafana.
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-slate-950 p-5 font-mono text-xs text-slate-300 shadow-md">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-[11px] text-slate-400">
                <span>System Architecture Status</span>
                <span className="text-emerald-400 flex items-center"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mr-1.5"></span> LIVE</span>
              </div>
              <pre className="text-[11px] leading-relaxed text-slate-300 overflow-x-auto">
{`GET /health  ->  HTTP 200 OK
{
  "status": "UP",
  "services": {
    "database": { "connected": true, "state": "connected" },
    "cache": "in-memory-fallback",
    "aiService": "demo-mode (fallback active)",
    "signaling": "socket.io connected"
  }
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border bg-card py-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <div className="flex items-center space-x-2">
            <Video className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground">IntellMeet Enterprise</span>
            <span>&copy; {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center space-x-6">
            <span>React 19</span>
            <span>Node.js Express</span>
            <span>WebRTC</span>
            <span>MongoDB</span>
            <span>OpenAI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
