import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Video, Bell, Moon, Sun, Plus, LogOut, CheckCheck } from 'lucide-react';
import { useAuthStore } from '../../store/authStore.js';
import { useThemeStore } from '../../store/themeStore.js';
import { Button } from '../ui/Button.js';
import { Badge } from '../ui/Badge.js';
import { api } from '../../services/api.js';

interface HeaderProps {
  onOpenCreateMeeting?: () => void;
  onOpenJoinMeeting?: () => void;
}

export function Header({ onOpenCreateMeeting, onOpenJoinMeeting }: HeaderProps) {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      api.notifications.list().then((res) => {
        setNotifications(res.notifications || []);
        setUnreadCount(res.unreadCount || 0);
      }).catch(() => {});
    }
  }, [user]);

  const handleMarkAllRead = async () => {
    try {
      await api.notifications.markAllRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/95 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left: Brand & Workspace */}
        <div className="flex items-center space-x-4">
          <Link to="/dashboard" className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
              <Video className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-foreground">IntellMeet</span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground">Enterprise</span>
            </div>
          </Link>
          <div className="hidden md:flex items-center pl-4 border-l border-border space-x-2">
            <span className="text-xs text-muted-foreground">Workspace:</span>
            <span className="text-xs font-medium text-foreground bg-secondary px-2.5 py-1 rounded-md">Core Platform Engineering</span>
          </div>
        </div>

        {/* Right: Quick Actions, Theme, Notifications & User */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          {onOpenJoinMeeting && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenJoinMeeting}
              className="hidden sm:inline-flex"
            >
              Join by ID
            </Button>
          )}

          {onOpenCreateMeeting && (
            <Button
              size="sm"
              onClick={onOpenCreateMeeting}
              className="inline-flex items-center space-x-1"
            >
              <Plus className="h-4 w-4 mr-1" />
              <span>New Meeting</span>
            </Button>
          )}

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="text-muted-foreground hover:text-foreground"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {/* Notification Bell */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative text-muted-foreground hover:text-foreground"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
              )}
            </Button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-lg border border-border bg-card p-4 shadow-xl z-50">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-semibold">Notifications</h4>
                    {unreadCount > 0 && <Badge variant="default">{unreadCount} new</Badge>}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-muted-foreground hover:text-primary flex items-center space-x-1 cursor-pointer"
                    >
                      <CheckCheck className="h-3 w-3 mr-0.5" /> Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-border py-1">
                  {notifications.length === 0 ? (
                    <p className="py-6 text-center text-xs text-muted-foreground">No notifications</p>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item._id}
                        className={`p-2.5 text-xs transition-colors rounded-md ${
                          item.isRead ? 'opacity-70' : 'bg-primary/5 font-medium'
                        }`}
                      >
                        <p className="font-semibold text-foreground">{item.title}</p>
                        <p className="text-muted-foreground mt-0.5">{item.message}</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 rounded-full p-1 hover:bg-secondary transition-colors cursor-pointer"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-8 w-8 rounded-full object-cover border border-border"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xs border border-primary/20">
                  {user?.name?.charAt(0) || 'U'}
                </div>
              )}
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-lg border border-border bg-card p-2 shadow-xl z-50">
                <div className="px-3 py-2 border-b border-border">
                  <p className="text-xs font-semibold text-foreground truncate">{user?.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
                  <div className="mt-1 flex items-center space-x-1">
                    <Badge variant="outline" className="text-[10px] py-0 uppercase">
                      {user?.role}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">{user?.department}</span>
                  </div>
                </div>
                <div className="pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 rounded-md px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
