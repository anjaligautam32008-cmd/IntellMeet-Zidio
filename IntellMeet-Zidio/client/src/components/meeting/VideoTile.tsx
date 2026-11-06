import { useRef, useEffect } from 'react';
import { MicOff, Crown, Monitor, User as UserIcon } from 'lucide-react';
import { cn } from '../../lib/utils.js';

interface VideoTileProps {
  stream?: MediaStream | null;
  name: string;
  avatar?: string;
  isHost?: boolean;
  isMuted?: boolean;
  isVideoOff?: boolean;
  isLocal?: boolean;
  isSharingScreen?: boolean;
  className?: string;
}

export function VideoTile({
  stream,
  name,
  avatar,
  isHost,
  isMuted,
  isVideoOff,
  isLocal,
  isSharingScreen,
  className
}: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const hasVideoTrack = stream && stream.getVideoTracks().length > 0 && stream.getVideoTracks()[0].enabled && !isVideoOff;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl bg-slate-900 border border-slate-800 shadow-md flex items-center justify-center group select-none aspect-video',
        className
      )}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal} // always mute local audio to prevent feedback loop
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          hasVideoTrack ? 'opacity-100' : 'opacity-0'
        )}
      />

      {/* Video Off Fallback Avatar */}
      {!hasVideoTrack && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 p-4">
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              className="h-20 w-20 rounded-full object-cover border-2 border-slate-700 shadow-lg"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-semibold text-2xl shadow-lg">
              {name ? name.charAt(0).toUpperCase() : <UserIcon className="h-8 w-8" />}
            </div>
          )}
          <span className="mt-3 text-sm font-medium text-slate-300">{name}</span>
          <span className="text-[11px] text-slate-500">Camera turned off</span>
        </div>
      )}

      {/* Screen Sharing Watermark Badge */}
      {isSharingScreen && (
        <div className="absolute top-3 left-3 flex items-center space-x-1.5 bg-blue-600/90 text-white text-[11px] font-semibold px-2.5 py-1 rounded-md shadow-xs backdrop-blur-xs">
          <Monitor className="h-3.5 w-3.5" />
          <span>Presenting Screen</span>
        </div>
      )}

      {/* Bottom Participant Info Bar */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
        <div className="flex items-center space-x-2 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-md text-xs font-medium text-slate-200 border border-slate-800">
          <span>{name}</span>
          {isLocal && <span className="text-slate-400 text-[10px]">(You)</span>}
          {isHost && (
            <span className="flex items-center text-[10px] text-amber-400 font-semibold ml-1">
              <Crown className="h-3 w-3 mr-0.5" /> Host
            </span>
          )}
        </div>

        {/* Audio Status Indicator */}
        <div className="flex items-center space-x-1.5">
          {isMuted && (
            <div className="bg-rose-500/90 text-white p-1 rounded-md shadow-xs backdrop-blur-xs" title="Microphone Muted">
              <MicOff className="h-3.5 w-3.5" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
