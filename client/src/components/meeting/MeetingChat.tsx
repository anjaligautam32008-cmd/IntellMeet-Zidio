import { useState, useEffect, useRef } from 'react';
import { Send, X } from 'lucide-react';
import { Socket } from 'socket.io-client';
import { useAuthStore } from '../../store/authStore.js';
import { useMeetingStore } from '../../store/meetingStore.js';
import { api } from '../../services/api.js';

interface MessageItem {
  _id?: string;
  senderId?: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string | Date;
}

interface MeetingChatProps {
  meetingCode: string;
  socket: Socket | null;
}

export function MeetingChat({ meetingCode, socket }: MeetingChatProps) {
  const { user } = useAuthStore();
  const { setActiveSidebarTab } = useMeetingStore();

  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [typingUser, setTypingUser] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<any>(null);

  // Load existing chat history from database
  useEffect(() => {
    if (meetingCode) {
      api.chat.getMessages(meetingCode).then((res) => {
        if (res.messages) {
          setMessages(
            res.messages.map((m: any) => ({
              _id: m._id,
              senderId: m.sender?._id || m.sender,
              senderName: m.senderName || m.sender?.name || 'User',
              senderAvatar: m.senderAvatar || m.sender?.avatar,
              content: m.content,
              timestamp: m.timestamp
            }))
          );
        }
      }).catch(() => {});
    }
  }, [meetingCode]);

  // Listen to incoming real-time socket messages & typing indicators
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg: any) => {
      setMessages((prev) => [...prev, msg]);
    };

    const handleUserTyping = (data: { userName: string }) => {
      setTypingUser(data.userName);
    };

    const handleStopTyping = () => {
      setTypingUser(null);
    };

    socket.on('new-chat-message', handleNewMessage);
    socket.on('user-typing', handleUserTyping);
    socket.on('user-stop-typing', handleStopTyping);

    return () => {
      socket.off('new-chat-message', handleNewMessage);
      socket.off('user-typing', handleUserTyping);
      socket.off('user-stop-typing', handleStopTyping);
    };
  }, [socket]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !user || !socket) return;

    socket.emit('send-chat-message', {
      meetingCode,
      content: inputText.trim(),
      senderId: user._id,
      senderName: user.name,
      senderAvatar: user.avatar
    });

    socket.emit('stop-typing', {
      meetingCode,
      userName: user.name
    });

    setInputText('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    if (!socket || !user) return;

    socket.emit('typing', { meetingCode, userName: user.name });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop-typing', { meetingCode, userName: user.name });
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800 text-slate-200 w-80 shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <h3 className="text-sm font-semibold text-slate-100">Meeting Chat</h3>
        <button
          onClick={() => setActiveSidebarTab(null)}
          className="rounded p-1 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 py-8">
            <p className="text-xs">No messages yet.</p>
            <p className="text-[11px] mt-1">Start the conversation with your team.</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.senderId === user?._id;
            const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <div key={msg._id || index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className="flex items-baseline space-x-1.5 mb-1 text-[11px]">
                  <span className="font-semibold text-slate-300">{isMe ? 'You' : msg.senderName}</span>
                  <span className="text-slate-500 text-[10px]">{time}</span>
                </div>
                <div
                  className={`rounded-xl px-3 py-2 text-xs max-w-[85%] leading-relaxed ${
                    isMe
                      ? 'bg-blue-600 text-white rounded-br-xs'
                      : 'bg-slate-800 text-slate-200 border border-slate-700/60 rounded-bl-xs'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator */}
      {typingUser && (
        <div className="px-4 py-1 text-[11px] text-slate-400 italic">
          {typingUser} is typing...
        </div>
      )}

      {/* Input Field */}
      <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 flex items-center space-x-2">
        <input
          type="text"
          placeholder="Send a message to everyone..."
          value={inputText}
          onChange={handleInputChange}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white transition-colors cursor-pointer"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
}
