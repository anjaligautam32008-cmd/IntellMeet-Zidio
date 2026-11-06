import { X, Mic, MicOff, Video, VideoOff, Crown } from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';
import { useMeetingStore } from '../../store/meetingStore.js';
import type { RemotePeer } from '../../hooks/useWebRTC.js';

interface ParticipantListProps {
  remotePeers: RemotePeer[];
}

export function ParticipantList({ remotePeers }: ParticipantListProps) {
  const { user } = useAuthStore();
  const { isAudioMuted, isVideoOff, setActiveSidebarTab } = useMeetingStore();

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800 text-slate-200 w-72 shrink-0">
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-semibold text-slate-100">Participants</h3>
          <span className="bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded-full font-medium">
            {remotePeers.length + 1}
          </span>
        </div>
        <button
          onClick={() => setActiveSidebarTab(null)}
          className="rounded p-1 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {/* Local User */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40">
          <div className="flex items-center space-x-2.5 truncate">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="h-7 w-7 rounded-full object-cover" />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600/20 text-blue-400 font-semibold text-xs">
                {user?.name?.charAt(0) || 'U'}
              </div>
            )}
            <div className="truncate">
              <span className="text-xs font-medium text-slate-200 truncate">{user?.name}</span>
              <span className="text-[10px] text-slate-400 ml-1">(You)</span>
            </div>
          </div>
          <div className="flex items-center space-x-1.5 text-slate-400">
            {isAudioMuted ? <MicOff className="h-3.5 w-3.5 text-rose-400" /> : <Mic className="h-3.5 w-3.5 text-emerald-400" />}
            {isVideoOff ? <VideoOff className="h-3.5 w-3.5 text-rose-400" /> : <Video className="h-3.5 w-3.5 text-emerald-400" />}
          </div>
        </div>

        {/* Remote Peers */}
        {remotePeers.map((peer) => (
          <div key={peer.socketId} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-800/60 transition-colors">
            <div className="flex items-center space-x-2.5 truncate">
              {peer.userAvatar ? (
                <img src={peer.userAvatar} alt={peer.userName} className="h-7 w-7 rounded-full object-cover" />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-slate-300 font-semibold text-xs">
                  {peer.userName?.charAt(0) || 'P'}
                </div>
              )}
              <div className="flex items-center space-x-1 truncate">
                <span className="text-xs font-medium text-slate-200 truncate">{peer.userName}</span>
                {peer.isHost && <Crown className="h-3 w-3 text-amber-400 shrink-0" />}
              </div>
            </div>
            <div className="flex items-center space-x-1.5 text-slate-400">
              {peer.isMuted ? <MicOff className="h-3.5 w-3.5 text-rose-400" /> : <Mic className="h-3.5 w-3.5 text-emerald-400" />}
              {peer.isVideoOff ? <VideoOff className="h-3.5 w-3.5 text-rose-400" /> : <Video className="h-3.5 w-3.5 text-emerald-400" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
