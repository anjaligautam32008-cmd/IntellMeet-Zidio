import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  Circle,
  Square,
  MessageSquare,
  Users,
  Subtitles,
  PhoneOff
} from 'lucide-react';
import { useMeetingStore } from '../../store/meetingStore.js';
import { cn } from '../../lib/utils.js';

interface MeetingControlsProps {
  onToggleScreenShare: () => void;
  onToggleRecording: () => void;
  onLeaveMeeting: () => void;
  participantCount: number;
}

export function MeetingControls({
  onToggleScreenShare,
  onToggleRecording,
  onLeaveMeeting,
  participantCount
}: MeetingControlsProps) {
  const {
    isAudioMuted,
    isVideoOff,
    isScreenSharing,
    isRecording,
    captionsEnabled,
    activeSidebarTab,
    toggleAudio,
    toggleVideo,
    toggleCaptions,
    setActiveSidebarTab
  } = useMeetingStore();

  return (
    <div className="flex items-center justify-between px-6 py-3.5 bg-slate-950 border-t border-slate-800 text-slate-200">
      {/* Left: Meeting status or live recording indicator */}
      <div className="flex items-center space-x-3 w-1/4">
        {isRecording ? (
          <div className="flex items-center space-x-2 bg-rose-950/80 border border-rose-800 text-rose-300 px-3 py-1 rounded-full text-xs font-semibold animate-pulse">
            <span className="h-2 w-2 rounded-full bg-rose-500"></span>
            <span>REC Live</span>
          </div>
        ) : (
          <div className="text-xs text-slate-400 hidden sm:block">
            <span>WebRTC Encrypted Peer Session</span>
          </div>
        )}
      </div>

      {/* Center: Core Media & Presentation Controls */}
      <div className="flex items-center justify-center space-x-2 sm:space-x-3 flex-1">
        {/* Microphone */}
        <button
          onClick={toggleAudio}
          title={isAudioMuted ? 'Unmute microphone' : 'Mute microphone'}
          className={cn(
            'flex h-11 w-11 items-center justify-center rounded-full transition-colors cursor-pointer shadow-md',
            isAudioMuted
              ? 'bg-rose-600 hover:bg-rose-700 text-white'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
          )}
        >
          {isAudioMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </button>

        {/* Camera */}
        <button
          onClick={toggleVideo}
          title={isVideoOff ? 'Turn camera on' : 'Turn camera off'}
          className={cn(
            'flex h-11 w-11 items-center justify-center rounded-full transition-colors cursor-pointer shadow-md',
            isVideoOff
              ? 'bg-rose-600 hover:bg-rose-700 text-white'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
          )}
        >
          {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
        </button>

        {/* Screen Share */}
        <button
          onClick={onToggleScreenShare}
          title={isScreenSharing ? 'Stop sharing screen' : 'Share screen'}
          className={cn(
            'flex h-11 w-11 items-center justify-center rounded-full transition-colors cursor-pointer shadow-md',
            isScreenSharing
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
          )}
        >
          <Monitor className="h-5 w-5" />
        </button>

        {/* In-Meeting Recording */}
        <button
          onClick={onToggleRecording}
          title={isRecording ? 'Stop recording & save' : 'Record meeting'}
          className={cn(
            'flex h-11 w-11 items-center justify-center rounded-full transition-colors cursor-pointer shadow-md',
            isRecording
              ? 'bg-rose-600 hover:bg-rose-700 text-white'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
          )}
        >
          {isRecording ? <Square className="h-4 w-4 fill-white" /> : <Circle className="h-4 w-4" />}
        </button>

        {/* Live AI Captions */}
        <button
          onClick={toggleCaptions}
          title={captionsEnabled ? 'Disable live captions' : 'Enable live AI captions'}
          className={cn(
            'hidden sm:flex h-11 w-11 items-center justify-center rounded-full transition-colors cursor-pointer shadow-md',
            captionsEnabled
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
          )}
        >
          <Subtitles className="h-5 w-5" />
        </button>

        {/* End / Leave Meeting Call */}
        <button
          onClick={onLeaveMeeting}
          title="Leave meeting"
          className="flex h-11 px-5 items-center justify-center space-x-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-medium text-sm transition-colors cursor-pointer shadow-md ml-2"
        >
          <PhoneOff className="h-5 w-5" />
          <span className="hidden sm:inline">Leave</span>
        </button>
      </div>

      {/* Right: Sidebar Toggles (Chat, Participants) */}
      <div className="flex items-center justify-end space-x-2 w-1/4">
        {/* Participants */}
        <button
          onClick={() => setActiveSidebarTab('participants')}
          title="Participants list"
          className={cn(
            'flex h-9 px-3 items-center space-x-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer',
            activeSidebarTab === 'participants'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
          )}
        >
          <Users className="h-4 w-4" />
          <span>{participantCount}</span>
        </button>

        {/* Chat */}
        <button
          onClick={() => setActiveSidebarTab('chat')}
          title="Meeting chat"
          className={cn(
            'flex h-9 px-3 items-center space-x-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer',
            activeSidebarTab === 'chat'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
          )}
        >
          <MessageSquare className="h-4 w-4" />
          <span className="hidden sm:inline">Chat</span>
        </button>
      </div>
    </div>
  );
}
