import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  ArrowRight,
  ShieldAlert,
  ArrowLeft,
  Users
} from 'lucide-react';
import { Button } from '../components/ui/Button.js';
import { Badge } from '../components/ui/Badge.js';
import { Card, CardContent } from '../components/ui/Card.js';
import { useAuthStore } from '../store/authStore.js';
import { useMeetingStore } from '../store/meetingStore.js';
import { api } from '../services/api.js';

export function MeetingLobbyPage() {
  const { meetingCode } = useParams<{ meetingCode: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    isAudioMuted,
    isVideoOff,
    setAudioMuted,
    setVideoOff,
    setCurrentMeeting
  } = useMeetingStore();

  const [meeting, setMeeting] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const [deviceError, setDeviceError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // 1. Fetch Meeting Details
  useEffect(() => {
    if (meetingCode) {
      api.meetings.getByCode(meetingCode)
        .then((res) => {
          setMeeting(res.meeting);
          setCurrentMeeting(res.meeting);
        })
        .catch((err) => {
          setError(err.message || 'Meeting code not found.');
        })
        .finally(() => setLoading(false));
    }
  }, [meetingCode, setCurrentMeeting]);

  // 2. Initialize Camera & Mic Preview
  useEffect(() => {
    let stream: MediaStream | null = null;

    const startMedia = async () => {
      try {
        setDeviceError(null);
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        setPreviewStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err: any) {
        console.warn('Lobby camera preview error:', err);
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          setPreviewStream(audioStream);
          setVideoOff(true);
          setDeviceError('No camera detected or permission denied. Audio-only mode.');
        } catch {
          setDeviceError('Camera and microphone access blocked. You can still join as a listener.');
          setAudioMuted(true);
          setVideoOff(true);
        }
      }
    };

    startMedia();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [setAudioMuted, setVideoOff]);

  // Track muted / video off states in the local stream
  useEffect(() => {
    if (previewStream) {
      previewStream.getAudioTracks().forEach((t) => (t.enabled = !isAudioMuted));
    }
  }, [isAudioMuted, previewStream]);

  useEffect(() => {
    if (previewStream) {
      previewStream.getVideoTracks().forEach((t) => (t.enabled = !isVideoOff));
    }
  }, [isVideoOff, previewStream]);

  const handleJoin = async () => {
    // If stream is active, stop it before navigating so the room hooks can acquire it cleanly
    if (previewStream) {
      previewStream.getTracks().forEach((t) => t.stop());
    }

    if (meeting?._id) {
      // mark meeting started if host
      if (meeting.status === 'scheduled') {
        await api.meetings.start(meeting._id).catch(() => {});
      }
    }

    navigate(`/meeting/${meetingCode}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground animate-pulse">Loading meeting lobby...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
        <Card className="max-w-md w-full p-6 text-center">
          <ShieldAlert className="h-10 w-10 text-destructive mx-auto mb-3" />
          <h2 className="text-lg font-bold">Unable to Join Meeting</h2>
          <p className="text-xs text-muted-foreground mt-1 mb-4">{error}</p>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const hasVideoTrack = previewStream && previewStream.getVideoTracks().length > 0 && !isVideoOff;

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-3xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
              {meeting?.title || 'Meeting Lobby'}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Code: <span className="font-mono text-primary font-semibold">{meetingCode}</span> &bull; Host: {meeting?.host?.name || 'Enterprise Host'}
            </p>
          </div>
          <Badge variant={meeting?.status === 'active' ? 'success' : 'secondary'}>
            {meeting?.status === 'active' ? 'Call in Progress' : 'Ready to Start'}
          </Badge>
        </div>

        {/* Media Preview Stage */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Video Preview Box (2 Cols) */}
          <div className="md:col-span-2 relative aspect-video rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shadow-lg flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${hasVideoTrack ? 'opacity-100' : 'opacity-0'}`}
            />

            {!hasVideoTrack && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900">
                <div className="h-20 w-20 rounded-full bg-slate-800 text-slate-300 font-semibold text-2xl flex items-center justify-center border border-slate-700 shadow-md">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <span className="text-xs text-slate-400 mt-3">{user?.name || 'You'}</span>
                <span className="text-[11px] text-slate-500">Camera is off</span>
              </div>
            )}

            {/* Quick Media Toggle Overlay */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center space-x-3 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-full border border-slate-700 shadow-lg">
              <button
                type="button"
                onClick={() => setAudioMuted(!isAudioMuted)}
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors cursor-pointer ${
                  isAudioMuted
                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
                title={isAudioMuted ? 'Unmute' : 'Mute'}
              >
                {isAudioMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>

              <button
                type="button"
                onClick={() => setVideoOff(!isVideoOff)}
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors cursor-pointer ${
                  isVideoOff
                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
                title={isVideoOff ? 'Turn on camera' : 'Turn off camera'}
              >
                {isVideoOff ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Right Action Panel */}
          <Card className="flex flex-col justify-between p-5">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Ready to join?</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Joining as <span className="font-semibold text-foreground">{user?.name}</span>
                </p>
              </div>

              {deviceError && (
                <div className="p-2.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs leading-relaxed">
                  {deviceError}
                </div>
              )}

              <div className="p-3 rounded-lg bg-secondary/60 space-y-2 text-xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Microphone:</span>
                  <span className={isAudioMuted ? 'text-rose-500 font-semibold' : 'text-emerald-500 font-semibold'}>
                    {isAudioMuted ? 'Muted' : 'Ready'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Camera:</span>
                  <span className={isVideoOff ? 'text-rose-500 font-semibold' : 'text-emerald-500 font-semibold'}>
                    {isVideoOff ? 'Off' : 'Ready'}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-muted-foreground bg-muted p-2.5 rounded-md">
                Tip: To test multi-participant video locally, open an Incognito tab and join with code <span className="font-mono font-semibold">{meetingCode}</span>.
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <Button onClick={handleJoin} className="w-full h-11 text-sm">
                <span>Join Meeting Now</span>
                <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
              <Button variant="outline" onClick={() => navigate('/dashboard')} className="w-full">
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
